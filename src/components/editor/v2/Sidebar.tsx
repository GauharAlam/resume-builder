import React, { useState, useRef, useEffect } from "react";
import {
  LayoutGrid,
  User,
  Trophy,
  FileText,
  Mail,
  Briefcase,
  LogOut,
  History,
  Award,
  Palette,
  Share2,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context";

const Sidebar: React.FC = () => {
  const [activeItem, setActiveItem] = useState(0);
  const iconsContainerRef = useRef<HTMLDivElement>(null);

  // Scroll-spy: update active icon when EditorPanel scrolls
  useEffect(() => {
    const handleSectionInView = (e: Event) => {
      const idx = (e as CustomEvent<number>).detail;
      if (typeof idx === "number" && idx >= 0 && idx < 7) {
        setActiveItem(idx);
      }
    };
    window.addEventListener("section-in-view", handleSectionInView);
    return () =>
      window.removeEventListener("section-in-view", handleSectionInView);
  }, []);

  // Auto-scroll the active icon button into view within the sidebar
  useEffect(() => {
    const container = iconsContainerRef.current;
    if (!container) return;
    const activeBtn = container.querySelector(
      `[data-sidebar-idx="${activeItem}"]`,
    ) as HTMLElement | null;
    if (activeBtn) {
      activeBtn.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [activeItem]);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const navigate = useNavigate();
  const { logout } = useAuth();

  const icons = [LayoutGrid, User, Trophy, FileText, Mail, Briefcase, Award];
  const sectionNames = [
    "Basics",
    "Professional Summary",
    "Experience",
    "Education",
    "Skills",
    "Projects",
    "Accomplishments",
  ];

  const handleNavClick = (idx: number) => {
    setActiveItem(idx);
    window.dispatchEvent(
      new CustomEvent("open-section", { detail: sectionNames[idx] }),
    );
    setTimeout(() => {
      document
        .getElementById(`section-${idx}`)
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div
      className="w-16 h-screen flex flex-col justify-between items-center py-4 flex-shrink-0 relative z-50"
      style={{
        background: "rgba(10,17,14,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
      }}
    >
      {/* Logo mark */}
      <div
        className="w-9 h-9 rounded-xl flex items-center justify-center mb-6 flex-shrink-0"
        style={{
          background: "rgba(74,222,128,0.15)",
          border: "1px solid rgba(74,222,128,0.28)",
        }}
      >
        <LayoutGrid size={18} style={{ color: "#4ade80" }} />
      </div>

      {/* Section nav icons */}
      <div ref={iconsContainerRef} className="flex-1 flex flex-col gap-2 w-full px-2 overflow-y-auto" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
        {icons.map((Icon, idx) => {
          const isActive = activeItem === idx;
          return (
            <div key={isActive ? `${idx}-active-${activeItem}` : idx} className="relative group">
              <button
                data-sidebar-idx={idx}
                className={`p-2.5 rounded-xl flex items-center justify-center w-full transition-all duration-200${isActive ? " sidebar-icon-glow" : ""}`}
                style={{
                  background: isActive ? "rgba(74,222,128,0.13)" : "transparent",
                  border: `1px solid ${isActive ? "rgba(74,222,128,0.28)" : "transparent"}`,
                  color: isActive ? "#4ade80" : "rgba(209,250,229,0.40)",
                  transform: isActive ? "scale(1.08)" : "scale(1)",
                }}
                onClick={() => handleNavClick(idx)}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
                    e.currentTarget.style.color = "rgba(209,250,229,0.75)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.background = "transparent";
                    e.currentTarget.style.color = "rgba(209,250,229,0.40)";
                  }
                }}
              >
                <Icon size={19} strokeWidth={isActive ? 2.5 : 1.8} />
              </button>
              {/* Custom tooltip */}
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-[100]"
                style={{
                  background: "rgba(10,17,14,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderLeft: "2px solid #4ade80",
                  color: "#F0FDF4",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {sectionNames[idx]}
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div
          className="mt-2 pt-3 flex flex-col gap-2"
          style={{ borderTop: "1px solid rgba(255,255,255,0.07)" }}
        >
          {[
            {
              icon: Palette,
              title: "Theme Settings",
              event: "open-theme-panel",
              color: "#a78bfa",
              bg: "rgba(167,139,250,0.12)",
              border: "rgba(167,139,250,0.22)",
              accentBorder: "#a78bfa",
            },
            {
              icon: Share2,
              title: "Share Resume",
              event: "open-share-modal",
              color: "#60a5fa",
              bg: "rgba(96,165,250,0.12)",
              border: "rgba(96,165,250,0.22)",
              accentBorder: "#60a5fa",
            },
          ].map(({ icon: Icon, title, event, color, bg, border, accentBorder }) => (
            <div key={title} className="relative group">
              <button
                className="p-2.5 rounded-xl flex items-center justify-center w-full transition-all duration-150"
                style={{
                  color: "rgba(209,250,229,0.45)",
                  border: "1px solid transparent",
                }}
                onClick={() => window.dispatchEvent(new CustomEvent(event))}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = bg;
                  e.currentTarget.style.borderColor = border;
                  e.currentTarget.style.color = color;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.borderColor = "transparent";
                  e.currentTarget.style.color = "rgba(209,250,229,0.45)";
                }}
              >
                <Icon size={19} strokeWidth={1.8} />
              </button>
              {/* Custom tooltip */}
              <div
                className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap pointer-events-none opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0 transition-all duration-200 z-[100]"
                style={{
                  background: "rgba(10,17,14,0.95)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderLeft: `2px solid ${accentBorder}`,
                  color: "#F0FDF4",
                  boxShadow: "0 4px 20px rgba(0,0,0,0.5)",
                  backdropFilter: "blur(12px)",
                  WebkitBackdropFilter: "blur(12px)",
                }}
              >
                {title}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Avatar + menu */}
      <div className="relative mt-6" ref={menuRef}>
        <div
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm cursor-pointer transition-all select-none"
          style={{
            background: "rgba(74,222,128,0.18)",
            border: "1px solid rgba(74,222,128,0.30)",
            color: "#4ade80",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(74,222,128,0.28)";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(74,222,128,0.18)";
          }}
        >
          A
        </div>

        {isMenuOpen && (
          <div
            className="absolute left-[52px] bottom-0 w-48 rounded-xl py-1.5 overflow-hidden z-50"
            style={{
              background: "rgba(10,17,14,0.96)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.50)",
            }}
          >
            <button
              onClick={() => {
                navigate("/history");
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors"
              style={{ color: "rgba(209,250,229,0.75)" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(255,255,255,0.07)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <History size={15} style={{ color: "rgba(209,250,229,0.50)" }} />
              <span className="font-medium">Dashboard</span>
            </button>
            <div
              style={{
                height: "1px",
                background: "rgba(255,255,255,0.07)",
                margin: "4px 0",
              }}
            />
            <button
              onClick={() => {
                logout();
                navigate("/login");
              }}
              className="w-full text-left px-4 py-2.5 text-sm flex items-center gap-3 transition-colors"
              style={{ color: "#f87171" }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.background = "rgba(239,68,68,0.08)")
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.background = "transparent")
              }
            >
              <LogOut size={15} style={{ color: "#f87171" }} />
              <span className="font-medium">Sign out</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar;
