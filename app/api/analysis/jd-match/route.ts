// app/api/analysis/jd-match/route.ts — Gemini JD Match explainability

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const { developerContext, matchResult } = await request.json();

    if (!matchResult) {
      return NextResponse.json({ error: 'matchResult is required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const ctx = developerContext;
    const mr = matchResult;

    const matchedNames = mr.matched?.map((s: { name: string; confidence: number }) =>
      `${s.name} (${Math.round(s.confidence * 100)}%)`
    ).join(', ') || 'None';

    const missingRequired = mr.missing
      ?.filter((s: { required: boolean }) => s.required)
      .map((s: { name: string }) => s.name)
      .join(', ') || 'None';

    const missingOptional = mr.missing
      ?.filter((s: { required: boolean }) => !s.required)
      .map((s: { name: string }) => s.name)
      .join(', ') || 'None';

    const systemInstruction = `You are a technical hiring assistant analyzing candidate-job fit.
Answer ONLY from the candidate and match data below.
Do not invent skills or experience. Keep response to 4–6 sentences.
Structure your response as:
1. Overall fit summary (1 sentence)
2. Top 3 matched strengths with repo evidence (2–3 sentences)
3. Key gaps and their impact on the role (1–2 sentences)

--- CANDIDATE DATA ---
GitHub: ${ctx.username} | Potential Score: ${ctx.score}/100 (${ctx.label})
Skills: ${ctx.skills_with_confidence_and_repo_list || 'None detected'}
Resume: ${ctx.resume_text || 'Not provided'}
--- MATCH DATA ---
JD Match Score: ${mr.matchScore}/100
Required skills matched: ${mr.requiredMatched}/${mr.requiredTotal}
Optional skills matched: ${mr.optionalMatched}/${mr.optionalTotal}
Matched skills: ${matchedNames}
Missing required: ${missingRequired}
Missing optional: ${missingOptional}
--- END ---`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction },
      contents: [{ role: 'user', parts: [{ text: 'Analyze this candidate-job fit based on the data provided.' }] }],
    });

    return NextResponse.json({ analysis: response.text });
  } catch (error: unknown) {
    console.error('JD Match API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }
}
