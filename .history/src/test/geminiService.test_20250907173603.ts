import { describe, it, expect, vi, beforeEach, afterAll } from 'vitest';
import type { Mock } from 'vitest';

// Mock the GoogleGenAI module with proper Type export
vi.mock('@google/genai', async (importOriginal) => {
  const actual = await importOriginal() as any;
  return {
    ...actual,
    GoogleGenAI: vi.fn().mockImplementation(() => ({
      models: {
        generateContent: vi.fn().mockResolvedValue({
          text: JSON.stringify({
            fullName: "John Doe",
            contactInfo: {
              email: "john.doe@email.com",
              phone: "555-1234",
              linkedin: "",
              location: "San Francisco, CA"
            },
            professionalSummary: "Software engineer with experience in modern web technologies. Skilled in developing applications and integrating systems. Focused on delivering effective solutions through collaborative development.",
            workExperience: [
              {
                jobTitle: "Senior Software Engineer",
                company: "Tech Innovations Inc.",
                location: "San Francisco, CA",
                dates: "Jan 2020 - Present",
                responsibilities: [
                  "Developed applications using modern frameworks to create effective solutions",
                  "Applied comprehensive approach to problem-solving, focusing on essential capabilities",
                  "Integrated different systems through coordinated planning",
                  "Implemented improvements in development methodologies",
                  "Provided useful information that benefited all parties"
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
            skills: [
              "JavaScript",
              "React", 
              "Node.js",
              "Python",
              "Agile methodologies",
              "Application development",
              "System integration"
            ],
            optimizationDetails: {
              keywordsIntegrated: ["software engineer", "web technologies", "scalable applications", "system integration", "agile environment"],
              skillsAligned: ["JavaScript", "React", "Node.js", "Python", "application development"],
              experienceOptimizations: ["transformed buzzwords to concrete language", "removed corporate clichés", "focused on measurable achievements"],
              summaryTailoring: "Emphasized relevant experience with modern technologies and collaborative development while removing prohibited language styles"
            }
          })
        })
      }
    }))
  };
});

// Import the actual service but bypass the API key check for testing
const originalProcessEnv = process.env;
process.env.API_KEY = 'mock-test-key';

// Import after setting the environment variable
import { optimizeCvWithGemini, type CvData } from '../../services/geminiService';

describe('Gemini Service - Stylistic Rules Enforcement', () => {
  let mockGenerateContent: Mock;
  
  beforeEach(() => {
    vi.clearAllMocks();
    mockGenerateContent = vi.fn();
    const { GoogleGenAI } = require('@google/genai');
    GoogleGenAI.mockImplementation(() => ({
      models: { generateContent: mockGenerateContent }
    }));
  });

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

  // Expected optimized CV response (mock)
  const mockOptimizedResponse: CvData = {
    fullName: "John Doe",
    contactInfo: {
      email: "john.doe@email.com",
      phone: "555-1234",
      linkedin: "",
      location: "San Francisco, CA"
    },
    professionalSummary: "Software engineer with experience in modern web technologies. Skilled in developing applications and integrating systems. Focused on delivering effective solutions through collaborative development.",
    workExperience: [
      {
        jobTitle: "Senior Software Engineer",
        company: "Tech Innovations Inc.",
        location: "San Francisco, CA",
        dates: "Jan 2020 - Present",
        responsibilities: [
          "Developed applications using modern frameworks to create effective solutions",
          "Applied comprehensive approach to problem-solving, focusing on essential capabilities",
          "Integrated different systems through coordinated planning",
          "Implemented improvements in development methodologies",
          "Provided useful information that benefited all parties"
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
    skills: [
      "JavaScript",
      "React", 
      "Node.js",
      "Python",
      "Agile methodologies",
      "Application development",
      "System integration"
    ],
    optimizationDetails: {
      keywordsIntegrated: ["software engineer", "web technologies", "scalable applications", "system integration", "agile environment"],
      skillsAligned: ["JavaScript", "React", "Node.js", "Python", "application development"],
      experienceOptimizations: ["transformed buzzwords to concrete language", "removed corporate clichés", "focused on measurable achievements"],
      summaryTailoring: "Emphasized relevant experience with modern technologies and collaborative development while removing prohibited language styles"
    }
  };

  it('should call the Gemini API with the correct prompt including stylistic rules', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockOptimizedResponse)
    });

    await optimizeCvWithGemini(sampleCvWithProhibitedLanguage, sampleJobDescription);

    expect(mockGenerateContent).toHaveBeenCalledTimes(1);
    const callArgs = mockGenerateContent.mock.calls[0][0];
    const prompt = callArgs.contents;

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
  });

  it('should return optimized CV without prohibited language styles', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockOptimizedResponse)
    });

    const result = await optimizeCvWithGemini(sampleCvWithProhibitedLanguage, sampleJobDescription);

    // Verify prohibited terms are removed
    expect(result.professionalSummary).not.toContain('proactive');
    expect(result.professionalSummary).not.toContain('results-oriented');
    expect(result.professionalSummary).not.toContain('cutting-edge');
    expect(result.professionalSummary).not.toContain('synergistic');
    
    // Verify prohibited phrases are removed
    expect(result.professionalSummary).not.toContain('in the realm of');
    expect(result.professionalSummary).not.toContain('at the end of the day');
    
    // Check work experience for cleaned up language
    result.workExperience[0].responsibilities.forEach(responsibility => {
      expect(responsibility).not.toContain('leverage');
      expect(responsibility).not.toContain('robust');
      expect(responsibility).not.toContain('scalable solutions');
      expect(responsibility).not.toContain('holistic approach');
      expect(responsibility).not.toContain('seamless integration');
      expect(responsibility).not.toContain('paradigm shifts');
      expect(responsibility).not.toContain('actionable insights');
      expect(responsibility).not.toContain('win-win');
    });
    
    // Check skills for cleaned up terms
    result.skills.forEach(skill => {
      expect(skill).not.toContain('Thought leadership');
      expect(skill).not.toContain('Excellent communication skills');
    });
  });

  it('should maintain valid JSON response format', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockOptimizedResponse)
    });

    const result = await optimizeCvWithGemini(sampleCvWithProhibitedLanguage, sampleJobDescription);

    // Verify the response structure matches CvData interface
    expect(result).toHaveProperty('fullName');
    expect(result).toHaveProperty('contactInfo');
    expect(result.contactInfo).toHaveProperty('email');
    expect(result.contactInfo).toHaveProperty('phone');
    expect(result.contactInfo).toHaveProperty('location');
    expect(result).toHaveProperty('professionalSummary');
    expect(result).toHaveProperty('workExperience');
    expect(Array.isArray(result.workExperience)).toBe(true);
    expect(result).toHaveProperty('education');
    expect(Array.isArray(result.education)).toBe(true);
    expect(result).toHaveProperty('skills');
    expect(Array.isArray(result.skills)).toBe(true);
    expect(result).toHaveProperty('optimizationDetails');
    expect(result.optimizationDetails).toHaveProperty('keywordsIntegrated');
    expect(result.optimizationDetails).toHaveProperty('skillsAligned');
    expect(result.optimizationDetails).toHaveProperty('experienceOptimizations');
    expect(result.optimizationDetails).toHaveProperty('summaryTailoring');
  });

  it('should demonstrate before/after transformation of prohibited terms', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: JSON.stringify(mockOptimizedResponse)
    });

    const result = await optimizeCvWithGemini(sampleCvWithProhibitedLanguage, sampleJobDescription);

    // Demonstrate specific transformations
    const originalSummary = "In the realm of software engineering, I am a proactive and results-oriented professional who leverages cutting-edge technologies to create synergistic solutions.";
    const optimizedSummary = result.professionalSummary;
    
    // Verify prohibited terms are replaced
    expect(optimizedSummary).not.toContain('In the realm of');
    expect(optimizedSummary).not.toContain('proactive');
    expect(optimizedSummary).not.toContain('results-oriented');
    expect(optimizedSummary).not.toContain('leverages');
    expect(optimizedSummary).not.toContain('cutting-edge');
    expect(optimizedSummary).not.toContain('synergistic');
    
    // Verify the summary is still meaningful
    expect(optimizedSummary).toContain('Software engineer');
    expect(optimizedSummary).toContain('experience');
    expect(optimizedSummary).toContain('technologies');
    expect(optimizedSummary.length).toBeGreaterThan(50);
  });

  it('should handle API errors gracefully', async () => {
    mockGenerateContent.mockRejectedValueOnce(new Error('API error'));

    await expect(optimizeCvWithGemini(sampleCvWithProhibitedLanguage, sampleJobDescription))
      .rejects.toThrow('Failed to generate optimized CV due to an API error');
  });

  it('should handle invalid JSON responses gracefully', async () => {
    mockGenerateContent.mockResolvedValueOnce({
      text: 'invalid json'
    });

    await expect(optimizeCvWithGemini(sampleCvWithProhibitedLanguage, sampleJobDescription))
      .rejects.toThrow('The AI returned an invalid JSON format');
  });

  // Restore original process.env after tests
  afterAll(() => {
    process.env = originalProcessEnv;
  });
});