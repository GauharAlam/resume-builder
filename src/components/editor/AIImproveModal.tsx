import React, { useState, useEffect } from "react";
import { X, Check, RotateCcw, Edit3 } from "lucide-react";

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
  section,
}) => {
  const [editableNewText, setEditableNewText] = useState(initialNewText);
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    setEditableNewText(initialNewText);
  }, [initialNewText]);

  if (!isOpen) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
    >
      {/* Modal */}
      <div
        className="modal-enter w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]"
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
          className="flex justify-between items-center p-6"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderBottom: "1px solid rgba(255,255,255,0.07)",
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="p-2 rounded-lg"
              style={{
                background: "rgba(74,222,128,0.15)",
                border: "1px solid rgba(74,222,128,0.25)",
              }}
            >
              <Edit3 size={18} style={{ color: "#4ade80" }} />
            </div>
            <div>
              <h2 className="text-lg font-bold" style={{ color: "#F0FDF4" }}>
                Review AI Improvement
              </h2>
              <p
                className="text-sm"
                style={{ color: "rgba(209,250,229,0.55)" }}
              >
                Refining your {section} description
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full transition-colors"
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
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Original */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span
                  className="text-xs font-bold uppercase tracking-wider"
                  style={{ color: "rgba(209,250,229,0.40)" }}
                >
                  Original Text
                </span>
                <button
                  onClick={() => setEditableNewText(oldText)}
                  className="text-xs flex items-center gap-1 transition-colors"
                  style={{ color: "#4ade80" }}
                >
                  <RotateCcw size={11} /> Reset to original
                </button>
              </div>
              <div
                className="p-4 rounded-xl text-sm h-[250px] overflow-y-auto italic"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(209,250,229,0.65)",
                }}
              >
                {oldText || "No original text found."}
              </div>
            </div>

            {/* AI Suggestion */}
            <div className="space-y-3">
              <span
                className="text-xs font-bold uppercase tracking-wider"
                style={{ color: "#4ade80" }}
              >
                AI Suggestion (Editable)
              </span>
              <textarea
                value={editableNewText}
                onChange={(e) => setEditableNewText(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                className="w-full h-[250px] text-sm resize-none rounded-xl p-4 outline-none transition-all"
                style={{
                  background: "rgba(74,222,128,0.06)",
                  border: focused
                    ? "1px solid rgba(74,222,128,0.52)"
                    : "1px solid rgba(74,222,128,0.20)",
                  boxShadow: focused
                    ? "0 0 0 3px rgba(74,222,128,0.10)"
                    : "none",
                  color: "#F0FDF4",
                }}
                placeholder="AI response will appear here..."
              />
            </div>
          </div>

          {/* Pro tip */}
          <div
            className="p-4 rounded-xl flex gap-3 items-start"
            style={{
              background: "rgba(96,165,250,0.08)",
              border: "1px solid rgba(96,165,250,0.18)",
            }}
          >
            <div style={{ color: "#60a5fa", marginTop: "2px" }}>💡</div>
            <p
              className="text-xs leading-relaxed"
              style={{ color: "rgba(209,250,229,0.70)" }}
            >
              <strong style={{ color: "#F0FDF4" }}>Pro Tip:</strong> You can
              edit the AI suggestion directly before accepting it. Include
              specific metrics and action verbs for best results.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div
          className="p-6 flex justify-end gap-3"
          style={{
            borderTop: "1px solid rgba(255,255,255,0.07)",
            background: "rgba(255,255,255,0.03)",
          }}
        >
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
            style={{ color: "rgba(209,250,229,0.65)" }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "transparent")
            }
          >
            Discard
          </button>
          <button
            onClick={() => onAccept(oldText)}
            className="px-5 py-2.5 text-sm font-semibold rounded-xl transition-all"
            style={{
              color: "rgba(209,250,229,0.75)",
              background: "rgba(255,255,255,0.07)",
              border: "1px solid rgba(255,255,255,0.12)",
            }}
            onMouseEnter={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.12)")
            }
            onMouseLeave={(e) =>
              (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
            }
          >
            Keep Original
          </button>
          <button
            onClick={() => onAccept(editableNewText)}
            className="btn-primary px-7 py-2.5 text-sm rounded-xl flex items-center gap-2"
          >
            <Check size={16} /> Apply Improvement
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIImproveModal;
