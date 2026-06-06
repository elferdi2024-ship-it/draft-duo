// filepath: src/components/teemo-coach.tsx
"use client";

import { useState, useEffect } from "react";
import { motion, useAnimation } from "framer-motion";

interface TeemoCoachProps {
  isTalking?: boolean;
  message?: string;
}

export default function TeemoCoach({ isTalking = false, message }: TeemoCoachProps) {
  const [dialogText, setDialogText] = useState(message || "¡Un scout siempre va un paso adelante!");
  const [clickCount, setClickCount] = useState(0);
  const controls = useAnimation();

  // Frases de Teemo Coach de nivel competitivo y macro
  const teemoQuotes = [
    "¡Las setas están listas en el río, pisa con cuidado!",
    "¡Tamaño no lo es todo, la macro lo es todo!",
    "¡Fer, recuerda el posicionamiento perpendicular!",
    "¡Ralph, un ward en el pixel bush salva vidas!",
    "¡Pokea, asedia y toma placas. Ese es el plan!",
    "¡Un paso adelante, siempre un paso adelante!",
    "¡Con mi cerbatana y tu habilidad, ganamos fácil!",
  ];

  useEffect(() => {
    if (message) {
      setDialogText(message);
      // Animación de rebote sutil cuando cambia el mensaje
      controls.start({
        scale: [1, 1.08, 0.97, 1.02, 1],
        transition: { duration: 0.5 }
      });
    }
  }, [message, controls]);

  const handleTeemoClick = async () => {
    setClickCount((prev) => prev + 1);
    
    // Cambiar frase aleatoriamente
    const randomQuote = teemoQuotes[Math.floor(Math.random() * teemoQuotes.length)];
    setDialogText(randomQuote);

    // Animación de salto de Teemo con rotación y compresión elástica
    await controls.start({
      y: [0, -25, 6, -3, 0],
      scale: [1, 1.18, 0.88, 1.06, 1],
      rotate: [0, -7, 7, -3, 0],
      transition: { duration: 0.65, ease: "easeInOut" }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-transparent select-none relative max-w-sm mx-auto">
      {/* Globo de diálogo Premium - Glassmorphism Hextech */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 14 }}
        className="relative bg-[#0a1428]/85 backdrop-blur-md border-2 border-[#c8aa6e] text-[#f0e6d3] p-4 px-5 rounded-lg shadow-[0_8px_32px_rgba(200,170,110,0.25)] text-xs md:text-sm text-center font-serif leading-relaxed mb-6 max-w-[290px] border-t-[#f0e6d3]"
      >
        <span className="font-sans font-black text-[9px] text-[#c8aa6e] uppercase tracking-widest block mb-1">
          Teemo Coach Analiza:
        </span>
        <span className="text-[#f0e6d3] font-medium font-sans">
          "{dialogText}"
        </span>
        {/* Flechas de diálogo */}
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#c8aa6e]" />
        <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-[#0a1428]" />
      </motion.div>

      {/* Personaje Teemo en SVG 2.5D con Gradientes y Sombreados de Profundidad */}
      <motion.div
        animate={controls}
        onClick={handleTeemoClick}
        className="cursor-pointer relative group flex items-center justify-center"
        title="¡Haz clic en Teemo Coach!"
        whileHover={{ scale: 1.06 }}
        style={{ width: "170px", height: "170px" }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full filter drop-shadow-[0_12px_24px_rgba(10,20,40,0.4)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* DEFINICIONES DE GRADIENTES PARA VOLUMEN 3D */}
          <defs>
            {/* Gradiente de la Cara (Piel) */}
            <radialGradient id="faceGrad" cx="50%" cy="40%" r="50%" fx="40%" fy="30%">
              <stop offset="0%" stopColor="#fff0e0" />
              <stop offset="75%" stopColor="#f4d4b2" />
              <stop offset="100%" stopColor="#e2bc94" />
            </radialGradient>

            {/* Gradiente del Sombrero Verde */}
            <linearGradient id="hatGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3d8b5a" />
              <stop offset="70%" stopColor="#22543d" />
              <stop offset="100%" stopColor="#143525" />
            </linearGradient>

            {/* Gradiente del Borde de Gafas (Dorado) */}
            <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f0e6d3" />
              <stop offset="30%" stopColor="#c8aa6e" />
              <stop offset="70%" stopColor="#a37e3c" />
              <stop offset="100%" stopColor="#785a28" />
            </linearGradient>

            {/* Gradiente de Lente de Explorador */}
            <radialGradient id="lensGrad" cx="35%" cy="35%" r="65%">
              <stop offset="0%" stopColor="#faff80" />
              <stop offset="40%" stopColor="#ccff00" />
              <stop offset="85%" stopColor="#73b300" />
              <stop offset="100%" stopColor="#437000" />
            </radialGradient>

            {/* Gradiente de las Orejas */}
            <linearGradient id="earInnerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ffdfd3" />
              <stop offset="100%" stopColor="#e2c5a7" />
            </linearGradient>
            
            {/* Gradiente de las Gafas de Coach */}
            <linearGradient id="coachGlasses" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(3, 151, 171, 0.4)" />
              <stop offset="100%" stopColor="rgba(0, 90, 130, 0.1)" />
            </linearGradient>
          </defs>

          {/* Animación de respiración integrada */}
          <motion.g
            animate={{
              y: [0, -3.5, 0],
              scaleY: [1, 1.025, 1],
            }}
            transition={{
              duration: 3.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Oreja Izquierda */}
            <path d="M42 66 C15 35, 10 75, 45 82 Z" fill="#b08a65" stroke="#66462c" strokeWidth="3" />
            <path d="M38 68 C25 48, 20 70, 42 76 Z" fill="url(#earInnerGrad)" />

            {/* Oreja Derecha */}
            <path d="M158 66 C185 35, 190 75, 155 82 Z" fill="#b08a65" stroke="#66462c" strokeWidth="3" />
            <path d="M162 68 C175 48, 180 70, 158 76 Z" fill="url(#earInnerGrad)" />

            {/* Rostro Base (Con Gradiente Radial 3D) */}
            <circle cx="100" cy="108" r="58" fill="url(#faceGrad)" stroke="#66462c" strokeWidth="4.5" />
            
            {/* Mejillas Sonrosadas */}
            <ellipse cx="60" cy="122" rx="11" ry="7" fill="#ff6b8b" opacity="0.35" />
            <ellipse cx="140" cy="122" rx="11" ry="7" fill="#ff6b8b" opacity="0.35" />

            {/* Ojos achinados de Teemo (Animación de Parpadeo) */}
            {/* Ojo Izquierdo */}
            <motion.path
              d="M58 102 C67 95, 73 97, 79 103 C72 107, 65 107, 58 102 Z"
              fill="#4a311b"
              animate={{
                scaleY: [1, 0.08, 1],
              }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                repeatDelay: 2.8,
              }}
            />
            {/* Ojo Derecho */}
            <motion.path
              d="M142 102 C133 95, 127 97, 121 103 C128 107, 135 107, 142 102 Z"
              fill="#4a311b"
              animate={{
                scaleY: [1, 0.08, 1],
              }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                repeatDelay: 2.8,
              }}
            />

            {/* Nariz */}
            <polygon points="96,111 104,111 100,116" fill="#4a311b" />

            {/* Boca con animación de habla */}
            {isTalking ? (
              <motion.ellipse
                cx="100"
                cy="126"
                rx="6"
                ry="8"
                fill="#8f1d2c"
                stroke="#4a311b"
                strokeWidth="2.5"
                animate={{
                  ry: [2.5, 9, 3.5, 8.5, 2.5],
                  scaleY: [0.85, 1.25, 0.85, 1.15, 0.85]
                }}
                transition={{
                  duration: 0.42,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ) : (
              // Boca sonriente cerrada
              <path
                d="M93 124 Q100 130 107 124"
                stroke="#4a311b"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* Gafas de Coach / Analista (Montura redonda de metal) */}
            <circle cx="68" cy="103" r="19" stroke="url(#goldGrad)" strokeWidth="3" fill="url(#coachGlasses)" />
            <circle cx="68" cy="103" r="17.5" stroke="#1a1c24" strokeWidth="1" fill="none" />
            
            <circle cx="132" cy="103" r="19" stroke="url(#goldGrad)" strokeWidth="3" fill="url(#coachGlasses)" />
            <circle cx="132" cy="103" r="17.5" stroke="#1a1c24" strokeWidth="1" fill="none" />

            {/* Puente de las Gafas */}
            <path d="M87 103 Q100 99 113 103" stroke="url(#goldGrad)" strokeWidth="3.5" fill="none" />

            {/* Brillo de los cristales de las gafas */}
            <path d="M54 94 L62 90" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
            <path d="M118 94 L126 90" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

            {/* Sombrero clásico de Explorador (Con Gradiente Lineal 3D) */}
            <path
              d="M36 78 C36 78, 60 25, 100 25 C140 25, 164 78, 164 78 C164 78, 145 92, 100 92 C55 92, 36 78, 36 78 Z"
              fill="url(#hatGrad)"
              stroke="#0f261a"
              strokeWidth="4"
            />
            
            {/* Franja Roja del Sombrero */}
            <path
              d="M40 72 C40 72, 61 65, 100 65 C139 65, 160 72, 160 72"
              stroke="#9e0a36"
              strokeWidth="9"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M41 71 C41 71, 62 64, 100 64 C138 64, 159 71, 159 71"
              stroke="#e63946"
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
              opacity="0.8"
            />

            {/* Lentes de Explorador del Gorro */}
            {/* Ojo Lente Izquierdo */}
            <circle cx="71" cy="51" r="14.5" fill="#1b4332" stroke="#0a1d13" strokeWidth="2.5" />
            <circle cx="71" cy="51" r="12" fill="url(#lensGrad)" />
            {/* Reflejo de cristal */}
            <circle cx="67" cy="46" r="3.5" fill="white" opacity="0.45" />

            {/* Ojo Lente Derecho */}
            <circle cx="129" cy="51" r="14.5" fill="#1b4332" stroke="#0a1d13" strokeWidth="2.5" />
            <circle cx="129" cy="51" r="12" fill="url(#lensGrad)" />
            {/* Reflejo de cristal */}
            <circle cx="125" cy="46" r="3.5" fill="white" opacity="0.45" />
            
            {/* Banda dorada de unión de los lentes */}
            <rect x="85" y="48" width="30" height="5" fill="url(#goldGrad)" stroke="#66462c" strokeWidth="1.5" />

            {/* Pluma de Explorador Azul (Gradiente de pluma) */}
            <path
              d="M100 25 C92 9, 84 0, 84 0 C84 0, 94 8, 100 17 Z"
              fill="#00b4d8"
              stroke="#0077b6"
              strokeWidth="1.5"
            />
          </motion.g>
        </svg>

        {/* Halo de Brillo Hextech en Hover */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#c8aa6e]/30 scale-[1.08] opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-all duration-700" style={{ animationDuration: "16s" }} />
      </motion.div>
    </div>
  );
}
