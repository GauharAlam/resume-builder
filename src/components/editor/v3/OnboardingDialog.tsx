import React from "react";
import { ArrowRight, FileUp, Linkedin, PenLine, Wand2 } from "lucide-react";
import { Modal } from "./ui";

export type StartChoice = "upload" | "linkedin" | "generate" | "blank";

const OPTIONS: { id: StartChoice; icon: React.ElementType; title: string; body: string; badge?: string }[] = [
  { id: "upload", icon: FileUp, title: "Upload my existing resume", body: "PDF or Word. We'll sort it into sections for you.", badge: "Fastest" },
  { id: "linkedin", icon: Linkedin, title: "Import from LinkedIn", body: "Pull experience and education from your public profile." },
  { id: "generate", icon: Wand2, title: "Draft with AI", body: "Get example content for your target role to rewrite." },
  { id: "blank", icon: PenLine, title: "Start from scratch", body: "Fill in the builder one section at a time." },
];

/** Shown when a brand-new, empty resume is opened, so nobody starts on a blank page by accident. */
const OnboardingDialog: React.FC<{ onChoose: (choice: StartChoice) => void }> = ({ onChoose }) => (
  <Modal title="How would you like to start?" subtitle="You can change everything afterwards." onClose={() => onChoose("blank")} widthClass="max-w-xl">
    <div className="grid gap-3 sm:grid-cols-2">
      {OPTIONS.map(({ id, icon: Icon, title, body, badge }) => (
        <button
          key={id}
          type="button"
          autoFocus={id === "upload"}
          onClick={() => onChoose(id)}
          className="group relative flex flex-col rounded-xl border border-[#E3E5EA] p-4 text-left transition-colors hover:border-[#2B5FD9] hover:bg-[#F5F8FF] focus-visible:border-[#2B5FD9] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2B5FD9]/20"
        >
          {badge && <span className="absolute right-3 top-3 rounded-md bg-[#E7F6EC] px-1.5 py-0.5 text-[11px] font-semibold text-[#15803D]">{badge}</span>}
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#EEF3FF] text-[#2B5FD9]">
            <Icon size={18} />
          </span>
          <span className="mt-3 flex items-center gap-1 text-[15px] font-semibold text-[#14161A]">
            {title}
            <ArrowRight size={14} className="opacity-0 transition-opacity group-hover:opacity-100" />
          </span>
          <span className="mt-1 text-sm leading-relaxed text-[#6B7280]">{body}</span>
        </button>
      ))}
    </div>
  </Modal>
);

export default OnboardingDialog;
