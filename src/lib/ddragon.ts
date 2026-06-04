// filepath: src/lib/ddragon.ts

const DDRAGON_BASE = 'https://ddragon.leagueoflegends.com';
const VERSION_CACHE_KEY = 'ddragon_version';
const VERSION_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours
const CHAMPIONS_CACHE_KEY = 'ddragon_champions';

// ============================================
// Special Name Mappings
// ============================================

const SPECIAL_KEYS: Record<string, string> = {
  "Cho'Gath": 'Chogath',
  "Kai'Sa": 'Kaisa',
  "Kha'Zix": 'Khazix',
  "Kog'Maw": 'KogMaw',
  "LeBlanc": 'Leblanc',
  "Rek'Sai": 'RekSai',
  "Vel'Koz": 'Velkoz',
  'Wukong': 'MonkeyKing',
  'Renata Glasc': 'Renata',
  'Miss Fortune': 'MissFortune',
  'Aurelion Sol': 'AurelionSol',
  'Dr. Mundo': 'DrMundo',
  'Jarvan IV': 'JarvanIV',
  'Lee Sin': 'LeeSin',
  'Master Yi': 'MasterYi',
  'Nunu & Willump': 'Nunu',
  'Tahm Kench': 'TahmKench',
  'Twisted Fate': 'TwistedFate',
  'Xin Zhao': 'XinZhao',
  "Bel'Veth": 'Belveth',
  "K'Sante": 'KSante',
};

// ============================================
// Version Management
// ============================================

export async function getLatestVersion(): Promise<string> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(VERSION_CACHE_KEY);
    if (cached) {
      try {
        const { version, timestamp } = JSON.parse(cached);
        if (Date.now() - timestamp < VERSION_CACHE_TTL) {
          return version;
        }
      } catch { /* ignore parse errors */ }
    }
  }

  try {
    const res = await fetch(`${DDRAGON_BASE}/api/versions.json`);
    const versions: string[] = await res.json();
    const latest = versions[0];

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        VERSION_CACHE_KEY,
        JSON.stringify({ version: latest, timestamp: Date.now() })
      );
    }

    return latest;
  } catch {
    return '15.11.1';
  }
}

// ============================================
// URL Builders
// ============================================

export function getChampionIconUrl(version: string, ddragonKey: string): string {
  return `${DDRAGON_BASE}/cdn/${version}/img/champion/${ddragonKey}.png`;
}

export function getChampionSplashUrl(ddragonKey: string, skinNum = 0): string {
  return `${DDRAGON_BASE}/cdn/img/champion/splash/${ddragonKey}_${skinNum}.jpg`;
}

export function getChampionLoadingUrl(ddragonKey: string, skinNum = 0): string {
  return `${DDRAGON_BASE}/cdn/img/champion/loading/${ddragonKey}_${skinNum}.jpg`;
}

export function getItemIconUrl(version: string, itemId: string | number): string {
  return `${DDRAGON_BASE}/cdn/${version}/img/item/${itemId}.png`;
}

export function getSpellIconUrl(version: string, spellFilename: string): string {
  return `${DDRAGON_BASE}/cdn/${version}/img/spell/${spellFilename}`;
}

export function getPassiveIconUrl(version: string, passiveFilename: string): string {
  return `${DDRAGON_BASE}/cdn/${version}/img/passive/${passiveFilename}`;
}

export function getDdragonKey(displayName: string): string {
  return SPECIAL_KEYS[displayName] || displayName.replace(/[\s'\.]/g, '');
}

// ============================================
// Champion Data Fetching
// ============================================

export interface DDragonChampion {
  id: string;
  key: string;
  name: string;
  title: string;
  tags: string[];
  image: { full: string };
}

export async function fetchAllChampions(version: string): Promise<DDragonChampion[]> {
  if (typeof window !== 'undefined') {
    const cached = localStorage.getItem(CHAMPIONS_CACHE_KEY);
    if (cached) {
      try {
        const { data, cachedVersion } = JSON.parse(cached);
        if (cachedVersion === version) {
          return data;
        }
      } catch { /* ignore parse errors */ }
    }
  }

  try {
    const res = await fetch(
      `${DDRAGON_BASE}/cdn/${version}/data/en_US/champion.json`
    );
    const json = await res.json();
    const champions: DDragonChampion[] = Object.values(json.data);

    if (typeof window !== 'undefined') {
      localStorage.setItem(
        CHAMPIONS_CACHE_KEY,
        JSON.stringify({ data: champions, cachedVersion: version })
      );
    }

    return champions;
  } catch {
    return [];
  }
}
