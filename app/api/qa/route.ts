// app/api/qa/route.ts — Q&A Agent AI endpoint (stateless)

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

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
    const systemInstruction = `You are an AI profile assistant for a developer's public GitHub.
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

    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      config: { systemInstruction },
      contents,
    });

    return NextResponse.json({ response: response.text });
  } catch (error: unknown) {
    console.error('QA API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }
}
