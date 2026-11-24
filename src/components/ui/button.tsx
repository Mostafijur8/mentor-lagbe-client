import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "primary" | "outline" | "light" | "danger"; children: ReactNode };

// Shared button variants keep interactive controls visually consistent across forms and dashboards.
export function Button({ variant = "primary", className = "", children, ...props }: ButtonProps) {
  return <button className={`button ${variant === "primary" ? "" : `button-${variant}`} ${className}`.trim()} {...props}>{children}</button>;
}
