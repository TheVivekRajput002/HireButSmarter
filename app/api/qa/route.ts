// app/api/qa/route.ts — Q&A Agent AI endpoint (stateless)

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

    const ctx = developerContext;
    const systemPrompt = `You are an AI profile assistant for a developer's public GitHub.
Answer ONLY from the GitHub data below. Do not invent skills or scores.
When asked about role fit or gaps, reason from detected skill categories.
Keep responses clear and actionable, 3–5 sentences.

--- GITHUB DATA ---
GitHub: ${ctx.username} | Score: ${ctx.score}/100 (${ctx.label}) | Repos: ${ctx.repo_count}
Skills: ${ctx.skills_with_confidence || 'None detected'}
Top Repos: ${ctx.top_5_repos || 'None'}
Languages: ${ctx.language_percentages || 'None'}
--- END ---

Guidelines:
- When explaining the score, reference specific signals
- For role fit questions, map detected skills to typical role requirements
- For gap analysis, identify missing skill categories
- Never hallucinate skills or repos that aren't listed above`;

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const contents: Array<{ role: 'user' | 'model'; parts: Array<{ text: string }> }> = [
      { role: 'user', parts: [{ text: systemPrompt + '\n\n' + messages[0].content }] },
    ];

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
    console.error('QA API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }
}
