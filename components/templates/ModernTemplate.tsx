import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';
import { cleanJobTitle } from '../../utils/cvHelpers';


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
    color: '#F3F4F6', // Soft off-white for better readability
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
    color: '#14b8a6', // Muted teal accent color
    marginBottom: 4,
  },
  educationSchool: {
    fontSize: 9,
    color: '#F3F4F6', // Soft off-white for better readability
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
    color: '#374151', // Dark charcoal grey
    marginBottom: 10,
    marginTop: 10, // Reduced from 20 to 10
    borderBottomWidth: 2,
    borderBottomColor: '#14b8a6', // Teal accent border
    paddingBottom: 4,
  },
  summary: {
    fontSize: 10,
    color: '#374151', // Dark charcoal grey
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
    color: '#374151', // Dark charcoal grey
  },
  jobDate: {
    fontSize: 9,
    color: '#14b8a6', // Teal accent for dates
    fontWeight: 'bold',
  },
  companyName: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#374151', // Dark charcoal grey
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
    color: '#374151', // Dark charcoal grey
    lineHeight: 1.4,
  },
  separator: {
    borderBottomWidth: 1,
    borderBottomColor: '#14b8a6', // Teal accent separator
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
            <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path fill="#F3F4F6" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </Svg>
            <Text style={styles.contactText}>{cvData.contactInfo.phone}</Text>
          </View>
          <View style={styles.contactItem}>
            <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path fill="#F3F4F6" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </Svg>
            <Text style={styles.contactText}>{cvData.contactInfo.email}</Text>
          </View>
          <View style={styles.contactItem}>
            <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path fill="#F3F4F6" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </Svg>
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
          {cvData.workExperience.map((job, index) => {
            const responsibilities = job.responsibilities;
            const firstResp = responsibilities[0]; // Used in special highlight view
            const remainingResp = responsibilities.slice(1, 4); // Capped at 4 total items

            return (
              <View key={index} style={styles.experienceItem} wrap={true}>
                {/* Header Glue: Position + Company + Special First Bullet */}
                <View wrap={false}>
                  <View style={styles.jobPosition}>
                    <Text style={styles.jobTitleText} orphans={2} widows={2}>{cleanJobTitle(job.jobTitle)}</Text>
                    <Text style={styles.jobDate}>{job.dates}</Text>
                  </View>
                  <Text style={styles.companyName} orphans={2} widows={2}>{job.company}</Text>

                  {/* Special First Bullet Highlight */}
                  {firstResp && (
                    <View style={styles.bulletPoint} wrap={false}>
                      <Text style={styles.bullet}>•</Text>
                      {/* Note: Original code joined slice(0,1), which is just the first item */}
                      <Text style={styles.bulletText} orphans={2} widows={2}>{firstResp}</Text>
                    </View>
                  )}
                </View>

                {/* Remaining Bullets */}
                {remainingResp.map((resp, i) => (
                  <View key={i} style={styles.bulletPoint} wrap={false}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText} orphans={2} widows={2}>{resp}</Text>
                  </View>
                ))}
              </View>
            );
          })}
        </View>
      </View>
    </Page>
  </Document>
);