// filepath: src/components/visual-health-panel.tsx
"use client";

import { useState, useEffect } from "react";
import { Clock, Eye, AlertTriangle, ShieldCheck, HelpCircle, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VisualHealthPanel() {
  const [secondsActive, setSecondsActive] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Load reduced motion state on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hasClass = document.documentElement.classList.contains("reduced-motion");
      setIsReducedMotion(hasClass);
    }

    const interval = setInterval(() => {
      setSecondsActive((prev) => {
        const next = prev + 1;
        // Trigger alert every 45 minutes (2700 seconds)
        // For testing purposes during review, you can set it to a lower value if needed,
        // but 2700s is the standard visual fatigue threshold.
        if (next > 0 && next % 2700 === 0) {
          setShowWarning(true);
          setDismissed(false);
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleToggleMotion = () => {
    if (typeof window !== "undefined") {
      const nextMode = !isReducedMotion;
      setIsReducedMotion(nextMode);
      if (nextMode) {
        document.documentElement.classList.add("reduced-motion");
      } else {
        document.documentElement.classList.remove("reduced-motion");
      }
    }
  };

  const forceTriggerBreak = () => {
    setShowWarning(true);
    setDismissed(false);
  };

  return (
    <div className="border border-[#c8aa6e]/30 bg-[#0a1428]/95 p-4 rounded shadow-lg text-[#f0e6d3] flex flex-col gap-3.5 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-radial-gradient from-[#0397ab]/5 to-transparent pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between border-b border-[#c8aa6e]/20 pb-2 relative z-10">
        <div className="flex items-center gap-2">
          <Eye className="w-4.5 h-4.5 text-[#00c8c8]" />
          <h4 className="font-serif font-black text-xs uppercase tracking-widest text-[#c8aa6e]">
            Salud Visual y Ergonomía
          </h4>
        </div>
        <button
          onClick={forceTriggerBreak}
          className="text-[8px] border border-[#c8aa6e]/30 bg-[#1e232a]/40 px-1.5 py-0.5 rounded text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#010a13] font-bold uppercase tracking-wider transition-all cursor-pointer"
          title="Forzar pausa activa de prueba"
        >
          Pausa Test
        </button>
      </div>

      {/* Timer & Reduced Motion switch */}
      <div className="grid grid-cols-2 gap-3.5 relative z-10">
        <div className="flex flex-col gap-0.5 p-2 bg-[#091420]/80 border border-[#785a28]/30 rounded">
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#8a9dae] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#c8aa6e]" />
            Tiempo de Sesión
          </span>
          <span className="font-mono text-sm md:text-base font-black text-[#f0e6d3] tracking-wide mt-0.5">
            {formatTime(secondsActive)}
          </span>
        </div>

        <div className="flex flex-col gap-0.5 p-2 bg-[#091420]/80 border border-[#785a28]/30 rounded justify-between">
          <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#8a9dae]">
            Animaciones Reducidas
          </span>
          <button
            onClick={handleToggleMotion}
            className={`w-full py-1 rounded text-[9px] font-black uppercase tracking-wider transition-all border cursor-pointer ${
              isReducedMotion
                ? "bg-[#0397ab]/20 border-[#00c8c8] text-[#00c8c8]"
                : "bg-[#1e232a]/60 border-[#785a28]/30 text-[#8a9dae] hover:border-[#c8aa6e]/40"
            }`}
          >
            {isReducedMotion ? "ON (Seguro)" : "OFF (Activas)"}
          </button>
        </div>
      </div>

      {/* Quick Visual Hygiene Guidelines */}
      <div className="text-[11px] leading-relaxed text-[#8a9dae] flex flex-col gap-1.5 bg-[#010a13]/40 p-2.5 rounded border border-[#785a28]/20 relative z-10">
        <span className="text-[9px] uppercase font-black tracking-wider text-[#c8aa6e] flex items-center gap-1">
          <Activity className="w-3.5 h-3.5 text-[#00c8c8]" />
          Regla 20-20-20 (Higiene Ocular)
        </span>
        <p>
          Cada 20 minutos, enfoca tu mirada en un objeto a <span className="text-[#f0e6d3] font-bold">6 metros (20 pies)</span> de distancia durante al menos <span className="text-[#f0e6d3] font-bold">20 segundos</span>. Esto relaja el músculo ciliar y previene la fatiga ocular.
        </p>
        <p className="border-t border-[#eadecd]/10 pt-1.5 text-[10px] italic">
          💡 Mantén la espalda perpendicular a la silla y el monitor a la altura de tus ojos.
        </p>
      </div>

      {/* Fullscreen Eye Health Break Reminder Overlay */}
      <AnimatePresence>
        {showWarning && !dismissed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] bg-[#010a13]/95 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-md w-full border-2 border-[#c8aa6e] bg-[#0a1428] p-6 md:p-8 rounded shadow-2xl flex flex-col items-center text-center gap-5"
            >
              <div className="w-16 h-16 rounded-full bg-amber-500/10 border border-amber-500 flex items-center justify-center text-amber-500 animate-pulse">
                <AlertTriangle className="w-8 h-8" />
              </div>
              <div className="flex flex-col gap-1.5">
                <h3 className="font-serif text-xl md:text-2xl font-black uppercase text-[#f0e6d3] tracking-widest shimmer-text-light">
                  ¡PAUSA ACTIVA DE SALUD!
                </h3>
                <span className="text-xs text-[#c8aa6e] uppercase tracking-widest font-black">
                  Teemo Coach aconseja: Descansa la Vista
                </span>
              </div>
              <div className="text-xs md:text-sm text-[#8a9dae] leading-relaxed flex flex-col gap-3">
                <p>
                  Has estado redactando estrategias de draft por más de <span className="text-[#f0e6d3] font-bold">45 minutos</span> seguidos sin interrupción.
                </p>
                <div className="bg-[#010a13] p-4 rounded border border-[#785a28]/40 text-left flex flex-col gap-2">
                  <p className="flex gap-2 items-start text-[#f0e6d3]">
                    <span className="text-[#00c8c8] font-bold">1.</span>
                    <span>Mira lejos del monitor (a una ventana u objeto lejano) por 20 segundos.</span>
                  </p>
                  <p className="flex gap-2 items-start text-[#f0e6d3]">
                    <span className="text-[#00c8c8] font-bold">2.</span>
                    <span>Parpadea 10 veces lentamente para hidratar tus corneas.</span>
                  </p>
                  <p className="flex gap-2 items-start text-[#f0e6d3]">
                    <span className="text-[#00c8c8] font-bold">3.</span>
                    <span>Estira tus hombros, cuello y muñecas. ¡Un scout sano gana más partidas!</span>
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDismissed(true);
                  setShowWarning(false);
                }}
                className="w-full py-3 bg-[#c8aa6e] hover:bg-[#785a28] text-[#0a1428] hover:text-[#f0e6d3] border border-[#f0e6d3]/20 font-serif font-black uppercase text-xs md:text-sm tracking-widest transition-all rounded shadow-md cursor-pointer"
              >
                Volver al Simulador
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
