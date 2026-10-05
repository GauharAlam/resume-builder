import React, { useEffect, useState } from "react";
import type { ToastType } from "@/utils/toast";

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

let toastId = 0;

const ToastHost: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handler = (e: Event) => {
      const { message, type } = (e as CustomEvent<{ message: string; type: ToastType }>).detail || {};
      if (!message) return;
      const id = ++toastId;
      setToasts((prev) => [...prev.slice(-2), { id, message, type: type || "info" }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4200);
    };
    window.addEventListener("app-toast", handler);
    return () => window.removeEventListener("app-toast", handler);
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[200] flex flex-col gap-2 max-w-[min(92vw,380px)]">
      {toasts.map((t) => (
        <div
          key={t.id}
          role={t.type === "error" ? "alert" : "status"}
          className="px-4 py-3 rounded-xl text-sm font-medium shadow-2xl"
          style={{
            background:
              t.type === "error"
                ? "rgba(127,29,29,0.96)"
                : t.type === "success"
                  ? "rgba(6,78,59,0.96)"
                  : "rgba(10,17,14,0.96)",
            border: `1px solid ${
              t.type === "error"
                ? "rgba(248,113,113,0.4)"
                : t.type === "success"
                  ? "rgba(74,222,128,0.4)"
                  : "rgba(255,255,255,0.14)"
            }`,
            color: "#F0FDF4",
            backdropFilter: "blur(16px)",
            WebkitBackdropFilter: "blur(16px)",
          }}
        >
          {t.message}
        </div>
      ))}
    </div>
  );
};

export default ToastHost;
