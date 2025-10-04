// Test individual imports to identify issues
console.log('Testing imports...');

async function testImports() {
  try {
    console.log('Testing React...');
    const React = await import('react');
    console.log('✓ React imported successfully');
  } catch (e) {
    console.log('✗ React import failed:', e.message);
  }

  try {
    console.log('Testing jsPDF...');
    const jsPDF = await import('jspdf');
    console.log('✓ jsPDF imported successfully');
  } catch (e) {
    console.log('✗ jsPDF import failed:', e.message);
  }

  try {
    console.log('Testing html2canvas...');
    const html2canvas = await import('html2canvas');
    console.log('✓ html2canvas imported successfully');
  } catch (e) {
    console.log('✗ html2canvas import failed:', e.message);
  }

  try {
    console.log('Testing html2pdf.js...');
    const html2pdf = await import('html2pdf.js');
    console.log('✓ html2pdf.js imported successfully');
  } catch (e) {
    console.log('✗ html2pdf.js import failed:', e.message);
  }

  try {
    console.log('Testing PDF controller...');
    const { PDFGenerationController } = await import('./services/pdf-controller.js');
    console.log('✓ PDF controller imported successfully');
    
    const controller = new PDFGenerationController();
    console.log('✓ PDF controller instantiated successfully');
  } catch (e) {
    console.log('✗ PDF controller import/instantiation failed:', e.message);
  }

  try {
    console.log('Testing PDF filename generator...');
    const { generatePdfFilename } = await import('./services/pdf-filename-generator.js');
    console.log('✓ PDF filename generator imported successfully');
  } catch (e) {
    console.log('✗ PDF filename generator import failed:', e.message);
  }
}

testImports().then(() => {
  console.log('Import testing completed');
}).catch(e => {
  console.log('Import testing failed:', e.message);
});