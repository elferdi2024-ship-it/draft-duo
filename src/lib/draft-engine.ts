// filepath: src/lib/draft-engine.ts

import type { 
  LiveDraftState, 
  BrainAnalysis, 
  BrainRecommendation, 
  CompAnalysis, 
  ChampionData, 
  ChampionScore,
  DraftPhaseStep,
  CompType,
  DuoData
} from "@/lib/types";
import { DRAFT_ORDER } from "@/lib/types";
import { ownChampions, staticFallbackChampions } from "@/data/champions";
import { duos } from "@/data/duos";

// Presión del jungla enemigo en early game (0-10)
const JUNGLER_PRESSURE: Record<string, number> = {
  leesin: 9.5,
  elise: 9.5,
  shaco: 9.0,
  rengar: 8.5,
  nidalee: 8.0,
  khazix: 7.5,
  viego: 7.0,
  jarvan: 8.5,
  jarvaniv: 8.5,
  xin: 8.5,
  xinzhao: 8.5,
  nocturne: 8.0,
  briar: 8.0,
  rammus: 7.5,
  hecarim: 7.5,
  poppy: 7.0,
  amumu: 6.5,
  sejuani: 6.0,
  vi: 7.5,
  graves: 6.0,
  belveth: 6.5,
  kayn: 5.5,
  lillia: 5.0,
  gragas: 7.0,
  malphite: 4.0,
  ivern: 2.0,
  karthus: 3.0,
  zac: 7.5,
  default: 5.0
};

// Capacidad de empuje de oleada del campeón (0-10)
export function getChampionWavePush(id: string, tags: string[] = []): number {
  const lowercaseId = id.toLowerCase();
  const wavePushMap: Record<string, number> = {
    sivir: 9.5, caitlyn: 9.0, tristana: 9.0, jinx: 8.5, varus: 8.0, ashe: 7.5, 
    kaisa: 7.0, lucian: 7.0, jhin: 6.0, ezreal: 5.0, vayne: 4.0, kogmaw: 7.5, 
    smolder: 8.0, aphelios: 7.5, zeri: 7.5, missfortune: 8.0, twitch: 6.0, draven: 7.5,
    brand: 8.5, xerath: 9.0, velkoz: 8.5, zyra: 8.0, lux: 8.0, karma: 7.0, 
    morgana: 7.0, seraphine: 8.0, hwei: 8.5, swain: 7.0, nami: 5.0, lulu: 4.0, 
    janna: 5.0, milio: 4.0, yuumi: 2.0, bard: 4.0, soraka: 4.0, sona: 4.0, 
    nautilus: 4.5, leona: 4.0, alistar: 3.5, rell: 4.0, braum: 3.0, rakan: 4.0, thresh: 3.5
  };

  if (wavePushMap[lowercaseId] !== undefined) {
    return wavePushMap[lowercaseId];
  }

  // Heurísticas de empuje
  if (tags.includes("Mage")) return 8.0;
  if (tags.includes("Marksman")) return 7.5;
  if (tags.includes("Tank")) return 4.0;
  if (tags.includes("Support")) return 4.5;
  return 5.0; // default
}

// Movilidad y escape del ADC (0-10)
export function getAdcMobility(id: string, tags: string[] = []): number {
  const lowercaseId = id.toLowerCase();
  const mobilityMap: Record<string, number> = {
    ezreal: 9.0, tristana: 8.5, lucian: 8.0, vayne: 7.5, kaisa: 7.5, smolder: 6.5,
    zeri: 9.0, nilah: 8.0, kalista: 8.5, caitlyn: 6.0, corki: 7.0, samira: 7.5,
    jhin: 3.5, ashe: 2.0, jinx: 2.0, varus: 2.0, kogmaw: 1.5, aphelios: 2.0,
    missfortune: 4.5, twitch: 3.0, draven: 4.0
  };

  if (mobilityMap[lowercaseId] !== undefined) {
    return mobilityMap[lowercaseId];
  }

  if (tags.includes("Assassin")) return 8.0;
  return 4.0; // default
}

// CC defensivo y peel del support (0-10)
export function getSupportPeel(id: string, tags: string[] = []): number {
  const lowercaseId = id.toLowerCase();
  const peelMap: Record<string, number> = {
    janna: 9.5, lulu: 9.0, braum: 8.5, renata: 8.0, alistar: 8.0, thresh: 7.5,
    nautilus: 7.0, rell: 7.0, morgana: 6.5, rakan: 6.5, nami: 6.0, leona: 6.0,
    taric: 8.0, milio: 8.0, yuumi: 7.0, soraka: 6.0, sona: 5.5, karma: 5.0,
    zyra: 4.0, swain: 3.5, lux: 3.0, brand: 1.5, xerath: 1.0, velkoz: 1.5,
    pyke: 2.0, senna: 2.0, pantheon: 1.5, blitzcrank: 4.0
  };

  if (peelMap[lowercaseId] !== undefined) {
    return peelMap[lowercaseId];
  }

  if (tags.includes("Support")) {
    if (tags.includes("Tank")) return 7.0;
    return 6.0; // default enchanter peel
  }
  return 5.0; // default
}

// Clasificación de arquetipos de macrojuego (Poke, Dive, Scaling, Peel/Protect)
export function getChampionArchetypes(id: string, tags: string[] = []): { isDive: boolean; isPoke: boolean; isScaling: boolean; isPeel: boolean } {
  const lowercaseId = id.toLowerCase();

  let isDive = false;
  let isPoke = false;
  let isScaling = false;
  let isPeel = false;

  const diveChamps = new Set([
    "aatrox", "alistar", "amumu", "belveth", "blitzcrank", "briar", "camille", "diana", "ekko", "elise", 
    "fiora", "fizz", "galio", "garen", "gragas", "gwen", "hecarim", "irelia", "jarvaniv", "jarvan", "jax", 
    "kaisa", "katarina", "kayn", "khazix", "ksante", "leona", "leesin", "malphite", "maokai", "monkeyking", "wukong", 
    "mordekaiser", "naafiri", "nautilus", "nocturne", "pantheon", "poppy", "pyke", "qiyana", "rakan", "reksai", 
    "rell", "renekton", "rengar", "riven", "samira", "sejuani", "shaco", "sylas", "talon", "thresh", "tristana", 
    "udyr", "urgot", "vi", "viego", "volibear", "warwick", "xin", "xinzhao", "yasuo", "yone", "zac", "zed"
  ]);

  const pokeChamps = new Set([
    "ahri", "anivia", "ashe", "aurelionsol", "azir", "brand", "caitlyn", "corki", "ezreal", "hwei", 
    "jayce", "jhin", "karma", "karthus", "kogmaw", "lux", "missfortune", "neeko", "nidalee", "seraphine", 
    "sivir", "smolder", "swain", "syndra", "taliyah", "teemo", "twistedfate", "varus", "velkoz", 
    "viktor", "xerath", "ziggs", "zoe", "zyra"
  ]);

  const scalingChamps = new Set([
    "aphelios", "aurelionsol", "azir", "belveth", "cassiopeia", "fiora", "gangplank", "gwen", "jax", "jinx", 
    "kaisa", "kassadin", "kayle", "kogmaw", "masteryi", "mordekaiser", "nasus", "ryze", "sivir", "smolder", 
    "twitch", "vayne", "veigar", "vladimir", "yone", "zeri"
  ]);

  const peelChamps = new Set([
    "alistar", "bard", "braum", "janna", "karma", "lulu", "milio", "morgana", "nami", "nautilus", 
    "poppy", "rell", "renata", "shen", "sona", "soraka", "tahmkench", "taric", "thresh", "yuumi"
  ]);

  if (diveChamps.has(lowercaseId)) isDive = true;
  if (pokeChamps.has(lowercaseId)) isPoke = true;
  if (scalingChamps.has(lowercaseId)) isScaling = true;
  if (peelChamps.has(lowercaseId)) isPeel = true;

  // Fallbacks basados en tags
  if (tags.includes("Assassin")) isDive = true;
  if (tags.includes("Mage")) {
    isPoke = true;
    if (["kassadin", "ryze", "veigar", "vladimir"].includes(lowercaseId)) isScaling = true;
  }
  if (tags.includes("Tank")) {
    isDive = true;
    if (!["pyke", "senna"].includes(lowercaseId)) isPeel = true;
  }
  if (tags.includes("Support")) {
    isPeel = true;
    if (["brand", "lux", "xerath", "velkoz", "zyra"].includes(lowercaseId)) isPoke = true;
  }
  if (tags.includes("Marksman")) {
    if (["jinx", "vayne", "kogmaw", "smolder", "twitch", "zeri", "aphelios"].includes(lowercaseId)) {
      isScaling = true;
    } else {
      isPoke = true;
    }
  }

  return { isDive, isPoke, isScaling, isPeel };
}

// Perfil de distribución de daño por campeón (AD / AP / True Damage)
export function getChampionDamageProfile(id: string, tags: string[] = []): { ad: number; ap: number; tr: number } {
  const lowercaseId = id.toLowerCase();

  // 1. AP Mages, AP Assassins y Enchanters (90-95% Daño Mágico)
  const apMagesAndAssassins = new Set([
    "ahri", "anivia", "annie", "aurelionsol", "azir", "brand", "cassiopeia", "hwei", 
    "karthus", "kassadin", "leblanc", "lissandra", "lux", "malzahar", "neeko", "orianna", 
    "ryze", "swain", "syndra", "taliyah", "twistedfate", "veigar", "velkoz", "viktor", 
    "vladimir", "xerath", "ziggs", "zoe", "fizz", "ekko", "evelynn", "katarina", 
    "diana", "sylas", "gwen", "lillia", "elise", "nidalee", "heimerdinger", "rumble", 
    "singed", "teemo", "karma", "morgana", "nami", "lulu", "renata", "janna", 
    "milio", "seraphine", "sona", "soraka", "yuumi", "bard"
  ]);

  // 2. Tanques y Colosos con escalado de AP / Daño mágico predominante (60% AP, 40% AD)
  const magicTanksAndBruisers = new Set([
    "nautilus", "braum", "leona", "rell", "sejuani", "malphite", "blitzcrank", "maokai", 
    "amumu", "galio", "gragas", "nunu", "rammus", "zac", "chogath", "mordekaiser", 
    "shen", "tahmkench", "taric", "volibear", "ornn", "ksante", "poppy", "alistar"
  ]);

  // 3. Daño Verdadero predominante (80% AD, 20% True Damage)
  const trueDamageDealers = new Set([
    "vayne", "pyke", "fiora", "darius", "camille", "belveth", "masteryi", "olaf"
  ]);

  // 4. Daño Híbrido (e.g. 70% AD, 30% AP o al revés)
  const hybridDealers = new Set([
    "kaisa", "varus", "smolder", "kogmaw", "corki", "kayle", "akali", "yone", "jax", "ezreal", "twitch", "shaco", "warwick", "udyr"
  ]);

  if (apMagesAndAssassins.has(lowercaseId)) {
    return { ad: 5, ap: 95, tr: 0 };
  }
  if (magicTanksAndBruisers.has(lowercaseId)) {
    return { ad: 40, ap: 60, tr: 0 };
  }
  if (trueDamageDealers.has(lowercaseId)) {
    return { ad: 80, ap: 0, tr: 20 };
  }
  if (hybridDealers.has(lowercaseId)) {
    if (["corki", "kayle", "akali"].includes(lowercaseId)) {
      return { ad: 30, ap: 70, tr: 0 };
    }
    return { ad: 70, ap: 30, tr: 0 };
  }

  // 5. Fallbacks heurísticos basados en etiquetas de Data Dragon
  const hasMageTag = tags.includes("Mage");
  const hasSupportTag = tags.includes("Support");
  const hasTankTag = tags.includes("Tank");

  if (hasMageTag) {
    return { ad: 10, ap: 90, tr: 0 };
  }
  if (hasSupportTag) {
    // Excluir soportes AD conocidos
    const adSupports = ["pyke", "senna", "pantheon", "ashe"];
    if (!adSupports.includes(lowercaseId)) {
      return { ad: 20, ap: 80, tr: 0 };
    }
  }
  if (hasTankTag) {
    return { ad: 50, ap: 50, tr: 0 };
  }

  // Por defecto (Tiradores, Luchadores, Asesinos estándar)
  return { ad: 100, ap: 0, tr: 0 };
}

const PLAYER_STATS_WINRATE: Record<string, number> = {
  varus: 0.58,
  ezreal: 0.52,
  ashe: 0.57,
  karma: 0.59,
  nautilus: 0.56,
};

export class CompetitiveBrain {
  private allChampions: ChampionData[];

  constructor(allChampions: ChampionData[] = staticFallbackChampions) {
    this.allChampions = allChampions;
  }

  private getChampionById(id: string): ChampionData | undefined {
    return this.allChampions.find(c => c.id === id);
  }

  // ALPHA-DRAFT FIX: Player-Champion Latent Affinity Bonus
  public calculatePlayerAffinity(championId: string): { bonus: number; hasBonus: boolean } {
    const winRate = PLAYER_STATS_WINRATE[championId.toLowerCase()];
    if (winRate && winRate > 0.55) {
      return { bonus: 15, hasBonus: true };
    }
    return { bonus: 0, hasBonus: false };
  }

  // ALPHA-DRAFT FIX: Macro-Impact Bonus
  public calculateMacroImpact(adcId: string | null, supportId: string | null): { bonus: number; warning: string | null } {
    if (!adcId && !supportId) return { bonus: 0, warning: null };
    
    let combinedPush = 5.0;
    if (adcId && supportId) {
      const adcPush = getChampionWavePush(adcId, this.getChampionById(adcId)?.tags);
      const supPush = getChampionWavePush(supportId, this.getChampionById(supportId)?.tags);
      combinedPush = (adcPush + supPush) / 2;
    } else if (adcId) {
      combinedPush = getChampionWavePush(adcId, this.getChampionById(adcId)?.tags);
    } else if (supportId) {
      combinedPush = getChampionWavePush(supportId, this.getChampionById(supportId)?.tags);
    }

    if (combinedPush > 7.0) {
      return { bonus: 10, warning: "Presión constante de oleada. Libera presión de Jungla para invadir o tomar objetivos." };
    }

    const isAdcPassive = adcId && ["jinx", "kogmaw", "vayne", "aphelios"].includes(adcId.toLowerCase());
    const isSupPassive = supportId && ["lulu", "yuumi", "soraka", "sona"].includes(supportId.toLowerCase());
    if (isAdcPassive && isSupPassive) {
      return { bonus: 0, warning: "Composición de escalado pasivo. Requiere protección temprana del Jungla hasta los 15 min." };
    }

    return { bonus: 0, warning: null };
  }

  // ALPHA-DRAFT FIX: determineWinCondition
  public determineWinCondition(allyPicks: (string | null)[], enemyPicks: (string | null)[]): { type: 'EARLY_DOMINANCE' | 'MACRO_CONTROL' | 'LATE_GAME_INSURANCE'; text: string } {
    const validAllyChamps = allyPicks
      .filter((id): id is string => !!id)
      .map(id => this.getChampionById(id))
      .filter((c): c is ChampionData => !!c);

    let earlyAggroCount = 0;
    let wavePushSum = 0;
    let lateHypercarryCount = 0;

    validAllyChamps.forEach(champ => {
      const id = champ.id.toLowerCase();
      const tags = champ.tags || [];
      
      const isEarly = ["lucian", "tristana", "leesin", "elise", "nautilus", "pyke", "leona", "rell", "alistar", "renata", "nami"].includes(id) || tags.includes("Assassin");
      if (isEarly) earlyAggroCount++;

      wavePushSum += getChampionWavePush(id, tags);

      const isLate = ["jinx", "vayne", "kogmaw", "smolder", "twitch", "zeri", "aphelios", "kassadin", "kayle", "veigar", "vladimir"].includes(id);
      if (isLate) lateHypercarryCount++;
    });

    const averagePush = validAllyChamps.length > 0 ? wavePushSum / validAllyChamps.length : 5.0;

    if (earlyAggroCount >= 2) {
      return {
        type: 'EARLY_DOMINANCE',
        text: "EARLY DOMINANCE: Dominio temprano y bola de nieve. Forzar jugadas agresivas, buscar prioridad nivel 2 e invadir activamente."
      };
    }

    if (averagePush > 6.8) {
      return {
        type: 'MACRO_CONTROL',
        text: "MACRO CONTROL: Presión constante y control del mapa. Crashear oleadas para asediar placas y liberar al jungla para objetivos de río."
      };
    }

    return {
      type: 'LATE_GAME_INSURANCE',
      text: "LATE GAME INSURANCE: Seguro de juego tardío. Evitar riesgos innecesarios, farmear pacientemente y escalar para peleas grupales definitivas."
    };
  }

  /**
   * Calculates the Gank Vulnerability Index (Vg) for a bot lane duo
   */
  public calculateGankVulnerability(adcId: string | null, supId: string | null, enemyPickedIds: string[]): number {
    if (!adcId && !supId) return 0;

    // 1. Encontrar presión del jungla enemigo
    let junglerPressure = 5.0;
    const enemyJungler = enemyPickedIds.find(id => {
      const champ = this.getChampionById(id);
      return champ?.role === "Jungle" || champ?.roles?.includes("Jungle");
    });
    if (enemyJungler) {
      junglerPressure = JUNGLER_PRESSURE[enemyJungler] || JUNGLER_PRESSURE.default;
    }

    // 2. Calcular empuje del duo
    let pushPower = 5.0;
    if (adcId && supId) {
      const adcPush = getChampionWavePush(adcId, this.getChampionById(adcId)?.tags);
      const supPush = getChampionWavePush(supId, this.getChampionById(supId)?.tags);
      pushPower = (adcPush + supPush) / 2;
    } else if (adcId) {
      pushPower = getChampionWavePush(adcId, this.getChampionById(adcId)?.tags);
    } else if (supId) {
      pushPower = getChampionWavePush(supId, this.getChampionById(supId)?.tags);
    }

    // 3. Movilidad del ADC
    const adcMobility = adcId ? getAdcMobility(adcId, this.getChampionById(adcId)?.tags) : 5.0;

    // 4. CC Defensivo del Support
    const supPeel = supId ? getSupportPeel(supId, this.getChampionById(supId)?.tags) : 5.0;

    // Fórmula: Vg = (P_jungla * E_empuje) / (M_adc + C_support + epsilon)
    const epsilon = 0.1;
    const Vg = (junglerPressure * pushPower) / (adcMobility + supPeel + epsilon);

    return Math.round(Math.min(15.0, Math.max(0.0, Vg)) * 10) / 10;
  }

  // ALPHA-DRAFT FIX: getDynamicWeights para ajustar pesos de scoring dinámicamente según contexto
  public getDynamicWeights(
    enemyPickedIds: string[], 
    allyPickedIds: string[], 
    draftState?: any
  ): { comfort: number; counter: number; synergy: number; comp: number; meta: number } {
    let comfort = 0.35;
    let counter = 0.25;
    let synergy = 0.20;
    let comp = 0.10;
    let meta = 0.10;

    // Regla 1 (Desequilibrio de Daño): enemigo tiene >60% de daño AP
    if (enemyPickedIds.length > 0) {
      const enemyComp = this.analyzeComp(enemyPickedIds);
      if (enemyComp && enemyComp.apPercentage !== undefined && enemyComp.apPercentage > 60) {
        comp += 0.15;
        meta = Math.max(0.0, meta - 0.15);
      }
    }

    // Regla 3 (Fase Tardía): PICK_PHASE_2
    if (draftState && draftState.macroPhase === 'PICK_PHASE_2') {
      synergy += 0.10;
      comfort = Math.max(0.0, comfort - 0.10);
    }

    // Regla 2 (Last Pick Red Side): Si es last pick, counter = 0.50, restar proporcionalmente de comfort y meta
    if (draftState && draftState.isLastPick === true) {
      const targetCounter = 0.50;
      const diff = targetCounter - counter;
      counter = targetCounter;
      
      const sumComfortMeta = comfort + meta;
      if (sumComfortMeta > 0) {
        const comfortShare = comfort / sumComfortMeta;
        const metaShare = meta / sumComfortMeta;
        comfort = Math.max(0.0, comfort - diff * comfortShare);
        meta = Math.max(0.0, meta - diff * metaShare);
      } else {
        synergy = Math.max(0.0, synergy - diff);
      }
    }

    // Normalizar a 1.0
    const total = comfort + counter + synergy + comp + meta;
    return {
      comfort: comfort / total,
      counter: counter / total,
      synergy: synergy / total,
      comp: comp / total,
      meta: meta / total
    };
  }

  // ALPHA-DRAFT FIX: CFR probabilístico basado en matriz de respuesta y colapso de espacio de respuestas
  public calculateCfrRegret(champId: string, state: LiveDraftState, activeStep: DraftPhaseStep, draftState?: any): number {
    // REGLA DE ORO: Si el espacio de respuestas de botlane enemiga está cerrado, CFR colapsa a 0.05
    if (draftState && draftState.isEnemyBotLaneClosed === true) {
      return 0.05;
    }

    const isLastPick = activeStep.index === 4 && activeStep.team === "red";
    if (isLastPick || (draftState && draftState.isLastPick === true)) {
      return 0.05;
    }

    const champ = this.getChampionById(champId);
    if (!champ) return 0.2;

    const enemyTeamPicks = state.side === "blue" ? state.redPicks : state.bluePicks;
    const enemyBotPicks = enemyTeamPicks.filter(id => {
      if (!id) return false;
      const c = this.getChampionById(id);
      return !!(c && (c.role === "ADC" || c.role === "Support" || c.roles?.includes("ADC") || c.roles?.includes("Support") || c.role.includes("Support")));
    });

    if (enemyBotPicks.length >= 2) {
      return 0.05;
    }

    // Probabilidad de respuesta enemiga (Matriz probabilística de Diveadores)
    const enemyBans = state.side === "blue" ? state.redBans : state.blueBans;
    const allyBans = state.side === "blue" ? state.blueBans : state.redBans;
    const allBans = [...enemyBans, ...allyBans].filter(Boolean) as string[];

    const potentialDiveResponders = ["zed", "vi", "nautilus", "leona", "rell", "alistar", "rengar", "malphite", "rakan", "nocturne", "viego", "hecarim", "jarvaniv", "jax", "camille"];
    const openDiveResponders = potentialDiveResponders.filter(id => 
      !enemyTeamPicks.includes(id) && !allBans.includes(id)
    );

    let responseProbability = 0.15;
    const isSafeBlindPick = ["ezreal", "ashe"].includes(champId);
    const isCounterExposed = ["caitlyn", "xerath", "brand", "velkoz", "jinx", "kogmaw"].includes(champId);

    if (isSafeBlindPick) {
      responseProbability = 0.10;
    } else if (isCounterExposed) {
      responseProbability = 0.35;
    }

    let openCountersCount = 0;
    if (champ.counters) {
      champ.counters.forEach(counter => {
        const cId = counter.toLowerCase();
        if (!enemyTeamPicks.includes(cId) && !allBans.includes(cId)) {
          openCountersCount++;
        }
      });
    }

    const remainingEnemyPicks = draftState && draftState.remainingEnemyPicks !== undefined
      ? draftState.remainingEnemyPicks
      : (5 - enemyTeamPicks.filter(Boolean).length);

    const cfr = responseProbability + (openCountersCount * 0.05) + (openDiveResponders.length * 0.01) + (remainingEnemyPicks * 0.02);
    return Math.round(Math.min(1.0, Math.max(0.0, cfr)) * 100) / 100;
  }

  /**
   * Detects the composition type of a team based on their picked champions
   * and computes physical/magic damage balances and scaling scores
   */
  public analyzeComp(pickedIds: (string | null)[]): CompAnalysis | null {
    const validChamps = pickedIds
      .filter((id): id is string => !!id)
      .map(id => this.getChampionById(id))
      .filter((c): c is ChampionData => !!c);

    if (validChamps.length === 0) return null;

    let diveCount = 0;
    let pokeCount = 0;
    let scalingCount = 0;
    let peelCount = 0;

    let totalAd = 0;
    let totalAp = 0;
    let totalTrue = 0;
    let totalScaling = 0;

    validChamps.forEach(c => {
      const tags = c.tags || [];
      const classes = c.philosophy || "";
      const id = c.id;

      // Heuristics based on tags and strategic philosophy using new robust archetype resolver
      const arch = getChampionArchetypes(id, tags);
      if (arch.isDive || classes.includes("Dive") || classes.includes("CC")) {
        diveCount++;
      }
      if (arch.isPoke || classes.includes("Poke") || classes.includes("Asedio")) {
        pokeCount++;
      }
      if (arch.isScaling || classes.includes("Late") || classes.includes("1v9")) {
        scalingCount++;
      }
      if (arch.isPeel || classes.includes("Peel") || classes.includes("counter-engage")) {
        peelCount++;
      }

      // Estimación del balance de daño (Capacidad iTero)
      const { ad, ap, tr } = getChampionDamageProfile(id, tags);
      let sc = 50; // default scaling

      // Estimación de escalado
      const isHyper = ["jinx", "kaisa", "vayne", "kogmaw", "smolder", "kassadin", "jax", "fiora", "kayle", "veigar", "vladimir", "belveth"].includes(id);
      const isMid = ["ashe", "ezreal", "tristana", "caitlyn", "varus", "viego", "syndra", "ahri", "leblanc", "orianna", "zed", "talon", "fizz", "ekko", "diana"].includes(id);
      const isEarly = ["lucian", "karma", "pyke", "nami", "leesin", "elise", "nidalee", "pantheon", "blitzcrank"].includes(id);
      const isUtility = ["nautilus", "braum", "thresh", "renata", "lulu", "leona", "sejuani", "malphite", "maokai", "rell", "alistar"].includes(id);

      if (isHyper) sc = 95;
      else if (isMid) sc = 75;
      else if (isEarly) sc = 45;
      else if (isUtility) sc = 60;
      else {
        // Fallbacks heurísticos basados en etiquetas de Data Dragon
        if (tags.includes("Assassin")) sc = 55;
        else if (tags.includes("Mage")) sc = 75;
        else if (tags.includes("Tank")) sc = 65;
        else if (tags.includes("Support")) sc = 60;
      }

      totalAd += ad;
      totalAp += ap;
      totalTrue += tr;
      totalScaling += sc;
    });

    const total = validChamps.length;
    let type: CompType = "balanced";
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (diveCount / total >= 0.4) {
      type = "dive";
      strengths.push("Iniciación explosiva y presión bajo torre.", "Fuerte escaramuza y cadena de resets.");
      weaknesses.push("Débil ante contra-iniciación coordinada.", "Sufre si el rival resiste el primer impacto.");
    } else if (pokeCount / total >= 0.4) {
      type = "poke";
      strengths.push("Excelente asedio a larga distancia.", "Reduce vida enemiga antes de objetivos.");
      weaknesses.push("Muy vulnerable a flancos e iniciación directa.", "Requiere mantener la distancia.");
    } else if (scalingCount / total >= 0.4) {
      type = "scaling";
      strengths.push("Poder imparable en el juego tardío.", "Fuerte pelea en equipo 5v5 estructurada.");
      weaknesses.push("Fase de líneas pasiva y débil.", "Cede dragones tempranos por falta de prioridad.");
    } else if (peelCount / total >= 0.4) {
      type = "protect";
      strengths.push("Supervivencia garantizada para los carries.", "Excelente capacidad de desenganche.");
      weaknesses.push("Poco daño proactivo propio.", "Totalmente dependiente del rendimiento del tirador.");
    } else {
      type = "balanced";
      strengths.push("Composición versátil adaptable a cualquier fase.", "Buen equilibrio entre iniciación y defensa.");
      weaknesses.push("No destaca de manera sobresaliente en un estilo.", "Puede ser superada por composiciones especializadas.");
    }

    const count = validChamps.length;
    const adPercentage = Math.round(totalAd / count);
    const apPercentage = Math.round(totalAp / count);
    const trueDamage = Math.round(totalTrue / count);
    const scalingScore = Math.round(totalScaling / count);

    return { 
      type, 
      strengths, 
      weaknesses,
      adPercentage,
      apPercentage,
      trueDamage,
      scalingScore
    };
  }

  /**
   * Scores a champion in the context of the current draft
   */
  public scoreChampion(champ: ChampionData, state: LiveDraftState, activeStep: DraftPhaseStep, userRole: "fer" | "ralph" | null = null): ChampionScore {
    const isAlly = activeStep.team === state.side;
    
    // 1. Comfort score (highly values our comfort champions)
    let comfort = 20;
    if (champ.isOwnPool) {
      if (champ.learningStatus === "mastered") comfort = 100;
      else if (champ.learningStatus === "learning") comfort = 80;
      else if (champ.learningStatus === "backup") comfort = 60;
    }

    // ALPHA-DRAFT FIX: Penalización despiadada para ADCs fuera del comfort pool
    const isAdc = champ.role === "ADC" || champ.roles?.includes("ADC");
    if (isAdc && !champ.isOwnPool) {
      comfort = Math.max(-100, comfort - 80);
    }

    // ALPHA-DRAFT FIX: Bonificaciones estratégicas y penalizaciones de soporte
    const isSupport = champ.role === "Support" || champ.roles?.includes("Support") || champ.role.includes("Support");
    if (isAlly && isSupport) {
      const isTankSupport = champ.role === "Tank Support" || champ.roles?.includes("Tank Support") || 
                            ["thresh", "braum", "nautilus", "leona", "rell", "alistar"].includes(champ.id);
      const isMageSupport = champ.role === "Mage Support" || champ.roles?.includes("Mage Support") || 
                            ["brand", "xerath", "lux", "velkoz", "zyra", "hwei", "morgana"].includes(champ.id);
                            
      if (isTankSupport) {
        comfort = Math.min(100, comfort + 35);
      } else if (isMageSupport) {
        comfort = Math.min(100, comfort + 15);
      }
    }

    // 2. Meta score
    let meta = 50;
    if (champ.tier === "S+") meta = 100;
    else if (champ.tier === "S") meta = 90;
    else if (champ.tier === "A+") meta = 80;
    else if (champ.tier === "A") meta = 70;

    // Resolve current team picks
    const myTeamPicks = state.side === "blue" ? state.bluePicks : state.redPicks;
    const enemyTeamPicks = state.side === "blue" ? state.redPicks : state.bluePicks;

    const validAllyPicks = myTeamPicks
      .filter((id): id is string => !!id)
      .map(id => this.getChampionById(id))
      .filter((c): c is ChampionData => !!c);

    const validEnemyPicks = enemyTeamPicks
      .filter((id): id is string => !!id)
      .map(id => this.getChampionById(id))
      .filter((c): c is ChampionData => !!c);

    // ALPHA-DRAFT FIX: Cálculo de sinergia dinámica en tiempo real basada en cruce de arquetipos y tags
    let synergy = 50;
    if (validAllyPicks.length > 0) {
      let synergySum = 0;
      validAllyPicks.forEach(allyChamp => {
        let singleSynergy = 50;
        
        const isCurrentAdc = champ.role === "ADC" || champ.roles?.includes("ADC");
        const isCurrentSup = champ.role === "Support" || champ.roles?.includes("Support") || champ.role.includes("Support");
        const isAllyAdc = allyChamp.role === "ADC" || allyChamp.roles?.includes("ADC");
        const isAllySup = allyChamp.role === "Support" || allyChamp.roles?.includes("Support") || allyChamp.role.includes("Support");

        if ((isCurrentAdc && isAllySup) || (isCurrentSup && isAllyAdc)) {
          const adcChamp = isCurrentAdc ? champ : allyChamp;
          const supChamp = isCurrentSup ? champ : allyChamp;

          const adcId = adcChamp.id;
          const supId = supChamp.id;
          const supTags = supChamp.tags || [];

          // Sub-arquetipos
          const needs_engage = ["kaisa", "jinx", "tristana", "lucian", "samira"].includes(adcId);
          const provides_engage = ["nautilus", "leona", "rell", "alistar", "pyke", "thresh"].includes(supId) || supTags.includes("Engage") || supChamp.role === "Tank Support";
          const high_poke = ["varus", "ezreal", "ashe", "caitlyn", "smolder"].includes(adcId) || adcChamp.tags?.includes("Poke");
          const zone_control = ["karma", "lux", "xerath", "brand", "velkoz", "zyra", "hwei", "morgana"].includes(supId) || supTags.includes("Mage") || supTags.includes("Poke") || supChamp.role === "Mage Support";
          const immobile = ["jinx", "ashe", "varus", "jhin", "kogmaw", "aphelios"].includes(adcId);
          
          const hasEnemyHighDive = enemyTeamPicks.some(id => 
            id && ["zed", "vi", "nautilus", "leona", "rengar", "malphite", "rakan", "nocturne", "viego", "hecarim", "jarvaniv", "jax", "camille"].includes(id)
          );
          const isSupTank = ["nautilus", "leona", "rell", "alistar", "braum", "thresh"].includes(supId) || supTags.includes("Tank") || supChamp.role === "Tank Support";

          if (needs_engage && provides_engage) {
            singleSynergy = 100;
          } else if (high_poke && zone_control) {
            singleSynergy = 95;
          } else if (isSupTank && immobile && hasEnemyHighDive) {
            singleSynergy = 40; // Falta de peel contra composiciones agresivas de dive
          } else {
            // Fallback a duos.ts
            const foundDuo = duos.find(
              d => (d.adcId === adcId && d.supId === supId) || 
                   (d.adcId === supId && d.supId === adcId)
            );
            if (foundDuo) {
              singleSynergy = foundDuo.tier === "S+" ? 100 : foundDuo.tier === "S" ? 95 : 85;
            } else {
              const champArch = getChampionArchetypes(champ.id, champ.tags);
              const allyArch = getChampionArchetypes(allyChamp.id, allyChamp.tags);
              if ((champArch.isPoke && allyArch.isPoke) || (champArch.isDive && allyArch.isDive)) {
                singleSynergy = 75;
              }
            }
          }
        } else {
          // Fuera de Botlane, sinergia estándar basada en coincidencia de arquetipos de macro
          const champArch = getChampionArchetypes(champ.id, champ.tags);
          const allyArch = getChampionArchetypes(allyChamp.id, allyChamp.tags);
          if ((champArch.isDive && allyArch.isDive) || (champArch.isPoke && allyArch.isPoke) || (champArch.isPeel && allyArch.isPeel)) {
            singleSynergy = 75;
          }
        }
        synergySum += singleSynergy;
      });
      synergy = Math.round(synergySum / validAllyPicks.length);
    }

    // 4. Counter Score
    let counter = 50;
    if (validEnemyPicks.length > 0) {
      let counterSum = 0;
      validEnemyPicks.forEach(enemyChamp => {
        let singleCounter = 50;

        // Threat detector: check if enemy counters us
        const enemyThreatToUs = champ.counters?.includes(enemyChamp.name) || 
                                 champ.counters?.includes(enemyChamp.id);
        
        // Counter detector: check if we counter them based on PLAN MACRO rules
        const weCounterEnemy = enemyChamp.counters?.includes(champ.name) || 
                               enemyChamp.counters?.includes(champ.id) ||
                               // Ashe counters Jinx, Smolder
                               (champ.id === "ashe" && (enemyChamp.id === "jinx" || enemyChamp.id === "smolder" || enemyChamp.id === "caitlyn")) ||
                               // Varus counters tanks/enchanters
                               (champ.id === "varus" && (enemyChamp.tags?.includes("Tank") || enemyChamp.id === "lulu" || enemyChamp.id === "janna")) ||
                               // Renata counters engage/dive
                               (champ.id === "renata" && (enemyChamp.tags?.includes("Engage") || enemyChamp.id === "nautilus" || enemyChamp.id === "leona" || enemyChamp.id === "rakan")) ||
                               // Lulu counters dive
                               (champ.id === "lulu" && (enemyChamp.id === "rengar" || enemyChamp.id === "malphite" || enemyChamp.id === "nautilus"));

        if (enemyThreatToUs) {
          singleCounter = 25; // Challenger: High threat is heavily penalized
        } else if (weCounterEnemy) {
          singleCounter = 98; // High counter weight
        } else {
          // General lane dynamics using robust archetypes
          const champArch = getChampionArchetypes(champ.id, champ.tags);
          const enemyArch = getChampionArchetypes(enemyChamp.id, enemyChamp.tags);
          const isPokeVsAllIn = champArch.isPoke && enemyArch.isDive;
          const isAllInVsPoke = champArch.isDive && enemyArch.isPoke;
          
          if (isAllInVsPoke) {
            singleCounter = 85; // Dive counters poke in lane
          } else if (isPokeVsAllIn) {
            singleCounter = 35; // Poke suffers vs hard engage all-in
          }
        }
        counterSum += singleCounter;
      });
      counter = Math.round(counterSum / validEnemyPicks.length);

      // Adaptive Composition Counter modifiers based on enemy comp
      const enemyComp = this.analyzeComp(enemyTeamPicks);
      if (enemyComp) {
        if (enemyComp.type === "dive") {
          // Boost peelers/disengage against dive
          const champArch = getChampionArchetypes(champ.id, champ.tags);
          if (champ.role === "Support" && (champArch.isPeel || ["lulu", "renata", "braum"].includes(champ.id))) {
            counter = Math.min(100, counter + 25);
          }
          // Boost safe ADCs against dive
          if (champ.id === "ezreal") {
            counter = Math.min(100, counter + 20);
          }
          // Penalize immobile ADCs against dive
          if (champ.role === "ADC" && ["jinx", "ashe", "kogmaw", "varus"].includes(champ.id)) {
            counter = Math.max(0, counter - 20);
          }
        } else if (enemyComp.type === "poke") {
          // Boost engage/dive supports to lock down poke
          const champArch = getChampionArchetypes(champ.id, champ.tags);
          if (champ.role === "Support" && (champArch.isDive || ["nautilus", "pyke", "thresh", "leona"].includes(champ.id))) {
            counter = Math.min(100, counter + 25);
          }
          // Boost healers/sustain to survive poke
          if (champ.id === "nami") {
            counter = Math.min(100, counter + 15);
          }
        } else if (enemyComp.type === "scaling") {
          // Boost early game aggressive lane bullies to shut down scaling
          if (champ.id === "lucian" || champ.id === "tristana" || champ.id === "caitlyn") {
            counter = Math.min(100, counter + 20);
          }
        }
      }
    }

    // Red Side last pick counter boost (Challenger priority)
    const isRedSideLastPick = state.side === "red" && activeStep.index === 4;
    if (isAlly && isRedSideLastPick && counter > 70) {
      counter = Math.min(100, counter + 20); // Reward selecting a counter-pick as last pick
    }

    // 5. Comp Score (Cohesion and Damage profiles balance)
    let comp = 50;
    if (validAllyPicks.length > 0) {
      const allyAnalysis = this.analyzeComp(myTeamPicks);
      if (allyAnalysis) {
        const allyType = allyAnalysis.type;
        // Do we match the ally team identity?
        const champArch = getChampionArchetypes(champ.id, champ.tags);
        const matchesIdentity = 
          (allyType === "dive" && champArch.isDive) ||
          (allyType === "poke" && champArch.isPoke) ||
          (allyType === "scaling" && champArch.isScaling) ||
          (allyType === "protect" && champArch.isPeel);
        
        comp = matchesIdentity ? 90 : 65;

        // Damage type balance modifier (Challenger Coach level)
        if (allyAnalysis.adPercentage !== undefined && allyAnalysis.adPercentage >= 80) {
          // Team is full AD so far. AP candidates get a massive boost
          const damageProfile = getChampionDamageProfile(champ.id, champ.tags);
          const isAPDamage = damageProfile.ap >= 30;
          if (isAPDamage) {
            comp = Math.min(100, comp + 25);
          } else if (champ.role === "Support") {
            comp = Math.max(10, comp - 20); // Penalize double-down on physical support if team has no AP
          }
        }

        // CC check
        const teamHasTank = validAllyPicks.some(c => c.tags?.includes("Tank") || ["nautilus", "braum", "leona", "rell"].includes(c.id));
        if (!teamHasTank && ["nautilus", "braum", "leona", "rell"].includes(champ.id) && champ.role === "Support") {
          comp = Math.min(100, comp + 25); // Team needs a frontliner, reward picking one
        }
      }
    }

    return { counter, synergy, meta, comfort, comp };
  }

  /**
   * Recommends picking options for our team
   */
  private recommendPicks(state: LiveDraftState, activeStep: DraftPhaseStep, userRole: "fer" | "ralph" | null = null): BrainRecommendation[] {
    const isMySlotADC = activeStep.index === state.myPickSlots[0];
    const targetRole = isMySlotADC ? "ADC" : "Support";

    // Filter champions of the correct role
    const candidates = this.allChampions.filter(c => c.role === targetRole || c.roles?.includes(targetRole));

    // Exclude already picked/banned champions
    const pickedBannedIds = new Set<string>();
    state.blueBans.forEach(id => id && pickedBannedIds.add(id));
    state.redBans.forEach(id => id && pickedBannedIds.add(id));
    state.bluePicks.forEach(id => id && pickedBannedIds.add(id));
    state.redPicks.forEach(id => id && pickedBannedIds.add(id));

    const availableCandidates = candidates.filter(c => !pickedBannedIds.has(c.id));

    const enemyTeamPicks = state.side === "blue" ? state.redPicks : state.bluePicks;
    const enemyPickedIds = enemyTeamPicks.filter(Boolean) as string[];
    const allyTeamPicks = state.side === "blue" ? state.bluePicks : state.redPicks;
    const allyPickedIds = allyTeamPicks.filter(Boolean) as string[];

    // ALPHA-DRAFT FIX: Obtener pesos dinámicos adaptativos según el draftState actual
    const weights = this.getDynamicWeights(enemyPickedIds, allyPickedIds, state.draftState);

    const recommendations: BrainRecommendation[] = availableCandidates.map(champ => {
      const scores = this.scoreChampion(champ, state, activeStep, userRole);
      
      // ALPHA-DRAFT FIX: Player-Champion Latent Affinity Bonus
      const affinity = this.calculatePlayerAffinity(champ.id);
      if (affinity.hasBonus) {
        scores.comfort = Math.min(100, scores.comfort + affinity.bonus);
      }

      // ALPHA-DRAFT FIX: Macro-Impact Bonus
      let macroBonus = 0;
      if (targetRole === "Support") {
        const myAdcId = allyPickedIds.find(id => {
          const c = this.getChampionById(id);
          return c?.role === "ADC" || c?.roles?.includes("ADC");
        }) || null;
        if (myAdcId) {
          const macro = this.calculateMacroImpact(myAdcId, champ.id);
          macroBonus = macro.bonus;
        }
      } else if (targetRole === "ADC") {
        const mySupId = allyPickedIds.find(id => {
          const c = this.getChampionById(id);
          return c?.role === "Support" || c?.roles?.includes("Support") || c?.role?.includes("Support");
        }) || null;
        if (mySupId) {
          const macro = this.calculateMacroImpact(champ.id, mySupId);
          macroBonus = macro.bonus;
        }
      }
      if (macroBonus > 0) {
        scores.comp = Math.min(100, scores.comp + macroBonus);
      }

      // Calculate total score using dynamic weights
      let totalScore = Math.round(
        scores.comfort * weights.comfort +
        scores.counter * weights.counter +
        scores.synergy * weights.synergy +
        scores.comp * weights.comp +
        scores.meta * weights.meta
      );

      // ALPHA-DRAFT FIX: Penalización de -50 al Score Total de Enchanters Puros
      const isSup = champ.role === "Support" || champ.roles?.includes("Support") || champ.role.includes("Support");
      const isPureEnchanter = isSup && (
        champ.role === "Enchanter Support" || 
        ["lulu", "yuumi", "soraka", "nami", "sona"].includes(champ.id)
      );
      if (isPureEnchanter) {
        totalScore = Math.max(0, totalScore - 50);
      }

      // Determine appropriate tag
      let tag: BrainRecommendation["tag"] = "COMFORT_PICK";
      let reasoning = "";

      if (champ.isOwnPool && scores.counter > 80) {
        tag = "BEST_PICK";
        reasoning = `${champ.name} es la mejor opción. Tiene alta sinergia con tus aliados y counterea la composición rival.`;
      } else if (scores.counter > 85) {
        tag = "COUNTER_PICK";
        reasoning = `Excelente counter directo para la botlane enemiga revelada.`;
      } else if (champ.isOwnPool && scores.comfort === 100) {
        tag = "COMFORT_PICK";
        reasoning = `Pick confort prioritario dominado del Plan Macro. Seguro y consistente.`;
      } else {
        tag = "SAFE_PICK";
        reasoning = `Pick seguro que aporta equilibrio a la composición de tu equipo.`;
      }

      // Contextual reasoning based on plan macro details
      if (champ.id === "ashe") {
        reasoning += " Nivel Challenger: Aporta presión constante de oleadas mediante W, revela la ruta del jungla enemigo con E (Halcón) de manera perpendicular, y habilita iniciaciones limpias con R (Flecha de Cristal) para transicionar a objetivos de río.";
      } else if (champ.id === "varus") {
        reasoning += " Nivel Challenger: Habilita composiciones de asedio lineal y poke letal. Utiliza la Q cargada con builds de letalidad desde la niebla para ablandar frontlines. Su R (Cadena de Corrupción) actúa como denegador de engage.";
      } else if (champ.id === "jhin") {
        reasoning += " Nivel Challenger: Ofrece control de visión y picks seguros desde la niebla (W + R). Controla cuellos de botella con cepos (E) y ejecuta objetivos a distancia extrema.";
      } else if (champ.id === "tristana") {
        reasoning += " Nivel Challenger: Opresión mediante empuje de oleada, demolición de placas con E, y gran seguridad con su salto W. Ideal para dives y forzar bola de nieve rápida.";
      } else if (champ.id === "jinx") {
        reasoning += " Nivel Challenger: El hypercarry late game supremo. Limpia peleas grupales mediante su pasiva de resets rápidos. Requiere protección pero ofrece el DPS más alto del draft.";
      } else if (champ.id === "karma") {
        reasoning += " Nivel Challenger: Enchanter dominante de poke y aceleración macro. Acelera rotaciones a dragones con R-E y desgasta al oponente bajo torre con R-Q constante.";
      } else if (champ.id === "nautilus") {
        reasoning += " Nivel Challenger: Iniciador por excelencia y facilitador de dives rápidos. Ralph, inmoviliza al carry rival con Q y pasiva, bloqueando su escape en nivel 2 y 6.";
      } else if (champ.id === "pyke") {
        reasoning += " Nivel Challenger: Generador de snowball ciego. Ralph, limpia centinelas rivales y usa R en ejecuciones para compartir el oro de las escaramuzas.";
      } else if (champ.id === "renata") {
        reasoning += " Nivel Challenger: Especialista anti-dive. La W (Rescate Financiero) salva al carry en trades al límite, y la R (Hostilidad Creciente) desmantela composiciones enemigas de autoataque.";
      } else if (champ.id === "lulu") {
        reasoning += " Nivel Challenger: La protectora definitiva contra asesinos. Usa Polymorph (W) reactivamente en la entrada del rival para anular su ráfaga de daño e inmovilizarlos.";
      } else if (champ.id === "thresh") {
        reasoning += " Nivel Challenger: Soporte de utilidad versátil. La linterna (W) rescata a Fer de sobreextensiones y el Flay (E) cancela saltos de campeones enemigos de engage directo.";
      } else if (champ.id === "braum") {
        reasoning += " Nivel Challenger: Pared infranqueable contra asedios. Detiene proyectiles clave (como definitivas) con la E, aportando aturdimiento glacial masivo mediante autoataques cruzados.";
      }

      // Calcular gankVulnerability y cfrRegret para esta recomendación
      const isAlly = activeStep.team === state.side;
      let gankV = 0;
      if (isAlly) {
        const picksList = state.side === "blue" ? state.bluePicks : state.redPicks;
        const enemyPicks = state.side === "blue" ? state.redPicks : state.bluePicks;
        const enemyPickedIds = enemyPicks.filter(Boolean) as string[];
        
        const testAdcId = isMySlotADC ? champ.id : (picksList[state.myPickSlots[0]] || null);
        const testSupId = !isMySlotADC ? champ.id : (picksList[state.myPickSlots[1]] || null);
        gankV = this.calculateGankVulnerability(testAdcId, testSupId, enemyPickedIds);
      }
      
      // ALPHA-DRAFT FIX: Pasar draftState al cálculo de CFR
      const cfrRegret = this.calculateCfrRegret(champ.id, state, activeStep, state.draftState);

      return {
        championId: champ.id,
        championName: champ.name,
        ddragonKey: champ.ddragonKey,
        totalScore,
        scores,
        reasoning,
        tag,
        cfrRegret,
        gankVulnerability: gankV,
        hasAffinityBonus: affinity.hasBonus
      };
    });

    // Sort by total score descending
    return recommendations.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
  }

  /**
   * Recommends bans for the current team
   */
  private recommendBans(state: LiveDraftState, activeStep: DraftPhaseStep): BrainRecommendation[] {
    // Standard ban priorities from macro plan
    const macroBans = [
      { id: "senna", reason: "Anti-dictadura de oleada. Bloqueo obligatorio número 1.", tag: "PRIORITY_BAN" as const },
      { id: "caitlyn", reason: "Counter directo de rango a Ashe/Jhin. Bloqueo de línea.", tag: "PRIORITY_BAN" as const },
      { id: "rakan", reason: "Contrarresta nuestros setups de dive. Alta prioridad.", tag: "VALUE_BAN" as const },
      { id: "lulu", reason: "Blindaje de carry enemigo e inmortalidad contra poke. Bloqueo de confort.", tag: "VALUE_BAN" as const },
    ];

    // Filter already banned or picked
    const bannedPicked = new Set<string>();
    state.blueBans.forEach(id => id && bannedPicked.add(id));
    state.redBans.forEach(id => id && bannedPicked.add(id));
    state.bluePicks.forEach(id => id && bannedPicked.add(id));
    state.redPicks.forEach(id => id && bannedPicked.add(id));

    const finalRecommendations: BrainRecommendation[] = [];

    macroBans.forEach(mb => {
      if (!bannedPicked.has(mb.id)) {
        const champ = this.getChampionById(mb.id);
        if (champ) {
          finalRecommendations.push({
            championId: mb.id,
            championName: champ.name,
            ddragonKey: champ.ddragonKey,
            totalScore: mb.tag === "PRIORITY_BAN" ? 95 : 85,
            scores: { comfort: 100, counter: 80, meta: 90, synergy: 0, comp: 0 },
            reasoning: mb.reason,
            tag: mb.tag
          });
        }
      }
    });

    // If we need more bans, find high-tier enemy counters that are not banned
    if (finalRecommendations.length < 5) {
      const topPicks = this.allChampions
        .filter(c => !bannedPicked.has(c.id))
        .filter(c => c.tier === "S+" || c.tier === "S")
        .filter(c => c.role === "ADC" || c.role === "Support");

      topPicks.forEach(tp => {
        if (finalRecommendations.length < 5 && !finalRecommendations.some(r => r.championId === tp.id)) {
          finalRecommendations.push({
            championId: tp.id,
            championName: tp.name,
            ddragonKey: tp.ddragonKey,
            totalScore: 75,
            scores: { comfort: 50, counter: 50, meta: 90, synergy: 50, comp: 50 },
            reasoning: `Bloqueo de alto tier meta (${tp.tier}) para denegar confort a la botlane rival.`,
            tag: "VALUE_BAN"
          });
        }
      });
    }

    return finalRecommendations.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
  }

  /**
   * Performs complete analysis of the current draft state
   */
  public analyze(state: LiveDraftState, userRole: "fer" | "ralph" | null = null): BrainAnalysis {
    const stepIndex = state.currentStepIndex;
    
    // Resolve compositions
    const allyPicks = state.side === "blue" ? state.bluePicks : state.redPicks;
    const enemyPicks = state.side === "blue" ? state.redPicks : state.bluePicks;

    const allyComp = this.analyzeComp(allyPicks);
    const enemyComp = this.analyzeComp(enemyPicks);
    
    // ALPHA-DRAFT FIX: Determine win condition and macro impact indicators
    const winCondInfo = this.determineWinCondition(allyPicks, enemyPicks);
    const myAdcId = allyPicks[state.myPickSlots[0]];
    const mySupId = allyPicks[state.myPickSlots[1]];
    const macroImpact = this.calculateMacroImpact(myAdcId, mySupId);

    // Default / Complete state
    if (stepIndex >= DRAFT_ORDER.length) {
      // Resolve matching clinical meta duo when complete
      const ourPicks = state.side === "blue" ? state.bluePicks : state.redPicks;
      const adcPickId = ourPicks[state.myPickSlots[0]];
      const supPickId = ourPicks[state.myPickSlots[1]];
      let matchingDuo = duos.find(
        (d) => 
          (d.adcId === adcPickId && d.supId === supPickId) ||
          (d.adcId === supPickId && d.supId === adcPickId)
      );
      if (!matchingDuo && adcPickId && supPickId) {
        matchingDuo = this.generateDynamicDuo(adcPickId, supPickId) || undefined;
      }

      // Calculate final win probability
      let winProb = 50;
      if (matchingDuo) {
        winProb += 15;
        if (matchingDuo.tier === "S+" || matchingDuo.tier === "S") winProb += 8;
      }
      
      // Damage type check
      if (allyComp && allyComp.adPercentage !== undefined) {
        if (allyComp.adPercentage >= 90) winProb -= 8;
        else if (allyComp.adPercentage >= 40 && allyComp.adPercentage <= 70) winProb += 4;
      }

      winProb = Math.max(15, Math.min(88, winProb));

      const finalGankV = this.calculateGankVulnerability(adcPickId || null, supPickId || null, enemyPicks.filter(Boolean) as string[]);

      return {
        isMyTurn: false,
        actionType: "pick",
        recommendations: [],
        enemyComp,
        allyComp,
        warnings: [],
        winConditions: [
          userRole === "fer" 
            ? "Fer: Fase de Draft Completada. Asegura tu farm de late game y mantén el posicionamiento perpendicular."
            : userRole === "ralph"
            ? "Ralph: Fase de Draft Completada. Secuestra wards enemigos, mantén visión en río y da peel a Fer."
            : "Fase de Draft Completada. Ejecuta tu plan macro minuto a minuto."
        ],
        phase: "complete",
        winProbability: winProb,
        recommendedSummoners: this.computeRecommendedSummoners(adcPickId, supPickId, enemyPicks.filter(Boolean) as string[]),
        gankVulnerability: finalGankV,
        cfrRegretScore: 0.05,
        winConditionType: winCondInfo.type,
        winConditionText: winCondInfo.text,
        macroImpactWarning: macroImpact.warning || undefined
      };
    }

    const currentStep = DRAFT_ORDER[stepIndex];
    const isMyTurn = currentStep.team === state.side;
    
    // Recommendations
    const recommendations = currentStep.type === "ban" 
      ? this.recommendBans(state, currentStep)
      : this.recommendPicks(state, currentStep, userRole);

    // Contextual warnings & win conditions
    const warnings: string[] = [];
    const winConditions: string[] = [];

    // Analyze warnings
    const enemyPickedIds = enemyPicks.filter(Boolean) as string[];
    const allyPickedIds = allyPicks.filter(Boolean) as string[];

    // Challenger Coach Logic: Warnings & Strategic Directives
    if (enemyPickedIds.includes("caitlyn") && !allyPickedIds.includes("ashe")) {
      if (userRole === "fer") {
        warnings.push("¡Fer, peligro! El rival eligió Caitlyn. Evita tiradores de corto rango. Considera Ashe o Varus para pelear su rango.");
      } else if (userRole === "ralph") {
        warnings.push("¡Ralph, peligro! Caitlyn enemiga revelada. Protege a Fer con escudos (Braum/Karma) y mitiga su poke.");
      } else {
        warnings.push("¡Peligro! El rival pickeó Caitlyn. Evita jugar tiradores de corto rango. Considera Ashe + Karma o Varus.");
      }
    }
    if (enemyPickedIds.includes("senna")) {
      if (userRole === "fer") {
        warnings.push("¡Fer, Senna enemiga! Prepárate para castigarla rápido. Dile a Ralph que busque iniciaciones (Lucian/Nami o Tristana/Nautilus).");
      } else if (userRole === "ralph") {
        warnings.push("¡Ralph, Senna enemiga! Castiga su fragilidad temprano. Elige Nautilus, Pyke o Thresh para engancharla.");
      } else {
        warnings.push("¡Senna revelada! Rompe la dictadura de oleadas con dives pesados de Tristana + Nautilus.");
      }
    }
    if (enemyPickedIds.some(id => ["nautilus", "leona", "rakan", "rengar", "malphite"].includes(id))) {
      if (userRole === "fer") {
        warnings.push("¡Fer, amenaza de dive/engage detectada! Posiciónate atrás, compra Edge of Night y espera el peel de Ralph.");
      } else if (userRole === "ralph") {
        warnings.push("¡Ralph, amenaza de dive detectada! Prioriza Renata Glasc, Lulu o Braum para dar peel instantáneo a Fer.");
      } else {
        warnings.push("Amenaza de DIVE o hard engage detectada. Prioriza Renata Glasc o Lulu en support para peel.");
      }
    }

    // Challenger Comp Checks (Warnings)
    if (allyPickedIds.length > 0) {
      // Full AD Check
      if (allyComp && allyComp.adPercentage !== undefined && allyComp.adPercentage >= 90) {
        warnings.push("⚠️ COACH CHALLENGER: Composición 100% AD detectada. Ralph, prioriza supports de daño mágico (Karma, Lux) para forzar al rival a comprar resistencia mágica.");
      }
      
      // No Frontline Check
      const hasTank = allyPickedIds.map(id => this.getChampionById(id)).some(c => c?.tags?.includes("Tank") || ["nautilus", "braum", "leona", "rell"].includes(c?.id || ""));
      const isSupportSlotNotPicked = !allyPicks[state.myPickSlots[1]];
      if (!hasTank && isSupportSlotNotPicked && currentStep.type === "pick") {
        warnings.push("⚠️ COACH CHALLENGER: Composición sin línea frontal (no frontline). Ralph, prioriza tanques iniciadores o protectores (Nautilus, Braum) para asegurar control.");
      }
    }

    // Default macro guidelines if no warnings
    if (warnings.length === 0) {
      if (userRole === "fer") {
        warnings.push("Fer: Línea despejada. Asegura tus tiradores de confort y concéntrate en last hits.");
      } else if (userRole === "ralph") {
        warnings.push("Ralph: Línea despejada. Coordina la visión del río y prepara tus supports de confort.");
      } else {
        warnings.push("Línea despejada. Sigue el orden de picks y asegura tus campeones de confort.");
      }
    }

    // Dynamic win conditions
    if (allyComp?.type === "poke") {
      if (userRole === "fer") {
        winConditions.push("Fer: Desgasta con W de Ashe o Q de Varus desde arbustos sin revelar tu posición.");
        winConditions.push("Fer: Asegura farm alto (>8 CS/min) y asedia la torre bot con flechas cargadas.");
      } else if (userRole === "ralph") {
        winConditions.push("Ralph: Usa R-E de Karma para dar velocidad a Fer y pokear con R-Q.");
        winConditions.push("Ralph: Asegura el pixel bush 45s antes del spawn de dragones.");
      } else {
        winConditions.push("Desgastar con W de Ashe o Q de Varus desde arbustos ciegos antes de dragones.");
        winConditions.push("Crashear oleadas y golpear placas. Evitar peleas extendidas cara a cara.");
      }
    } else if (allyComp?.type === "dive") {
      if (userRole === "fer") {
        winConditions.push("Fer: Crashea oleada grande de cañón y salta con Tristana/Lucian cuando Ralph fije al rival.");
        winConditions.push("Fer: Espera resets de kills en escaramuzas limpias.");
      } else if (userRole === "ralph") {
        winConditions.push("Ralph: Nautilus/Thresh inicia con Q o R, fija al carry rival e inicia el dive.");
        winConditions.push("Ralph: Bloquea proyectiles y all-ins enemigos con tu escudo (Braum).");
      } else {
        winConditions.push("Crash de oleada grande con cañón → Dive coordinado bajo torre a nivel 3 o 6.");
        winConditions.push("Tristana salta tras iniciación del Nautilus. Conseguir resets.");
      }
    } else {
      if (userRole === "fer") {
        winConditions.push("Fer: Mantén el farm regular. Mantente seguro usando el halcón de Ashe (E).");
      } else if (userRole === "ralph") {
        winConditions.push("Ralph: Controls la visión del río y trackea al jungla enemigo para proteger a Fer.");
      } else {
        winConditions.push("Farmear eficientemente y mantener el control de visión en arbustos de línea.");
        winConditions.push("Wardear pixel bush 45s antes de dragones y trackea al jungla rival.");
      }
    }

    // Challenger Level 2 Warning
    if (enemyPickedIds.includes("lucian") || enemyPickedIds.includes("tristana")) {
      const enemyHasAggressiveSup = enemyPickedIds.some(id => ["nami", "nautilus", "leona", "pyke"].includes(id));
      if (enemyHasAggressiveSup) {
        winConditions.push("⚠️ TÁCTICA CHALLENGER: El rival tiene un spike de nivel 2 extremadamente agresivo. Cedan la prioridad inicial, absorban oleada bajo torre y eviten muertes.");
      }
    }

    // Visión perpendicular instruction
    if (enemyPickedIds.some(id => ["rengar", "viego", "pyke", "nocturne"].includes(id))) {
      winConditions.push("👁️ CHALLENGER VISION: Colocar wards perpendiculares en la entrada del río a los 2:45 para rastrear flanqueos invisibles o veloces del jungla rival.");
    }

    // Dynamic win probability estimation (iTero Advanced Engine)
    let winProb = 50;
    
    // Add logic based on comfort and counters
    const myPicks = state.side === "blue" ? state.bluePicks : state.redPicks;
    let comfortCount = 0;

    myPicks.forEach(id => {
      if (id) {
        const c = this.getChampionById(id);
        if (c?.isOwnPool) comfortCount++;
      }
    });

    winProb += comfortCount * 3.5;

    // Direct bots synergies checks
    const adcId = myPicks[state.myPickSlots[0]];
    const supId = myPicks[state.myPickSlots[1]];
    if (adcId && supId) {
      const foundDuo = duos.find(d => (d.adcId === adcId && d.supId === supId) || (d.adcId === supId && d.supId === adcId));
      if (foundDuo) {
        winProb += foundDuo.tier === "S+" ? 12 : 9;
        // Special Thresh synergies boost (Jinx, Kai'Sa, Ezreal, Varus)
        if (supId === "thresh" && ["jinx", "kaisa", "ezreal", "varus", "caitlyn"].includes(adcId)) {
          winProb += 4.5; // High coordinate play bonus
        }
      }
    }

    // Damage balance (AD/AP blend)
    if (allyComp && allyComp.adPercentage !== undefined && allyComp.apPercentage !== undefined) {
      const ad = allyComp.adPercentage;
      const ap = allyComp.apPercentage;
      if (ad >= 90 || ap >= 90) {
        winProb -= 6.5; // Single damage type penalty
      } else if (ad >= 35 && ad <= 65) {
        winProb += 3.5; // Perfect hybrid balance bonus
      }
    }

    // Enemy matchup counters
    if (enemyPickedIds.length > 0 && myPicks.filter(Boolean).length > 0) {
      let countersMatched = 0;
      myPicks.filter(Boolean).forEach(myId => {
        const myChamp = this.getChampionById(myId!);
        if (myChamp) {
          enemyPickedIds.forEach(enemyId => {
            if (myChamp.counters?.includes(enemyId) || (enemyId === "caitlyn" && myId === "ashe")) {
              countersMatched++;
            }
          });
        }
      });
      winProb += countersMatched * 3.0;
    }

    // Anti-dive check
    if (enemyComp?.type === "dive" && allyComp?.type === "protect") {
      winProb += 5.0; // Protect beats dive in competitive draft
    } else if (enemyComp?.type === "poke" && allyComp?.type === "dive") {
      winProb += 4.0; // Dive beats poke
    } else if (enemyComp?.type === "protect" && allyComp?.type === "poke") {
      winProb -= 4.0; // Protect mitigates poke
    }

    // Deduct on active warnings
    if (warnings.length > 0 && !warnings[0].includes("despejada") && !warnings[0].includes("Línea despejada")) {
      winProb -= warnings.length * 3.5;
    }

    winProb = Math.round(Math.max(12, Math.min(94, winProb)));

    const currentGankV = this.calculateGankVulnerability(adcId || null, supId || null, enemyPickedIds);
    const topRecCfr = recommendations.length > 0 ? recommendations[0].cfrRegret : 0.15;

    return {
      isMyTurn,
      actionType: currentStep.type,
      recommendations,
      enemyComp,
      allyComp,
      warnings,
      winConditions,
      phase: stepIndex < 6 ? "pick1" : "pick2",
      winProbability: winProb,
      recommendedSummoners: this.computeRecommendedSummoners(adcId, supId, enemyPickedIds),
      gankVulnerability: currentGankV,
      cfrRegretScore: topRecCfr,
      winConditionType: winCondInfo.type,
      winConditionText: winCondInfo.text,
      macroImpactWarning: macroImpact.warning || undefined
    };
  }

  /**
   * Helper that computes recommended summoner spells based on composition matchups
   */
  private computeRecommendedSummoners(adcId: string | null, supId: string | null, enemyPickedIds: string[]): { adc: string[]; sup: string[]; reason: string } {
    let adcSumms = ["Curar", "Flash"];
    let supSumms = ["Ignite (Prender)", "Flash"];
    let reason = "Fase de líneas de composición equilibrada. Hechizos estándar recomendados.";

    if (!adcId && !supId) {
      return { adc: adcSumms, sup: supSumms, reason };
    }

    const hasHeavyEnemyCC = enemyPickedIds.some(id => 
      ["nautilus", "leona", "ashe", "sejuani", "morgana", "rell", "alistar", "blitzcrank", "thresh", "amumu", "galio", "lissandra", "malphite", "skarner", "bard", "lux", "veigar", "zyra", "pantheon", "maokai", "rammus"].includes(id)
    );
    const hasHeavyEnemyHeal = enemyPickedIds.some(id => 
      ["nami", "lulu", "yuumi", "soraka", "milio", "seraphine", "sona", "taric", "nidalee", "swain", "vladimir", "dr. mundo", "drmundo", "volibear", "warwick"].includes(id)
    );
    const hasEnemyAssassin = enemyPickedIds.some(id => 
      ["rengar", "viego", "pyke", "zed", "khazix", "evelynn", "katarina", "fizz", "ekko", "leblanc", "talon", "shaco", "nocturne", "kayn", "briar", "akali", "masteryi", "yone"].includes(id)
    );

    if (hasHeavyEnemyCC) {
      adcSumms = ["Cleanse (Limpiar)", "Flash"];
      reason = "Se recomienda Limpiar en el ADC debido al alto control de masas y stuns enemigos detectados.";
    } else if (hasEnemyAssassin) {
      adcSumms = ["Exhaust (Extenuación)", "Flash"];
      reason = "Se recomienda Extenuación en el ADC para mitigar la ráfaga de daño e interrupción de asesinos móviles.";
    } else if (hasHeavyEnemyHeal) {
      supSumms = ["Ignite (Prender)", "Flash"];
      reason = "Se recomienda Prender en el soporte para aplicar heridas graves a la curación del rival.";
    }

    // Support adjustments
    if (supId) {
      const isUtilityOrPeel = ["lulu", "renata", "braum", "janna"].includes(supId);
      if (isUtilityOrPeel && adcId && ["jinx", "kaisa", "kogmaw"].includes(adcId)) {
        supSumms = ["Exhaust (Extenuación)", "Flash"];
        reason += " Se sugiere Extenuación en el soporte para blindar y dar peel reactivo al tirador de hiper-escalado.";
      } else if (["nautilus", "pyke", "leona"].includes(supId)) {
        supSumms = ["Ignite (Prender)", "Flash"];
        reason += " Además, soporte requiere Prender para maximizar el potencial de muerte rápida nivel 2.";
      }
    }

    return { adc: adcSumms, sup: supSumms, reason };
  }

  /**
   * Generates dynamic DuoData in real-time for any arbitrary ADC + Support combination
   * Highly optimized with professional meta heuristics for millions of drafts (e.g. Ezreal + Thresh)
   */
  public generateDynamicDuo(adcId: string, supId: string): DuoData | null {
    const adc = this.getChampionById(adcId);
    const sup = this.getChampionById(supId);
    if (!adc || !sup) return null;

    const adcTags = adc.tags || [];
    const supTags = sup.tags || [];
    const combinedTags = Array.from(new Set([...adcTags, ...supTags]));

    // 1. Detectar duos competitivos clasicos conocidos que no esten explicitamente en duos.ts
    const comboKey = `${adc.id}-${sup.id}`;
    
    if (comboKey === "ezreal-thresh") {
      return {
        id: comboKey,
        name: "Ezreal + Thresh",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Desenganche y Kiting Seguro",
        tier: "S",
        philosophy: "Línea sumamente elusiva y reactiva. Combina el posicionamiento libre de Ezreal con la salvación instantánea de la Linterna de Thresh.",
        execution: "Ezreal pokea con Qs seguras. Thresh zonea con la amenaza de Q (Sentencia). Si el jungla enemigo ataca, Thresh tira W hacia atrás para sacar a Ezreal de peligro.",
        winCondition: "Mantener neutralidad en fase de líneas sin morir, castigar errores de posicionamiento con ganks del jungla facilitados por Thresh y desgastar antes de teamfights.",
        powerSpikes: [
          "Nivel 2 (Hook chain a larga distancia)",
          "Nivel 6 (Engache con Thresh R + Ezreal R)",
          "2 Items (Ezreal Muramana + Trinity / Thresh Locket)"
        ],
        tags: ["Kiting", "Peel", "Safe", "Poke", "Linterna"],
        coachVerdict: "Línea sumamente elusiva y reactiva. Combina el posicionamiento libre de Ezreal con la salvación instantánea de la Linterna de Thresh. Ideal para mitigar diveadores enemigos.",
        tankMacroDirective: "Rol de Tanque/Peeler reactivo: Prioriza desenganchar con E y W. Thresh no debe comprometerse con Qs ofensivas a menos que sepa la ubicación del jungla rival.",
        lanePositioningPattern: "Triangulación Defensiva: Thresh se posiciona ligeramente por detrás en diagonal para mantener el rango óptimo de linterna.",
        ccChainSequence: "Thresh Q (Sentencia) -> Ezreal AA + Q -> Thresh E (Flay hacia atrás) -> Thresh R (Box) -> Ezreal R"
      };
    }

    if (comboKey === "kaisa-thresh") {
      return {
        id: comboKey,
        name: "Kai'Sa + Thresh",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Dive de Salto de Plasma",
        tier: "S",
        philosophy: "Agresividad en base a control. Los cc prolongados de Thresh cargan marcas de plasma permitiendo que Kai'Sa vuele instantáneamente al combate.",
        execution: "Thresh busca Q/Flay en el carry rival → Aplica marcas → Kai'Sa responde con W + Q y usa R (Instinto Asesino) para reposicionarse detrás y burstear.",
        winCondition: "Bola de nieve en línea. Forzar peleas en 2v2 cerca de paredes y neutralizar objetivos con la ventaja de rango de entrada de Kai'Sa.",
        powerSpikes: [
          "Nivel 2 (Hook + All-In de Plasma)",
          "Nivel 6 (R de Kai'Sa para seguimiento de Hook)",
          "Evolución Q de Kai'Sa (Spike de daño masivo)"
        ],
        tags: ["Burst", "Dive", "Plasma Chain", "Engage"],
        coachVerdict: "Sinergia letal basada en engage. Cada CC de Thresh carga la pasiva de plasma de Kai'Sa permitiendo un burst instantáneo.",
        tankMacroDirective: "Rol de Tanque Engager / Catch: Ralph debe liderar con Sentencia (Q) sobre el carry rival y posicionar la Linterna para que el jungla se sume al burst de forma fluida.",
        lanePositioningPattern: "Paralelismo Ofensivo: Avanzar en la misma línea para responder al hook de Thresh de forma inmediata.",
        ccChainSequence: "Thresh Q -> Kai'Sa W + Q -> Thresh E (Flay hacia atrás) -> Kai'Sa R (detrás del objetivo) -> Thresh R"
      };
    }

    if (comboKey === "ashe-braum") {
      return {
        id: comboKey,
        name: "Ashe + Braum",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Cadena de Aturdimiento Glacial",
        tier: "A+",
        philosophy: "Defensa absoluta y control de masas ininterrumpido. Las ralentizaciones constantes de Ashe facilitan la aplicación del aturdimiento de Braum.",
        execution: "Ashe ataca primero aplicando perma-slow con básicos o W. Braum salta con W + Q aplicando Golpe Conmocionante. Ashe activa Q e inflige stun instantáneo.",
        winCondition: "Bloquear toda agresión enemiga con escudo de Braum y castigar desenganches enemigos lentos con perma-slow e iniciación de Flechas.",
        powerSpikes: [
          "Nivel 1 (Invasiones potentes por pasiva de Braum)",
          "Nivel 6 (R de Ashe + R de Braum lockdown)",
          "2 Items (KRAKEN + LOCKET)"
        ],
        tags: ["Anti-engage", "Peel", "CC Chain", "Glacial"],
        coachVerdict: "Línea de control y aturdimiento glacial absoluto. Las ralentizaciones de Ashe facilitan la aplicación rápida del Golpe Conmocionante.",
        tankMacroDirective: "Rol de Tanque Protector: Conservar la E (Inquebrantable) para mitigar ráfagas y stuns del rival, y usar W para dar armadura y resistencia a Ashe.",
        lanePositioningPattern: "Bloqueo Diagonal Frontal: Braum se interpone entre el proyectil enemigo y Ashe, absorbiendo agresiones mientras ella kitea.",
        ccChainSequence: "Ashe W -> Braum Q (ralentiza) -> Autoataques cruzados (detona stun de Braum) -> Braum R -> Ashe R"
      };
    }

    if (comboKey === "caitlyn-lux") {
      return {
        id: comboKey,
        name: "Caitlyn + Lux",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Asedio y Captura a Larga Distancia",
        tier: "S",
        philosophy: "Castigo y pokeo insoportable bajo torre enemiga. Cadena de inmovilización letal sin riesgo de exposición.",
        execution: "Lux busca Q (Hechizo Luminoso) → Si conecta, Caitlyn deposita trampa W inmediatamente debajo → Burst de Lux (E + R) y Caitlyn Headshot.",
        winCondition: "Demoler todas las placas antes de los 14 minutos negándole farm bajo torre al rival mediante poke.",
        powerSpikes: [
          "Nivel 2 (Lux Q + Caitlyn W combo letal)",
          "Nivel 6 (Lux R + Caitlyn R combo de ejecución)",
          "1.5 Items (Lethality/Crit en Caitlyn + Luden en Lux)"
        ],
        tags: ["Poke", "Asedio", "Cepo Chain", "Range"],
        coachVerdict: "Opresión por rango extremo. Forzar al rival bajo su torre mediante el empuje de oleadas y castigar su retroceso con Lux Q.",
        tankMacroDirective: "Controlador/Enchanter de asedio: Utilizar el escudo (W) para mitigar el agro de los súbditos al hostigar al rival bajo torre.",
        lanePositioningPattern: "Diagonal de asedio: Lux cubre el arbusto medio zonificando con E mientras Caitlyn golpea la torre.",
        ccChainSequence: "Lux Q -> Caitlyn coloca W (Cepo) abajo -> Caitlyn AA -> Lux R -> Caitlyn Q"
      };
    }

    // 2. Inferencia algoritmica inteligente si es un combo arbitrario
    let pillar = "Línea Híbrida Adaptativa";
    let tier = "A";
    let philosophy = "";
    let execution = "";
    let winCondition = "";
    const powerSpikes = [
      "Nivel 2 (Intercambio temprano de habilidades)",
      "Nivel 6 (Encadenamiento de habilidades definitivas)",
      "2 Items (Spike de poder del tirador y utilidad del soporte)"
    ];

    const hasOriginalEngage = supTags.includes("Engage") || supTags.includes("CC") || ["nautilus", "thresh", "leona", "rell", "rakan"].includes(sup.id);
    const hasOriginalPoke = supTags.includes("Poke") || ["karma", "lux", "nami"].includes(sup.id);
    const hasOriginalPeel = supTags.includes("Peel") || supTags.includes("Anti-dive") || ["lulu", "renata", "braum", "janna"].includes(sup.id);

    const adcBurst = adcTags.includes("Burst") || adcTags.includes("All-in") || ["lucian", "tristana", "kaisa", "caitlyn"].includes(adc.id);
    const adcPoke = adcTags.includes("Poke") || adcTags.includes("Range") || ["varus", "ashe", "ezreal", "smolder"].includes(adc.id);
    const adcLate = adcTags.includes("Hypercarry") || adcTags.includes("Scaling") || ["jinx", "kaisa", "vayne", "kogmaw"].includes(adc.id);

    // Campos de Coach de Inferencia Algorítmica
    let coachVerdict = `Línea de sinergia adaptativa. Complementa el rango de ${adc.name} con las capacidades de ${sup.name}.`;
    let tankMacroDirective = `Soporte reactivo: Priorizar asegurar visión en río y usar habilidades de control para desenganchar trades desfavorables.`;
    let lanePositioningPattern = "Posicionamiento en diagonal neutra: Mantener el espacio en el carril sin sobreextenderse.";
    let ccChainSequence = `${sup.name} CC -> ${adc.name} Habilidad principal de daño`;

    // Deducir variables
    if (hasOriginalEngage) {
      tankMacroDirective = `Rol de Tanque Iniciador: Ralph debe buscar el gancho o CC en el carry enemigo si está aislado. Absorber el primer impacto de la oleada.`;
      lanePositioningPattern = "Paralelismo Ofensivo: Avanzar juntos en la línea para capitalizar cualquier control del tanque.";
      ccChainSequence = `${sup.name} CC -> ${adc.name} Ráfaga de Daño`;

      if (adcBurst) {
        pillar = "Iniciación y Ráfaga Explosiva (All-In)";
        tier = "S";
        philosophy = `Sinergia ofensiva brutal. Aprovecha el control pesado de ${sup.name} para asestar todo el daño en ráfaga de ${adc.name} al instante.`;
        execution = `Fase de líneas: Acumular oleada corta y buscar el choque de nivel 2 o 3. ${sup.name} inicia con CC y ${adc.name} desgasta la barra de vida rival rápidamente. Forzar flashes tempranos.`;
        winCondition = `Dominar los asesinatos en línea para conseguir placas e invadir la jungla enemiga con prioridad.`;
        coachVerdict = `Línea de all-in muy fuerte. Ralph debe forzar el ritmo del combate al nivel 2. Fer debe seguir con todo su daño al instante.`;
      } else if (adcLate) {
        pillar = "Iniciación y Escalado Protegido";
        tier = "A+";
        philosophy = `Línea equilibrada de control. ${sup.name} actúa como disuasor principal para mantener a salvo a ${adc.name} mientras acumula súbditos de cara al juego tardío.`;
        execution = `Fase de líneas: Priorizar farm estable. Solo iniciar si el oponente comete un error grave de posicionamiento cerca de tu torre. Mantener al tirador a salvo.`;
        winCondition = `Asegurar farm alto y ganar peleas por objetivos grupales en el río a base de control de masas frontal.`;
        coachVerdict = `Iniciación defensiva. Ralph solo debe buscar pelear si el oponente se sobreextiende cerca de la torre. Priorizar el farm de ${adc.name}.`;
      } else {
        pillar = "Control y Desgaste Híbrido";
        tier = "A";
        philosophy = `Línea adaptativa basada en picks rápidos. Combina la iniciación de ${sup.name} con las respuestas de medio alcance de ${adc.name}.`;
        execution = `Buscar castigar al soporte enemigo frágil mediante iniciaciones desde arbustos ciegos usando baratijas de visión.`;
        winCondition = `Capturar carries en la transición de río y neutralizar la botlane mediante control de visión.`;
      }
    } else if (hasOriginalPoke) {
      lanePositioningPattern = "Diagonal en V Abierta: Dividir los ángulos de pokeo para desgastar al rival continuamente.";
      tankMacroDirective = `Soporte de Poke: Hostigar con habilidades de rango sin comprometer el posicionamiento. Evitar all-ins enemigos.`;
      ccChainSequence = `${sup.name} Ralentización/Poke -> ${adc.name} Habilidad de largo rango`;

      if (adcPoke) {
        pillar = "Asedio Lineal y Poke Sostenido";
        tier = "S-";
        philosophy = `Control por distancia y opresión. Mantiene al rival bajo su torre debido al daño incesante infligido a rango máximo por ambos campeones.`;
        execution = `Fase de líneas: Disparar constantemente habilidades sobre el tirador rival cuando vaya a dar el último golpe. Empujar oleadas rápido para golpear placas.`;
        winCondition = `Reducir la vida enemiga al 30% antes de dragones para denegar su entrada y demoler estructuras por presión de asedio.`;
        coachVerdict = `Poke incesante. Mantener la oleada empujada. Ralph y Fer deben pokear en diagonal para negar esquives fáciles del rival.`;
      } else if (adcBurst) {
        pillar = "Desgaste y Remate Agresivo";
        tier = "A+";
        philosophy = `Línea de desgaste estratégico. ${sup.name} reduce la vida enemiga lentamente hasta que entran en rango de ejecución de ${adc.name}.`;
        execution = `Hostigar con habilidades a distancia segura. Una vez el rival baje de la mitad de la barra de vida, ${adc.name} inicia con un salto o ráfaga para liquidar.`;
        winCondition = `Expulsar al rival de línea repetidamente provocando pérdida masiva de experiencia y oro.`;
        coachVerdict = `Desgaste previo. Ralph baja la vida del rival. Fer busca el remate letal en niveles 3 y 6.`;
      } else {
        pillar = "Opresión y Zonificación";
        tier = "A";
        philosophy = `Espaciamiento defensivo con rango. Limita la toma de decisiones enemiga zonificando las entradas al carril inferior.`;
        execution = `Establecer trampas o proyectiles para forzar movimientos incómodos del rival y ganar prioridad de empuje constante.`;
        winCondition = `Conseguir ventajas sustanciales de placas de torre y rotar al carril central de forma segura.`;
      }
    } else if (hasOriginalPeel) {
      lanePositioningPattern = "Triangulación Defensiva: Soporte un paso detrás del carry listo para mitigar el engage rival.";
      tankMacroDirective = `Soporte Protector: Guardar los escudos o CC de desenganche para cuando el enemigo inicie su all-in.`;
      ccChainSequence = `Enemigo Engage -> ${sup.name} Desenganche/Peel -> ${adc.name} Kiteo hacia atrás`;

      if (adcLate) {
        pillar = "Hiperescalado Defensivo";
        tier = "S";
        philosophy = `Seguro de vida de late game. Blindaje absoluto para ${adc.name} potenciando su velocidad, escudos y curaciones.`;
        execution = `Fase de líneas: Jugar de forma conservadora. ${sup.name} guarda habilidades clave para mitigar iniciaciones enemigas (peel reactivo). ${adc.name} solo asesta last-hits.`;
        winCondition = `Mantener al tirador con 0 muertes y farm perfecto hasta conseguir sus objetos clave y destruir teamfights 5v5.`;
        powerSpikes[2] = "3 Items (Hiperescalado desbloqueado)";
        coachVerdict = `Escalado blindado. Jugar de forma conservadora. Ralph protege de forma reactiva y Fer asegura farm perfecto sin arriesgar.`;
      } else {
        pillar = "Kiteo y Supervivencia Adaptativa";
        tier = "A";
        philosophy = `Sinergia de desgaste seguro. Enfocada en repeler asaltos y permitir que el tirador se reposicione continuamente.`;
        execution = `Mantener la línea en un estado neutro, castigando las entradas agresivas del oponente y conservando el maná para el juego medio.`;
        winCondition = `Resistir la presión del rival en fases tempranas y brillar en las escaramuzas de mid game por mejor posicionamiento.`;
      }
    }

    return {
      id: comboKey,
      name: `${adc.name} + ${sup.name}`,
      adcId: adc.id,
      supId: sup.id,
      adcDdragonKey: adc.ddragonKey,
      supDdragonKey: sup.ddragonKey,
      pillar,
      tier,
      philosophy,
      execution,
      winCondition,
      powerSpikes,
      tags: combinedTags,
      coachVerdict,
      tankMacroDirective,
      lanePositioningPattern,
      ccChainSequence
    };
  }
}
