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

export async function loadAllChampions(): Promise<ChampionData[]> {
  try {
    const version = await getLatestVersion();
    const ddragonChamps = await fetchAllChampions(version);

    if (!ddragonChamps || ddragonChamps.length === 0) {
      console.warn("Using static fallback champions list due to empty DDragon response");
      return staticFallbackChampions;
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

      if (own) {
        // ALPHA-DRAFT FIX: Para campeones de confort, priorizar su rol y añadir sus clasificaciones de tags
        return {
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
      };
    });

    return mapped;
  } catch (error) {
    console.error("Failed to load champions from DDragon, falling back to static list. Error:", error);
    return staticFallbackChampions;
  }
}
