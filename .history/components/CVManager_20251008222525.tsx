import React, { useState, useEffect } from 'react';
import { cvService, SavedCV, CVSearchFilters, CVSource } from '../services/cvService';
import { fileStorageService, UploadedFile } from '../services/fileStorageService';
import { CvData } from '../services/geminiService';
import { 
  PlusIcon, 
  MagnifyingGlassIcon, 
  TrashIcon, 
  PencilIcon,
  EyeIcon,
  TagIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  DownloadIcon
} from './icons';

interface CVManagerProps {
  onSelectCV: (cv: CVSource) => void;
  onSelectMultipleCVs?: (cvs: CVSource[]) => void; // New prop for multi-select
  onClose: () => void;
  isOpen: boolean;
}

const CVManager: React.FC<CVManagerProps> = ({ onSelectCV, onSelectMultipleCVs, onClose, isOpen }) => {
  const [savedCVs, setSavedCVs] = useState<SavedCV[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [filteredCVs, setFilteredCVs] = useState<CVSource[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<CVSearchFilters>({});
  const [showSaveForm, setShowSaveForm] = useState(false);
  const [selectedCV, setSelectedCV] = useState<CVSource | null>(null);
  const [activeTab, setActiveTab] = useState<'optimized' | 'uploaded'>('optimized');
  const [selectedCVs, setSelectedCVs] = useState<CVSource[]>([]); // New state for multi-select
  const [isMultiSelectMode, setIsMultiSelectMode] = useState(false); // New state for multi-select mode

  // Form state for saving new CV
  const [saveForm, setSaveForm] = useState({
    name: '',
    jobTitle: '',
    company: '',
    industry: '',
    description: '',
    tags: [] as string[],
    tagInput: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadCVs();
    }
  }, [isOpen]);

  useEffect(() => {
    filterCVs();
  }, [savedCVs, uploadedFiles, searchTerm, filters, activeTab]);

  const loadCVs = async () => {
    setLoading(true);
    try {
      const [cvs, files] = await Promise.all([
        cvService.getAllCVs(),
        fileStorageService.getAllUploadedFiles()
      ]);
      setSavedCVs(cvs);
      setUploadedFiles(files);
    } catch (error) {
      console.error('Failed to load CVs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterCVs = () => {
    const currentData = activeTab === 'optimized' ? savedCVs : uploadedFiles;
    let filtered = currentData;

    // Text search
    if (searchTerm) {
      filtered = filtered.filter(item => {
        if ('content' in item) {
          // It's a SavedCV
          const cv = item as SavedCV;
          return cv.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 cv.jobTitle?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 cv.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 cv.description?.toLowerCase().includes(searchTerm.toLowerCase());
        } else {
          // It's an UploadedFile
          const file = item as UploadedFile;
          return file.fileName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 file.description?.toLowerCase().includes(searchTerm.toLowerCase());
        }
      });
    }

    // Apply filters (only for optimized CVs)
    if (activeTab === 'optimized') {
      const cvFiltered = filtered as SavedCV[];
      if (filters.jobTitle) {
        filtered = cvFiltered.filter(cv => cv.jobTitle === filters.jobTitle);
      }
      if (filters.industry) {
        filtered = cvFiltered.filter(cv => cv.industry === filters.industry);
      }
    }

    setFilteredCVs(filtered);
  };

  const handleSaveCV = async (cvData: CvData) => {
    try {
      const cvToSave: Omit<SavedCV, 'id' | 'createdAt' | 'updatedAt'> = {
        name: saveForm.name || `${cvData.fullName} - ${saveForm.jobTitle || 'CV'}`,
        content: JSON.stringify(cvData),
        jobTitle: saveForm.jobTitle,
        company: saveForm.company,
        industry: saveForm.industry,
        skills: cvData.skills,
        experience: cvData.workExperience.map(exp => exp.jobTitle),
        education: cvData.education.map(edu => edu.institution),
        tags: saveForm.tags,
        description: saveForm.description
      };

      await cvService.saveCV(cvToSave);
      await loadCVs();
      setShowSaveForm(false);
      resetSaveForm();
    } catch (error) {
      console.error('Failed to save CV:', error);
    }
  };

  const handleDeleteCV = async (cvId: string) => {
    if (window.confirm('Are you sure you want to delete this CV?')) {
      try {
        await cvService.deleteCV(cvId);
        await loadCVs();
      } catch (error) {
        console.error('Failed to delete CV:', error);
      }
    }
  };

  const handleDeleteFile = async (fileId: string, storagePath: string) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await fileStorageService.deleteFile(fileId, storagePath);
        await loadCVs();
      } catch (error) {
        console.error('Failed to delete file:', error);
      }
    }
  };

  const handleDownloadFile = async (file: UploadedFile) => {
    try {
      await fileStorageService.downloadFile(file.downloadURL, file.fileName);
    } catch (error) {
      console.error('Failed to download file:', error);
    }
  };

  // Multi-select handlers
  const handleToggleMultiSelect = () => {
    setIsMultiSelectMode(!isMultiSelectMode);
    setSelectedCVs([]); // Clear selections when toggling mode
  };

  const handleToggleCVSelection = (cv: CVSource) => {
    setSelectedCVs(prev => {
      const isSelected = prev.some(selected => 
        ('id' in selected && 'id' in cv && selected.id === cv.id) ||
        ('fileName' in selected && 'fileName' in cv && selected.fileName === cv.fileName)
      );
      
      if (isSelected) {
        return prev.filter(selected => 
          !(('id' in selected && 'id' in cv && selected.id === cv.id) ||
            ('fileName' in selected && 'fileName' in cv && selected.fileName === cv.fileName))
        );
      } else {
        return [...prev, cv];
      }
    });
  };

  const handleUseSelectedCVs = () => {
    if (onSelectMultipleCVs && selectedCVs.length > 0) {
      onSelectMultipleCVs(selectedCVs);
      onClose();
    }
  };

  const resetSaveForm = () => {
    setSaveForm({
      name: '',
      jobTitle: '',
      company: '',
      industry: '',
      description: '',
      tags: [],
      tagInput: ''
    });
  };

  const addTag = () => {
    if (saveForm.tagInput.trim() && !saveForm.tags.includes(saveForm.tagInput.trim())) {
      setSaveForm(prev => ({
        ...prev,
        tags: [...prev.tags, prev.tagInput.trim()],
        tagInput: ''
      }));
    }
  };

  const removeTag = (tagToRemove: string) => {
    setSaveForm(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-pink-600 p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">CV Database</h2>
              <p className="text-purple-100">Manage and select from your saved CVs</p>
            </div>
            <div className="flex items-center space-x-4">
              {/* Multi-select toggle */}
              <button
                onClick={handleToggleMultiSelect}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isMultiSelectMode 
                    ? 'bg-white text-purple-600 hover:bg-purple-50' 
                    : 'bg-purple-500 text-white hover:bg-purple-400'
                }`}
              >
                {isMultiSelectMode ? 'Exit Multi-Select' : 'Multi-Select'}
              </button>
              
              {/* Close button */}
              <button
                onClick={onClose}
                className="text-white hover:text-purple-200 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        <div className="p-6">
          {/* Tabs */}
          <div className="mb-6">
            <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('optimized')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'optimized'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Optimized CVs ({savedCVs.length})
              </button>
              <button
                onClick={() => setActiveTab('uploaded')}
                className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                  activeTab === 'uploaded'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Uploaded Files ({uploadedFiles.length})
              </button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 space-y-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search CVs..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <button
                onClick={() => setShowSaveForm(true)}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300 flex items-center gap-2"
              >
                <PlusIcon className="w-5 h-5" />
                Save Current CV
              </button>
            </div>

          </div>

          {/* CV Grid */}
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading CVs...</p>
            </div>
          ) : (
            <>
              {/* Multi-select controls */}
              {isMultiSelectMode && (
                <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800">Multi-Select Mode</h3>
                      <p className="text-sm text-gray-600">
                        {selectedCVs.length} CV{selectedCVs.length !== 1 ? 's' : ''} selected
                      </p>
                    </div>
                    {selectedCVs.length > 0 && (
                      <button
                        onClick={handleUseSelectedCVs}
                        className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 font-medium"
                      >
                        Use Selected CVs ({selectedCVs.length})
                      </button>
                    )}
                  </div>
                </div>
              )}
              
              <div className="max-h-96 overflow-y-auto pr-2">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCVs.map((item) => {
                const isOptimizedCV = 'content' in item;
                const cv = item as SavedCV;
                const file = item as UploadedFile;
                
                const isSelected = selectedCVs.some(selected => 
                  ('id' in selected && 'id' in item && selected.id === item.id) ||
                  ('fileName' in selected && 'fileName' in item && selected.fileName === item.fileName)
                );

                return (
                  <div key={item.id} className={`bg-gradient-to-br from-white to-purple-50 border rounded-xl p-4 hover:shadow-lg transition-all duration-300 hover:scale-105 ${
                    isMultiSelectMode && isSelected ? 'border-blue-500 bg-blue-50' : 'border-purple-200'
                  }`}>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-start space-x-3 flex-1">
                        {/* Multi-select checkbox */}
                        {isMultiSelectMode && (
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleToggleCVSelection(item)}
                            className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                        )}
                        <h3 className="font-bold text-lg text-gray-800 truncate">
                          {isOptimizedCV ? cv.name : file.fileName}
                        </h3>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedCV(item)}
                          className="text-blue-600 hover:text-blue-800"
                          title="View Details"
                        >
                          <EyeIcon className="w-4 h-4" />
                        </button>
                        {isOptimizedCV ? (
                          <button
                            onClick={() => handleDeleteCV(cv.id!)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        ) : (
                          <>
                            <button
                              onClick={() => handleDownloadFile(file)}
                              className="text-green-600 hover:text-green-800"
                              title="Download"
                            >
                              <DownloadIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteFile(file.id!, file.storagePath)}
                              className="text-red-600 hover:text-red-800"
                              title="Delete"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600">
                      {isOptimizedCV ? (
                        <>
                          {cv.jobTitle && (
                            <div className="flex items-center gap-2">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              <span>{cv.jobTitle}</span>
                            </div>
                          )}
                          {cv.company && (
                            <div className="flex items-center gap-2">
                              <BuildingOfficeIcon className="w-4 h-4" />
                              <span>{cv.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{cv.updatedAt.toDate().toLocaleDateString()}</span>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{fileStorageService.getFileTypeIcon(file.fileType)}</span>
                            <span>{fileStorageService.formatFileSize(file.fileSize)}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4" />
                            <span>{file.uploadedAt.toDate().toLocaleDateString()}</span>
                          </div>
                        </>
                      )}
                    </div>

                    {(isOptimizedCV ? cv.tags : file.tags).length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {(isOptimizedCV ? cv.tags : file.tags).slice(0, 3).map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded-full">
                            {tag}
                          </span>
                        ))}
                        {(isOptimizedCV ? cv.tags : file.tags).length > 3 && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                            +{(isOptimizedCV ? cv.tags : file.tags).length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {!isMultiSelectMode && (
                      <button
                        onClick={() => onSelectCV(item)}
                        className="w-full mt-4 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                      >
                        {isOptimizedCV ? 'Use This CV' : 'Use This File'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
            </>
          )}

          {filteredCVs.length === 0 && !loading && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-600 mb-2">No CVs Found</h3>
              <p className="text-gray-500">Start by saving your first CV to build your database.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CVManager;
