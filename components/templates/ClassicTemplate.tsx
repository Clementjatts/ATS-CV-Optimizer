import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';
import { cleanJobTitle } from '../../utils/cvHelpers';

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
    orphans: 2, // Prevent orphaned lines (first line left alone at bottom)
    widows: 2,  // Prevent widowed lines (last line left alone at top)
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


// The CV Document Component
export const ClassicTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header Section */}
      <View style={styles.header}>
        <Text style={styles.name}>{cvData.fullName}</Text>
        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 12 }}>
          {/* Location */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path fill="#333" d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
            </Svg>
            <Text style={styles.contactInfo}>{cvData.contactInfo.location}</Text>
          </View>
          {/* Email */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path fill="#333" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
            </Svg>
            <Text style={styles.contactInfo}>{cvData.contactInfo.email}</Text>
          </View>
          {/* Phone */}
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Svg viewBox="0 0 24 24" style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path fill="#333" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" />
            </Svg>
            <Text style={styles.contactInfo}>{cvData.contactInfo.phone}</Text>
          </View>
        </View>
      </View>

      {/* Professional Summary Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text>{cvData.professionalSummary}</Text>
      </View>

      {/* Professional Experience Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {cvData.workExperience.map((job, index) => {
          const responsibilities = job.responsibilities.slice(0, 4);
          const firstResp = responsibilities[0];
          const remainingResp = responsibilities.slice(1);

          return (
            <View key={index} style={styles.entry} wrap={true}>
              {/* Header Glue Block: Header + Company + 1st Bullet */}
              <View wrap={false}>
                <View style={styles.entryHeader}>
                  <Text style={styles.jobTitle} orphans={2} widows={2}>{cleanJobTitle(job.jobTitle)}</Text>
                  <Text style={styles.date}>{job.dates}</Text>
                </View>
                <Text style={styles.company} orphans={2} widows={2}>{job.company}</Text>
                {firstResp && (
                  <View style={styles.bulletPoint} wrap={false}>
                    <Text style={styles.bullet}>•</Text>
                    <Text style={styles.bulletText} orphans={2} widows={2}>{firstResp}</Text>
                  </View>
                )}
              </View>

              {/* Remaining Bullets - Allow flow */}
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

      {/* Education Section */}
      <View style={styles.section}>
        {(() => {
          const firstEdu = cvData.education[0];
          const remainingEdu = cvData.education.slice(1);

          return (
            <>
              {/* Glue Block: Title + First Entry */}
              <View wrap={false}>
                <Text style={styles.sectionTitle}>Education</Text>
                {firstEdu && (
                  <View style={styles.entry}>
                    <View style={styles.entryHeader}>
                      <Text style={styles.jobTitle}>{firstEdu.institution}</Text>
                      <Text style={styles.date}>{firstEdu.dates}</Text>
                    </View>
                    <Text>{firstEdu.degree}</Text>
                  </View>
                )}
              </View>

              {/* Remaining Entries */}
              {remainingEdu.map((edu, index) => (
                <View key={index} style={styles.entry}>
                  <View style={styles.entryHeader}>
                    <Text style={styles.jobTitle}>{edu.institution}</Text>
                    <Text style={styles.date}>{edu.dates}</Text>
                  </View>
                  <Text>{edu.degree}</Text>
                </View>
              ))}
            </>
          );
        })()}
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