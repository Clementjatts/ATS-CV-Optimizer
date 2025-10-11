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

// Creative Template Stylesheet with accent colors and typography
// Accent color choice: a professional teal
const ACCENT_COLOR = '#16A085';

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#1f2937',
    padding: 30,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingBottom: 10,
    marginBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: ACCENT_COLOR,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
  },
  contactBlock: {
    textAlign: 'right',
  },
  contactInfo: {
    fontSize: 10,
    color: '#666',
    marginBottom: 2,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  entry: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
  },
  date: {
    fontSize: 10,
    color: '#666',
    fontWeight: 'normal',
  },
  company: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
    color: '#555',
  },
  responsibility: {
    fontSize: 10,
    marginBottom: 3,
    color: '#444',
    paddingLeft: 8,
  },
  summary: {
    fontSize: 11,
    textAlign: 'justify',
    lineHeight: 1.6,
    color: '#444',
    padding: 15,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  },
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#F8F9FA',
    borderRadius: 4,
    borderLeftWidth: 3,
    borderLeftColor: ACCENT_COLOR,
  },
  institution: {
    fontSize: 12,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
  },
  degree: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  skillsContainer: {
    flexDirection: 'row',
    marginTop: 5,
  },
  skillsColumn: {
    width: '50%',
    paddingRight: 10,
  },
  skillPill: {
    backgroundColor: '#EAECEE',
    color: '#34495E',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 5,
    fontSize: 10,
    marginRight: 5,
    marginBottom: 5,
  },
});

export const CreativeTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{cvData.fullName}</Text>
        <View style={styles.contactBlock}>
          <Text style={styles.contactInfo}>{cvData.contactInfo.location}</Text>
          <Text style={styles.contactInfo}>clement@clementadegbenro.com</Text>
          <Text style={styles.contactInfo}>+447838681955</Text>
        </View>
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
              <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold', width: 10 }}>•</Text>
                <Text style={styles.responsibility}>{resp}</Text>
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
        <View style={styles.skillsContainer}>
          <View style={styles.skillsColumn}>
            {cvData.skills.slice(0, 6).map((skill, index) => (
              <Text key={index} style={styles.skillPill}>
                {skill}
              </Text>
            ))}
          </View>
          <View style={styles.skillsColumn}>
            {cvData.skills.slice(6, 12).map((skill, index) => (
              <Text key={index + 6} style={styles.skillPill}>
                {skill}
              </Text>
            ))}
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
