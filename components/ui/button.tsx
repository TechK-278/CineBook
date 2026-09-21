import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "accent";
  size?: "default" | "sm" | "lg" | "icon";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", type = "button", ...props }, ref) => {
    const variantStyles = {
      default: "bg-cinebook-accent text-white hover:bg-cinebook-accentHover shadow-sm",
      accent: "bg-cinebook-accent text-white hover:bg-cinebook-accentHover shadow-sm",
      destructive: "bg-destructive text-white hover:bg-destructive/90 shadow-sm",
      outline: "border border-cinebook-border bg-transparent text-white hover:bg-cinebook-surfaceHover hover:border-zinc-700",
      secondary: "bg-cinebook-surface text-white border border-cinebook-border hover:bg-cinebook-surfaceHover",
      ghost: "text-zinc-300 hover:bg-cinebook-surfaceHover hover:text-white",
      link: "text-cinebook-accent underline-offset-4 hover:underline",
    };

    const sizeStyles = {
      default: "h-9 px-4 py-2 text-sm",
      sm: "h-8 rounded-md px-3 text-xs",
      lg: "h-11 rounded-md px-8 text-base",
      icon: "h-9 w-9 p-0",
    };

    return (
      <button
        ref={ref}
        type={type}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cinebook-accent focus-visible:ring-offset-2 focus-visible:ring-offset-cinebook-dark disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
