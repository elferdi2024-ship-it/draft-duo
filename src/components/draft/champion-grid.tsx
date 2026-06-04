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
  } = useDraftStore();

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
        const matchesRole =
          champ.role === activeRoleFilter || champ.roles?.includes(champ.role);
        // Fallback checks
        const matchesRolesArray = champ.roles?.includes(activeRoleFilter as any);
        if (!matchesRole && !matchesRolesArray) return false;
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
    <div className="v-stack gap-5 bg-[#fcf9f2] border border-[#c8aa6e] p-6 shadow-md w-full h-full flex-1">
      {/* Header filters */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 w-4 h-4 text-[#785a28]" />
          <input
            type="text"
            placeholder="Buscar campeón..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            disabled={disabled}
            className="w-full bg-[#f3ebd7] border border-[#c8aa6e] rounded pl-10 pr-4 py-2.5 text-xs md:text-sm text-[#0f1923] placeholder-[#785a28]/60 focus:outline-none focus:ring-1 focus:ring-[#0397ab] focus:border-[#0397ab]"
          />
        </div>

        {/* Role Filters */}
        <div className="flex flex-wrap gap-1.5">
          {ROLES.map((role) => (
            <button
              key={role.value}
              onClick={() => setRoleFilter(role.value)}
              disabled={disabled}
              className={`px-4 py-2 rounded text-xs md:text-sm font-extrabold uppercase tracking-wider transition-all duration-200 ${
                activeRoleFilter === role.value
                  ? "bg-[#0a1428] text-[#f0e6d3] border border-[#0a1428]"
                  : "bg-[#eadecd] text-[#785a28] border border-[#d8ccb4] hover:bg-[#e7dbbf]"
              }`}
            >
              {role.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-y-auto max-h-[500px] md:max-h-[780px] border border-[#eadecd] bg-[#fdfbf7] p-3">
        {filteredChampions.length === 0 ? (
          <div className="text-center text-xs text-[#5e6b77] py-12">
            No se encontraron campeones coincidentes.
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {filteredChampions.map((champ) => {
              const isUnavailable = pickedBannedIds.has(champ.id);
              const iconUrl = getChampionIconUrl(ddragonVersion, champ.ddragonKey);

              return (
                <button
                  key={champ.id}
                  onClick={() => !isUnavailable && !disabled && onSelectChampion(champ.id)}
                  disabled={isUnavailable || disabled}
                  className={`group relative aspect-square border transition-all flex flex-col items-center justify-center p-1 bg-[#fcf9f2] ${
                    isUnavailable
                      ? "opacity-35 cursor-not-allowed border-transparent bg-gray-200"
                      : champ.isOwnPool
                      ? "border-[#c8aa6e] hover:border-[#0397ab] hover:scale-105 shadow-[0_2px_4px_rgba(200,170,110,0.15)]"
                      : "border-[#d8ccb4] hover:border-[#0397ab] hover:scale-105"
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
