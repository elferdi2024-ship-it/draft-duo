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
  bridgeSocket: any;
  selectedDetailChampId: string | null;

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
    set({ userRole: role });
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
    const { side, currentStepIndex, blueBans, redBans, bluePicks, redPicks, myPickSlots, history, isComplete, allChampions, userRole } = get();

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
    };

    const brain = new CompetitiveBrain(allChampions);
    const analysis = brain.analyze(stateSnapshot, userRole);

    set({ brainAnalysis: analysis });
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

      socket.onmessage = (event) => {
        try {
          const payload = JSON.parse(event.data);
          if (payload.type === "DRAFT_UPDATE") {
            const { side, bluePicks, redPicks, blueBans, redBans, currentStepIndex, isComplete } = payload.data;
            
            set({
              side,
              bluePicks,
              redPicks,
              blueBans,
              redBans,
              currentStepIndex,
              isComplete,
            });

            get().recalculateBrain();
          }
        } catch (err) {
          console.error("[Store] Error al parsear mensaje de LCU Bridge:", err);
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
      console.error("[Store] Error al conectar con LCU Bridge:", e);
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
}));
