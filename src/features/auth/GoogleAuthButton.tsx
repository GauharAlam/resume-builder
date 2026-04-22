import React, { useEffect, useRef, useState } from "react";
import apiRequest from "@/services/api";
import { trackEvent } from "@/services/analytics";

type GoogleAuthMode = "login" | "register";

interface GoogleAuthButtonProps {
  mode: GoogleAuthMode;
  onSuccess: (token: string) => void;
  onError: (message: string) => void;
}

interface GoogleCredentialResponse {
  credential?: string;
}

interface GoogleIdConfiguration {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void | Promise<void>;
}

interface GoogleButtonOptions {
  theme: "outline" | "filled_blue" | "filled_black";
  size: "large" | "medium" | "small";
  text: "signin_with" | "signup_with" | "continue_with";
  shape: "rectangular" | "pill" | "circle" | "square";
  width?: number;
  logo_alignment?: "left" | "center";
}

interface GoogleNamespace {
  accounts?: {
    id: {
      initialize: (config: GoogleIdConfiguration) => void;
      renderButton: (element: HTMLElement, options: GoogleButtonOptions) => void;
    };
  };
}

declare global {
  interface Window {
    google?: GoogleNamespace;
  }
}

const GOOGLE_SCRIPT_ID = "google-identity-services";
const GOOGLE_SCRIPT_SRC = "https://accounts.google.com/gsi/client";

let googleScriptPromise: Promise<void> | null = null;

const loadGoogleScript = () => {
  if (window.google?.accounts?.id) {
    return Promise.resolve();
  }

  if (googleScriptPromise) {
    return googleScriptPromise;
  }

  googleScriptPromise = new Promise<void>((resolve, reject) => {
    const existingScript = document.getElementById(GOOGLE_SCRIPT_ID) as HTMLScriptElement | null;

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error("Failed to load Google sign-in.")), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = GOOGLE_SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Failed to load Google sign-in."));
    document.head.appendChild(script);
  });

  return googleScriptPromise;
};

const GoogleAuthButton: React.FC<GoogleAuthButtonProps> = ({ mode, onSuccess, onError }) => {
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const successRef = useRef(onSuccess);
  const errorRef = useRef(onError);
  const [isLoading, setIsLoading] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;

  useEffect(() => {
    successRef.current = onSuccess;
    errorRef.current = onError;
  }, [onError, onSuccess]);

  useEffect(() => {
    let isMounted = true;

    if (!clientId) {
      setInitError("Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to enable it.");
      return () => {
        isMounted = false;
      };
    }

    const setupGoogleButton = async () => {
      try {
        await loadGoogleScript();

        if (!isMounted || !buttonRef.current || !window.google?.accounts?.id) {
          return;
        }

        buttonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async ({ credential }) => {
            if (!credential) {
              errorRef.current("Google did not return a sign-in credential.");
              return;
            }

            setIsLoading(true);
            errorRef.current("");

            try {
              const result = await apiRequest("/auth/google", {
                method: "POST",
                body: JSON.stringify({ credential }),
              });

              if (!result?.success || !result.data?.token) {
                throw new Error(result?.message || "Failed to sign in with Google.");
              }

              trackEvent(mode === "register" ? "funnel_register_success" : "funnel_login_success", {
                method: "google",
              });
              successRef.current(result.data.token);
            } catch (error: any) {
              errorRef.current(error.message || "Failed to sign in with Google.");
            } finally {
              setIsLoading(false);
            }
          },
        });

        window.google.accounts.id.renderButton(buttonRef.current, {
          theme: "outline",
          size: "large",
          text: mode === "register" ? "signup_with" : "signin_with",
          shape: "rectangular",
          width: Math.max(buttonRef.current.offsetWidth, 280),
          logo_alignment: "left",
        });

        setInitError(null);
      } catch (error: any) {
        if (!isMounted) {
          return;
        }
        setInitError(error.message || "Google sign-in could not be loaded.");
      }
    };

    void setupGoogleButton();

    return () => {
      isMounted = false;
    };
  }, [clientId, mode]);

  return (
    <div className="space-y-3">
      {initError && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
          {initError}
        </div>
      )}

      <div className="relative min-h-[44px]">
        <div ref={buttonRef} className="flex w-full justify-center" />
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-white/80 text-sm font-medium text-gray-600">
            Signing in with Google...
          </div>
        )}
      </div>
    </div>
  );
};

export default GoogleAuthButton;
