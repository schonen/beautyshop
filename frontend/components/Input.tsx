import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  icon?: string; // nom d'icône Material Symbols, optionnel
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, id, className = "", ...rest }, ref) => {
    const inputId = id ?? label.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="space-y-space-xs text-left">
        <label htmlFor={inputId} className="flex items-center gap-space-xs font-label-md text-on-surface">
          {icon && <span className="material-symbols-outlined text-body-md text-primary">{icon}</span>}
          {label}
        </label>
        <input
          ref={ref}
          id={inputId}
          className={`h-12 w-full rounded-xl border px-space-md font-body-md text-on-surface outline-none transition-all duration-200
            placeholder:text-outline focus:bg-surface-container-low
            ${error ? "border-error" : "border-surface-container bg-surface"} ${className}`}
          {...rest}
        />
        {error && <p className="text-xs text-error">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
