import React, { useState } from 'react';
import { useResume } from '@/hooks';
import { fetchLinkedInProfile } from '@/services/linkedinService';
import { Loader2 } from 'lucide-react';

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({ isOpen, onClose }) => {
    const { updateResumeData } = useResume();
    const [url, setUrl] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!isOpen) return null;

    const handleImport = async () => {
        if (!url.trim()) {
            setError('Please enter a valid LinkedIn URL.');
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            const response = await fetchLinkedInProfile(url);
            const data = response.data;

            if (!data) {
                throw new Error('No profile data found for this URL.');
            }

            // Parsing the LinkedIn data structure precisely.
            const updates: any = {
                personalDetails: {
                    fullName: data.full_name || '',
                    jobTitle: data.headline || '',
                    email: data.email || '', 
                    phone: data.phone_numbers?.[0] || '',
                    location: `${data.city || ''}${data.city && data.state ? ', ' : ''}${data.state || ''}${data.country_full_name ? ', ' + data.country_full_name : ''}`.trim(),
                    links: [{ id: crypto.randomUUID(), name: 'LinkedIn', url: url }]
                },
                summary: data.about || '',
                experience: (data.experiences || []).map((exp: any) => ({
                    id: crypto.randomUUID(),
                    jobTitle: exp.title || '',
                    company: exp.company || '',
                    startDate: exp.starts_at ? `${exp.starts_at.month}/${exp.starts_at.year}` : '',
                    endDate: exp.ends_at ? `${exp.ends_at.month}/${exp.ends_at.year}` : 'Present',
                    description: exp.description || ''
                })),
                education: (data.education || []).map((edu: any) => ({
                    id: crypto.randomUUID(),
                    degree: edu.degree_name || '',
                    institution: edu.school || '',
                    startDate: edu.starts_at ? `${edu.starts_at.year}` : '',
                    endDate: edu.ends_at ? `${edu.ends_at.year}` : ''
                }))
            };

            updateResumeData(updates);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to import profile.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4" role="dialog" onClick={onClose}>
            <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 border border-gray-100" onClick={(e) => e.stopPropagation()}>
                <div className="flex justify-between items-start">
                    <h2 className="text-xl font-bold text-gray-900 tracking-tight">Import from LinkedIn</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">&times;</button>
                </div>
                
                <div className="mt-5 text-gray-600 space-y-4">
                <p className="text-sm leading-relaxed">
                    Connect using the RapidAPI integration to automatically populate your resume with your latest experience and details.
                </p>
                
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">LinkedIn Profile URL</label>
                    <input 
                        type="url" 
                        placeholder="https://www.linkedin.com/in/username" 
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-sm transition-shadow" 
                    />
                </div>

                {error && (
                    <div className="text-sm bg-red-50 border border-red-200 text-red-700 p-3 rounded-md">
                        <strong>API Error:</strong> {error}
                    </div>
                )}
            </div>

                <div className="mt-8 flex justify-end gap-3">
                    <button onClick={onClose} className="px-5 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors">
                        Cancel
                    </button>
                    <button 
                        onClick={handleImport} 
                        disabled={isLoading || !url}
                        className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-50"
                    >
                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                        {isLoading ? 'Importing...' : 'Import Data'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LinkedInImportModal;