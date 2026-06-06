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

  // Frases aleatorias de Teemo Coach al hacer clic
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

    // Animación física reactiva de salto/emoción
    await controls.start({
      y: [0, -20, 4, -2, 0],
      scale: [1, 1.15, 0.9, 1.05, 1],
      rotate: [0, -5, 5, 0],
      transition: { duration: 0.6, ease: "easeInOut" }
    });
  };

  return (
    <div className="flex flex-col items-center justify-center p-4 bg-transparent select-none relative max-w-sm mx-auto">
      {/* Globo de diálogo de Teemo Coach */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative bg-[#0a1428] border-2 border-[#c8aa6e] text-[#f0e6d3] p-3.5 px-4 rounded-lg shadow-[0_4px_16px_rgba(3,151,171,0.15)] text-xs md:text-sm text-center font-serif leading-relaxed mb-5 max-w-[280px]"
      >
        <span className="font-sans font-black text-[9px] text-[#c8aa6e] uppercase tracking-widest block mb-1">
          Teemo Coach Dice:
        </span>
        "{dialogText}"
        {/* Flecha del globo de diálogo */}
        <div className="absolute bottom-[-10px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[10px] border-t-[#c8aa6e]" />
        <div className="absolute bottom-[-8px] left-1/2 -translate-x-1/2 w-0 h-0 border-l-[7px] border-l-transparent border-r-[7px] border-r-transparent border-t-[8px] border-t-[#0a1428]" />
      </motion.div>

      {/* Personaje Teemo en SVG 2.5D */}
      <motion.div
        animate={controls}
        onClick={handleTeemoClick}
        className="cursor-pointer relative group flex items-center justify-center"
        title="¡Haz clic en Teemo Coach para recibir consejos!"
        whileHover={{ scale: 1.05 }}
        style={{ width: "160px", height: "160px" }}
      >
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full filter drop-shadow-[0_8px_16px_rgba(10,20,40,0.3)]"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Animación de respiración integrada en el cuerpo principal */}
          <motion.g
            animate={{
              y: [0, -3, 0],
              scaleY: [1, 1.02, 1],
            }}
            transition={{
              duration: 3.2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          >
            {/* Orejas */}
            <path d="M40 70 C20 40, 15 80, 45 85 Z" fill="#b08a65" stroke="#7a5a3a" strokeWidth="3" />
            <path d="M40 70 C30 50, 25 75, 42 78 Z" fill="#e2c5a7" />
            <path d="M160 70 C180 40, 185 80, 155 85 Z" fill="#b08a65" stroke="#7a5a3a" strokeWidth="3" />
            <path d="M160 70 C170 50, 175 75, 158 78 Z" fill="#e2c5a7" />

            {/* Rostro base */}
            <circle cx="100" cy="108" r="58" fill="#f4d4b2" stroke="#7a5a3a" strokeWidth="4" />
            
            {/* Mejillas sonrosadas */}
            <ellipse cx="62" cy="120" rx="10" ry="6" fill="#f87b8b" opacity="0.4" />
            <ellipse cx="138" cy="120" rx="10" ry="6" fill="#f87b8b" opacity="0.4" />

            {/* Ojos achinados típicos de Teemo */}
            {/* Ojo Izquierdo */}
            <motion.path
              d="M58 102 C68 96, 74 98, 80 104 C72 108, 64 108, 58 102 Z"
              fill="#523924"
              animate={{
                scaleY: [1, 0.1, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatDelay: 2.5,
              }}
            />
            {/* Ojo Derecho */}
            <motion.path
              d="M142 102 C132 96, 126 98, 120 104 C128 108, 136 108, 142 102 Z"
              fill="#523924"
              animate={{
                scaleY: [1, 0.1, 1],
              }}
              transition={{
                duration: 4.5,
                repeat: Infinity,
                repeatDelay: 2.5,
              }}
            />

            {/* Nariz de Mapache */}
            <polygon points="96,110 104,110 100,115" fill="#523924" />

            {/* Boca con animación de habla */}
            {isTalking ? (
              <motion.ellipse
                cx="100"
                cy="124"
                rx="6"
                ry="8"
                fill="#822020"
                stroke="#523924"
                strokeWidth="2"
                animate={{
                  ry: [3, 9, 4, 8, 3],
                  scaleY: [0.9, 1.2, 0.9, 1.1, 0.9]
                }}
                transition={{
                  duration: 0.45,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ) : (
              // Boca sonriente cerrada
              <path
                d="M93 122 Q100 128 107 122"
                stroke="#523924"
                strokeWidth="3.5"
                strokeLinecap="round"
                fill="none"
              />
            )}

            {/* Gorro clásico de Teemo (Explorador verde) */}
            <path
              d="M36 78 C36 78, 60 25, 100 25 C140 25, 164 78, 164 78 C164 78, 145 92, 100 92 C55 92, 36 78, 36 78 Z"
              fill="#2d6a4f"
              stroke="#1b4332"
              strokeWidth="4"
            />
            
            {/* Franja Roja del Gorro */}
            <path
              d="M41 72 C41 72, 62 65, 100 65 C138 65, 159 72, 159 72"
              stroke="#b7094c"
              strokeWidth="10"
              fill="none"
            />

            {/* Lentes de Explorador en el Gorro */}
            <circle cx="72" cy="52" r="14" fill="#aacc00" stroke="#1b4332" strokeWidth="3" />
            <circle cx="70" cy="50" r="10" fill="#ddff00" />
            <circle cx="128" cy="52" r="14" fill="#aacc00" stroke="#1b4332" strokeWidth="3" />
            <circle cx="126" cy="50" r="10" fill="#ddff00" />
            
            {/* Cinta dorada que une los lentes */}
            <rect x="85" y="49" width="30" height="6" fill="#c8aa6e" stroke="#785a28" strokeWidth="1.5" />

            {/* Pluma de explorador azul en el gorro */}
            <path
              d="M100 25 C92 10, 85 0, 85 0 C85 0, 95 8, 100 18 Z"
              fill="#0096c7"
              stroke="#0077b6"
              strokeWidth="1.5"
            />
          </motion.g>
        </svg>

        {/* Halo de brillo animado en hover */}
        <div className="absolute inset-0 rounded-full border border-dashed border-[#c8aa6e]/30 scale-110 opacity-0 group-hover:opacity-100 group-hover:animate-spin transition-all duration-500" style={{ animationDuration: "12s" }} />
      </motion.div>
    </div>
  );
}
