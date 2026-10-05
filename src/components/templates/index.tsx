import React from 'react';
import { ResumeData, TemplateID } from '@/types';
import ProfessionalITTemplate from './ProfessionalITTemplate';
import ATSModernTemplate from './ATSModernTemplate';
import StandardClassicTemplate from './StandardClassicTemplate';
import TechMinimalistTemplate from './TechMinimalistTemplate';
import CleanSerifTemplate, { TemplateInteraction } from './CleanSerifTemplate';

export type { TemplateInteraction };
export * from './shared';

export interface TemplateOption {
  id: TemplateID;
  name: string;
  description: string;
  // Which design controls the template actually responds to
  supportsAccent: boolean;
  supportsSpacing: boolean;
  supportsCanvasEditing: boolean;
}

export const TEMPLATE_OPTIONS: TemplateOption[] = [
  { id: 'clean-serif', name: 'Clean Serif', description: 'Editorial header, airy layout', supportsAccent: true, supportsSpacing: true, supportsCanvasEditing: true },
  { id: 'professional-it', name: 'Professional IT', description: 'Accent headings, dense detail', supportsAccent: true, supportsSpacing: false, supportsCanvasEditing: false },
  { id: 'ats-modern', name: 'ATS Modern', description: 'Single column, parser friendly', supportsAccent: false, supportsSpacing: false, supportsCanvasEditing: false },
  { id: 'standard-classic', name: 'Standard Classic', description: 'Centered header, two columns', supportsAccent: false, supportsSpacing: false, supportsCanvasEditing: false },
  { id: 'tech-minimalist', name: 'Tech Minimalist', description: 'Monospace, engineering feel', supportsAccent: true, supportsSpacing: false, supportsCanvasEditing: false },
];

export const getTemplateOption = (id: TemplateID): TemplateOption =>
  TEMPLATE_OPTIONS.find((t) => t.id === id) ?? TEMPLATE_OPTIONS[1];

export const ResumeTemplate: React.FC<{
  template: TemplateID;
  data: ResumeData;
  interaction?: TemplateInteraction;
}> = ({ template, data, interaction }) => {
  const scale = data.customization?.textScale ?? 1;
  switch (template) {
    case 'clean-serif':
      return <CleanSerifTemplate data={data} scale={scale} interaction={interaction} />;
    case 'ats-modern':
      return <ATSModernTemplate data={data} scale={scale} />;
    case 'standard-classic':
      return <StandardClassicTemplate data={data} scale={scale} />;
    case 'tech-minimalist':
      return <TechMinimalistTemplate data={data} scale={scale} />;
    case 'professional-it':
    default:
      return <ProfessionalITTemplate data={data} scale={scale} />;
  }
};
