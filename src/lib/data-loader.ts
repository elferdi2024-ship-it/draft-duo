// filepath: src/lib/data-loader.ts

import type { ChampionData, ChampionRole } from "./types";
import { getLatestVersion, fetchAllChampions, getDdragonKey } from "./ddragon";
import { ownChampions, staticFallbackChampions } from "../data/champions";

// Heuristics to determine primary/secondary roles for Data Dragon champions
function determineRoles(name: string, tags: string[]): ChampionRole[] {
  // Check if they are in our comfort pool or fallback pool
  const found = staticFallbackChampions.find(
    (c) => c.name.toLowerCase() === name.toLowerCase() || c.ddragonKey.toLowerCase() === getDdragonKey(name).toLowerCase()
  );
  if (found) {
    return found.roles || [found.role];
  }

  const roleList: ChampionRole[] = [];
  const lowercaseName = name.toLowerCase();

  // Known ADCs
  const adcNames = [
    "aphelios", "ashe", "caitlyn", "corki", "draven", "ezreal", "jhin", "jinx", 
    "kaisa", "kalista", "kogmaw", "lucian", "missfortune", "nilah", "samira", 
    "sivir", "tristana", "twitch", "varus", "vayne", "xayah", "zeri", "smolder"
  ];
  if (adcNames.some(adc => lowercaseName.includes(adc)) || tags.includes("Marksman")) {
    roleList.push("ADC");
  }

  // Known Supports
  const supportNames = [
    "alistar", "bard", "blitzcrank", "brand", "braum", "janna", "karma", "leona", 
    "lulu", "lux", "milio", "morgana", "nami", "nautilus", "pantheon", "pyke", 
    "rakan", "rell", "renata", "senna", "seraphine", "shaco", "sona", "soraka", 
    "swain", "taric", "thresh", "velkoz", "xerath", "yuumi", "zyra", "hwei"
  ];
  if (supportNames.some(sup => lowercaseName.includes(sup)) || tags.includes("Support")) {
    roleList.push("Support");
  }

  // Known Junglers
  const jungleNames = [
    "amumu", "belveth", "briar", "diana", "ekko", "evelynn", "fiddlesticks", 
    "graves", "hecarim", "ivern", "jarvan", "karthus", "kayn", "khazix", 
    "kindred", "leesin", "lillia", "masteryi", "nidalee", "nocturne", "nunu", 
    "olaf", "poppy", "rammus", "reksai", "rengar", "sejuani", "shaco", "shyvana", 
    "skarner", "trundle", "udyr", "vi", "viego", "volibear", "warwick", "wukong", 
    "xin", "zac"
  ];
  if (jungleNames.some(jg => lowercaseName.includes(jg))) {
    roleList.push("Jungle");
  }

  // Mid Laners
  const midNames = [
    "ahri", "akali", "akshan", "anivia", "annie", "aurelionsol", "azir", "cassiopeia", 
    "fizz", "galio", "hwei", "irelia", "kassadin", "katarina", "leblanc", "lissandra", 
    "malzahar", "naafiri", "neeko", "orianna", "ryze", "syndra", "taliyah", "talon", 
    "twistedfate", "veigar", "vladimir", "yasuo", "yone", "zoe", "zed"
  ];
  if (midNames.some(mid => lowercaseName.includes(mid)) || tags.includes("Mage") || tags.includes("Assassin")) {
    roleList.push("Mid");
  }

  // Top Laners
  const topNames = [
    "aatrox", "camille", "chogath", "dr. mundo", "fiora", "gangplank", "garen", 
    "gnar", "gragas", "illaoi", "irelia", "jax", "kante", "kayle", "kennen", 
    "malphite", "maokai", "mordekaiser", "nasus", "olaf", "ornn", "pantheon", 
    "quinn", "renekton", "riven", "rumble", "ryze", "shen", "singed", "sion", 
    "tahm", "teemo", "trundle", "tryndamere", "urgot", "vladimir", "volibear", 
    "yorick", "yasuo", "yone", "ksante"
  ];
  if (topNames.some(top => lowercaseName.includes(top)) || tags.includes("Tank") || tags.includes("Fighter")) {
    roleList.push("Top");
  }

  // Fallbacks if empty
  if (roleList.length === 0) {
    if (tags.includes("Tank")) roleList.push("Top");
    else if (tags.includes("Mage")) roleList.push("Mid");
    else if (tags.includes("Assassin")) roleList.push("Jungle");
    else roleList.push("Mid"); // Default fallback
  }

  return roleList;
}

export async function loadAllChampions(): Promise<ChampionData[]> {
  try {
    const version = await getLatestVersion();
    const ddragonChamps = await fetchAllChampions(version);

    if (!ddragonChamps || ddragonChamps.length === 0) {
      console.warn("Using static fallback champions list");
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

      const roles = determineRoles(dc.name, dc.tags);
      const primaryRole = own ? own.role : roles[0] || "Mid";

      if (own) {
        return {
          ...own,
          ddragonKey,
          roles,
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
    console.error("Failed to load champions from DDragon:", error);
    return staticFallbackChampions;
  }
}
