import React, { useState, useEffect } from 'react';
import { X, Check, RotateCcw, Edit3 } from 'lucide-react';

interface AIImproveModalProps {
  isOpen: boolean;
  onClose: () => void;
  oldText: string;
  newText: string;
  onAccept: (text: string) => void;
  section: string;
}

const AIImproveModal: React.FC<AIImproveModalProps> = ({
  isOpen,
  onClose,
  oldText,
  newText: initialNewText,
  onAccept,
  section
}) => {
  const [editableNewText, setEditableNewText] = useState(initialNewText);
  const [activeTab, setActiveTab] = useState<'compare' | 'edit'>('compare');

  useEffect(() => {
    setEditableNewText(initialNewText);
  }, [initialNewText]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-100 text-emerald-700 rounded-lg">
              <Edit3 size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Review AI Improvement</h2>
              <p className="text-sm text-gray-500">Refining your {section} description</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-400">Original Text</span>
                <button 
                  onClick={() => setEditableNewText(oldText)}
                  className="text-xs text-indigo-600 hover:underline flex items-center gap-1"
                >
                  <RotateCcw size={12} /> Reset to original
                </button>
              </div>
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-sm text-gray-600 h-[250px] overflow-y-auto italic">
                {oldText || "No original text found."}
              </div>
            </div>

            {/* AI Improved */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-500">AI Suggestion (Editable)</span>
              </div>
              <textarea
                value={editableNewText}
                onChange={(e) => setEditableNewText(e.target.value)}
                className="w-full p-4 bg-emerald-50/30 border border-emerald-200 rounded-xl text-sm text-gray-800 h-[250px] focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none resize-none transition-all"
                placeholder="AI response will appear here..."
              />
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex gap-3 items-start">
            <div className="text-blue-500 mt-0.5">💡</div>
            <p className="text-xs text-blue-700 leading-relaxed">
              <strong>Pro Tip:</strong> You can edit the AI suggestion directly in the box above before accepting it. Make sure to include specific metrics and action verbs for the best results.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-xl transition-all"
          >
            Discard
          </button>
          <button
            onClick={() => onAccept(oldText)}
            className="px-6 py-2.5 text-sm font-semibold text-indigo-600 border border-indigo-200 hover:bg-indigo-50 rounded-xl transition-all"
          >
            Keep Original
          </button>
          <button
            onClick={() => onAccept(editableNewText)}
            className="px-8 py-2.5 text-sm font-bold bg-emerald-600 text-white hover:bg-emerald-700 rounded-xl shadow-lg shadow-emerald-200 transition-all flex items-center gap-2"
          >
            <Check size={18} /> Apply Improvement
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIImproveModal;
