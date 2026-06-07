// filepath: src/components/teemo-coach.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, useAnimation, useReducedMotion } from "framer-motion";

interface TeemoCoachProps {
  isTalking?: boolean;
  message?: string;
}

export default function TeemoCoach({ isTalking = false, message }: TeemoCoachProps) {
  const [dialogText, setDialogText] = useState(message || "¡Un scout siempre va un paso adelante!");
  const [clickCount, setClickCount] = useState(0);
  const controls = useAnimation();
  const shouldReduceMotion = useReducedMotion();

  // competitive and visual health coach quotes
  const teemoQuotes = [
    "¡Las setas están listas en el río, pisa con cuidado!",
    "¡Tamaño no lo es todo, la macro lo es todo!",
    "¡Fer, recuerda el posicionamiento perpendicular!",
    "¡Ralph, un ward en el pixel bush salva vidas!",
    "¡Pokea, asedia y toma placas. Ese es el plan!",
    "¡Un scout sano gana más partidas, recuerda descansar la vista!",
    "¡Parpadea 10 veces seguidas para rehidratar tus ojos!",
    "¡Estira la espalda y pon los pies planos en el suelo!",
  ];

  useEffect(() => {
    if (message) {
      setDialogText(message);
      if (!shouldReduceMotion) {
        controls.start({
          scale: [1, 1.05, 0.98, 1.02, 1],
          transition: { duration: 0.45 }
        });
      }
    }
  }, [message, controls, shouldReduceMotion]);

  const handleTeemoClick = async () => {
    setClickCount((prev) => prev + 1);
    
    // Choose random quote
    const randomQuote = teemoQuotes[Math.floor(Math.random() * teemoQuotes.length)];
    setDialogText(randomQuote);

    if (!shouldReduceMotion) {
      // Jump and wiggle animation
      await controls.start({
        y: [0, -18, 4, -2, 0],
        scale: [1, 1.12, 0.94, 1.04, 1],
        rotate: [0, -5, 5, -2, 0],
        transition: { duration: 0.55, ease: "easeInOut" }
      });
    }
  };

  const getTeemoAvatar = () => {
    const text = dialogText.toLowerCase();
    let base = "/teemo-default.png";
    if (text.includes("vista") || text.includes("descansar") || text.includes("estira") || text.includes("pausa") || text.includes("salud") || text.includes("ojo") || text.includes("parpadea")) {
      base = "/teemo-rest.png";
    } else if (text.includes("alerta") || text.includes("peligro") || text.includes("atención") || text.includes("cuidado") || text.includes("bloque")) {
      base = "/teemo-alert.png";
    } else if (isTalking) {
      base = "/teemo-talking.png";
    }
    return `${base}?v=2`;
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-4 bg-transparent select-none relative max-w-sm mx-auto shrink-0"
      role="complementary"
      aria-label="Teemo Coach - Consejero de Draft y Salud"
    >
      {/* Premium Speech bubble - Glassmorphism Hextech */}
      <motion.div
        initial={shouldReduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative bg-[#0a1428]/85 backdrop-blur-md border-2 border-[#c8aa6e] text-[#f0e6d3] p-4 px-5 rounded-lg shadow-[0_8px_32px_rgba(200,170,110,0.25)] text-xs md:text-sm text-center font-serif leading-relaxed mb-4 max-w-[290px] border-t-[#f0e6d3] z-10"
      >
        <span className="font-sans font-black text-[9px] text-[#c8aa6e] uppercase tracking-widest block mb-1">
          Teemo Coach Analiza:
        </span>
        <span className="text-[#f0e6d3] font-medium font-sans">
          "{dialogText}"
        </span>
        {/* Dialogue arrow pointers */}
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#c8aa6e]" />
        <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-[#0a1428]" />
      </motion.div>

      {/* Animated Image-based Teemo character */}
      <motion.div
        animate={controls}
        onClick={handleTeemoClick}
        className="cursor-pointer relative group flex items-center justify-center overflow-hidden rounded-full border border-[#c8aa6e]/20 bg-[#0a1428]/30 hover:border-[#c8aa6e]/70 p-3 shadow-lg transition-colors"
        title="¡Haz clic en Teemo Coach!"
        whileHover={shouldReduceMotion ? {} : { scale: 1.05 }}
        style={{ width: "150px", height: "150px" }}
      >
        <motion.div
          className="relative w-full h-full"
          animate={
            shouldReduceMotion
              ? {}
              : isTalking
              ? {
                  y: [0, -3.5, 0, -3.5, 0],
                  scaleY: [1, 1.015, 0.985, 1.01, 1],
                  transition: { duration: 0.9, repeat: Infinity, ease: "easeInOut" },
                }
              : {
                  y: [0, -2, 0],
                  scaleY: [1, 1.008, 1],
                  transition: { duration: 3.5, repeat: Infinity, ease: "easeInOut" },
                }
          }
        >
          <Image
            src={getTeemoAvatar()}
            alt="Teemo Coach Avatar"
            fill
            className="object-contain filter drop-shadow-[0_4px_8px_rgba(0,0,0,0.4)]"
            sizes="150px"
            priority
          />
        </motion.div>

        {/* Ambient Hextech spinning ring in hover */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#c8aa6e]/25 scale-[1.04] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-all duration-700" style={{ animationDuration: "14s" }} />
      </motion.div>
    </div>
  );
}
