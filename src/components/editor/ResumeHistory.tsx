import { useResume } from "@/hooks";
import React, { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Download, Eye, FileText, Clock, User, Search, Filter, ChevronDown, Maximize2, Minimize2, Share2, ArrowLeft, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ResumePreview from "./ResumePreview";

type SortOption = 'recent' | 'oldest' | 'name-asc' | 'name-desc';

const ResumeHistory: React.FC = () => {
    const navigate = useNavigate();
    const {
        resumeHistory,
        activeResumeId,
        loadResume,
        createNewResume,
        deleteResume,
        isLoading,
        updateResumeTitle,
        currentTitle,
    } = useResume();

    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editingTitleValue, setEditingTitleValue] = useState(currentTitle);
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('recent');
    const [itemsToShow, setItemsToShow] = useState(6);
    const [showFilters, setShowFilters] = useState(false);
    const [previewingResumeId, setPreviewingResumeId] = useState<string | null>(null);
    const [isDownloadingPdf, setIsDownloadingPdf] = useState<string | null>(null);
    const [isFullscreenPreview, setIsFullscreenPreview] = useState(false);
    const [shareToast, setShareToast] = useState<string | null>(null);

    const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setEditingTitleValue(e.target.value);
    };

    const handleTitleSave = () => {
        updateResumeTitle(editingTitleValue || 'Untitled Resume');
        setIsEditingTitle(false);
    };

    const handleTitleBlur = () => handleTitleSave();

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') handleTitleSave();
        else if (e.key === 'Escape') {
            setEditingTitleValue(currentTitle);
            setIsEditingTitle(false);
        }
    };

    React.useEffect(() => {
        setEditingTitleValue(currentTitle);
    }, [currentTitle]);

    const handleDeleteResume = async (resumeId: string) => {
        await deleteResume(resumeId);
        setDeleteConfirm(null);
    };

    const handleEditResume = (resumeId: string) => {
        loadResume(resumeId);
        navigate(`/edit-resume/${resumeId}`);
    };

    const handlePreviewResume = (resumeId: string) => {
        loadResume(resumeId);
        setPreviewingResumeId(resumeId);
    };

    const handleShareResume = async (resumeId: string, resumeTitle: string) => {
        try {
            const shareData = {
                title: resumeTitle || 'My Resume',
                text: `Check out my resume: ${resumeTitle || 'My Resume'}`,
                url: window.location.href,
            };
            if (navigator.share) await navigator.share(shareData);
            else {
                const text = `${shareData.title} - ${shareData.url}`;
                await navigator.clipboard.writeText(text);
                setShareToast(resumeId);
                setTimeout(() => setShareToast(null), 3000);
            }
        } catch (error) {
            console.error('Error sharing resume:', error);
        }
    };

    const handleCreateNewResume = async () => {
        const newResumeId = await createNewResume();
        navigate(`/edit-resume/${newResumeId}`);
    };

    const handleDownloadPdf = async (resumeId: string) => {
        setIsDownloadingPdf(resumeId);
        try {
            const resumeToDownload = resumeHistory.find(r => r._id === resumeId);
            if (!resumeToDownload) return setIsDownloadingPdf(null);

            loadResume(resumeId);

            setTimeout(async () => {
                const resumePreviewElement = document.getElementById('resume-preview');
                if (!resumePreviewElement) return setIsDownloadingPdf(null);

                try {
                    const { jsPDF } = window.jspdf;
                    const canvas = await window.html2canvas(resumePreviewElement, {
                        scale: 2, useCORS: true,
                    });
                    const imgData = canvas.toDataURL('image/png');
                    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
                    const pdfWidth = pdf.internal.pageSize.getWidth();
                    const pdfHeight = pdf.internal.pageSize.getHeight();
                    const imgProps = pdf.getImageProperties(imgData);
                    
                    // Scale the image so it fits perfectly on a single A4 page
                    const ratio = Math.min(pdfWidth / imgProps.width, pdfHeight / imgProps.height);
                    const scaledWidth = imgProps.width * ratio;
                    const scaledHeight = imgProps.height * ratio;
                    
                    // Center it horizontally
                    const xOffset = (pdfWidth - scaledWidth) / 2;
                    
                    pdf.addImage(imgData, 'PNG', xOffset, 0, scaledWidth, scaledHeight);

                    pdf.save(`${resumeToDownload.title || 'resume'}.pdf`);
                } catch (error) {
                    console.error('Error generating PDF:', error);
                } finally {
                    setIsDownloadingPdf(null);
                }
            }, 500);
        } catch (error) {
            console.error('Error downloading resume:', error);
            setIsDownloadingPdf(null);
        }
    };

    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
    const formatTime = (dateString: string) => new Date(dateString).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

    const filteredAndSorted = useMemo(() => {
        let filtered = resumeHistory.filter(resume =>
            (resume.title || 'Untitled Resume').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (resume.resumeData?.personalDetails?.fullName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (resume.resumeData?.personalDetails?.jobTitle || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        filtered.sort((a, b) => {
            switch (sortBy) {
                case 'recent': return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                case 'oldest': return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime();
                case 'name-asc': return (a.title || 'Untitled Resume').localeCompare(b.title || 'Untitled Resume');
                case 'name-desc': return (b.title || 'Untitled Resume').localeCompare(a.title || 'Untitled Resume');
                default: return 0;
            }
        });
        return filtered;
    }, [resumeHistory, searchTerm, sortBy]);

    const displayedResumes = filteredAndSorted.slice(0, itemsToShow);
    const hasMore = displayedResumes.length < filteredAndSorted.length;

    return (
        <div className="min-h-screen bg-gray-50 p-4 sm:p-8 font-sans selection:bg-emerald-100 selection:text-emerald-900" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <div className="max-w-6xl mx-auto">
                {/* Header Section */}
                <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="flex-1 w-full">
                        <div className="flex items-center gap-4 mb-2">
                            {isEditingTitle ? (
                                <input
                                    type="text"
                                    value={editingTitleValue}
                                    onChange={handleTitleChange}
                                    onBlur={handleTitleBlur}
                                    onKeyDown={handleTitleKeyDown}
                                    className="text-2xl sm:text-3xl font-bold text-gray-900 bg-white border-2 border-emerald-500 rounded-lg px-4 py-2 focus:outline-none shadow-sm"
                                    autoFocus
                                />
                            ) : (
                                <div
                                    className="flex items-center gap-4 cursor-pointer group w-full"
                                    onClick={() => setIsEditingTitle(true)}
                                    title="Click to edit context title"
                                >
                                    <div className="p-3 bg-emerald-100 rounded-xl text-emerald-600 shadow-sm flex-shrink-0">
                                        <FileText className="h-6 w-6" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors truncate tracking-tight">
                                            {currentTitle || 'Dashboard'}
                                        </h1>
                                        <p className="text-sm text-gray-500">Manage all your tailored resumes</p>
                                    </div>
                                    <Pencil className="h-5 w-5 text-gray-400 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                        <button
                            onClick={() => navigate('/')}
                            className="bg-white text-gray-700 font-medium py-2.5 px-4 rounded-lg border border-gray-300 shadow-sm hover:bg-gray-50 transition-colors"
                        >
                            Return Home
                        </button>
                        <button
                            onClick={handleCreateNewResume}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white font-medium py-2.5 px-6 rounded-lg hover:bg-emerald-700 transition-all shadow-sm"
                        >
                            <Plus className="h-5 w-5" />
                            <span>New Resume</span>
                        </button>
                    </div>
                </div>

                {/* Filter and Search */}
                <div className="mb-8 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Find resume by title, job, or tags..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-11 pr-4 py-3 rounded-xl bg-white border border-gray-200 text-gray-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                        />
                    </div>
                    
                    <div className="relative group">
                        <button className="flex items-center justify-between w-full sm:w-48 px-4 py-3 rounded-xl bg-white border border-gray-200 shadow-sm text-gray-700 font-medium hover:bg-gray-50 transition-all">
                            <Filter className="h-5 w-5 text-gray-400" />
                            <span>Sort By</span>
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-full sm:w-48 bg-white border border-gray-200 rounded-xl shadow-lg p-2 hidden group-hover:block z-20">
                            {[
                                { value: 'recent' as SortOption, label: 'Most Recent' },
                                { value: 'oldest' as SortOption, label: 'Oldest' },
                                { value: 'name-asc' as SortOption, label: 'Title (A-Z)' },
                                { value: 'name-desc' as SortOption, label: 'Title (Z-A)' },
                            ].map(option => (
                                <button
                                    key={option.value}
                                    onClick={() => setSortBy(option.value)}
                                    className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                                        sortBy === option.value
                                            ? 'bg-emerald-50 text-emerald-700'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Grid Content */}
                {isLoading ? (
                    <div className="text-center py-20 text-gray-500 font-medium">Loading Dashboard...</div>
                ) : filteredAndSorted.length === 0 ? (
                    <div className="text-center py-24 bg-white border border-gray-200 rounded-2xl shadow-sm">
                        <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <Search className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">No resumes found</h3>
                        <p className="text-gray-500">Adjust filters or create a new one to get started.</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {displayedResumes.map(resume => (
                                <div
                                    key={resume._id}
                                    className={`bg-white rounded-xl border p-5 transition-shadow hover:shadow-md ${
                                        resume._id === activeResumeId ? 'border-emerald-500 shadow-sm' : 'border-gray-200'
                                    }`}
                                >
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex items-center gap-3 max-w-[75%]">
                                            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
                                                <FileText className="h-5 w-5" />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className="font-semibold text-gray-900 truncate">
                                                    {resume.title || 'Untitled'}
                                                </h3>
                                                {resume._id === activeResumeId && (
                                                    <span className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Active</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="space-y-2 mb-4">
                                        {resume.resumeData?.personalDetails?.jobTitle && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Briefcase className="h-4 w-4 text-emerald-500" />
                                                <span className="truncate">{resume.resumeData.personalDetails.jobTitle}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <Clock className="h-4 w-4 text-gray-400" />
                                            <span className="truncate pb-[1px]">Edited {formatDate(resume.updatedAt)}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                                        <button
                                            onClick={() => handleEditResume(resume._id)}
                                            className="flex-1 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg text-sm font-semibold transition-colors flex justify-center"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handlePreviewResume(resume._id)}
                                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-200"
                                            title="Quick Preview"
                                        >
                                            <Eye className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDownloadPdf(resume._id)}
                                            className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors border border-gray-200"
                                            title="Export PDF"
                                        >
                                            <Download className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setDeleteConfirm(resume._id)}
                                            className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors border border-red-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>

                                    {deleteConfirm === resume._id && (
                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm rounded-xl flex items-center justify-center p-4 z-10 border border-red-200">
                                            <div className="text-center w-full">
                                                <p className="text-gray-900 font-bold mb-4">Delete "{resume.title || 'Untitled'}"?</p>
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => setDeleteConfirm(null)}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                                                    >
                                                        Cancel
                                                    </button>
                                                    <button
                                                        onClick={() => handleDeleteResume(resume._id)}
                                                        className="flex-1 px-3 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700"
                                                    >
                                                        Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {hasMore && (
                            <div className="text-center mt-8">
                                <button
                                    onClick={() => setItemsToShow(prev => prev + 6)}
                                    className="px-6 py-2.5 bg-white border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 shadow-sm transition"
                                >
                                    Load More ({filteredAndSorted.length - displayedResumes.length})
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Render Invisible Preview for PDF Extraction Purposes */}
            {previewingResumeId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden relative">
                        <div className="flex justify-between items-center p-5 border-b border-gray-200 bg-gray-50">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <Eye className="w-5 h-5 text-emerald-600" />
                                Live Document Preview
                            </h2>
                            <button
                                onClick={() => setPreviewingResumeId(null)}
                                className="p-2 text-gray-500 hover:text-gray-800 hover:bg-gray-200 rounded-lg transition"
                            >
                                <span className="text-2xl font-light leading-none">×</span>
                            </button>
                        </div>
                        <div className="bg-gray-100 overflow-y-auto w-full p-8 flex justify-center" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <div className="bg-white shadow-lg overflow-hidden shrink-0" style={{ transform: 'scale(1)', transformOrigin: 'top center' }}>
                                <ResumePreview />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ResumeHistory;