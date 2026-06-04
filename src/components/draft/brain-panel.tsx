// filepath: src/components/draft/brain-panel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDraftStore } from "@/store/draft-store";
import { getChampionIconUrl, getLatestVersion } from "@/lib/ddragon";
import { 
  Heart, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  CheckCircle,
  HelpCircle,
  Plus
} from "lucide-react";
import type { BrainRecommendation, ChampionScore } from "@/lib/types";

interface ScoreBarProps {
  label: string;
  value: number;
}

function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <div className="flex justify-between text-[8px] uppercase tracking-wider font-bold text-[#785a28]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full h-1 bg-[#eadecd] rounded-full overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-[#c8aa6e] to-[#785a28]" 
          style={{ width: `${value}%` }} 
        />
      </div>
    </div>
  );
}

export default function BrainPanel() {
  const { 
    brainAnalysis, 
    undo, 
    reset, 
    currentStepIndex, 
    side, 
    allChampions,
    setChampion
  } = useDraftStore();
  const [version, setVersion] = useState("15.11.1");

  useEffect(() => {
    getLatestVersion().then(setVersion);
  }, []);

  if (!brainAnalysis) {
    return (
      <div className="lol-panel p-6 text-center text-xs text-[#5e6b77]">
        Cargando Competitive Brain...
      </div>
    );
  }

  const {
    isMyTurn,
    actionType,
    recommendations,
    enemyComp,
    allyComp,
    warnings,
    winConditions,
    phase,
  } = brainAnalysis;

  // Retrieve recommendation card badge styles
  const getBadgeStyle = (tag: BrainRecommendation["tag"]) => {
    switch (tag) {
      case "BEST_PICK":
        return "bg-amber-500 text-[#0a1428] border border-[#f0e6d3]";
      case "COUNTER_PICK":
        return "bg-rose-600 text-white border border-rose-400";
      case "SAFE_PICK":
        return "bg-[#0397ab] text-white border border-[#00a3e0]";
      case "PRIORITY_BAN":
        return "bg-red-800 text-white border border-red-500";
      default:
        return "bg-[#785a28] text-[#fcf9f2] border border-[#c8aa6e]";
    }
  };

  return (
    <div className="lol-panel flex flex-col w-full h-full bg-[#fcf9f2] border border-[#c8aa6e]">
      {/* Header Panel */}
      <div className="bg-[#0a1428] border-b border-[#c8aa6e] p-4 flex items-center justify-between">
        <div>
          <h2 className="lol-title text-[#f0e6d3] text-sm font-bold tracking-widest leading-none">
            Competitive Assistant
          </h2>
          <span className="text-[10px] text-[#c8aa6e] uppercase tracking-wider font-semibold">
            {phase === "complete" ? "Simulación Finalizada" : `Paso ${currentStepIndex + 1} de 20 • Fase ${phase.toUpperCase()}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={currentStepIndex === 0}
            className="p-1.5 rounded border border-[#c8aa6e]/30 bg-[#1e232a] text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#0a1428] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Deshacer último pick/ban"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={reset}
            className="px-2.5 py-1 text-[9px] font-bold tracking-wider uppercase border border-red-800/40 bg-red-950/20 text-[#c63333] hover:bg-[#c63333] hover:text-white transition-all rounded-sm"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 max-h-[500px] md:max-h-[680px]">
        {/* Active turn indicator banner */}
        {phase !== "complete" && (
          <div 
            className={`p-3 rounded border text-xs font-semibold flex items-center gap-2 ${
              isMyTurn
                ? "bg-[#0397ab]/10 border-[#0397ab] text-[#0a1428]"
                : "bg-[#eadecd] border-[#d8ccb4] text-[#785a28]"
            }`}
          >
            <Compass className={`w-4 h-4 ${isMyTurn ? "text-[#0397ab] animate-spin" : "text-[#785a28]"}`} />
            {isMyTurn 
              ? `Es tu turno para: ${actionType === "ban" ? "BANEAR" : "ELEGIR CAMPEÓN"}`
              : "Esperando selección del rival..."}
          </div>
        )}

        {/* Brain Recommendations */}
        <div>
          <h3 className="lol-title text-xs font-bold text-[#785a28] tracking-widest uppercase mb-2">
            {actionType === "ban" ? "Baneos Recomendados" : "Mejores Picks de Confort"}
          </h3>
          <div className="flex flex-col gap-2">
            {recommendations.length === 0 ? (
              <div className="text-center text-xs text-[#5e6b77] py-6 border border-[#eadecd] bg-[#fcf9f2]/50">
                Ninguna recomendación disponible.
              </div>
            ) : (
              recommendations.map((rec) => {
                const iconUrl = getChampionIconUrl(version, rec.ddragonKey);

                return (
                  <div
                    key={rec.championId}
                    className="flex flex-col gap-2 p-3 border border-[#eadecd] bg-[#fdfbf7] hover:border-[#c8aa6e] transition-all relative group"
                  >
                    {/* Top Row: Champ Info & Score */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="relative w-8 h-8 rounded border border-[#c8aa6e] overflow-hidden">
                          <Image
                            src={iconUrl}
                            alt={rec.championName}
                            fill
                            className="object-cover"
                            sizes="32px"
                          />
                        </div>
                        <div>
                          <span className="font-serif font-bold text-xs text-[#0f1923] block">
                            {rec.championName}
                          </span>
                          <span className={`inline-block text-[7px] font-extrabold uppercase px-1 rounded ${getBadgeStyle(rec.tag)}`}>
                            {rec.tag.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Add/Select trigger inside Brain Panel */}
                      {isMyTurn && (
                        <button
                          onClick={() => setChampion(rec.championId)}
                          className="px-2 py-1 bg-[#0a1428] hover:bg-[#c8aa6e] text-[#c8aa6e] hover:text-[#0a1428] border border-[#c8aa6e]/60 rounded text-[9px] font-bold uppercase tracking-wider flex items-center gap-0.5 transition-all shadow-sm"
                        >
                          <Plus className="w-2.5 h-2.5" />
                          Seleccionar
                        </button>
                      )}

                      {/* Score Badge */}
                      {actionType === "pick" && (
                        <div className="text-right">
                          <span className="text-xs font-serif font-black text-[#785a28] block">
                            {rec.totalScore}%
                          </span>
                          <span className="text-[7px] text-[#5e6b77] uppercase font-bold tracking-wider">
                            Match Score
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Explanatory description */}
                    <p className="text-[10px] text-[#5e6b77] italic leading-tight pl-0.5">
                      "{rec.reasoning}"
                    </p>

                    {/* Score breakdown if picking */}
                    {actionType === "pick" && (
                      <div className="grid grid-cols-2 gap-x-3 gap-y-1 mt-1 border-t border-[#eadecd]/60 pt-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <ScoreBar label="Confort" value={rec.scores.comfort} />
                        <ScoreBar label="Sinergia" value={rec.scores.synergy} />
                        <ScoreBar label="Counter" value={rec.scores.counter} />
                        <ScoreBar label="Comp" value={rec.scores.comp} />
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Warnings / Hazards Alerts */}
        {warnings.length > 0 && (
          <div className="p-3 border border-red-800/25 bg-red-950/5 flex gap-2">
            <AlertTriangle className="w-4 h-4 text-[#c63333] shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#c63333]">
                Alertas de Peligro
              </span>
              {warnings.map((w, idx) => (
                <p key={idx} className="text-[10px] text-[#0f1923] leading-snug">
                  • {w}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Win Conditions */}
        {winConditions.length > 0 && (
          <div className="p-3 border border-emerald-800/25 bg-emerald-950/5 flex gap-2">
            <CheckCircle className="w-4 h-4 text-[#23893e] shrink-0" />
            <div className="flex flex-col gap-1">
              <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#23893e]">
                Directiva Macro
              </span>
              {winConditions.map((wc, idx) => (
                <p key={idx} className="text-[10px] text-[#0f1923] leading-snug">
                  • {wc}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Comp Type Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-1 border-t border-[#eadecd] pt-3">
          {/* Ally Comp */}
          <div className="v-stack gap-1 border border-[#eadecd] bg-[#fdfbf7] p-2.5 rounded-sm">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#5e6b77]">
              Composición Aliada
            </span>
            <span className="text-xs font-serif font-black text-[#785a28] uppercase">
              {allyComp ? allyComp.type : "Desconocida"}
            </span>
            {allyComp?.strengths && allyComp.strengths.length > 0 && (
              <p className="text-[9px] text-[#5e6b77] leading-tight mt-1">
                <span className="font-bold text-emerald-800">Virtudes: </span>
                {allyComp.strengths.join(" ")}
              </p>
            )}
          </div>

          {/* Enemy Comp */}
          <div className="v-stack gap-1 border border-[#eadecd] bg-[#fdfbf7] p-2.5 rounded-sm">
            <span className="text-[8px] uppercase tracking-wider font-extrabold text-[#5e6b77]">
              Composición Enemiga
            </span>
            <span className="text-xs font-serif font-black text-[#c63333] uppercase">
              {enemyComp ? enemyComp.type : "Desconocida"}
            </span>
            {enemyComp?.weaknesses && enemyComp.weaknesses.length > 0 && (
              <p className="text-[9px] text-[#5e6b77] leading-tight mt-1">
                <span className="font-bold text-red-800">Debilidades: </span>
                {enemyComp.weaknesses.join(" ")}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
