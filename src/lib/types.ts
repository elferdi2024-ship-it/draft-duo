// filepath: src/lib/types.ts

// ============================================
// Champion Types
// ============================================

export type ChampionRole = 'ADC' | 'Support' | 'Top' | 'Jungle' | 'Mid' | 'Tank Support' | 'Mage Support' | 'Enchanter Support' | 'Pure Enchanter';

export type LearningStatus = 'mastered' | 'learning' | 'backup';

export type UserRole = 'fer' | 'ralph';

export interface ChampionData {
  id: string;
  name: string;
  ddragonKey: string;
  role: ChampionRole;
  roles?: ChampionRole[];
  tier?: string;
  tags?: string[];
  philosophy?: string;
  pickWhen?: string;
  synergies?: string[];
  winCondition?: string;
  powerSpikes?: string[];
  counters?: string[];
  learningStatus?: LearningStatus;
  isOwnPool?: boolean;
}

// ============================================
// Duo Types
// ============================================

export interface DuoData {
  id: string;
  name: string;
  adcId: string;
  supId: string;
  adcDdragonKey: string;
  supDdragonKey: string;
  pillar: string;
  tier: string;
  philosophy: string;
  execution: string;
  winCondition: string;
  powerSpikes: string[];
  tags: string[];
  // Campos de Analítica de Coach Profesional (Especialmente para Tanques)
  coachVerdict?: string;
  tankMacroDirective?: string;
  lanePositioningPattern?: string;
  ccChainSequence?: string;
}


// ============================================
// Build Types
// ============================================

export interface RuneData {
  primary: {
    tree: string;
    keystone: string;
    runes: string[];
  };
  secondary: {
    tree: string;
    runes: string[];
  };
  shards: string[];
}

export interface BuildData {
  championId: string;
  title: string;
  runes: RuneData;
  items: string[];
  situationalItems?: string[];
  skillOrder: string;
  summonerSpells: string[];
  notes?: string;
}

// ============================================
// Matchup Types
// ============================================

export interface DecisionNode {
  question: string;
  yes: string | DecisionNode;
  no: string | DecisionNode;
}

export interface MatchupDetail {
  id: string;
  ourDuo: string;
  enemyDuo: string;
  difficulty: 'HARD' | 'MEDIUM' | 'FREE';
  problem: string;
  decisionTrees: DecisionNode[];
  itemsSpecific: string;
  winCondition: string;
}

// ============================================
// Setup Timeline Types
// ============================================

export interface SetupCheckpoint {
  time: string;
  title: string;
  actions: string[];
  decision?: {
    condition: string;
    ifTrue: string;
    ifFalse: string;
  };
}

export interface SetupTimeline {
  duoId: string;
  name: string;
  checkpoints: SetupCheckpoint[];
}

// ============================================
// Draft Types
// ============================================

export type DraftTeam = 'blue' | 'red';
export type DraftActionType = 'ban' | 'pick';

export interface DraftPhaseStep {
  team: DraftTeam;
  type: DraftActionType;
  index: number;
  label: string;
}

/** The 10-step pick sequence used in draft simulation (Bans are selected simultaneously beforehand) */
export const DRAFT_ORDER: DraftPhaseStep[] = [
  { team: 'blue', type: 'pick', index: 0, label: 'Pick Azul 1' },
  { team: 'red', type: 'pick', index: 0, label: 'Pick Rojo 1' },
  { team: 'red', type: 'pick', index: 1, label: 'Pick Rojo 2' },
  { team: 'blue', type: 'pick', index: 1, label: 'Pick Azul 2' },
  { team: 'blue', type: 'pick', index: 2, label: 'Pick Azul 3' },
  { team: 'red', type: 'pick', index: 2, label: 'Pick Rojo 3' },
  { team: 'red', type: 'pick', index: 3, label: 'Pick Rojo 4' },
  { team: 'blue', type: 'pick', index: 3, label: 'Pick Azul 4' },
  { team: 'blue', type: 'pick', index: 4, label: 'Pick Azul 5' },
  { team: 'red', type: 'pick', index: 4, label: 'Pick Rojo 5' },
];

export interface LiveDraftState {
  side: DraftTeam | null;
  currentStepIndex: number;
  blueBans: (string | null)[];
  redBans: (string | null)[];
  bluePicks: (string | null)[];
  redPicks: (string | null)[];
  myPickSlots: [number, number];
  history: { stepIndex: number; championId: string }[];
  isComplete: boolean;
  draftState?: {
    currentStepIndex: number;
    macroPhase: string;
    isOurTurn: boolean;
    currentActionType: string | null;
    remainingEnemyPicks: number;
    isLastPick: boolean;
    isEnemyBotLaneClosed: boolean;
  };
}

// ============================================
// Brain Types
// ============================================

export interface ChampionScore {
  counter: number;
  synergy: number;
  meta: number;
  comfort: number;
  comp: number;
}

export interface BrainRecommendation {
  championId: string;
  championName: string;
  ddragonKey: string;
  totalScore: number;
  scores: ChampionScore;
  reasoning: string;
  tag: 'BEST_PICK' | 'SAFE_PICK' | 'COMFORT_PICK' | 'COUNTER_PICK' | 'PRIORITY_BAN' | 'VALUE_BAN';
  cfrRegret?: number;
  gankVulnerability?: number;
  hasAffinityBonus?: boolean;
}

export type CompType = 'dive' | 'poke' | 'scaling' | 'engage' | 'balanced' | 'pick' | 'protect' | 'unknown';

export interface CompAnalysis {
  type: CompType;
  strengths: string[];
  weaknesses: string[];
  apPercentage?: number;
  adPercentage?: number;
  trueDamage?: number;
  scalingScore?: number;
}

export interface BrainAnalysis {
  isMyTurn: boolean;
  actionType: DraftActionType;
  recommendations: BrainRecommendation[];
  enemyComp: CompAnalysis | null;
  allyComp: CompAnalysis | null;
  warnings: string[];
  winConditions: string[];
  phase: 'ban1' | 'pick1' | 'ban2' | 'pick2' | 'complete';
  winProbability?: number;
  recommendedSummoners?: { adc: string[]; sup: string[]; reason: string };
  gankVulnerability?: number;
  cfrRegretScore?: number;
  winConditionType?: 'EARLY_DOMINANCE' | 'MACRO_CONTROL' | 'LATE_GAME_INSURANCE';
  winConditionText?: string;
  macroImpactWarning?: string;
}


// ============================================
// Legacy compat
// ============================================

export interface MatchupInfo {
  difficulty: 'HARD' | 'MEDIUM' | 'FREE';
  problem: string;
  solution: string;
  itemsSpecific?: string;
}

export interface BanRecommendation {
  name: string;
  ddragonKey?: string;
  reason: string;
}

export interface DuoRecommendation {
  duoId: string;
  priority: number;
  reason: string;
}

export interface DraftRecommendation {
  bans: BanRecommendation[];
  duos: DuoRecommendation[];
}
