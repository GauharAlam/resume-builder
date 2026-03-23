import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Copy, Check, Globe, X, Share2, ExternalLink } from 'lucide-react';
import { useResume } from '@/hooks';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { resumeData, toggleSharing } = useResume();
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  if (!isOpen) return null;

  const publicUrl = `${window.location.origin}/view/${resumeData.shareId}`;
  const isPublic = resumeData.isPublic || false;

  const handleTogglePublic = async () => {
    setIsUpdating(true);
    try {
      await toggleSharing(!isPublic);
    } catch (error) {
      console.error('Failed to toggle sharing:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 rounded-lg text-emerald-600">
              <Share2 size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Share Resume</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Toggle Section */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${isPublic ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-200 text-gray-500'}`}>
                <Globe size={18} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">Public Access</p>
                <p className="text-xs text-gray-500">{isPublic ? 'Anyone with the link can view' : 'Only you can view this resume'}</p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={isUpdating}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${isPublic ? 'bg-emerald-600' : 'bg-gray-300'} ${isUpdating ? 'opacity-50' : ''}`}
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isPublic ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>

          {isPublic && (
            <div className="space-y-6 animate-in slide-in-from-top-4 duration-300">
              {/* Link Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider ml-1">Public Link</label>
                <div className="flex gap-2">
                  <div className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm text-gray-600 font-medium truncate">
                    {publicUrl}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="flex items-center justify-center p-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-600 hover:shadow-sm transition-all"
                    title="Copy to clipboard"
                  >
                    {isCopied ? <Check size={18} className="text-emerald-600" /> : <Copy size={18} />}
                  </button>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="flex flex-col items-center gap-4 py-4">
                <div className="p-4 bg-white border-2 border-dashed border-gray-200 rounded-2xl shadow-sm">
                  <QRCodeSVG value={publicUrl} size={160} level="H" includeMargin={true} />
                </div>
                <p className="text-xs text-gray-400 font-medium italic text-center px-8">
                  Scannable QR code for business cards and prints.
                </p>
              </div>

              <div className="pt-2">
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-800 transition-colors shadow-lg"
                >
                  <ExternalLink size={16} />
                  Open Live Preview
                </a>
              </div>
            </div>
          )}

          {!isPublic && (
            <div className="py-8 text-center space-y-3">
              <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                <Share2 size={24} />
              </div>
              <p className="text-sm text-gray-500 px-8">
                To share your resume with the world, enable public access above.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShareModal;
