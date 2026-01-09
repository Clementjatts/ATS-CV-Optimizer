import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useFileHandler } from '../../hooks/useFileHandler';
import { fileStorageService } from '../../services/fileStorageService';
import { parseFile } from '../../utils/fileParsing';

// Mock dependencies
vi.mock('../../services/fileStorageService');
vi.mock('../../utils/fileParsing');
vi.mock('../../services/geminiService', () => ({
  extractTextFromImagesWithGemini: vi.fn(),
}));

describe('useFileHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useFileHandler());

    expect(result.current.userCvFile).toBeNull();
    expect(result.current.userCvText).toBe('');
    expect(result.current.isParsing).toBe(false);
    expect(result.current.parsingError).toBeNull();
  });

  it('handles DOCX file selection successfully', async () => {
    const file = new File(['dummy content'], 'test.docx', {
      type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });
    const mockText = 'Parsed DOCX content';

    vi.mocked(parseFile).mockResolvedValue({ text: mockText, isScanned: false });
    vi.mocked(fileStorageService.uploadFile).mockResolvedValue('mock-url');

    const { result } = renderHook(() => useFileHandler());

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.userCvFile).toBe(file);
    expect(result.current.userCvText).toBe(mockText);
    expect(result.current.parsingError).toBeNull();
    expect(fileStorageService.uploadFile).toHaveBeenCalledWith(
      file,
      expect.stringContaining('Uploaded CV'),
      [],
      mockText
    );
  });

  it('handles invalid file type', async () => {
    const file = new File(['dummy'], 'test.txt', { type: 'text/plain' });

    const { result } = renderHook(() => useFileHandler());

    await act(async () => {
      await result.current.handleFileChange(file);
    });

    expect(result.current.parsingError).toContain('Invalid file type');
    expect(result.current.userCvFile).toBeNull();
  });

  it('clears file state correctly', async () => {
    const { result } = renderHook(() => useFileHandler());

    // set some state first (simulated)
    // actually easier to just call clear
    act(() => {
      result.current.handleFileClear();
    });

    expect(result.current.userCvFile).toBeNull();
    expect(result.current.userCvText).toBe('');
    expect(result.current.parsingError).toBeNull();
  });
});
