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
export interface CvData {
    fullName: string;
    contactInfo: ContactInfo;
    professionalSummary: string;
    workExperience: WorkExperience[];
    education: Education[];
    certifications: Certification[];
    skills: string[];
}

// Define the schema for the Gemini API response - Modern CV Template
const cvSchema = {
    type: Type.OBJECT,
    properties: {
        fullName: { type: Type.STRING, description: "The candidate's full name." },
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
        }
    },
    required: ["fullName", "contactInfo", "professionalSummary", "workExperience", "education", "certifications", "skills"],
};


export async function optimizeCvWithGemini(
  currentUserCv: string,
  jobDescription: string,
): Promise<CvData> {

  const prompt = `
You are a world-class professional CV writer and Applicant Tracking System (ATS) optimization expert. Your task is to rewrite a user's CV to perfectly align with a specific job description while PRESERVING ALL ORIGINAL SECTIONS.

**You will be given two inputs:**
1.  **[CURRENT CV]**: The user's existing CV content.
2.  **[JOB DESCRIPTION]**: The target job description.

**CRITICAL INSTRUCTIONS:**
1.  **Preserve Structure:** Identify ALL sections in the original CV (Summary, Work Experience, Education, Skills, Certifications, Projects, Languages, Awards, Publications, etc.) and include them in the optimized version.
2.  **Analyze and Extract:** Thoroughly analyze the [CURRENT CV] to understand the user's experience, skills, and qualifications. Also, analyze the [JOB DESCRIPTION] to identify all key skills, qualifications, technologies, and responsibilities.
3.  **Rewrite and Integrate:** Modify the user's CV content by strategically and naturally weaving in the keywords from the job description. Enhance bullet points with quantifiable achievements and action verbs that match the target role.
4.  **Ensure Truthfulness:** The new content must be truthful and accurately reflect the user's experience. Do not invent experience or skills the user does not possess.
5.  **Populate the JSON:** Based on the rewritten content, populate the provided JSON schema. For any sections that don't fit the standard categories (Work Experience, Education, Skills), include them in the "additionalSections" array with their original titles and optimized content.

**IMPORTANT:** Do not omit any sections from the original CV. If the original CV has sections like "Certifications", "Projects", "Languages", "Awards", etc., these must be preserved and optimized in the additionalSections array.

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