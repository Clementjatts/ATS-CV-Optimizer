import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock HTML2Canvas
vi.mock('html2canvas', () => ({
  default: vi.fn(() => Promise.resolve({
    toDataURL: vi.fn(() => 'data:image/png;base64,mock-image-data'),
    width: 800,
    height: 600
  }))
}));

// Mock jsPDF
vi.mock('jspdf', () => ({
  default: vi.fn(() => ({
    addImage: vi.fn(),
    text: vi.fn(),
    setFont: vi.fn(),
    setFontSize: vi.fn(),
    setProperties: vi.fn(),
    output: vi.fn(() => new ArrayBuffer(1024)),
    internal: {
      write: vi.fn()
    }
  }))
}));

// Mock html2pdf.js
vi.mock('html2pdf.js', () => ({
  default: vi.fn(() => ({
    set: vi.fn().mockReturnThis(),
    from: vi.fn().mockReturnThis(),
    save: vi.fn(() => Promise.resolve()),
    outputPdf: vi.fn(() => Promise.resolve(new Blob(['mock pdf'], { type: 'application/pdf' })))
  }))
}));

// Mock PDF.js
vi.mock('pdfjs-dist', () => ({
  GlobalWorkerOptions: {
    workerSrc: ''
  },
  getDocument: vi.fn(() => ({
    promise: Promise.resolve({
      numPages: 1,
      getPage: vi.fn(() => Promise.resolve({
        getTextContent: vi.fn(() => Promise.resolve({
          items: [{ str: 'mock text content' }]
        })),
        render: vi.fn(() => ({
          promise: Promise.resolve()
        })),
        getViewport: vi.fn(() => ({
          width: 800,
          height: 600
        }))
      }))
    })
  }))
}));

// Mock browser APIs
Object.defineProperty(window, 'performance', {
  value: {
    memory: {
      jsHeapSizeLimit: 100 * 1024 * 1024
    },
    now: vi.fn(() => Date.now())
  }
});

// Mock performance.now globally
Object.defineProperty(global, 'performance', {
  value: {
    ...global.performance,
    now: vi.fn(() => Date.now())
  },
  writable: true
});

// Mock canvas context
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  getImageData: vi.fn(() => ({
    data: new Uint8ClampedArray([255, 255, 255, 255])
  }))
}));

// Mock URL.createObjectURL and revokeObjectURL
global.URL.createObjectURL = vi.fn(() => 'mock-object-url');
global.URL.revokeObjectURL = vi.fn();

// Mock HTMLElement properties for dimensions
Object.defineProperty(HTMLElement.prototype, 'offsetWidth', {
  get: function() {
    return parseInt(this.style.width) || 800;
  }
});

Object.defineProperty(HTMLElement.prototype, 'offsetHeight', {
  get: function() {
    return parseInt(this.style.height) || 600;
  }
});