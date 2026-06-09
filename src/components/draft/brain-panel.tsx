// filepath: src/components/draft/brain-panel.tsx
"use client";

import { useEffect, useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { duos } from "@/data/duos";
import { useDraftStore } from "@/store/draft-store";
import { useShallow } from "zustand/react/shallow";
import { getChampionIconUrl, getLatestVersion } from "@/lib/ddragon";
import ChampionMatchupEvaluator from "./champion-matchup-evaluator";
import LiveGameplanTimeline from "./live-gameplan-timeline";
import TeemoCoach from "../teemo-coach";
import VisualHealthPanel from "../visual-health-panel";
import { CompetitiveBrain } from "@/lib/draft-engine";
import { 
  Heart, 
  RotateCcw, 
  AlertTriangle, 
  ShieldAlert, 
  Compass, 
  CheckCircle,
  Plus,
  Trophy,
  Zap,
  Activity,
  Flame,
  Shield
} from "lucide-react";
import type { BrainRecommendation, ChampionScore, LiveDraftState } from "@/lib/types";

interface ScoreBarProps {
  label: string;
  value: number;
}

function ScoreBar({ label, value }: ScoreBarProps) {
  return (
    <div className="flex flex-col gap-0.5 w-full">
      <div className="flex justify-between text-[8px] uppercase tracking-wider font-bold text-[#c8aa6e]">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="w-full h-1 bg-[#1e232a] rounded-full overflow-hidden">
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
    currentStepIndex, 
    side, 
    allChampions,
    bluePicks,
    redPicks,
    blueBans,
    redBans,
    myPickSlots,
    isComplete,
    userRole,
    draftState,
    winProbability,
  } = useDraftStore(useShallow((state) => ({
    brainAnalysis: state.brainAnalysis,
    currentStepIndex: state.currentStepIndex,
    side: state.side,
    allChampions: state.allChampions,
    bluePicks: state.bluePicks,
    redPicks: state.redPicks,
    blueBans: state.blueBans,
    redBans: state.redBans,
    myPickSlots: state.myPickSlots,
    isComplete: state.isComplete,
    userRole: state.userRole,
    draftState: state.draftState,
    winProbability: state.winProbability,
  })));

  const undo = useDraftStore((state) => state.undo);
  const reset = useDraftStore((state) => state.reset);
  const setChampion = useDraftStore((state) => state.setChampion);
  const setSelectedDetailChampId = useDraftStore((state) => state.setSelectedDetailChampId);

  const [version, setVersion] = useState("15.11.1");
  const brain = useMemo(() => new CompetitiveBrain(allChampions), [allChampions]);

  const stateSnapshot = useMemo<LiveDraftState>(() => ({
    side,
    currentStepIndex,
    blueBans,
    redBans,
    bluePicks,
    redPicks,
    myPickSlots,
    isComplete,
    history: [],
    draftState: draftState || undefined
  }), [side, currentStepIndex, blueBans, redBans, bluePicks, redPicks, myPickSlots, isComplete, draftState]);

  useEffect(() => {
    getLatestVersion().then(setVersion);
  }, []);

  if (!brainAnalysis) {
    return (
      <div className="lol-panel p-6 text-center text-xs text-[#8a9dae] bg-[#091420]">
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
    recommendedSummoners
  } = brainAnalysis;

  const deepResponses = useMemo(() => {
    if (actionType !== "pick" || !recommendations) return {};
    
    const result: Record<string, { enemyResponse: string; ourCounterResponse: string; winProbabilityAfter: number }> = {};
    recommendations.forEach(rec => {
      result[rec.championId] = brain.simulateDeepResponse(rec.championId, stateSnapshot);
    });
    return result;
  }, [actionType, recommendations, stateSnapshot, brain]);

  // Resolve matching clinical meta duo when complete
  const ourPicks = side === "blue" ? bluePicks : redPicks;
  const adcPickId = ourPicks[myPickSlots[0]];
  const supPickId = ourPicks[myPickSlots[1]];
  let matchingDuo = duos.find(
    (d) => 
      (d.adcId === adcPickId && d.supId === supPickId) ||
      (d.adcId === supPickId && d.supId === adcPickId)
  );

  // Generación adaptativa si no es un combo de confort preestablecido
  if (!matchingDuo && adcPickId && supPickId) {
    const brain = new CompetitiveBrain(allChampions);
    matchingDuo = brain.generateDynamicDuo(adcPickId, supPickId) || undefined;
  }

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

  const currentStep = currentStepIndex < 10 ? { team: side === "blue" ? "blue" : "red", type: "pick" } : null; 
  const activeStepDetails = currentStepIndex < 20 ? (typeof window !== 'undefined' ? require("@/lib/types").DRAFT_ORDER[currentStepIndex] : null) : null;
  
  const picksList = side === "blue" ? bluePicks : redPicks;
  const isCurrentSlotADC = activeStepDetails && activeStepDetails.index === myPickSlots[0];

  let teemoMessage = "¡Un scout siempre va un paso adelante!";
  let isTalking = false;

  if (phase === "complete") {
    isTalking = true;
    if (matchingDuo) {
      teemoMessage = `¡Dúo ${matchingDuo.name} asegurado! Probabilidad de victoria estimada en ${winProbability}%. ¡A las armas!`;
    } else {
      teemoMessage = "¡Atención! Este combo no está sincronizado en los dúos clínicos de confort. ¡Juega con cautela!";
    }
  } else if (isMyTurn) {
    isTalking = true;
    if (actionType === "ban") {
      teemoMessage = "¡Turno de BAN! Bloqueemos a Senna para evitar su dictadura, o Caitlyn para neutralizar su rango.";
    } else {
      if (isCurrentSlotADC) {
        teemoMessage = "¡Pick de ADC activo! Fer, prioriza a Ashe (poke/utilidad) o Varus (asalto/letalidad).";
      } else {
        teemoMessage = "¡Pick de SOPORTE activo! Ralph, prioriza tanques: Nautilus, Thresh o Braum; o enchanters de confort.";
      }
    }
  } else {
    isTalking = false;
    teemoMessage = "El enemigo está pensando... Vigilando el mapa desde el arbusto con sigilo.";
  }

  // Alerta de prioridad si hay avisos
  if (warnings.length > 0 && !warnings[0].includes("despejada") && !warnings[0].includes("Fer: Línea") && !warnings[0].includes("Ralph: Línea")) {
    isTalking = true;
    teemoMessage = `¡Alerta! ${warnings[0]}`;
  }

  // Color de Win Rate Delta
  const getWinRateColor = (prob: number) => {
    if (prob > 60) return "text-emerald-400";
    if (prob >= 40) return "text-amber-400";
    return "text-rose-500";
  };

  return (
    <div className="lol-panel flex flex-col w-full h-full bg-[#091420] border border-[#785a28] shadow-2xl text-[#f0e6d3]">
      {/* Header Panel */}
      <div className="bg-[#0a1428] border-b border-[#c8aa6e]/30 p-5 md:p-6 flex items-center justify-between">
        <div>
          <h2 className="lol-title text-[#f0e6d3] text-base md:text-lg font-bold tracking-widest leading-none">
            Competitive Assistant
          </h2>
          <span className="text-xs md:text-sm text-[#c8aa6e] uppercase tracking-wider font-bold mt-1.5 block">
            {phase === "complete" ? "Simulación Finalizada" : `Paso ${currentStepIndex + 1} de 20 • Fase ${phase.toUpperCase()}`}
          </span>
        </div>
        <div className="flex gap-2">
          <button
            onClick={undo}
            disabled={currentStepIndex === 0}
            className="p-2 rounded border border-[#c8aa6e]/30 bg-[#1e232a] text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#0a1428] disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
            title="Deshacer último pick/ban"
            aria-label="Deshacer último pick o ban"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={reset}
            className="px-3.5 py-1.5 text-xs font-bold tracking-widest uppercase border border-red-800/40 bg-red-950/20 text-[#ff4655] hover:bg-[#ff4655] hover:text-[#010a13] transition-all rounded-sm cursor-pointer"
            aria-label="Reiniciar simulador de draft"
          >
            Reiniciar
          </button>
        </div>
      </div>

      {/* Main Content Scrollable */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 lg:p-3.5 flex flex-col gap-5 lg:gap-3.5 max-h-[650px] md:max-h-[960px] lg:max-h-none lg:min-h-0">
        
        {/* ALPHA DRAFT WIN CONDITION BANNER */}
        {brainAnalysis.winConditionType && brainAnalysis.winConditionText && (
          <div className={`p-4 border-2 rounded shadow-md flex items-start gap-2.5 transition-all duration-300 shrink-0 ${
            brainAnalysis.winConditionType === "EARLY_DOMINANCE"
              ? "border-amber-500 bg-amber-950/20 text-[#ebd6b3] shadow-[0_0_12px_rgba(245,158,11,0.15)]"
              : brainAnalysis.winConditionType === "MACRO_CONTROL"
              ? "border-[#00c8c8] bg-[#00c8c8]/5 text-[#f0e6d3] shadow-[0_0_12px_rgba(0,200,200,0.15)]"
              : "border-cyan-500 bg-cyan-950/15 text-cyan-100 shadow-[0_0_12px_rgba(6,182,212,0.15)]"
          }`}>
            <span className="text-base select-none mt-0.5">🎯</span>
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] uppercase tracking-widest font-black text-[#c8aa6e]">
                Estrategia Dominante de Teemo
              </span>
              <p className="text-xs font-semibold leading-relaxed">
                {brainAnalysis.winConditionText}
              </p>
              {brainAnalysis.macroImpactWarning && (
                <span className="text-[10px] text-amber-500 font-bold mt-1 block">
                  ⚠️ {brainAnalysis.macroImpactWarning}
                </span>
              )}
            </div>
          </div>
        )}

        {/* 🍄 La Trampa de Teemo (Weak Link Alert) */}
        {brainAnalysis.gankVulnerability !== undefined && brainAnalysis.gankVulnerability > 10.0 && (
          <div className="p-4 border-2 border-red-500 bg-red-950/20 text-[#ff4655] rounded shadow-[0_0_16px_rgba(239,68,68,0.2)] flex items-start gap-3 animate-pulse shrink-0">
            <span className="text-lg select-none mt-0.5">🍄</span>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest font-black text-red-400">
                💣 TRAMPA DETECTADA POR TEEMO
              </span>
              <p className="text-xs font-semibold leading-relaxed mt-1 text-red-200">
                ¡Vulnerabilidad crítica a Ganks! El índice Vg ({brainAnalysis.gankVulnerability}) es extremadamente alto debido al combo actual. Considera un tirador más elusivo (como Ezreal) o un soporte con fuerte control defensivo (como Braum o Renata).
              </p>
            </div>
          </div>
        )}

        {/* ALPHA DRAFT ADVANCED METRICS PANEL */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 shrink-0">
          {/* iTero Win Probability */}
          <div className="border border-[#c8aa6e]/20 bg-[#1a2233]/40 p-4 rounded shadow-lg flex flex-col gap-2.5 relative overflow-hidden">
            <div className="flex justify-between items-center">
              <span className="text-[9px] uppercase tracking-widest font-black text-[#c8aa6e] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#00c8c8]" />
                Win Prob
              </span>
              <span className={`font-serif font-black text-base ${getWinRateColor(winProbability)}`}>
                {winProbability}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#010a13] rounded-full overflow-hidden border border-[#c8aa6e]/10 relative">
              <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-[#785a28]/40 z-10" />
              <div 
                className="h-full bg-gradient-to-r from-[#785a28] via-[#c8aa6e] to-[#00c8c8] transition-all duration-500" 
                style={{ width: `${winProbability}%` }}
              />
            </div>
            <div className="flex justify-between text-[8px] text-[#b2c3d2] uppercase font-bold px-0.5">
              <span>Derrota</span>
              <span>50%</span>
              <span>Ventaja</span>
            </div>
          </div>

          {/* Gank Vulnerability Index (Vg) */}
          {(() => {
            const Vg = brainAnalysis.gankVulnerability ?? 0;
            const getVgStatus = (v: number) => {
              if (v === 0) return { label: "N/A", color: "text-[#8a9dae]", barColor: "bg-[#1e232a]" };
              if (v < 5.0) return { label: "Bajo Riesgo", color: "text-[#00c8c8]", barColor: "bg-[#00c8c8]" };
              if (v < 9.0) return { label: "Moderado", color: "text-[#c8aa6e]", barColor: "bg-[#c8aa6e]" };
              return { label: "Crítico", color: "text-[#ff4655]", barColor: "bg-[#ff4655]" };
            };
            const status = getVgStatus(Vg);
            const percentage = Math.min(100, (Vg / 15) * 100);

            return (
              <div className="border border-[#c8aa6e]/20 bg-[#1a2233]/40 p-4 rounded shadow-lg flex flex-col gap-2.5 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#c8aa6e] flex items-center gap-1.5" title="Índice de Vulnerabilidad a Ganks (Vg) = (P_jungla * E_empuje) / (M_adc + C_support)">
                    <Shield className="w-3.5 h-3.5 text-amber-500" />
                    Gank Risk (V_g)
                  </span>
                  <span className={`font-serif font-black text-base ${status.color}`}>
                    {Vg > 0 ? `${Vg}/15` : "0.0"}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#010a13] rounded-full overflow-hidden border border-[#c8aa6e]/10 relative">
                  <div 
                    className={`h-full ${status.barColor} transition-all duration-500`}
                    style={{ width: `${Vg > 0 ? percentage : 0}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-[#b2c3d2] uppercase font-bold px-0.5">
                  <span>Seguro</span>
                  <span className={status.color}>{status.label}</span>
                  <span>Vulnerable</span>
                </div>
              </div>
            );
          })()}

          {/* CFR Regret Score (Draft Optimalidad) */}
          {(() => {
            const CFR = brainAnalysis.cfrRegretScore ?? 0.15;
            const getCfrStatus = (c: number) => {
              if (c < 0.15) return { label: "Óptimo", color: "text-[#00c8c8]", barColor: "bg-[#00c8c8]" };
              if (c < 0.35) return { label: "Viable", color: "text-[#c8aa6e]", barColor: "bg-[#c8aa6e]" };
              return { label: "Esperar Pick", color: "text-[#ff4655]", barColor: "bg-[#ff4655]" };
            };
            const status = getCfrStatus(CFR);
            const percentage = CFR * 100;

            return (
              <div className="border border-[#c8aa6e]/20 bg-[#1a2233]/40 p-4 rounded shadow-lg flex flex-col gap-2.5 relative overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className="text-[9px] uppercase tracking-widest font-black text-[#c8aa6e] flex items-center gap-1.5" title="Arrepentimiento Contrafactual Esperado (CFR) = Penalización por contra-picks rivales futuros">
                    <Zap className="w-3.5 h-3.5 text-violet-400" />
                    CFR Regret
                  </span>
                  <span className={`font-serif font-black text-base ${status.color}`}>
                    {CFR.toFixed(2)}
                  </span>
                </div>
                <div className="w-full h-2 bg-[#010a13] rounded-full overflow-hidden border border-[#c8aa6e]/10 relative">
                  <div 
                    className={`h-full ${status.barColor} transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="flex justify-between text-[8px] text-[#b2c3d2] uppercase font-bold px-0.5">
                  <span>Bloquear</span>
                  <span className={status.color}>{status.label}</span>
                  <span>Riesgo</span>
                </div>
              </div>
            );
          })()}
        </div>

        {/* Teemo Coach Presenter */}
        <TeemoCoach isTalking={isTalking} message={teemoMessage} />

        {/* Evaluation of final draft synergy */}
        {phase === "complete" && (
          <div className="flex flex-col gap-4 shrink-0">
            {matchingDuo ? (
              <>
                <div className="p-5 border-2 border-[#c8aa6e] bg-[#0a1428] rounded shadow-[0_4px_12px_rgba(200,170,110,0.25)] flex flex-col gap-3">
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
                  <p className="text-xs md:text-sm text-[#ebd6b3] italic leading-relaxed">
                    "{matchingDuo.philosophy}"
                  </p>

                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {matchingDuo.tags.map(tag => (
                      <span key={tag} className="text-[9px] font-black uppercase text-[#0a1428] bg-[#c8aa6e] px-2 py-0.5 rounded-sm">
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Bloque de Analítica de Coach Profesional (Enfoque en Tanques y Sinergia Competitiva) */}
                  {(matchingDuo.coachVerdict || matchingDuo.tankMacroDirective) && (
                    <div className="mt-3 pt-3 border-t border-[#c8aa6e]/20 flex flex-col gap-2.5 bg-[#1a2233]/50 p-3.5 rounded border border-[#c8aa6e]/15">
                      <div className="flex items-center gap-1.5 justify-between">
                        <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#00c8c8] flex items-center gap-1">
                          <ShieldAlert className="w-3.5 h-3.5" />
                          Directiva de Coach Profesional
                        </span>
                        {["nautilus", "thresh", "braum"].includes(matchingDuo.supId) && (
                          <span className="text-[8px] bg-amber-500 text-[#0a1428] font-black px-1.5 py-0.5 rounded uppercase tracking-wider animate-pulse">
                            Rol: Tanque
                          </span>
                        )}
                      </div>

                      {matchingDuo.coachVerdict && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-[#c8aa6e]">
                            Veredicto de Línea 2v2
                          </span>
                          <p className="text-[11px] text-[#b2c3d2] leading-relaxed">
                            {matchingDuo.coachVerdict}
                          </p>
                        </div>
                      )}

                      {matchingDuo.lanePositioningPattern && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-[#c8aa6e]">
                            Patrón Geométrico de Línea
                          </span>
                          <p className="text-[11px] text-[#f0e6d3] font-mono leading-relaxed">
                            🧭 {matchingDuo.lanePositioningPattern}
                          </p>
                        </div>
                      )}

                      {matchingDuo.ccChainSequence && (
                        <div className="flex flex-col gap-0.5 bg-[#0a1428]/60 p-2 rounded border border-[#c8aa6e]/10">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-[#00c8c8]">
                            Secuencia de CC óptimo
                          </span>
                          <p className="text-[11px] text-[#00c8c8] font-semibold">
                            ⚡ {matchingDuo.ccChainSequence}
                          </p>
                        </div>
                      )}

                      {matchingDuo.tankMacroDirective && (
                        <div className="flex flex-col gap-0.5">
                          <span className="text-[8px] uppercase tracking-wider font-bold text-[#ff4655]">
                            Conducta del Tanque / Absorción
                          </span>
                          <p className="text-[11px] text-[#b2c3d2] leading-relaxed">
                            🛡️ {matchingDuo.tankMacroDirective}
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {duos.some(d => d.id === matchingDuo.id) ? (
                    <Link
                      href={`/duos/${matchingDuo.id}`}
                      className="mt-2 w-full py-2.5 bg-[#c8aa6e] hover:bg-[#785a28] text-[#0a1428] hover:text-[#f0e6d3] border border-[#f0e6d3]/20 rounded-sm font-serif font-black text-[10px] tracking-widest text-center uppercase transition-all shadow cursor-pointer"
                    >
                      Abrir Guía Completa →
                    </Link>
                  ) : (
                    <div className="mt-2 text-center text-[10px] uppercase font-black tracking-widest text-[#c8aa6e] bg-[#c8aa6e]/15 border border-[#c8aa6e]/30 py-2 rounded-sm">
                      ⚡ Estrategia Adaptativa Activa
                    </div>
                  )}

                </div>

                {/* Hechizos de Invocador Recomendados (Setup Clínico iTero) */}
                {recommendedSummoners && (
                  <div className="p-5 border border-[#c8aa6e]/30 bg-[#1e232a]/80 rounded flex flex-col gap-3">
                    <div className="flex items-center gap-2 border-b border-[#c8aa6e]/20 pb-2">
                      <Zap className="w-5 h-5 text-amber-500 animate-pulse" />
                      <h4 className="font-serif font-black text-xs uppercase tracking-widest text-[#c8aa6e]">
                        Setup Clínico Recomendado (Summoners)
                      </h4>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      {/* ADC Setup */}
                      <div className="flex flex-col gap-1.5 p-3 bg-[#0a1428]/60 border border-[#c8aa6e]/15 rounded">
                        <span className="text-[9px] uppercase tracking-wider font-black text-[#c8aa6e] flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500" />
                          Fer (ADC)
                        </span>
                        <div className="flex gap-2">
                          {recommendedSummoners.adc.map((s, i) => (
                            <span key={i} className="text-[10px] font-bold bg-[#1e2830] text-[#00c8c8] px-2 py-1 rounded border border-[#00c8c8]/30">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      {/* Support Setup */}
                      <div className="flex flex-col gap-1.5 p-3 bg-[#0a1428]/60 border border-[#c8aa6e]/15 rounded">
                        <span className="text-[9px] uppercase tracking-wider font-black text-[#c8aa6e] flex items-center gap-1">
                          <Shield className="w-3.5 h-3.5 text-emerald-500" />
                          Ralph (Soporte)
                        </span>
                        <div className="flex gap-2">
                          {recommendedSummoners.sup.map((s, i) => (
                            <span key={i} className="text-[10px] font-bold bg-[#1e2830] text-[#c8aa6e] px-2 py-1 rounded border border-[#c8aa6e]/30">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-xs text-[#8a9dae] leading-relaxed italic bg-[#010a13]/40 p-2.5 rounded border-l-2 border-amber-500 pl-3">
                      "{recommendedSummoners.reason}"
                    </p>
                  </div>
                )}

                {/* Evaluador de Matchup y Timeline interactivo de Setup por minutos */}
                <ChampionMatchupEvaluator
                  allyDuo={matchingDuo}
                  enemyDuo={{
                    adcId: (side === "blue" ? redPicks : bluePicks).find(id => {
                      if (!id) return false;
                      const c = allChampions.find(champ => champ.id === id);
                      return c?.role === "ADC" || c?.roles?.includes("ADC");
                    }) || null,
                    supId: (side === "blue" ? redPicks : bluePicks).find(id => {
                      if (!id) return false;
                      const c = allChampions.find(champ => champ.id === id);
                      return c?.role === "Support" || c?.roles?.includes("Support");
                    }) || null,
                  }}
                />

                <LiveGameplanTimeline
                  duoId={matchingDuo.id}
                  userRole={userRole}
                />
              </>
            ) : (
              <div className="p-5 border border-dashed border-[#c8aa6e]/40 bg-[#1e232a]/60 rounded flex flex-col gap-2.5 text-center shadow-md">
                <ShieldAlert className="w-8 h-8 text-[#c8aa6e] mx-auto opacity-90 animate-bounce" />
                <h4 className="font-serif font-bold text-xs uppercase tracking-widest text-[#c8aa6e]">
                  Combo No Sincronizado
                </h4>
                <p className="text-xs text-[#8a9dae] leading-relaxed">
                  Los campeones elegidos no coinciden con ninguno de los 15 Dúos Clínicos recomendados. Se aconseja estudiar las sinergias meta en la sección de Dúos Maestros.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Active turn indicator banner */}
        {phase !== "complete" && (
          <div 
            className={`p-4 rounded border text-xs md:text-sm font-bold flex items-center gap-3 shrink-0 ${
              isMyTurn
                ? "bg-[#00c8c8]/10 border-[#00c8c8] text-[#f0e6d3]"
                : "bg-[#1e232a]/60 border-[#785a28]/45 text-[#8a9dae]"
            }`}
          >
            <Compass className={`w-5 h-5 shrink-0 ${isMyTurn ? "text-[#00c8c8] animate-spin" : "text-[#c8aa6e]"}`} />
            {isMyTurn 
              ? `Es tu turno para: ${actionType === "ban" ? "BANEAR" : "ELEGIR CAMPEÓN"}`
              : "Esperando selección del rival..."}
          </div>
        )}

        {/* Brain Recommendations */}
        <div className="shrink-0">
          <h3 className="lol-title text-xs md:text-sm font-black text-[#c8aa6e] tracking-widest uppercase mb-3">
            {actionType === "ban" ? "Baneos Recomendados" : "Mejores Picks de Confort"}
          </h3>
          <div className="flex flex-col gap-3">
            {recommendations.length === 0 ? (
              <div className="text-center text-xs md:text-sm text-[#8a9dae] py-8 border border-[#c8aa6e]/20 bg-[#1e232a]/30">
                {!isComplete ? "Ninguna recomendación disponible." : "Draft finalizado."}
              </div>
            ) : (
              recommendations.map((rec, idx) => {
                const iconUrl = getChampionIconUrl(version, rec.ddragonKey);
                const predictiveWarning = brain.getPredictiveWarning(rec.championId, stateSnapshot);

                return (
                  <div
                    key={rec.championId}
                    className="flex flex-col gap-3.5 p-4 md:p-5 border border-[#785a28]/30 bg-[#1e232a]/40 hover:border-[#c8aa6e] hover:shadow-md transition-all relative group rounded-sm"
                  >
                    {/* Top Row: Champ Info & Score */}
                    <div className="flex items-center justify-between gap-2">
                      <button
                        onClick={() => setSelectedDetailChampId(rec.championId)}
                        className="flex items-center gap-3 text-left hover:opacity-85 transition-opacity cursor-pointer group/recHeader"
                        title={`Haz clic para ver detalles y sinergias de ${rec.championName}`}
                        aria-label={`Ver detalles de ${rec.championName}`}
                      >
                        <div className="relative w-12 h-12 rounded border border-[#c8aa6e] overflow-hidden shrink-0 group-hover/recHeader:border-[#00c8c8] transition-colors">
                          <Image
                            src={iconUrl}
                            alt={rec.championName}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="flex flex-col gap-0.5">
                          <span className="font-serif font-black text-sm md:text-base text-[#f0e6d3] group-hover/recHeader:text-[#c8aa6e] transition-colors">
                            {rec.championName}
                          </span>
                          <div className="flex flex-wrap gap-1.5 mt-0.5">
                            <span className={`inline-block text-[9px] md:text-xs font-black uppercase px-2 py-0.5 rounded self-start ${getBadgeStyle(rec.tag)}`}>
                              {rec.tag.replace("_", " ")}
                            </span>
                            {rec.hasAffinityBonus && (
                              <span className="inline-block text-[9px] md:text-xs font-black uppercase px-2 py-0.5 rounded bg-amber-500 text-[#0a1428] border border-[#f0e6d3] shadow-md flex items-center gap-0.5" title="Afinidad histórica favorable (+15 Comfort)">
                                🎯 Afinidad
                              </span>
                            )}
                          </div>
                        </div>
                      </button>

                      {/* Add/Select trigger inside Brain Panel */}
                      <div className="flex items-center gap-2">
                        {isMyTurn && (
                          <button
                            onClick={() => setChampion(rec.championId)}
                            className="px-3 py-1.5 bg-[#0a1428] hover:bg-[#c8aa6e] text-[#c8aa6e] hover:text-[#010a13] border border-[#c8aa6e]/60 rounded text-[10px] md:text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-all shadow-sm shrink-0 cursor-pointer"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            Seleccionar
                          </button>
                        )}

                        {/* Score Badge */}
                        {actionType === "pick" && (
                          <div className="text-right shrink-0 min-w-[70px]">
                            <span className="text-sm md:text-base font-serif font-black text-[#c8aa6e] block">
                              {rec.totalScore}%
                            </span>
                            <span className="text-[8px] md:text-[9px] text-[#b2c3d2] uppercase font-bold tracking-wider block mt-0.5">
                              Match Score
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Explanatory description */}
                    <p className="text-xs md:text-sm text-[#ebd6b3] italic leading-relaxed pl-1 font-medium">
                      "{rec.reasoning}"
                    </p>

                    {predictiveWarning && (
                      <div className="mt-2 p-2 bg-amber-950/30 border border-amber-500/20 text-[10px] md:text-xs text-amber-300 font-bold rounded flex items-center gap-1.5 shrink-0">
                        <span className="shrink-0 select-none">🔮 Predicción:</span>
                        <span>{predictiveWarning}</span>
                      </div>
                    )}

                    {actionType === "pick" && deepResponses[rec.championId] && deepResponses[rec.championId].enemyResponse !== "Desconocido" && (
                      <div className="mt-2 p-2 bg-[#005a82]/20 border border-[#00c8c8]/30 text-[10px] md:text-xs text-[#80f0ff] font-bold rounded flex items-center gap-1.5 shrink-0">
                        <span className="shrink-0 select-none">🔮 Si pickeas {rec.championName} &rarr; ellos {deepResponses[rec.championId].enemyResponse} &rarr; tú {deepResponses[rec.championId].ourCounterResponse} (Win Prob: {deepResponses[rec.championId].winProbabilityAfter}%)</span>
                      </div>
                    )}

                    {/* ALPHA-DRAFT FIX: Badges visuales de scoring dinámico y restricciones */}
                    {(() => {
                      const champData = allChampions.find(c => c.id === rec.championId);
                      const isSup = champData?.role === "Support" || champData?.roles?.includes("Support") || champData?.role?.includes("Support");
                      const isPureEnchanter = isSup && (champData?.role === "Enchanter Support" || ["lulu", "yuumi", "soraka", "nami", "sona"].includes(rec.championId));
                      const isTankSupport = isSup && (champData?.role === "Tank Support" || ["thresh", "braum", "nautilus", "leona", "rell", "alistar"].includes(rec.championId));
                      const isMageSupport = isSup && (champData?.role === "Mage Support" || ["brand", "xerath", "lux", "velkoz", "zyra", "hwei", "morgana"].includes(rec.championId));
                      const isAdc = champData?.role === "ADC" || champData?.roles?.includes("ADC");
                      const isOwnAdc = isAdc && champData?.isOwnPool;

                      const badges = [];

                      const isAlly = activeStepDetails ? (activeStepDetails.team === side) : true;

                      if (isPureEnchanter) {
                        badges.push(
                          <span key="enchanter-pen" className="text-[9px] bg-red-950/50 text-[#ff4655] border border-red-800/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            ⚠️ -50 Penalización Enchanter
                          </span>
                        );
                      }
                      if (isAlly && isSup && isTankSupport) {
                        badges.push(
                          <span key="tank-bonus" className="text-[9px] bg-emerald-950/50 text-[#00c8c8] border border-[#00c8c8]/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            🛡️ +35 Bonificación Tanque
                          </span>
                        );
                      }
                      if (isAlly && isSup && isMageSupport) {
                        badges.push(
                          <span key="mage-bonus" className="text-[9px] bg-indigo-950/50 text-indigo-400 border border-indigo-500/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            🔮 +15 Bonificación Mago
                          </span>
                        );
                      }
                      if (isAdc && !isOwnAdc) {
                        badges.push(
                          <span key="adc-pen" className="text-[9px] bg-red-950/50 text-[#ff4655] border border-red-800/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            🚫 -80 Fuera de Confort
                          </span>
                        );
                      }
                      if (draftState && draftState.isLastPick && isAlly) {
                        badges.push(
                          <span key="last-pick-counter" className="text-[9px] bg-amber-950/50 text-amber-500 border border-amber-500/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider animate-pulse">
                            🔥 Last Pick: Peso Counter 50%
                          </span>
                        );
                      }
                      if (draftState && draftState.isEnemyBotLaneClosed && rec.cfrRegret === 0.05) {
                        badges.push(
                          <span key="cfr-collapsed" className="text-[9px] bg-violet-950/50 text-violet-400 border border-violet-500/40 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                            ⚠️ CFR Colapsado: Bot Lane Cerrada
                          </span>
                        );
                      }

                      if (badges.length === 0) return null;
                      return (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {badges}
                        </div>
                      );
                    })()}

                    {/* Citas Contextuales de Teemo para el Pick Prioritario */}
                    {idx === 0 && (
                      <div className="mt-2.5 p-2.5 border-l-2 border-[#00c8c8] bg-[#00c8c8]/5 text-xs text-[#ebd6b3] italic leading-normal flex items-start gap-2 rounded-r-sm">
                        <span className="text-[10px] uppercase font-black tracking-wider text-[#00c8c8] not-italic shrink-0">
                          Coach Teemo:
                        </span>
                        <span>
                          {(() => {
                            const isSup = rec.tag.includes("BAN") ? false : (allChampions.find(c => c.id === rec.championId)?.role === "Support" || allChampions.find(c => c.id === rec.championId)?.roles?.includes("Support"));
                            if (draftState?.isLastPick) {
                              return "«Ellos mostraron sus cartas. Aplastémoslos con el counter perfecto.»";
                            }
                            if (isSup) {
                              const isTank = ["thresh", "braum", "nautilus", "leona", "rell", "alistar"].includes(rec.championId);
                              if (isTank) {
                                return "«La visión lo es todo. Asegura el control con iniciación.»";
                              } else {
                                return "«Demasiado dulce. No dependas de otros, toma el control.»";
                              }
                            }
                            return "«Un dardo en el momento justo y ganamos la línea.»";
                          })()}
                        </span>
                      </div>
                    )}

                    {/* Score breakdown if picking */}
                    {actionType === "pick" && (
                      <div className="flex flex-col gap-2 mt-2 border-t border-[#c8aa6e]/20 pt-2.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          <ScoreBar label="Confort" value={rec.scores.comfort} />
                          <ScoreBar label="Sinergia" value={rec.scores.synergy} />
                          <ScoreBar label="Counter" value={rec.scores.counter} />
                          <ScoreBar label="Comp" value={rec.scores.comp} />
                        </div>
                        <div className="flex justify-between text-[9px] text-[#b2c3d2] uppercase font-black tracking-wider pt-2 border-t border-[#c8aa6e]/10">
                          <span>V_g Proyectada: <strong className={rec.gankVulnerability && rec.gankVulnerability >= 9.0 ? "text-[#ff4655]" : rec.gankVulnerability && rec.gankVulnerability >= 5.0 ? "text-[#c8aa6e]" : "text-[#00c8c8]"}>{rec.gankVulnerability !== undefined ? rec.gankVulnerability.toFixed(1) : "0.0"}</strong></span>
                          <span>CFR Regret: <strong className={rec.cfrRegret && rec.cfrRegret >= 0.35 ? "text-[#ff4655]" : rec.cfrRegret && rec.cfrRegret >= 0.15 ? "text-[#c8aa6e]" : "text-[#00c8c8]"}>{rec.cfrRegret !== undefined ? rec.cfrRegret.toFixed(2) : "0.00"}</strong></span>
                        </div>
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
          <div className="p-4 border border-[#ff4655]/25 bg-[#ff4655]/5 flex gap-3 shrink-0">
            <AlertTriangle className="w-5 h-5 text-[#ff4655] shrink-0" />
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-[#ff4655]">
                Alertas de Peligro
              </span>
              {warnings.map((w, idx) => (
                <p key={idx} className="text-xs md:text-sm text-[#f0e6d3] leading-relaxed">
                  • {w}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Win Conditions */}
        {winConditions.length > 0 && (
          <div className="p-4 border border-[#00c8c8]/25 bg-[#00c8c8]/5 flex gap-3 shrink-0">
            <CheckCircle className="w-5 h-5 text-[#00c8c8] shrink-0" />
            <div className="flex flex-col gap-1.5">
              <span className="text-[10px] md:text-xs uppercase tracking-wider font-extrabold text-[#00c8c8]">
                Directiva Macro
              </span>
              {winConditions.map((wc, idx) => (
                <p key={idx} className="text-xs md:text-sm text-[#f0e6d3] leading-relaxed">
                  • {wc}
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Comp Type Analysis (iTero AP/AD Damage Balance and Scaling Indicators) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 border-t border-[#c8aa6e]/20 pt-4 shrink-0">
          {/* Ally Comp */}
          <div className="v-stack gap-3 border border-[#785a28]/30 bg-[#1e232a]/30 p-4 rounded-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold text-[#8a9dae]">
                Composición Aliada
              </span>
              <span className="text-xs md:text-sm font-serif font-black text-[#c8aa6e] uppercase">
                {allyComp ? allyComp.type : "Desconocida"}
              </span>
            </div>

            {allyComp && allyComp.adPercentage !== undefined && (
              <div className="flex flex-col gap-2 border-t border-[#c8aa6e]/10 pt-2">
                <span className="text-[8px] uppercase tracking-wider font-bold text-[#8a9dae]">
                  iTero Damage & Scale Matrix
                </span>
                
                {/* Barras de Daño */}
                <div className="flex flex-col gap-1.5">
                  {/* AD */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-[#8a9dae]">
                      <span>Daño Físico (AD)</span>
                      <span>{allyComp.adPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff4655]" style={{ width: `${allyComp.adPercentage}%` }} />
                    </div>
                  </div>
                  {/* AP */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-[#8a9dae]">
                      <span>Daño Mágico (AP)</span>
                      <span>{allyComp.apPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0097e6]" style={{ width: `${allyComp.apPercentage}%` }} />
                    </div>
                  </div>
                  {/* True */}
                  {allyComp.trueDamage !== undefined && allyComp.trueDamage > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-[8px] uppercase font-bold text-[#8a9dae]">
                        <span>Daño Verdadero</span>
                        <span>{allyComp.trueDamage}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: `${allyComp.trueDamage}%` }} />
                      </div>
                    </div>
                  )}
                  {/* Escalado */}
                  <div className="flex flex-col gap-0.5 border-t border-[#c8aa6e]/10 pt-1.5">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-[#c8aa6e]">
                      <span>Curva de Escalado</span>
                      <span>{allyComp.scalingScore}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00c8c8]" style={{ width: `${allyComp.scalingScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {allyComp?.strengths && allyComp.strengths.length > 0 && (
              <p className="text-[10px] md:text-xs text-[#8a9dae] leading-relaxed mt-1">
                <span className="font-bold text-[#00c8c8]">Virtudes: </span>
                {allyComp.strengths.join(" ")}
              </p>
            )}
          </div>

          {/* Enemy Comp */}
          <div className="v-stack gap-3 border border-[#785a28]/30 bg-[#1e232a]/30 p-4 rounded-sm">
            <div className="flex flex-col gap-0.5">
              <span className="text-[9px] md:text-[10px] uppercase tracking-wider font-extrabold text-[#8a9dae]">
                Composición Enemiga
              </span>
              <span className="text-xs md:text-sm font-serif font-black text-[#ff4655] uppercase">
                {enemyComp ? enemyComp.type : "Desconocida"}
              </span>
            </div>

            {enemyComp && enemyComp.adPercentage !== undefined && (
              <div className="flex flex-col gap-2 border-t border-[#c8aa6e]/10 pt-2">
                <span className="text-[8px] uppercase tracking-wider font-bold text-[#8a9dae]">
                  iTero Damage & Scale Matrix
                </span>
                
                {/* Barras de Daño Enemigo */}
                <div className="flex flex-col gap-1.5">
                  {/* AD */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-[#8a9dae]">
                      <span>Daño Físico (AD)</span>
                      <span>{enemyComp.adPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                      <div className="h-full bg-[#ff4655]" style={{ width: `${enemyComp.adPercentage}%` }} />
                    </div>
                  </div>
                  {/* AP */}
                  <div className="flex flex-col gap-0.5">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-[#8a9dae]">
                      <span>Daño Mágico (AP)</span>
                      <span>{enemyComp.apPercentage}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                      <div className="h-full bg-[#0097e6]" style={{ width: `${enemyComp.apPercentage}%` }} />
                    </div>
                  </div>
                  {/* True */}
                  {enemyComp.trueDamage !== undefined && enemyComp.trueDamage > 0 && (
                    <div className="flex flex-col gap-0.5">
                      <div className="flex justify-between text-[8px] uppercase font-bold text-[#8a9dae]">
                        <span>Daño Verdadero</span>
                        <span>{enemyComp.trueDamage}%</span>
                      </div>
                      <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                        <div className="h-full bg-white" style={{ width: `${enemyComp.trueDamage}%` }} />
                      </div>
                    </div>
                  )}
                  {/* Escalado */}
                  <div className="flex flex-col gap-0.5 border-t border-[#c8aa6e]/10 pt-1.5">
                    <div className="flex justify-between text-[8px] uppercase font-bold text-[#ff4655]">
                      <span>Curva de Escalado</span>
                      <span>{enemyComp.scalingScore}%</span>
                    </div>
                    <div className="w-full h-1 bg-[#010a13] rounded-full overflow-hidden">
                      <div className="h-full bg-[#00c8c8]" style={{ width: `${enemyComp.scalingScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {enemyComp?.weaknesses && enemyComp.weaknesses.length > 0 && (
              <p className="text-[10px] md:text-xs text-[#8a9dae] leading-relaxed mt-1">
                <span className="font-bold text-[#ff4655]">Debilidades: </span>
                {enemyComp.weaknesses.join(" ")}
              </p>
            )}
          </div>
          
          {/* Módulo de Salud Visual y Ergonomía */}
          <div className="mt-4 border-t border-[#c8aa6e]/20 pt-4">
            <VisualHealthPanel />
          </div>
        </div>
      </div>
    </div>
  );
}
