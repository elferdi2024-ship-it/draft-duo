// filepath: src/store/draft-store.ts
"use client";

import { create } from "zustand";
import type { LiveDraftState, BrainAnalysis, ChampionData, UserRole } from "@/lib/types";
import { DRAFT_ORDER } from "@/lib/types";
import { CompetitiveBrain } from "@/lib/draft-engine";
import { loadAllChampions } from "@/lib/data-loader";

interface DraftStore {
  // States
  side: "blue" | "red" | null;
  currentStepIndex: number;
  blueBans: (string | null)[];
  redBans: (string | null)[];
  bluePicks: (string | null)[];
  redPicks: (string | null)[];
  myPickSlots: [number, number]; // Pick order indices (0-4) for ADC and Support on our team
  history: { stepIndex: number; championId: string | null; previousIndex: number }[];
  isComplete: boolean;
  allChampions: ChampionData[];
  brainAnalysis: BrainAnalysis | null;
  loading: boolean;
  searchQuery: string;
  activeRoleFilter: string; // 'All' | 'Top' | 'Jungle' | 'Mid' | 'ADC' | 'Support'
  userRole: UserRole | null;
  selectedBanSlot: { team: "blue" | "red"; index: number } | null;
  isBridgeConnected: boolean;
  bridgeSocket: WebSocket | null;
  selectedDetailChampId: string | null;
  toast: { message: string; type: "success" | "warning" | "error" } | null;
  draftState: {
    currentStepIndex: number;
    macroPhase: string;
    isOurTurn: boolean;
    currentActionType: string | null;
    remainingEnemyPicks: number;
    isLastPick: boolean;
    isEnemyBotLaneClosed: boolean;
  } | null;
  winProbability: number;
  hasSavedSnapshot: boolean;

  // Actions
  loadChampions: () => Promise<void>;
  initDraft: (side: "blue" | "red", mySlots?: [number, number]) => void;
  setChampion: (championId: string) => void;
  undo: () => void;
  reset: () => void;
  setSearchQuery: (query: string) => void;
  setRoleFilter: (role: string) => void;
  setUserRole: (role: UserRole | null) => void;
  setSelectedBanSlot: (slot: { team: "blue" | "red"; index: number } | null) => void;
  setSelectedDetailChampId: (id: string | null) => void;
  autoFillBans: () => void;
  recalculateBrain: () => void;
  connectBridge: () => void;
  disconnectBridge: () => void;
  exportRunes: (championId: string, buildTitle: string) => void;
  showToast: (message: string, type: "success" | "warning" | "error") => void;
  clearToast: () => void;
}

const initialDraftState = {
  side: null,
  currentStepIndex: 0,
  blueBans: Array(5).fill(null),
  redBans: Array(5).fill(null),
  bluePicks: Array(5).fill(null),
  redPicks: Array(5).fill(null),
  myPickSlots: [3, 4] as [number, number], // Default: last two picks (picks 4 and 5)
  history: [],
  isComplete: false,
  brainAnalysis: null,
  searchQuery: "",
  activeRoleFilter: "All",
  userRole: null,
  selectedBanSlot: null,
  isBridgeConnected: false,
  bridgeSocket: null,
  selectedDetailChampId: null,
  toast: null,
  draftState: null,
  winProbability: 50,
  hasSavedSnapshot: false,
};

export const useDraftStore = create<DraftStore>((set, get) => ({
  ...initialDraftState,
  allChampions: [],
  loading: false,

  loadChampions: async () => {
    set({ loading: true });
    try {
      const champions = await loadAllChampions();
      const savedRole = typeof window !== 'undefined' ? localStorage.getItem("userRole") as UserRole | null : null;
      set({ allChampions: champions, loading: false, userRole: savedRole });
      get().recalculateBrain();
    } catch (e) {
      console.error("Failed to load champions in store", e);
      set({ loading: false });
    }
  },

  initDraft: (side, mySlots = [3, 4]) => {
    const { userRole } = get();
    set({
      ...initialDraftState,
      side,
      myPickSlots: mySlots,
      userRole, // Keep userRole intact
      hasSavedSnapshot: false,
    });
    get().recalculateBrain();
  },

  setChampion: (championId) => {
    const { selectedBanSlot, blueBans, redBans, currentStepIndex, bluePicks, redPicks, history } = get();

    // If there is an active ban slot selected, set that ban instead of a pick
    if (selectedBanSlot) {
      const newBans = selectedBanSlot.team === "blue" ? [...blueBans] : [...redBans];
      newBans[selectedBanSlot.index] = championId;

      if (selectedBanSlot.team === "blue") {
        set({ blueBans: newBans, selectedBanSlot: null, searchQuery: "" });
      } else {
        set({ redBans: newBans, selectedBanSlot: null, searchQuery: "" });
      }
      get().recalculateBrain();
      return;
    }

    if (currentStepIndex >= DRAFT_ORDER.length) return;

    const step = DRAFT_ORDER[currentStepIndex];
    const newBluePicks = [...bluePicks];
    const newRedPicks = [...redPicks];

    // Record previous value for history
    let previousValue: string | null = null;

    if (step.team === "blue") {
      previousValue = newBluePicks[step.index];
      newBluePicks[step.index] = championId;
    } else {
      previousValue = newRedPicks[step.index];
      newRedPicks[step.index] = championId;
    }

    const nextStepIndex = currentStepIndex + 1;
    const isComplete = nextStepIndex >= DRAFT_ORDER.length;

    // Save to history
    const newHistory = [
      ...history,
      { stepIndex: currentStepIndex, championId, previousIndex: currentStepIndex },
    ];

    set({
      bluePicks: newBluePicks,
      redPicks: newRedPicks,
      currentStepIndex: nextStepIndex,
      isComplete,
      history: newHistory,
      searchQuery: "", // Clear search query after pick
    });

    get().recalculateBrain();
  },

  undo: () => {
    const { history, bluePicks, redPicks } = get();
    if (history.length === 0) return;

    const newHistory = [...history];
    const lastAction = newHistory.pop()!;
    const prevStepIndex = lastAction.stepIndex;

    const step = DRAFT_ORDER[prevStepIndex];
    const newBluePicks = [...bluePicks];
    const newRedPicks = [...redPicks];

    if (step.team === "blue") {
      newBluePicks[step.index] = null;
    } else {
      newRedPicks[step.index] = null;
    }

    set({
      bluePicks: newBluePicks,
      redPicks: newRedPicks,
      currentStepIndex: prevStepIndex,
      isComplete: false,
      history: newHistory,
    });

    get().recalculateBrain();
  },

  reset: () => {
    set({
      ...initialDraftState,
      side: null, // Permite reconfigurar el lado y el orden de picks al reiniciar
      hasSavedSnapshot: false,
    });
    get().recalculateBrain();
  },

  setSearchQuery: (query) => {
    set({ searchQuery: query });
  },

  setRoleFilter: (role) => {
    set({ activeRoleFilter: role });
  },

  setUserRole: (role) => {
    if (typeof window !== 'undefined' && role) {
      localStorage.setItem("userRole", role);
    } else if (typeof window !== 'undefined') {
      localStorage.removeItem("userRole");
    }
    const activeRoleFilter = role === "fer" ? "ADC" : role === "ralph" ? "Support" : "All";
    set({ userRole: role, activeRoleFilter });
    get().recalculateBrain();
  },

  setSelectedBanSlot: (slot) => {
    set({ selectedBanSlot: slot });
  },

  setSelectedDetailChampId: (id) => {
    set({ selectedDetailChampId: id });
  },

  autoFillBans: () => {
    set({
      blueBans: ["senna", "caitlyn", "rakan", "lulu", "ashe"],
      redBans: ["senna", "caitlyn", "rakan", "lulu", "ashe"],
      selectedBanSlot: null,
    });
    get().recalculateBrain();
  },

  recalculateBrain: () => {
    const { side, currentStepIndex, blueBans, redBans, bluePicks, redPicks, myPickSlots, history, isComplete, allChampions, userRole, draftState } = get();

    // Create current state snapshot matching LiveDraftState
    const stateSnapshot: LiveDraftState = {
      side,
      currentStepIndex,
      blueBans,
      redBans,
      bluePicks,
      redPicks,
      myPickSlots,
      history: history.map(h => ({ stepIndex: h.stepIndex, championId: h.championId || "" })),
      isComplete,
      draftState: draftState || undefined
    };

    const brain = new CompetitiveBrain(allChampions);
    const analysis = brain.analyze(stateSnapshot, userRole);

    const allyPicks = (side === "blue" ? bluePicks : redPicks).filter((id): id is string => !!id);
    const enemyPicks = (side === "blue" ? redPicks : bluePicks).filter((id): id is string => !!id);
    const winProbability = brain.calculateWinProbability(allyPicks, enemyPicks);

    set({ brainAnalysis: analysis, winProbability });

    const isFinished = isComplete || (draftState && draftState.macroPhase === "FINISHED");
    const hasPicks = allyPicks.length > 0 || enemyPicks.length > 0;
    const { hasSavedSnapshot } = get();

    if (isFinished && hasPicks && !hasSavedSnapshot) {
      set({ hasSavedSnapshot: true });
      const snapshot = {
        id: `draft_${Date.now()}`,
        timestamp: Date.now(),
        allyPicks: allyPicks,
        enemyPicks: enemyPicks,
        allyBans: (side === 'blue' ? blueBans : redBans).filter((id): id is string => !!id),
        enemyBans: (side === 'blue' ? redBans : blueBans).filter((id): id is string => !!id),
        predictedWinProbability: winProbability,
        vgScore: analysis.gankVulnerability ?? 5.0,
        cfrScore: analysis.cfrRegretScore ?? 0.05,
        winCondition: analysis.winConditionText || "Default win condition",
      };

      import("@/lib/analytics-db").then(({ saveSnapshot }) => {
        saveSnapshot(snapshot)
          .then(() => {
            console.log("[Store] Draft snapshot saved to IndexedDB.");
            get().showToast("📊 Draft guardado en el historial de Post-Mortem.", "success");
          })
          .catch(err => {
            console.error("[Store] Error saving draft snapshot:", err);
            get().showToast("❌ Error al guardar draft en historial.", "error");
          });
      });
    }
  },

  connectBridge: () => {
    const { bridgeSocket } = get();
    if (bridgeSocket) return;

    try {
      console.log("[Store] Conectando con el LCU Bridge local...");
      const socket = new WebSocket("ws://localhost:3015");

      socket.onopen = () => {
        console.log("[Store] LCU Bridge conectado.");
        set({ isBridgeConnected: true });
      };

      socket.onmessage = (event: MessageEvent<string>) => {
        try {
          interface DraftUpdateMessage {
            type: "DRAFT_UPDATE";
            data: {
              side: "blue" | "red";
              bluePicks: (string | null)[];
              redPicks: (string | null)[];
              blueBans: (string | null)[];
              redBans: (string | null)[];
              currentStepIndex: number;
              isComplete: boolean;
              draftState: {
                currentStepIndex: number;
                macroPhase: string;
                isOurTurn: boolean;
                currentActionType: string | null;
                remainingEnemyPicks: number;
                isLastPick: boolean;
                isEnemyBotLaneClosed: boolean;
              } | null;
            };
          }

          interface RunesExportedMessage {
            type: "RUNES_EXPORTED";
            data: {
              simulated: boolean;
              championName: string;
            };
          }

          type BridgeMessage = DraftUpdateMessage | RunesExportedMessage;

          const payload = JSON.parse(event.data) as BridgeMessage;
          if (payload.type === "DRAFT_UPDATE") {
            const { side, bluePicks, redPicks, blueBans, redBans, currentStepIndex, isComplete, draftState } = payload.data;
            
            set({
              side,
              bluePicks,
              redPicks,
              blueBans,
              redBans,
              currentStepIndex,
              isComplete,
              draftState: draftState || null,
            });

            get().recalculateBrain();
          } else if (payload.type === "RUNES_EXPORTED") {
            const { simulated, championName } = payload.data;
            if (simulated) {
              get().showToast(
                `⚠️ Exportación simulada para ${championName}. Inicia League of Legends para configurar las runas en el cliente oficial.`,
                "warning"
              );
            } else {
              get().showToast(
                `✅ Runas para ${championName} exportadas exitosamente al cliente de LoL.`,
                "success"
              );
            }
          }
        } catch (err) {
          const errMsg = err instanceof Error ? err.message : String(err);
          console.error("[Store] Error al parsear mensaje de LCU Bridge:", errMsg);
        }
      };

      socket.onclose = () => {
        console.log("[Store] LCU Bridge desconectado.");
        set({ isBridgeConnected: false, bridgeSocket: null });
      };

      socket.onerror = () => {
        set({ isBridgeConnected: false });
      };

      set({ bridgeSocket: socket });
    } catch (e) {
      const errMsg = e instanceof Error ? e.message : String(e);
      console.error("[Store] Error al conectar con LCU Bridge:", errMsg);
      set({ isBridgeConnected: false, bridgeSocket: null });
    }
  },

  disconnectBridge: () => {
    const { bridgeSocket } = get();
    if (bridgeSocket) {
      try {
        bridgeSocket.close();
      } catch (e) {}
      set({ bridgeSocket: null, isBridgeConnected: false });
    }
  },

  exportRunes: (championId: string, buildTitle: string) => {
    const { bridgeSocket, isBridgeConnected, allChampions } = get();
    const champ = allChampions.find(c => c.id === championId);
    const championName = champ ? champ.name : championId;

    if (isBridgeConnected && bridgeSocket && bridgeSocket.readyState === 1) {
      console.log(`[Store] Enviando EXPORT_RUNES para ${championName} (${buildTitle})`);
      bridgeSocket.send(JSON.stringify({
        type: "EXPORT_RUNES",
        data: { championName, buildTitle }
      }));
    } else {
      get().showToast(
        `⚠️ Exportación simulada para ${championName}. Inicia League of Legends para configurar las runas en el cliente oficial.`,
        "warning"
      );
    }
  },

  showToast: (message, type) => {
    set({ toast: { message, type } });
    setTimeout(() => {
      const currentToast = get().toast;
      if (currentToast && currentToast.message === message) {
        get().clearToast();
      }
    }, 6000);
  },

  clearToast: () => {
    set({ toast: null });
  },
}));
