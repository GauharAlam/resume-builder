import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Download, FileText, Loader2, Lock } from 'lucide-react';
import apiRequest from '@/services/api';
import { ResumeData, TemplateID } from '@/types';
import { ResumeTemplate, TEMPLATE_OPTIONS } from '@/components/templates';
import { printResume } from '@/utils/printResume';
import { toastError } from '@/utils/toast';

const PublicResumePage: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicResume = async () => {
            if (!shareId) {
                setError('Missing share link.');
                setIsLoading(false);
                return;
            }
            try {
                const response = await apiRequest(`/resumes/share/${shareId}`);
                if (response && response.success && response.data?.resumeData) {
                    setResumeData(response.data.resumeData);
                } else {
                    setError('The resume you are looking for is private or doesn\'t exist.');
                }
            } catch (err: any) {
                console.error('Error fetching public resume:', err);
                setError(err.message || 'The resume you are looking for is private or doesn\'t exist.');
            } finally {
                setIsLoading(false);
            }
        };

        fetchPublicResume();
    }, [shareId]);

    useEffect(() => {
        if (!resumeData) return;

        const ownerName = resumeData.personalDetails?.fullName || 'Professional';
        const role = resumeData.personalDetails?.jobTitle || 'Resume';
        const pageTitle = `${ownerName} - ${role} | ResumeAI`;
        const description = `View ${ownerName}'s ${role} resume, shared via ResumeAI.`;
        const url = window.location.href;

        document.title = pageTitle;

        const setMetaTag = (selector: string, attribute: 'name' | 'property', attrValue: string, content: string) => {
            let tag = document.querySelector(selector) as HTMLMetaElement | null;
            if (!tag) {
                tag = document.createElement('meta');
                tag.setAttribute(attribute, attrValue);
                document.head.appendChild(tag);
            }
            tag.setAttribute('content', content);
        };

        setMetaTag('meta[name="description"]', 'name', 'description', description);
        setMetaTag('meta[property="og:title"]', 'property', 'og:title', pageTitle);
        setMetaTag('meta[property="og:description"]', 'property', 'og:description', description);
        setMetaTag('meta[property="og:url"]', 'property', 'og:url', url);
        setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', pageTitle);
        setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', description);
    }, [resumeData]);

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F3F4F6]">
                <Loader2 className="h-6 w-6 animate-spin text-[#2B5FD9]" aria-label="Loading resume" />
            </div>
        );
    }

    if (error || !resumeData) {
        return (
            <div className="flex h-screen items-center justify-center bg-[#F3F4F6] p-6 font-inter text-[#14161A]">
                <div className="w-full max-w-sm rounded-2xl border border-[#E9EAEE] bg-white p-8 text-center">
                    <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#F3F4F6] text-[#6B7280]">
                        <Lock size={20} />
                    </span>
                    <h1 className="mt-4 text-lg font-semibold">This resume isn't available</h1>
                    <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">
                        The link may be wrong, or its owner has turned sharing off.
                    </p>
                    <div className="mt-6 space-y-2">
                        <button
                            onClick={() => window.location.reload()}
                            className="block w-full rounded-xl border border-[#E3E5EA] py-2.5 text-sm font-medium hover:bg-[#F6F7F9]"
                        >
                            Try again
                        </button>
                        <a href="/" className="block w-full rounded-xl bg-[#2B5FD9] py-2.5 text-sm font-medium text-white hover:bg-[#2450BD]">
                            Create your own resume
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    // Saved data can predate newer fields; fill gaps so a template never crashes on it
    const raw = resumeData as Partial<ResumeData> & { template?: TemplateID };
    const safeData: ResumeData = {
        ...(raw as ResumeData),
        personalDetails: { fullName: '', jobTitle: '', email: '', phone: '', location: '', ...(raw.personalDetails || {}), links: raw.personalDetails?.links || [] },
        summary: raw.summary || '',
        experience: raw.experience || [],
        education: raw.education || [],
        skills: raw.skills || '',
        projects: raw.projects || [],
        accomplishments: raw.accomplishments || [],
        sectionOrder: raw.sectionOrder || [],
        accentColor: raw.accentColor || '#4F46E5',
        customization: { fontFamily: 'sans', fontSize: 'medium', layout: 'standard', ...(raw.customization || {}) },
    };
    const template = TEMPLATE_OPTIONS.some((t) => t.id === raw.template) ? (raw.template as TemplateID) : 'professional-it';
    const name = safeData.personalDetails.fullName || 'Resume';

    return (
        <div className="min-h-screen bg-[#F3F4F6] font-inter text-[#14161A]">
            <header className="sticky top-0 z-10 border-b border-[#E9EAEE] bg-white">
                <div className="mx-auto flex h-14 max-w-[900px] items-center justify-between gap-3 px-4">
                    <a href="/" className="flex items-center gap-2" aria-label="ResumeAI home">
                        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#2B5FD9]">
                            <FileText className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />
                        </span>
                        <span className="text-lg font-semibold tracking-tight">ResumeAI</span>
                    </a>
                    <button
                        onClick={() => printResume({ template, data: safeData, title: name }).catch(() => toastError("Printing isn't available in this browser."))}
                        className="flex items-center gap-2 rounded-xl border border-[#E3E5EA] bg-white px-3.5 py-2 text-sm font-medium hover:bg-[#F6F7F9]"
                    >
                        <Download size={15} />
                        Save as PDF
                    </button>
                </div>
            </header>

            <main className="mx-auto max-w-[900px] px-3 py-6 sm:py-10">
                {/* The page keeps its A4 width and scrolls sideways on narrow screens rather than reflowing */}
                <div className="overflow-x-auto">
                    <div className="mx-auto w-[794px] bg-white shadow-[0_2px_24px_rgba(16,24,40,0.08)]">
                        <ResumeTemplate template={template} data={safeData} />
                    </div>
                </div>
                <p className="mt-8 text-center text-sm text-[#6B7280]">
                    Made with{' '}
                    <a href="/" className="font-medium text-[#2B5FD9] hover:underline">
                        ResumeAI
                    </a>
                    . Build yours in minutes.
                </p>
            </main>
        </div>
    );
};

export default PublicResumePage;
