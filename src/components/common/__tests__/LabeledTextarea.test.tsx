import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { LabeledTextarea } from '../LabeledTextarea';
// Import React to allow JSX
import React from 'react';

describe('LabeledTextarea', () => {
  it('renders label and textarea with correct attributes', () => {
    const handleChange = vi.fn();
    render(
      <LabeledTextarea
        id='test-id'
        label='Test Label'
        value=''
        onChange={handleChange}
        placeholder='Enter text'
      />
    );

    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter text')).toBeInTheDocument();
  });

  it('calls onChange when typed into', () => {
    const handleChange = vi.fn();
    render(
      <LabeledTextarea
        id='test-id'
        label='Test Label'
        value=''
        onChange={handleChange}
        placeholder='Enter text'
      />
    );

    const textarea = screen.getByPlaceholderText('Enter text');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(handleChange).toHaveBeenCalled();
  });
});
