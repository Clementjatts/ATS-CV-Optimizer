# **PDF Layout and Formatting Fixes**

This document provides specific technical solutions to address the layout, spacing, and page-breaking issues identified in the generated PDF.

### **1\. Reducing Gaps Between Sections**

Diagnosis:  
You're right, the vertical spacing between sections like "PROFESSIONAL SUMMARY" and "PROFESSIONAL EXPERIENCE" is too large, creating an unbalanced look. This is controlled by the top and bottom margins on your section headers in the CSS.  
Solution:  
Reduce the vertical margin on the section title elements within your index.css file. Find the style that targets the section headers (it's likely an h2 or a custom class) and lower the margin-top value.  
**In index.css, update the following:**

/\* Find a selector similar to this, which targets your section titles \*/  
.section-title { /\* Or whatever class you use for the headers \*/  
  font-size: 1.125rem; /\* 18px \*/  
  font-weight: 700;  
  border-bottom: 1px solid \#e5e7eb;  
  padding-bottom: 0.25rem;  
  /\* REDUCE this value to control the space above the title \*/  
  margin-top: 0.75rem; /\* This was likely 1.5rem or higher, try reducing it \*/  
}

**Recommendation:** A margin-top of 0.75rem (12px) or 1rem (16px) is usually sufficient to create separation without leaving a large empty gap.

### **2\. Restructuring the "Professional Experience" Section**

Diagnosis:  
The current single-line, comma-separated format for job title, company, and date is not visually clean. Additionally, long job titles like "Safety & Support Operative (Door Supervisor)" are using too much space.  
**Solutions:**

A) Improve the Layout:  
Restructure the HTML/JSX in your CVManager.tsx to display the experience details in a more organized, multi-line format. Use flexbox to align the elements properly.  
**In components/CVManager.tsx, modify the rendering of each experience item:**

// Inside the .map() for your professionalExperience array  
\<div key={index} className="mb-4 break-inside-avoid"\> {/\* Add break-inside-avoid here \*/}  
  {/\* Flex container for the main heading \*/}  
  \<div className="flex justify-between items-baseline"\>  
    \<h3 className="font-bold text-lg"\>{exp.title}\</h3\>  
    \<p className="text-sm text-gray-600 font-medium"\>{exp.date}\</p\>  
  \</div\>  
  {/\* Sub-heading for the company \*/}  
  \<p className="italic text-md text-gray-800"\>{exp.company}\</p\>  
  {/\* Responsibilities list \*/}  
  \<ul className="list-disc list-inside mt-2 text-sm"\>  
    {exp.responsibilities.map((res, i) \=\> (  
      \<li key={i} className="mb-1"\>{res}\</li\>  
    ))}  
  \</ul\>  
\</div\>

B) Use AI to Simplify Job Titles:  
You can instruct the Gemini API to process and simplify job titles. Update your prompt to ask it to select the most relevant title when multiple are provided.  
**In services/geminiService.ts, enhance your prompt:**

// ... (inside your getCVAnalysis function)  
const prompt \= \`  
  Analyze the CV text and return a JSON object with "feedback", "skills", and "experience".  
    
  For the "experience" array, each object should have a "title". If a job title contains multiple roles (e.g., "Role A (Role B)"), identify and return only the primary or most senior-sounding role. For "Safety & Support Operative (Door Supervisor)", "Door Supervisor" is more direct.

  CV Text:  
  \---  
  ${cvText}  
  \---  
\`;  
// ...

### **3\. Improving Page Break Logic**

Diagnosis:  
html2pdf.js sometimes moves an entire section to the next page to avoid splitting it, which creates large empty spaces. The goal is to allow breaks between logical blocks (like individual job entries) but not within them.  
Solution:  
Use the CSS property break-inside: avoid;. This tells the PDF generator to do its best not to split the element it's applied to. Apply this class to the container of each logical unit you want to keep together.  
**A) In index.css, add this utility class:**

.break-inside-avoid {  
  break-inside: avoid;  
  page-break-inside: avoid; /\* Legacy property for broader compatibility \*/  
}

B) In components/CVManager.tsx, apply this class:  
Apply the .break-inside-avoid class to the parent div of each professional experience entry and each education entry. This prevents a single job history from being awkwardly split across two pages.  
// For Professional Experience  
cvData.professionalExperience.map((exp, index) \=\> (  
  \<div key={index} className="mb-4 break-inside-avoid"\> {/\* Applied here \*/}  
    {/\* ... content ... \*/}  
  \</div\>  
))

// For Education  
cvData.education.map((edu, index) \=\> (  
  \<div key={index} className="mb-2 break-inside-avoid"\> {/\* And here \*/}  
    {/\* ... content ... \*/}  
  \</div\>  
))

### **4\. Fixing Broken Text in "Key Skills"**

Diagnosis:  
The "Key Skills" text is being cut in half because the page break is occurring directly through a line of text. This is a rendering artifact where the library is essentially "slicing" the HTML canvas.  
Solution:  
The fix is the same as for the section breaks: ensure that the individual items within the flex container cannot be split. Apply the .break-inside-avoid class to each skill item.  
**In components/CVManager.tsx, update the skills section rendering:**

\<div className="flex flex-wrap"\>  
  {cvData.keySkills.map((skill, index) \=\> (  
    \<div key={index} className="w-1/2 p-1 break-inside-avoid"\> {/\* Applied here \*/}  
      \<p className="text-sm"\>{skill}\</p\>  
    \</div\>  
  ))}  
\</div\>

This ensures that if a break needs to happen, it will happen *between* skill items, not through the middle of one, resolving the text-cutting issue.