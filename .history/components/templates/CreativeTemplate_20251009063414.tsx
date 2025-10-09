import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';

// Clean job title function (same as in other templates)
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

// Creative Template Stylesheet with vibrant colors
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
  },
  header: {
    backgroundColor: '#3b82f6', // Blue background
    padding: 25,
    textAlign: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 9,
    color: '#e0e7ff', // Light blue
    marginTop: 4,
  },
  section: {
    marginBottom: 15,
    marginHorizontal: 25,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    backgroundColor: '#f59e0b', // Orange background
    color: '#FFFFFF',
    padding: 8,
    marginBottom: 10,
    textTransform: 'uppercase',
    borderRadius: 4,
  },
  entry: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8fafc', // Light gray background
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#3b82f6', // Blue accent
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1e40af', // Dark blue
  },
  date: {
    fontSize: 9,
    color: '#6b7280',
    fontWeight: 'normal',
  },
  company: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
    color: '#059669', // Green
  },
  responsibility: {
    fontSize: 10,
    marginBottom: 3,
    color: '#374151',
    paddingLeft: 8,
  },
  summary: {
    fontSize: 10,
    textAlign: 'justify',
    lineHeight: 1.5,
    color: '#374151',
    padding: 12,
    backgroundColor: '#fef3c7', // Light yellow background
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b', // Orange accent
  },
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#f0f9ff', // Light blue background
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: '#06b6d4', // Cyan accent
  },
  institution: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#0c4a6e', // Dark cyan
  },
  degree: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#0369a1', // Medium blue
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skill: {
    backgroundColor: '#ddd6fe', // Light purple background
    color: '#5b21b6', // Dark purple text
    padding: 4,
    margin: 2,
    borderRadius: 12,
    fontSize: 9,
    fontWeight: 'normal',
  },
});

export const CreativeTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with colorful background */}
      <View style={styles.header}>
        <Text style={styles.name}>{cvData.fullName}</Text>
        <Text style={styles.contactInfo}>
          {cvData.contactInfo.location} | clement@clementadegbenro.com | +447838681955
        </Text>
      </View>

      {/* Professional Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summary}>{cvData.professionalSummary}</Text>
      </View>

      {/* Professional Experience */}
      <View style={styles.section}>
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
        
      {/* Education */}
      <View style={styles.section}>
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

      {/* Key Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Skills & Competencies</Text>
        <View style={styles.skillsGrid}>
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
                {skill ? skill : ''}
              </Text>
            ));
          })()}
        </View>
      </View>
    </Page>
  </Document>
);
