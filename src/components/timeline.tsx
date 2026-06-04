// filepath: src/components/timeline.tsx
"use client";

import { useState } from "react";
import type { SetupCheckpoint } from "@/lib/types";
import { Clock, CheckSquare, Square, ChevronRight, HelpCircle } from "lucide-react";
import { useDraftStore } from "@/store/draft-store";

interface TimelineProps {
  checkpoints: SetupCheckpoint[];
}

export default function Timeline({ checkpoints }: TimelineProps) {
  const { userRole } = useDraftStore();
  // Checklist state
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({});

  const toggleItem = (checkpointIdx: number, actionIdx: number) => {
    const key = `${checkpointIdx}-${actionIdx}`;
    setCompletedItems((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const getActionHighlightClass = (action: string) => {
    if (!userRole) return "";

    const adcPrefixes = [
      "Ashe:", "Ashe ", 
      "Varus:", "Varus ", 
      "Jhin:", "Jhin ", 
      "Tristana:", "Tristana ", 
      "Jinx:", "Jinx ", 
      "Lucian:", "Lucian ", 
      "Caitlyn:", "Caitlyn ", 
      "Ezreal:", "Ezreal ",
      "Fer:", "Fer "
    ];
    const supPrefixes = [
      "Karma:", "Karma ", 
      "Nautilus:", "Nautilus ", 
      "Pyke:", "Pyke ", 
      "Renata:", "Renata ", 
      "Lulu:", "Lulu ", 
      "Nami:", "Nami ", 
      "Braum:", "Braum ", 
      "Thresh:", "Thresh ", 
      "Morgana:", "Morgana ",
      "Ralph:", "Ralph "
    ];

    const isAdc = adcPrefixes.some(prefix => action.startsWith(prefix));
    const isSup = supPrefixes.some(prefix => action.startsWith(prefix));

    if (userRole === "fer" && isAdc) {
      return "border-l-2 border-[#c8aa6e] bg-[#c8aa6e]/5 pl-2.5 py-1 rounded-r shadow-[2px_0_4px_rgba(200,170,110,0.04)]";
    }
    if (userRole === "ralph" && isSup) {
      return "border-l-2 border-[#0397ab] bg-[#0397ab]/5 pl-2.5 py-1 rounded-r shadow-[2px_0_4px_rgba(3,151,171,0.04)]";
    }
    return "";
  };

  return (
    <div className="relative pl-6 md:pl-8 border-l border-[#c8aa6e]/50 flex flex-col gap-8 py-2">
      {checkpoints.map((checkpoint, checkpointIdx) => (
        <div key={checkpointIdx} className="relative group">
          {/* Timeline Node Icon */}
          <div className="absolute -left-[35px] md:-left-[43px] top-0.5 w-6 h-6 md:w-8 md:h-8 rounded-full border border-[#c8aa6e] bg-[#0a1428] flex items-center justify-center text-[#c8aa6e] group-hover:scale-110 transition-transform shadow-md">
            <Clock className="w-3.5 h-3.5 md:w-4.5 md:h-4.5" />
          </div>

          {/* Card Wrapper */}
          <div className="lol-panel p-4 md:p-5 bg-[#fcf9f2] border border-[#c8aa6e] shadow-sm flex flex-col gap-3">
            {/* Header: Time & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#eadecd] pb-2 gap-1">
              <span className="font-serif font-black text-sm md:text-base text-[#0f1923]">
                {checkpoint.title}
              </span>
              <span className="font-mono text-[10px] md:text-xs text-[#785a28] font-bold uppercase tracking-wider bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 px-2.5 py-0.5 rounded-sm self-start sm:self-auto">
                ⏱️ Minuto {checkpoint.time}
              </span>
            </div>

            {/* Checklist of actions */}
            <div className="flex flex-col gap-2.5 mt-1">
              {checkpoint.actions.map((action, actionIdx) => {
                const isCompleted = completedItems[`${checkpointIdx}-${actionIdx}`];
                const highlightClass = getActionHighlightClass(action);
                const hasHighlight = highlightClass !== "";

                return (
                  <button
                    key={actionIdx}
                    onClick={() => toggleItem(checkpointIdx, actionIdx)}
                    className={`flex items-start text-left gap-2.5 group/btn cursor-pointer transition-all w-full ${highlightClass}`}
                  >
                    {isCompleted ? (
                      <CheckSquare className="w-4 h-4 text-[#23893e] shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-[#785a28]/60 group-hover/btn:text-[#c8aa6e] shrink-0 mt-0.5" />
                    )}
                    <span
                      className={`text-xs md:text-sm leading-relaxed transition-all ${
                        isCompleted ? "text-[#5e6b77] line-through" : "text-[#0f1923]"
                      }`}
                    >
                      {action}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Conditional Decision Tree if present */}
            {checkpoint.decision && (
              <div className="border border-[#0397ab]/20 bg-[#0397ab]/5 p-3.5 rounded-sm flex flex-col gap-2 mt-2">
                <div className="flex items-center gap-1.5 text-[#0397ab]">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans">
                    Árbol de Decisión Táctica
                  </span>
                </div>
                <p className="text-xs font-serif font-black text-[#0f1923]">
                  {checkpoint.decision.condition}
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1.5 border-t border-[#0397ab]/20 pt-2.5">
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-emerald-800 bg-emerald-500/10 px-1.5 py-0.5 self-start rounded-sm">
                      SÍ (Afirmativo)
                    </span>
                    <p className="text-xs text-[#5e6b77] leading-relaxed pl-1">
                      {checkpoint.decision.ifTrue}
                    </p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[8px] uppercase tracking-wider font-extrabold text-rose-800 bg-rose-500/10 px-1.5 py-0.5 self-start rounded-sm">
                      NO (Negativo)
                    </span>
                    <p className="text-xs text-[#5e6b77] leading-relaxed pl-1">
                      {checkpoint.decision.ifFalse}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
