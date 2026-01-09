import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { TemplateSelector } from '../TemplateSelector';
import React from 'react';

describe('TemplateSelector', () => {
  it('renders all template options', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selectedTemplate='Standard' onSelectTemplate={onSelect} />);

    expect(screen.getByText('⭐ Standard')).toBeInTheDocument();
    expect(screen.getByText('📄 Classic')).toBeInTheDocument();
    expect(screen.getByText('🎨 Modern')).toBeInTheDocument();
    expect(screen.getByText('✨ Creative')).toBeInTheDocument();
    expect(screen.getByText('🔲 Minimal')).toBeInTheDocument();
  });

  it('highlights the selected template', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selectedTemplate='Modern' onSelectTemplate={onSelect} />);

    const modernBtn = screen.getByText('🎨 Modern');
    expect(modernBtn).toHaveClass('bg-gradient-to-r');

    const standardBtn = screen.getByText('⭐ Standard');
    expect(standardBtn).toHaveClass('bg-gray-100');
  });

  it('calls onSelectTemplate when a template is clicked', () => {
    const onSelect = vi.fn();
    render(<TemplateSelector selectedTemplate='Standard' onSelectTemplate={onSelect} />);

    fireEvent.click(screen.getByText('✨ Creative'));
    expect(onSelect).toHaveBeenCalledWith('Creative');
  });
});
