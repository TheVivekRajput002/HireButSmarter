// lib/github.ts — GitHub API fetch helpers

import axios from 'axios';

const GITHUB_API = 'https://api.github.com';
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || '';

function headers() {
  const h: Record<string, string> = {
    Accept: 'application/vnd.github.v3+json',
  };
  if (GITHUB_TOKEN) h.Authorization = `Bearer ${GITHUB_TOKEN}`;
  return h;
}

// ── User profile ──────────────────────────────────────────────
export interface GitHubUser {
  login: string;
  avatar_url: string;
  name: string | null;
  bio: string | null;
  followers: number;
  public_repos: number;
  created_at: string;
}

export async function fetchUser(username: string): Promise<GitHubUser> {
  const { data } = await axios.get<GitHubUser>(
    `${GITHUB_API}/users/${username}`,
    { headers: headers() }
  );
  return data;
}

// ── Repositories ──────────────────────────────────────────────
export interface GitHubRepo {
  name: string;
  description: string | null;
  html_url: string;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  updated_at: string;
  size: number;               // KB
  fork: boolean;
}

export async function fetchRepos(username: string): Promise<GitHubRepo[]> {
  const repos: GitHubRepo[] = [];
  let page = 1;
  const perPage = 100;

  // Paginate up to 300 repos (3 pages)
  while (page <= 3) {
    const { data } = await axios.get<GitHubRepo[]>(
      `${GITHUB_API}/users/${username}/repos`,
      {
        headers: headers(),
        params: { per_page: perPage, page, sort: 'updated', type: 'owner' },
      }
    );
    repos.push(...data);
    if (data.length < perPage) break;
    page++;
  }

  // Exclude forks
  return repos.filter(r => !r.fork);
}

// ── README content ────────────────────────────────────────────
export async function fetchReadme(owner: string, repo: string): Promise<string | null> {
  try {
    const { data } = await axios.get(
      `${GITHUB_API}/repos/${owner}/${repo}/readme`,
      { headers: headers() }
    );
    // GitHub returns base64-encoded content
    return Buffer.from(data.content, 'base64').toString('utf-8');
  } catch {
    return null; // No README or API error
  }
}

/**
 * Fetch READMEs for multiple repos in parallel.
 * Gracefully degrades — returns null for repos with no README.
 */
export async function fetchReadmesBatch(
  username: string,
  repoNames: string[]
): Promise<Map<string, string | null>> {
  const results = new Map<string, string | null>();
  const promises = repoNames.map(async (name) => {
    const content = await fetchReadme(username, name);
    results.set(name, content);
  });
  await Promise.allSettled(promises);
  return results;
}

/**
 * Calculate total stars across all repos.
 */
export function totalStars(repos: GitHubRepo[]): number {
  return repos.reduce((sum, r) => sum + r.stargazers_count, 0);
}

/**
 * Shared GitHub Auth Helper for extended endpoints using Next.js fetch API
 */
export async function fetchWithAuth(url: string) {
  const headers: HeadersInit = { Accept: 'application/vnd.github+json' };
  if (process.env.GITHUB_TOKEN) {
    headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN}`;
  }
  const res = await fetch(url, { headers, next: { revalidate: 300 } });
  
  if (res.status === 403) throw new Error('RATE_LIMIT');
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`GitHub ${res.status}`);
  
  return res.json();
}
