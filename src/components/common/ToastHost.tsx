import React, { useEffect, useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import type { ToastType } from "@/utils/toast";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

const ICONS = {
  success: <CheckCircle2 size={18} className="shrink-0 text-[#16A34A]" />,
  error: <AlertCircle size={18} className="shrink-0 text-[#DC2626]" />,
  info: <Info size={18} className="shrink-0 text-[#2B5FD9]" />,
};

/** Renders toasts raised anywhere in the app through utils/toast. */
const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: ToastType }>).detail || {};
      if (!message) return;
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-2), { id, message, type: type || "info" }]);
      // Errors stay a little longer so they can be read
      setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), type === "error" ? 6500 : 4200);
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 left-1/2 z-[200] flex w-[min(92vw,400px)] -translate-x-1/2 flex-col gap-2 font-inter sm:left-auto sm:right-4 sm:translate-x-0">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          className="modal-enter flex items-start gap-2.5 rounded-xl border border-[#E9EAEE] bg-white px-4 py-3 text-sm font-medium text-[#14161A] shadow-[0_12px_32px_rgba(16,24,40,0.16)]"
        >
          {ICONS[t.type]}
          <span className="min-w-0 break-words">{t.message}</span>
        </div>
      ))}
    </div>
  );
};

export default ToastHost;
