// Lightweight event-based toast helper (no dependency).
// Usage: toast("Saved", "success") -> ToastHost listens for "app-toast".
export type ToastType = "success" | "error" | "info";

export function toast(message: string, type: ToastType = "info") {
  window.dispatchEvent(
    new CustomEvent("app-toast", { detail: { message, type } })
  );
}

export function toastSuccess(message: string) {
  toast(message, "success");
}

export function toastError(message: string) {
  toast(message, "error");
}

export function toastInfo(message: string) {
  toast(message, "info");
}
