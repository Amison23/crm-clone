"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Archive, Trash2, RotateCcw, Loader2, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: "danger" | "warning" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

export function ConfirmModal({
  isOpen,
  title,
  message,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (variant) {
      case "danger":
        return <Trash2 className="w-6 h-6 text-rose-600 dark:text-rose-400" />;
      case "warning":
        return <Archive className="w-6 h-6 text-amber-600 dark:text-amber-400" />;
      default:
        return <RotateCcw className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />;
    }
  };

  const getIconBg = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-100 dark:bg-rose-950/50";
      case "warning":
        return "bg-amber-100 dark:bg-amber-950/50";
      default:
        return "bg-indigo-100 dark:bg-indigo-950/50";
    }
  };

  const getConfirmButtonStyles = () => {
    switch (variant) {
      case "danger":
        return "bg-rose-600 hover:bg-rose-700 text-white";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white";
      default:
        return "bg-indigo-600 hover:bg-indigo-700 text-white";
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-md p-6 relative mx-auto my-8 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-start gap-4 mb-5">
          <div className={`size-12 rounded-2xl ${getIconBg()} flex items-center justify-center flex-shrink-0`}>
            {getIcon()}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-50 leading-tight mb-1">{title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="text-xs font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`text-xs font-bold ${getConfirmButtonStyles()}`}
          >
            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
