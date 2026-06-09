// filepath: src/components/draft/draft-page-client.tsx
"use client";

import { useState, useEffect } from "react";
import DraftBoard from "./draft-board";
import BrainPanel from "./brain-panel";
import { useDraftStore } from "@/store/draft-store";
import { useShallow } from "zustand/react/shallow";
import ChampionDetailDrawer from "./champion-detail-drawer";
import { getLatestVersion } from "@/lib/ddragon";
import { AnimatePresence } from "framer-motion";

export default function DraftPageClient() {
  const [activeTab, setActiveTab] = useState<"draft" | "brain">("draft");
  const [version, setVersion] = useState("15.11.1");
  
  const { 
    selectedDetailChampId, 
    setSelectedDetailChampId, 
    allChampions, 
    brainAnalysis, 
    setChampion, 
    isComplete,
    isBridgeConnected,
    connectBridge,
    disconnectBridge
  } = useDraftStore(
    useShallow((state) => ({
      selectedDetailChampId: state.selectedDetailChampId,
      setSelectedDetailChampId: state.setSelectedDetailChampId,
      allChampions: state.allChampions,
      brainAnalysis: state.brainAnalysis,
      setChampion: state.setChampion,
      isComplete: state.isComplete,
      isBridgeConnected: state.isBridgeConnected,
      connectBridge: state.connectBridge,
      disconnectBridge: state.disconnectBridge,
    }))
  );

  useEffect(() => {
    getLatestVersion().then(setVersion);
    connectBridge();
    return () => {
      disconnectBridge();
    };
  }, [connectBridge, disconnectBridge]);

  const selectedChampData = allChampions.find(c => c.id === selectedDetailChampId) || null;
  const isMyTurn = brainAnalysis ? brainAnalysis.isMyTurn : false;

  return (
    <div className="flex flex-col gap-4 relative lg:flex-1 lg:min-h-0 lg:overflow-hidden">
      {/* LCU Auto-Sync Status Bar */}
      <div className={`flex items-center justify-between px-4 py-2 border rounded-sm transition-all text-xs font-bold uppercase tracking-wider shadow-md shrink-0 ${
        isBridgeConnected
          ? "bg-emerald-950/20 border-emerald-500/40 text-emerald-400"
          : "bg-rose-950/20 border-rose-500/40 text-rose-400 animate-pulse"
      }`}>
        <div className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-full ${isBridgeConnected ? "bg-emerald-500" : "bg-rose-500"}`} />
          <span>{isBridgeConnected ? "🟢 Sincronizado con LoL Client" : "🔴 Esperando conexión LCU"}</span>
        </div>
        {!isBridgeConnected && (
          <span className="text-[10px] text-rose-400/75 normal-case font-normal hidden sm:inline-block">
            Inicia el juego y el bridge local para rellenar los datos automáticamente en tiempo real.
          </span>
        )}
      </div>
      {/* Mobile Tab Switcher */}
      <div className="flex lg:hidden border border-[#785a28] bg-[#091420] rounded p-1 gap-1 shadow-sm">
        <button
          onClick={() => setActiveTab("draft")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all text-center cursor-pointer ${
            activeTab === "draft"
              ? "bg-[#0a1428] text-[#f0e6d3] border border-[#c8aa6e]/30 shadow-sm"
              : "text-[#8a9dae] hover:bg-[#1e232a]/50"
          }`}
        >
          🎮 Simulador
        </button>
        <button
          onClick={() => setActiveTab("brain")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all text-center cursor-pointer ${
            activeTab === "brain"
              ? "bg-[#0a1428] text-[#f0e6d3] border border-[#c8aa6e]/30 shadow-sm"
              : "text-[#8a9dae] hover:bg-[#1e232a]/50"
          }`}
        >
          🧠 Asistente AI
        </button>
      </div>

      {/* Interactive layout grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch lg:flex-1 lg:min-h-0 lg:overflow-hidden">
        {/* Main interactive draft board */}
        <div className={activeTab === "draft" ? "block lg:block lg:col-span-8 lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden" : "hidden lg:block lg:col-span-8 lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden"}>
          <DraftBoard />
        </div>

        {/* Real-time assistant AI sidebar */}
        <div className={activeTab === "brain" ? "block lg:block lg:col-span-4 lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden" : "hidden lg:block lg:col-span-4 lg:h-full lg:min-h-0 lg:flex lg:flex-col lg:overflow-hidden"}>
          <BrainPanel />
        </div>
      </div>

      {/* Champion Info Slide-in Drawer */}
      <AnimatePresence>
        {selectedChampData && (
          <ChampionDetailDrawer
            champion={selectedChampData}
            onClose={() => setSelectedDetailChampId(null)}
            onSelect={setChampion}
            isMyTurn={!isComplete}
            version={version}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
