// filepath: src/components/draft/pick-slot.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ChampionData } from "@/lib/types";
import { getChampionSplashUrl } from "@/lib/ddragon";
import { User } from "lucide-react";
import { useDraftStore } from "@/store/draft-store";

interface PickSlotProps {
  champion: ChampionData | null;
  roleLabel: string;
  isActive: boolean;
  isOurs: boolean;
  myRoleName?: "ADC" | "SUPPORT";
  team: "blue" | "red";
}

export default function PickSlot({
  champion,
  roleLabel,
  isActive,
  isOurs,
  myRoleName,
  team,
}: PickSlotProps) {
  const { userRole, setSelectedDetailChampId } = useDraftStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const splashUrl = champion ? getChampionSplashUrl(champion.ddragonKey, 0) : null;

  return (
    <button
      onClick={() => champion && setSelectedDetailChampId(champion.id)}
      disabled={!champion}
      className={`relative w-full h-[110px] md:h-[136px] border transition-all duration-300 overflow-hidden flex items-center text-left ${
        champion ? "cursor-pointer hover:border-[#c8aa6e]" : "cursor-default"
      } ${
        isActive
          ? "lol-slot-active bg-[#0a1428]/60 border-[#00c8c8] shadow-[0_0_16px_rgba(0,200,200,0.2)]"
          : isOurs
          ? "border-[#c8aa6e]/60 bg-[#091420]/70 shadow-[inset_0_0_20px_rgba(200,170,110,0.15)] hover:shadow-[inset_0_0_20px_rgba(200,170,110,0.25)]"
          : "border-[#785a28]/30 bg-[#1e232a]/30"
      }`}
      aria-label={champion ? `${roleLabel}: ${champion.name}. Haz clic para ver detalles.` : `${roleLabel} vacío`}
    >
      {/* Background Splash Art */}
      {splashUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={splashUrl}
            alt={champion?.name || ""}
            fill
            className="object-cover object-top opacity-90 transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 400px"
          />
          {/* Gradient Overlay for reading names */}
          <div
            className={`absolute inset-0 bg-gradient-to-r z-10 ${
              team === "blue"
                ? "from-[#010a13]/95 via-[#010a13]/60 to-transparent"
                : "from-transparent via-[#010a13]/60 to-[#010a13]/95 flex-row-reverse"
            }`}
          />
        </div>
      )}

      {/* Content wrapper */}
      <div
        className={`w-full h-full flex items-center justify-between px-6 md:px-8 z-20 ${
          team === "red" ? "flex-row-reverse text-right" : "flex-row"
        }`}
      >
        {/* Champion Name & Role */}
        <div className="flex flex-col justify-center gap-1">
          <span className="text-xs md:text-sm uppercase font-extrabold tracking-widest text-[#c8aa6e]">
            {roleLabel}
          </span>
          {champion ? (
            <span className="font-serif font-black text-lg md:text-2xl tracking-widest uppercase text-[#f0e6d3] drop-shadow-md truncate max-w-[140px] md:max-w-[280px]">
              {champion.name}
            </span>
          ) : (
            <span className="font-sans font-extrabold text-xs md:text-sm tracking-widest text-[#8a9dae]/50 uppercase animate-pulse">
              Seleccionando
            </span>
          )}
        </div>

        {/* Comfort/Role tag for our slots */}
        {isOurs && (
          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 md:px-5 md:py-2.5 rounded border text-[10px] md:text-xs font-black tracking-widest uppercase ${
              champion
                ? "bg-[#c8aa6e] text-[#010a13] border-[#f0e6d3] shadow-md font-bold"
                : "bg-transparent text-[#c8aa6e] border-[#c8aa6e]/40"
            }`}
          >
            <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
            {mounted && userRole === "ralph"
              ? myRoleName === "SUPPORT"
                ? "Tú (SUP)"
                : "Duo (ADC)"
              : myRoleName === "ADC"
              ? "Tú (ADC)"
              : "Duo (SUP)"}
          </div>
        )}

        {/* Active picking glow label */}
        {isActive && !champion && (
          <span className="text-xs md:text-sm uppercase tracking-widest font-black text-[#00c8c8] animate-pulse">
            ELEGIR
          </span>
        )}
      </div>

      {/* Gold inner trim for our slot */}
      {isOurs && (
        <div className="absolute inset-0.5 border border-[#c8aa6e]/25 pointer-events-none z-30" />
      )}
    </button>
  );
}
