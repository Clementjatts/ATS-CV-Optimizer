This document provides a complete set of solutions to resolve all identified issues with the ATS-CV Optimizer application, including incorrect file naming, and broken download functionality.

## **1\. Dynamic PDF Filename**

**Problem:** Saved PDFs have a generic name like "description.pdf" instead of one based on the job title.

**Root Cause:** The filename option in html2pdf.js was hardcoded.

### **Permanent Solution**

Update the Gemini service to return a structured JSON object containing the job title, and then use this title to dynamically generate the filename.

#### **Step 1: Update services/geminiService.ts**

Modify the prompt to ask for a JSON response.

// In services/geminiService.ts

export const enhanceCVWithGemini \= async (cv: string, jobDescription: string): Promise\<{ title: string; cv: string }\> \=\> {  
    const prompt \= \`  
        Based on the following CV and job description, please perform two tasks:  
        1\. Extract the job title from the job description. If no specific title is found, infer a suitable one (e.g., "Software Developer").  
        2\. Optimize the CV to align perfectly with the job description.

        Return the result as a single JSON object with two keys: "title" and "cv".  
        \- The "title" key should contain only the job title string.  
        \- The "cv" key should contain the full, optimized CV text as a single string.

        CV:  
        \---  
        ${cv}  
        \---

        Job Description:  
        \---  
        ${jobDescription}  
        \---  
    \`;  
      
    try {  
        const result \= await genAI.getGenerativeModel({ model: "gemini-pro" }).generateContent(prompt);  
        const response \= await result.response;  
        const text \= response.text();

        // Clean and parse the JSON response  
        const sanitizedText \= text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();  
        const parsedResponse \= JSON.parse(sanitizedText);

        return {  
            title: parsedResponse.title || 'Optimized\_CV',  
            cv: parsedResponse.cv || 'Error: Could not generate CV.'  
        };

    } catch (error) {  
        console.error("Error calling Gemini API:", error);  
        return {  
            title: 'Error\_CV',  
            cv: 'Failed to generate CV. Please check the console for details.'  
        };  
    }  
};

#### **Step 2: Update State and Handlers in App.tsx**

Use the structured response in your component.

// In App.tsx

// 1\. Add state for the job title  
const \[jobTitle, setJobTitle\] \= useState('');

// 2\. Update the function that calls the Gemini service  
const handleEnhance \= async () \=\> {  
    setIsLoading(true);  
    const { title, cv } \= await enhanceCVWithGemini('your-base-cv-string', jobDescription);  
    setOptimizedCv(cv);  
    setJobTitle(title); // Set the title from the response  
    setIsLoading(false);  
};

// The \`handleDownloadPdf\` function (shown in Section 1\) will now automatically use this jobTitle state.

## **2\. Broken Download Functionality in CV Database**

**Problem:** The download button in the "Uploaded Files" section of the CVManager component is not working.

**Root Cause:** The handleDownload function was missing the logic to fetch the file's download URL from Firebase Storage.

### **Permanent Solution**

Implement a function to get the public URL from Firebase Storage and use it to trigger the download.

#### **Step 1: Update services/fileStorageService.ts**

Add a function to get the download URL for a file.

// In services/fileStorageService.ts  
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage'; // Add getDownloadURL  
import { app } from '../firebaseConfig';

const storage \= getStorage(app);

export const uploadCV \= async (filePath: string, fileContent: string) \=\> {  
    // ... existing code ...  
};

// Add this new function  
export const getCVDownloadUrl \= async (filePath: string): Promise\<string\> \=\> {  
  const storageRef \= ref(storage, filePath);  
  try {  
    const url \= await getDownloadURL(storageRef);  
    return url;  
  } catch (error) {  
    console.error("Error getting download URL:", error);  
    throw new Error("Could not get download URL for the file.");  
  }  
};

#### **Step 2: Update components/CVManager.tsx**

Call the new service function and trigger the download.

// In components/CVManager.tsx  
import { getCVDownloadUrl } from '../services/fileStorageService'; // 1\. Import  
import { Icons } from './icons';  
// ... other imports

// ... inside the CVManager component

// 2\. Implement the download logic  
const handleDownload \= async (filePath: string, fileName: string) \=\> {  
    try {  
        const url \= await getCVDownloadUrl(filePath);  
        const a \= document.createElement('a');  
        a.href \= url;  
        a.target \= '\_blank'; // Open in a new tab for reliability  
        document.body.appendChild(a);  
        a.click();  
        document.body.removeChild(a);  
    } catch (error) {  
        console.error("Error downloading file:", error);  
        alert("Failed to download file.");  
    }  
};

// ... in your JSX map  
\<button  
  onClick={() \=\> handleDownload(cv.filePath, cv.fileName)} // 3\. Update onClick  
  className="text-gray-400 hover:text-white"  
  aria-label="Download CV"  
\>  
  \<Icons.download className="h-5 w-5" /\>  
\</button\>  
