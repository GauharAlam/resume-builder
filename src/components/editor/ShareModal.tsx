import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Copy, Check, Globe, X, Share2, ExternalLink } from "lucide-react";
import { useResume } from "@/hooks";
import { trackEvent } from "@/services/analytics";

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
      console.error("Failed to toggle sharing:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(publicUrl);
    setIsCopied(true);
    if (resumeData.shareId)
      trackEvent("resume_share_link_copied", { shareId: resumeData.shareId });
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      <div
        className="modal-enter w-full max-w-md overflow-hidden"
        style={{
          background: "rgba(10,17,14,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.11)",
          borderRadius: "1rem",
          boxShadow: "0 24px 80px rgba(0,0,0,0.60)",
        }}
      >
        {/* Header */}
        <div
          className="p-5 flex justify-between items-center"
          style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "rgba(74,222,128,0.12)",
                border: "1px solid rgba(74,222,128,0.25)",
              }}
            >
              <Share2 size={18} style={{ color: "#4ade80" }} />
            </div>
            <h2 className="text-lg font-bold" style={{ color: "#F0FDF4" }}>
              Share Resume
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg transition-colors"
            style={{ color: "rgba(209,250,229,0.45)" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(255,255,255,0.08)";
              e.currentTarget.style.color = "#F0FDF4";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent";
              e.currentTarget.style.color = "rgba(209,250,229,0.45)";
            }}
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* Toggle */}
          <div
            className="flex items-center justify-between p-4 rounded-xl"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.09)",
            }}
          >
            <div className="flex items-center gap-3">
              <div
                className="p-2 rounded-lg"
                style={{
                  background: isPublic
                    ? "rgba(74,222,128,0.15)"
                    : "rgba(255,255,255,0.07)",
                  border: `1px solid ${isPublic ? "rgba(74,222,128,0.25)" : "rgba(255,255,255,0.10)"}`,
                }}
              >
                <Globe
                  size={16}
                  style={{
                    color: isPublic ? "#4ade80" : "rgba(209,250,229,0.45)",
                  }}
                />
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: "#F0FDF4" }}>
                  Public Access
                </p>
                <p
                  className="text-xs"
                  style={{ color: "rgba(209,250,229,0.45)" }}
                >
                  {isPublic
                    ? "Anyone with the link can view"
                    : "Only you can view this resume"}
                </p>
              </div>
            </div>
            <button
              onClick={handleTogglePublic}
              disabled={isUpdating}
              className="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none disabled:opacity-50"
              style={{
                background: isPublic ? "#4ade80" : "rgba(255,255,255,0.15)",
              }}
            >
              <span
                className="inline-block h-4 w-4 transform rounded-full transition-transform"
                style={{
                  background: isPublic ? "#052e16" : "#F0FDF4",
                  transform: isPublic ? "translateX(24px)" : "translateX(4px)",
                }}
              />
            </button>
          </div>

          {isPublic && (
            <div className="space-y-5">
              {/* Link */}
              <div className="space-y-2">
                <label
                  className="text-xs font-bold uppercase tracking-wider ml-1"
                  style={{ color: "rgba(209,250,229,0.42)" }}
                >
                  Public Link
                </label>
                <div className="flex gap-2">
                  <div
                    className="flex-1 px-3 py-2.5 text-sm rounded-xl truncate"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.09)",
                      color: "rgba(209,250,229,0.65)",
                    }}
                  >
                    {publicUrl}
                  </div>
                  <button
                    onClick={copyToClipboard}
                    className="p-2.5 rounded-xl transition-all"
                    style={{
                      background: "rgba(255,255,255,0.06)",
                      border: "1px solid rgba(255,255,255,0.10)",
                      color: isCopied ? "#4ade80" : "rgba(209,250,229,0.65)",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.11)")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background =
                        "rgba(255,255,255,0.06)")
                    }
                    title="Copy to clipboard"
                  >
                    {isCopied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* QR Code — white bg intentional for scannability */}
              <div className="flex flex-col items-center gap-3 py-2">
                <div
                  className="p-4 rounded-2xl"
                  style={{
                    background: "#fff",
                    border: "2px dashed rgba(255,255,255,0.15)",
                  }}
                >
                  <QRCodeSVG
                    value={publicUrl}
                    size={148}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <p
                  className="text-xs text-center px-6 italic"
                  style={{ color: "rgba(209,250,229,0.38)" }}
                >
                  Scannable QR code for business cards and prints.
                </p>
              </div>

              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary w-full py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
              >
                <ExternalLink size={15} />
                Open Live Preview
              </a>
            </div>
          )}

          {!isPublic && (
            <div className="py-8 text-center space-y-3">
              <div
                className="mx-auto w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <Share2 size={22} style={{ color: "rgba(209,250,229,0.35)" }} />
              </div>
              <p
                className="text-sm px-6"
                style={{ color: "rgba(209,250,229,0.50)" }}
              >
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
