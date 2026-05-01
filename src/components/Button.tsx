import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: ReactNode;
}

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold transition-[background-color,transform,box-shadow,border-color] duration-200 focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-primary-light focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:transform-none";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-primary text-white shadow-[0_4px_24px_rgba(180,145,143,0.25)] hover:bg-accent-hover hover:-translate-y-0.5 hover:shadow-[0_8px_40px_rgba(180,145,143,0.4)]",
  secondary:
    "border-[1.5px] border-border-default bg-white text-text-primary hover:border-primary-light hover:bg-cream-subtle hover:-translate-y-0.5",
  danger:
    "bg-accent-danger text-white shadow-[0_4px_24px_rgba(229,62,62,0.2)] hover:bg-accent-danger/90 hover:-translate-y-0.5",
  ghost:
    "text-text-secondary hover:bg-cream hover:text-text-primary",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-2.5 text-sm",
  lg: "px-12 py-[18px] text-[17px]",
};

export function Button({
  children,
  className = "",
  icon,
  size = "md",
  type = "button",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
