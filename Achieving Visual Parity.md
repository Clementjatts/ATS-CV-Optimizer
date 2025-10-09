# **Guide: Achieving Visual Parity with @react-pdf/renderer**

You have successfully migrated to the new library. The final step is to replicate the styles from your webpage's CSS within the PDF component's special StyleSheet. The @react-pdf/renderer library does not read external CSS files; all styling must be defined within the component itself.

This guide provides the complete, styled code for CVDocument.tsx to match the professional appearance of your on-screen CVManager component.

### **Step 1: Update components/CVDocument.tsx**

Replace the entire content of components/CVDocument.tsx with the code below. I have translated the Tailwind CSS classes from your CVManager into the StyleSheet syntax required by @react-pdf/renderer.

**Key Changes in this Code:**

* **Fonts:** Added styles for bolding, sizing, and transforms (e.g., textTransform: 'uppercase').  
* **Layout:** Implemented flexDirection: 'row' and justifyContent: 'space-between' to correctly position elements like the job title and date.  
* **Borders:** Added the borderBottom style to section titles to match the webpage.  
* **Spacing:** Carefully adjusted marginBottom and padding to match the spacing of the original design.  
* **Key Skills Grid:** Re-created the two-column grid using flexWrap and width: '50%'.  
* **Page Break Control:** The wrap={false} prop remains on each job entry \<View\>, which is the key to preventing awkward page breaks within a single job description while still allowing the document to flow naturally between them.

// components/CVDocument.tsx

import React from 'react';  
import { Page, Text, View, Document, StyleSheet } from '@react--pdf/renderer';

// \--- STYLESHEET: Translating Tailwind CSS to React-PDF \---  
const styles \= StyleSheet.create({  
  page: {  
    paddingTop: 35,  
    paddingBottom: 65,  
    paddingHorizontal: 35,  
    fontFamily: 'Helvetica',  
    fontSize: 10,  
    color: '\#1f2937', // Equivalent to text-gray-800  
  },  
  // Header Styles  
  header: {  
    textAlign: 'center',  
    marginBottom: 20,  
  },  
  name: {  
    fontSize: 28,  
    fontWeight: 'bold',  
    textTransform: 'uppercase',  
    letterSpacing: 2,  
  },  
  contactInfo: {  
    fontSize: 9,  
    color: '\#4b5563', // text-gray-600  
    marginTop: 4,  
  },  
  // Section Styles  
  section: {  
    marginBottom: 12,  
  },  
  sectionTitle: {  
    fontSize: 14,  
    fontWeight: 'bold',  
    borderBottomWidth: 1.5,  
    borderBottomColor: '\#9ca3af', // border-gray-400  
    paddingBottom: 2,  
    marginBottom: 8,  
  },  
  // Professional Experience Styles  
  entry: {  
    marginBottom: 12,  
  },  
  entryHeader: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'baseline',  
    marginBottom: 2,  
  },  
  jobTitle: {  
    fontSize: 11,  
    fontWeight: 'bold',  
  },  
  date: {  
    fontSize: 9,  
    color: '\#4b5563',  
    fontWeight: 'medium',  
  },  
  company: {  
    fontSize: 10,  
    fontStyle: 'italic',  
  },  
  responsibilitiesList: {  
    marginTop: 4,  
  },  
  responsibility: {  
    flexDirection: 'row',  
    marginBottom: 3,  
  },  
  bullet: {  
    width: 10,  
    fontSize: 10,  
  },  
  responsibilityText: {  
    flex: 1,  
  },  
  // Education Styles  
  educationEntry: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    alignItems: 'baseline',  
    marginBottom: 5,  
  },  
  degreeInfo: {},  
  institution: {  
    fontSize: 11,  
    fontWeight: 'bold',  
  },  
  degree: {  
    fontStyle: 'italic',  
  },  
  // Key Skills Styles  
  skillsGrid: {  
    flexDirection: 'row',  
    flexWrap: 'wrap',  
    marginTop: 4,  
  },  
  skill: {  
    width: '50%',  
    marginBottom: 3,  
  },  
});

// \--- THE FULLY STYLED CV DOCUMENT COMPONENT \---  
export const CVDocument \= ({ cvData }) \=\> (  
  \<Document\>  
    \<Page size="A4" style={styles.page}\>  
      {/\* Header \*/}  
      \<View style={styles.header}\>  
        \<Text style={styles.name}\>{cvData.name}\</Text\>  
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
          \<View key={index} style={styles.entry} wrap={false}\>  
            \<View style={styles.entryHeader}\>  
              \<Text style={styles.jobTitle}\>{exp.title}\</Text\>  
              \<Text style={styles.date}\>{exp.date}\</Text\>  
            \</View\>  
            \<Text style={styles.company}\>{exp.company}\</Text\>  
            \<View style={styles.responsibilitiesList}\>  
              {exp.responsibilities.map((res, i) \=\> (  
                \<View key={i} style={styles.responsibility}\>  
                  \<Text style={styles.bullet}\>• \</Text\>  
                  \<Text style={styles.responsibilityText}\>{res}\</Text\>  
                \</View\>  
              ))}  
            \</View\>  
          \</View\>  
        ))}  
      \</View\>  
        
      {/\* Education \*/}  
      \<View style={styles.section}\>  
        \<Text style={styles.sectionTitle}\>EDUCATION\</Text\>  
        {cvData.education.map((edu, index) \=\> (  
          \<View key={index} style={styles.educationEntry}\>  
            \<View style={styles.degreeInfo}\>  
              \<Text style={styles.institution}\>{edu.institution}\</Text\>  
              \<Text style={styles.degree}\>{edu.degree}\</Text\>  
            \</View\>  
            \<Text style={styles.date}\>{edu.date}\</Text\>  
          \</View\>  
        ))}  
      \</View\>

      {/\* Key Skills \*/}  
      \<View style={styles.section}\>  
        \<Text style={styles.sectionTitle}\>KEY SKILLS & COMPETENCIES\</Text\>  
        \<View style={styles.skillsGrid}\>  
            {cvData.keySkills.map((skill, index) \=\> (  
              \<View key={index} style={styles.skill}\>  
                \<Text\>• {skill}\</Text\>  
              \</View\>  
            ))}  
        \</View\>  
      \</View\>  
    \</Page\>  
  \</Document\>  
);

### **Step 2: No Changes Needed in App.tsx**

Your implementation of the PDFDownloadLink in App.tsx is correct. No further changes are needed there. Once you save the CVDocument.tsx file above, the "Download PDF" link will automatically generate the new, fully styled document.

With these changes, your generated PDF will now accurately reflect the design of your web preview and will handle page breaks gracefully and predictably.