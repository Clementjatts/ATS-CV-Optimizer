import React from 'react';

interface LabeledTextareaProps {
  id: string;
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  placeholder: string;
}

export const LabeledTextarea: React.FC<LabeledTextareaProps> = ({
  id,
  label,
  value,
  onChange,
  placeholder,
}) => (
  <div>
    <label htmlFor={id} className='block text-sm font-medium text-slate-700 mb-1'>
      {label}
    </label>
    <textarea
      id={id}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required
      className='w-full block p-3 border border-slate-300 rounded-md shadow-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition duration-150 ease-in-out text-sm h-32'
    />
  </div>
);
