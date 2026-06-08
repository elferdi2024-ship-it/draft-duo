// filepath: src/components/draft/draft-page-client.tsx
"use client";

import { useState, useEffect } from "react";
import DraftBoard from "./draft-board";
import BrainPanel from "./brain-panel";
import { useDraftStore } from "@/store/draft-store";
import ChampionDetailDrawer from "./champion-detail-drawer";
import { getLatestVersion } from "@/lib/ddragon";
import { AnimatePresence } from "framer-motion";

export default function DraftPageClient() {
  const [activeTab, setActiveTab] = useState<"draft" | "brain">("draft");
  const [version, setVersion] = useState("15.11.1");
  const { selectedDetailChampId, setSelectedDetailChampId, allChampions, brainAnalysis, setChampion, isComplete } = useDraftStore();

  useEffect(() => {
    getLatestVersion().then(setVersion);
  }, []);

  const selectedChampData = allChampions.find(c => c.id === selectedDetailChampId) || null;
  const isMyTurn = brainAnalysis ? brainAnalysis.isMyTurn : false;

  return (
    <div className="flex flex-col gap-4 relative lg:flex-1 lg:min-h-0 lg:overflow-hidden">
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
