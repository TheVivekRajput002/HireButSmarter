// app/api/chat/route.ts — Hiring Agent AI endpoint

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

    // Build the grounded system prompt
    const ctx = developerContext;
    
    // Debug logging to check what data we're receiving
    console.log('Chat API - received context:', {
      hasResumeText: !!ctx.resume_text,
      hasStructuredData: !!ctx.structured_resume_data,
      resumeTextLength: ctx.resume_text?.length || 0,
      structuredDataKeys: ctx.structured_resume_data ? Object.keys(ctx.structured_resume_data) : []
    });
    
    const resumeSection = ctx.structured_resume_data ? `
--- RESUME DATA (Structured) ---
Resume Skills: ${ctx.structured_resume_data.skills}
Resume Experience: ${ctx.structured_resume_data.experience}
Resume Education: ${ctx.structured_resume_data.education}
Resume Contact: Email: ${ctx.structured_resume_data.contact.email}, GitHub: ${ctx.structured_resume_data.contact.github}, LinkedIn: ${ctx.structured_resume_data.contact.linkedin}
--- END RESUME DATA ---
` : ctx.resume_text && ctx.resume_text.trim() !== '' ? `
--- RESUME DATA (Raw Text) ---
${ctx.resume_text}
--- END RESUME DATA ---
` : `
--- RESUME DATA ---
No resume uploaded — answering from GitHub data only
--- END RESUME DATA ---
`;

    const systemInstruction = `You are a technical hiring assistant. Answer ONLY from the candidate data below.
Do not invent skills or experience. Cite specific repos, resume lines, or resume sections as evidence.
Keep responses to 3–5 sentences. If you cannot answer from the data, say so.

--- CANDIDATE DATA ---
GitHub: ${ctx.username} | Score: ${ctx.score}/100 (${ctx.label}) | Repos: ${ctx.repo_count} | Stars: ${ctx.total_stars}
GitHub Skills: ${ctx.skills_with_confidence_and_repo_list || 'None detected'}
Top Repos: ${ctx.top_5_repos_with_complexity_and_description || 'None'}
Languages: ${ctx.language_percentages || 'None'}
Commit Consistency Score: ${ctx.consistency_score || 'N/A'} (Active days: ${ctx.active_days || 'N/A'})
Commit Quality Score: ${ctx.commit_quality_score || 'N/A'} (Analyzed ${ctx.commits_analyzed || 0} commits)
${resumeSection}
--- END CANDIDATE DATA ---
${ctx.jd_match_context ? `
--- JD MATCH (active) ---
Match Score: ${ctx.jd_match_context.matchScore}/100
Required matched: ${ctx.jd_match_context.requiredMatched}/${ctx.jd_match_context.requiredTotal}
Optional matched: ${ctx.jd_match_context.optionalMatched}/${ctx.jd_match_context.optionalTotal}
Missing required: ${ctx.jd_match_context.missingRequired || 'None'}
Missing optional: ${ctx.jd_match_context.missingOptional || 'None'}
--- END JD MATCH ---
` : ''}
Guidelines:
- Always cite the specific repo, resume line, or resume section that supports your claim
- When discussing skills, reference both GitHub confidence percentages and resume skills
- Compare GitHub activity with resume experience when relevant
- For experience questions, reference specific resume job entries
- For education questions, reference resume education section
- Never hallucinate skills or experience that aren't in the data above`;

    // Build conversation history for multi-turn
    const contents = messages.map((msg: { role: string; content: string }) => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      config: { systemInstruction },
      contents,
    });

    return NextResponse.json({ response: response.text });
  } catch (error: unknown) {
    console.error('Chat API error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `AI error: ${message}` }, { status: 500 });
  }
}
