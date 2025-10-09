# **Guide: Implementing Multiple CV Templates**

Now that the core PDF generation is stable, we can leverage the power of @react-pdf/renderer to offer multiple CV designs. This involves structuring your components so you can easily add new templates in the future and allowing the user to select which one they'd like to use.

This guide will walk you through creating a new template and wiring up the UI to select it.

### **Step 1: Restructure Your Template Components**

To keep the project organized, let's create a dedicated folder for the PDF templates.

1. Create a new folder: components/templates/.  
2. **Move** your existing components/CVDocument.tsx file into this new folder.  
3. **Rename** components/templates/CVDocument.tsx to components/templates/ClassicTemplate.tsx. This will be your first template.

Your folder structure should now look like this:

components/  
├── templates/  
│   └── ClassicTemplate.tsx  
├── CVManager.tsx  
└── icons.tsx

### **Step 2: Create a Second Template ("Modern")**

Let's create a new template with a different layout, for example, a two-column design with a sidebar.

Create a new file: components/templates/ModernTemplate.tsx

This component will have its own StyleSheet to define its unique look. Notice the use of \<View\> with flexDirection: 'row' to create the main columns.

// components/templates/ModernTemplate.tsx

import React from 'react';  
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

const styles \= StyleSheet.create({  
  page: {  
    flexDirection: 'row',  
    backgroundColor: '\#FFFFFF',  
    fontFamily: 'Helvetica',  
  },  
  sidebar: {  
    width: '30%',  
    padding: 25,  
    backgroundColor: '\#f3f4f6', // A light gray  
    color: '\#1f2937',  
  },  
  mainContent: {  
    width: '70%',  
    padding: 25,  
  },  
  name: {  
    fontSize: 22,  
    fontWeight: 'bold',  
    textTransform: 'uppercase',  
    marginBottom: 5,  
  },  
  title: {  
    fontSize: 12,  
    color: '\#4b5563',  
    marginBottom: 20,  
  },  
  sidebarSection: {  
    marginBottom: 15,  
  },  
  sidebarTitle: {  
    fontSize: 12,  
    fontWeight: 'bold',  
    marginBottom: 5,  
    borderBottomWidth: 1,  
    borderBottomColor: '\#6b7280',  
    paddingBottom: 2,  
  },  
  contactText: {  
    fontSize: 9,  
    marginBottom: 3,  
  },  
  skill: {  
    fontSize: 9,  
    marginBottom: 3,  
  },  
  mainSection: {  
    marginBottom: 15,  
  },  
  sectionTitle: {  
    fontSize: 14,  
    fontWeight: 'bold',  
    color: '\#111827',  
    marginBottom: 10,  
  },  
  entry: {  
    marginBottom: 12,  
  },  
  entryHeader: {  
    flexDirection: 'row',  
    justifyContent: 'space-between',  
    marginBottom: 2,  
  },  
  jobTitle: {  
    fontSize: 11,  
    fontWeight: 'bold',  
  },  
  date: {  
    fontSize: 9,  
    color: '\#4b5563',  
  },  
  company: {  
    fontSize: 10,  
    fontStyle: 'italic',  
    marginBottom: 4,  
  },  
  responsibility: {  
    fontSize: 10,  
    marginBottom: 3,  
  },  
});

export const ModernTemplate \= ({ cvData }) \=\> (  
  \<Document\>  
    \<Page size="A4" style={styles.page}\>  
      {/\* Sidebar (Left Column) \*/}  
      \<View style={styles.sidebar}\>  
        \<Text style={styles.name}\>{cvData.name}\</Text\>  
        \<Text style={styles.title}\>{cvData.professionalExperience\[0\]?.title || 'Professional'}\</Text\>

        \<View style={styles.sidebarSection}\>  
          \<Text style={styles.sidebarTitle}\>Contact\</Text\>  
          \<Text style={styles.contactText}\>{cvData.phone}\</Text\>  
          \<Text style={styles.contactText}\>{cvData.email}\</Text\>  
          \<Text style={styles.contactText}\>{cvData.location}\</Text\>  
        \</View\>

        \<View style={styles.sidebarSection}\>  
          \<Text style={styles.sidebarTitle}\>Key Skills\</Text\>  
          {cvData.keySkills.map((skill, index) \=\> (  
            \<Text key={index} style={styles.skill}\>• {skill}\</Text\>  
          ))}  
        \</View\>  
      \</View\>

      {/\* Main Content (Right Column) \*/}  
      \<View style={styles.mainContent}\>  
        \<View style={styles.mainSection}\>  
          \<Text style={styles.sectionTitle}\>Professional Summary\</Text\>  
          \<Text style={styles.responsibility}\>{cvData.professionalSummary}\</Text\>  
        \</View\>

        \<View style={styles.mainSection}\>  
          \<Text style={styles.sectionTitle}\>Professional Experience\</Text\>  
          {cvData.professionalExperience.map((exp, index) \=\> (  
            \<View key={index} style={styles.entry} wrap={false}\>  
              \<View style={styles.entryHeader}\>  
                \<Text style={styles.jobTitle}\>{exp.title}\</Text\>  
                \<Text style={styles.date}\>{exp.date}\</Text\>  
              \</View\>  
              \<Text style={styles.company}\>{exp.company}\</Text\>  
              {exp.responsibilities.map((res, i) \=\> (  
                \<Text key={i} style={styles.responsibility}\>• {res}\</Text\>  
              ))}  
            \</View\>  
          ))}  
        \</View\>  
          
         {/\* Education can also be added here \*/}  
      \</View\>  
    \</Page\>  
  \</Document\>  
);

### **Step 3: Update App.tsx to Manage Template Selection**

Finally, we'll modify the main App.tsx file to allow users to select a template and render the correct one.

1. **Add State for Template Selection:** Keep track of which template is currently active.  
2. **Import Templates:** Import the new template components you just created.  
3. **Create a TemplateRenderer:** This helper component will simplify the logic for rendering the chosen template.  
4. **Add UI Buttons:** Simple buttons to let the user switch between templates.  
5. **Update the PDFDownloadLink:** Use the TemplateRenderer to pass the correct document component to the download link.

// App.tsx

import React, { useState, useEffect } from 'react';  
import { PDFDownloadLink } from '@react-pdf/renderer';  
import { CVManager } from './components/CVManager';  
import { getCVData } from './services/cvService';  
import { CVData } from './services/cvService';

// Import your template components  
import { ClassicTemplate } from './components/templates/ClassicTemplate';  
import { ModernTemplate } from './components/templates/ModernTemplate';

// Helper component to render the correct template based on state  
const TemplateRenderer \= ({ template, cvData }) \=\> {  
  switch (template) {  
    case 'Modern':  
      return \<ModernTemplate cvData={cvData} /\>;  
    case 'Classic':  
    default:  
      return \<ClassicTemplate cvData={cvData} /\>;  
  }  
};

const App \= () \=\> {  
  const \[cvData, setCvData\] \= useState\<CVData | null\>(null);  
  // Add state for the selected template  
  const \[selectedTemplate, setSelectedTemplate\] \= useState('Classic');

  useEffect(() \=\> {  
    const data \= getCVData();  
    setCvData(data);  
  }, \[\]);

  return (  
    \<div className="min-h-screen bg-gray-100 flex flex-col items-center p-4 font-sans"\>  
      \<div className="w-full max-w-4xl p-6"\>  
        \<h1 className="text-4xl font-bold text-center text-gray-800 mb-4"\>CV Optimizer\</h1\>  
        \<p className="text-center text-gray-600 mb-8"\>Select a template and download your optimized CV.\</p\>

        {/\* \--- TEMPLATE SELECTION UI \--- \*/}  
        \<div className="flex justify-center gap-4 mb-8"\>  
          \<button  
            onClick={() \=\> setSelectedTemplate('Classic')}  
            className={\`px-6 py-2 rounded-md font-semibold text-white transition-transform transform hover:scale-105 ${selectedTemplate \=== 'Classic' ? 'bg-blue-600 shadow-lg' : 'bg-gray-400'}\`}  
          \>  
            Classic  
          \</button\>  
          \<button  
            onClick={() \=\> setSelectedTemplate('Modern')}  
            className={\`px-6 py-2 rounded-md font-semibold text-white transition-transform transform hover:scale-105 ${selectedTemplate \=== 'Modern' ? 'bg-blue-600 shadow-lg' : 'bg-gray-400'}\`}  
          \>  
            Modern  
          \</button\>  
        \</div\>

        {/\* \--- UPDATED DOWNLOAD LINK \--- \*/}  
        \<div className="text-center mb-8"\>  
            {cvData && (  
                \<PDFDownloadLink  
                    document={\<TemplateRenderer template={selectedTemplate} cvData={cvData} /\>}  
                    fileName={\`${selectedTemplate.toLowerCase()}-cv.pdf\`}  
                    className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-transform transform hover:scale-105"  
                \>  
                    {({ loading }) \=\> (loading ? 'Generating PDF...' : 'Download PDF')}  
                \</PDFDownloadLink\>  
            )}  
        \</div\>  
      \</div\>

      {/\* The CVManager remains for the on-screen preview of the classic style \*/}  
      \<div className="w-full max-w-4xl bg-white shadow-2xl rounded-lg overflow-hidden"\>  
        {cvData && \<CVManager cvData={cvData} /\>}  
      \</div\>  
    \</div\>  
  );  
};

export default App;

With this structure, you can now add as many new templates as you like by simply creating a new template component and adding a corresponding button in App.tsx.