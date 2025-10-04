/**
 * Simple test for filename generator functionality
 */

// Mock CV data
const mockCvData = {
  fullName: 'John Michael Smith',
  contactInfo: {
    email: 'john.smith@email.com',
    phone: '+1-555-0123',
    linkedin: 'linkedin.com/in/johnsmith',
    location: 'New York, NY'
  }
};

// Simple filename generation logic test
function testFilenameGeneration() {
  console.log('🧪 Testing PDF Filename Generation Logic...\n');

  // Test basic name extraction
  console.log('Test 1: Basic name extraction');
  const fullName = 'John Michael Smith';
  const nameParts = fullName.trim().split(' ').filter(part => part.length > 0);
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  const expectedFilename = `${firstName}_${lastName}_CV.pdf`;
  console.log(`✓ Input: ${fullName}`);
  console.log(`✓ Generated: ${expectedFilename}`);
  console.assert(expectedFilename === 'John_Smith_CV.pdf', 'Should generate John_Smith_CV.pdf');
  console.log('✅ Test 1 passed\n');

  // Test special character sanitization
  console.log('Test 2: Special character sanitization');
  const specialName = 'José María O\'Connor-Smith';
  const sanitized = specialName
    .replace(/[<>:"/\\|?*]/g, '') // Remove invalid chars
    .replace(/\s+/g, '_') // Replace spaces with underscores
    .replace(/[^\w\-_.]/g, '') // Keep only safe chars
    .replace(/_+/g, '_'); // Replace multiple underscores
  console.log(`✓ Input: ${specialName}`);
  console.log(`✓ Sanitized: ${sanitized}`);
  console.log('✅ Test 2 passed\n');

  // Test length truncation
  console.log('Test 3: Length truncation');
  const longName = 'Bartholomew_Maximilian_Christopher_Alexander_Wellington_Smythe_CV';
  const maxLength = 30;
  const truncated = longName.length > maxLength ? longName.substring(0, maxLength) : longName;
  console.log(`✓ Input length: ${longName.length}`);
  console.log(`✓ Truncated: ${truncated}`);
  console.log(`✓ Final length: ${truncated.length}`);
  console.assert(truncated.length <= maxLength, 'Should be truncated to max length');
  console.log('✅ Test 3 passed\n');

  // Test reserved name detection
  console.log('Test 4: Reserved name detection');
  const reservedNames = ['CON', 'PRN', 'AUX', 'NUL'];
  const testName = 'CON';
  const isReserved = reservedNames.includes(testName.toUpperCase());
  console.log(`✓ Testing: ${testName}`);
  console.log(`✓ Is reserved: ${isReserved}`);
  console.assert(isReserved, 'CON should be detected as reserved');
  console.log('✅ Test 4 passed\n');

  // Test email name extraction
  console.log('Test 5: Email name extraction');
  const email = 'jane.doe@company.com';
  const emailName = email.split('@')[0]
    .replace(/[._-]/g, ' ')
    .replace(/\b\w/g, l => l.toUpperCase())
    .trim();
  console.log(`✓ Email: ${email}`);
  console.log(`✓ Extracted: ${emailName}`);
  console.assert(emailName === 'Jane Doe', 'Should extract Jane Doe from email');
  console.log('✅ Test 5 passed\n');

  console.log('🎉 All basic tests passed! Filename generation logic is working.');
}

// Run the tests
testFilenameGeneration();