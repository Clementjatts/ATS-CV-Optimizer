# **Guide: Migrating from html2pdf.js to @react-pdf/renderer**

The recurring page-break issues with html2pdf.js stem from its core mechanism: it renders your HTML to a canvas (like a screenshot) and then converts that image to a PDF. This process is notoriously bad at understanding element flow, heights, and CSS break rules, which is why our previous attempts have been so unpredictable.

The definitive solution is to use a library that builds the PDF directly from React components, giving us full control. **@react-pdf/renderer** is the industry standard for this in the React ecosystem.

This guide will walk you through the migration.

### **Step 1: Install the New Library**

First, add the library to your project.

npm install @react-pdf/renderer \--save

You can now **uninstall html2pdf.js** as it will no longer be needed: npm uninstall html2pdf.js.

### **Step 2: Create a New CVDocument Component**

Instead of rendering HTML in CVManager.tsx, we will create a new component that defines the PDF structure using components from @react-pdf/renderer.

Create a new file: components/CVDocument.tsx

// components/CVDocument.tsx

import React from 'react';  
import { Page, Text, View, Document, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts if you have custom ones (optional, but good for styling)  
// Font.register({ family: 'Open Sans', fonts: \[...\] });

// Create styles using a StyleSheet object \- this is like CSS-in-JS  
const styles \= StyleSheet.create({  
  page: {  
    padding: 30,  
    fontFamily: 'Helvetica', // Default font  
    fontSize: 10,  
  },  
  header: {  
    textAlign: 'center',  
    marginBottom: 20,  
  },  
  name: {  
    fontSize: 24,  
    fontWeight: 'bold',  
  },  
  contactInfo: {  
    fontSize: 10,  
  },  
  section: {  
    marginBottom: 10,  
  },  
  sectionTitle: {  
    fontSize: 14,  
    fontWeight: 'bold',  
    borderBottomWidth: 1,  
    borderBottomColor: '\#666',  
    marginBottom: 8,  
    paddingBottom: 2,  
  },  
  entry: {  
    marginBottom: 10,  
  },  
  entryHeader: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    marginBottom: 2,  
  },  
  jobTitle: {  
    fontSize: 12,  
    fontWeight: 'bold',  
  },  
  date: {  
    fontSize: 10,  
    color: '\#333',  
  },  
  company: {  
    fontStyle: 'italic',  
    marginBottom: 4,  
  },  
  responsibility: {  
    flexDirection: 'row',  
    marginBottom: 2,  
  },  
  bullet: {  
    width: 10,  
    fontSize: 10,  
  },  
  responsibilityText: {  
    flex: 1,  
  },  
  skillsGrid: {  
    flexDirection: 'row',  
    flexWrap: 'wrap',  
  },  
  skill: {  
    width: '50%',  
    marginBottom: 2,  
  },  
});

// This is your new PDF template component  
export const CVDocument \= ({ cvData }) \=\> (  
  \<Document\>  
    \<Page size="A4" style={styles.page}\>  
      {/\* Header \*/}  
      \<View style={styles.header}\>  
        \<Text style={styles.name}\>{cvData.name.toUpperCase()}\</Text\>  
        \<Text style={styles.contactInfo}\>{cvData.location} | {cvData.email} | {cvData.phone}\</Text\>  
      \</View\>

      {/\* Professional Summary \*/}  
      \<View style={styles.section}\>  
        \<Text style={styles.sectionTitle}\>PROFESSIONAL SUMMARY\</Text\>  
        \<Text\>{cvData.professionalSummary}\</Text\>  
      \</View\>

      {/\* Professional Experience \*/}  
      \<View style={styles.section}\>  
        \<Text style={styles.sectionTitle}\>PROFESSIONAL EXPERIENCE\</Text\>  
        {cvData.professionalExperience.map((exp, index) \=\> (  
          // The \`wrap={false}\` prop on this View is KEY.  
          // It prevents this job entry from being split. But because the list items  
          // below are individual Text elements, the list itself CAN break cleanly between items.  
          \<View key={index} style={styles.entry} wrap={false}\>  
            \<View style={styles.entryHeader}\>  
              \<Text style={styles.jobTitle}\>{exp.title}\</Text\>  
              \<Text style={styles.date}\>{exp.date}\</Text\>  
            \</View\>  
            \<Text style={styles.company}\>{exp.company}\</Text\>  
            {exp.responsibilities.map((res, i) \=\> (  
              \<View key={i} style={styles.responsibility}\>  
                \<Text style={styles.bullet}\>•\</Text\>  
                \<Text style={styles.responsibilityText}\>{res}\</Text\>  
              \</View\>  
            ))}  
          \</View\>  
        ))}  
      \</View\>  
        
      {/\* Education \*/}  
      \<View style={styles.section}\>  
         {/\* ... Rebuild Education similarly ... \*/}  
      \</View\>

      {/\* Key Skills \*/}  
      \<View style={styles.section}\>  
        \<Text style={styles.sectionTitle}\>KEY SKILLS & COMPETENCIES\</Text\>  
        \<View style={styles.skillsGrid}\>  
            {cvData.keySkills.map((skill, index) \=\> (  
                \<Text key={index} style={styles.skill}\>• {skill}\</Text\>  
            ))}  
        \</View\>  
      \</View\>  
    \</Page\>  
  \</Document\>  
);

### **Step 3: Update App.tsx to Use the New Library**

Now, we replace the old handlePrint button with a PDFDownloadLink component. This component will render your CVDocument in the background and provide a download link to the user.

// In App.tsx

import React from 'react';  
import { PDFDownloadLink } from '@react-pdf/renderer';  
import { CVDocument } from './components/CVDocument';  
// ... other imports

const App \= () \=\> {  
  // ... your existing state and logic ...

  // You can now DELETE the entire handlePrint function

  return (  
    \<div className="min-h-screen bg-gray-100 flex flex-col items-center p-4"\>  
      {/\* ... your other UI elements ... \*/}

      {/\* NEW DOWNLOAD BUTTON \*/}  
      {cvData ? (  
        \<PDFDownloadLink  
          document={\<CVDocument cvData={cvData} /\>}  
          fileName="cv\_document.pdf"  
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"  
        \>  
          {({ blob, url, loading, error }) \=\>  
            loading ? 'Generating PDF...' : 'Download PDF'  
          }  
        \</PDFDownloadLink\>  
      ) : null}

      {/\* The CVManager is now only for on-screen display \*/}  
      \<div className="w-full max-w-4xl mt-4 bg-white shadow-lg"\>  
        {cvData && \<CVManager cvData={cvData} /\>}  
      \</div\>  
    \</div\>  
  );  
};

export default App;

### **Why This Is Better**

1. **Direct Rendering:** This method builds the PDF directly. It does not take a "screenshot." This means layout calculations are precise and reliable.  
2. **Explicit Page-Break Control:** The wrap={false} prop on a \<View\> gives you a powerful and predictable way to tell the renderer, "keep this entire block together." Because the list items inside are separate elements, the renderer can still intelligently break *between* them if the whole block doesn't fit on the page, solving the large gap issue.  
3. **React-Native Syntax:** The styling and component structure will feel natural within a React project.  
4. **Maintainability:** Your PDF template is now just another React component, making it easier to manage and update.

This refactor is a one-time effort that will eliminate the page-breaking problems permanently and give you a much more powerful and flexible PDF generation system.