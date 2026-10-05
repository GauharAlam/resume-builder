import React, { useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Share2, Globe, Lock, Copy, Check, ExternalLink, Loader2 } from "lucide-react";
import { useResume } from "@/hooks";
import { trackEvent } from "@/services/analytics";
import { toastError, toastSuccess } from "@/utils/toast";
import { Modal, Notice, cx } from "./v3/ui";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose }) => {
  const { resumeData, toggleSharing } = useResume();
  const [isCopied, setIsCopied] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  if (!isOpen) return null;

  const hasShareId = Boolean(resumeData.shareId);
  const publicUrl = hasShareId ? `${window.location.origin}/view/${resumeData.shareId}` : "";
  const isPublic = resumeData.isPublic || false;

  const handleTogglePublic = async () => {
    setIsUpdating(true);
    setShareError(null);
    try {
      await toggleSharing(!isPublic);
      toastSuccess(!isPublic ? "Public sharing enabled." : "Public sharing disabled.");
    } catch (error) {
      console.error("Failed to toggle sharing:", error);
      setShareError("Couldn't update sharing. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const copyToClipboard = async () => {
    if (!publicUrl) return;
    try {
      await navigator.clipboard.writeText(publicUrl);
    } catch {
      // Fallback for non-HTTPS / denied clipboard permission
      try {
        const ta = document.createElement("textarea");
        ta.value = publicUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      } catch {
        toastError("Copy failed. Select the link and copy it manually.");
        return;
      }
    }
    setIsCopied(true);
    if (resumeData.shareId) trackEvent("resume_share_link_copied", { shareId: resumeData.shareId });
    toastSuccess("Link copied.");
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <Modal title="Share resume" subtitle="Give recruiters a link instead of an attachment." icon={<Share2 size={18} />} onClose={onClose} widthClass="max-w-md">
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-4 rounded-xl border border-[#E9EAEE] p-4">
          <div className="flex items-center gap-3">
            <span className={cx("flex h-9 w-9 items-center justify-center rounded-lg", isPublic ? "bg-[#E7F6EC] text-[#15803D]" : "bg-[#F3F4F6] text-[#6B7280]")}>
              {isPublic ? <Globe size={17} /> : <Lock size={17} />}
            </span>
            <div>
              <p className="text-sm font-semibold">Public link</p>
              <p className="text-xs text-[#6B7280]">{isPublic ? "Anyone with the link can view" : "Only you can see this resume"}</p>
            </div>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={isPublic}
            aria-label="Public link"
            onClick={handleTogglePublic}
            disabled={isUpdating}
            className={cx("relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-60", isPublic ? "bg-[#2B5FD9]" : "bg-[#D1D5DB]")}
          >
            <span className={cx("inline-block h-4 w-4 rounded-full bg-white shadow transition-transform", isPublic ? "translate-x-6" : "translate-x-1")} />
          </button>
        </div>

        {shareError && <Notice tone="error">{shareError}</Notice>}

        {isPublic ? (
          !hasShareId ? (
            <p className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Loader2 size={15} className="animate-spin" />
              Finishing share setup… close and reopen this window in a moment.
            </p>
          ) : (
            <>
              <div>
                <span className="mb-1.5 block text-xs font-medium text-[#5B6270]">Link</span>
                <div className="flex gap-2">
                  <input
                    readOnly
                    value={publicUrl}
                    aria-label="Public link"
                    onFocus={(e) => e.currentTarget.select()}
                    className="min-w-0 flex-1 rounded-lg border border-[#E3E5EA] bg-[#F6F7F9] px-3 py-2 text-sm text-[#14161A] focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    aria-label="Copy link"
                    title="Copy link"
                    className="flex h-[38px] w-[38px] shrink-0 items-center justify-center rounded-lg border border-[#E3E5EA] text-[#3F4551] hover:bg-[#F0F1F4]"
                  >
                    {isCopied ? <Check size={16} className="text-[#16A34A]" /> : <Copy size={16} />}
                  </button>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2 rounded-xl bg-[#F6F7F9] py-4">
                <div className="rounded-xl bg-white p-2 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
                  <QRCodeSVG value={publicUrl} size={132} level="M" includeMargin />
                </div>
                <p className="text-xs text-[#6B7280]">Scan to open on a phone</p>
              </div>
              <a
                href={publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#2B5FD9] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2450BD]"
              >
                <ExternalLink size={15} />
                Open public page
              </a>
            </>
          )
        ) : (
          <p className="rounded-xl bg-[#F6F7F9] px-4 py-6 text-center text-sm leading-relaxed text-[#6B7280]">
            Turn on the public link to get a shareable URL and QR code. You can turn it off again at any time.
          </p>
        )}
      </div>
    </Modal>
  );
};

export default ShareModal;
