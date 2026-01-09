import React from 'react';
import { Page, Text, View, Document, StyleSheet, Svg, Path } from '@react-pdf/renderer';
import { CvData } from '../../services/geminiService';
import { cleanJobTitle } from '../../utils/cvHelpers';

// Standard Template Stylesheet matching the Standard (original) design
// Standard Template Stylesheet matching the Standard (original) design
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    fontSize: 10,
    color: '#000',
    lineHeight: 1.5, // leading-normal approximates 1.5
  },
  // Header Section
  headerContainer: {
    alignItems: 'center',
    borderBottomWidth: 2, // border-b-2
    borderBottomColor: '#D1D5DB', // border-gray-300
    paddingBottom: 16, // pb-4 (1rem = ~16px in PDF mostly)
    marginBottom: 24, // mb-6
  },
  name: {
    fontSize: 24, // text-3xl
    fontWeight: 'bold', // font-bold
    color: '#1F2937', // text-gray-800
    textTransform: 'uppercase', // uppercase
    marginBottom: 16, // Increased spacing as requested
    letterSpacing: 1, // tracking-wide
  },
  contactRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 12, // ga-3
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4, // gap-1
  },
  contactIcon: {
    color: '#4B5563', // text-gray-600
    fontSize: 10,
  },
  contactText: {
    color: '#4B5563', // text-gray-600
    fontSize: 10, // text-sm
    lineHeight: 1.2, // Fix alignment with icon
  },

  // Sections common styles
  section: {
    marginBottom: 24, // mb-6
  },
  sectionTitle: {
    fontSize: 11, // text-base (usually 16px/1em in web, PDF usually 11-12 for content. Preview uses 10pt base, so section title 11-12 is good)
    fontWeight: 'bold', // font-bold
    textTransform: 'uppercase', // uppercase
    letterSpacing: 1, // tracking-wide
    color: '#1F2937', // text-gray-800
    borderBottomWidth: 1, // border-b
    borderBottomColor: '#9CA3AF', // border-gray-400
    paddingBottom: 4, // pb-1
    marginBottom: 12, // mb-3 / mb-4
  },

  // Text Content
  summaryText: {
    fontSize: 10,
    color: '#374151', // text-gray-700
    textAlign: 'justify',
    lineHeight: 1.6, // leading-relaxed
  },

  // Experience Items
  jobEntry: {
    marginBottom: 20, // space-y-6 roughly
    paddingRight: 16, // pr-4
  },
  jobHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    marginBottom: 8, // mb-2
  },
  jobTitle: {
    fontSize: 11, // text-base
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-800
  },
  jobDate: {
    fontSize: 10, // text-sm
    color: '#4B5563', // text-gray-600
    fontWeight: 'medium',
  },
  companyName: {
    fontSize: 11, // text-base
    fontWeight: 'bold', // font-semibold
    color: '#2563EB', // text-blue-600 (Key Color)
    marginBottom: 12, // mb-3
  },

  // List Items
  bulletList: {
    paddingLeft: 10,
  },
  bulletItem: {
    flexDirection: 'row',
    marginBottom: 4, // space-y-1
  },
  bulletDot: {
    width: 10,
    fontSize: 14,
    lineHeight: 0.7, // Adjust to align with text
    color: '#374151', // Inherit text-gray-700 usually
  },
  bulletText: {
    flex: 1,
    fontSize: 10, // text-sm
    color: '#374151', // text-gray-700
  },

  // Education
  educationEntry: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  educationInstitution: {
    fontSize: 11, // text-base
    fontWeight: 'bold',
    color: '#1F2937', // text-gray-800
  },
  educationDegree: {
    fontSize: 10, // text-sm
    color: '#4B5563', // text-gray-600
  },

  // Skills
  skillsContainer: {
    flexDirection: 'row',
    gap: 16, // gap-4
  },
  skillsColumn: {
    flex: 1,
  },
});

export const StandardTemplate = ({ cvData }: { cvData: CvData }) => (
  <Document>
    <Page size='A4' style={styles.page}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <Text style={styles.name}>{cvData.fullName}</Text>
        <View style={styles.contactRow}>
          {/* Location */}
          <View style={styles.contactItem}>
            <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path
                fill='#4B5563'
                d='M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z'
              />
            </Svg>
            <Text style={styles.contactText}>{cvData.contactInfo.location}</Text>
          </View>
          {/* Email */}
          <View style={styles.contactItem}>
            <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path
                fill='#4B5563'
                d='M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z'
              />
            </Svg>
            <Text style={styles.contactText}>{cvData.contactInfo.email}</Text>
          </View>
          {/* Phone */}
          <View style={styles.contactItem}>
            <Svg viewBox='0 0 24 24' style={{ width: 10, height: 10, marginRight: 6, top: 1 }}>
              <Path
                fill='#4B5563'
                d='M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z'
              />
            </Svg>
            <Text style={styles.contactText}>{cvData.contactInfo.phone}</Text>
          </View>
        </View>
      </View>

      {/* Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Summary</Text>
        <Text style={styles.summaryText}>{cvData.professionalSummary}</Text>
      </View>

      {/* Experience */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Professional Experience</Text>
        {cvData.workExperience.map((job, index) => {
          const responsibilities = job.responsibilities.slice(0, 4); // Keep existing 4-item limit
          const firstResponsibility = responsibilities[0];
          const remainingResponsibilities = responsibilities.slice(1);

          return (
            <View key={index} style={styles.jobEntry} wrap={true}>
              {/* 
                              Header Block: Keeps Job Info + First Responsibility together ("Header Glue") 
                              wrap={false} ensures this block never breaks.
                            */}
              <View wrap={false}>
                <View style={styles.jobHeaderRow}>
                  <Text style={styles.jobTitle} orphans={2} widows={2}>
                    {cleanJobTitle(job.jobTitle)}
                  </Text>
                  <Text style={styles.jobDate}>{job.dates}</Text>
                </View>
                <Text style={styles.companyName} orphans={2} widows={2}>
                  {job.company}
                </Text>

                {/* Render first bullet inside the glue block if it exists */}
                {firstResponsibility && (
                  <View style={styles.bulletList}>
                    <View style={styles.bulletItem} wrap={false}>
                      <Text style={styles.bulletDot}>•</Text>
                      <Text style={styles.bulletText} orphans={2} widows={2}>
                        {firstResponsibility}
                      </Text>
                    </View>
                  </View>
                )}
              </View>

              {/* Remaining bullets can flow to next page ("Fill the Gap") */}
              <View style={styles.bulletList}>
                {remainingResponsibilities.map((resp, i) => (
                  <View key={i} style={styles.bulletItem} wrap={false}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText} orphans={2} widows={2}>
                      {resp}
                    </Text>
                  </View>
                ))}
              </View>
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
              <Text style={styles.educationInstitution}>{edu.institution}</Text>
              <Text style={styles.educationDegree}>{edu.degree}</Text>
            </View>
            <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#4B5563' }}>{edu.dates}</Text>
          </View>
        ))}
      </View>

      {/* Skills */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Key Skills & Competencies</Text>
        <View style={styles.skillsContainer}>
          {(() => {
            const skills = cvData.skills.slice(0, 14);
            const mid = Math.ceil(skills.length / 2);
            const left = skills.slice(0, mid);
            const right = skills.slice(mid);

            return (
              <>
                <View style={styles.skillsColumn}>
                  <View style={styles.bulletList}>
                    {left.map((skill, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
                <View style={styles.skillsColumn}>
                  <View style={styles.bulletList}>
                    {right.map((skill, index) => (
                      <View key={index} style={styles.bulletItem}>
                        <Text style={styles.bulletDot}>•</Text>
                        <Text style={styles.bulletText}>{skill}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              </>
            );
          })()}
        </View>
      </View>
    </Page>
  </Document>
);
