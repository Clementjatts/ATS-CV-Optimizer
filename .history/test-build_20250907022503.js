// Simple test to check if the build works
console.log('Testing build...');

// Test basic imports
try {
  const React = require('react');
  console.log('✓ React import works');
} catch (e) {
  console.log('✗ React import failed:', e.message);
}

try {
  const jsPDF = require('jspdf');
  console.log('✓ jsPDF import works');
} catch (e) {
  console.log('✗ jsPDF import failed:', e.message);
}

try {
  const html2canvas = require('html2canvas');
  console.log('✓ html2canvas import works');
} catch (e) {
  console.log('✗ html2canvas import failed:', e.message);
}

try {
  const html2pdf = require('html2pdf.js');
  console.log('✓ html2pdf.js import works');
} catch (e) {
  console.log('✗ html2pdf.js import failed:', e.message);
}

console.log('Build test completed');