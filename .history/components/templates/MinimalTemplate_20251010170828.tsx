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

// Minimal Template Stylesheet with clean typography and layout
const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontFamily: 'Helvetica',
    fontSize: 10,
    lineHeight: 1.5, // Generous line spacing
    color: '#4A4A4A', // Soft black
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 2,
    color: '#111',
  },
  contactInfo: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginBottom: 25,
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1, // Add some space between letters
    color: '#333',
    marginBottom: 15,
    marginTop: 10,
  },
  entry: {
    marginBottom: 18,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  leftText: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#111',
  },
  rightText: {
    fontSize: 10,
    color: '#666',
  },
  company: {
    fontSize: 10,
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
  },
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 10,
  },
  institution: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111',
  },
  degree: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  skillsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  skill: {
    fontSize: 10,
    marginRight: 20,
    marginBottom: 4,
    color: '#444',
  },
});

export const MinimalTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Clean Header */}
      <Text style={styles.name}>{cvData.fullName}</Text>
      <Text style={styles.contactInfo}>
        {cvData.contactInfo.location} | clement@clementadegbenro.com | +447838681955
      </Text>

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
              <Text style={styles.leftText}>{cleanJobTitle(job.jobTitle)} at {job.company}</Text>
              <Text style={styles.rightText}>{job.dates}</Text>
            </View>
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
            <Text style={styles.rightText}>{edu.dates}</Text>
          </View>
        ))}
      </View>

      {/* Key Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Skills & Competencies</Text>
        <View style={styles.skillsList}>
          {cvData.skills.slice(0, 12).map((skill, index) => (
            <View key={index} style={{ flexDirection: 'row', marginBottom: 3 }}>
              <Text style={{ color: '#3b82f6', fontWeight: 'bold', width: 10 }}>•</Text>
              <Text style={styles.skill}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);
