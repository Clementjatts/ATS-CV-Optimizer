import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';

// Clean job title function (same as in ClassicTemplate)
const cleanJobTitle = (title: string): string => {
  if (!title) return title;
  
  // Remove everything after common separators
  const separators = ['|', ' - ', ' – ', ' — ', ' (', ' [', ' / '];
  for (const separator of separators) {
    const index = title.indexOf(separator);
    if (index > 0) {
      title = title.substring(0, index).trim();
    }
  }
  
  // Remove specific suffixes
  const suffixes = [
    ' | Transferable Skills', ' - Transferable Skills', ' (Transferable Skills)',
    ' | Additional Qualifications', ' - Additional Qualifications'
  ];
  for (const suffix of suffixes) {
    if (title.includes(suffix)) {
      title = title.replace(suffix, '').trim();
    }
  }
  
  return title;
};

// Modern Template Stylesheet
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  sidebar: {
    width: '30%',
    padding: 25,
    backgroundColor: '#f3f4f6', // Light gray sidebar
    color: '#1f2937',
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
    color: '#111827',
  },
  title: {
    fontSize: 12,
    color: '#4b5563',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sidebarSection: {
    marginBottom: 15,
  },
  sidebarTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#6b7280',
    paddingBottom: 2,
    textTransform: 'uppercase',
    color: '#111827',
  },
  contactText: {
    fontSize: 9,
    marginBottom: 3,
    color: '#4b5563',
  },
  skill: {
    fontSize: 9,
    marginBottom: 3,
    color: '#374151',
  },
  mainSection: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 10,
    textTransform: 'uppercase',
    borderBottomWidth: 1.5,
    borderBottomColor: '#9ca3af',
    paddingBottom: 2,
  },
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
    color: '#111827',
  },
  date: {
    fontSize: 9,
    color: '#4b5563',
    fontWeight: 'normal',
  },
  company: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 4,
    color: '#2563eb',
  },
  responsibility: {
    fontSize: 10,
    marginBottom: 3,
    color: '#374151',
  },
  summary: {
    fontSize: 10,
    textAlign: 'justify',
    lineHeight: 1.5,
    color: '#374151',
  },
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 5,
  },
  institution: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111827',
  },
  degree: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#4b5563',
  },
});

export const ModernTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Sidebar (Left Column) */}
      <View style={styles.sidebar}>
        <Text style={styles.name}>{cvData.fullName}</Text>
        <Text style={styles.title}>
          {cvData.workExperience[0]?.jobTitle ? cleanJobTitle(cvData.workExperience[0].jobTitle) : 'Professional'}
        </Text>

        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarTitle}>Contact</Text>
          <Text style={styles.contactText}>+447838681955</Text>
          <Text style={styles.contactText}>clement@clementadegbenro.com</Text>
          <Text style={styles.contactText}>{cvData.contactInfo.location}</Text>
        </View>

        <View style={styles.sidebarSection}>
          <Text style={styles.sidebarTitle}>Key Skills</Text>
          {(() => {
            // Ensure even number of skills between 12-14
            let skillsToShow = cvData.skills.slice(0, 14);
            
            // If we have less than 12 skills, pad with empty items to reach 12
            while (skillsToShow.length < 12) {
              skillsToShow.push('');
            }
            
            // Ensure even number
            if (skillsToShow.length % 2 !== 0) {
              skillsToShow = skillsToShow.slice(0, -1);
            }
            
            // If we have more than 14, trim to 14 and ensure even
            if (skillsToShow.length > 14) {
              skillsToShow = skillsToShow.slice(0, 14);
              if (skillsToShow.length % 2 !== 0) {
                skillsToShow = skillsToShow.slice(0, -1);
              }
            }
            
            return skillsToShow.map((skill, index) => (
              <Text key={index} style={styles.skill}>
                {skill ? `• ${skill}` : ''}
              </Text>
            ));
          })()}
        </View>
      </View>

      {/* Main Content (Right Column) */}
      <View style={styles.mainContent}>
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{cvData.professionalSummary}</Text>
        </View>

        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Professional Experience</Text>
          {cvData.workExperience.map((job, index) => (
            <View key={index} style={styles.entry} wrap={false}>
              <View style={styles.entryHeader}>
                <Text style={styles.jobTitle}>{cleanJobTitle(job.jobTitle)}</Text>
                <Text style={styles.date}>{job.dates}</Text>
              </View>
              <Text style={styles.company}>{job.company}</Text>
              {job.responsibilities.slice(0, 4).map((resp, i) => (
                <Text key={i} style={styles.responsibility}>• {resp}</Text>
              ))}
            </View>
          ))}
        </View>
          
        <View style={styles.mainSection}>
          <Text style={styles.sectionTitle}>Education</Text>
          {cvData.education.map((edu, index) => (
            <View key={index} style={styles.educationEntry}>
              <View>
                <Text style={styles.institution}>{edu.institution}</Text>
                <Text style={styles.degree}>{edu.degree}</Text>
              </View>
              <Text style={styles.date}>{edu.dates}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
