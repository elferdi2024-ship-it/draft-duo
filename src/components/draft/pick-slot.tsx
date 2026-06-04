// filepath: src/components/draft/pick-slot.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ChampionData } from "@/lib/types";
import { getChampionSplashUrl } from "@/lib/ddragon";
import { User, ShieldAlert } from "lucide-react";
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
  const { userRole } = useDraftStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const splashUrl = champion ? getChampionSplashUrl(champion.ddragonKey, 0) : null;

  return (
    <div
      className={`relative w-full h-[88px] md:h-[105px] border transition-all duration-300 overflow-hidden flex items-center ${
        isActive
          ? "lol-slot-active bg-[#0a1428]/45 border-[#0397ab]"
          : isOurs
          ? "border-[#c8aa6e] bg-[#fcf9f2] shadow-[inset_0_0_12px_rgba(200,170,110,0.2)]"
          : "border-[#d8ccb4] bg-[#eadecd]/60"
      }`}
    >
      {/* Background Splash Art */}
      {splashUrl && (
        <div className="absolute inset-0 z-0">
          <Image
            src={splashUrl}
            alt={champion?.name || ""}
            fill
            className="object-cover object-top opacity-90 transition-transform duration-700 hover:scale-105"
            sizes="(max-width: 768px) 100vw, 300px"
          />
          {/* Gradient Overlay for reading names */}
          <div
            className={`absolute inset-0 bg-gradient-to-r z-10 ${
              team === "blue"
                ? "from-[#0a1428]/85 via-[#0a1428]/40 to-transparent"
                : "from-transparent via-[#0a1428]/40 to-[#0a1428]/85 flex-row-reverse"
            }`}
          />
        </div>
      )}

      {/* Content wrapper */}
      <div
        className={`w-full h-full flex items-center justify-between px-4 z-20 ${
          team === "red" ? "flex-row-reverse text-right" : "flex-row"
        }`}
      >
        {/* Champion Name & Role */}
        <div className="flex flex-col justify-center">
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#785a28]">
            {roleLabel}
          </span>
          <span
            className={`font-serif font-bold text-sm md:text-lg tracking-wide ${
              champion ? "text-[#f0e6d3] drop-shadow-md" : "text-[#5e6b77]"
            }`}
          >
            {champion ? champion.name : "Seleccionando..."}
          </span>
        </div>

        {/* Comfort/Role tag for our slots */}
        {isOurs && (
          <div
            className={`flex items-center gap-1 px-2 py-0.5 rounded border text-[9px] font-bold tracking-wider uppercase ${
              champion
                ? "bg-[#c8aa6e]/90 text-[#0a1428] border-[#f0e6d3]"
                : "bg-transparent text-[#785a28] border-[#c8aa6e]"
            }`}
          >
            <User className="w-2.5 h-2.5" />
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
          <span className="text-[9px] uppercase tracking-widest font-black text-[#0397ab] animate-pulse">
            ELEGIR
          </span>
        )}
      </div>

      {/* Gold inner trim for our slot */}
      {isOurs && (
        <div className="absolute inset-0.5 border border-[#c8aa6e]/30 pointer-events-none z-30" />
      )}
    </div>
  );
}
