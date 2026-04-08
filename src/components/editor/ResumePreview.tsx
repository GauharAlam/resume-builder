import React from 'react';
import { useResume, useAutoFit } from '@/hooks';
import { ResumeData, TemplateID, FontFamily, FontSize, LayoutSpacing } from '@/types';
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import ProfessionalITTemplate from '../templates/ProfessionalITTemplate';
import ATSModernTemplate from '../templates/ATSModernTemplate';
import StandardClassicTemplate from '../templates/StandardClassicTemplate';
import TechMinimalistTemplate from '../templates/TechMinimalistTemplate';

// --- TEMPLATES ---

interface TemplateProps {
    data: ResumeData;
}



// External Template components are imported above



// --- MAIN COMPONENT ---

const getFontFamily = (font: FontFamily): string => {
    if (font === 'serif') return 'Georgia, "Times New Roman", Times, serif';
    if (font === 'mono') return '"SF Mono", "Fira Code", "Fira Mono", "Roboto Mono", monospace';
    return '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
};

const getFontScale = (size: FontSize): string => {
    if (size === 'small') return '0.9';
    if (size === 'large') return '1.1';
    return '1';
};

const getLayoutSpacing = (layout: LayoutSpacing): string => {
    if (layout === 'compact') return '0.75';
    if (layout === 'spacious') return '1.25';
    return '1';
};

const ResumePreview: React.FC = () => {
    const { resumeData, template, setTemplate } = useResume();
    const { customization } = resumeData;
    const [zoom, setZoom] = React.useState(100);
    const [isAutoFitEnabled, setIsAutoFitEnabled] = React.useState(false);

    const contentRef = React.useRef<HTMLDivElement>(null);
    const { scale, isOverflowing, fitPercentage } = useAutoFit(contentRef, {
        enabled: isAutoFitEnabled,
        minScale: 0.65, // Minimum 65% scale (approx 9px font size)
        maxScale: 1.0
    });

    const templates: { id: TemplateID; name: string }[] = [
        { id: 'professional-it', name: 'Professional IT' },
        { id: 'ats-modern', name: 'ATS Modern' },
        { id: 'standard-classic', name: 'Standard Classic' },
        { id: 'tech-minimalist', name: 'Tech Minimalist' },
    ];

    const renderTemplate = () => {
        const textScale = resumeData.customization?.textScale ?? 1;
        
        // Map template ID to component
        switch (template) {
            case 'professional-it': return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
            case 'ats-modern': return <ATSModernTemplate data={resumeData} scale={textScale} />;
            case 'standard-classic': return <StandardClassicTemplate data={resumeData} scale={textScale} />;
            case 'tech-minimalist': return <TechMinimalistTemplate data={resumeData} scale={textScale} />;
            default: return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
        }
    }

    const styleVars = {
        '--accent-color': resumeData.accentColor,
        '--font-family': getFontFamily(customization.fontFamily),
        '--font-scale-factor': (Number(getFontScale(customization.fontSize)) * (isAutoFitEnabled ? scale : 1)).toString(),
        '--layout-spacing-factor': getLayoutSpacing(customization.layout),
    } as React.CSSProperties;


    const [touchStart, setTouchStart] = React.useState<number | null>(null);
    const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

    // Min swipe distance required (in px)
    const minSwipeDistance = 50;

    const onTouchStart = (e: React.TouchEvent) => {
        setTouchEnd(null); // Reset
        setTouchStart(e.targetTouches[0].clientX);
    };

    const onTouchMove = (e: React.TouchEvent) => {
        setTouchEnd(e.targetTouches[0].clientX);
    };

    const onTouchEnd = () => {
        if (!touchStart || !touchEnd) return;

        const distance = touchStart - touchEnd;
        const isLeftSwipe = distance > minSwipeDistance;
        const isRightSwipe = distance < -minSwipeDistance;

        if (isLeftSwipe || isRightSwipe) {
            const currentIndex = templates.findIndex(t => t.id === template);
            let nextIndex = currentIndex;

            if (isLeftSwipe) {
                // Next template
                nextIndex = currentIndex === templates.length - 1 ? 0 : currentIndex + 1;
            } else {
                // Previous template
                nextIndex = currentIndex === 0 ? templates.length - 1 : currentIndex - 1;
            }

            setTemplate(templates[nextIndex].id);
        }
    };

    return (
        <div className="sticky top-8">
            {/* Template Selector - Desktop: Buttons, Mobile: Scrollable */}
            <div className="bg-white dark:bg-slate-800 p-2 rounded-lg shadow-sm mb-4 print:hidden transition-colors duration-300">
                <div className="flex flex-wrap items-center justify-center gap-2 overflow-x-auto whitespace-nowrap pb-2 md:pb-0 scrollbar-hide">
                    {templates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => setTemplate(t.id)}
                            className={`px-3 py-1 text-xs font-semibold rounded-full transition-colors duration-200 flex-shrink-0 ${template === t.id
                                ? 'bg-indigo-600 text-white shadow'
                                : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-slate-300 hover:bg-gray-300 dark:hover:bg-slate-600'
                                }`}
                        >
                            {t.name}
                        </button>
                    ))}
                </div>
                <div className="md:hidden text-center text-xs text-gray-400 mt-1 flex items-center justify-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
                    Swipe to switch templates
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </div>
            </div>

            {/* Auto-Fit & Zoom Controls */}
            <div className="bg-white dark:bg-slate-800 p-3 rounded-lg shadow-sm mb-4 print:hidden transition-colors duration-300 flex flex-col gap-3">
                {/* Auto-Fit Toggle & Status */}
                <div className="flex items-center justify-between border-b pb-2 border-gray-100 dark:border-slate-700">
                    <div className="flex items-center gap-2">
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                className="sr-only peer"
                                checked={isAutoFitEnabled}
                                onChange={(e) => setIsAutoFitEnabled(e.target.checked)}
                            />
                            <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-indigo-600"></div>
                            <span className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">Fit to One Page</span>
                        </label>
                    </div>
                    {isAutoFitEnabled && (
                        <div className={`text-xs font-semibold px-2 py-1 rounded ${scale < 1 ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'}`}>
                            {scale < 1 ? `Scaled: ${Math.round(scale * 100)}%` : 'Perfect Fit'}
                        </div>
                    )}
                    {/* Overflow Warning (only shown if fit-to-page is disabled or if content still overflows despite scaling) */}
                    {(!isAutoFitEnabled || (isAutoFitEnabled && isOverflowing)) && fitPercentage < 100 && (
                        <div className="flex flex-col gap-1 w-full mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
                            <div className="flex items-center gap-1 font-bold">
                                <span>⚠️ Content overflows page</span>
                            </div>
                            <div className="pl-5">
                                <p>Try trimming these sections:</p>
                                <ul className="list-disc pl-4 mt-1 space-y-0.5">
                                    {(resumeData.summary && resumeData.summary.length > 400) && <li>Summary is quite long ({Math.round(resumeData.summary.length / 5)} words)</li>}
                                    {(resumeData.experience && resumeData.experience.length > 3) && <li>Experience has {resumeData.experience.length} entries</li>}
                                    {(resumeData.projects && resumeData.projects.length > 3) && <li>Projects has {resumeData.projects.length} entries</li>}
                                    {(resumeData.skills && resumeData.skills.length > 200) && <li>Skills section might be too dense</li>}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-center gap-3">
                    <button
                        onClick={() => setZoom(Math.max(50, zoom - 10))}
                        disabled={zoom <= 50}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom Out"
                    >
                        <ZoomOut className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                    </button>

                    <div className="flex items-center gap-2">
                        <input
                            type="range"
                            min="50"
                            max="150"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="w-24 h-2 bg-gray-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                        />
                        <span className="text-xs font-semibold text-gray-600 dark:text-slate-400 w-10">{zoom}%</span>
                    </div>

                    <button
                        onClick={() => setZoom(Math.min(150, zoom + 10))}
                        disabled={zoom >= 150}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        title="Zoom In"
                    >
                        <ZoomIn className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                    </button>

                    <button
                        onClick={() => setZoom(100)}
                        className="p-2 rounded-lg bg-gray-100 dark:bg-slate-700 hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                        title="Reset Zoom"
                    >
                        <RotateCcw className="w-4 h-4 text-gray-700 dark:text-slate-300" />
                    </button>
                </div>
            </div>

            {/* Resume Preview with Zoom */}
            <div
                className="overflow-auto max-h-[70vh] rounded-lg border border-gray-200 dark:border-slate-700 touch-pan-y"
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                <div
                    style={{
                        transform: `scale(${zoom / 100})`,
                        transformOrigin: 'top center',
                        transition: 'transform 0.2s ease-out'
                    }}
                >
                    <div id="resume-preview" className="bg-white shadow-lg rounded-lg A4-aspect-ratio overflow-hidden" style={styleVars}>
                        <div ref={contentRef} style={{ height: '100%' }}>
                            {renderTemplate()}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`
          .A4-aspect-ratio {
            width: 100%;
            aspect-ratio: 210 / 297; /* A4 paper aspect ratio */
            max-height: 1200px; /* Optional: to prevent it from getting too large on big screens */
          }
          #resume-preview > div { /* Ensure template fills the container */
            width: 100%;
            height: 100%;
            overflow-y: auto; /* Allow scrolling within the template if content overflows */
            font-family: var(--font-family);
            font-size: calc(1rem * var(--font-scale-factor));
          }
          /* Apply spacing scale */
          #resume-preview .mb-2 { margin-bottom: calc(0.5rem * var(--layout-spacing-factor)); }
          #resume-preview .mb-3 { margin-bottom: calc(0.75rem * var(--layout-spacing-factor)); }
          #resume-preview .mb-4 { margin-bottom: calc(1rem * var(--layout-spacing-factor)); }
          #resume-preview .mb-6 { margin-bottom: calc(1.5rem * var(--layout-spacing-factor)); }
          #resume-preview .mt-6 { margin-top: calc(1.5rem * var(--layout-spacing-factor)); }
          
          /* Apply font-size scale to headings */
          #resume-preview h1 { font-size: calc(2.5em * var(--font-scale-factor)); }
          #resume-preview h2 { font-size: calc(1.5em * var(--font-scale-factor)); }
          #resume-preview h3 { font-size: calc(1.17em * var(--font-scale-factor)); }
          #resume-preview h4 { font-size: calc(1em * var(--font-scale-factor)); }

          /* Basic styles for rich text content */
          .prose ul { list-style-type: disc; padding-left: 1.5rem; }
          .prose ol { list-style-type: decimal; padding-left: 1.5rem; }
          .prose u { text-decoration: underline; }
          .prose s { text-decoration: line-through; }
          .prose sub { vertical-align: sub; font-size: smaller; }
          .prose sup { vertical-align: super; font-size: smaller; }
          .prose-invert ul, .prose-invert ol { color: white; }
          .prose-invert a { color: #93c5fd; }
          /* Dynamic Accent Color Classes */
          #resume-preview .accent-text { color: var(--accent-color); }
          #resume-preview .accent-bg { background-color: var(--accent-color); }
          #resume-preview .accent-border-b-2 { border-bottom-width: 2px; border-color: var(--accent-color); }
          #resume-preview .accent-border-b-2-light { border-bottom-width: 2px; border-color: var(--accent-color); border-bottom-style: solid; opacity: 0.4; }
          
          /* Hide scrollbar for template selector on mobile */
          .scrollbar-hide::-webkit-scrollbar {
              display: none;
          }
          .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
          }
        `}</style>
        </div>
    );
};

export default ResumePreview;