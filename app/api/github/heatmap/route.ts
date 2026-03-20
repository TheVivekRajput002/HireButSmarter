import { NextResponse } from 'next/server';
import { fetchWithAuth } from '@/lib/github';
import { DailyCommitCount, HeatmapData, HeatmapStats } from '@/lib/types';

// Fetch up to N pages of GitHub REST API
async function fetchAllPages(url: string, maxPages: number = 3) {
  let allEvents: any[] = [];
  
  for (let page = 1; page <= maxPages; page++) {
    const pageUrl = `${url}&page=${page}`;
    const data = await fetchWithAuth(pageUrl);
    
    if (!data || !Array.isArray(data)) break;
    allEvents = allEvents.concat(data);
    
    if (data.length < 100) break;
  }
  
  return allEvents;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json({ error: 'Username is required' }, { status: 400 });
    }

    const eventsUrl = `https://api.github.com/users/${username}/events?per_page=100`;
    const events = await fetchAllPages(eventsUrl, 3);
    
    // Parse into buckets
    const buckets: Record<string, { count: number; repos: Set<string> }> = {};
    
    for (const e of events) {
      if (e.type === 'PushEvent') {
        const date = e.created_at.split('T')[0];
        const repo = e.repo.name.split('/')[1] || e.repo.name;
        // The payload for PushEvent includes an array of commits
        const commitCount = e.payload?.commits?.length ?? 1;
        
        if (!buckets[date]) {
          buckets[date] = { count: 0, repos: new Set() };
        }
        
        buckets[date].count += commitCount;
        buckets[date].repos.add(repo);
      }
    }

    const endDate = new Date();
    // Shift end date to the most recent Saturday so the grid aligns well (standard GH style) or keep it relative to today
    // For simplicity, we just go back 364 days (52 weeks * 7 days)
    const startDate = new Date(endDate);
    startDate.setDate(endDate.getDate() - 364);

    // Ensure we start on a Sunday
    while (startDate.getDay() !== 0) {
      startDate.setDate(startDate.getDate() - 1);
    }

    const weeks: DailyCommitCount[][] = [];
    let currentDay = new Date(startDate);
    let total_commits = 0;
    let active_days = 0;
    
    let current_streak = 0;
    let longest_streak = 0;
    let streakActive = false;
    let peak_day: DailyCommitCount = { date: '', count: 0, repos: [] };

    // Group by weeks
    for (let w = 0; w < 52; w++) {
      const week: DailyCommitCount[] = [];
      for (let d = 0; d < 7; d++) {
        const dateStr = currentDay.toISOString().split('T')[0];
        const bucket = buckets[dateStr];
        
        const count = bucket ? bucket.count : 0;
        const repos = bucket ? Array.from(bucket.repos) : [];
        
        const dayStats: DailyCommitCount = { date: dateStr, count, repos };
        week.push(dayStats);
        
        // Track aggregates
        total_commits += count;
        if (count > 0) {
          active_days++;
          current_streak++;
          streakActive = true;
          if (current_streak > longest_streak) {
            longest_streak = current_streak;
          }
          if (count > peak_day.count) {
            peak_day = dayStats;
          }
        } else {
          // If the day is before today or is today, break the streak. 
          // If we're looking at a day in the future (due to grid padding), don't break the current streak
          if (currentDay <= new Date()) {
            current_streak = 0;
          }
        }
        
        currentDay.setDate(currentDay.getDate() + 1);
      }
      weeks.push(week);
    }
    
    // Formula from spec
    const active_ratio = active_days / 364;
    const streak_bonus = Math.min(longest_streak / 30, 1);
    const volume_factor = Math.min(total_commits / 500, 1);

    const consistency_score = Math.round(
      (active_ratio * 50) +
      (streak_bonus * 30) +
      (volume_factor * 20)
    );

    const stats: HeatmapStats = {
      total_commits,
      active_days,
      longest_streak,
      current_streak,
      peak_day,
      consistency_score
    };

    const heatmapData: HeatmapData = {
      weeks,
      stats
    };

    return NextResponse.json(heatmapData);
  } catch (error: any) {
    console.error('Heatmap fetch error:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch heatmap data' }, { status: 500 });
  }
}
