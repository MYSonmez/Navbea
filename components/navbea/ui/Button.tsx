"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "sm" | "md";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
};

export function Button({ children, className = "", variant = "secondary", size = "md", iconOnly = false, type = "button", ...props }: ButtonProps) {
  return <button type={type} className={`ui-button ui-button-${variant} ui-button-${size}${iconOnly ? " ui-button-icon" : ""} ${className}`.trim()} {...props}>{children}</button>;
}

type IconButtonProps = Omit<ButtonProps, "children" | "iconOnly"> & {
  label: string;
  children: ReactNode;
  active?: boolean;
};

export function IconButton({ label, children, active = false, className = "", ...props }: IconButtonProps) {
  return <Button iconOnly aria-label={label} title={label} className={`icon-button${active ? " active" : ""} ${className}`.trim()} {...props}>{children}</Button>;
}
