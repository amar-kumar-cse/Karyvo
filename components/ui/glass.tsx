"use client";

import React from "react";
export function cn(...inputs: (string | undefined | null | false)[]) {
  return inputs.filter(Boolean).join(" ");
}

// ---------------------------------------------------------------------------
// 1. GlassCard
// ---------------------------------------------------------------------------
export interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "interactive" | "gold" | "subtle";
}

export const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "glass-surface",
      interactive: "glass-surface-interactive cursor-pointer",
      gold: "glass-surface-gold",
      subtle: "bg-white/[0.02] border border-white/[0.05] backdrop-blur-md",
    };

    return (
      <div
        ref={ref}
        className={cn("rounded-2xl p-6 relative overflow-hidden", variantStyles[variant], className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);
GlassCard.displayName = "GlassCard";

// ---------------------------------------------------------------------------
// 2. GlassPanel
// ---------------------------------------------------------------------------
export interface GlassPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  header?: React.ReactNode;
  actions?: React.ReactNode;
}

export const GlassPanel = React.forwardRef<HTMLDivElement, GlassPanelProps>(
  ({ className, header, actions, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("glass-surface rounded-2xl p-6 sm:p-7 space-y-4", className)}
        {...props}
      >
        {(header || actions) && (
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/80">
            {header && <h2 className="text-base font-bold text-slate-900 font-heading">{header}</h2>}
            {actions && <div className="flex items-center gap-2">{actions}</div>}
          </div>
        )}
        {children}
      </div>
    );
  }
);
GlassPanel.displayName = "GlassPanel";

// ---------------------------------------------------------------------------
// 3. GlassButton
// ---------------------------------------------------------------------------
export interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "gold" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const GlassButton = React.forwardRef<HTMLButtonElement, GlassButtonProps>(
  ({ className, variant = "primary", size = "md", loading, disabled, children, ...props }, ref) => {
    const sizeStyles = {
      sm: "px-3 py-1.5 text-xs font-semibold rounded-lg gap-1.5",
      md: "px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl gap-2",
      lg: "px-6 py-3.5 text-sm sm:text-base font-bold rounded-xl gap-2.5",
    };

    const variantStyles = {
      primary:
        "bg-gradient-to-r from-indigo-600 to-violet-600 hover:brightness-105 active:scale-95 text-white shadow-md shadow-indigo-500/25 border border-indigo-400/30",
      secondary:
        "bg-white/90 hover:bg-white active:scale-98 text-slate-800 border border-slate-200/90 shadow-sm backdrop-blur-md",
      gold:
        "bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:brightness-105 active:scale-95 text-slate-950 font-bold shadow-md shadow-amber-500/25 border border-amber-300",
      outline:
        "bg-white/60 hover:bg-white text-slate-700 hover:text-slate-900 border border-slate-200 shadow-sm",
      ghost:
        "bg-transparent hover:bg-slate-100/80 text-slate-600 hover:text-slate-900 border border-transparent",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center transition-all duration-200 select-none disabled:opacity-50 disabled:pointer-events-none",
          sizeStyles[size],
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {loading ? (
          <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
        ) : null}
        {children}
      </button>
    );
  }
);
GlassButton.displayName = "GlassButton";

// ---------------------------------------------------------------------------
// 4. GlassInput & GlassTextarea
// ---------------------------------------------------------------------------
export interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> { }

export const GlassInput = React.forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, type = "text", ...props }, ref) => {
    return (
      <input
        type={type}
        ref={ref}
        className={cn(
          "w-full bg-white/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-md transition-all duration-200 shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
GlassInput.displayName = "GlassInput";

export interface GlassTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

export const GlassTextarea = React.forwardRef<HTMLTextAreaElement, GlassTextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "w-full bg-white/90 hover:bg-white focus:bg-white border border-slate-200 focus:border-indigo-500 rounded-xl p-3.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 backdrop-blur-md transition-all duration-200 leading-relaxed shadow-sm",
          className
        )}
        {...props}
      />
    );
  }
);
GlassTextarea.displayName = "GlassTextarea";

// ---------------------------------------------------------------------------
// 5. GlassBadge
// ---------------------------------------------------------------------------
export interface GlassBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "violet" | "emerald" | "amber" | "gold";
}

export const GlassBadge = React.forwardRef<HTMLSpanElement, GlassBadgeProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    const variantStyles = {
      default: "bg-slate-100 text-slate-700 border-slate-200",
      violet: "bg-indigo-50 text-indigo-700 border-indigo-200",
      emerald: "bg-emerald-50 text-emerald-700 border-emerald-200",
      amber: "bg-amber-50 text-amber-800 border-amber-200",
      gold: "bg-gradient-to-r from-amber-100 to-amber-50 text-amber-900 border-amber-300",
    };

    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border backdrop-blur-md tracking-wide",
          variantStyles[variant],
          className
        )}
        {...props}
      >
        {children}
      </span>
    );
  }
);
GlassBadge.displayName = "GlassBadge";

// ---------------------------------------------------------------------------
// 6. GlassModal
// ---------------------------------------------------------------------------
export interface GlassModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

export function GlassModal({ isOpen, onClose, title, icon, children }: GlassModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-lg p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-lg font-bold text-slate-900 font-heading flex items-center gap-2">
            {icon}
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
