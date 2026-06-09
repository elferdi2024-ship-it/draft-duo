// filepath: src/components/toast-container.tsx
"use client";

import { useDraftStore } from "@/store/draft-store";
import { useShallow } from "zustand/react/shallow";
import { X, AlertTriangle, CheckCircle, Info } from "lucide-react";
import { useEffect } from "react";

export default function ToastContainer() {
  const { toast, clearToast } = useDraftStore(
    useShallow((state) => ({
      toast: state.toast,
      clearToast: state.clearToast,
    }))
  );

  if (!toast) return null;

  const getToastStyles = () => {
    switch (toast.type) {
      case "success":
        return {
          bg: "bg-emerald-950/90 border-emerald-500 text-emerald-200 shadow-[0_0_16px_rgba(16,185,129,0.2)]",
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
          title: "Éxito",
        };
      case "warning":
        return {
          bg: "bg-amber-950/90 border-amber-500 text-amber-200 shadow-[0_0_16px_rgba(245,158,11,0.2)]",
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          title: "Advertencia",
        };
      default:
        return {
          bg: "bg-blue-950/90 border-[#00c8c8] text-blue-100 shadow-[0_0_16px_rgba(0,200,200,0.2)]",
          icon: <Info className="w-5 h-5 text-[#00c8c8]" />,
          title: "Información",
        };
    }
  };

  const styles = getToastStyles();

  return (
    <div className="fixed bottom-6 right-6 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-bottom-5 duration-300">
      <div className={`p-4 border-2 rounded ${styles.bg} backdrop-blur-md flex gap-3 items-start relative`}>
        <div className="shrink-0 mt-0.5">{styles.icon}</div>
        <div className="flex flex-col gap-1 pr-6">
          <span className="text-[10px] uppercase tracking-widest font-black text-[#c8aa6e]">
            {styles.title}
          </span>
          <p className="text-xs font-semibold leading-relaxed">
            {toast.message}
          </p>
        </div>
        <button
          onClick={clearToast}
          className="absolute top-3 right-3 p-1 rounded-sm text-slate-400 hover:text-white hover:bg-white/10 transition-all cursor-pointer"
          aria-label="Cerrar notificación"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
