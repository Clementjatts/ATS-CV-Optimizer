import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';

// Define styles for the document
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Times-Roman',
    fontSize: 11,
    color: '#333',
  },
  header: {
    textAlign: 'center',
    marginBottom: 20,
  },
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    textTransform: 'uppercase',
  },
  contactInfo: {
    fontSize: 10,
    color: '#333',
  },
  section: {
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  entry: {
    marginBottom: 10,
    // Removed pageBreakInside: 'avoid' to allow content to flow across pages
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
    pageBreakAfter: 'avoid', // Prevent headings from being stranded at bottom of page
  },
  jobTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    pageBreakAfter: 'avoid', // Keep heading with following content
  },
  company: {
    fontSize: 11,
    fontStyle: 'italic',
    pageBreakAfter: 'avoid', // Keep company name with following content
  },
  date: {
    fontSize: 10,
    color: '#555',
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 3,
  },
  bullet: {
    width: 10,
    fontSize: 10,
    color: '#3b82f6', // Blue bullet to match web styling
    fontWeight: 'bold',
  },
  bulletText: {
    flex: 1,
  },
  skillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  skill: {
    width: '50%',
    flexDirection: 'row',
    marginBottom: 3,
  },
});

// Clean job title function
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

// The CV Document Component
export const ClassicTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.name}>{cvData.fullName}</Text>
        <Text style={styles.contactInfo}>
          {cvData.contactInfo.location} | clementjatts@gmail.com | +447838681955
        </Text>
      </View>

      {/* Professional Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text>{cvData.professionalSummary}</Text>
      </View>

      {/* Professional Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {cvData.workExperience.map((job, index) => (
          <View key={index} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.jobTitle}>{cleanJobTitle(job.jobTitle)}</Text>
              <Text style={styles.date}>{job.dates}</Text>
            </View>
            <Text style={styles.company}>{job.company}</Text>
            {job.responsibilities.slice(0, 4).map((resp, i) => (
              <View key={i} style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{resp}</Text>
              </View>
            ))}
          </View>
        ))}
      </View>

      {/* Education Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Education</Text>
        {cvData.education.map((edu, index) => (
          <View key={index} style={styles.entry}>
            <View style={styles.entryHeader}>
              <Text style={styles.jobTitle}>{edu.institution}</Text>
              <Text style={styles.date}>{edu.dates}</Text>
            </View>
            <Text>{edu.degree}</Text>
          </View>
        ))}
      </View>

      {/* Key Skills Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Skills & Competencies</Text>
        <View style={styles.skillsContainer}>
          {cvData.skills.slice(0, 14).map((skill, index) => (
            <View key={index} style={styles.skill}>
              <Text style={styles.bullet}>•</Text>
              <Text style={styles.bulletText}>{skill}</Text>
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);