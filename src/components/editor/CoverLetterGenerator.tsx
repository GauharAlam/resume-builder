import React, { useState } from 'react';
import { useResume } from '@/hooks';
import { generateCoverLetter } from '@/services/geminiService';
import { AIIcon, ClipboardIcon } from '@/components/icons';
import { LoadingSpinner } from '@/components/common';

const Section: React.FC<{ title: string, tooltip?: string, children: React.ReactNode }> = ({ title, tooltip, children }) => (
    <div className="bg-white p-6 rounded-lg shadow mb-6">
        <div className="flex items-center gap-2 mb-4 border-b pb-2">
            <h2 className="text-xl font-bold text-gray-800">{title}</h2>
            {tooltip && (
                <div className="group relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-help" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                    </svg>
                    <div className="absolute bottom-full mb-2 w-64 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 -translate-x-1/2 left-1/2">
                        {tooltip}
                        <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                    </div>
                </div>
            )}
        </div>
        {children}
    </div>
);

const CoverLetterGenerator: React.FC = () => {
    const { resumeData } = useResume();
    const [jobDescription, setJobDescription] = useState('');
    const [generatedLetter, setGeneratedLetter] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    const handleGenerate = async () => {
        setIsLoading(true);
        setGeneratedLetter('');
        const letter = await generateCoverLetter(resumeData, jobDescription);
        setGeneratedLetter(letter);
        setIsLoading(false);
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generatedLetter).then(() => {
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
        });
    };

    const handleClear = () => {
        setGeneratedLetter('');
        setJobDescription('');
    };

    return (
        <Section title="AI Cover Letter Generator" tooltip="Paste a job description here to generate a customized cover letter based on your resume. This is a great starting point for your application.">
            <div className="mb-4">
                <label htmlFor="job-description" className="block text-sm font-medium text-gray-700 mb-1">
                    Paste Job Description Here
                </label>
                <textarea
                    id="job-description"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={6}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Paste the full job description to generate a tailored cover letter..."
                />
            </div>
            <button
                onClick={handleGenerate}
                disabled={isLoading || !jobDescription}
                className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isLoading ? <LoadingSpinner /> : <AIIcon />}
                <span>{isLoading ? 'Generating...' : 'Generate Cover Letter'}</span>
            </button>

            {generatedLetter && (
                <div className="mt-6">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="font-semibold text-gray-700">Generated Cover Letter</h3>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={handleCopy}
                                className="flex items-center gap-1 text-xs text-indigo-600 font-semibold hover:text-indigo-800"
                            >
                                <ClipboardIcon />
                                <span>{copySuccess ? 'Copied!' : 'Copy Text'}</span>
                            </button>
                            <button
                                onClick={handleClear}
                                className="flex items-center gap-1 text-xs text-red-600 font-semibold hover:text-red-800"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                                <span>Clear</span>
                            </button>
                        </div>
                    </div>
                    <textarea
                        readOnly
                        value={generatedLetter}
                        rows={15}
                        className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 text-sm text-gray-800"
                    />
                </div>
            )}
        </Section>
    );
};

export default CoverLetterGenerator;