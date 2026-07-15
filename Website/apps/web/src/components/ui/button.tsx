import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
}

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-fg shadow-sm hover:bg-primary-hover active:scale-[0.98] disabled:opacity-50",
  secondary:
    "bg-secondary text-secondary-fg shadow-sm hover:bg-secondary-hover active:scale-[0.98] disabled:opacity-50",
  outline:
    "border border-border bg-surface-elevated text-foreground hover:bg-surface active:scale-[0.98] disabled:opacity-50",
  ghost:
    "text-foreground hover:bg-surface active:scale-[0.98] disabled:opacity-50",
  danger:
    "bg-error text-white shadow-sm hover:opacity-90 active:scale-[0.98] disabled:opacity-50",
};

const sizes: Record<ButtonSize, string> = {
  sm: "h-9 min-w-[80px] px-4 text-sm rounded-[var(--radius-sm)]",
  md: "h-11 min-w-[80px] px-6 text-sm font-medium rounded-[var(--radius-md)]",
  lg: "h-12 min-w-[80px] px-8 text-base font-medium rounded-[var(--radius-md)]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      children,
      type = "button",
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2 transition-all duration-150 ease-out",
          "cursor-pointer disabled:cursor-not-allowed",
          variants[variant],
          sizes[size],
          className,
        )}
        {...props}
      >
        {loading && (
          <span
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden
          />
        )}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";
