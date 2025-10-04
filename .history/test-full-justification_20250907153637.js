// Test script to verify full justification implementation
// This creates sample CV data and tests the CSS justification

// Sample CV data for testing
const sampleCvData = {
    fullName: "John Doe",
    contactInfo: {
        email: "john.doe@email.com",
        phone: "+1 (555) 123-4567",
        linkedin: "linkedin.com/in/johndoe",
        location: "San Francisco, CA"
    },
    professionalSummary: "Experienced software engineer with 8+ years in full-stack development, specializing in React, Node.js, and cloud infrastructure. Proven track record of delivering scalable solutions that improve performance and reduce operational costs. Strong background in agile methodologies and cross-functional team leadership.",
    workExperience: [
        {
            jobTitle: "Senior Software Engineer",
            company: "Tech Innovations Inc.",
            location: "San Francisco, CA",
            dates: "Jan 2020 - Present",
            responsibilities: [
                "Led the development of a microservices architecture that improved system scalability by 200% and reduced response times by 40%",
                "Implemented CI/CD pipelines using Jenkins and Docker, reducing deployment time from 4 hours to 15 minutes",
                "Mentored junior developers and conducted code reviews, improving team productivity and code quality standards",
                "Collaborated with product managers to define technical requirements and deliver features that increased user engagement by 35%"
            ]
        },
        {
            jobTitle: "Software Developer",
            company: "Digital Solutions LLC",
            location: "Mountain View, CA",
            dates: "Jun 2016 - Dec 2019",
            responsibilities: [
                "Developed and maintained React-based frontend applications serving over 100,000 monthly active users",
                "Built RESTful APIs using Node.js and Express, handling high-volume traffic with 99.9% uptime",
                "Optimized database queries and implemented caching strategies that improved application performance by 60%",
                "Participated in agile sprint planning and daily standups, delivering features on schedule"
            ]
        }
    ],
    education: [
        {
            institution: "Stanford University",
            degree: "Master of Science in Computer Science",
            dates: "2014 - 2016"
        },
        {
            institution: "University of California, Berkeley",
            degree: "Bachelor of Science in Computer Engineering",
            dates: "2010 - 2014"
        }
    ],
    certifications: [
        {
            name: "AWS Certified Solutions Architect",
            issuer: "Amazon Web Services",
            date: "2022"
        },
        {
            name: "Google Cloud Professional Developer",
            issuer: "Google Cloud",
            date: "2021"
        }
    ],
    skills: [
        "JavaScript (ES6+)", "TypeScript", "React", "Node.js", "Python", 
        "AWS", "Docker", "Kubernetes", "CI/CD", "Microservices",
        "Agile Methodologies", "Team Leadership", "Problem Solving"
    ],
    optimizationDetails: {
        keywordsIntegrated: ["microservices", "scalability", "CI/CD", "cloud infrastructure", "agile"],
        skillsAligned: ["React", "Node.js", "AWS", "Docker", "Kubernetes"],
        experienceOptimizations: [
            "Quantified achievements with specific metrics",
            "Used action verbs to start bullet points",
            "Emphasized leadership and collaboration skills"
        ],
        summaryTailoring: "Enhanced to highlight cloud infrastructure experience and leadership capabilities specifically mentioned in the job description"
    }
};

// Function to test justification
function testJustificationImplementation() {
    console.log("=== Testing Full Justification Implementation ===\n");
    
    // Test 1: Check if CSS is loaded and applied
    const styleSheets = document.styleSheets;
    let cssLoaded = false;
    
    for (let i = 0; i < styleSheets.length; i++) {
        const sheet = styleSheets[i];
        if (sheet.href && sheet.href.includes('index.css')) {
            cssLoaded = true;
            break;
        }
    }
    
    console.log("1. CSS File Loaded:", cssLoaded ? "✓ PASS" : "✗ FAIL");
    
    // Test 2: Create test elements and check justification
    const testContainer = document.createElement('div');
    testContainer.id = 'cv-preview';
    testContainer.style.width = '600px';
    testContainer.style.padding = '20px';
    testContainer.style.backgroundColor = 'white';
    document.body.appendChild(testContainer);
    
    // Test professional summary
    const summaryPara = document.createElement('p');
    summaryPara.className = 'text-justify';
    summaryPara.textContent = sampleCvData.professionalSummary;
    testContainer.appendChild(summaryPara);
    
    const summaryStyle = window.getComputedStyle(summaryPara);
    const summaryJustified = summaryStyle.textAlign === 'justify';
    console.log("2. Professional Summary Justified:", summaryJustified ? "✓ PASS" : "✗ FAIL");
    
    // Test experience list
    const expList = document.createElement('ul');
    expList.className = 'cv-list cv-list--experience';
    sampleCvData.workExperience[0].responsibilities.forEach(resp => {
        const li = document.createElement('li');
        li.textContent = resp;
        expList.appendChild(li);
    });
    testContainer.appendChild(expList);
    
    const expItems = expList.querySelectorAll('li');
    let expAllJustified = true;
    expItems.forEach(item => {
        const style = window.getComputedStyle(item);
        if (style.textAlign !== 'justify') {
            expAllJustified = false;
        }
    });
    console.log("3. Experience Items Justified:", expAllJustified ? "✓ PASS" : "✗ FAIL");
    
    // Test skills list
    const skillsList = document.createElement('ul');
    skillsList.className = 'cv-list cv-list--skills';
    sampleCvData.skills.slice(0, 5).forEach(skill => {
        const li = document.createElement('li');
        li.textContent = skill;
        skillsList.appendChild(li);
    });
    testContainer.appendChild(skillsList);
    
    const skillsItems = skillsList.querySelectorAll('li');
    let skillsAllJustified = true;
    skillsItems.forEach(item => {
        const style = window.getComputedStyle(item);
        if (style.textAlign !== 'justify') {
            skillsAllJustified = false;
        }
    });
    console.log("4. Skills Items Justified:", skillsAllJustified ? "✓ PASS" : "✗ FAIL");
    
    // Test regular paragraph
    const regularPara = document.createElement('p');
    regularPara.textContent = "This is a test paragraph that should be justified according to the CSS rules for regular paragraphs without specific classes.";
    testContainer.appendChild(regularPara);
    
    const regularStyle = window.getComputedStyle(regularPara);
    const regularJustified = regularStyle.textAlign === 'justify';
    console.log("5. Regular Paragraph Justified:", regularJustified ? "✓ PASS" : "✗ FAIL");
    
    // Test headers (should remain left-aligned)
    const header = document.createElement('h2');
    header.textContent = "Test Header";
    testContainer.appendChild(header);
    
    const headerStyle = window.getComputedStyle(header);
    const headerLeftAligned = headerStyle.textAlign === 'left';
    console.log("6. Header Left-Aligned:", headerLeftAligned ? "✓ PASS" : "✗ FAIL");
    
    // Test word spacing and line height
    const wordSpacing = summaryStyle.wordSpacing;
    const lineHeight = summaryStyle.lineHeight;
    console.log("7. Word Spacing:", wordSpacing);
    console.log("8. Line Height:", lineHeight);
    
    // Clean up
    document.body.removeChild(testContainer);
    
    console.log("\n=== Justification Test Complete ===");
    
    // Overall result
    const allTestsPassed = cssLoaded && summaryJustified && expAllJustified && 
                          skillsAllJustified && regularJustified && headerLeftAligned;
    
    console.log("Overall Result:", allTestsPassed ? "✓ ALL TESTS PASSED" : "✗ SOME TESTS FAILED");
    
    return allTestsPassed;
}

// Export for use in browser console
window.testJustification = testJustificationImplementation;
window.sampleCvData = sampleCvData;

console.log("Justification test script loaded. Run testJustification() in console to test.");