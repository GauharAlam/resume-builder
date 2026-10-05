import { useCallback } from "react";
import { useResume } from "@/hooks";
import { toastSuccess } from "@/utils/toast";
import { ImportedResume, isImportEmpty, isResumeBlank, normalizeImportedResume } from "@/utils/resumeImport";

/**
 * Applies content from an import source (uploaded file, LinkedIn, AI generator)
 * to the open resume as one undoable change.
 *
 * - "replace": the import is the whole resume (upload, AI generator).
 * - "merge": only the fields the source actually provided are written, so a
 *   LinkedIn profile without skills doesn't wipe the skills already entered.
 */
export const useApplyImport = () => {
  const { resumeData, updateResumeData } = useResume();

  const apply = useCallback(
    (raw: unknown, mode: "replace" | "merge" = "replace") => {
      const data = normalizeImportedResume(raw);
      if (isImportEmpty(data)) throw new Error("Nothing usable was found. Try another source, or fill the sections in manually.");

      if (mode === "replace") {
        updateResumeData(data);
      } else {
        const updates: Partial<ImportedResume> = {};
        const current = resumeData.personalDetails;
        const incoming = data.personalDetails;
        const knownUrls = new Set((current.links || []).map((l) => l.url.trim().toLowerCase()));
        updates.personalDetails = {
          ...current,
          fullName: incoming.fullName || current.fullName,
          jobTitle: incoming.jobTitle || current.jobTitle,
          email: incoming.email || current.email,
          phone: incoming.phone || current.phone,
          location: incoming.location || current.location,
          links: [...(current.links || []), ...incoming.links.filter((l) => !knownUrls.has(l.url.trim().toLowerCase()))],
        };
        if (data.summary) updates.summary = data.summary;
        if (data.experience.length) updates.experience = data.experience;
        if (data.education.length) updates.education = data.education;
        if (data.skills) updates.skills = data.skills;
        if (data.projects.length) updates.projects = data.projects;
        if (data.accomplishments.length) updates.accomplishments = data.accomplishments;
        updateResumeData(updates);
      }
      toastSuccess("Your resume has been filled in. Review each section; you can undo this from the toolbar.");
    },
    [resumeData.personalDetails, updateResumeData],
  );

  return { apply, hasContent: !isResumeBlank(resumeData) };
};
