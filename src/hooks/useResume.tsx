// frontend/hooks/useResume.tsx
import React, { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ResumeData, TemplateID, SaveStatus, Experience, Education, Link, Project, Accomplishment } from '@/types';
import { useAuth } from '@/context';
import apiRequest from '@/services/api';

// --- Debounce utility ---
const debounce = <F extends (...args: any[]) => any>(func: F, waitFor: number) => {
    let timeout: ReturnType<typeof setTimeout> | null = null;
    return (...args: Parameters<F>) => {
        if (timeout !== null) clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), waitFor);
    };
};

// --- Dummy / Initial Data ---
const defaultDummyData: ResumeData = {
    personalDetails: {
        fullName: 'John Doe',
        jobTitle: 'Software Engineer',
        email: 'john.doe@email.com',
        phone: '123-456-7890',
        location: 'City, State',
        links: [{ id: crypto.randomUUID(), name: 'GitHub', url: 'github.com/johndoe' }],
    },
    summary: 'A passionate software engineer...',
    experience: [
        { id: crypto.randomUUID(), jobTitle: 'Frontend Developer', company: 'Tech Solutions Inc.', startDate: 'Jan 2022', endDate: 'Present', description: '• Developed and maintained responsive web applications.' },
    ],
    education: [
        { id: crypto.randomUUID(), degree: 'B.S. in Computer Science', institution: 'University of Technology', startDate: 'Sep 2018', endDate: 'May 2021' },
    ],
    skills: 'JavaScript, TypeScript, React, Node.js, HTML, CSS, Git, SQL',
    projects: [
        { id: crypto.randomUUID(), name: 'E-commerce Platform', description: '• Full-stack e-commerce website.', url: 'github.com/johndoe/e-commerce' },
    ],
    accomplishments: [
        { id: crypto.randomUUID(), description: '• Won 1st place in 2020 National Hackathon.' },
        { id: crypto.randomUUID(), description: '• Certified AWS Solutions Architect - Associate.' },
    ],
    sectionOrder: ['summary', 'experience', 'projects', 'education', 'skills', 'accomplishments'],
    accentColor: '#4F46E5',
    customization: { fontFamily: 'sans', fontSize: 'medium', layout: 'standard' },
};

const initialResumeData: ResumeData = {
    ...defaultDummyData,
    personalDetails: {
        fullName: 'Jane Doe',
        jobTitle: 'Senior Product Manager',
        email: 'jane.doe@example.com',
        phone: '555-123-4567',
        location: 'San Francisco, CA',
        links: []
    },
    summary: 'Results-driven Senior Product Manager with over 8 years of experience in the tech industry. Proven ability to lead cross-functional teams to deliver innovative products that meet user needs and drive business growth.',
    experience: [
        { id: crypto.randomUUID(), jobTitle: 'Senior Product Manager', company: 'Innovatech Solutions', startDate: 'Jan 2020', endDate: 'Present', description: '• Led the development and launch of a new SaaS platform, resulting in a 30% increase in monthly recurring revenue.\n• Defined product vision, strategy, and roadmap based on market analysis and user feedback.' }
    ],
    education: [
        { id: crypto.randomUUID(), degree: 'Master of Business Administration (MBA)', institution: 'Stanford University', startDate: '2015', endDate: '2017' }
    ],
    skills: 'Product Management, Agile Methodologies, JIRA, Roadmapping, User Research, A/B Testing, Data Analysis',
};

// --- Context Types ---
interface SavedResume {
    _id: string;
    title: string;
    resumeData: ResumeData;
    updatedAt: string;
    createdAt: string;
}

interface ResumeContextType {
    resumeData: ResumeData;
    updateResumeData: (updates: Partial<ResumeData>) => void;
    updateField: <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => void;
    addExperience: () => void;
    updateExperience: (id: string, updatedExperience: Experience) => void;
    removeExperience: (id: string) => void;
    addEducation: () => void;
    updateEducation: (id: string, updatedEducation: Education) => void;
    removeEducation: (id: string) => void;
    addLink: () => void;
    updateLink: (id: string, updatedLink: Link) => void;
    removeLink: (id: string) => void;
    addProject: () => void;
    updateProject: (id: string, updatedProject: Project) => void;
    removeProject: (id: string) => void;
    addAccomplishment: () => void;
    updateAccomplishment: (id: string, updatedAccomplishment: Accomplishment) => void;
    removeAccomplishment: (id: string) => void;
    template: TemplateID;
    setTemplate: (template: TemplateID) => void;
    saveStatus: SaveStatus;
    undo: () => void;
    redo: () => void;
    canUndo: boolean;
    canRedo: boolean;
    resumeHistory: SavedResume[];
    activeResumeId: string | null;
    isLoading: boolean;
    loadResume: (resumeId: string) => void;
    createNewResume: () => void;
    deleteResume: (resumeId: string) => Promise<void>;
    updateResumeTitle: (newTitle: string) => void;
    currentTitle: string;
    manualSave: () => void;
    hasUnsavedChanges: boolean;
    toggleSharing: (isPublic: boolean) => Promise<void>;
}

const ResumeContext = createContext<ResumeContextType | undefined>(undefined);

// --- Provider ---
export const ResumeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token, isAuthenticated } = useAuth();

    const [resumeData, setResumeData] = useState<ResumeData>(defaultDummyData);
    const [activeResumeId, setActiveResumeId] = useState<string | null>(null);
    const [resumeHistory, setResumeHistory] = useState<SavedResume[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [template, setTemplateState] = useState<TemplateID>('modern');
    const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
    const [currentTitle, setCurrentTitle] = useState<string>('Untitled Resume (Example)');

    // Undo/Redo
    const [history, setHistory] = useState<ResumeData[]>([resumeData]);
    const [historyIndex, setHistoryIndex] = useState(0);

    const stateRef = useRef({ resumeData, history, historyIndex, activeResumeId, currentTitle, resumeHistory });
    stateRef.current = { resumeData, history, historyIndex, activeResumeId, currentTitle, resumeHistory };

    // Loading & lastSaved
    const isLoadingRef = useRef(false);
    const lastSavedData = useRef<ResumeData>(resumeData);

    // --- Update State & History ---
    const updateStateAndHistory = (newData: ResumeData, isNewLoad: boolean = false) => {
        let newHistory: ResumeData[];
        if (isNewLoad && stateRef.current.activeResumeId) {
            newHistory = [newData];
        } else {
            newHistory = stateRef.current.history.slice(0, stateRef.current.historyIndex + 1);
            if (newHistory.length === 0 || newHistory[newHistory.length - 1] !== newData) {
                newHistory.push(newData);
            }
        }
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
        setResumeData(newData);
    };

    // --- Undo/Redo ---
    const canUndo = historyIndex > 0;
    const canRedo = historyIndex < history.length - 1;
    const undo = () => {
        if (canUndo) {
            const newIndex = stateRef.current.historyIndex - 1;
            setHistoryIndex(newIndex);
            setResumeData(stateRef.current.history[newIndex]);
        }
    };
    const redo = () => {
        if (canRedo) {
            const newIndex = stateRef.current.historyIndex + 1;
            setHistoryIndex(newIndex);
            setResumeData(stateRef.current.history[newIndex]);
        }
    };

    // --- Load Resume ---
    const loadResume = useCallback((resumeId: string) => {
        const resumeToLoad = stateRef.current.resumeHistory.find(r => r._id === resumeId);
        if (resumeToLoad) {
            console.log('Loading resume:', resumeToLoad);
            isLoadingRef.current = true;
            setActiveResumeId(resumeToLoad._id);
            setCurrentTitle(resumeToLoad.title);
            const combinedData = { 
                ...resumeToLoad.resumeData, 
                isPublic: resumeToLoad.isPublic, 
                shareId: resumeToLoad.shareId 
            };
            updateStateAndHistory(combinedData, true);
            // Update lastSavedData to match the loaded resume so save status is accurate
            lastSavedData.current = combinedData;
            setTimeout(() => { isLoadingRef.current = false; }, 0);
        }
    }, []);

    // --- Fetch Resumes ---
    const fetchResumes = useCallback(async () => {
        if (!isAuthenticated || !token) {
            updateStateAndHistory(defaultDummyData, true);
            lastSavedData.current = defaultDummyData;
            setActiveResumeId(null);
            setCurrentTitle('Untitled Resume (Example)');
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiRequest('/resumes', { token });
            const fetchedResumes = (response && response.success) ? response.data : [];
            fetchedResumes.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
            setResumeHistory(fetchedResumes);

            if (fetchedResumes.length > 0) {
                const currentExists = fetchedResumes.some(r => r._id === stateRef.current.activeResumeId);
                if (!currentExists) {
                    // Directly load the first resume data to avoid race condition
                    const firstResume = fetchedResumes[0];
                    isLoadingRef.current = true;
                    setActiveResumeId(firstResume._id);
                    setCurrentTitle(firstResume.title);
                    const combinedData = { 
                        ...firstResume.resumeData, 
                        isPublic: firstResume.isPublic, 
                        shareId: firstResume.shareId 
                    };
                    updateStateAndHistory(combinedData, true);
                    lastSavedData.current = combinedData;
                    setTimeout(() => { isLoadingRef.current = false; }, 0);
                }
            } else {
                updateStateAndHistory(defaultDummyData, true);
                lastSavedData.current = defaultDummyData;
                setActiveResumeId(null);
                setCurrentTitle('Untitled Resume (Example)');
            }
        } catch (error) {
            console.error("Failed to fetch resumes:", error);
            updateStateAndHistory(defaultDummyData, true);
            lastSavedData.current = defaultDummyData;
            setActiveResumeId(null);
            setCurrentTitle('Untitled Resume (Example)');
        } finally {
            setIsLoading(false);
        }
    }, [token, isAuthenticated]);

    // --- Save Resume ---
    const saveResume = useCallback(async (dataToSave: ResumeData, idToSave: string | null, titleToSave: string) => {
        if (!isAuthenticated || !token || (idToSave === null && dataToSave === defaultDummyData)) return;

        setSaveStatus('saving');
        try {
            const payload = { 
                title: titleToSave || 'Untitled Resume', 
                resumeData: { ...dataToSave, template } 
            };
            const response = await apiRequest(idToSave ? `/resumes/${idToSave}` : '/resumes', { 
                method: idToSave ? 'PUT' : 'POST', 
                token, 
                body: JSON.stringify(payload) 
            });

            if (response && response.success && response.data) {
                const savedResume = response.data;
                if (idToSave) {
                    setResumeHistory(prev => prev.map(r => r._id === idToSave ? savedResume : r).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
                } else {
                    setActiveResumeId(savedResume._id);
                    setCurrentTitle(savedResume.title);
                    setResumeHistory(prev => [savedResume, ...prev].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
                }
                lastSavedData.current = dataToSave;
            }
            setSaveStatus('saved');
        } catch (error) {
            console.error("Failed to save resume:", error);
            setSaveStatus('saved');
        }
    }, [token, isAuthenticated]);

    // --- Manual Save Function ---
    const manualSave = useCallback(() => {
        if (isLoadingRef.current) return;
        if (JSON.stringify(stateRef.current.resumeData) !== JSON.stringify(lastSavedData.current)) {
            saveResume(stateRef.current.resumeData, stateRef.current.activeResumeId, stateRef.current.currentTitle);
        }
    }, [saveResume]);

    // --- Track unsaved changes ---
    const hasUnsavedChanges = useMemo(() => {
        return JSON.stringify(resumeData) !== JSON.stringify(lastSavedData.current);
    }, [resumeData]);

    // --- Other handlers ---
    const updateResumeData = (updates: Partial<ResumeData>) => updateStateAndHistory({ ...stateRef.current.resumeData, ...updates });
    const updateField = <K extends keyof ResumeData>(section: K, value: ResumeData[K]) => updateStateAndHistory({ ...stateRef.current.resumeData, [section]: value });

    const createNewResume = useCallback(async (): Promise<string | null> => {
        if (!isAuthenticated || !token) return null;

        try {
            const payload = { title: 'Untitled Resume', resumeData: initialResumeData };
            const savedResume = await apiRequest('/resumes', {
                method: 'POST',
                token,
                body: JSON.stringify(payload)
            });

            setActiveResumeId(savedResume._id);
            setCurrentTitle(savedResume.title);
            setResumeHistory(prev => [savedResume, ...prev].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()));
            updateStateAndHistory(savedResume.resumeData, true);

            return savedResume._id; // <-- return the newly created resume ID
        } catch (error) {
            console.error('Failed to create new resume:', error);
            return null;
        }
    }, [isAuthenticated, token]);

    const deleteResume = useCallback(async (resumeId: string) => {
        if (!isAuthenticated || !token) return;
        const prev = [...stateRef.current.resumeHistory];
        setResumeHistory(prev.filter(r => r._id !== resumeId));
        try {
            await apiRequest(`/resumes/${resumeId}`, { method: 'DELETE', token });
            if (stateRef.current.activeResumeId === resumeId) {
                if (prev.length > 1) loadResume(prev.find(r => r._id !== resumeId)!._id);
                else updateStateAndHistory(defaultDummyData, true);
            }
        } catch (error) {
            console.error("Failed to delete resume:", error);
            setResumeHistory(prev);
        }
    }, [token, isAuthenticated, loadResume]);

    const updateResumeTitle = useCallback((newTitle: string) => {
        const titleToSave = newTitle || 'Untitled Resume';
        setCurrentTitle(titleToSave);
        if (stateRef.current.activeResumeId || stateRef.current.resumeData !== defaultDummyData) {
            saveResume(stateRef.current.resumeData, stateRef.current.activeResumeId, titleToSave);
        }
    }, [saveResume]);

    const addExperience = () => updateField('experience', [...(stateRef.current.resumeData.experience || []), { id: crypto.randomUUID(), jobTitle: '', company: '', startDate: '', endDate: '', description: '' }]);
    const updateExperience = (id: string, updated: Experience) => updateField('experience', (stateRef.current.resumeData.experience || []).map(exp => exp.id === id ? updated : exp));
    const removeExperience = (id: string) => updateField('experience', (stateRef.current.resumeData.experience || []).filter(exp => exp.id !== id));

    const addEducation = () => updateField('education', [...(stateRef.current.resumeData.education || []), { id: crypto.randomUUID(), degree: '', institution: '', startDate: '', endDate: '' }]);
    const updateEducation = (id: string, updated: Education) => updateField('education', (stateRef.current.resumeData.education || []).map(edu => edu.id === id ? updated : edu));
    const removeEducation = (id: string) => updateField('education', (stateRef.current.resumeData.education || []).filter(edu => edu.id !== id));

    const addLink = () => updateField('personalDetails', { ...stateRef.current.resumeData.personalDetails, links: [...(stateRef.current.resumeData.personalDetails.links || []), { id: crypto.randomUUID(), name: '', url: '' }] });
    const updateLink = (id: string, updated: Link) => updateField('personalDetails', { ...stateRef.current.resumeData.personalDetails, links: (stateRef.current.resumeData.personalDetails.links || []).map(link => link.id === id ? updated : link) });
    const removeLink = (id: string) => updateField('personalDetails', { ...stateRef.current.resumeData.personalDetails, links: (stateRef.current.resumeData.personalDetails.links || []).filter(link => link.id !== id) });

    const addProject = () => updateField('projects', [...(stateRef.current.resumeData.projects || []), { id: crypto.randomUUID(), name: '', description: '', url: '' }]);
    const updateProject = (id: string, updated: Project) => updateField('projects', (stateRef.current.resumeData.projects || []).map(proj => proj.id === id ? updated : proj));
    const removeProject = (id: string) => updateField('projects', (stateRef.current.resumeData.projects || []).filter(proj => proj.id !== id));

    const addAccomplishment = () => updateField('accomplishments', [...(stateRef.current.resumeData.accomplishments || []), { id: crypto.randomUUID(), description: '' }]);
    const updateAccomplishment = (id: string, updated: Accomplishment) => updateField('accomplishments', (stateRef.current.resumeData.accomplishments || []).map(acc => acc.id === id ? updated : acc));
    const removeAccomplishment = (id: string) => updateField('accomplishments', (stateRef.current.resumeData.accomplishments || []).filter(acc => acc.id !== id));

    const setTemplate = (newTemplate: TemplateID) => setTemplateState(newTemplate);

    const toggleSharing = async (isPublic: boolean) => {
        if (!isAuthenticated || !token || !activeResumeId) return;

        try {
            const response = await apiRequest(`/resumes/${activeResumeId}/share`, {
                method: 'PATCH',
                token,
                body: JSON.stringify({ isPublic })
            });

            // Update local state with the returned resume data (which includes the new shareId)
            if (response && response.success && response.data) {
                const updatedResume = response.data;
                setResumeData(prev => ({
                    ...prev,
                    isPublic: updatedResume.isPublic,
                    shareId: updatedResume.shareId,
                }));
                // We also need to update the resume history to keep it in sync
                setResumeHistory(prev => prev.map(r => r._id === activeResumeId ? { ...r, isPublic: updatedResume.isPublic, shareId: updatedResume.shareId } : r));
            }
        } catch (error) {
            console.error('Failed to toggle sharing:', error);
            throw error;
        }
    };

    // --- Context Value ---
    const value = useMemo(() => ({
        resumeData, updateResumeData, updateField,
        addExperience, updateExperience, removeExperience,
        addEducation, updateEducation, removeEducation,
        addLink, updateLink, removeLink,
        addProject, updateProject, removeProject,
        addAccomplishment, updateAccomplishment, removeAccomplishment,
        template, setTemplate,
        saveStatus,
        undo, redo, canUndo, canRedo,
        resumeHistory, activeResumeId, isLoading,
        loadResume, createNewResume, deleteResume, updateResumeTitle, currentTitle,
        manualSave, hasUnsavedChanges, toggleSharing,
    }), [
        resumeData, template, saveStatus, canUndo, canRedo,
        resumeHistory, activeResumeId, isLoading, currentTitle, hasUnsavedChanges,
        loadResume, createNewResume, deleteResume, updateResumeTitle, manualSave, toggleSharing
    ]);

    useEffect(() => { fetchResumes(); }, [isAuthenticated, fetchResumes]);

    return (
        <ResumeContext.Provider value={value}>
            {children}
        </ResumeContext.Provider>
    );
};

// --- Custom Hook ---
export const useResume = () => {
    const context = useContext(ResumeContext);
    if (!context) throw new Error('useResume must be used within a ResumeProvider');
    return context;
};
