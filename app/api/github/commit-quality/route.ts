import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/github';
import { CommitSample } from '@/lib/types';

const isMergeCommit = (message: string) => {
  return /^Merge (remote-tracking )?branch|^Merge pull request/i.test(message);
};

const scoreCommitMessage = (message: string) => {
  const lines = message.split('\n');
  const subject = lines[0].trim();
  const hasBody = lines.length > 2 && lines[1] === '';

  let lengthScore = 0;
  if (subject.length >= 10 && subject.length <= 72) lengthScore = 1;
  else if (subject.length > 72) lengthScore = 0.5;

  const badPatterns = /^(\W*|fix(es|ed)?|update[ds]?|wip|asdf|[.\d\s]*)$/i;
  const patternScore = badPatterns.test(subject) ? 0 : 1;

  const conventionalRegex = /^(feat|fix|docs|style|refactor|test|chore|perf|ci|build)(\(.+\))?:\s.+/i;
  const conventionalScore = conventionalRegex.test(subject) ? 1 : 0;

  const imperativePrefixes = /^(add|fix|update|remove|refactor|docs|test|chore|perf|ci|build|use|implement|make|change|support|improve|clean)/i;
  const pastTensePrefixes = /^(added|fixed|updated|removed|refactored|changed|implemented|improved)/i;
  
  let imperativeScore = 0;
  if (pastTensePrefixes.test(subject)) {
    imperativeScore = 0.5;
  } else if (imperativePrefixes.test(subject) || conventionalScore === 1) {
    imperativeScore = 1;
  }

  const bodyScore = hasBody ? 1 : 0;

  const total = (lengthScore + patternScore + conventionalScore + imperativeScore + bodyScore) / 5;

  return {
    total,
    dimensions: {
      length: lengthScore,
      pattern: patternScore,
      conventional: conventionalScore,
      imperative: imperativeScore,
      body: bodyScore
    }
  };
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');
    const reposParam = searchParams.get('repos');

    if (!username || !reposParam) {
      return NextResponse.json({ error: 'Username and repos are required' }, { status: 400 });
    }

    const repos = reposParam.split(',').slice(0, 5);

    const repoResults = await Promise.all(
      repos.map(async (repo) => {
        const url = `https://api.github.com/repos/${username}/${repo}/commits?author=${username}&per_page=30`;
        const commits = await fetchWithAuth(url).catch(() => null);
        
        let scored: CommitSample[] = [];

        if (Array.isArray(commits)) {
          scored = commits
            .filter((c: any) => !isMergeCommit(c.commit.message))
            .map((c: any) => ({
              sha: c.sha.slice(0, 7),
              message: c.commit.message.split('\n')[0],
              score: scoreCommitMessage(c.commit.message),
            }));
        }

        const commitCount = scored.length;
        const repoScore = commitCount > 0
          ? scored.reduce((sum, c) => sum + c.score.total, 0) / commitCount
          : 0;

        const dimensions = commitCount > 0
          ? {
              length: scored.reduce((s, c) => s + c.score.dimensions.length, 0) / commitCount,
              pattern: scored.reduce((s, c) => s + c.score.dimensions.pattern, 0) / commitCount,
              conventional: scored.reduce((s, c) => s + c.score.dimensions.conventional, 0) / commitCount,
              imperative: scored.reduce((s, c) => s + c.score.dimensions.imperative, 0) / commitCount,
              body: scored.reduce((s, c) => s + c.score.dimensions.body, 0) / commitCount,
            }
          : { length: 0, pattern: 0, conventional: 0, imperative: 0, body: 0 };

        const sortedByScore = [...scored].sort((a, b) => b.score.total - a.score.total);

        return {
          repo,
          commitCount,
          repoScore,
          dimensions,
          samples: {
            best: sortedByScore.slice(0, 2),
            worst: sortedByScore.reverse().slice(0, 2),
          }
        };
      })
    );

    // Filter repos that have 0 commits
    const activeRepos = repoResults.filter(r => r.commitCount > 0);
    
    // For weighting, fetch repo metadata to get star count (or just use simple mean fallback for now as spec mentions stars but they aren't passed in. Spec says unweighted mean if no stars)
    // The spec uses `repo.stars / total_stars`. We'll fetch basic repo data for them.
    const repoStars = await Promise.all(
      activeRepos.map(async (r) => {
        const data = await fetchWithAuth(`https://api.github.com/repos/${username}/${r.repo}`).catch(() => null);
        return { repo: r.repo, stars: data?.stargazers_count ?? 0 };
      })
    );

    const totalStars = repoStars.reduce((sum, r) => sum + r.stars, 0);

    let aggregateScore = 0;
    if (activeRepos.length > 0) {
      if (totalStars > 0) {
        aggregateScore = activeRepos.reduce((sum, r) => {
          const stars = repoStars.find(rs => rs.repo === r.repo)?.stars ?? 0;
          return sum + (r.repoScore * (stars / totalStars));
        }, 0);
      } else {
        aggregateScore = activeRepos.reduce((sum, r) => sum + r.repoScore, 0) / activeRepos.length;
      }
    }

    return NextResponse.json({
      repoScores: repoResults,
      aggregateScore: Math.round(aggregateScore * 100),
    });

  } catch (error: any) {
    console.error('Commit quality fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to analyze commit quality' }, { status: 500 });
  }
}
