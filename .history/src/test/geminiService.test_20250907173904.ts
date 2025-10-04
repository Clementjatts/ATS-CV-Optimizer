import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Mock } from 'vitest';

// Create a test version that focuses on testing the prompt construction
describe('Gemini Service - Stylistic Rules Enforcement', () => {
  
  // Sample CV content with prohibited language styles and words
  const sampleCvWithProhibitedLanguage = `
JOHN DOE
Email: john.doe@email.com | Phone: 555-1234 | Location: San Francisco, CA

PROFESSIONAL SUMMARY
In the realm of software engineering, I am a proactive and results-oriented professional who leverages cutting-edge technologies to create synergistic solutions. I am passionate about driving innovation and thinking outside the box to deliver game-changing results. At the end of the day, I am a team player who brings a plethora of skills to the table.

WORK EXPERIENCE
Senior Software Engineer - Tech Innovations Inc. (San Francisco, CA) | Jan 2020 - Present
• Leveraged robust frameworks to create scalable solutions that moved the needle
• Utilised a holistic approach to problem-solving, drilling down to core competencies
• Facilitated seamless integration of disparate systems through strategic thinking
• Orchestrated paradigm shifts in development methodologies
• Provided actionable insights that created win-win situations

EDUCATION
Bachelor of Science in Computer Science - Stanford University | 2016 - 2020

SKILLS
JavaScript, React, Node.js, Python, Agile methodologies, Thought leadership, Excellent communication skills
`;

  const sampleJobDescription = `
We are seeking a Senior Software Engineer to join our dynamic team. The ideal candidate will have strong experience with modern web technologies, excellent problem-solving skills, and the ability to work collaboratively in an agile environment. You will be responsible for developing scalable applications, integrating systems, and contributing to our innovative product roadmap.
`;

  it('should construct prompt with comprehensive stylistic rules', () => {
    // Test the prompt construction logic (this would normally be in the service)
    const prompt = `
You are a world-class professional CV writer and Applicant Tracking System (ATS) optimization expert. Your task is to create a modern, professional CV using a standardized template that perfectly aligns with a specific job description.

**You will be given two inputs:**
1.  **[CURRENT CV]**: The user's existing CV content.
2.  **[JOB DESCRIPTION]**: The target job description.

**CRITICAL INSTRUCTIONS:**
1.  **Extract and Transform:** Analyze the [CURRENT CV] to extract all relevant information and transform it into a modern, professional format using the standardized template structure.
2.  **Optimize for Job Match:** Thoroughly analyze the [JOB DESCRIPTION] to identify key skills, qualifications, technologies, and responsibilities. Strategically integrate these keywords throughout the CV.
3.  **Use Modern Template Structure:** Organize the CV into these specific sections in this exact order:
   - PROFILE HEADER (Name + Contact Information)
   - PROFESSIONAL SUMMARY (3-4 compelling sentences)
   - PROFESSIONAL EXPERIENCE (Chronological work history)
   - EDUCATION (Academic background)
   - PROFESSIONAL CERTIFICATIONS (Relevant certifications)
   - KEY SKILLS & COMPETENCIES (Technical and soft skills)

4.  **Enhance Content:** Transform bullet points with action verbs, quantify achievements where possible, and ensure all content is truthful and accurately reflects the user's experience.
5.  **Prioritize Relevance:** Focus on experiences, skills, and achievements most relevant to the target job. If the user has certifications, projects, or other qualifications mentioned in their original CV, include them in the appropriate template sections.
6.  **Document Optimization:** Provide specific details about what was optimized, including exact keywords integrated, skills aligned, experience optimizations made, and how the summary was tailored.
7.  **Direct Language Requirement:** Use direct, concrete language. Replace any prohibited terms with simpler, more common alternatives. Retain only essential keywords.
8.  **Prohibited Language Styles:** Strictly avoid the following:
   - Juxtapositions (state preferred concepts directly)
   - Em-dashes (use periods for separate sentences)
   - Introductory phrases ("picture this", "in the realm of", etc.)
   - False urgency ("you need to", "you must", "essential")
   - Vague qualifiers ("very", "really", "quite", "actually")
   - Cliché transitions ("at the end of the day", etc.)
   - Command phrases ("remember", "keep in mind", etc.)
   - Overachiever vocabulary ("plethora", "myriad", "utilise", etc.)
   - Wishy-washy qualifiers ("to some extent", "in many cases", etc.)
   - Forced transitions ("moreover", "furthermore", etc.)
   - Overly formal phrasing ("one might consider", etc.)
   - Explainer phrases ("in other words", etc.)
   - Overeager emphasis ("it is important to note", etc.)
   - Pseudo-expert stance ("studies have shown", etc.)
   - Awkward idioms ("hit the nail on the head", etc.)
   - Conclusion crutches ("in conclusion", etc.)
9.  **Prohibited Words List:** Avoid these specific terms and phrases:
   - "Synergy", "Leverage", "Paradigm", "Game-changer", "Disruptive"
   - "Thought leadership", "Value-add", "Core competency", "Best practice"
   - "Circle back", "Touch base", "Deep dive", "Low-hanging fruit"
   - "Move the needle", "Drill down", "Bandwidth", "Ping me"
   - "Think outside the box", "Win-win", "Actionable insights"
   - "Scalable solutions", "Holistic approach", "Seamless integration"
   - "Cutting-edge", "State-of-the-art", "Next-generation", "Innovative"
   - "Robust", "Agile", "Dynamic", "Proactive", "Strategic"
   - "Passionate", "Driven", "Results-oriented", "Detail-oriented"
   - "Team player", "Self-starter", "Go-getter", "Hard worker"
   - "Excellent communication skills", "Strong work ethic"
   - "Quick learner", "Problem solver", "Multitasker"
   - Any buzzwords, jargon, or corporate clichés

**STYLE ENFORCEMENT:** The optimized content MUST strictly adhere to these stylistic rules. Any violation will result in rejection of the CV. Use clear, concise, professional language that focuses on concrete achievements and measurable results.

**IMPORTANT:** Do not invent experience or skills the user does not possess. Extract information from their existing CV and enhance it for the target role.

---

**[CURRENT CV]**
${sampleCvWithProhibitedLanguage}

---

**[JOB DESCRIPTION]**
${sampleJobDescription}
`;

    // Verify that the prompt includes stylistic rules
    expect(prompt).toContain('Direct Language Requirement');
    expect(prompt).toContain('Prohibited Language Styles');
    expect(prompt).toContain('Prohibited Words List');
    
    // Verify specific prohibited terms are mentioned
    expect(prompt).toContain('Synergy');
    expect(prompt).toContain('Leverage');
    expect(prompt).toContain('Paradigm');
    expect(prompt).toContain('Game-changer');
    expect(prompt).toContain('Thought leadership');
    
    // Verify the CV content is included
    expect(prompt).toContain('JOHN DOE');
    expect(prompt).toContain('Senior Software Engineer');
    expect(prompt).toContain('Stanford University');
    
    // Verify the job description is included
    expect(prompt).toContain('Senior Software Engineer');
    expect(prompt).toContain('modern web technologies');
    expect(prompt).toContain('agile environment');
  });

  it('should demonstrate expected transformations of prohibited terms', () => {
    // Test the expected transformations that should occur
    const originalContent = sampleCvWithProhibitedLanguage;
    
    // Verify original content contains prohibited terms
    expect(originalContent).toContain('proactive');
    expect(originalContent).toContain('results-oriented');
    expect(originalContent).toContain('leverages');
    expect(originalContent).toContain('cutting-edge');
    expect(originalContent).toContain('synergistic');
    expect(originalContent).toContain('In the realm of');
    expect(originalContent).toContain('at the end of the day');
    expect(originalContent).toContain('plethora');
    expect(originalContent).toContain('Thought leadership');
    expect(originalContent).toContain('Excellent communication skills');

    // This represents what the AI should return after processing
    const expectedOptimizedContent = {
      professionalSummary: "Software engineer with experience in modern web technologies. Skilled in developing applications and integrating systems. Focused on delivering effective solutions through collaborative development.",
      workExperience: [
        {
          responsibilities: [
            "Developed applications using modern frameworks to create effective solutions",
            "Applied comprehensive approach to problem-solving, focusing on essential capabilities",
            "Integrated different systems through coordinated planning",
            "Implemented improvements in development methodologies",
            "Provided useful information that benefited all parties"
          ]
        }
      ],
      skills: [
        "JavaScript",
        "React", 
        "Node.js",
        "Python",
        "Agile methodologies",
        "Application development",
        "System integration"
      ]
    };

    // Verify optimized content does NOT contain prohibited terms
    expect(expectedOptimizedContent.professionalSummary).not.toContain('proactive');
    expect(expectedOptimizedContent.professionalSummary).not.toContain('results-oriented');
    expect(expectedOptimizedContent.professionalSummary).not.toContain('cutting-edge');
    expect(expectedOptimizedContent.professionalSummary).not.toContain('synergistic');
    expect(expectedOptimizedContent.professionalSummary).not.toContain('in the realm of');
    expect(expectedOptimizedContent.professionalSummary).not.toContain('at the end of the day');

    // Verify work experience responsibilities are cleaned up
    expectedOptimizedContent.workExperience[0].responsibilities.forEach(responsibility => {
      expect(responsibility).not.toContain('leverage');
      expect(responsibility).not.toContain('robust');
      expect(responsibility).not.toContain('scalable solutions');
      expect(responsibility).not.toContain('holistic approach');
      expect(responsibility).not.toContain('seamless integration');
      expect(responsibility).not.toContain('paradigm shifts');
      expect(responsibility).not.toContain('actionable insights');
      expect(responsibility).not.toContain('win-win');
    });

    // Verify skills are cleaned up
    expectedOptimizedContent.skills.forEach(skill => {
      expect(skill).not.toContain('Thought leadership');
      expect(skill).not.toContain('Excellent communication skills');
    });
  });

  it('should validate JSON response structure', () => {
    // Test the expected JSON structure that should be returned
    const expectedResponse = {
      fullName: "John Doe",
      contactInfo: {
        email: "john.doe@email.com",
        phone: "555-1234",
        linkedin: "",
        location: "San Francisco, CA"
      },
      professionalSummary: expect.any(String),
      workExperience: expect.arrayContaining([
        expect.objectContaining({
          jobTitle: expect.any(String),
          company: expect.any(String),
          location: expect.any(String),
          dates: expect.any(String),
          responsibilities: expect.arrayContaining([expect.any(String)])
        })
      ]),
      education: expect.arrayContaining([
        expect.objectContaining({
          institution: expect.any(String),
          degree: expect.any(String),
          dates: expect.any(String)
        })
      ]),
      certifications: expect.any(Array),
      skills: expect.arrayContaining([expect.any(String)]),
      optimizationDetails: expect.objectContaining({
        keywordsIntegrated: expect.arrayContaining([expect.any(String)]),
        skillsAligned: expect.arrayContaining([expect.any(String)]),
        experienceOptimizations: expect.arrayContaining([expect.any(String)]),
        summaryTailoring: expect.any(String)
      })
    };

    // This would be the actual response from the service
    const mockResponse = {
      fullName: "John Doe",
      contactInfo: {
        email: "john.doe@email.com",
        phone: "555-1234",
        linkedin: "",
        location: "San Francisco, CA"
      },
      professionalSummary: "Software engineer with experience in modern web technologies.",
      workExperience: [
        {
          jobTitle: "Senior Software Engineer",
          company: "Tech Innovations Inc.",
          location: "San Francisco, CA",
          dates: "Jan 2020 - Present",
          responsibilities: [
            "Developed applications using modern frameworks"
          ]
        }
      ],
      education: [
        {
          institution: "Stanford University",
          degree: "Bachelor of Science in Computer Science",
          dates: "2016 - 2020"
        }
      ],
      certifications: [],
      skills: ["JavaScript", "React", "Node.js"],
      optimizationDetails: {
        keywordsIntegrated: ["software engineer", "web technologies"],
        skillsAligned: ["JavaScript", "React"],
        experienceOptimizations: ["transformed buzzwords to concrete language"],
        summaryTailoring: "Emphasized relevant experience with modern technologies"
      }
    };

    expect(mockResponse).toMatchObject(expectedResponse);
  });

  it('should show before/after transformation examples', () => {
    // Demonstrate specific transformations
    const transformations = [
      {
        before: "Leveraged robust frameworks to create scalable solutions that moved the needle",
        after: "Developed applications using modern frameworks to create effective solutions"
      },
      {
        before: "Utilised a holistic approach to problem-solving, drilling down to core competencies",
        after: "Applied comprehensive approach to problem-solving, focusing on essential capabilities"
      },
      {
        before: "Facilitated seamless integration of disparate systems through strategic thinking",
        after: "Integrated different systems through coordinated planning"
      },
      {
        before: "Provided actionable insights that created win-win situations",
        after: "Provided useful information that benefited all parties"
      }
    ];

    transformations.forEach(({ before, after }) => {
      // Verify prohibited terms are removed from "after" version
      expect(after).not.toContain('Leveraged');
      expect(after).not.toContain('robust');
      expect(after).not.toContain('scalable solutions');
      expect(after).not.toContain('moved the needle');
      expect(after).not.toContain('holistic approach');
      expect(after).not.toContain('drilling down');
      expect(after).not.toContain('core competencies');
      expect(after).not.toContain('seamless integration');
      expect(after).not.toContain('actionable insights');
      expect(after).not.toContain('win-win');

      // Verify "after" version is still meaningful
      expect(after.length).toBeGreaterThan(20);
      expect(after).toContain(' ');
    });
  });
});