// filepath: src/components/draft/champion-grid.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDraftStore } from "@/store/draft-store";
import { getChampionIconUrl, getLatestVersion } from "@/lib/ddragon";
import { Search, Heart } from "lucide-react";
import type { ChampionData } from "@/lib/types";

interface ChampionGridProps {
  onSelectChampion: (championId: string) => void;
  disabled: boolean;
}

const ROLES = [
  { value: "All", label: "Todos" },
  { value: "Top", label: "Top" },
  { value: "Jungle", label: "Jungle" },
  { value: "Mid", label: "Mid" },
  { value: "ADC", label: "ADC" },
  { value: "Support", label: "Soporte" },
];

export default function ChampionGrid({ onSelectChampion, disabled }: ChampionGridProps) {
  const {
    allChampions,
    searchQuery,
    activeRoleFilter,
    setSearchQuery,
    setRoleFilter,
    blueBans,
    redBans,
    bluePicks,
    redPicks,
    selectedBanSlot,
    setSelectedDetailChampId,
  } = useDraftStore();

  const handleChampClick = (champId: string) => {
    if (selectedBanSlot) {
      onSelectChampion(champId); // Lock immediately for bans
    } else {
      setSelectedDetailChampId(champId); // Open drawer for picks
    }
  };

  const [ddragonVersion, setDdragonVersion] = useState("15.11.1");

  useEffect(() => {
    getLatestVersion().then(setDdragonVersion);
  }, []);

  // Set of already chosen champion IDs (picks + bans)
  const pickedBannedIds = new Set<string>();
  [...blueBans, ...redBans, ...bluePicks, ...redPicks].forEach(
    (id) => id && pickedBannedIds.add(id)
  );

  // Filter and sort champions
  const filteredChampions = allChampions
    .filter((champ) => {
      // Role filter
      if (activeRoleFilter !== "All") {
        const matchesMainRole = champ.role === activeRoleFilter;
        const matchesAltRoles = champ.roles?.includes(activeRoleFilter as any) || false;
        if (!matchesMainRole && !matchesAltRoles) return false;
      }


      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchesName = champ.name.toLowerCase().includes(query);
        const matchesTags = champ.tags?.some((tag) => tag.toLowerCase().includes(query));
        if (!matchesName && !matchesTags) return false;
      }

      return true;
    })
    .sort((a, b) => {
      // Comfort pool first, then alphabetical
      if (a.isOwnPool && !b.isOwnPool) return -1;
      if (!a.isOwnPool && b.isOwnPool) return 1;
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="v-stack gap-5 bg-[#091420] border border-[#785a28] p-6 shadow-md w-full h-full flex-1">
      {/* Header filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative w-full md:w-72 min-w-[220px]">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#8a9dae]/70" />
          <input
            type="text"
            placeholder="Buscar campeón..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="w-full bg-[#0a1428] border border-[#785a28]/60 rounded pl-10 pr-4 py-2.5 text-xs md:text-sm text-[#f0e6d3] placeholder-[#8a9dae]/50 focus:outline-none focus:ring-1 focus:ring-[#00c8c8] focus:border-[#00c8c8]"
          />
        </div>


        {/* Role Filters */}
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setRoleFilter(role.value)}
              disabled={disabled}
              className={`px-4 py-2 rounded text-xs md:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                activeRoleFilter === role.value
                  ? "bg-[#c8aa6e] text-[#0a1428] border border-[#f0e6d3]"
                  : "bg-[#1e232a] text-[#8a9dae] border border-[#785a28]/40 hover:bg-[#0a1428]"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto max-h-[480px] md:max-h-[710px] border border-[#785a28]/40 bg-[#010a13] p-2.5">
        {filteredChampions.length === 0 ? (
          <div className="text-center text-xs text-[#8a9dae] py-12">
            No se encontraron campeones coincidentes.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-7 xl:grid-cols-8 gap-2.5">
            {filteredChampions.map((champ) => {
              const isUnavailable = pickedBannedIds.has(champ.id);
              const iconUrl = getChampionIconUrl(ddragonVersion, champ.ddragonKey);

              return (
                <button
                  key={champ.id}
                  onClick={() => !isUnavailable && !disabled && handleChampClick(champ.id)}
                  disabled={isUnavailable || disabled}
                  aria-label={`${champ.name}, ${champ.role}, ${champ.isOwnPool ? "piscina de confort" : ""}`}
                  className={`group relative aspect-square border transition-all flex flex-col items-center justify-center p-1 bg-[#0a1428] ${
                    isUnavailable
                      ? "opacity-25 cursor-not-allowed border-transparent bg-[#010a13]"
                      : champ.isOwnPool
                      ? "border-[#c8aa6e] hover:border-[#00c8c8] hover:scale-105 shadow-[0_2px_8px_rgba(200,170,110,0.25)]"
                      : "border-[#785a28]/40 hover:border-[#00c8c8] hover:scale-105"
                  }`}
                  title={`${champ.name} (${champ.role})`}
                >
                  {/* Icon Image */}
                  <div className="relative w-full h-full aspect-square overflow-hidden rounded-sm">
                    <Image
                      src={iconUrl}
                      alt={champ.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="64px"
                    />
                  </div>

                  {/* Highlight for Comfort Pool */}
                  {champ.isOwnPool && (
                    <div className="absolute top-1.5 right-1.5 bg-[#0a1428] border border-[#c8aa6e] p-0.5 rounded-full z-10 shadow-md">
                      <Heart className="w-2.5 h-2.5 fill-[#c8aa6e] text-[#c8aa6e]" />
                    </div>
                  )}

                  {/* Champion Name Hover Tooltip / Label */}
                  <div className="absolute bottom-0 left-0 right-0 bg-[#0a1428]/95 border-t border-[#c8aa6e]/30 py-0.5 text-[8px] text-[#f0e6d3] font-semibold text-center truncate pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {champ.name}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
