# **CV Template Improvement Plan**

Here is a review of the "Modern" CV template based on the provided PDF and project files, along with a plan to address the identified issues and enhance its visual appeal.

### **1\. Fix Name Display Wrapping**

Problem:  
The applicant's first and last names are rendered as separate elements, which is good for stacking. However, a long surname can wrap onto a new line, breaking the name apart (e.g., "ADEG-BENRO" becomes "ADEG-" and "BENRO").  
Solution:  
Keep the first name and last name as separate \<h1\> tags to maintain the stacked layout. Apply the white-space: nowrap CSS property to each tag individually. This will ensure that the full first name appears on one line and the full last name appears on the line below it, without either one breaking.  
**File to Edit:** components/templates/ModernTemplate.tsx

**Original Code:**

\<h1 className="text-4xl font-bold tracking-wider name-heading"\>  
  {cvData.firstName.toUpperCase()}  
\</h1\>  
\<h1 className="text-4xl font-bold tracking-wider name-heading"\>  
  {cvData.lastName.toUpperCase()}  
\</h1\>

**Proposed Change:**

\<h1 className="text-4xl font-bold tracking-wider name-heading" style={{ whiteSpace: 'nowrap' }}\>  
  {cvData.firstName.toUpperCase()}  
\</h1\>  
\<h1 className="text-4xl font-bold tracking-wider name-heading" style={{ whiteSpace: 'nowrap' }}\>  
  {cvData.lastName.toUpperCase()}  
\</h1\>

### **2\. Ensure Contact Icons are Visible**

Problem:  
The contact icons (phone, email, location) are not appearing in the final PDF. This is likely because the PDF generation library is struggling to render the SVG components imported from lucide-react.  
Solution:  
To make the rendering more reliable, replace the imported icon components with inline SVG code. This embeds the icon graphics directly into the HTML, guaranteeing they will be captured when the PDF is generated.  
**File to Edit:** components/templates/ModernTemplate.tsx

**Original Code:**

import { Phone, Mail, MapPin } from 'lucide-react';  
// ...  
\<div className="contact-item"\>  
  \<Phone size={16} /\>  
  \<span\>{cvData.phone}\</span\>  
\</div\>  
\<div className="contact-item"\>  
  \<Mail size={16} /\>  
  \<span\>{cvData.email}\</span\>  
\</div\>  
\<div className="contact-item"\>  
  \<MapPin size={16} /\>  
  \<span\>{cvData.address}\</span\>  
\</div\>

Proposed Change:  
(No import is needed for this approach)  
\<div className="flex items-center mb-2"\>  
  \<svg xmlns="\[http://www.w3.org/2000/svg\](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0"\>\<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"\>\</path\>\</svg\>  
  \<span\>{cvData.phone}\</span\>  
\</div\>  
\<div className="flex items-center mb-2"\>  
  \<svg xmlns="\[http://www.w3.org/2000/svg\](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0"\>\<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"\>\</path\>\<polyline points="22,6 12,13 2,6"\>\</polyline\>\</svg\>  
  \<span\>{cvData.email}\</span\>  
\</div\>  
\<div className="flex items-center mb-2"\>  
  \<svg xmlns="\[http://www.w3.org/2000/svg\](http://www.w3.org/2000/svg)" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 flex-shrink-0"\>\<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"\>\</path\>\<circle cx="12" cy="10" r="3"\>\</circle\>\</svg\>  
  \<span\>{cvData.address}\</span\>  
\</div\>

### **3\. Redesign the Skills Section**

Problem:  
The skills are currently displayed in a simple two-column text list, which is functional but not visually engaging.  
Solution:  
Display each skill as a styled "pill" or "badge." This modern UI pattern improves scannability and adds a clean, professional aesthetic. Using a flexbox with flex-wrap will create a responsive grid that adapts to the number and length of skills.  
**File to Edit:** components/templates/ModernTemplate.tsx

**Original Code:**

\<div className="grid grid-cols-2 gap-x-4"\>  
  {cvData.skills.map((skill, index) \=\> (  
    \<p key={index} className="text-sm"\>{skill}\</p\>  
  ))}  
\</div\>

**Proposed Change:**

\<div className="flex flex-wrap gap-2 mt-2"\>  
  {cvData.skills.map((skill, index) \=\> (  
    \<span key={index} className="bg-gray-200 text-gray-800 text-xs font-semibold px-3 py-1 rounded-full"\>  
      {skill}  
    \</span\>  
  ))}  
\</div\>

### **4\. General Aesthetic Improvements**

To elevate the overall design, here are a few suggestions for improving the color palette, typography, and spacing.

**a) Introduce a Modern Font and Color Scheme**

Softer colors and a clean, modern font can make the document easier to read and more professional.

**File to Edit:** index.html (to add the font) and index.css (for styles)

**Add to \<head\> in index.html:**

\<link rel="preconnect" href="\[https://fonts.googleapis.com\](https://fonts.googleapis.com)"\>  
\<link rel="preconnect" href="\[https://fonts.gstatic.com\](https://fonts.gstatic.com)" crossorigin\>  
\<link href="\[https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700\&display=swap\](https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700\&display=swap)" rel="stylesheet"\>

**Add to index.css:**

body {  
  font-family: 'Inter', sans-serif;  
  \-webkit-font-smoothing: antialiased;  
  \-moz-osx-font-smoothing: grayscale;  
}

.modern-template .name-heading {  
  color: \#2c3e50; /\* Dark Slate Blue \*/  
}

.modern-template .left-column {  
  background-color: \#f4f6f8; /\* Light Gray \*/  
}

.modern-template h2 {  
  color: \#2c3e50;  
  border-bottom: 2px solid \#3498db; /\* Accent Blue \*/  
  padding-bottom: 4px;  
  margin-bottom: 12px;  
  text-transform: uppercase;  
  letter-spacing: 0.05em;  
  font-size: 1.125rem; /\* 18px \*/  
}

**b) Refine Layout and Spacing**

Adjust the main layout in ModernTemplate.tsx to use the new styles and create a more balanced and readable structure with better whitespace.

**File to Edit:** components/templates/ModernTemplate.tsx

**Example of an updated structure:**

\<div className="modern-template a4-page bg-white"\>  
  \<div className="flex h-full"\>  
    {/\* Left Column (Sidebar) \*/}  
    \<div className="w-1/3 left-column p-8"\>  
      \<div className="text-left mb-10"\>  
        \<h1 className="text-3xl font-bold tracking-wide name-heading" style={{ whiteSpace: 'nowrap' }}\>  
          {cvData.firstName.toUpperCase()}  
        \</h1\>  
        \<h1 className="text-3xl font-bold tracking-wide name-heading" style={{ whiteSpace: 'nowrap' }}\>  
          {cvData.lastName.toUpperCase()}  
        \</h1\>  
        \<p className="text-md text-gray-600 tracking-wider mt-2"\>{cvData.jobTitle}\</p\>  
      \</div\>  
      \<div className="mb-8"\>  
        \<h2 className="text-lg font-semibold"\>Contact\</h2\>  
        {/\* Contact items with inline SVGs \*/}  
      \</div\>  
      \<div\>  
        \<h2 className="text-lg font-semibold"\>Key Skills\</h2\>  
        {/\* Skills rendered as pills \*/}  
      \</div\>  
    \</div\>  
      
    {/\* Right Column (Main Content) \*/}  
    \<div className="w-2/3 p-8"\>  
      \<section className="mb-8"\>  
        \<h2 className="text-xl font-bold"\>Professional Summary\</h2\>  
        \<p className="text-sm leading-relaxed text-gray-700"\>{cvData.summary}\</p\>  
      \</section\>  
      \<section className="mb-8"\>  
        \<h2 className="text-xl font-bold"\>Professional Experience\</h2\>  
        {/\* Experience items... \*/}  
      \</section\>  
      \<section\>  
        \<h2 className="text-xl font-bold"\>Education\</h2\>  
        {/\* Education items... \*/}  
      \</section\>  
    \</div\>  
  \</div\>  
\</div\>

These changes should address all the points you raised and result in a much-improved, polished, and aesthetically pleasing CV template.