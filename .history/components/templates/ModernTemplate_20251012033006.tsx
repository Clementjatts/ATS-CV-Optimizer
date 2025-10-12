import React from 'react';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';

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

// Modern Template Stylesheet matching the Modern folder design
const styles = StyleSheet.create({
  page: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    fontFamily: 'Helvetica',
    fontSize: 10,
  },
  leftPanel: {
    width: '27%',
    backgroundColor: '#1F2937', // Deep midnight blue background
    padding: 20,
    color: '#F3F4F6', // Soft off-white text
  },
  rightPanel: {
    width: '73%',
    padding: 20,
    color: '#374151', // Dark charcoal grey
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1F2937', // Even darker charcoal for prominence
    marginBottom: 8,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  jobTitle: {
    fontSize: 14,
    color: '#111',
    marginBottom: 20,
    fontStyle: 'italic',
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#14b8a6', // Muted teal accent color
    marginBottom: 10,
    marginTop: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    fontSize: 9,
  },
  contactLabel: {
    marginRight: 12,
    fontSize: 9,
    color: '#FFFFFF',
    fontWeight: 'bold',
    width: 60,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.9,
  },
  contactText: {
    fontSize: 9,
    color: '#F3F4F6', // Soft off-white for better readability
  },
  skillItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
    fontSize: 9,
  },
  skillName: {
    fontSize: 9,
    color: '#bebebe',
    flex: 1,
  },
  skillYears: {
    fontSize: 9,
    color: '#bebebe',
    width: 40,
    textAlign: 'right',
  },
  educationItem: {
    marginBottom: 15,
  },
  educationTitle: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 9,
    color: '#bebebe',
    marginBottom: 2,
  },
  educationDate: {
    fontSize: 9,
    color: '#bebebe',
  },
  rightSectionTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    color: '#111',
    marginBottom: 10,
    marginTop: 20,
  },
  summary: {
    fontSize: 10,
    color: '#111',
    lineHeight: 1.5,
    textAlign: 'justify',
    marginBottom: 20,
  },
  workExperience: {
    marginBottom: 20,
  },
  experienceItem: {
    marginBottom: 20,
    paddingLeft: 0,
    position: 'relative',
  },
  jobPosition: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 4,
  },
  jobTitleText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111',
  },
  jobDate: {
    fontSize: 9,
    color: '#666',
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#111',
    marginBottom: 6,
  },
  jobDescription: {
    fontSize: 9,
    color: '#111',
    lineHeight: 1.4,
    textAlign: 'justify',
    marginBottom: 4,
  },
  responsibilitiesList: {
    marginLeft: 10,
    marginBottom: 8,
  },
  responsibility: {
    fontSize: 9,
    color: '#111',
    lineHeight: 1.4,
    marginBottom: 2,
  },
  bulletPoint: {
    flexDirection: 'row',
    marginBottom: 2,
  },
  bullet: {
    color: '#3b82f6', // Blue bullet to match web styling
    fontWeight: 'bold',
    marginRight: 6,
    fontSize: 9,
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    color: '#111',
    lineHeight: 1.4,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#FFFFFF',
    marginBottom: 15,
    paddingBottom: 15,
  },
});

export const ModernTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Left Panel */}
      <View style={styles.leftPanel}>
        {/* Contact Section */}
        <View style={styles.separator}>
          <Text style={styles.sectionTitle}>Contact</Text>
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>+447838681955</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>clementjatts@gmail.com</Text>
          </View>
          <View style={styles.contactItem}>
            <Text style={styles.contactText}>{cvData.contactInfo.location}</Text>
          </View>
        </View>

        {/* Skills Section */}
        <View style={styles.separator}>
          <Text style={styles.sectionTitle}>Skills</Text>
          {cvData.skills
            .filter(skill => 
              !skill.toLowerCase().includes('enhanced dbs') && 
              !skill.toLowerCase().includes('dbs') &&
              !skill.toLowerCase().includes('disclosure') &&
              !skill.toLowerCase().includes('barring service')
            )
            .slice(0, 8)
            .map((skill, index) => (
            <View key={index} style={styles.skillItem}>
              <Text style={styles.skillName}>{skill}</Text>
            </View>
          ))}
        </View>

        {/* Education Section */}
        <View>
          <Text style={styles.sectionTitle}>Education</Text>
          {cvData.education.map((edu, index) => (
            <View key={index} style={styles.educationItem}>
              <Text style={styles.educationTitle}>{edu.degree}</Text>
              <Text style={styles.educationSchool}>{edu.institution}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Right Panel */}
      <View style={styles.rightPanel}>
        {/* Name */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.name}>{cvData.fullName}</Text>
        </View>

        {/* Professional Summary Section */}
        <View style={{ marginBottom: 12 }}>
          <Text style={styles.rightSectionTitle}>Professional Summary</Text>
          <Text style={styles.summary}>{cvData.professionalSummary}</Text>
        </View>

        {/* Professional Experience Section */}
        <View style={styles.workExperience}>
          <Text style={styles.rightSectionTitle}>Professional Experience</Text>
          {cvData.workExperience.map((job, index) => (
            <View key={index} style={styles.experienceItem}>
              <View style={styles.jobPosition}>
                <Text style={styles.jobTitleText}>{cleanJobTitle(job.jobTitle)}</Text>
                <Text style={styles.jobDate}>{job.dates}</Text>
              </View>
              <Text style={styles.companyName}>{job.company}</Text>
              <View style={styles.bulletPoint}>
                <Text style={styles.bullet}>•</Text>
                <Text style={styles.bulletText}>{job.responsibilities.slice(0, 1).join(' ')}</Text>
              </View>
              {job.responsibilities.slice(1, 4).map((resp, i) => (
                <View key={i} style={styles.bulletPoint}>
                  <Text style={styles.bullet}>•</Text>
                  <Text style={styles.bulletText}>{resp}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </View>
    </Page>
  </Document>
);