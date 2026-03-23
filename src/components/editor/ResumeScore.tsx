// FIX: Implement a component to display AI-driven resume score and feedback.
import React, { useState, useEffect } from 'react';
import { useResume } from '@/hooks';
import { getGeneralResumeAnalysis, getATSAnalysis } from '@/services/geminiService';
import { LoadingSpinner } from '@/components/common';
import { AIIcon } from '@/components/icons';
import { ATSAnalysisResult } from '@/types';

const ResumeScore: React.FC = () => {
    const { resumeData } = useResume();
    const [score, setScore] = useState<number | null>(null);
    const [feedback, setFeedback] = useState<string[]>([]);
    const [atsResult, setAtsResult] = useState<ATSAnalysisResult | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [jobDescription, setJobDescription] = useState('');

    // Reset analysis when resume data changes
    useEffect(() => {
        setScore(null);
        setFeedback([]);
        setAtsResult(null);
    }, [resumeData]);

    const handleAnalyze = async () => {
        setIsLoading(true);
        setError(null);
        setScore(null);
        setFeedback([]);
        setAtsResult(null);

        try {
            if (jobDescription.trim()) {
                const result = await getATSAnalysis(resumeData, jobDescription);
                setAtsResult(result);
            } else {
                const result = await getGeneralResumeAnalysis(resumeData);
                setScore(result.score);
                setFeedback(result.feedback || []);
            }
        } catch (err) {
            setError('Failed to analyze resume. Please try again.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const getScoreColor = (s: number) => {
        if (s > 85) return 'text-green-500';
        if (s > 70) return 'text-yellow-500';
        return 'text-red-500';
    };

    const hasAnalysisRun = score !== null || atsResult !== null;

    return (
        <div className="bg-white p-6 rounded-lg shadow mb-6">
            <div className="flex items-center gap-2 mb-4">
                <h2 className="text-xl font-bold text-gray-800">Resume Analysis</h2>
                <div className="group relative">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 cursor-help" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                    <div className="absolute bottom-full mb-2 w-72 bg-gray-800 text-white text-xs rounded py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10 -translate-x-1/2 left-1/2">
                        Get an instant score and feedback. For a tailored analysis, paste a job description to get a match score and keyword suggestions for Applicant Tracking Systems (ATS).
                        <svg className="absolute text-gray-800 h-2 w-full left-0 top-full" x="0px" y="0px" viewBox="0 0 255 255"><polygon className="fill-current" points="0,0 127.5,127.5 255,0" /></svg>
                    </div>
                </div>
            </div>

            <div className="mb-4">
                <label htmlFor="job-description-analyzer" className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description (Optional)
                </label>
                <textarea
                    id="job-description-analyzer"
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                    placeholder="Paste a job description for an ATS-focused analysis..."
                />
            </div>

            {isLoading && (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                    <LoadingSpinner />
                    <p className="mt-2 text-sm text-gray-600">Analyzing your resume...</p>
                    <p className="mt-1 text-xs text-gray-500">This may take a moment.</p>
                </div>
            )}

            {!isLoading && (
                <button
                    onClick={handleAnalyze}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-colors duration-300 shadow-sm"
                >
                    <AIIcon />
                    <span>{hasAnalysisRun ? 'Re-analyze' : 'Analyze My Resume'}</span>
                </button>
            )}

            {error && <p className="mt-4 text-red-500 text-sm">{error}</p>}

            {!isLoading && hasAnalysisRun && (
                <div className="mt-6 border-t pt-4">
                    {/* ATS Analysis Result */}
                    {atsResult && (
                        <div>
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">ATS Match Score</p>
                                <p className={`text-6xl font-bold ${getScoreColor(atsResult.matchScore)}`}>{atsResult.matchScore}</p>
                                <p className="text-xs text-gray-500 mt-1">This score estimates how well your resume matches the job description for an automated screening system (ATS).</p>
                            </div>
                            <div className="mb-4">
                                <h3 className="font-semibold text-gray-700 mb-2">Missing Keywords</h3>
                                <div className="flex flex-wrap gap-2">
                                    {atsResult.missingKeywords.length > 0 ? atsResult.missingKeywords.map((keyword, index) => (
                                        <span key={index} className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded-full">{keyword}</span>
                                    )) : <p className="text-sm text-gray-500">No major keywords seem to be missing. Great job!</p>}
                                </div>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">AI Suggestions</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                                    {atsResult.suggestions.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}

                    {/* General Analysis Result */}
                    {score !== null && (
                        <div>
                            <div className="text-center mb-4">
                                <p className="text-sm text-gray-600">Overall Score</p>
                                <p className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}</p>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-700 mb-2">Suggestions for Improvement:</h3>
                                <ul className="list-disc pl-5 space-y-2 text-sm text-gray-600">
                                    {feedback.map((item, index) => <li key={index}>{item}</li>)}
                                </ul>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ResumeScore;