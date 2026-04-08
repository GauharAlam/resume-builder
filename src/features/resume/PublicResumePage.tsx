import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import apiRequest from '@/services/api';
import { ResumeData, TemplateID } from '@/types';
import ProfessionalITTemplate from '@/components/templates/ProfessionalITTemplate';
import ATSModernTemplate from '@/components/templates/ATSModernTemplate';
import StandardClassicTemplate from '@/components/templates/StandardClassicTemplate';
import TechMinimalistTemplate from '@/components/templates/TechMinimalistTemplate';

const PublicResumePage: React.FC = () => {
    const { shareId } = useParams<{ shareId: string }>();
    const [resumeData, setResumeData] = useState<ResumeData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPublicResume = async () => {
            if (!shareId) return;
            try {
                const response = await apiRequest(`/resumes/share/${shareId}`);
                if (response && response.success && response.data) {
                    setResumeData(response.data.resumeData);
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

    const renderTemplate = () => {
        if (!resumeData) return null;
        
        // Use the saved template ID, default to professional-it if not found or invalid
        const templateId = (resumeData as any).template || 'professional-it';
        const textScale = resumeData.customization?.textScale ?? 1;

        switch (templateId) {
            case 'professional-it': return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
            case 'ats-modern': return <ATSModernTemplate data={resumeData} scale={textScale} />;
            case 'standard-classic': return <StandardClassicTemplate data={resumeData} scale={textScale} />;
            case 'tech-minimalist': return <TechMinimalistTemplate data={resumeData} scale={textScale} />;
            default: return <ProfessionalITTemplate data={resumeData} scale={textScale} />;
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-500 font-medium">Loading professional profile...</p>
                </div>
            </div>
        );
    }

    if (error || !resumeData) {
        return (
            <div className="flex justify-center items-center h-screen bg-gray-50 p-6">
                <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md text-center space-y-6">
                    <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m0 0v2m0-2h2m-2 0H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Resume Not Available</h1>
                        <p className="text-gray-500 mt-2">{error}</p>
                    </div>
                    <a 
                        href="/"
                        className="block w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors no-underline"
                    >
                        Create Your Own Resume
                    </a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-12 px-4 select-none">
            <div className="max-w-5xl mx-auto shadow-2xl rounded-sm overflow-hidden bg-white">
                {renderTemplate()}
            </div>
            
            <div className="mt-12 text-center pb-8 opacity-50 hover:opacity-100 transition-opacity">
                <p className="text-sm text-gray-500 font-medium">
                    Powered by <span className="text-emerald-600 font-bold">AI Resume Builder</span>
                </p>
                <div className="mt-4 flex justify-center gap-6 text-xs text-gray-400 font-bold uppercase tracking-widest">
                    <span>Professional</span>
                    <span>•</span>
                    <span>AI-Driven</span>
                    <span>•</span>
                    <span>Modern</span>
                </div>
            </div>
        </div>
    );
};

export default PublicResumePage;
