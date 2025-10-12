import React from 'react';

// Define the structure of the CV data
interface CVData {
  firstName: string;
  lastName: string;
  jobTitle: string;
  phone: string;
  email: string;
  address: string;
  summary: string;
  experience: {
    title: string;
    company: string;
    startDate: string;
    endDate: string;
    description: string;
  }[];
  education: {
    degree: string;
    school: string;
    startDate: string;
    endDate: string;
  }[];
  skills: string[];
  // photoUrl?: string; // Optional photo URL - This line is removed
}

interface ModernTemplateProps {
  cvData: CVData;
}

const ModernTemplate: React.FC<ModernTemplateProps> = ({ cvData }) => {
  const {
    firstName,
    lastName,
    jobTitle,
    phone,
    email,
    address,
    summary,
    experience,
    education,
    skills,
    // photoUrl - This line is removed
  } = cvData;

  const renderExperience = () => {
    return experience.map((exp, index) => (
      <li key={index}>
        <div className="jobPosition">
          <span className="bolded">{exp.title}</span>
          <span>{exp.company}</span>
        </div>
        <div className="jobDuration">
          <span>{exp.startDate} - {exp.endDate}</span>
        </div>
        <div className="jobDescription">
          <p>{exp.description}</p>
        </div>
      </li>
    ));
  };

  const renderEducation = () => {
    return education.map((edu, index) => (
       <div key={index} className="smallText">
          <p className="bolded">{edu.degree}</p>
          <p>{edu.school}</p>
          <p>{edu.startDate} - {edu.endDate}</p>
        </div>
    ));
  };
  
  return (
    <>
      <style>
        {`
          /* Import Google Fonts */
          @import url('https://fonts.googleapis.com/css2?family=Archivo+Narrow:wght@400;700&family=Julius+Sans+One&family=Open+Sans:wght@400;700&family=Source+Sans+Pro:wght@400;700&display=swap');

          .modern-cv-container {
            font-family: 'Source Sans Pro', sans-serif;
            font-size: 10pt;
            background-color: #fff;
          }

          .a4-page {
            width: 21cm;
            height: 29.7cm;
            margin: 0 auto;
            background: white;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            overflow: hidden;
          }

          .container-flex {
            display: flex;
            height: 100%;
          }
          
          /* Left Panel */
          .leftPanel {
            width: 33%;
            background-color: #1c1c1c;
            color: #bebebe;
            padding: 1cm;
            display: flex;
            flex-direction: column;
          }

          /* This style block is removed */
          
          .leftPanel .details {
            display: flex;
            flex-direction: column;
          }

          .leftPanel h2 {
            font-family: 'Archivo Narrow', sans-serif;
            color: white;
            text-transform: uppercase;
            font-size: 14pt;
            margin-top: 0.5cm;
            margin-bottom: 0.3cm;
            border-bottom: 0.05cm solid #555;
            padding-bottom: 0.2cm;
          }

          .contact-item {
            display: flex;
            align-items: center;
            margin-bottom: 0.3cm;
          }

          .contact-item .contactIcon {
            margin-right: 0.3cm;
            width: 16px;
            height: 16px;
            stroke-width: 1.5;
          }

          .leftPanel a {
            color: #bebebe;
            text-decoration: none;
            word-break: break-all;
          }
          .leftPanel a:hover {
            color: white;
          }

          .skills-container ul {
            list-style-type: none;
            padding-left: 0;
          }

          .skills-container li {
            margin-bottom: 0.2cm;
          }

          .education-item {
            margin-bottom: 0.4cm;
          }
          .education-item .bolded {
            font-family: 'Open Sans', sans-serif;
            font-weight: bold;
            color: white;
          }

          /* Right Panel */
          .rightPanel {
            width: 67%;
            padding: 1cm;
            background-color: white;
            color: #222;
          }

          .rightPanel h1 {
            font-family: 'Julius Sans One', sans-serif;
            font-weight: 300;
            font-size: 1.2cm;
            transform: scale(1, 1.15);
            margin-bottom: 0.1cm;
            text-transform: uppercase;
            color: #111;
          }

          .rightPanel h3 {
            font-family: 'Open Sans', sans-serif;
            text-transform: uppercase;
            color: #555;
            font-size: 12pt;
            margin-bottom: 0.8cm;
          }

          .rightPanel h2 {
            font-family: 'Archivo Narrow', sans-serif;
            text-transform: uppercase;
            font-size: 14pt;
            margin-top: 0.8cm;
            margin-bottom: 0.4cm;
            border-bottom: 0.05cm solid #ddd;
            padding-bottom: 0.2cm;
          }

          .summary p, .jobDescription p {
            text-align: justify;
            line-height: 1.6;
          }
          
          .workExperience > ul {
            list-style-type: none;
            padding-left: 0;
            margin-top: 0.5cm;
          }

          .workExperience > ul > li {
            position: relative;
            margin: 0;
            padding-bottom: 0.5cm;
            padding-left: 0.5cm;
          }

          .workExperience > ul > li:before {
            background-color: #b8abab;
            width: 2px;
            content: '';
            position: absolute;
            top: 0.1cm;
            bottom: -0.2cm;
            left: 1px;
          }

          .workExperience > ul > li:last-child:before {
            height: 0.3cm;
          }

          .workExperience > ul > li::after {
            content: '';
            position: absolute;
            top: 0.1cm;
            left: -1px;
            height: 0.2cm;
            width: 0.2cm;
            background: white;
            border: 0.05cm solid #b8abab;
            border-radius: 50%;
          }
          
          .jobPosition, .jobDuration {
             font-family: 'Source Sans Pro', sans-serif;
          }
          .bolded { font-weight: bold; }

          .jobPosition {
            display: flex;
            flex-direction: row;
            justify-content: space-between;
          }

          .jobPosition .bolded { font-size: 11pt; }
        `}
      </style>
      <div className="a4-page modern-cv-container">
        <div className="container-flex">
          <div className="leftPanel">
            {/* <img src={photoUrl || "https://placehold.co/150x150/EFEFEF/333?text=Photo"} alt="Profile" /> */} {/* This line is removed */}
            <div className="details">
              <div className="item">
                <h2>Contact</h2>
                <div className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contactIcon"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                  <span>{phone}</span>
                </div>
                <div className="contact-item">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contactIcon"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                  <a href={`mailto:${email}`}>{email}</a>
                </div>
                <div className="contact-item">
                   <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="contactIcon"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                  <span>{address}</span>
                </div>
              </div>
              <div className="item skills-container">
                <h2>Skills</h2>
                <ul>
                  {skills.map((skill, index) => <li key={index}>{skill}</li>)}
                </ul>
              </div>
              <div className="item">
                <h2>Education</h2>
                {renderEducation()}
              </div>
            </div>
          </div>
          <div className="rightPanel">
            <h1>{firstName} {lastName}</h1>
            <h3>{jobTitle}</h3>
            <div className="summary">
              <h2>About Me</h2>
              <p>{summary}</p>
            </div>
            <div className="workExperience">
              <h2>Work Experience</h2>
              <ul>
                {renderExperience()}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ModernTemplate;