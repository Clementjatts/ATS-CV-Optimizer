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

// Minimal Template Stylesheet with clean, simple design
const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000000',
    padding: 30,
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
    borderBottomWidth: 1,
    borderBottomColor: '#000000',
    paddingBottom: 15,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  contactInfo: {
    fontSize: 9,
    color: '#666666',
    marginTop: 4,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#cccccc',
    paddingBottom: 3,
  },
  entry: {
    marginBottom: 15,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 3,
  },
  jobTitle: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  date: {
    fontSize: 9,
    color: '#666666',
  },
  company: {
    fontSize: 10,
    fontStyle: 'italic',
    marginBottom: 5,
    color: '#333333',
  },
  responsibility: {
    fontSize: 9,
    marginBottom: 2,
    color: '#444444',
    paddingLeft: 10,
  },
  summary: {
    fontSize: 10,
    textAlign: 'justify',
    lineHeight: 1.4,
    color: '#333333',
  },
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  institution: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  degree: {
    fontSize: 9,
    fontStyle: 'italic',
    color: '#666666',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 5,
  },
  skill: {
    fontSize: 9,
    marginRight: 15,
    marginBottom: 3,
    color: '#333333',
  },
});

export const MinimalTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
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
        <View style={styles.skillsList}>
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
    </Page>
  </Document>
);

export default MinimalTemplate;
