// filepath: src/lib/data-loader.ts

import type { ChampionData, ChampionRole } from "./types";
import { getLatestVersion, fetchAllChampions, getDdragonKey } from "./ddragon";
import { ownChampions, staticFallbackChampions } from "../data/champions";

// ALPHA-DRAFT FIX: Inferencia dinámica de roles basada exclusivamente en tags oficiales de Data Dragon
export function inferRoleFromTags(tags: string[]): ChampionRole {
  if (tags.includes("Marksman")) {
    return "ADC";
  }
  if (tags.includes("Support")) {
    if (tags.includes("Tank")) {
      return "Tank Support";
    }
    if (tags.includes("Mage")) {
      return "Mage Support";
    }
    return "Enchanter Support";
  }
  // Fallbacks de línea para campeones de otras líneas del mapa
  if (tags.includes("Tank")) {
    return "Top";
  }
  if (tags.includes("Mage")) {
    return "Mid";
  }
  if (tags.includes("Assassin")) {
    return "Jungle";
  }
  if (tags.includes("Fighter")) {
    return "Top";
  }
  return "Mid"; // Fallback por defecto
}

// ALPHA-DRAFT FIX: Construir lista de roles combinada para mantener compatibilidad e inferencia granular
function determineRoles(tags: string[]): ChampionRole[] {
  const primary = inferRoleFromTags(tags);
  const roles: ChampionRole[] = [primary];
  
  // Agregar mapeos base para compatibilidad con código existente
  if (primary === "Tank Support" || primary === "Mage Support" || primary === "Enchanter Support") {
    roles.push("Support");
  }
  
  if (tags.includes("Marksman")) roles.push("ADC");
  if (tags.includes("Support")) roles.push("Support");
  if (tags.includes("Tank")) {
    roles.push("Top");
    roles.push("Jungle");
  }
  if (tags.includes("Mage")) roles.push("Mid");
  if (tags.includes("Assassin")) {
    roles.push("Mid");
    roles.push("Jungle");
  }
  if (tags.includes("Fighter")) {
    roles.push("Top");
    roles.push("Jungle");
  }
  
  return Array.from(new Set(roles));
}

function estimateMetrics(tags: string[] = []): { mobility: number; waveClear: number; engage: number; peel: number } {
  let mobility = 5.0;
  let waveClear = 5.0;
  let engage = 5.0;
  let peel = 5.0;

  if (tags.includes("Marksman")) {
    mobility = tags.includes("Assassin") || tags.includes("Fighter") ? 6.5 : 3.0;
    waveClear = 7.0;
    engage = 3.0;
    peel = 2.0;
  } else if (tags.includes("Tank")) {
    mobility = 3.5;
    waveClear = 4.0;
    engage = 8.5;
    peel = 7.5;
  } else if (tags.includes("Mage")) {
    mobility = 3.0;
    waveClear = 8.0;
    engage = 5.0;
    peel = 4.0;
  } else if (tags.includes("Assassin")) {
    mobility = 8.5;
    waveClear = 6.0;
    engage = 6.0;
    peel = 1.5;
  } else if (tags.includes("Fighter")) {
    mobility = 5.5;
    waveClear = 6.0;
    engage = 6.5;
    peel = 3.0;
  } else if (tags.includes("Support")) {
    mobility = 5.0;
    waveClear = 4.0;
    engage = 5.0;
    peel = 8.0;
  }

  return { mobility, waveClear, engage, peel };
}

export async function loadAllChampions(): Promise<ChampionData[]> {
  try {
    const version = await getLatestVersion();
    const ddragonChamps = await fetchAllChampions(version);

    if (!ddragonChamps || ddragonChamps.length === 0) {
      console.warn("Using static fallback champions list due to empty DDragon response");
      return staticFallbackChampions.map(c => ({
        ...estimateMetrics(c.tags || []),
        ...c
      }));
    }

    // Merge ddragon data with our rich strategic metadata
    const mapped: ChampionData[] = ddragonChamps.map((dc) => {
      const id = dc.id.toLowerCase();
      const ddragonKey = dc.id;

      // Check if this is one of our own comfort pool champions
      const own = ownChampions.find(
        (c) => c.id === id || c.ddragonKey.toLowerCase() === ddragonKey.toLowerCase()
      );

      const roles = determineRoles(dc.tags || []);
      const primaryRole = own ? own.role : roles[0] || "Mid";
      const estimated = estimateMetrics(dc.tags || []);

      if (own) {
        // ALPHA-DRAFT FIX: Para campeones de confort, priorizar su rol y añadir sus clasificaciones de tags
        return {
          ...estimated,
          ...own,
          ddragonKey,
          roles: Array.from(new Set([...roles, own.role, ...(own.roles || [])])),
        };
      }

      // Default champion data
      return {
        id,
        name: dc.name,
        ddragonKey,
        role: primaryRole,
        roles,
        tier: "B", // Default tier for non-pool
        tags: dc.tags,
        isOwnPool: false,
        ...estimated,
      };
    });

    return mapped;
  } catch (error) {
    console.error("Failed to load champions from DDragon, falling back to static list. Error:", error);
    return staticFallbackChampions.map(c => ({
      ...estimateMetrics(c.tags || []),
      ...c
    }));
  }
}
