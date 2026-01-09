import React, { useRef, useState } from 'react';
import {
  LoadingSpinner,
  XCircleIcon,
  FileIcon,
  TrashIcon,
  CheckCircleIcon,
  UploadIcon,
} from '../icons';

export interface FileInputProps {
  id: string;
  label: string;
  file: File | null;
  onFileChange: (file: File) => void;
  onFileClear: () => void;
  isLoading: boolean;
  loadingText: string;
  parsingError: string | null;
}

export const FileInput: React.FC<FileInputProps> = ({
  id,
  label,
  file,
  onFileChange,
  onFileClear,
  isLoading,
  loadingText,
  parsingError,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) onFileChange(selectedFile);
  };

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) onFileChange(droppedFile);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div>
      <label htmlFor={id} className='block text-sm font-medium text-slate-700 mb-1'>
        {label}
      </label>
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        className={`relative w-full p-3 border-2 border-dashed rounded-lg transition-colors duration-200 h-32 flex flex-col items-center justify-center text-center
                    ${isDragging ? 'border-purple-500 bg-purple-50' : 'border-purple-300'}
                    ${file || isLoading || parsingError ? 'bg-gradient-to-br from-purple-50 to-pink-50' : 'cursor-pointer hover:border-purple-400 hover:bg-purple-50/50'}`}
        onClick={() => !(file || isLoading || parsingError) && inputRef.current?.click()}
      >
        <input
          type='file'
          id={id}
          ref={inputRef}
          onChange={handleFileSelect}
          accept='.pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          className='hidden'
        />
        {isLoading ? (
          <div className='text-slate-500'>
            <LoadingSpinner className='mx-auto h-6 w-6 text-indigo-500' />
            <p className='mt-1 text-sm font-semibold'>{loadingText}</p>
          </div>
        ) : parsingError ? (
          <div className='text-red-600'>
            <XCircleIcon className='mx-auto h-6 w-6' />
            <p className='mt-1 text-sm font-bold'>File Error</p>
            <p className='text-xs'>{parsingError}</p>
            <button
              onClick={onFileClear}
              className='mt-1 text-xs font-semibold text-indigo-600 hover:underline'
            >
              Try again
            </button>
          </div>
        ) : file ? (
          <div className='text-slate-700 w-full'>
            <div className='flex items-center gap-2'>
              <FileIcon className='h-6 w-6 text-indigo-500 flex-shrink-0' />
              <div className='text-left overflow-hidden flex-1'>
                <p className='text-sm font-semibold truncate' title={file.name}>
                  {file.name}
                </p>
                <p className='text-xs text-slate-500'>{formatFileSize(file.size)}</p>
              </div>
              <button
                onClick={onFileClear}
                className='p-1 text-slate-500 hover:text-red-600 rounded-full focus:outline-none focus:ring-2 focus:ring-red-500'
              >
                <TrashIcon className='h-4 w-4' />
              </button>
            </div>
            <div className='flex items-center gap-1 text-green-600 mt-1 bg-green-50 p-1 rounded text-xs'>
              <CheckCircleIcon className='h-3 w-3' />
              <span className='font-semibold'>Ready</span>
            </div>
          </div>
        ) : (
          <div className='text-slate-500'>
            <UploadIcon className='mx-auto h-6 w-6' />
            <p className='mt-1 text-sm font-semibold'>
              Drop CV or <span className='text-indigo-600'>click to upload</span>
            </p>
            <p className='text-xs'>DOCX, PDF</p>
          </div>
        )}
      </div>
    </div>
  );
};
