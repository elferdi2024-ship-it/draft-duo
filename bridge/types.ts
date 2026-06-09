export interface LCUAction {
  id: number;
  type: 'pick' | 'ban';
  completed: boolean;
  isInProgress: boolean;
  teamId: number;
  championId: number;
  actorCellId: number;
}

export interface LCUSession {
  localPlayerCellId: number;
  actions: LCUAction[][];
  timer: {
    adjustedTimeLeftInPhase: number;
    phase: string;
  };
  myTeam: { championId: number; cellId: number }[];
  theirTeam: { championId: number; cellId: number }[];
  bans: {
    myTeamBans: number[];
    theirTeamBans: number[];
  };
}

export interface AdvancedDraftState {
  macroPhase: 'PLANNING' | 'BAN_PHASE_1' | 'PICK_PHASE_1' | 'BAN_PHASE_2' | 'PICK_PHASE_2' | 'FINISHED';
  isOurTurn: boolean;
  currentActionType: 'pick' | 'ban' | null;
  remainingEnemyPicks: number;
  isLastPick: boolean;
  isEnemyBotLaneClosed: boolean;
  currentStepIndex: number;
}

export interface OutgoingDraftUpdatePayload {
  type: "DRAFT_UPDATE";
  data: {
    side: "blue" | "red";
    bluePicks: (string | null)[];
    redPicks: (string | null)[];
    blueBans: (string | null)[];
    redBans: (string | null)[];
    currentStepIndex: number;
    isComplete: boolean;
    draftState: AdvancedDraftState;
  };
}

export interface OutgoingRunesExportedPayload {
  type: "RUNES_EXPORTED";
  data: {
    success: boolean;
    championName: string;
    buildTitle: string;
    simulated: boolean;
  };
}

export type OutgoingBridgePayload = OutgoingDraftUpdatePayload | OutgoingRunesExportedPayload;
