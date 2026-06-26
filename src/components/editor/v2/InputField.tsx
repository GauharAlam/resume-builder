import React from "react";

interface InputFieldProps extends React.InputHTMLAttributes<
  HTMLInputElement | HTMLTextAreaElement
> {
  label: string;
  as?: "input" | "textarea";
  actionButton?: React.ReactNode;
}

/* Shared dark-surface field styles */
const fieldStyle: React.CSSProperties = {
  background: "rgba(255,255,255,0.06)",
  border: "1px solid rgba(255,255,255,0.11)",
  color: "#F0FDF4",
  borderRadius: "0.5rem",
  padding: "0.5rem 0.75rem",
  fontSize: "0.875rem",
  width: "100%",
  outline: "none",
  transition:
    "border-color 0.18s ease, background 0.18s ease, box-shadow 0.18s ease",
};

const InputField: React.FC<InputFieldProps> = ({
  label,
  as = "input",
  className = "",
  actionButton,
  ...props
}) => {
  /* Focus / blur handlers to mimic focus-ring without Tailwind focus utilities */
  const onFocus = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.09)";
    e.currentTarget.style.borderColor = "rgba(74,222,128,0.52)";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(74,222,128,0.10)";
  };
  const onBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.06)";
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.11)";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <div className="flex justify-between items-center">
        <label
          className="text-xs font-semibold tracking-wide uppercase"
          style={{ color: "rgba(209,250,229,0.55)" }}
        >
          {label}
        </label>
        {actionButton && <div>{actionButton}</div>}
      </div>

      {as === "textarea" ? (
        <textarea
          style={{ ...fieldStyle, resize: "vertical" }}
          rows={4}
          onFocus={onFocus}
          onBlur={onBlur}
          {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
        />
      ) : (
        <input
          style={fieldStyle}
          onFocus={onFocus}
          onBlur={onBlur}
          {...(props as React.InputHTMLAttributes<HTMLInputElement>)}
        />
      )}
    </div>
  );
};

export default InputField;
