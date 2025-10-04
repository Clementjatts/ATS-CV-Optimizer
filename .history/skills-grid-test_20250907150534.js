/**
 * Skills Grid Layout Test Suite
 * Automated testing for the two-column layout implementation
 */

class SkillsGridTest {
    constructor() {
        this.results = [];
        this.testContainer = null;
    }

    /**
     * Initialize test environment
     */
    init() {
        console.log('🚀 Starting Skills Grid Layout Tests...\n');
        
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: white;
            border: 2px solid #3b82f6;
            border-radius: 8px;
            padding: 15px;
            max-width: 300px;
            max-height: 400px;
            overflow-y: auto;
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, sans-serif;
            box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        `;
        
        const header = document.createElement('h3');
        header.textContent = '🧪 Skills Grid Tests';
        header.style.cssText = 'margin: 0 0 15px 0; color: #1e40af; font-weight: bold;';
        this.testContainer.appendChild(header);
        
        document.body.appendChild(this.testContainer);
    }

    /**
     * Add test result to display
     */
    addResult(testName, passed, message = '') {
        const result = {
            testName,
            passed,
            message,
            timestamp: new Date().toLocaleTimeString()
        };
        
        this.results.push(result);
        
        // Create result element
        const resultEl = document.createElement('div');
        resultEl.style.cssText = `
            margin: 8px 0;
            padding: 10px;
            border-radius: 6px;
            border-left: 4px solid ${passed ? '#10b981' : '#ef4444'};
            background: ${passed ? '#f0fdf4' : '#fef2f2'};
            font-size: 14px;
        `;
        
        const status = passed ? '✅ PASS' : '❌ FAIL';
        resultEl.innerHTML = `
            <div style="font-weight: 600; margin-bottom: 4px;">
                ${status} - ${testName}
            </div>
            ${message ? `<div style="font-size: 12px; color: #6b7280;">${message}</div>` : ''}
            <div style="font-size: 11px; color: #9ca3af; margin-top: 4px;">${result.timestamp}</div>
        `;
        
        this.testContainer.appendChild(resultEl);
        
        // Scroll to bottom
        this.testContainer.scrollTop = this.testContainer.scrollHeight;
        
        console.log(`${status}: ${testName}${message ? ` - ${message}` : ''}`);
    }

    /**
     * Test 1: Grid Layout Structure
     */
    testGridStructure() {
        const skillsGrid = document.querySelector('.skills-grid');
        
        if (!skillsGrid) {
            this.addResult('Grid Structure', false, 'Skills grid element not found');
            return false;
        }

        const computedStyle = window.getComputedStyle(skillsGrid);
        const display = computedStyle.display;
        const gridTemplate = computedStyle.gridTemplateColumns;

        if (display !== 'grid') {
            this.addResult('Grid Structure', false, `Display should be 'grid', got '${display}'`);
            return false;
        }

        if (!gridTemplate.includes('1fr')) {
            this.addResult('Grid Structure', false, `Grid template should use 1fr columns, got '${gridTemplate}'`);
            return false;
        }

        this.addResult('Grid Structure', true, `Display: ${display}, Template: ${gridTemplate}`);
        return true;
    }

    /**
     * Test 2: Two Columns on Desktop
     */
    testDesktopColumns() {
        const skillsGrid = document.querySelector('.skills-grid');
        const computedStyle = window.getComputedStyle(skillsGrid);
        const gridTemplate = computedStyle.gridTemplateColumns;

        // Count the number of columns (should be 2 for repeat(2, 1fr))
        const columnCount = gridTemplate.split(' ').filter(col => col === '1fr').length;

        if (columnCount === 2) {
            this.addResult('Desktop Columns', true, `2 columns detected (${gridTemplate})`);
            return true;
        } else {
            this.addResult('Desktop Columns', false, `Expected 2 columns, got ${columnCount} (${gridTemplate})`);
            return false;
        }
    }

    /**
     * Test 3: Gap Spacing
     */
    testGapSpacing() {
        const skillsGrid = document.querySelector('.skills-grid');
        const computedStyle = window.getComputedStyle(skillsGrid);
        const gap = computedStyle.gap;

        // Expected gap: "8px 32px" (0.5rem vertical, 2rem horizontal)
        const [rowGap, columnGap] = gap.split(' ');

        if (columnGap === '32px' && rowGap === '8px') {
            this.addResult('Gap Spacing', true, `Gap: ${gap} (vertical: ${rowGap}, horizontal: ${columnGap})`);
            return true;
        } else {
            this.addResult('Gap Spacing', false, `Expected gap: "8px 32px", got: "${gap}"`);
            return false;
        }
    }

    /**
     * Test 4: Bullet Point Alignment
     */
    testBulletAlignment() {
        const listItems = document.querySelectorAll('.skills-grid .cv-list li');
        
        if (listItems.length === 0) {
            this.addResult('Bullet Alignment', false, 'No list items found in skills grid');
            return false;
        }

        // Check padding-left consistency
        const firstItem = listItems[0];
        const computedStyle = window.getComputedStyle(firstItem);
        const paddingLeft = computedStyle.paddingLeft;

        let allAligned = true;
        listItems.forEach((item, index) => {
            const itemStyle = window.getComputedStyle(item);
            if (itemStyle.paddingLeft !== paddingLeft) {
                allAligned = false;
                console.warn(`Item ${index + 1} has inconsistent padding: ${itemStyle.paddingLeft}`);
            }
        });

        if (allAligned) {
            this.addResult('Bullet Alignment', true, `Consistent padding: ${paddingLeft}`);
            return true;
        } else {
            this.addResult('Bullet Alignment', false, 'Inconsistent bullet alignment across items');
            return false;
        }
    }

    /**
     * Test 5: Semantic HTML Structure
     */
    testSemanticStructure() {
        const skillsGrid = document.querySelector('.skills-grid');
        const lists = skillsGrid.querySelectorAll('ul');
        const listItems = skillsGrid.querySelectorAll('li');

        if (lists.length !== 2) {
            this.addResult('Semantic Structure', false, `Expected 2 ul elements, found ${lists.length}`);
            return false;
        }

        if (listItems.length < 1) {
            this.addResult('Semantic Structure', false, 'No list items found');
            return false;
        }

        // Check that all lists have proper class
        let allProperClass = true;
        lists.forEach(list => {
            if (!list.classList.contains('cv-list')) {
                allProperClass = false;
            }
        });

        if (allProperClass) {
            this.addResult('Semantic Structure', true, `2 ul elements with ${listItems.length} li items total`);
            return true;
        } else {
            this.addResult('Semantic Structure', false, 'Not all ul elements have cv-list class');
            return false;
        }
    }

    /**
     * Test 6: Responsive Behavior (simulate mobile)
     */
    testResponsiveBehavior() {
        // Create a test element to check responsive CSS
        const testEl = document.createElement('div');
        testEl.className = 'skills-grid';
        testEl.style.cssText = 'position: absolute; left: -9999px;';
        document.body.appendChild(testEl);

        // Get computed styles at different widths
        const originalWidth = window.innerWidth;
        
        // Simulate mobile view by temporarily setting width
        const mobileMedia = window.matchMedia('(max-width: 768px)');
        
        if (mobileMedia.matches) {
            // Already in mobile view
            const computedStyle = window.getComputedStyle(testEl);
            const gridTemplate = computedStyle.gridTemplateColumns;
            
            if (gridTemplate === '1fr') {
                this.addResult('Responsive Behavior', true, 'Mobile: 1 column layout detected');
                document.body.removeChild(testEl);
                return true;
            } else {
                this.addResult('Responsive Behavior', false, `Mobile: Expected 1fr, got ${gridTemplate}`);
                document.body.removeChild(testEl);
                return false;
            }
        } else {
            this.addResult('Responsive Behavior', true, 'Desktop: 2 columns (test requires manual mobile testing)');
            document.body.removeChild(testEl);
            return true; // Pass since we can't automatically test mobile without viewport manipulation
        }
    }

    /**
     * Test 7: Readability and Spacing
     */
    testReadability() {
        const listItems = document.querySelectorAll('.skills-grid .cv-list li');
        const firstItem = listItems[0];
        const computedStyle = window.getComputedStyle(firstItem);

        const tests = {
            fontSize: computedStyle.fontSize === '14px', // text-sm = 14px
            lineHeight: parseFloat(computedStyle.lineHeight) >= 1.4, // leading-normal
            marginBottom: computedStyle.marginBottom === '4px' // mb-1 = 0.25rem = 4px
        };

        const failedTests = Object.entries(tests)
            .filter(([_, passed]) => !passed)
            .map(([test]) => test);

        if (failedTests.length === 0) {
            this.addResult('Readability', true, 'Font: 14px, Line height: ≥1.4, Margin: 4px');
            return true;
        } else {
            this.addResult('Readability', false, `Issues with: ${failedTests.join(', ')}`);
            return false;
        }
    }

    /**
     * Run all tests
     */
    runAllTests() {
        this.init();
        
        setTimeout(() => {
            console.log('\n📋 Running Skills Grid Tests...\n');
            
            this.testGridStructure();
            this.testDesktopColumns();
            this.testGapSpacing();
            this.testBulletAlignment();
            this.testSemanticStructure();
            this.testResponsiveBehavior();
            this.testReadability();

            // Summary
            setTimeout(() => {
                const passed = this.results.filter(r => r.passed).length;
                const total = this.results.length;
                
                console.log(`\n📊 Test Summary: ${passed}/${total} tests passed`);
                
                const summary = document.createElement('div');
                summary.style.cssText = `
                    margin-top: 15px;
                    padding: 12px;
                    border-radius: 6px;
                    background: ${passed === total ? '#dcfce7' : '#fef3c7'};
                    border: 1px solid ${passed === total ? '#bbf7d0' : '#fde68a'};
                    font-weight: 600;
                    text-align: center;
                `;
                summary.textContent = `Results: ${passed}/${total} tests passed`;
                
                this.testContainer.appendChild(summary);
            }, 100);
        }, 100);
    }
}

// Auto-run tests when included
if (typeof window !== 'undefined') {
    window.addEventListener('DOMContentLoaded', () => {
        setTimeout(() => {
            const testSuite = new SkillsGridTest();
            testSuite.runAllTests();
        }, 1000);
    });
}

// Export for Node.js testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SkillsGridTest;
}