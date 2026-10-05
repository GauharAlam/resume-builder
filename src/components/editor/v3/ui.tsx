import React, { useEffect, useRef } from "react";
import { FontFamily } from "@/types";

export const BLUE = "#2B5FD9";

export const cx = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(" ");

export const FONT_OPTIONS: { id: FontFamily; name: string }[] = [
  { id: "inter", name: "Inter" },
  { id: "roboto", name: "Roboto" },
  { id: "playfair", name: "Playfair Display" },
  { id: "merriweather", name: "Merriweather" },
  { id: "fira-code", name: "Fira Code" },
  { id: "sans", name: "System Sans" },
  { id: "serif", name: "System Serif" },
  { id: "mono", name: "System Mono" },
];

export const ACCENT_SWATCHES = [
  "#1B1B1B",
  "#2B5FD9",
  "#4F46E5",
  "#059669",
  "#0EA5E9",
  "#F59E0B",
  "#E11D48",
  "#475569",
];

export const isHexColor = (value: string) => /^#[0-9a-fA-F]{6}$/.test(value);

/** Closes a popover when the user clicks outside it or presses Escape. */
export const useDismiss = <T extends HTMLElement>(open: boolean, onClose: () => void) => {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);
  return ref;
};

const inputBase =
  "w-full rounded-lg border border-[#E3E5EA] bg-white px-3 py-2 text-sm text-[#14161A] placeholder:text-[#9AA0AB] transition-colors focus:border-[#2B5FD9] focus:outline-none focus:ring-2 focus:ring-[#2B5FD9]/15";

export const Field: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }
> = ({ label, hint, error, className, ...props }) => (
  <label className={cx("block", className)}>
    <span className="mb-1.5 block text-xs font-medium text-[#5B6270]">{label}</span>
    <input {...props} className={cx(inputBase, error && "border-[#DC2626] focus:border-[#DC2626] focus:ring-[#DC2626]/15")} />
    {error ? (
      <span className="mt-1 block text-xs text-[#DC2626]">{error}</span>
    ) : hint ? (
      <span className="mt-1 block text-xs text-[#9AA0AB]">{hint}</span>
    ) : null}
  </label>
);

export const TextAreaField: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string; action?: React.ReactNode; hint?: string }
> = ({ label, action, hint, className, rows = 5, ...props }) => (
  <div className={className}>
    {(label || action) && (
      <div className="mb-1.5 flex items-center justify-between gap-2">
        {label ? <span className="text-xs font-medium text-[#5B6270]">{label}</span> : <span />}
        {action}
      </div>
    )}
    <textarea {...props} rows={rows} aria-label={props["aria-label"] ?? label} className={cx(inputBase, "resize-y leading-relaxed")} />
    {hint && <span className="mt-1 block text-xs text-[#9AA0AB]">{hint}</span>}
  </div>
);

export const SelectField: React.FC<
  React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }
> = ({ label, className, children, ...props }) => (
  <label className={cx("block", className)}>
    {label && <span className="mb-1.5 block text-xs font-medium text-[#5B6270]">{label}</span>}
    <select
      {...props}
      aria-label={props["aria-label"] ?? label}
      className={cx(inputBase, "cursor-pointer appearance-none bg-no-repeat pr-8")}
      style={{
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236B7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        backgroundPosition: "right 0.6rem center",
      }}
    >
      {children}
    </select>
  </label>
);

export const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  children,
  ...props
}) => (
  <button
    {...props}
    className={cx(
      "inline-flex items-center justify-center gap-2 rounded-xl bg-[#2B5FD9] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#2450BD] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
  >
    {children}
  </button>
);

export const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  children,
  ...props
}) => (
  <button
    {...props}
    className={cx(
      "inline-flex items-center justify-center gap-2 rounded-xl border border-[#E3E5EA] bg-white px-4 py-2.5 text-sm font-medium text-[#14161A] shadow-[0_1px_2px_rgba(16,24,40,0.05)] transition-colors hover:bg-[#F6F7F9] disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
  >
    {children}
  </button>
);

export const IconButton: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }
> = ({ label, className, children, ...props }) => (
  <button
    {...props}
    aria-label={label}
    title={label}
    className={cx(
      "inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#3F4551] transition-colors hover:bg-[#F0F1F4] disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent",
      className,
    )}
  >
    {children}
  </button>
);

/** Centered dialog with a title bar. Closes on Escape and on backdrop click (unless `busy`). */
export const Modal: React.FC<{
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  onClose: () => void;
  busy?: boolean;
  widthClass?: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}> = ({ title, subtitle, icon, onClose, busy = false, widthClass = "max-w-lg", footer, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose, busy]);

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0B1220]/50 p-3 sm:p-6"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cx("modal-enter flex max-h-full w-full flex-col overflow-hidden rounded-2xl bg-white font-inter text-[#14161A] shadow-[0_24px_80px_rgba(16,24,40,0.3)]", widthClass)}
      >
        <div className="flex items-start justify-between gap-4 border-b border-[#E9EAEE] px-5 py-4">
          <div className="flex min-w-0 items-center gap-3">
            {icon && <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#EEF3FF] text-[#2B5FD9]">{icon}</span>}
            <div className="min-w-0">
              <h2 className="truncate text-[17px] font-semibold">{title}</h2>
              {subtitle && <p className="mt-0.5 text-sm text-[#6B7280]">{subtitle}</p>}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            className="-mr-1.5 shrink-0 rounded-lg p-2 text-[#6B7280] transition-colors hover:bg-[#F0F1F4] hover:text-[#14161A] disabled:opacity-40"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap items-center justify-end gap-2 border-t border-[#E9EAEE] px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
};

/** Inline message box for errors, warnings and notes inside panels and dialogs. */
export const Notice: React.FC<{ tone?: "error" | "warning" | "info"; children: React.ReactNode; className?: string }> = ({
  tone = "info",
  children,
  className,
}) => (
  <div
    role={tone === "error" ? "alert" : undefined}
    className={cx(
      "rounded-xl px-3.5 py-3 text-sm leading-relaxed",
      tone === "error" && "bg-[#FEECEC] text-[#B91C1C]",
      tone === "warning" && "bg-[#FEF6E7] text-[#92400E]",
      tone === "info" && "bg-[#F5F8FF] text-[#1E3A8A]",
      className,
    )}
  >
    {children}
  </div>
);
