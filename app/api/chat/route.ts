// app/api/chat/route.ts — Hiring Agent AI endpoint

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { messages, developerContext } = await request.json();

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Messages are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    // Build the grounded system prompt
    const ctx = developerContext;
    const systemPrompt = `You are a technical hiring assistant. Answer ONLY from the candidate data below.
Do not invent skills or experience. Cite specific repos or resume lines as evidence.
Keep responses to 3–5 sentences. If you cannot answer from the data, say so.

--- CANDIDATE DATA ---
GitHub: ${ctx.username} | Score: ${ctx.score}/100 (${ctx.label}) | Repos: ${ctx.repo_count} | Stars: ${ctx.total_stars}
Skills: ${ctx.skills_with_confidence_and_repo_list || 'None detected'}
Top Repos: ${ctx.top_5_repos_with_complexity_and_description || 'None'}
Languages: ${ctx.language_percentages || 'None'}
Resume: ${ctx.resume_text || 'No resume uploaded — answering from GitHub data only'}
--- END ---

Guidelines:
- Always cite the specific repo or resume line that supports your claim
- If comparing skills, reference confidence percentages
- Never hallucinate skills that aren't in the data above`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation history
    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
      { role: 'user', parts: [{ text: systemPrompt + '\n\n' + messages[0].content }] },
    ];

    // Add subsequent messages
    for (let i = 1; i < messages.length; i++) {
      contents.push({
        role: messages[i].role === 'user' ? 'user' as const : 'model' as const,
        parts: [{ text: messages[i].content }],
      });
    }

    const result = await model.generateContent({ contents });
    const response = result.response.text();

    return NextResponse.json({ response });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }
}
