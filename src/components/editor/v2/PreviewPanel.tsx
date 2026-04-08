import React, { useRef, useState } from 'react';
import { useResume } from '@/hooks';
import { Download, FileText } from 'lucide-react';
import { generateDocx } from '@/utils/docxExport';
import { TemplateID } from '@/types';
import { trackEvent } from '@/services/analytics';

declare global { interface Window { jspdf: any; html2canvas: any; } }

import ProfessionalITTemplate from '../../templates/ProfessionalITTemplate';
import ATSModernTemplate from '../../templates/ATSModernTemplate';
import StandardClassicTemplate from '../../templates/StandardClassicTemplate';
import TechMinimalistTemplate from '../../templates/TechMinimalistTemplate';

// --- Main Panel Wrapper ---

const PreviewPanel: React.FC = () => {
  const { resumeData, updateResumeData, template, setTemplate, activeResumeId } = useResume();
  const previewRef = useRef<HTMLDivElement>(null);
  const currentTemplateId = template;

  const templates: { id: TemplateID; name: string }[] = [
    { id: 'professional-it', name: 'Professional IT' },
    { id: 'ats-modern', name: 'ATS Modern' },
    { id: 'standard-classic', name: 'Standard Classic' },
    { id: 'tech-minimalist', name: 'Tech Minimalist' }
  ];

  const handleDownloadPdf = async () => {
    if (!previewRef.current) return;
    const { jsPDF } = window.jspdf;
    const html2canvas = window.html2canvas;
    
    const canvas = await html2canvas(previewRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    let heightLeft = imgHeight;
    let position = 0;
    
    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;
    
    while (heightLeft > 1) {
      position -= pdfHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }
    
    pdf.save(`${resumeData.personalDetails.fullName || 'Resume'}.pdf`);

    if (activeResumeId) {
      const storageKey = `resumeExported:${activeResumeId}`;
      localStorage.setItem(storageKey, 'true');
      window.dispatchEvent(new CustomEvent('resume-exported', { detail: { resumeId: activeResumeId } }));
      trackEvent('funnel_resume_exported', { format: 'pdf', resumeId: activeResumeId });
    }
  };

  const handleDownloadDocx = () => {
    generateDocx(resumeData);
    if (activeResumeId) {
      const storageKey = `resumeExported:${activeResumeId}`;
      localStorage.setItem(storageKey, 'true');
      window.dispatchEvent(new CustomEvent('resume-exported', { detail: { resumeId: activeResumeId } }));
      trackEvent('funnel_resume_exported', { format: 'docx', resumeId: activeResumeId });
    }
  };

  const renderTemplate = () => {
    const textScale = resumeData.customization?.textScale ?? 1;
    switch (currentTemplateId) {
      case 'professional-it': return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
      case 'ats-modern': return <ATSModernTemplate data={resumeData} scale={textScale} />;
      case 'standard-classic': return <StandardClassicTemplate data={resumeData} scale={textScale} />;
      case 'tech-minimalist': return <TechMinimalistTemplate data={resumeData} scale={textScale} />;
      default: return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
    }
  };

  return (
    <div className="flex-1 bg-gray-100 h-[100dvh] overflow-y-auto flex flex-col relative" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {/* Sticky Top Bar */}
      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-3 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200 shadow-inner">
              <button 
                 onClick={() => {
                     const currentScale = resumeData.customization?.textScale ?? 1;
                     if (currentScale > 0.5) {
                         updateResumeData({ customization: { ...resumeData.customization, textScale: currentScale - 0.05 } });
                     }
                 }}
                 className="px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-white rounded-lg hover:shadow-sm transition-all border border-transparent hover:border-gray-200"
                 title="Decrease Text Size"
              >A-</button>
              <span className="px-3 text-sm font-bold text-gray-600 min-w-[3.5rem] text-center shrink-0">
                 {Math.round((resumeData.customization?.textScale ?? 1) * 100)}%
              </span>
              <button 
                 onClick={() => {
                     const currentScale = resumeData.customization?.textScale ?? 1;
                     if (currentScale < 1.5) {
                         updateResumeData({ customization: { ...resumeData.customization, textScale: currentScale + 0.05 } });
                     }
                 }}
                 className="px-3 py-1.5 text-sm font-bold text-gray-700 hover:bg-white rounded-lg hover:shadow-sm transition-all border border-transparent hover:border-gray-200"
                 title="Increase Text Size"
              >A+</button>
           </div>
            <div className="flex items-center bg-gray-100 rounded-xl p-0.5 border border-gray-200 shadow-inner ml-2 overflow-x-auto max-w-[300px] md:max-w-md scrollbar-hide">
                {templates.map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTemplate(t.id)}
                        className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all whitespace-nowrap ${
                            currentTemplateId === t.id
                                ? 'bg-white text-emerald-600 shadow-sm border border-gray-200'
                                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border border-transparent'
                        }`}
                    >
                        {t.name}
                    </button>
                ))}
            </div>
        </div>
        <div className="flex gap-2 items-center">
            <button onClick={handleDownloadDocx} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors bg-white">
               <FileText size={15} className="text-emerald-600" /> DOCX
            </button>
            <button onClick={handleDownloadPdf} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-sm">
               <Download size={15} /> PDF
            </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-8 pb-32 flex-1 flex justify-center w-full min-h-max overflow-auto bg-[#F7F9FC]">
        <div 
          ref={previewRef} 
          className="w-[794px] min-h-[1123px] shrink-0 shadow-2xl shadow-gray-300/30 bg-white ring-1 ring-gray-200 self-start transition-all duration-300"
        >
           {renderTemplate()}
         </div>
      </div>
    </div>
  );
};

export default PreviewPanel;
