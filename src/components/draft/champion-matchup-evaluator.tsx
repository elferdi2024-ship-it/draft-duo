// filepath: src/components/draft/champion-matchup-evaluator.tsx
"use client";

import { useEffect, useState } from "react";
import { Shield, Swords, ShieldAlert, Award } from "lucide-react";
import type { DuoData } from "@/lib/types";

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

  useEffect(() => {
    // Calcular de forma heurística las ventajas del matchup 2v2
    let lvl2Val = 50;
    let lvl6Val = 50;
    let siegeVal = 50;
    let lateVal = 50;

    const allyTags = allyDuo.tags || [];
    const allyId = allyDuo.id;

    // 1. Heurísticas para la botlane aliada
    if (allyTags.includes("Aggressive") || allyTags.includes("Trades Cortos") || allyTags.includes("Burst")) {
      lvl2Val += 25;
    }
    if (allyTags.includes("Poke") || allyTags.includes("Velocidad")) {
      lvl2Val += 15;
      siegeVal += 30;
    }
    if (allyTags.includes("Dive") || allyTags.includes("All-In")) {
      lvl2Val += 20;
      lvl6Val += 25;
    }
    if (allyTags.includes("Late Game") || allyTags.includes("Scaling") || allyTags.includes("Hypercarry")) {
      lateVal += 35;
      lvl2Val -= 10;
    }
    if (allyTags.includes("Anti-engage") || allyTags.includes("Peel") || allyTags.includes("Protect")) {
      lateVal += 20;
      lvl2Val += 5;
    }

    // 2. Si el enemigo tiene picks revelados, ajustar dinámicamente
    if (enemyDuo && (enemyDuo.adcId || enemyDuo.supId)) {
      const enemyAdc = enemyDuo.adcId;
      const enemySup = enemyDuo.supId;

      // Penalizaciones / Bonificaciones específicas
      if (enemyAdc === "caitlyn" || enemySup === "lux") {
        // Contra poke de rango largo
        if (allyId === "ashe-karma" || allyId === "varus-karma") {
          siegeVal += 15;
        } else {
          lvl2Val -= 15;
          siegeVal -= 20;
        }
      }
      if (enemySup === "nautilus" || enemySup === "leona" || enemySup === "rell") {
        // Contra engage duro
        if (allyId === "ashe-renata" || allyId === "ashe-lulu" || allyId === "jinx-lulu") {
          lvl6Val += 20;
          lateVal += 15;
        } else {
          lvl2Val -= 10;
        }
      }
      if (enemyAdc === "jinx" || enemyAdc === "kaisa" || enemyAdc === "smolder") {
        // Contra escalado tardío
        if (allyTags.includes("Aggressive") || allyTags.includes("Snowball")) {
          lvl2Val += 15;
        }
      }
    }

    // Clamping entre 10 y 98%
    const clamp = (val: number) => Math.max(15, Math.min(98, val));

    setScores({
      lvl2: clamp(lvl2Val),
      lvl6: clamp(lvl6Val),
      siege: clamp(siegeVal),
      late: clamp(lateVal),
    });
  }, [allyDuo, enemyDuo]);

  const getScoreColor = (value: number) => {
    if (value >= 75) return "text-[#0397ab]";
    if (value >= 50) return "text-[#c8aa6e]";
    return "text-rose-500";
  };

  const getScoreBg = (value: number) => {
    if (value >= 75) return "bg-[#0397ab]";
    if (value >= 50) return "bg-gradient-to-r from-[#c8aa6e] to-[#785a28]";
    return "bg-rose-500";
  };

  return (
    <div className="border border-[#c8aa6e]/30 bg-[#0a1428]/95 p-4 rounded shadow-lg text-[#f0e6d3] flex flex-col gap-4">
      <div className="flex items-center gap-2 border-b border-[#c8aa6e]/30 pb-2">
        <Swords className="w-4 h-4 text-[#c8aa6e]" />
        <h4 className="font-serif font-black text-xs uppercase tracking-widest text-[#c8aa6e]">
          Evaluación Matchup 2v2 (%)
        </h4>
      </div>

      <div className="flex flex-col gap-3.5">
        {/* Nivel 2 */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-[#c8aa6e]" />
              Poder Nivel 2 (All-in early)
            </span>
            <span className={`font-serif font-black ${getScoreColor(scores.lvl2)}`}>
              {scores.lvl2}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1e232a] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ${getScoreBg(scores.lvl2)}`} style={{ width: `${scores.lvl2}%` }} />
          </div>
        </div>

        {/* Nivel 6 */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-[#c8aa6e]" />
              Poder Nivel 6 (Combo de R)
            </span>
            <span className={`font-serif font-black ${getScoreColor(scores.lvl6)}`}>
              {scores.lvl6}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1e232a] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ${getScoreBg(scores.lvl6)}`} style={{ width: `${scores.lvl6}%` }} />
          </div>
        </div>

        {/* Asedio / Placas */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <Swords className="w-3.5 h-3.5 text-[#c8aa6e]" />
              Presión de Asedio (Mid Game)
            </span>
            <span className={`font-serif font-black ${getScoreColor(scores.siege)}`}>
              {scores.siege}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1e232a] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ${getScoreBg(scores.siege)}`} style={{ width: `${scores.siege}%` }} />
          </div>
        </div>

        {/* Late Game Teamfights */}
        <div className="flex flex-col gap-1">
          <div className="flex justify-between items-center text-xs font-bold">
            <span className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#c8aa6e]" />
              Escalado / Teamfights 5v5
            </span>
            <span className={`font-serif font-black ${getScoreColor(scores.late)}`}>
              {scores.late}%
            </span>
          </div>
          <div className="w-full h-1.5 bg-[#1e232a] rounded-full overflow-hidden">
            <div className={`h-full transition-all duration-700 ${getScoreBg(scores.late)}`} style={{ width: `${scores.late}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}
