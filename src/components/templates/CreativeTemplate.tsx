import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';
import { cleanJobTitle } from '../../utils/cvHelpers';

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
    lineHeight: 1.2, // Fix icon alignment
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
    pageBreakAfter: 'avoid', // Prevent headings from being stranded at bottom of page
  },
  jobTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: ACCENT_COLOR,
    pageBreakAfter: 'avoid', // Keep heading with following content
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
    pageBreakAfter: 'avoid', // Prevent education entries from being stranded
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
    <Page size='A4' style={styles.page}>
      {/* Dynamic Header */}
      <View style={styles.header}>
        <Text style={styles.name}>{cvData.fullName}</Text>
        <View style={styles.contactBlock}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: 2,
            }}
          >
            <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path
                fill='#666'
                d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
              />
            </Svg>
            <Text style={styles.contactInfo}>{cvData.contactInfo.location}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: 2,
            }}
          >
            <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path
                fill='#666'
                d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'
              />
            </Svg>
            <Text style={styles.contactInfo}>{cvData.contactInfo.email}</Text>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'flex-end',
              marginBottom: 2,
            }}
          >
            <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path
                fill='#666'
                d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'
              />
            </Svg>
            <Text style={styles.contactInfo}>{cvData.contactInfo.phone}</Text>
          </View>
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
          <View key={index} style={styles.entry} wrap={true}>
            {/* 
                 Header Glue Block: Reduced to just Title + Company to prevent aggressive page pushing ("Huge Gap" Fix).
                 We allow the bullets to start flowing immediately after.
              */}
            <View wrap={false}>
              <View style={styles.entryHeader}>
                <Text style={styles.jobTitle} orphans={2} widows={2}>
                  {cleanJobTitle(job.jobTitle)}
                </Text>
                <Text style={styles.date}>{job.dates}</Text>
              </View>
              <Text style={styles.company} orphans={2} widows={2}>
                {job.company}
              </Text>
            </View>

            {/* All Bullets - Allow flow immediately */}
            {job.responsibilities.slice(0, 4).map((resp, i) => (
              <View key={i} style={{ flexDirection: 'row', marginBottom: 3 }} wrap={false}>
                <Text style={{ color: '#3b82f6', fontWeight: 'bold', width: 10 }}>•</Text>
                <Text style={styles.responsibility} orphans={2} widows={2}>
                  {resp}
                </Text>
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
