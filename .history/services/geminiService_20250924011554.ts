import { GoogleGenAI, Type } from "@google/genai";

// Ensure the API key is available, but do not hardcode it.
// It's expected to be set in the environment variables.
if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Define TypeScript interfaces for the modern CV template
export interface ContactInfo {
    email: string;
    phone: string;
    linkedin: string;
    location: string;
}
export interface WorkExperience {
    jobTitle: string;
    company: string;
    location: string;
    dates: string;
    responsibilities: string[];
}
export interface Education {
    institution: string;
    degree: string;
    dates: string;
}
export interface Certification {
    name: string;
    issuer: string;
    date: string;
}
export interface OptimizationDetails {
    keywordsIntegrated: string[];
    skillsAligned: string[];
    experienceOptimizations: string[];
    summaryTailoring: string;
}
export interface CvData {
    fullName: string;
    contactInfo: ContactInfo;
    professionalSummary: string;
    workExperience: WorkExperience[];
    education: Education[];
    certifications: Certification[];
    skills: string[];
    optimizationDetails: OptimizationDetails;
}

// Define the schema for the Gemini API response - Modern CV Template
const cvSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "The candidate's full name EXACTLY as it appears in the original CV - preserve exact spelling and formatting." },
        contactInfo: {
            type: Type.OBJECT,
            properties: {
                email: { type: Type.STRING, description: "Candidate's email address." },
                phone: { type: Type.STRING, description: "Candidate's phone number." },
                linkedin: { type: Type.STRING, description: "URL to LinkedIn profile, if available." },
                location: { type: Type.STRING, description: "City and State, e.g., 'San Francisco, CA'." },
            },
            required: ["email", "phone", "location"],
        },
        professionalSummary: { type: Type.STRING, description: "A compelling 3-4 sentence professional summary tailored to the job description, highlighting key achievements and value proposition." },
        workExperience: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    jobTitle: { type: Type.STRING, description: "Job title optimized for the target role" },
                    company: { type: Type.STRING, description: "Company name" },
                    location: { type: Type.STRING, description: "City, State" },
                    dates: { type: Type.STRING, description: "e.g., 'May 2020 - Present'" },
                    responsibilities: {
                        type: Type.ARRAY,
                        description: "4-6 bullet points of key achievements and responsibilities, optimized with keywords from the job description. Use action verbs and quantify results where possible.",
                        items: { type: Type.STRING }
                    },
                },
                required: ["jobTitle", "company", "dates", "responsibilities"],
            }
        },
        education: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    institution: { type: Type.STRING, description: "University or institution name" },
                    degree: { type: Type.STRING, description: "e.g., 'Bachelor of Science in Computer Science'" },
                    dates: { type: Type.STRING, description: "e.g., 'Graduated May 2020' or '2016 - 2020'" },
                },
                required: ["institution", "degree", "dates"],
            }
        },
        certifications: {
            type: Type.ARRAY,
            description: "Professional certifications relevant to the job description",
            items: {
                type: Type.OBJECT,
                properties: {
                    name: { type: Type.STRING, description: "Certification name" },
                    issuer: { type: Type.STRING, description: "Issuing organization" },
                    date: { type: Type.STRING, description: "Date obtained or expiration" }
                },
                required: ["name", "issuer", "date"]
            }
        },
        skills: {
            type: Type.ARRAY,
            description: "A comprehensive list of technical and soft skills, prioritized based on the job description requirements.",
            items: { type: Type.STRING }
        },
        optimizationDetails: {
            type: Type.OBJECT,
            description: "Specific details about how the CV was optimized for the job description",
            properties: {
                keywordsIntegrated: {
                    type: Type.ARRAY,
                    description: "List of specific keywords from the job description that were integrated into the CV",
                    items: { type: Type.STRING }
                },
                skillsAligned: {
                    type: Type.ARRAY,
                    description: "Specific skills that were aligned or emphasized based on job requirements",
                    items: { type: Type.STRING }
                },
                experienceOptimizations: {
                    type: Type.ARRAY,
                    description: "Specific ways experience descriptions were optimized for the role",
                    items: { type: Type.STRING }
                },
                summaryTailoring: {
                    type: Type.STRING,
                    description: "Specific explanation of how the professional summary was tailored to the position"
                }
            },
            required: ["keywordsIntegrated", "skillsAligned", "experienceOptimizations", "summaryTailoring"]
        }
    },
    required: ["fullName", "contactInfo", "professionalSummary", "workExperience", "education", "certifications", "skills", "optimizationDetails"],
};


export async function optimizeCvWithGemini(
  currentUserCv: string,
  jobDescription: string,
): Promise<CvData> {

  const prompt = `
You are a world-class professional CV writer and Applicant Tracking System (ATS) optimization expert. Your task is to create a modern, professional CV using a standardized template that perfectly aligns with a specific job description. **CRITICAL: Use British English spelling and terminology throughout the entire CV (organised, realised, colour, centre, etc.).**

**You will be given two inputs:**
1.  **[CURRENT CV]**: The user's existing CV content.
2.  **[JOB DESCRIPTION]**: The target job description.

**CRITICAL INSTRUCTIONS:**
1.  **Extract and Transform:** Analyze the [CURRENT CV] to extract all relevant information and transform it into a modern, professional format using the standardized template structure. **IMPORTANT: Extract the candidate's full name EXACTLY as it appears in the original CV - do not modify, correct, or change the spelling in any way.**
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
7.  **Direct Language Requirement:** Use direct, concrete language. Replace any prohibited terms with simpler, more common alternatives. Retain only essential keywords. **IMPORTANT: Use British English spelling and terminology throughout (e.g., "organised" not "organized", "realised" not "realized", "colour" not "color", "centre" not "center").**
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
   - Any buzzwords, jargon, or corporate clichés

**STYLE ENFORCEMENT:** The optimized content MUST strictly adhere to these stylistic rules. Any violation will result in rejection of the CV. Use clear, concise, professional language that focuses on concrete achievements and measurable results.

**IMPORTANT:** Do not invent experience or skills the user does not possess. Extract information from their existing CV and enhance it for the target role.

---

**[CURRENT CV]**
${currentUserCv}

---

**[JOB DESCRIPTION]**
${jobDescription}
`;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: cvSchema,
        }
    });
    
    const jsonText = response.text.trim();
    // The Gemini API with responseSchema should return a valid JSON string.
    // We parse it to ensure it's a valid object conforming to CvData.
    const parsedData = JSON.parse(jsonText);
    return parsedData as CvData;

  } catch (error) {
    console.error("Error calling Gemini API or parsing response:", error);
    if (error instanceof SyntaxError) {
        throw new Error("The AI returned an invalid JSON format. Please try again.");
    }
    if (error instanceof Error && error.message.includes('API key not valid')) {
         throw new Error("The API key is invalid. Please check your configuration.");
    }
    throw new Error("Failed to generate optimized CV due to an API error.");
  }
}

export async function extractTextFromImagesWithGemini(
  base64Images: string[],
): Promise<string> {

  const prompt = "You are an Optical Character Recognition (OCR) expert. Extract all text content from these document pages in the order they are provided. Combine the text from all pages into a single block of text. Preserve the original structure, paragraphs, and line breaks as best as possible.";

  const imageParts = base64Images.map((img) => ({
    inlineData: {
      data: img,
      mimeType: 'image/jpeg',
    },
  }));

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: {
            parts: [
                { text: prompt },
                ...imageParts
            ]
        },
    });
    return response.text;
  } catch (error) {
    console.error("Error calling Gemini API for OCR:", error);
    if (error instanceof Error && error.message.includes('API key not valid')) {
         throw new Error("The API key is invalid. Please check your configuration.");
    }
    throw new Error("Failed to extract text from the document image using AI.");
  }
}