import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';
import { Developer, JDMatchAnalysis } from '@/lib/types';

// Disable hyphenation — prevents crashes on words @react-pdf can't hyphenate
Font.registerHyphenationCallback((word) => [word]);

// Register fonts using stable CDN URLs
Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf', fontWeight: 700 }
  ]
});

Font.register({
  family: 'Space Mono',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/space-mono@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/space-mono@latest/latin-700-normal.ttf', fontWeight: 700 }
  ]
});

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Inter', backgroundColor: '#ffffff', color: '#1a1a2e' },
  header: { borderBottomWidth: 1, borderBottomColor: '#e2e8f0', paddingBottom: 20, marginBottom: 20 },
  name: { fontSize: 28, fontWeight: 700, marginBottom: 4 },
  username: { fontSize: 14, fontFamily: 'Space Mono', color: '#64748b', marginBottom: 12 },
  bio: { fontSize: 12, color: '#444', lineHeight: 1.5 },
  statsRow: { flexDirection: 'row', gap: 24, marginTop: 12 },
  stat: { flexDirection: 'row', gap: 6, alignItems: 'center' },
  statValue: { fontFamily: 'Space Mono', fontSize: 12, fontWeight: 700 },
  statLabel: { fontSize: 10, color: '#64748b', textTransform: 'uppercase' },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 16, fontWeight: 700, marginBottom: 12, color: '#0f172a', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 4 },
  scoreBox: { backgroundColor: '#f8fafc', padding: 16, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  scoreLeft: { flex: 1 },
  scoreLabel: { fontSize: 12, color: '#64748b', textTransform: 'uppercase', marginBottom: 4 },
  scoreValueRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  scoreValue: { fontSize: 36, fontFamily: 'Space Mono', fontWeight: 700, color: '#22c55e' },
  scoreTier: { fontSize: 14, fontFamily: 'Space Mono', color: '#22c55e', backgroundColor: '#dcfce7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  breakdownLabel: { fontSize: 10, color: '#475569' },
  breakdownValue: { fontSize: 10, fontFamily: 'Space Mono', color: '#0f172a' },
  
  repo: { marginBottom: 12 },
  repoName: { fontSize: 12, fontFamily: 'Space Mono', fontWeight: 700, color: '#3b82f6', marginBottom: 4 },
  repoDesc: { fontSize: 10, color: '#475569', marginBottom: 4 },
  repoMeta: { flexDirection: 'row', gap: 12 },
  repoMetaItem: { fontSize: 9, color: '#64748b', fontFamily: 'Space Mono' },
  
  explainRow: { flexDirection: 'row', marginBottom: 8 },
  explainIcon: { width: 16, fontSize: 12 },
  explainContent: { flex: 1 },
  explainTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  explainSkill: { fontSize: 12, fontWeight: 600, width: 80 },
  explainConf: { fontSize: 10, fontFamily: 'Space Mono', color: '#64748b' },
  explainRepos: { fontSize: 9, fontFamily: 'Space Mono', color: '#94a3b8', marginLeft: 80 },
  
  footer: { position: 'absolute', bottom: 30, left: 40, right: 40, fontSize: 8, color: '#94a3b8', textAlign: 'center', borderTopWidth: 1, borderTopColor: '#f1f5f9', paddingTop: 10 }
});

export const PortfolioPDF = ({ developer, jdMatchAnalysis }: { developer: Developer; jdMatchAnalysis?: JDMatchAnalysis | null }) => {
  const getIcon = (confidence: number) => {
    if (confidence > 0.7) return '✓';
    if (confidence >= 0.4) return '△';
    return '▽';
  };

  // Safe slice for repos (avoiding undefined if somehow repos array is empty)
  const topRepos = [...(developer.repos || [])]
    .sort((a, b) => b.complexity_score - a.complexity_score)
    .slice(0, 3);

  // Take top 8 skills to fit well
  const topSkills = [...(developer.skills || [])]
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 8);

  const getTierColor = (score: number) => {
    if (score > 80) return '#22c55e'; // Expert
    if (score > 60) return '#3b82f6'; // Proficient
    if (score > 40) return '#f59e0b'; // Developing
    if (score > 20) return '#f97316'; // Emerging
    return '#ef4444'; // Beginner
  };

  const tierColor = getTierColor(developer.potential_score);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.name}>{developer.name || developer.username}</Text>
          <Text style={styles.username}>@{developer.username}</Text>
          {developer.bio && <Text style={styles.bio}>{developer.bio}</Text>}
          
          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{developer.followers.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Followers</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{developer.public_repos.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Repos</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statValue}>{developer.total_stars.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Stars</Text>
            </View>
          </View>
        </View>

        {/* Potential Score Area */}
        <View style={styles.scoreBox}>
          <View style={styles.scoreLeft}>
            <Text style={styles.scoreLabel}>Potential Score</Text>
            <View style={styles.scoreValueRow}>
              <Text style={[styles.scoreValue, { color: tierColor }]}>{developer.potential_score}</Text>
              <Text style={[styles.scoreValue, { fontSize: 16, color: '#94a3b8' }]}>/ 100</Text>
              <Text style={[styles.scoreTier, { color: tierColor, backgroundColor: tierColor + '20' }]}>
                {developer.potential_label}
              </Text>
            </View>
          </View>
          <View style={{ flex: 1, paddingLeft: 40, borderLeftWidth: 1, borderLeftColor: '#e2e8f0' }}>
             <View style={styles.breakdownRow}>
               <Text style={styles.breakdownLabel}>Repo Volume</Text>
               <Text style={styles.breakdownValue}>{developer.score_breakdown.repo_volume}/20</Text>
             </View>
             <View style={styles.breakdownRow}>
               <Text style={styles.breakdownLabel}>Star Count</Text>
               <Text style={styles.breakdownValue}>{developer.score_breakdown.star_count}/20</Text>
             </View>
             <View style={styles.breakdownRow}>
               <Text style={styles.breakdownLabel}>Lang Diversity</Text>
               <Text style={styles.breakdownValue}>{developer.score_breakdown.language_diversity}/20</Text>
             </View>
             <View style={styles.breakdownRow}>
               <Text style={styles.breakdownLabel}>Skill Count</Text>
               <Text style={styles.breakdownValue}>{developer.score_breakdown.skill_count}/20</Text>
             </View>
             <View style={styles.breakdownRow}>
               <Text style={styles.breakdownLabel}>Account Activity</Text>
               <Text style={styles.breakdownValue}>{developer.score_breakdown.account_activity}/20</Text>
             </View>
             
             {developer.consistency_score != null && (
               <View style={[styles.breakdownRow, { marginTop: 4, paddingTop: 4, borderTopWidth: 1, borderTopColor: '#e2e8f0' }]}>
                 <Text style={styles.breakdownLabel}>Commit Consistency</Text>
                 <Text style={styles.breakdownValue}>{developer.consistency_score}/100</Text>
               </View>
             )}
             {developer.commit_quality_score != null && (
               <View style={styles.breakdownRow}>
                 <Text style={styles.breakdownLabel}>Commit Quality</Text>
                 <Text style={styles.breakdownValue}>{developer.commit_quality_score}/100</Text>
               </View>
             )}
          </View>
        </View>

        {/* Explainability Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skill Evidence & Explainability</Text>
          {topSkills.map((skill, i) => (
            <View key={i} style={styles.explainRow}>
              <Text style={[styles.explainIcon, { color: skill.confidence > 0.7 ? '#22c55e' : skill.confidence >= 0.4 ? '#f59e0b' : '#64748b' }]}>
                {getIcon(skill.confidence)}
              </Text>
              <View style={styles.explainContent}>
                <View style={styles.explainTitleRow}>
                  <Text style={styles.explainSkill}>{skill.name}</Text>
                  <Text style={styles.explainConf}>{Math.round(skill.confidence * 100)}% conf · {skill.repo_count} repos</Text>
                </View>
                {skill.source_repos?.length > 0 && (
                  <Text style={styles.explainRepos}>
                     └─ {skill.source_repos.slice(0, 4).join(' · ')}{skill.source_repos.length > 4 ? ' ...' : ''}
                  </Text>
                )}
              </View>
            </View>
          ))}
          {topSkills.length === 0 && <Text style={{ fontSize: 10, color: '#64748b' }}>No skills detected.</Text>}
        </View>

        {/* Top Repos */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Top Repositories by Complexity</Text>
          {topRepos.map((repo, i) => (
            <View key={i} style={styles.repo}>
              <Text style={styles.repoName}>{repo.name}</Text>
              {repo.description && <Text style={styles.repoDesc}>{repo.description}</Text>}
              <View style={styles.repoMeta}>
                {repo.language && <Text style={styles.repoMetaItem}>{repo.language}</Text>}
                <Text style={styles.repoMetaItem}>★ {repo.stars}</Text>
                <Text style={styles.repoMetaItem}>Fork: {repo.forks}</Text>
                <Text style={styles.repoMetaItem}>Score: {repo.complexity_score}/100</Text>
              </View>
            </View>
          ))}
          {topRepos.length === 0 && <Text style={{ fontSize: 10, color: '#64748b' }}>No public repositories found.</Text>}
        </View>
        {/* JD Match (optional - only if analysis was run) */}
        {jdMatchAnalysis && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Job Description Match</Text>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Match Score</Text>
              <Text style={styles.breakdownValue}>{jdMatchAnalysis.matchResult.matchScore}/100</Text>
            </View>
            <View style={styles.breakdownRow}>
              <Text style={styles.breakdownLabel}>Required Skills Matched</Text>
              <Text style={styles.breakdownValue}>{jdMatchAnalysis.matchResult.requiredMatched}/{jdMatchAnalysis.matchResult.requiredTotal}</Text>
            </View>
            {jdMatchAnalysis.matchResult.missing.filter(s => s.required).length > 0 && (
              <View style={styles.breakdownRow}>
                <Text style={styles.breakdownLabel}>Missing Required</Text>
                <Text style={styles.breakdownValue}>{jdMatchAnalysis.matchResult.missing.filter(s => s.required).map(s => s.name).join(', ')}</Text>
              </View>
            )}
            {jdMatchAnalysis.aiAnalysis && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 9, color: '#475569', lineHeight: 1.4 }}>
                  {jdMatchAnalysis.aiAnalysis.split('.')[0]}.
                </Text>
              </View>
            )}
          </View>
        )}

        <Text style={styles.footer}>
          Generated by SkillLens Talent Intelligence • {new Date().toLocaleDateString()} • github.com/{developer.username}
        </Text>
      </Page>
    </Document>
  );
};
