// filepath: src/components/draft/live-gameplan-timeline.tsx
"use client";

import { useState, useEffect } from "react";
import { setups } from "@/data/setups";
import { staticFallbackChampions } from "@/data/champions";
import { CheckSquare, Square, ChevronDown, ChevronUp, Clock, HelpCircle } from "lucide-react";
import type { SetupCheckpoint, SetupTimeline } from "@/lib/types";
import { useDraftStore } from "@/store/draft-store";
import { CompetitiveBrain } from "@/lib/draft-engine";

interface LiveGameplanTimelineProps {
  duoId: string;
  userRole: "fer" | "ralph" | null;
}

export default function LiveGameplanTimeline({ duoId, userRole }: LiveGameplanTimelineProps) {
  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});
  const [expandedCheckpoints, setExpandedCheckpoints] = useState<Record<number, boolean>>({
    0: true, // Expand primer item por defecto
  });

  const allChampions = useDraftStore((state) => state.allChampions);
  const side = useDraftStore((state) => state.side);
  const bluePicks = useDraftStore((state) => state.bluePicks);
  const redPicks = useDraftStore((state) => state.redPicks);

  const enemyPicks = (side === "blue" ? redPicks : bluePicks).filter((id): id is string => !!id);
  const allyPicks = (side === "blue" ? bluePicks : redPicks).filter((id): id is string => !!id);

  // Find ally bot lane picks
  const allyBotPicks = allyPicks.filter(id => {
    const c = allChampions.find(champ => champ.id === id);
    return c && (c.role === "ADC" || c.role === "Support" || c.roles?.includes("ADC") || c.roles?.includes("Support") || c.role.includes("Support"));
  });

  // Find enemy jungler
  const enemyJungler = enemyPicks.find(id => {
    const c = allChampions.find(champ => champ.id === id);
    return c && (c.role === "Jungle" || c.roles?.includes("Jungle"));
  });

  const brain = new CompetitiveBrain(allChampions);
  const prediction = enemyJungler ? brain.predictJungleStart(allyBotPicks, enemyJungler) : null;

  let alertBg = "bg-emerald-950/20 border-emerald-500/30 text-emerald-300";
  if (prediction && prediction.confidence > 75) {
    alertBg = "bg-red-950/20 border-red-500/30 text-red-300";
  } else if (prediction && prediction.confidence > 50) {
    alertBg = "bg-amber-950/20 border-amber-500/30 text-amber-300";
  }

  // Intentar resolver el setup de la base de datos estática setups.ts
  let activeSetup = setups.find((s) => s.duoId === duoId);

  // Si no existe, construir un timeline adaptativo inteligente al vuelo
  if (!activeSetup) {
    const [adcId, supId] = duoId.split("-");
    const adc = staticFallbackChampions.find((c) => c.id === adcId);
    const sup = staticFallbackChampions.find((c) => c.id === supId);

    if (adc && sup) {
      const supTags = sup.tags || [];
      const adcTags = adc.tags || [];

      // Definir acciones adaptativas basadas en tags del soporte
      const visionAction = supTags.includes("Fog") 
        ? `${sup.name} usa Youmuu's/Youmuu's para invadir la jungla y sembrar visión profunda.` 
        : `${sup.name} coloca un ward defensivo y custodia la entrada del río.`;

      const level2SupportAction = (supTags.includes("Engage") || supTags.includes("CC"))
        ? `${sup.name} busca conectar su control de masas (Q/E) inmediatamente al subir de nivel para forzar hechizos.`
        : `${sup.name} usa sus escudos/curaciones para mitigar el hostigamiento y desgastar con ataques.`;

      const ultimateChainAction = (supTags.includes("Engage") || supTags.includes("CC"))
        ? `${sup.name} inicia con su habilidad definitiva en área, permitiendo que ${adc.name} alinee todo su daño.`
        : `${sup.name} reserva su habilidad definitiva para desenganchar o blindar a ${adc.name} si es diveado.`;

      const lateGameSupportAction = (supTags.includes("Peel") || supTags.includes("Protect") || supTags.includes("Shield"))
        ? `Dar peel absoluto a ${adc.name}. Guardar habilidades de desenganche únicamente para salvarlo de asesinos.`
        : `Buscar flancos y asegurar una iniciación limpia sobre el tirador rival utilizando tu kit de control.`;

      // Armar checkpoints dinámicos
      activeSetup = {
        duoId,
        name: `${adc.name} + ${sup.name} (Adaptativo)`,
        checkpoints: [
          {
            time: "0:00",
            title: "Inicio y Control de Visión",
            actions: [
              "Configurar y asegurar arbustos defensivos en el carril inferior.",
              visionAction,
              `${adc.name} inicia last-hits pasivos a súbditos melé.`
            ]
          },
          {
            time: "1:30",
            title: "Asegurar el Nivel 2",
            actions: [
              "Hacer push a la oleada rápido para adelantarse en experiencia.",
              level2SupportAction,
              `${adc.name} aprende su segunda habilidad y busca trades cortos con su rango.`
            ]
          },
          {
            time: "3:00",
            title: "Nivel 3 & Gank Safety",
            actions: [
              "Lanzar baratijas de visión en el río y arbustos de línea.",
              `${adc.name} guarda maná o habilidades de desplazamiento defensivo.`
            ],
            decision: {
              condition: "¿El jungla o botlane rival tiene potencial de all-in?",
              ifTrue: "Mantener oleada cerca de la torre aliada y farmear bajo rango seguro.",
              ifFalse: "Empujar oleada para forzar placas y rotar a controlar la prioridad de jungla."
            }
          },
          {
            time: "6:00",
            title: "Power Spike de Ultimates",
            actions: [
              ultimateChainAction,
              `${adc.name} activa su definitiva para forzar una baja o presionar bajo torre.`,
              "Coordinar rotaciones de regreso a base para comprar el primer spike de items."
            ]
          },
          {
            time: "12:00",
            title: "Asedio de Torre y Dragón",
            actions: [
              "Acumular oleada grande de cañón y asediar la primera torre inferior.",
              `${sup.name} asegura el pixel ward 45 segundos antes de que aparezca el Dragón.`
            ],
            decision: {
              condition: "¿Lograron tirar la torre o forzar al enemigo a base?",
              ifTrue: "Rotar inmediatamente a la línea de mid para abrir el mapa y asediar la torre central.",
              ifFalse: "Mantener el farm en bot y denegar campamentos de jungla cercanos."
            }
          },
          {
            time: "20:00+",
            title: "Fase Tardía (Teamfights 5v5)",
            actions: [
              lateGameSupportAction,
              `${adc.name} se posiciona en el carril trasero y castiga la frontline de adelante hacia atrás.`,
              "Mantener el control visual de Baron Nashor y Dragón Ancestral."
            ]
          }
        ]
      };
    }
  }

  // Reset checklist al cambiar de duo
  useEffect(() => {
    setCompletedActions({});
    setExpandedCheckpoints({ 0: true });
  }, [duoId]);

  if (!activeSetup) {
    return (
      <div className="border border-[#c8aa6e]/30 bg-[#eadecd]/20 p-4 rounded text-center text-xs text-[#785a28] font-bold">
        Línea de tiempo no configurada.
      </div>
    );
  }

  const toggleAction = (checkpointIdx: number, actionIdx: number) => {
    const key = `${checkpointIdx}-${actionIdx}`;
    setCompletedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const toggleExpand = (index: number) => {
    setExpandedCheckpoints((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  // Filtrar acciones específicas según el rol seleccionado para destacar
  const highlightAction = (actionText: string): boolean => {
    if (!userRole) return false;
    const lower = actionText.toLowerCase();
    if (userRole === "fer" && (lower.includes("adc") || lower.includes("tirador") || lower.includes("last-hit") || lower.includes("farm") || lower.includes("kiting") || lower.includes("ashe") || lower.includes("varus") || lower.includes("jhin") || lower.includes("tristana") || lower.includes("jinx") || lower.includes("ezreal") || lower.includes("lucian") || lower.includes("caitlyn"))) {
      return true;
    }
    if (userRole === "ralph" && (lower.includes("support") || lower.includes("soporte") || lower.includes("ward") || lower.includes("visión") || lower.includes("peel") || lower.includes("escudo") || lower.includes("engage") || lower.includes("inmovil") || lower.includes("karma") || lower.includes("nautilus") || lower.includes("pyke") || lower.includes("renata") || lower.includes("lulu") || lower.includes("nami") || lower.includes("braum") || lower.includes("thresh") || lower.includes("morgana") || lower.includes("leona") || lower.includes("rell"))) {
      return true;
    }
    return false;
  };

  return (
    <div className="border border-[#c8aa6e]/30 bg-[#0a1428]/95 p-4 rounded shadow-lg text-[#f0e6d3] flex flex-col gap-4">
      <div className="flex items-center justify-between border-b border-[#c8aa6e]/30 pb-2">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-[#c8aa6e]" />
          <h4 className="font-serif font-black text-xs uppercase tracking-widest text-[#c8aa6e]">
            Setup En Vivo Minuto a Minuto
          </h4>
        </div>
        {userRole && (
          <span className="text-[9px] uppercase bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 px-2 py-0.5 rounded text-[#c8aa6e] font-mono font-bold">
            Foco: {userRole === "fer" ? "FER (ADC)" : "RALPH (SOPORTE)"}
          </span>
        )}
      </div>
 
      {prediction && (
        <div className={`p-3 border rounded-sm font-bold text-xs flex items-center gap-2 ${alertBg}`}>
          <span>⚠️ Jungla enemigo {prediction.confidence}% probabilidad de empezar {prediction.side === 'top' ? 'Top' : 'Bottom'} Side</span>
        </div>
      )}

      <div className="flex flex-col gap-3 max-h-[400px] overflow-y-auto pr-1">
        {activeSetup.checkpoints.map((cp, cpIdx) => {
          const isExpanded = !!expandedCheckpoints[cpIdx];

          // Cuenta de acciones completadas en este checkpoint
          const totalActions = cp.actions.length;
          const completedCount = cp.actions.filter((_, aIdx) => !!completedActions[`${cpIdx}-${aIdx}`]).length;
          const isCpFinished = totalActions > 0 && completedCount === totalActions;

          return (
            <div
              key={cpIdx}
              className={`border rounded-sm transition-colors duration-200 ${
                isCpFinished
                  ? "border-emerald-600/40 bg-emerald-950/10"
                  : isExpanded
                  ? "border-[#c8aa6e]/30 bg-[#1e232a]/40"
                  : "border-[#eadecd]/10 bg-transparent hover:bg-[#1e232a]/20"
              }`}
            >
              {/* Header colapsable */}
              <button
                onClick={() => toggleExpand(cpIdx)}
                className="w-full flex items-center justify-between p-3 text-left cursor-pointer"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className={`text-xs font-serif font-black px-2 py-0.5 rounded-sm shrink-0 ${
                    isCpFinished ? "bg-emerald-600 text-[#0a1428]" : "bg-[#c8aa6e] text-[#0a1428]"
                  }`}>
                    {cp.time}
                  </span>
                  <span className={`text-xs md:text-sm font-bold truncate ${isCpFinished ? "line-through opacity-60 text-emerald-500" : ""}`}>
                    {cp.title}
                  </span>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  {totalActions > 0 && (
                    <span className="text-[10px] font-mono text-[#5e6b77]">
                      {completedCount}/{totalActions}
                    </span>
                  )}
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-[#c8aa6e]" /> : <ChevronDown className="w-4 h-4 text-[#c8aa6e]" />}
                </div>
              </button>

              {/* Contenido expandido */}
              {isExpanded && (
                <div className="px-3 pb-3 pt-1 border-t border-[#eadecd]/10 flex flex-col gap-2.5 animate-fadeIn">
                  {/* Acciones */}
                  <div className="flex flex-col gap-2">
                    {cp.actions.map((act, actIdx) => {
                      const isActionDone = !!completedActions[`${cpIdx}-${actIdx}`];
                      const isHighlighted = highlightAction(act);

                      return (
                        <button
                          key={actIdx}
                          onClick={() => toggleAction(cpIdx, actIdx)}
                          className={`flex items-start gap-2.5 text-xs text-left w-full transition-all group ${
                            isActionDone ? "opacity-45" : ""
                          }`}
                        >
                          <span className="shrink-0 mt-0.5 text-[#c8aa6e] group-hover:scale-110 transition-transform">
                            {isActionDone ? (
                              <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <Square className="w-3.5 h-3.5 text-[#5e6b77]" />
                            )}
                          </span>
                          <span className={`leading-relaxed ${
                            isActionDone ? "line-through" : isHighlighted ? "text-[#f0e6d3] font-bold border-l-2 border-[#c8aa6e] pl-1.5" : "text-[#a0a8b0]"
                          }`}>
                            {act}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Decision Tree / Condición */}
                  {cp.decision && (
                    <div className="mt-2 p-2.5 border border-amber-800/25 bg-amber-950/10 rounded-sm flex flex-col gap-1.5">
                      <div className="flex items-center gap-1.5 text-amber-500">
                        <HelpCircle className="w-3.5 h-3.5 shrink-0" />
                        <span className="text-[10px] uppercase tracking-wider font-extrabold">
                          Árbol de Decisión Rápido
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-[#f0e6d3]">
                        {cp.decision.condition}
                      </p>
                      <div className="grid grid-cols-1 gap-1 pl-1 text-[10px] leading-relaxed">
                        <p>
                          <span className="text-emerald-500 font-bold">✓ Sí:</span> {cp.decision.ifTrue}
                        </p>
                        <p>
                          <span className="text-rose-500 font-bold">✗ No:</span> {cp.decision.ifFalse}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
