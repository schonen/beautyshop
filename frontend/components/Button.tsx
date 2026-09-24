import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

const variantClasses: Record<string, string> = {
  primary:
    "bg-primary text-on-primary shadow-[0_2px_8px_-2px_rgba(173,45,71,0.35)] hover:opacity-95 focus-visible:ring-primary",
  secondary: "bg-on-surface text-surface-bright hover:opacity-90 focus-visible:ring-on-surface",
  outline:
    "border border-outline-variant text-on-surface hover:bg-surface-container-low focus-visible:ring-outline",
  danger: "bg-error text-on-error hover:opacity-90 focus-visible:ring-error",
  ghost: "text-on-surface-variant hover:bg-surface-container-low focus-visible:ring-outline",
};

const sizeClasses: Record<string, string> = {
  sm: "px-4 py-1.5 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-8 py-3.5 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", loading, disabled, className = "", children, ...rest }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`inline-flex items-center justify-center gap-2 rounded-full font-label-md text-label-md transition-all
          active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          disabled:cursor-not-allowed disabled:opacity-50 disabled:active:scale-100
          ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        {...rest}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </button>
    );
  }
);
Button.displayName = "Button";
