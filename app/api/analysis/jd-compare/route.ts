// app/api/analysis/jd-compare/route.ts — Gemini comparative JD Match for two candidates

import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function POST(request: NextRequest) {
  try {
    const { dev1Context, dev2Context, matchResult1, matchResult2 } = await request.json();

    if (!matchResult1 || !matchResult2) {
      return NextResponse.json({ error: 'Both matchResult1 and matchResult2 are required' }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'GEMINI_API_KEY not configured' }, { status: 500 });
    }

    const formatMatch = (ctx: Record<string, string | number>, mr: Record<string, unknown>) => {
      const matchedNames = (mr.matched as { name: string; confidence: number }[])
        ?.map(s => `${s.name} (${Math.round(s.confidence * 100)}%)`)
        .join(', ') || 'None';

      const missingRequired = (mr.missing as { name: string; required: boolean }[])
        ?.filter(s => s.required)
        .map(s => s.name)
        .join(', ') || 'None';

      const missingOptional = (mr.missing as { name: string; required: boolean }[])
        ?.filter(s => !s.required)
        .map(s => s.name)
        .join(', ') || 'None';

      return `GitHub: ${ctx.username} | Potential Score: ${ctx.score}/100 (${ctx.label})
Skills: ${ctx.skills_with_confidence_and_repo_list || 'None detected'}
Resume: ${ctx.resume_text || 'Not provided'}
JD Match Score: ${mr.matchScore}/100
Required skills matched: ${mr.requiredMatched}/${mr.requiredTotal}
Optional skills matched: ${mr.optionalMatched}/${mr.optionalTotal}
Matched skills: ${matchedNames}
Missing required: ${missingRequired}
Missing optional: ${missingOptional}`;
    };

    const systemInstruction = `You are a technical hiring assistant comparing two candidates for the same job.
Answer ONLY from the candidate and match data below.
Do not invent skills or experience. Keep response to 5–8 sentences.
Structure your response as:
1. Verdict: who is the stronger candidate for this role and why (1–2 sentences)
2. Candidate 1 strengths: key matched skills and evidence (1–2 sentences)
3. Candidate 2 strengths: key matched skills and evidence (1–2 sentences)
4. Key differentiators: what sets them apart and any notable gaps (1–2 sentences)

--- CANDIDATE 1 ---
${formatMatch(dev1Context, matchResult1)}
--- CANDIDATE 2 ---
${formatMatch(dev2Context, matchResult2)}
--- END ---`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction },
      contents: [{ role: 'user', parts: [{ text: 'Compare these two candidates for the job described and provide a verdict on who is more suitable.' }] }],
    });

    return NextResponse.json({ analysis: response.text });
  } catch (error: unknown) {
    console.error('JD Compare API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }
}
