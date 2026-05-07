import React, { useEffect, useMemo, useState } from 'react';
import { useResume } from '@/hooks';
import SectionCard from './SectionCard';
import InputField from './InputField';
import { improveText } from '@/services/aiService';
import { Sparkles, Loader2, Undo2, Redo2, Download } from 'lucide-react';
import { SaveStatusIndicator } from '@/components/common';
import { ResumeScore, CoverLetterGenerator, AIImproveModal } from '@/components/editor';

const EditorPanel: React.FC = () => {
  const {
    resumeData,
    updateField,
    manualSave,
    addLink,
    updateLink,
    removeLink,
    addExperience,
    updateExperience,
    removeExperience,
    addEducation,
    updateEducation,
    removeEducation,
    addProject,
    updateProject,
    removeProject,
    addAccomplishment,
    updateAccomplishment,
    removeAccomplishment,
    undo,
    redo,
    canUndo,
    canRedo,
    saveStatus,
    activeResumeId,
  } = useResume();

  const [improvingId, setImprovingId] = useState<string | null>(null);
  const [showATS, setShowATS] = useState(false);
  const [showCoverLetter, setShowCoverLetter] = useState(false);
  const [hasAtsRun, setHasAtsRun] = useState(false);
  const [hasExported, setHasExported] = useState(false);

  // AI Modal State
  const [aiModal, setAiModal] = useState<{
    isOpen: boolean;
    oldText: string;
    newText: string;
    section: string;
    onAccept: (val: string) => void;
  }>({
    isOpen: false,
    oldText: '',
    newText: '',
    section: '',
    onAccept: () => {}
  });

  useEffect(() => {
    if (!activeResumeId) {
      setHasAtsRun(false);
      setHasExported(false);
      return;
    }

    setHasAtsRun(localStorage.getItem(`resumeAtsScanned:${activeResumeId}`) === 'true');
    setHasExported(localStorage.getItem(`resumeExported:${activeResumeId}`) === 'true');
  }, [activeResumeId]);

  useEffect(() => {
    const onAtsRun = (event: Event) => {
      const customEvent = event as CustomEvent<{ resumeId?: string }>;
      if (customEvent.detail?.resumeId && customEvent.detail.resumeId === activeResumeId) {
        setHasAtsRun(true);
      }
    };

    const onExport = (event: Event) => {
      const customEvent = event as CustomEvent<{ resumeId?: string }>;
      if (customEvent.detail?.resumeId && customEvent.detail.resumeId === activeResumeId) {
        setHasExported(true);
      }
    };

    window.addEventListener('resume-ats-analyzed', onAtsRun);
    window.addEventListener('resume-exported', onExport);
    return () => {
      window.removeEventListener('resume-ats-analyzed', onAtsRun);
      window.removeEventListener('resume-exported', onExport);
    };
  }, [activeResumeId]);

  const experienceBulletCount = useMemo(() => {
    return (resumeData.experience || []).reduce((count, exp) => {
      const lines = (exp.description || '')
        .split('\n')
        .map((line) => line.replace(/<[^>]*>/g, '').trim())
        .filter((line) => line.length > 0);
      return count + lines.length;
    }, 0);
  }, [resumeData.experience]);

  const basicsDone = !!resumeData.personalDetails.fullName?.trim()
    && !!resumeData.personalDetails.jobTitle?.trim()
    && !!resumeData.personalDetails.email?.trim();

  const checklistItems = useMemo(() => [
    {
      id: 'basics',
      label: 'Complete basic details',
      done: basicsDone,
    },
    {
      id: 'experience',
      label: 'Add at least 2 experience bullets',
      done: experienceBulletCount >= 2,
    },
    {
      id: 'ats',
      label: 'Run ATS analysis',
      done: hasAtsRun,
    },
    {
      id: 'export',
      label: 'Export as PDF/DOCX',
      done: hasExported,
    },
  ], [basicsDone, experienceBulletCount, hasAtsRun, hasExported]);

  const completionPercent = useMemo(() => {
    const completed = checklistItems.filter((item) => item.done).length;
    return Math.round((completed / checklistItems.length) * 100);
  }, [checklistItems]);

  const handleImproveAI = async (id: string, text: string, section: string, onUpdate: (val: string) => void) => {
    if (!text || !text.trim()) return;
    setImprovingId(id);
    try {
      const improved = await improveText(text, section, resumeData.personalDetails.jobTitle || 'Professional');
      if (improved) {
        setAiModal({
          isOpen: true,
          oldText: text,
          newText: improved,
          section,
          onAccept: (finalText: string) => {
            onUpdate(finalText);
            setAiModal(prev => ({ ...prev, isOpen: false }));
          }
        });
      }
    } catch (error) {
      console.error('Failed to improve text', error);
    } finally {
      setImprovingId(null);
    }
  };

  const renderAIButton = (id: string, text: string, section: string, onUpdate: (val: string) => void) => {
    const isSpinning = improvingId === id;
    return (
      <button
        onClick={() => handleImproveAI(id, text, section, onUpdate)}
        disabled={isSpinning || !text}
        className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 py-1 px-2 rounded disabled:opacity-50 transition-colors border border-emerald-100"
        title="Improve with AI"
      >
        {isSpinning ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
        {isSpinning ? 'Improving...' : 'Improve'}
      </button>
    );
  };

  const handlePersonalDetailsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateField('personalDetails', {
      ...resumeData.personalDetails,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="w-1/3 max-w-[500px] min-w-[400px] bg-gray-50 h-[100dvh] overflow-y-auto p-8 flex-shrink-0 border-r border-gray-200" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
      <div className="mb-8 flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Edit Resume</h1>
          <p className="text-gray-500 text-sm mt-1">Update to see changes in real-time.</p>
          <div className="mt-2">
            <SaveStatusIndicator status={saveStatus} />
          </div>
        </div>
        <div className="flex flex-wrap gap-2 items-center">
          <div className="flex items-center gap-1 mr-2 border-r border-gray-200 pr-3">
            <button 
              onClick={undo} disabled={!canUndo}
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Undo">
              <Undo2 size={18} />
            </button>
            <button 
              onClick={redo} disabled={!canRedo}
              className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors" title="Redo">
              <Redo2 size={18} />
            </button>
          </div>
          
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition-colors bg-white shadow-sm whitespace-nowrap"
            onClick={() => window.dispatchEvent(new CustomEvent('open-linkedin-modal'))}
          >
            <Download size={15} /> Import
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors whitespace-nowrap ${
              showATS
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
            onClick={() => setShowATS((prev) => !prev)}
          >
            ATS Score
          </button>
          <button
            className={`px-3 py-1.5 text-sm font-medium border rounded-lg transition-colors whitespace-nowrap ${
              showCoverLetter
                ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
                : 'border-gray-200 text-gray-600 hover:bg-gray-50 bg-white'
            }`}
            onClick={() => setShowCoverLetter((prev) => !prev)}
          >
            Cover Letter
          </button>
          <button className="px-3 py-1.5 text-sm font-medium border border-emerald-600 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors bg-white whitespace-nowrap">
            Preview
          </button>
          <button 
            onClick={manualSave}
            className="px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm whitespace-nowrap"
          >
            Save
          </button>
        </div>
      </div>

      <div className="space-y-6 pb-24">
        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-sm font-semibold text-gray-800">Resume Completeness</h2>
            <span className="text-sm font-bold text-emerald-700">{completionPercent}%</span>
          </div>
          <div className="h-2.5 rounded-full bg-gray-100 overflow-hidden mb-4">
            <div
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-500"
              style={{ width: `${completionPercent}%` }}
            />
          </div>
          <div className="grid grid-cols-1 gap-2">
            {checklistItems.map((item) => (
              <div key={item.id} className="flex items-center gap-2 text-sm">
                <span className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                  item.done ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-400'
                }`}>
                  {item.done ? '✓' : '•'}
                </span>
                <span className={item.done ? 'text-gray-800' : 'text-gray-500'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {showATS && <ResumeScore />}
        {showCoverLetter && <CoverLetterGenerator />}
        
        <AIImproveModal 
          isOpen={aiModal.isOpen}
          onClose={() => setAiModal(prev => ({ ...prev, isOpen: false }))}
          oldText={aiModal.oldText}
          newText={aiModal.newText}
          section={aiModal.section}
          onAccept={aiModal.onAccept}
        />

        {/* BASICS */}
        <div id="section-0">
          <SectionCard title="Basics" defaultOpen={true}>
            <div className="grid grid-cols-2 gap-4">
            <InputField 
              label="Full Name" 
              name="fullName"
              value={resumeData.personalDetails.fullName}
              onChange={handlePersonalDetailsChange}
              placeholder="e.g. John Doe" 
              className="col-span-2"
            />
            <InputField 
              label="Job Title" 
              name="jobTitle"
              value={resumeData.personalDetails.jobTitle}
              onChange={handlePersonalDetailsChange}
              placeholder="e.g. Software Engineer" 
              className="col-span-2"
            />
            <InputField 
              label="Email" 
              name="email"
              type="email" 
              value={resumeData.personalDetails.email}
              onChange={handlePersonalDetailsChange}
              placeholder="john@example.com" 
              className="col-span-2" 
            />
            <InputField 
              label="Phone" 
              name="phone"
              type="tel" 
              value={resumeData.personalDetails.phone}
              onChange={handlePersonalDetailsChange}
              placeholder="+1 234 567 890" 
              className="col-span-2" 
            />
            <InputField 
              label="Location" 
              name="location"
              value={resumeData.personalDetails.location}
              onChange={handlePersonalDetailsChange}
              placeholder="San Francisco, CA" 
              className="col-span-2" 
            />
          </div>

          <div className="mt-6 pt-4 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-700 mb-3">Links & Profiles</h3>
            {(resumeData.personalDetails.links || []).map((link) => (
              <div key={link.id} className="p-3 border border-gray-200 rounded-lg space-y-3 bg-white relative group mb-3 shadow-sm">
                <button 
                  onClick={() => removeLink(link.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Link"
                >
                  &times;
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <InputField 
                    label="Label" 
                    value={link.name}
                    onChange={(e) => updateLink(link.id, { ...link, name: e.target.value })}
                    placeholder="e.g. GitHub" 
                  />
                  <InputField 
                    label="URL" 
                    value={link.url}
                    onChange={(e) => updateLink(link.id, { ...link, url: e.target.value })}
                    placeholder="github.com/..." 
                  />
                </div>
              </div>
            ))}
            <button 
              onClick={addLink}
              className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2"
            >
              + Add Link
            </button>
          </div>
        </SectionCard>
        </div>

        {/* SUMMARY */}
        <div id="section-1">
        <SectionCard title="Professional Summary" defaultOpen={false}>
          <InputField 
            label="Summary" 
            as="textarea" 
            value={resumeData.summary}
            onChange={(e) => updateField('summary', e.target.value)}
            placeholder="Experienced professional with a track record of..." 
            actionButton={renderAIButton('summary', resumeData.summary, 'summary', (val) => updateField('summary', val))}
          />
        </SectionCard>
        </div>

        {/* EXPERIENCE */}
        <div id="section-2">
        <SectionCard title="Experience" defaultOpen={false}>
          {resumeData.experience.map((exp, index) => (
             <div key={exp.id} className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50 relative group">
                <button 
                  onClick={() => removeExperience(exp.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Experience"
                >
                  &times;
                </button>
                <InputField 
                  label="Job Title" 
                  value={exp.jobTitle}
                  onChange={(e) => updateExperience(exp.id, { ...exp, jobTitle: e.target.value })}
                  placeholder="Senior Developer" 
                />
                <InputField 
                  label="Company" 
                  value={exp.company}
                  onChange={(e) => updateExperience(exp.id, { ...exp, company: e.target.value })}
                  placeholder="Tech Corp" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Start Date" 
                    value={exp.startDate}
                    onChange={(e) => updateExperience(exp.id, { ...exp, startDate: e.target.value })}
                    placeholder="Jan 2020" 
                  />
                  <InputField 
                    label="End Date" 
                    value={exp.endDate}
                    onChange={(e) => updateExperience(exp.id, { ...exp, endDate: e.target.value })}
                    placeholder="Present" 
                  />
                </div>
                <InputField 
                  label="Description" 
                  as="textarea" 
                  value={exp.description}
                  onChange={(e) => updateExperience(exp.id, { ...exp, description: e.target.value })}
                  placeholder="Describe your responsibilities and achievements..." 
                  actionButton={renderAIButton(`exp-${exp.id}`, exp.description, 'accomplishment', (val) => updateExperience(exp.id, { ...exp, description: val }))}
                />
             </div>
          ))}
          <button 
            onClick={addExperience}
            className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2"
          >
            + Add Experience
          </button>
        </SectionCard>
        </div>
        
        {/* EDUCATION */}
        <div id="section-3">
        <SectionCard title="Education" defaultOpen={false}>
           {resumeData.education.map((edu, index) => (
             <div key={edu.id} className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50 relative group">
                <button 
                  onClick={() => removeEducation(edu.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Education"
                >
                  &times;
                </button>
                <InputField 
                  label="Degree / Major" 
                  value={edu.degree}
                  onChange={(e) => updateEducation(edu.id, { ...edu, degree: e.target.value })}
                  placeholder="B.S. Computer Science" 
                />
                <InputField 
                  label="Institution" 
                  value={edu.institution}
                  onChange={(e) => updateEducation(edu.id, { ...edu, institution: e.target.value })}
                  placeholder="University of Tech" 
                />
                <div className="grid grid-cols-2 gap-4">
                  <InputField 
                    label="Start Date" 
                    value={edu.startDate}
                    onChange={(e) => updateEducation(edu.id, { ...edu, startDate: e.target.value })}
                    placeholder="2015" 
                  />
                  <InputField 
                    label="End Date" 
                    value={edu.endDate}
                    onChange={(e) => updateEducation(edu.id, { ...edu, endDate: e.target.value })}
                    placeholder="2019" 
                  />
                </div>
             </div>
          ))}
          <button 
            onClick={addEducation}
            className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2"
          >
            + Add Education
          </button>
        </SectionCard>
        </div>
        
        {/* SKILLS */}
        <div id="section-4">
        <SectionCard title="Skills" defaultOpen={false}>
          <InputField 
            label="Skills list" 
            as="textarea" 
            value={resumeData.skills || ''}
            onChange={(e) => updateField('skills', e.target.value)}
            placeholder="React, TypeScript, Node.js..." 
          />
        </SectionCard>
        </div>

        {/* PROJECTS */}
        <div id="section-5">
        <SectionCard title="Projects" defaultOpen={false}>
           {resumeData.projects.map((proj, index) => (
             <div key={proj.id} className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50 relative group">
                <button 
                  onClick={() => removeProject(proj.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Project"
                >
                  &times;
                </button>
                <InputField 
                  label="Project Name" 
                  value={proj.name}
                  onChange={(e) => updateProject(proj.id, { ...proj, name: e.target.value })}
                  placeholder="E-commerce App" 
                />
                <InputField 
                  label="URL / Link" 
                  value={proj.url || ''}
                  onChange={(e) => updateProject(proj.id, { ...proj, url: e.target.value })}
                  placeholder="github.com/my-project" 
                />
                <InputField 
                  label="Description" 
                  as="textarea"
                  value={proj.description}
                  onChange={(e) => updateProject(proj.id, { ...proj, description: e.target.value })}
                  placeholder="Built a full stack..." 
                  actionButton={renderAIButton(`proj-${proj.id}`, proj.description, 'project description', (val) => updateProject(proj.id, { ...proj, description: val }))}
                />
             </div>
          ))}
           <button 
            onClick={addProject}
            className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2"
          >
            + Add Project
          </button>
        </SectionCard>
        </div>

        {/* ACCOMPLISHMENTS */}
        <div id="section-6">
        <SectionCard title="Accomplishments / Awards" defaultOpen={false}>
           {resumeData.accomplishments?.map((acc, index) => (
             <div key={acc.id} className="p-4 border border-gray-200 rounded-lg space-y-4 bg-gray-50/50 relative group">
                <button 
                  onClick={() => removeAccomplishment(acc.id)}
                  className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove Accomplishment"
                >
                  &times;
                </button>
                <InputField 
                  label="Description" 
                  as="textarea"
                  value={acc.description}
                  onChange={(e) => updateAccomplishment(acc.id, { ...acc, description: e.target.value })}
                  placeholder="e.g. Received Employee of the Month award in 2023..." 
                  actionButton={renderAIButton(`acc-${acc.id}`, acc.description, 'accomplishment', (val) => updateAccomplishment(acc.id, { ...acc, description: val }))}
                />
             </div>
          ))}
           <button 
            onClick={addAccomplishment}
            className="w-full py-2.5 text-sm font-medium text-gray-600 border border-gray-300 border-dashed rounded-lg hover:bg-gray-50 hover:text-gray-900 transition-colors mt-2"
          >
            + Add Accomplishment
          </button>
        </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default EditorPanel;
