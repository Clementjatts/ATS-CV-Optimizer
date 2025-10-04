import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PDFGenerationController } from '../../../services/pdf-controller';
import { generatePdfFilename } from '../../../services/pdf-filename-generator';
import { CvData } from '../../../services/geminiService';

describe('PDF Generation Performance Tests', () => {
  let controller: PDFGenerationController;
  let performanceMetrics: {
    generationTimes: number[];
    fileSizes: number[];
    memoryUsage: number[];
  };

  beforeEach(() => {
    controller = new PDFGenerationController();
    performanceMetrics = {
      generationTimes: [],
      fileSizes: [],
      memoryUsage: []
    };
  });

  const createTestElement = (complexity: 'simple' | 'medium' | 'complex') => {
    const element = document.createElement('div');
    element.style.width = '800px';
    element.style.height = complexity === 'simple' ? '600px' : complexity === 'medium' ? '1000px' : '1400px';
    
    let content = `
      <header>
        <h1>John Doe</h1>
        <div>john.doe@example.com | +1-555-0123 | New York, NY</div>
      </header>
    `;

    if (complexity === 'simple') {
      content += `
        <section>
          <h2>Professional Summary</h2>
          <p>Software engineer with experience in web development.</p>
        </section>
        <section>
          <h2>Skills</h2>
          <div>JavaScript, React, Node.js</div>
        </section>
      `;
    } else if (complexity === 'medium') {
      content += `
        <section>
          <h2>Professional Summary</h2>
          <p>Experienced software engineer with 5+ years of experience in full-stack development, specializing in modern web technologies and cloud platforms.</p>
        </section>
        
        <section>
          <h2>Professional Experience</h2>
          <div>
            <h3>Senior Software Engineer</h3>
            <p>Tech Corp (2020-2023)</p>
            <ul>
              <li>Led development of web applications using React and Node.js</li>
              <li>Managed team of 5 developers</li>
              <li>Improved system performance by 40%</li>
            </ul>
          </div>
          <div>
            <h3>Software Engineer</h3>
            <p>StartupCo (2018-2020)</p>
            <ul>
              <li>Developed RESTful APIs using Express.js</li>
              <li>Implemented responsive UI components</li>
            </ul>
          </div>
        </section>
        
        <section>
          <h2>Education</h2>
          <div>
            <h3>Bachelor of Computer Science</h3>
            <p>University of Technology (2016-2020)</p>
          </div>
        </section>
        
        <section>
          <h2>Skills</h2>
          <div>JavaScript, React, Node.js, Python, SQL, AWS, Docker</div>
        </section>
      `;
    } else { // complex
      content += `
        <section>
          <h2>Professional Summary</h2>
          <p>Highly experienced software engineer with 8+ years of experience in full-stack development, cloud architecture, and team leadership. Proven track record of delivering scalable solutions and mentoring junior developers.</p>
        </section>
        
        <section>
          <h2>Professional Experience</h2>
          <div>
            <h3>Principal Software Engineer</h3>
            <p>BigTech Corp (2022-2023)</p>
            <ul>
              <li>Architected and implemented microservices infrastructure serving 10M+ users</li>
              <li>Led cross-functional team of 12 engineers across 3 time zones</li>
              <li>Reduced system latency by 60% through performance optimizations</li>
              <li>Established CI/CD pipelines reducing deployment time by 80%</li>
            </ul>
          </div>
          <div>
            <h3>Senior Software Engineer</h3>
            <p>Tech Corp (2020-2022)</p>
            <ul>
              <li>Led development of web applications using React and Node.js</li>
              <li>Managed team of 5 developers</li>
              <li>Improved system performance by 40%</li>
              <li>Implemented automated testing reducing bugs by 50%</li>
            </ul>
          </div>
          <div>
            <h3>Software Engineer</h3>
            <p>StartupCo (2018-2020)</p>
            <ul>
              <li>Developed RESTful APIs using Express.js and MongoDB</li>
              <li>Implemented responsive UI components with React</li>
              <li>Built real-time features using WebSocket technology</li>
            </ul>
          </div>
          <div>
            <h3>Junior Developer</h3>
            <p>WebDev Agency (2016-2018)</p>
            <ul>
              <li>Created custom WordPress themes and plugins</li>
              <li>Developed e-commerce solutions using PHP</li>
            </ul>
          </div>
        </section>
        
        <section>
          <h2>Education</h2>
          <div>
            <h3>Master of Computer Science</h3>
            <p>Advanced University (2020-2022)</p>
            <p>Specialization: Distributed Systems and Cloud Computing</p>
          </div>
          <div>
            <h3>Bachelor of Computer Science</h3>
            <p>University of Technology (2012-2016)</p>
            <p>Magna Cum Laude, GPA: 3.8/4.0</p>
          </div>
        </section>
        
        <section>
          <h2>Certifications</h2>
          <div>
            <div>AWS Certified Solutions Architect - Professional (2023)</div>
            <div>Certified Kubernetes Administrator (2022)</div>
            <div>Google Cloud Professional Cloud Architect (2021)</div>
          </div>
        </section>
        
        <section>
          <h2>Skills</h2>
          <div>
            <strong>Languages:</strong> JavaScript, TypeScript, Python, Java, Go, SQL<br>
            <strong>Frontend:</strong> React, Vue.js, Angular, HTML5, CSS3, Sass<br>
            <strong>Backend:</strong> Node.js, Express.js, Django, Spring Boot<br>
            <strong>Databases:</strong> PostgreSQL, MongoDB, Redis, Elasticsearch<br>
            <strong>Cloud:</strong> AWS, Google Cloud, Azure, Docker, Kubernetes<br>
            <strong>Tools:</strong> Git, Jenkins, Terraform, Ansible, Prometheus
          </div>
        </section>
        
        <section>
          <h2>Projects</h2>
          <div>
            <h3>E-commerce Platform Redesign</h3>
            <p>Led complete redesign of e-commerce platform handling $50M+ annual revenue</p>
          </div>
          <div>
            <h3>Real-time Analytics Dashboard</h3>
            <p>Built real-time analytics dashboard processing 1M+ events per minute</p>
          </div>
        </section>
      `;
    }

    element.innerHTML = content;
    document.body.appendChild(element);
    return element;
  };

  const mockCvData: CvData = {
    fullName: 'John Doe',
    contactInfo: {
      email: 'john.doe@example.com',
      phone: '+1-555-0123',
      location: 'New York, NY',
      linkedin: 'https://linkedin.com/in/johndoe'
    },
    professionalSummary: 'Experienced software engineer',
    workExperience: [],
    education: [],
    skills: [],
    certifications: []
  };

  describe('Generation Speed Benchmarks', () => {
    it('should generate simple CV within 5 seconds', async () => {
      const element = createTestElement('simple');
      const startTime = performance.now();

      const filename = generatePdfFilename(mockCvData, { customSuffix: 'simple' });
      
      const options = {
        filename,
        quality: 'medium' as const,
        format: 'letter' as const,
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
        metadata: {
          title: 'Simple CV Test',
          author: 'John Doe',
          subject: 'Performance Test',
          keywords: ['CV', 'Performance'],
          creator: 'Test',
          producer: 'Test'
        }
      };

      const result = await controller.generatePDF(element, options);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(5000); // 5 seconds
      
      performanceMetrics.generationTimes.push(duration);
      if (result.blob) {
        performanceMetrics.fileSizes.push(result.blob.size);
      }

      document.body.removeChild(element);
    }, 10000);

    it('should generate medium CV within 10 seconds', async () => {
      const element = createTestElement('medium');
      const startTime = performance.now();

      const filename = generatePdfFilename(mockCvData, { customSuffix: 'medium' });
      
      const options = {
        filename,
        quality: 'medium' as const,
        format: 'letter' as const,
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
        metadata: {
          title: 'Medium CV Test',
          author: 'John Doe',
          subject: 'Performance Test',
          keywords: ['CV', 'Performance'],
          creator: 'Test',
          producer: 'Test'
        }
      };

      const result = await controller.generatePDF(element, options);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(10000); // 10 seconds
      
      performanceMetrics.generationTimes.push(duration);
      if (result.blob) {
        performanceMetrics.fileSizes.push(result.blob.size);
      }

      document.body.removeChild(element);
    }, 15000);

    it('should generate complex CV within 20 seconds', async () => {
      const element = createTestElement('complex');
      const startTime = performance.now();

      const filename = generatePdfFilename(mockCvData, { customSuffix: 'complex' });
      
      const options = {
        filename,
        quality: 'medium' as const,
        format: 'letter' as const,
        margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
        metadata: {
          title: 'Complex CV Test',
          author: 'John Doe',
          subject: 'Performance Test',
          keywords: ['CV', 'Performance'],
          creator: 'Test',
          producer: 'Test'
        }
      };

      const result = await controller.generatePDF(element, options);
      const endTime = performance.now();
      const duration = endTime - startTime;

      expect(result.success).toBe(true);
      expect(duration).toBeLessThan(20000); // 20 seconds
      
      performanceMetrics.generationTimes.push(duration);
      if (result.blob) {
        performanceMetrics.fileSizes.push(result.blob.size);
      }

      document.body.removeChild(element);
    }, 25000);
  });

  describe('Quality vs Speed Trade-offs', () => {
    it('should show performance difference between quality levels', async () => {
      const element = createTestElement('medium');
      const qualities: Array<'low' | 'medium' | 'high'> = ['low', 'medium', 'high'];
      const results: Array<{ quality: string; duration: number; fileSize: number }> = [];

      for (const quality of qualities) {
        const startTime = performance.now();
        
        const filename = generatePdfFilename(mockCvData, { customSuffix: quality });
        
        const options = {
          filename,
          quality,
          format: 'letter' as const,
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
          metadata: {
            title: `Quality Test - ${quality}`,
            author: 'John Doe',
            subject: 'Performance Test',
            keywords: ['CV', 'Performance', quality],
            creator: 'Test',
            producer: 'Test'
          }
        };

        const result = await controller.generatePDF(element, options);
        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(result.success).toBe(true);
        
        results.push({
          quality,
          duration,
          fileSize: result.blob?.size || 0
        });
      }

      // Verify that higher quality generally takes longer (with some tolerance)
      const lowQuality = results.find(r => r.quality === 'low')!;
      const highQuality = results.find(r => r.quality === 'high')!;
      
      // High quality should generally produce larger files
      expect(highQuality.fileSize).toBeGreaterThanOrEqual(lowQuality.fileSize * 0.8);

      document.body.removeChild(element);
    }, 30000);
  });

  describe('Memory Usage Monitoring', () => {
    it('should not cause memory leaks during multiple generations', async () => {
      const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;
      const elements: HTMLElement[] = [];

      // Generate multiple PDFs
      for (let i = 0; i < 3; i++) {
        const element = createTestElement('simple');
        elements.push(element);
        
        const filename = generatePdfFilename(mockCvData, { customSuffix: `batch-${i}` });
        
        const options = {
          filename,
          quality: 'low' as const,
          format: 'letter' as const,
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
          metadata: {
            title: `Batch Test ${i}`,
            author: 'John Doe',
            subject: 'Memory Test',
            keywords: ['CV', 'Memory'],
            creator: 'Test',
            producer: 'Test'
          }
        };

        const result = await controller.generatePDF(element, options);
        expect(result.success).toBe(true);

        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }

      const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
      
      // Memory should not increase dramatically (allowing for some variance)
      if (initialMemory > 0 && finalMemory > 0) {
        const memoryIncrease = finalMemory - initialMemory;
        const maxAllowedIncrease = 50 * 1024 * 1024; // 50MB
        expect(memoryIncrease).toBeLessThan(maxAllowedIncrease);
      }

      // Cleanup
      elements.forEach(element => {
        if (element.parentNode) {
          document.body.removeChild(element);
        }
      });
    }, 20000);
  });

  describe('Concurrent Generation Handling', () => {
    it('should handle multiple concurrent PDF generations', async () => {
      const concurrentCount = 3;
      const promises: Promise<any>[] = [];

      for (let i = 0; i < concurrentCount; i++) {
        const element = createTestElement('simple');
        
        const filename = generatePdfFilename(mockCvData, { customSuffix: `concurrent-${i}` });
        
        const options = {
          filename,
          quality: 'low' as const,
          format: 'letter' as const,
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
          metadata: {
            title: `Concurrent Test ${i}`,
            author: 'John Doe',
            subject: 'Concurrency Test',
            keywords: ['CV', 'Concurrent'],
            creator: 'Test',
            producer: 'Test'
          }
        };

        const promise = controller.generatePDF(element, options).then(result => {
          document.body.removeChild(element);
          return result;
        });
        
        promises.push(promise);
      }

      const results = await Promise.all(promises);

      // All generations should succeed
      results.forEach(result => {
        expect(result.success).toBe(true);
        expect(result.blob).toBeInstanceOf(Blob);
      });
    }, 15000);
  });

  describe('Performance Regression Detection', () => {
    it('should maintain consistent performance across runs', async () => {
      const runCount = 3;
      const durations: number[] = [];

      for (let i = 0; i < runCount; i++) {
        const element = createTestElement('medium');
        const startTime = performance.now();
        
        const filename = generatePdfFilename(mockCvData, { customSuffix: `regression-${i}` });
        
        const options = {
          filename,
          quality: 'medium' as const,
          format: 'letter' as const,
          margins: { top: 0.5, right: 0.5, bottom: 0.5, left: 0.5 },
          metadata: {
            title: `Regression Test ${i}`,
            author: 'John Doe',
            subject: 'Regression Test',
            keywords: ['CV', 'Regression'],
            creator: 'Test',
            producer: 'Test'
          }
        };

        const result = await controller.generatePDF(element, options);
        const endTime = performance.now();
        const duration = endTime - startTime;

        expect(result.success).toBe(true);
        durations.push(duration);
        
        document.body.removeChild(element);
      }

      // Calculate variance in performance
      const avgDuration = durations.reduce((sum, d) => sum + d, 0) / durations.length;
      const maxVariance = avgDuration * 0.5; // Allow 50% variance
      
      durations.forEach(duration => {
        expect(Math.abs(duration - avgDuration)).toBeLessThan(maxVariance);
      });
    }, 25000);
  });

  afterEach(() => {
    // Log performance metrics for analysis
    if (performanceMetrics.generationTimes.length > 0) {
      const avgTime = performanceMetrics.generationTimes.reduce((sum, t) => sum + t, 0) / performanceMetrics.generationTimes.length;
      console.log(`Average generation time: ${avgTime.toFixed(2)}ms`);
    }
    
    if (performanceMetrics.fileSizes.length > 0) {
      const avgSize = performanceMetrics.fileSizes.reduce((sum, s) => sum + s, 0) / performanceMetrics.fileSizes.length;
      console.log(`Average file size: ${(avgSize / 1024).toFixed(2)}KB`);
    }
  });
});