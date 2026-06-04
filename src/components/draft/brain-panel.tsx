// filepath: src/components/draft/brain-panel.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { duos } from "@/data/duos";
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
  Plus,
  Trophy
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
    setChampion,
    bluePicks,
    redPicks,
    myPickSlots,
    isComplete,
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

  // Resolve matching clinical meta duo when complete
  const ourPicks = side === "blue" ? bluePicks : redPicks;
  const adcPickId = ourPicks[myPickSlots[0]];
  const supPickId = ourPicks[myPickSlots[1]];
  const matchingDuo = duos.find(
    (d) => 
      (d.adcId === adcPickId && d.supId === supPickId) ||
      (d.adcId === supPickId && d.supId === adcPickId)
  );

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
    <div className="lol-panel flex flex-col w-full h-full bg-[#fcf9f2] border border-[#c8aa6e] shadow-md">
      {/* Header Panel */}
      <div className="bg-[#0a1428] border-b border-[#c8aa6e] p-5 md:p-6 flex items-center justify-between">
        <div>
          <h2 className="lol-title text-[#f0e6d3] text-base md:text-lg font-bold tracking-widest leading-none">
            Competitive Assistant
          </h2>
          <span className="text-xs md:text-sm text-[#c8aa6e] uppercase tracking-wider font-bold mt-1 block">
            {phase === "complete" ? "Simulación Finalizada" : `Paso ${currentStepIndex + 1} de 20 • Fase ${phase.toUpperCase()}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={currentStepIndex === 0}
            className="p-2 rounded border border-[#c8aa6e]/30 bg-[#1e232a] text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#0a1428] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            title="Deshacer último pick/ban"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase border border-red-800/40 bg-red-950/20 text-[#c63333] hover:bg-[#c63333] hover:text-white transition-all rounded-sm"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-5 max-h-[650px] md:max-h-[960px]">
        {/* Evaluation of final draft synergy */}
        {phase === "complete" && (
          <div className="flex flex-col gap-4">
            {matchingDuo ? (
              <div className="p-5 border-2 border-[#c8aa6e] bg-[#0a1428] rounded shadow-[0_4px_12px_rgba(200,170,110,0.2)] flex flex-col gap-3">
                <div className="flex items-center gap-2 border-b border-[#c8aa6e]/40 pb-2 text-[#f0e6d3]">
                  <Trophy className="w-5 h-5 text-amber-500 animate-pulse" />
                  <h4 className="font-serif font-black text-sm uppercase tracking-widest text-[#c8aa6e]">
                    Sinergia Clínica Detectada
                  </h4>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="font-serif font-black text-lg md:text-xl text-[#f0e6d3] uppercase">
                    {matchingDuo.name}
                  </span>
                  <span className="text-[10px] md:text-xs text-amber-500 uppercase tracking-widest font-black">
                    Pilar: {matchingDuo.pillar}
                  </span>
                </div>
                <p className="text-xs md:text-sm text-[#a0a8b0] italic leading-relaxed">
                  "{matchingDuo.philosophy}"
                </p>
                <div className="mt-1 flex flex-wrap gap-1.5">
                  {matchingDuo.tags.map(tag => (
                    <span key={tag} className="text-[9px] font-black uppercase text-[#0a1428] bg-[#c8aa6e] px-2 py-0.5 rounded-sm">
                      {tag}
                    </span>
                  ))}
                </div>
                <Link
                  href={`/duos/${matchingDuo.id}`}
                  className="mt-2 w-full py-2.5 bg-[#c8aa6e] hover:bg-[#785a28] text-[#0a1428] hover:text-[#f0e6d3] border border-[#f0e6d3]/20 rounded-sm font-serif font-black text-[10px] tracking-widest text-center uppercase transition-all shadow cursor-pointer"
                >
                  Abrir Guía Minuto a Minuto →
                </Link>
              </div>
            ) : (
              <div className="p-5 border border-dashed border-[#c8aa6e]/40 bg-[#eadecd]/20 rounded flex flex-col gap-2.5 text-center">
                <ShieldAlert className="w-8 h-8 text-[#785a28] mx-auto opacity-75 animate-bounce" />
                <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#785a28]">
                  Combo No Sincronizado
                </h4>
                <p className="text-xs text-[#5e6b77] leading-relaxed">
                  Los campeones elegidos no coinciden con ninguno de los 15 Dúos Clínicos recomendados. Se aconseja estudiar las sinergias meta en la sección de Dúos Maestros.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Active turn indicator banner */}
        {phase !== "complete" && (
          <div 
            className={`p-4 rounded border text-xs md:text-sm font-bold flex items-center gap-3 ${
              isMyTurn
                ? "bg-[#0397ab]/10 border-[#0397ab] text-[#0a1428]"
                : "bg-[#eadecd] border-[#d8ccb4] text-[#785a28]"
            }`}
          >
            <Compass className={`w-5 h-5 shrink-0 ${isMyTurn ? "text-[#0397ab] animate-spin" : "text-[#785a28]"}`} />
            {isMyTurn 
              ? `Es tu turno para: ${actionType === "ban" ? "BANEAR" : "ELEGIR CAMPEÓN"}`
              : "Esperando selección del rival..."}
          </div>
        )}

        {/* Brain Recommendations */}
        <div>
          <h3 className="lol-title text-xs md:text-sm font-black text-[#785a28] tracking-widest uppercase mb-3">
            {actionType === "ban" ? "Baneos Recomendados" : "Mejores Picks de Confort"}
          </h3>
          <div className="flex flex-col gap-3">
            {recommendations.length === 0 ? (
              <div className="text-center text-xs md:text-sm text-[#5e6b77] py-8 border border-[#eadecd] bg-[#fcf9f2]/50">
                {!isComplete ? "Ninguna recomendación disponible." : "Draft finalizado."}
              </div>
            ) : (
              recommendations.map((rec) => {
                const iconUrl = getChampionIconUrl(version, rec.ddragonKey);

                return (
                  <div
                    key={rec.championId}
                    className="flex flex-col gap-3.5 p-4 md:p-5 border border-[#eadecd] bg-[#fdfbf7] hover:border-[#c8aa6e] hover:shadow-md transition-all relative group"
                  >
                    {/* Top Row: Champ Info & Score */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded border border-[#c8aa6e] overflow-hidden shrink-0">
                          <Image
                            src={iconUrl}
                            alt={rec.championName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-serif font-black text-sm md:text-base text-[#0f1923]">
                            {rec.championName}
                          </span>
                          <span className={`inline-block text-[9px] md:text-xs font-black uppercase px-2 py-0.5 rounded self-start ${getBadgeStyle(rec.tag)}`}>
                            {rec.tag.replace("_", " ")}
                          </span>
                        </div>
                      </div>

                      {/* Add/Select trigger inside Brain Panel */}
                      <div className="flex items-center gap-2">
                        {isMyTurn && (
                          <button
                            onClick={() => setChampion(rec.championId)}
                            className="px-3 py-1.5 bg-[#0a1428] hover:bg-[#c8aa6e] text-[#c8aa6e] hover:text-[#0a1428] border border-[#c8aa6e]/60 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm shrink-0"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Seleccionar
                          </button>
                        )}

                        {/* Score Badge */}
                        {actionType === "pick" && (
                          <div className="text-right shrink-0 min-w-[70px]">
                            <span className="text-sm md:text-base font-serif font-black text-[#785a28] block">
                              {rec.totalScore}%
                            </span>
                            <span className="text-[8px] md:text-[9px] text-[#5e6b77] uppercase font-bold tracking-wider block mt-0.5">
                              Match Score
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Explanatory description */}
                    <p className="text-xs md:text-sm text-[#5e6b77] italic leading-relaxed pl-1 font-medium">
                      "{rec.reasoning}"
                    </p>

                    {/* Score breakdown if picking */}
                    {actionType === "pick" && (
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2 border-t border-[#eadecd]/60 pt-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
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
          <div className="p-4 border border-red-800/25 bg-red-950/5 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-[#c63333] shrink-0" />
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-[#c63333]">
                Alertas de Peligro
              </span>
              {warnings.map((w, idx) => (
                <p key={idx} className="text-xs md:text-sm text-[#0f1923] leading-relaxed">
                  • {w}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Win Conditions */}
        {winConditions.length > 0 && (
          <div className="p-4 border border-emerald-800/25 bg-emerald-950/5 flex gap-3">
            <CheckCircle className="w-5 h-5 text-[#23893e] shrink-0" />
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-[#23893e]">
                Directiva Macro
              </span>
              {winConditions.map((wc, idx) => (
                <p key={idx} className="text-xs md:text-sm text-[#0f1923] leading-relaxed">
                  • {wc}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Comp Type Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 border-t border-[#eadecd] pt-4">
          {/* Ally Comp */}
          <div className="v-stack gap-1.5 border border-[#eadecd] bg-[#fdfbf7] p-3.5 rounded-sm">
            <span className="text-[9px] md:text-xs uppercase tracking-wider font-extrabold text-[#5e6b77]">
              Composición Aliada
            </span>
            <span className="text-xs md:text-sm font-serif font-black text-[#785a28] uppercase">
              {allyComp ? allyComp.type : "Desconocida"}
            </span>
            {allyComp?.strengths && allyComp.strengths.length > 0 && (
              <p className="text-[10px] md:text-xs text-[#5e6b77] leading-relaxed mt-1">
                <span className="font-bold text-emerald-800">Virtudes: </span>
                {allyComp.strengths.join(" ")}
              </p>
            )}
          </div>

          {/* Enemy Comp */}
          <div className="v-stack gap-1.5 border border-[#eadecd] bg-[#fdfbf7] p-3.5 rounded-sm">
            <span className="text-[9px] md:text-xs uppercase tracking-wider font-extrabold text-[#5e6b77]">
              Composición Enemiga
            </span>
            <span className="text-xs md:text-sm font-serif font-black text-[#c63333] uppercase">
              {enemyComp ? enemyComp.type : "Desconocida"}
            </span>
            {enemyComp?.weaknesses && enemyComp.weaknesses.length > 0 && (
              <p className="text-[10px] md:text-xs text-[#5e6b77] leading-relaxed mt-1">
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
