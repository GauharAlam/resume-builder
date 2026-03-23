import React from 'react';

interface ResumeComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalResume?: string;
  suggestedResume?: string;
}

// Helper function to strip HTML for pre-wrap display, making it readable.
const stripHtml = (html: string | undefined): string => {
    if (!html) return '';
    let text = html;
    // Add newlines for block elements for better formatting
    text = text.replace(/<\/li>/ig, '\n');
    text = text.replace(/<\/p>/ig, '\n');
    text = text.replace(/<br\s*\/?>/ig, '\n');
    // Strip all remaining HTML tags
    text = text.replace(/<[^>]*>?/gm, '');
    // Clean up extra whitespace and newlines
    text = text.replace(/\n\s*\n/g, '\n');
    text = text.replace(/&nbsp;/g, ' ');
    return text.trim();
};


const ResumeComparisonModal: React.FC<ResumeComparisonModalProps> = ({ isOpen, onClose, originalResume, suggestedResume }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start">
          <h2 className="text-2xl font-bold text-gray-800">Compare Changes</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl" aria-label="Close modal">&times;</button>
        </div>
        <div className="mt-4 text-gray-600">
            <p className="text-sm mb-4">Review the AI-powered suggestions below. The original text is on the left, and the improved version is on the right.</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div>
                    <h3 className="font-semibold mb-2 text-gray-800">Original</h3>
                    <div className="bg-gray-100 p-3 rounded text-sm whitespace-pre-wrap h-64 overflow-y-auto font-sans border">{stripHtml(originalResume) || 'No original text provided.'}</div>
                </div>
                <div>
                    <h3 className="font-semibold mb-2 text-gray-800">AI Suggestion</h3>
                    <div className="bg-indigo-50 p-3 rounded text-sm whitespace-pre-wrap h-64 overflow-y-auto font-sans border border-indigo-200">{stripHtml(suggestedResume) || 'No suggested text provided.'}</div>
                </div>
            </div>
        </div>
        <div className="mt-6 flex justify-end space-x-3">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors">Close</button>
        </div>
      </div>
    </div>
  );
};

export default ResumeComparisonModal;