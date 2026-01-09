import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';
import { cleanJobTitle } from '../../utils/cvHelpers';

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
    marginBottom: 30, // Increased spacing between name and contact
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
    // Removed pageBreakInside: 'avoid' to allow content to flow across pages
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 2,
    pageBreakAfter: 'avoid', // Prevent headings from being stranded at bottom of page
  },
  leftText: {
    fontWeight: 'bold',
    fontSize: 11,
    color: '#111',
    pageBreakAfter: 'avoid', // Keep heading with following content
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
    pageBreakAfter: 'avoid', // Keep company name with following content
  },
  responsibility: {
    fontSize: 10,
    marginBottom: 3,
    color: '#444',
    paddingLeft: 8,
    orphans: 2, // Prevent orphaned lines (first line left alone at bottom)
    widows: 2, // Prevent widowed lines (last line left alone at top)
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
    pageBreakAfter: 'avoid', // Prevent education entries from being stranded
  },
  institution: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#111',
    pageBreakAfter: 'avoid', // Keep institution name with following content
  },
  degree: {
    fontSize: 10,
    fontStyle: 'italic',
    color: '#666',
  },
  skillsList: {
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  skillsColumn: {
    width: '48%',
  },
  skill: {
    fontSize: 10,
    color: '#444',
    lineHeight: 1.5,
    marginBottom: 3,
  },
});

export const MinimalTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size='A4' style={styles.page}>
      {/* Clean Header */}
      <Text style={styles.name}>{cvData.fullName}</Text>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 25,
          gap: 12,
        }}
      >
        {/* Location */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
            <Path
              fill='#666'
              d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
            />
          </Svg>
          <Text style={{ fontSize: 10, color: '#666', lineHeight: 1.2 }}>
            {cvData.contactInfo.location}
          </Text>
        </View>
        {/* Email */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
            <Path
              fill='#666'
              d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'
            />
          </Svg>
          <Text style={{ fontSize: 10, color: '#666', lineHeight: 1.2 }}>
            {cvData.contactInfo.email}
          </Text>
        </View>
        {/* Phone */}
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
            <Path
              fill='#666'
              d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'
            />
          </Svg>
          <Text style={{ fontSize: 10, color: '#666', lineHeight: 1.2 }}>
            {cvData.contactInfo.phone}
          </Text>
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
        {cvData.workExperience.map((job, index) => {
          const responsibilities = job.responsibilities.slice(0, 4);
          const firstResp = responsibilities[0];
          const remainingResp = responsibilities.slice(1);

          return (
            <View key={index} style={styles.entry} wrap={true}>
              {/* Header Glue Block */}
              <View wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.leftText} orphans={2} widows={2}>
                    {cleanJobTitle(job.jobTitle)} at {job.company}
                  </Text>
                  <Text style={styles.rightText}>{job.dates}</Text>
                </View>
                {firstResp && (
                  <View style={{ flexDirection: 'row', marginBottom: 3 }} wrap={false}>
                    <Text style={{ color: '#3b82f6', fontWeight: 'bold', width: 10 }}>•</Text>
                    <Text style={styles.responsibility} orphans={2} widows={2}>
                      {firstResp}
                    </Text>
                  </View>
                )}
              </View>

              {/* Remaining Bullets */}
              {remainingResp.map((resp, i) => (
                <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }} wrap={false}>
                  <Text style={{ color: '#3b82f6', fontWeight: 'bold', width: 10 }}>•</Text>
                  <Text style={styles.responsibility} orphans={2} widows={2}>
                    {resp}
                  </Text>
                </View>
              ))}
            </View>
          );
        })}
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
          <View style={styles.skillsColumn}>
            {cvData.skills
              .slice(0, 12)
              .slice(0, 6)
              .map((skill, index) => (
                <Text key={index} style={styles.skill}>
                  • {skill}
                </Text>
              ))}
          </View>
          <View style={styles.skillsColumn}>
            {cvData.skills
              .slice(0, 12)
              .slice(6)
              .map((skill, index) => (
                <Text key={index + 6} style={styles.skill}>
                  • {skill}
                </Text>
              ))}
          </View>
        </View>
      </View>
    </Page>
  </Document>
);
