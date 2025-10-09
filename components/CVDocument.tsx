import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { CvData } from '../services/geminiService';

// Create styles using a StyleSheet object - this is like CSS-in-JS
const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.4,
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 10,
    color: '#666',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    borderBottomWidth: 1,
    borderBottomColor: '#666',
    marginBottom: 8,
    paddingBottom: 2,
    textTransform: 'uppercase',
  },
  jobEntry: {
    marginBottom: 12,
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
    color: '#333',
  },
  company: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
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
    fontSize: 10,
  },
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  institution: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  degree: {
    fontSize: 10,
    color: '#666',
  },
  skillsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    width: '50%',
    marginBottom: 2,
    fontSize: 10,
  },
  summary: {
    fontSize: 10,
    textAlign: 'justify',
    lineHeight: 1.5,
  },
});

// Clean job title function (same as in App.tsx)
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
  
  // Remove common suffixes
  const suffixes = [
    ' | Transferable Skills',
    ' - Transferable Skills',
    ' (Transferable Skills)',
    ' | Additional Qualifications',
    ' - Additional Qualifications'
  ];
  
  for (const suffix of suffixes) {
    if (title.includes(suffix)) {
      title = title.replace(suffix, '').trim();
    }
  }
  
  return title;
};

// This is your new PDF template component
export const CVDocument = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{cvData.fullName.toUpperCase()}</Text>
        <Text style={styles.contactInfo}>
          {cvData.contactInfo.location} | {cvData.contactInfo.email} | {cvData.contactInfo.phone}
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
          // The `wrap={false}` prop on this View is KEY.
          // It prevents this job entry from being split. But because the list items
          // below are individual Text elements, the list itself CAN break cleanly between items.
          <View key={index} style={styles.jobEntry} wrap={false}>
            <View style={styles.entryHeader}>
              <Text style={styles.jobTitle}>{cleanJobTitle(job.jobTitle)}</Text>
              <Text style={styles.date}>{job.dates}</Text>
            </View>
            <Text style={styles.company}>{job.company}</Text>
            {job.responsibilities.slice(0, 4).map((resp, i) => (
              <View key={i} style={styles.responsibility}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.responsibilityText}>{resp}</Text>
              </View>
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
            let skillsToShow = cvData.skills.slice(0, 14); // Take first 14 skills max
            
            // If we have less than 12 skills, pad with empty items to reach 12
            while (skillsToShow.length < 12) {
              skillsToShow.push('');
            }
            
            // Ensure even number
            if (skillsToShow.length % 2 !== 0) {
              skillsToShow = skillsToShow.slice(0, -1); // Remove last item to make even
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
    </Page>
  </Document>
);
