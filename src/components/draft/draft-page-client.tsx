// filepath: src/components/draft/draft-page-client.tsx
"use client";

import { useState } from "react";
import DraftBoard from "./draft-board";
import BrainPanel from "./brain-panel";

export default function DraftPageClient() {
  const [activeTab, setActiveTab] = useState<"draft" | "brain">("draft");

  return (
    <div className="flex flex-col gap-5">
      {/* Mobile Tab Switcher */}
      <div className="flex xl:hidden border border-[#785a28] bg-[#091420] rounded p-1 gap-1 shadow-sm">
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
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Main interactive draft board */}
        <div className={activeTab === "draft" ? "block xl:block xl:col-span-8" : "hidden xl:block xl:col-span-8"}>
          <DraftBoard />
        </div>

        {/* Real-time assistant AI sidebar */}
        <div className={activeTab === "brain" ? "block xl:block xl:col-span-4" : "hidden xl:block xl:col-span-4"}>
          <BrainPanel />
        </div>
      </div>
    </div>
  );
}
