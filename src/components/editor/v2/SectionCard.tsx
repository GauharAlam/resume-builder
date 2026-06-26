import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

interface SectionCardProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

const SectionCard: React.FC<SectionCardProps> = ({
  title,
  children,
  defaultOpen = true,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  React.useEffect(() => {
    const handleOpen = (e: CustomEvent | Event) => {
      if ("detail" in e && e.detail === title) {
        setIsOpen(true);
      }
    };
    window.addEventListener("open-section", handleOpen);
    return () => window.removeEventListener("open-section", handleOpen);
  }, [title]);

  return (
    <div
      className="rounded-xl overflow-hidden transition-all duration-200"
      style={{
        background: "rgba(255,255,255,0.05)",
        border: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      {/* Header / toggle */}
      <button
        type="button"
        className="w-full flex justify-between items-center px-5 py-4 cursor-pointer select-none transition-colors"
        style={{ background: "transparent" }}
        onClick={() => setIsOpen(!isOpen)}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "rgba(255,255,255,0.04)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <h3
          className="text-sm font-semibold tracking-wide"
          style={{ color: "#F0FDF4" }}
        >
          {title}
        </h3>
        <ChevronDown
          size={16}
          className="transition-transform duration-300 flex-shrink-0"
          style={{
            color: "rgba(209,250,229,0.45)",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Animated body — grid-template-rows trick for height: auto animation */}
      <div className={`section-body${isOpen ? " open" : ""}`}>
        <div
          className="section-body-inner px-5 pb-5 pt-1 space-y-4"
          style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default SectionCard;
