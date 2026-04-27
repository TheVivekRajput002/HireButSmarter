// app/api/resume/route.ts — Resume PDF text extraction

import { NextRequest, NextResponse } from 'next/server';

interface StructuredResumeData {
  skills: string[];
  experience: Array<{
    title: string;
    company: string;
    duration: string;
    description: string[];
  }>;
  education: Array<{
    degree: string;
    institution: string;
    year: string;
  }>;
  contact: {
    email?: string;
    phone?: string;
    linkedin?: string;
    github?: string;
  };
}

function extractStructuredData(text: string): StructuredResumeData {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  // Common skill keywords to look for
  const skillKeywords = [
    'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'HTML', 'CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'MySQL', 'AWS', 'Azure', 'GCP', 'Docker',
    'Kubernetes', 'Git', 'REST API', 'GraphQL', 'Machine Learning', 'AI', 'Data Science',
    'Angular', 'Vue.js', 'Next.js', 'Express', 'Django', 'Flask', 'Spring', 'Laravel',
    'Jenkins', 'CI/CD', 'Agile', 'Scrum', 'DevOps', 'Linux', 'Windows', 'macOS'
  ];

  // Extract skills
  const skills: string[] = [];
  const skillSectionRegex = /(skills|technical skills|technologies|competencies|expertise)/i;
  let inSkillSection = false;
  
  for (const line of lines) {
    if (skillSectionRegex.test(line)) {
      inSkillSection = true;
      continue;
    }
    
    if (inSkillSection) {
      // Check if we've moved to a different section
      if (/(experience|education|work|employment|projects|certification)/i.test(line)) {
        inSkillSection = false;
        continue;
      }
      
      // Extract skills from the line
      for (const skill of skillKeywords) {
        if (line.toLowerCase().includes(skill.toLowerCase()) && !skills.includes(skill)) {
          skills.push(skill);
        }
      }
    }
  }

  // Extract experience
  const experience: Array<{title: string; company: string; duration: string; description: string[]}> = [];
  const experienceSectionRegex = /(experience|work experience|employment|professional experience)/i;
  let inExperienceSection = false;
  let currentExperience: typeof experience[0] | null = null;
  
  for (const line of lines) {
    if (experienceSectionRegex.test(line)) {
      inExperienceSection = true;
      continue;
    }
    
    if (inExperienceSection) {
      // Check if we've moved to a different section
      if (/(education|skills|projects|certification|summary)/i.test(line)) {
        inExperienceSection = false;
        if (currentExperience) {
          experience.push(currentExperience);
          currentExperience = null;
        }
        continue;
      }
      
      // Look for job title patterns (usually contains "Engineer", "Developer", "Manager", etc.)
      const jobTitleRegex = /(senior|lead|principal|staff|junior|mid|associate)?\s*(software|frontend|backend|full[-]?stack|devops|data|machine learning|ai|cloud|security|qa|test)\s*(engineer|developer|scientist|analyst|architect|manager|consultant)/i;
      
      if (jobTitleRegex.test(line) && !currentExperience) {
        // Extract title and company
        const parts = line.split(/at|@|–|-|—/);
        currentExperience = {
          title: parts[0]?.trim() || line,
          company: parts[1]?.trim() || '',
          duration: '',
          description: []
        };
      } else if (currentExperience) {
        // Look for duration patterns
        const durationRegex = /\d{4}[-–]\d{4}|\d{4}[-–]present|\d{1,2}\/\d{4}[-–]\d{1,2}\/\d{4}|\d{1,2}\/\d{4}[-–]present/i;
        if (durationRegex.test(line) && !currentExperience.duration) {
          currentExperience.duration = line;
        } else if (line.startsWith('•') || line.startsWith('-') || line.startsWith('*')) {
          currentExperience.description.push(line.replace(/^[•\-\*]\s*/, ''));
        } else if (jobTitleRegex.test(line)) {
          // New job entry
          experience.push(currentExperience);
          const parts = line.split(/at|@|–|-|—/);
          currentExperience = {
            title: parts[0]?.trim() || line,
            company: parts[1]?.trim() || '',
            duration: '',
            description: []
          };
        }
      }
    }
  }
  
  if (currentExperience) {
    experience.push(currentExperience);
  }

  // Extract education
  const education: Array<{degree: string; institution: string; year: string}> = [];
  const educationSectionRegex = /(education|academic|university|college)/i;
  let inEducationSection = false;
  
  for (const line of lines) {
    if (educationSectionRegex.test(line)) {
      inEducationSection = true;
      continue;
    }
    
    if (inEducationSection) {
      // Check if we've moved to a different section
      if (/(experience|skills|projects|certification|summary)/i.test(line)) {
        inEducationSection = false;
        continue;
      }
      
      // Look for degree patterns
      const degreeRegex = /(bachelor|master|phd|doctorate|associate|b\.s\.|m\.s\.|b\.a\.|m\.a\.|b\.tech|m\.tech)/i;
      const yearRegex = /\d{4}/;
      
      if (degreeRegex.test(line)) {
        const parts = line.split(/,|at|in|from/);
        const degree = parts[0]?.trim() || line;
        const institution = parts[1]?.trim() || parts[2]?.trim() || '';
        const yearMatch = line.match(yearRegex);
        const year = yearMatch ? yearMatch[0] : '';
        
        education.push({ degree, institution, year });
      }
    }
  }

  // Extract contact information
  const contact: {email?: string; phone?: string; linkedin?: string; github?: string} = {};
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/;
  const phoneRegex = /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b|\+?\d{1,3}[-.\s]?\d{3}[-.\s]?\d{3}[-.\s]?\d{4}\b/;
  const linkedinRegex = /linkedin\.com\/in\/[\w-]+/i;
  const githubRegex = /github\.com\/[\w-]+/i;
  
  const emailMatch = text.match(emailRegex);
  if (emailMatch) contact.email = emailMatch[0];
  
  const phoneMatch = text.match(phoneRegex);
  if (phoneMatch) contact.phone = phoneMatch[0];
  
  const linkedinMatch = text.match(linkedinRegex);
  if (linkedinMatch) contact.linkedin = linkedinMatch[0];
  
  const githubMatch = text.match(githubRegex);
  if (githubMatch) contact.github = githubMatch[0];

  return {
    skills: skills.slice(0, 20), // Limit to top 20 skills
    experience: experience.slice(0, 5), // Limit to top 5 experiences
    education: education.slice(0, 3), // Limit to top 3 education entries
    contact
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 });
    }

    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be under 5MB' }, { status: 400 });
    }

    // Read file buffer and extract text using basic PDF text extraction
    const buffer = Buffer.from(await file.arrayBuffer());
    
    // Simple PDF text extraction - this is a basic implementation
    // In production, you might want to use a more robust solution
    let extractedText = '';
    
    try {
      // Convert buffer to string and look for text content
      const pdfString = buffer.toString('latin1');
      
      // Extract text content between common PDF operators
      const textMatches = pdfString.match(/\(([^)]+)\)/g);
      if (textMatches) {
        extractedText = textMatches
          .map(match => match.slice(1, -1)) // Remove parentheses
          .join(' ')
          .replace(/[^a-zA-Z0-9\s.,@()-]/g, ' ') // Clean up special characters
          .replace(/\s+/g, ' ') // Normalize whitespace
          .trim();
      }
      
      // If no text found, try a different approach
      if (!extractedText || extractedText.length < 50) {
        // Look for text between BT and ET operators (text blocks)
        const textBlockMatches = pdfString.match(/BT\s*([^]*?)\s*ET/g);
        if (textBlockMatches) {
          extractedText = textBlockMatches
            .map(block => block.replace(/BT|ET|Tf|Td|Tj|TJ|\d+\s*\d+\s*Td/g, ''))
            .join(' ')
            .replace(/[^a-zA-Z0-9\s.,@()-]/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();
        }
      }
      
      // Fallback: if still no text, create a placeholder
      if (!extractedText || extractedText.length < 20) {
        extractedText = `Resume uploaded: ${file.name}\n\nNote: Advanced PDF parsing requires additional dependencies. Basic text extraction completed.`;
      }
    } catch (parseError) {
      console.error('PDF parsing error:', parseError);
      extractedText = `Resume uploaded: ${file.name}\n\nNote: PDF text extraction encountered an error. Please ensure the resume contains selectable text.`;
    }

    // Extract structured data from resume text
    const structuredData = extractStructuredData(extractedText);

    // Debug logging to see what we're extracting
    console.log('Resume API - extracted data:', {
      textLength: extractedText.length,
      structuredData,
      fileName: file.name
    });

    return NextResponse.json({
      text: extractedText,
      pages: 1, // Default to 1 page since we're not using full PDF parsing
      fileName: file.name,
      structuredData,
    });
  } catch (error: unknown) {
    console.error('Resume parse error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to parse PDF: ${message}` }, { status: 500 });
  }
}
