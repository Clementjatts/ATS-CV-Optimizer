import React from 'react';

export default function TestComponent() {
  const handleTest = async () => {
    try {
      console.log('Testing PDF controller import...');
      const { PDFGenerationController } = await import('./services/pdf-controller');
      console.log('✓ PDF controller imported successfully');
      
      const controller = new PDFGenerationController();
      console.log('✓ PDF controller instantiated successfully');
      
      const systemStatus = controller.isSystemReady();
      console.log('✓ System status check completed:', systemStatus);
      
    } catch (error) {
      console.error('✗ Test failed:', error);
    }
  };

  return (
    <div>
      <h1>PDF System Test</h1>
      <button onClick={handleTest}>Test PDF System</button>
    </div>
  );
}