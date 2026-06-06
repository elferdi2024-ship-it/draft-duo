// filepath: src/components/draft/champion-matchup-evaluator.tsx
"use client";

import { useEffect, useState } from "react";
import { Shield, Swords, ShieldAlert, Award, AlertCircle, Compass } from "lucide-react";
import type { DuoData } from "@/lib/types";
import { staticFallbackChampions } from "@/data/champions";

interface MatchupEvaluatorProps {
  allyDuo: DuoData;
  enemyDuo: { adcId: string | null; supId: string | null } | null;
}

export default function ChampionMatchupEvaluator({ allyDuo, enemyDuo }: MatchupEvaluatorProps) {
  const [scores, setScores] = useState({
    lvl2: 50,
    lvl6: 50,
    siege: 50,
    late: 50,
  });

  const [verdict, setVerdict] = useState<string>("");
  const [tacticalTip, setTacticalTip] = useState<string>("");

  useEffect(() => {
    let lvl2Val = 50;
    let lvl6Val = 50;
    let siegeVal = 50;
    let lateVal = 50;

    const allyTags = allyDuo.tags || [];
    const allyId = allyDuo.id;

    // 1. Heurísticas aliadas
    if (allyTags.includes("Aggressive") || allyTags.includes("Trades Cortos") || allyTags.includes("Burst")) {
      lvl2Val += 20;
    }
    if (allyTags.includes("Poke") || allyTags.includes("Velocidad") || allyTags.includes("Asedio")) {
      lvl2Val += 10;
      siegeVal += 25;
    }
    if (allyTags.includes("Dive") || allyTags.includes("All-In") || allyTags.includes("Engage")) {
      lvl2Val += 15;
      lvl6Val += 20;
    }
    if (allyTags.includes("Late Game") || allyTags.includes("Scaling") || allyTags.includes("Hypercarry")) {
      lateVal += 30;
      lvl2Val -= 10;
    }
    if (allyTags.includes("Anti-engage") || allyTags.includes("Peel") || allyTags.includes("Protect")) {
      lateVal += 15;
      lvl2Val += 5;
    }

    // Resolver campeones enemigos para analítica avanzada
    const enemyAdc = enemyDuo?.adcId 
      ? staticFallbackChampions.find(c => c.id === enemyDuo.adcId) 
      : null;
    const enemySup = enemyDuo?.supId 
      ? staticFallbackChampions.find(c => c.id === enemyDuo.supId) 
      : null;

    let dynamicVerdict = "Analizando variables de enfrentamiento... Completa los picks enemigos para simular.";
    let dynamicTip = "Teemo aconseja: Mantén la visión perpendicular en el arbusto de línea para denegar emboscadas.";

    if (enemyAdc || enemySup) {
      const enemyTags = [
        ...(enemyAdc?.tags || []),
        ...(enemySup?.tags || [])
      ];

      // Ajustes basados en la botlane enemiga
      if (enemyAdc?.id === "caitlyn" || enemySup?.id === "lux") {
        // Enfoque vs poke opresivo
        if (allyTags.includes("Poke")) {
          siegeVal += 10;
          dynamicVerdict = "Guerra de rangos. Ambos equipos buscan denegar farm mediante asedio constante. El primero en crashear la primera placa controlará la línea.";
          dynamicTip = "Fer, mantén el farm con W de Ashe o Q de Varus. Ralph, limpia arbustos con barrido para evitar cepos.";
        } else if (allyTags.includes("Engage") || allyTags.includes("Dive")) {
          lvl2Val += 15;
          lvl6Val += 15;
          dynamicVerdict = "Línea de Presión contra Rango. El rival tiene la ventaja en niveles 1-2. Deben esperar el crash de oleada y buscar un all-in limpio.";
          dynamicTip = "Espera a nivel 3. Nautilus o Pyke deben flanquear y fijar a Lux. Ella es frágil y no tiene movilidad.";
        } else {
          lvl2Val -= 15;
          siegeVal -= 15;
          dynamicVerdict = "Desventaja de rango. La botlane enemiga intentará meterlos bajo torre para rascar placas gratis.";
          dynamicTip = "Jueguen defensivos bajo torre. Cedan los súbditos difíciles antes de perder la mitad de la vida por poke.";
        }
      } else if (enemySup?.id === "nautilus" || enemySup?.id === "leona" || enemySup?.id === "thresh" || enemySup?.id === "braum") {
        // Enfoque vs tanques/engage
        if (allyTags.includes("Anti-engage") || allyTags.includes("Peel")) {
          lvl6Val += 15;
          lateVal += 15;
          dynamicVerdict = "Matchup de Contra-iniciación favorable. El rival quiere forzar all-ins, pero ustedes cuentan con herramientas de desarme excelentes.";
          dynamicTip = "Ralph, guarda la W de Renata o el Polimorf de Lulu exclusivamente para cuando Nautilus logre conectar su gancho.";
        } else if (allyTags.includes("Poke")) {
          lvl2Val -= 10;
          dynamicVerdict = "Poke de Desgaste vs Engage Duro. Controlen la distancia. Si el tanque enemigo logra engancharlos con vida completa, la pelea será desfavorable.";
          dynamicTip = "Fer, castiga con básicos al tanque enemigo cuando intente ejecutar súbditos para su item de soporte.";
        }
      } else if (enemyTags.includes("Hypercarry") || enemyTags.includes("Scaling")) {
        // Enfoque vs escalado enemigo (Jinx, Smolder, Kog)
        if (allyTags.includes("Aggressive") || allyTags.includes("Burst") || allyTags.includes("Dive")) {
          lvl2Val += 20;
          dynamicVerdict = "Matchup Opresivo a favor. Tienen la ventana de early game para castigar la debilidad del tirador enemigo.";
          dynamicTip = "Forzar nivel 2 empujando rápido los primeros 9 súbditos. Inicien de inmediato para quemar sus hechizos.";
        } else {
          lateVal -= 15;
          dynamicVerdict = "Guerra de escalado neutral. El rival buscará farmear pasivamente de cara a peleas tardías.";
          dynamicTip = "Coordina con el jungla para asegurar el primer dragón y forzar peleas antes de que completen 3 items.";
        }
      } else {
        // Matchups genéricos
        dynamicVerdict = `Enfrentamiento adaptativo contra ${enemyAdc?.name || "ADC"} + ${enemySup?.name || "Soporte"}. Mantengan las directivas de rango y control de visión.`;
      }
    } else {
      dynamicVerdict = "Borrador preliminar. Tienes prioridad de confort con tus 15 combos consolidación.";
    }

    setVerdict(dynamicVerdict);
    setTacticalTip(dynamicTip);

    // Clamping final
    const clamp = (val: number) => Math.max(10, Math.min(99, val));
    setScores({
      lvl2: clamp(lvl2Val),
      lvl6: clamp(lvl6Val),
      siege: clamp(siegeVal),
      late: clamp(lateVal),
    });
  }, [allyDuo, enemyDuo]);

  const getScoreColor = (value: number) => {
    if (value >= 75) return "text-[#00c8c8]"; // Cian premium
    if (value >= 50) return "text-[#c8aa6e]"; // Dorado Hextech
    return "text-[#ff4655]"; // Rojo Valorant/League
  };

  const getScoreBg = (value: number) => {
    if (value >= 75) return "bg-[#00c8c8]";
    if (value >= 50) return "bg-gradient-to-r from-[#c8aa6e] to-[#785a28]";
    return "bg-[#ff4655]";
  };

  return (
    <div className="border border-[#c8aa6e]/30 bg-[#0a1428] p-5 rounded shadow-xl text-[#f0e6d3] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#c8aa6e]/30 pb-3">
        <Swords className="w-5 h-5 text-[#c8aa6e]" />
        <div>
          <h4 className="font-serif font-black text-xs md:text-sm uppercase tracking-widest text-[#c8aa6e]">
            Evaluador Matchup 2v2 Real
          </h4>
          <span className="text-[9px] text-[#a0a8b0] uppercase tracking-wider block">
            Simulador de ventaja táctica
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Metricas de Combate */}
        <div className="flex flex-col gap-3.5">
          {/* Nivel 2 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#a0a8b0]">
                <Award className="w-4 h-4 text-[#c8aa6e]" />
                Presión Nivel 2 (All-in)
              </span>
              <span className={`font-serif font-black ${getScoreColor(scores.lvl2)}`}>
                {scores.lvl2}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#1e232a] rounded-full overflow-hidden border border-[#c8aa6e]/10">
              <div className={`h-full transition-all duration-750 ${getScoreBg(scores.lvl2)}`} style={{ width: `${scores.lvl2}%` }} />
            </div>
          </div>

          {/* Nivel 6 */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#a0a8b0]">
                <Compass className="w-4 h-4 text-[#c8aa6e]" />
                Iniciación Nivel 6 (Ultimates)
              </span>
              <span className={`font-serif font-black ${getScoreColor(scores.lvl6)}`}>
                {scores.lvl6}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#1e232a] rounded-full overflow-hidden border border-[#c8aa6e]/10">
              <div className={`h-full transition-all duration-750 ${getScoreBg(scores.lvl6)}`} style={{ width: `${scores.lvl6}%` }} />
            </div>
          </div>

          {/* Asedio */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#a0a8b0]">
                <Swords className="w-4 h-4 text-[#c8aa6e]" />
                Presión Placas (Mid Game)
              </span>
              <span className={`font-serif font-black ${getScoreColor(scores.siege)}`}>
                {scores.siege}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#1e232a] rounded-full overflow-hidden border border-[#c8aa6e]/10">
              <div className={`h-full transition-all duration-750 ${getScoreBg(scores.siege)}`} style={{ width: `${scores.siege}%` }} />
            </div>
          </div>

          {/* Late Game */}
          <div className="flex flex-col gap-1">
            <div className="flex justify-between items-center text-xs font-bold">
              <span className="flex items-center gap-1.5 text-[#a0a8b0]">
                <Shield className="w-4 h-4 text-[#c8aa6e]" />
                Escalado Teamfight 5v5
              </span>
              <span className={`font-serif font-black ${getScoreColor(scores.late)}`}>
                {scores.late}%
              </span>
            </div>
            <div className="w-full h-2 bg-[#1e232a] rounded-full overflow-hidden border border-[#c8aa6e]/10">
              <div className={`h-full transition-all duration-750 ${getScoreBg(scores.late)}`} style={{ width: `${scores.late}%` }} />
            </div>
          </div>
        </div>

        {/* Panel de Veredicto Analitico */}
        <div className="bg-[#1e232a]/60 border border-[#c8aa6e]/20 p-4 rounded flex flex-col gap-3 justify-between">
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase tracking-wider font-extrabold text-[#c8aa6e] flex items-center gap-1">
              <ShieldAlert className="w-3.5 h-3.5 text-[#c8aa6e] animate-pulse" />
              Veredicto del Analista
            </span>
            <p className="text-xs md:text-sm text-[#f0e6d3] leading-relaxed italic">
              "{verdict}"
            </p>
          </div>

          <div className="border-t border-[#c8aa6e]/20 pt-3 flex gap-2.5 items-start">
            <AlertCircle className="w-4.5 h-4.5 text-[#00c8c8] shrink-0 mt-0.5" />
            <div className="flex flex-col gap-0.5">
              <span className="text-[8px] uppercase tracking-wider font-bold text-[#00c8c8]">
                Línea Directa de Juego
              </span>
              <p className="text-[11px] text-[#a0a8b0] leading-snug">
                {tacticalTip}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
