import React, { useState } from "react";
import { useResume } from "@/hooks";
import { fetchLinkedInProfile } from "@/services/linkedinService";
import { Loader2, X } from "lucide-react";

interface LinkedInImportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LinkedInImportModal: React.FC<LinkedInImportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { updateResumeData } = useResume();
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [urlFocused, setUrlFocused] = useState(false);

  if (!isOpen) return null;

  const handleImport = async () => {
    if (!url.trim()) {
      setError("Please enter a valid LinkedIn URL.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchLinkedInProfile(url);
      const data = response.data;
      if (!data) throw new Error("No profile data found for this URL.");
      const updates: any = {
        personalDetails: {
          fullName: data.full_name || "",
          jobTitle: data.headline || "",
          email: data.email || "",
          phone: data.phone_numbers?.[0] || "",
          location:
            `${data.city || ""}${data.city && data.state ? ", " : ""}${data.state || ""}${data.country_full_name ? ", " + data.country_full_name : ""}`.trim(),
          links: [{ id: crypto.randomUUID(), name: "LinkedIn", url: url }],
        },
        summary: data.about || "",
        experience: (data.experiences || []).map((exp: any) => ({
          id: crypto.randomUUID(),
          jobTitle: exp.title || "",
          company: exp.company || "",
          startDate: exp.starts_at
            ? `${exp.starts_at.month}/${exp.starts_at.year}`
            : "",
          endDate: exp.ends_at
            ? `${exp.ends_at.month}/${exp.ends_at.year}`
            : "Present",
          description: exp.description || "",
        })),
        education: (data.education || []).map((edu: any) => ({
          id: crypto.randomUUID(),
          degree: edu.degree_name || "",
          institution: edu.school || "",
          startDate: edu.starts_at ? `${edu.starts_at.year}` : "",
          endDate: edu.ends_at ? `${edu.ends_at.year}` : "",
        })),
      };
      updateResumeData(updates);
      onClose();
    } catch (err: any) {
      setError(err.message || "Failed to import profile.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{
        background: "rgba(0,0,0,0.72)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
      }}
      role="dialog"
      onClick={onClose}
    >
      <div
        className="modal-enter max-w-lg w-full p-6"
        style={{
          background: "rgba(10,17,14,0.96)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          border: "1px solid rgba(255,255,255,0.11)",
          borderRadius: "1rem",
          boxShadow: "0 24px 80px rgba(0,0,0,0.60)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex justify-between items-start mb-5">
          <h2
            className="text-lg font-bold tracking-tight"
            style={{ color: "#F0FDF4" }}
          >
            Import from LinkedIn
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors"
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

        <div className="space-y-4">
          <p
            className="text-sm leading-relaxed"
            style={{ color: "rgba(209,250,229,0.65)" }}
          >
            Connect using the RapidAPI integration to automatically populate
            your resume with your latest experience and details.
          </p>

          <div>
            <label
              className="block text-xs font-semibold uppercase tracking-wide mb-1.5"
              style={{ color: "rgba(209,250,229,0.55)" }}
            >
              LinkedIn Profile URL
            </label>
            <input
              type="url"
              placeholder="https://www.linkedin.com/in/username"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onFocus={() => setUrlFocused(true)}
              onBlur={() => setUrlFocused(false)}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: urlFocused
                  ? "1px solid rgba(74,222,128,0.52)"
                  : "1px solid rgba(255,255,255,0.12)",
                boxShadow: urlFocused
                  ? "0 0 0 3px rgba(74,222,128,0.10)"
                  : "none",
                color: "#F0FDF4",
                borderRadius: "0.5rem",
                padding: "0.625rem 0.875rem",
                outline: "none",
                width: "100%",
                fontSize: "0.875rem",
                transition: "border-color 0.18s ease, box-shadow 0.18s ease",
              }}
            />
          </div>

          {error && (
            <div
              className="text-sm p-3 rounded-lg"
              style={{
                background: "rgba(239,68,68,0.10)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#f87171",
              }}
            >
              <strong>Error:</strong> {error}
            </div>
          )}
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="btn-ghost px-5 py-2.5 rounded-xl text-sm"
          >
            Cancel
          </button>
          <button
            onClick={handleImport}
            disabled={isLoading || !url}
            className="btn-primary flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm disabled:opacity-50"
          >
            {isLoading ? <Loader2 size={15} className="animate-spin" /> : null}
            {isLoading ? "Importing..." : "Import Data"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LinkedInImportModal;
