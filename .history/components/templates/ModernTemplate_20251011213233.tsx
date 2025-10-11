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

// Modern Template Stylesheet with improved styling
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
  },
  leftColumn: {
    width: '30%',
    backgroundColor: '#2C3E50', // A slightly softer dark blue
    color: '#FFFFFF',
    padding: 25,
  },
  rightColumn: {
    width: '70%',
    padding: 30,
  },
  name: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#FFFFFF', // White text for dark background
  },
  title: {
    fontSize: 14,
    color: '#BDC3C7', // Light grey for dark background
    marginBottom: 20,
  },
  sidebarTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    marginBottom: 10,
    color: '#BDC3C7', // A light grey for contrast
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    fontSize: 10,
  },
  icon: {
    marginRight: 8,
    width: 10,
    height: 10,
    color: '#FFFFFF', // White icons for dark background
  },
  skill: {
    fontSize: 10,
    marginBottom: 4,
    color: '#FFFFFF',
  },
  mainSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2C3E50',
    marginBottom: 12,
    textTransform: 'uppercase',
    borderBottomWidth: 2,
    borderBottomColor: '#3498DB',
    paddingBottom: 4,
  },
  entry: {
    marginBottom: 15,
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
    color: '#2C3E50',
  },
  date: {
    fontSize: 10,
    color: '#7F8C8D',
    fontWeight: 'normal',
  },
  company: {
    fontSize: 11,
    fontStyle: 'italic',
    marginBottom: 6,
    color: '#3498DB',
  },
  responsibility: {
    fontSize: 10,
    marginBottom: 4,
    color: '#34495E',
    paddingLeft: 8,
  },
  summary: {
    fontSize: 11,
    textAlign: 'justify',
    lineHeight: 1.6,
    color: '#34495E',
  },
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8,
  },
  institution: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2C3E50',
  },
  degree: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#7F8C8D',
  },
});

export const ModernTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Left Column */}
      <View style={styles.leftColumn}>
        <Text style={styles.name}>{cvData.fullName}</Text>

        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sidebarTitle}>Contact</Text>
          <View style={styles.contactItem}>
            <Text style={styles.icon}>📞</Text>
            <Text style={styles.skill}>+447838681955</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.icon}>✉️</Text>
            <Text style={styles.skill}>clement@clementadegbenro.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.icon}>📍</Text>
            <Text style={styles.skill}>{cvData.contactInfo.location}</Text>
          </View>
        </View>

        <View>
          <Text style={styles.sidebarTitle}>Key Skills</Text>
          {cvData.skills.slice(0, 12).map((skill, index) => (
            <Text key={index} style={styles.skill}>
              {skill}
            </Text>
          ))}
        </View>
      </View>

      {/* Right Column */}
      <View style={styles.rightColumn}>
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
                <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }}>
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold', width: 10 }}>•</Text>
                  <Text style={styles.responsibility}>{resp}</Text>
                </View>
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
