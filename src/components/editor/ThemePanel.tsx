import React from "react";
import { useResume } from "@/hooks";
import { FontFamily, FontSize, LayoutSpacing } from "@/types";
import { Check, Type, Palette, Layout, MousePointer2 } from "lucide-react";

const COLORS = [
  { name: "Indigo", value: "#4F46E5" },
  { name: "Emerald", value: "#10B981" },
  { name: "Rose", value: "#F43F5E" },
  { name: "Amber", value: "#F59E0B" },
  { name: "Slate", value: "#475569" },
  { name: "Blue", value: "#3B82F6" },
  { name: "Violet", value: "#8B5CF6" },
  { name: "Orange", value: "#F97316" },
];

const FONTS: { id: FontFamily; name: string; type: string }[] = [
  { id: "inter", name: "Inter", type: "Sans" },
  { id: "roboto", name: "Roboto", type: "Sans" },
  { id: "playfair", name: "Playfair Display", type: "Serif" },
  { id: "merriweather", name: "Merriweather", type: "Serif" },
  { id: "fira-code", name: "Fira Code", type: "Mono" },
  { id: "monaco", name: "Monaco", type: "Mono" },
];

const SectionLabel: React.FC<{ icon: React.ReactNode; label: string }> = ({
  icon,
  label,
}) => (
  <div className="flex items-center gap-2 mb-4">
    <span style={{ color: "rgba(209,250,229,0.40)" }}>{icon}</span>
    <h3
      className="text-xs font-bold uppercase tracking-widest"
      style={{ color: "rgba(209,250,229,0.40)" }}
    >
      {label}
    </h3>
  </div>
);

const ThemePanel: React.FC = () => {
  const { resumeData, updateResumeData } = useResume();
  const { accentColor, customization } = resumeData;

  const handleColorChange = (color: string) =>
    updateResumeData({ accentColor: color });
  const handleFontChange = (font: FontFamily) =>
    updateResumeData({ customization: { ...customization, fontFamily: font } });
  const handleFontSizeChange = (size: FontSize) =>
    updateResumeData({ customization: { ...customization, fontSize: size } });
  const handleLayoutChange = (layout: LayoutSpacing) =>
    updateResumeData({ customization: { ...customization, layout } });

  return (
    <div className="p-6 space-y-8">
      {/* Color */}
      <section>
        <SectionLabel icon={<Palette size={16} />} label="Accent Color" />
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => handleColorChange(c.value)}
              className="group relative flex flex-col items-center gap-1"
            >
              <div
                className="w-10 h-10 rounded-full transition-all relative"
                style={{
                  backgroundColor: c.value,
                  border:
                    accentColor === c.value
                      ? "2px solid rgba(255,255,255,0.90)"
                      : "2px solid transparent",
                  transform:
                    accentColor === c.value ? "scale(1.12)" : "scale(1)",
                  boxShadow:
                    accentColor === c.value ? `0 0 12px ${c.value}80` : "none",
                }}
              >
                {accentColor === c.value && (
                  <div className="absolute inset-0 flex items-center justify-center text-white">
                    <Check size={14} strokeWidth={3} />
                  </div>
                )}
              </div>
              <span
                className="text-[10px] font-bold uppercase opacity-0 group-hover:opacity-100 transition-opacity"
                style={{ color: "rgba(209,250,229,0.55)" }}
              >
                {c.name}
              </span>
            </button>
          ))}
          {/* Custom picker */}
          <div className="relative group flex flex-col items-center gap-1">
            <label
              className="w-10 h-10 rounded-full flex items-center justify-center cursor-pointer overflow-hidden transition-all"
              style={{
                border: "2px dashed rgba(255,255,255,0.20)",
                background: "rgba(255,255,255,0.06)",
              }}
            >
              <MousePointer2
                size={14}
                style={{ color: "rgba(209,250,229,0.45)" }}
              />
              <input
                type="color"
                value={accentColor}
                onChange={(e) => handleColorChange(e.target.value)}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
            </label>
            <span
              className="text-[10px] font-bold uppercase"
              style={{ color: "rgba(209,250,229,0.40)" }}
            >
              Custom
            </span>
          </div>
        </div>
      </section>

      {/* Typography */}
      <section>
        <SectionLabel icon={<Type size={16} />} label="Typography" />
        <div className="space-y-2">
          {FONTS.map((font) => {
            const active = customization.fontFamily === font.id;
            return (
              <button
                key={font.id}
                onClick={() => handleFontChange(font.id)}
                className="w-full flex items-center justify-between p-3 rounded-xl transition-all"
                style={{
                  background: active
                    ? "rgba(74,222,128,0.12)"
                    : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? "rgba(74,222,128,0.35)" : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#4ade80" : "rgba(209,250,229,0.65)",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.14)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                    e.currentTarget.style.borderColor =
                      "rgba(255,255,255,0.08)";
                  }
                }}
              >
                <div className="text-left">
                  <p className="text-sm font-bold">{font.name}</p>
                  <p
                    className="text-[10px] font-bold uppercase"
                    style={{
                      color: active
                        ? "rgba(74,222,128,0.65)"
                        : "rgba(209,250,229,0.35)",
                    }}
                  >
                    {font.type}
                  </p>
                </div>
                {active && <Check size={15} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      </section>

      {/* Layout Density */}
      <section>
        <SectionLabel icon={<Layout size={16} />} label="Layout Density" />
        <div
          className="flex p-1 rounded-xl gap-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {(["compact", "standard", "spacious"] as LayoutSpacing[]).map(
            (sp) => {
              const active = customization.layout === sp;
              return (
                <button
                  key={sp}
                  onClick={() => handleLayoutChange(sp)}
                  className="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                  style={{
                    background: active
                      ? "rgba(74,222,128,0.18)"
                      : "transparent",
                    color: active ? "#4ade80" : "rgba(209,250,229,0.45)",
                    border: active
                      ? "1px solid rgba(74,222,128,0.30)"
                      : "1px solid transparent",
                  }}
                >
                  {sp}
                </button>
              );
            },
          )}
        </div>
      </section>

      {/* Font Size */}
      <section>
        <SectionLabel
          icon={
            <div
              className="flex items-center justify-center w-4 h-4 rounded text-[10px] font-bold leading-none"
              style={{ border: "1.5px solid rgba(209,250,229,0.40)" }}
            >
              A
            </div>
          }
          label="Font Size"
        />
        <div
          className="flex p-1 rounded-xl gap-1"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          {(["small", "medium", "large"] as FontSize[]).map((sz) => {
            const active = customization.fontSize === sz;
            return (
              <button
                key={sz}
                onClick={() => handleFontSizeChange(sz)}
                className="flex-1 py-2 text-xs font-bold uppercase tracking-wider rounded-lg transition-all"
                style={{
                  background: active ? "rgba(74,222,128,0.18)" : "transparent",
                  color: active ? "#4ade80" : "rgba(209,250,229,0.45)",
                  border: active
                    ? "1px solid rgba(74,222,128,0.30)"
                    : "1px solid transparent",
                }}
              >
                {sz}
              </button>
            );
          })}
        </div>
      </section>
    </div>
  );
};

export default ThemePanel;
