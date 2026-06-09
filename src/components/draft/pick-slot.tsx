// filepath: src/components/draft/pick-slot.tsx
"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { ChampionData } from "@/lib/types";
import { getChampionSplashUrl, getChampionIconUrl } from "@/lib/ddragon";
import { User, X, Search } from "lucide-react";
import { useDraftStore } from "@/store/draft-store";
import { useShallow } from "zustand/react/shallow";

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
  const { userRole, setSelectedDetailChampId, allChampions, setChampion } = useDraftStore(
    useShallow((state) => ({
      userRole: state.userRole,
      setSelectedDetailChampId: state.setSelectedDetailChampId,
      allChampions: state.allChampions,
      setChampion: state.setChampion,
    }))
  );
  const [mounted, setMounted] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchVal, setSearchVal] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  const splashUrl = champion ? getChampionSplashUrl(champion.ddragonKey, 0) : null;

  const handleClickSlot = () => {
    if (champion) {
      setSelectedDetailChampId(champion.id);
    } else if (isActive) {
      setIsSearching(true);
    }
  };

  if (isSearching) {
    // Filtrar campeones según la búsqueda
    const filteredChamps = allChampions
      .filter((c) => c.name.toLowerCase().includes(searchVal.toLowerCase()))
      .slice(0, 6);

    return (
      <div 
        className={`relative w-full h-[100px] md:h-[120px] lg:h-auto lg:flex-1 lg:min-h-[52px] border border-[#00c8c8] bg-[#0a1428] shadow-[0_0_16px_rgba(0,200,200,0.2)] flex flex-col justify-center z-50`}
      >
        {/* Backdrop invisible para cerrar la búsqueda al hacer clic fuera */}
        <div className="fixed inset-0 z-40 bg-transparent cursor-default" onClick={() => setIsSearching(false)} />

        <div className="relative w-full px-4 flex items-center gap-2 z-50">
          <Search className="w-3.5 h-3.5 text-[#00c8c8] shrink-0" />
          <input
            type="text"
            placeholder="Buscar campeón..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full bg-transparent outline-none text-[#f0e6d3] placeholder-[#8a9dae]/50 font-serif uppercase tracking-widest text-xs py-2 border-b border-[#785a28]/45 focus:border-[#00c8c8] transition-colors"
            autoFocus
            onKeyDown={(e) => {
              if (e.key === "Escape") setIsSearching(false);
            }}
          />
          <button 
            onClick={() => setIsSearching(false)} 
            className="p-1 text-[#8a9dae] hover:text-[#ff4655] transition-colors cursor-pointer border-none bg-transparent"
            aria-label="Cerrar búsqueda"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Lista de sugerencias */}
        <div className="absolute top-full left-0 right-0 bg-[#091420] border-x border-b border-[#785a28] z-50 max-h-[220px] overflow-y-auto shadow-2xl rounded-b-sm flex flex-col divide-y divide-[#785a28]/25">
          {filteredChamps.length > 0 ? (
            filteredChamps.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setChampion(c.id);
                  setIsSearching(false);
                  setSearchVal("");
                }}
                className="w-full px-4 py-2.5 flex items-center gap-3 hover:bg-[#1a2233] text-left text-xs uppercase font-serif tracking-wider font-black text-[#f0e6d3] hover:text-[#c8aa6e] transition-all cursor-pointer border-none bg-transparent"
              >
                <div className="relative w-6 h-6 rounded border border-[#785a28]/40 overflow-hidden shrink-0">
                  <Image
                    src={getChampionIconUrl("15.11.1", c.ddragonKey)}
                    alt={c.name}
                    fill
                    className="object-cover"
                    sizes="24px"
                  />
                </div>
                <span>{c.name}</span>
                {c.role && (
                  <span className="ml-auto text-[8px] px-1.5 py-0.5 bg-[#0a1428] text-[#8a9dae] font-sans rounded border border-[#785a28]/20">
                    {c.role}
                  </span>
                )}
              </button>
            ))
          ) : (
            <span className="p-3 text-[10px] text-[#8a9dae] text-center italic">
              Sin coincidencias
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <button
      onClick={handleClickSlot}
      disabled={!champion && !isActive}
      className={`relative w-full h-[100px] md:h-[120px] lg:h-auto lg:flex-1 lg:min-h-[45px] border transition-all duration-300 overflow-hidden flex items-center text-left ${
        champion || isActive ? "cursor-pointer hover:border-[#c8aa6e]" : "cursor-default"
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
        className={`w-full h-full flex items-center justify-between px-6 md:px-8 lg:px-4 z-20 ${
          team === "red" ? "flex-row-reverse text-right" : "flex-row"
        }`}
      >
        {/* Champion Name & Role */}
        <div className="flex flex-col justify-center gap-0.5 lg:gap-0">
          <span className="text-[10px] md:text-xs lg:text-[9px] uppercase font-extrabold tracking-widest text-[#c8aa6e]">
            {roleLabel}
          </span>
          {champion ? (
            <span className="font-serif font-black text-base md:text-xl lg:text-base tracking-widest uppercase text-[#f0e6d3] drop-shadow-md truncate max-w-[120px] md:max-w-[200px] lg:max-w-[110px]">
              {champion.name}
            </span>
          ) : (
            <span className="font-sans font-extrabold text-xs lg:text-[10px] tracking-widest text-[#b2c3d2]/85 uppercase animate-pulse">
              Seleccionando
            </span>
          )}
        </div>

        {/* Comfort/Role tag for our slots */}
        {isOurs && (
          <div
            className={`flex items-center gap-1.5 px-2.5 py-1 lg:px-2 lg:py-0.5 rounded border text-[9px] lg:text-[8px] font-black tracking-widest uppercase ${
              champion
                ? "bg-[#c8aa6e] text-[#010a13] border-[#f0e6d3] shadow-md font-bold"
                : "bg-transparent text-[#c8aa6e] border-[#c8aa6e]/40"
            }`}
          >
            <User className="w-3.5 h-3.5 md:w-4 md:h-4 lg:w-3 lg:h-3" />
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
          <span className="text-xs lg:text-[10px] uppercase tracking-widest font-black text-[#00c8c8] animate-pulse">
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
