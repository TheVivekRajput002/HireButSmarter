// app/api/profile/[username]/route.ts — Profile analysis endpoint
// Fetches GitHub data, extracts skills, computes scores, saves to Supabase

import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
import { fetchUser, fetchRepos, fetchReadmesBatch, totalStars, GitHubRepo } from '@/lib/github';
import { extractRepoSkills, aggregateSkills } from '@/lib/skills';
import { calculateComplexity } from '@/lib/complexity';
import { getScoreBreakdown, calculateScore, getScoreLabel } from '@/lib/scoring';
import { Developer, Repo, Language } from '@/lib/types';
import { supabaseServer } from '@/lib/supabase';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> }
) {
  const { username } = await params;

  if (!username) {
    return NextResponse.json({ error: 'Username is required' }, { status: 400 });
  }

  try {
    // 1. Fetch GitHub user + repos in parallel
    const [user, ghRepos] = await Promise.all([
      fetchUser(username),
      fetchRepos(username),
    ]);

    // 2. Fetch READMEs in parallel (limit to top 30 repos by stars for performance)
    const topRepoNames = ghRepos
      .sort((a, b) => b.stargazers_count - a.stargazers_count)
      .slice(0, 30)
      .map(r => r.name);

    const readmes = await fetchReadmesBatch(username, topRepoNames);

    // 3. Extract skills per repo
    const repoSkillMap = new Map<string, Set<string>>();
    for (const repo of ghRepos) {
      const readmeContent = readmes.get(repo.name) || null;
      const skills = extractRepoSkills(repo.language, repo.description, readmeContent);
      repoSkillMap.set(repo.name, skills);
    }

    // 4. Aggregate skills across all repos
    const skills = aggregateSkills(repoSkillMap, ghRepos.length);

    // 5. Calculate complexity per repo
    const repos: Repo[] = ghRepos.map(r => ({
      name: r.name,
      description: r.description,
      url: r.html_url,
      language: r.language,
      stars: r.stargazers_count,
      forks: r.forks_count,
      size: r.size,
      updated_at: r.updated_at,
      complexity_score: calculateComplexity(r),
      skills_detected: Array.from(repoSkillMap.get(r.name) || []),
    }));

    // 6. Build language distribution
    const langCounts: Record<string, number> = {};
    for (const repo of ghRepos) {
      if (repo.language) {
        langCounts[repo.language] = (langCounts[repo.language] || 0) + 1;
      }
    }
    const totalWithLang = Object.values(langCounts).reduce((a, b) => a + b, 0);
    const languages: Language[] = Object.entries(langCounts)
      .map(([name, count]) => ({
        name,
        percentage: totalWithLang > 0 ? (count / totalWithLang) * 100 : 0,
        repo_count: count,
      }))
      .sort((a, b) => b.percentage - a.percentage);

    // 7. Calculate Potential Score
    const stars = totalStars(ghRepos);
    const scoreBreakdown = getScoreBreakdown(ghRepos, stars, skills);
    const potentialScore = calculateScore(scoreBreakdown);
    const potentialLabel = getScoreLabel(potentialScore);

    // 8. Save to Supabase (upsert by username)
    let candidateId = `local-${username}`;
    try {
      const profileData: Omit<Developer, 'id' | 'analyzed_at'> = {
        username,
        avatar_url: user.avatar_url,
        name: user.name,
        bio: user.bio,
        followers: user.followers,
        public_repos: user.public_repos,
        total_stars: stars,
        created_at: user.created_at,
        potential_score: potentialScore,
        potential_label: potentialLabel,
        score_breakdown: scoreBreakdown,
        skills,
        languages,
        repos: repos.sort((a, b) => b.complexity_score - a.complexity_score),
        resume_text: null,
      };

      if (supabaseServer) {
        const { data, error } = await supabaseServer
          .from('candidates')
          .upsert(
            { username, profile_data: profileData, analyzed_at: new Date().toISOString() },
            { onConflict: 'username' }
          )
          .select('id')
          .single();

        if (data?.id) candidateId = data.id;
        if (error) console.warn('Supabase upsert warning:', error.message);
      } else {
        console.warn('Supabase not configured, skipping save.');
      }
    } catch (e) {
      console.warn('Supabase save skipped:', e);
    }

    // 9. Build Developer response
    const developer: Developer = {
      id: candidateId,
      username,
      avatar_url: user.avatar_url,
      name: user.name,
      bio: user.bio,
      followers: user.followers,
      public_repos: user.public_repos,
      total_stars: stars,
      created_at: user.created_at,
      potential_score: potentialScore,
      potential_label: potentialLabel,
      score_breakdown: scoreBreakdown,
      skills,
      languages,
      repos: repos.sort((a, b) => b.complexity_score - a.complexity_score),
      resume_text: null,
      analyzed_at: new Date().toISOString(),
    };

    return NextResponse.json(developer);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    
    if (message.includes('403') || message.includes('rate limit')) {
      return NextResponse.json(
        { error: 'GitHub API Rate Limit Exceeded! Please add a GITHUB_TOKEN to your .env.local file to increase your quota.' },
        { status: 429 }
      );
    }
    
    const status = message.includes('404') ? 404 : 500;
    return NextResponse.json(
      { error: status === 404 ? `GitHub user "${username}" not found` : `Failed to analyze profile: ${message}` },
      { status }
    );
  }
}
