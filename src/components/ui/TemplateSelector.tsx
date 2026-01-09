import { TemplateType } from '../../types/template';

interface TemplateSelectorProps {
  selectedTemplate: TemplateType;
  onSelectTemplate: (template: TemplateType) => void;
}

export const TemplateSelector = ({ selectedTemplate, onSelectTemplate }: TemplateSelectorProps) => {
  return (
    <div className='mb-6'>
      <h3 className='text-lg font-semibold text-gray-800 mb-3'>Choose CV Template</h3>
      <div className='grid grid-cols-2 md:grid-cols-5 gap-3'>
        <button
          onClick={() => onSelectTemplate('Standard')}
          className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            selectedTemplate === 'Standard'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          ⭐ Standard
        </button>
        <button
          onClick={() => onSelectTemplate('Classic')}
          className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            selectedTemplate === 'Classic'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          📄 Classic
        </button>
        <button
          onClick={() => onSelectTemplate('Modern')}
          className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            selectedTemplate === 'Modern'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          🎨 Modern
        </button>
        <button
          onClick={() => onSelectTemplate('Creative')}
          className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            selectedTemplate === 'Creative'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          ✨ Creative
        </button>
        <button
          onClick={() => onSelectTemplate('Minimal')}
          className={`p-3 rounded-lg font-medium text-sm transition-all duration-200 ${
            selectedTemplate === 'Minimal'
              ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105'
          }`}
        >
          🔲 Minimal
        </button>
      </div>
    </div>
  );
};
