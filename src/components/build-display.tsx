// filepath: src/components/build-display.tsx
"use client";

import type { BuildData } from "@/lib/types";
import { BookOpen, Shield, Sword, Award } from "lucide-react";

interface BuildDisplayProps {
  build: BuildData;
}

export default function BuildDisplay({ build }: BuildDisplayProps) {
  const { title, runes, items, situationalItems, skillOrder, summonerSpells, notes } = build;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Col 1: Runas */}
      <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e]">
        <div className="flex items-center gap-2 mb-4 border-b border-[#eadecd] pb-2">
          <Award className="w-5 h-5 text-[#c8aa6e]" />
          <h3 className="lol-title font-bold text-sm text-[#0f1923]">
            Runas Recomendadas
          </h3>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          {/* Primary Tree */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-500/10 px-2 py-0.5 self-start rounded-sm">
              Rama Principal: {runes.primary.tree}
            </span>
            <span className="font-serif font-black text-sm text-[#0f1923] pl-1">
              {runes.primary.keystone}
            </span>
            <div className="flex flex-col gap-1 pl-3 border-l border-[#c8aa6e]/30">
              {runes.primary.runes.map((r, idx) => (
                <span key={idx} className="text-[#5e6b77]">• {r}</span>
              ))}
            </div>
          </div>

          {/* Secondary Tree */}
          <div className="flex flex-col gap-1.5 mt-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28] bg-[#c8aa6e]/10 px-2 py-0.5 self-start rounded-sm">
              Rama Secundaria: {runes.secondary.tree}
            </span>
            <div className="flex flex-col gap-1 pl-3 border-l border-[#c8aa6e]/30">
              {runes.secondary.runes.map((r, idx) => (
                <span key={idx} className="text-[#5e6b77]">• {r}</span>
              ))}
            </div>
          </div>

          {/* Shards */}
          <div className="flex flex-col gap-1 border-t border-[#eadecd]/60 pt-2.5 mt-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#5e6b77]">
              Fragmentos (Shards)
            </span>
            <div className="flex flex-wrap gap-1.5 mt-1">
              {runes.shards.map((s, idx) => (
                <span key={idx} className="bg-[#eadecd] border border-[#d8ccb4] text-[#785a28] px-2 py-0.5 rounded-sm text-[9px] font-mono">
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Col 2: Items & Spells */}
      <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e]">
        <div className="flex items-center gap-2 mb-4 border-b border-[#eadecd] pb-2">
          <Sword className="w-5 h-5 text-[#c8aa6e]" />
          <h3 className="lol-title font-bold text-sm text-[#0f1923]">
            Objetos & Hechizos
          </h3>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          {/* Summoners */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28]">
              Hechizos de Invocador
            </span>
            <div className="flex gap-2 mt-1">
              {summonerSpells.map((spell, idx) => (
                <span key={idx} className="bg-[#0a1428] text-[#f0e6d3] border border-[#c8aa6e] px-2.5 py-1 text-[10px] uppercase font-bold tracking-wider rounded-sm">
                  {spell}
                </span>
              ))}
            </div>
          </div>

          {/* Build Core */}
          <div className="flex flex-col gap-1 mt-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28]">
              Ruta Core (Parche 26.11)
            </span>
            <div className="flex flex-col gap-1.5 mt-1">
              {items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-[#fdfbf7] border border-[#eadecd] p-2 rounded-sm">
                  <span className="w-4 h-4 rounded-full bg-[#0a1428] text-[#c8aa6e] flex items-center justify-center text-[9px] font-mono font-bold">
                    {idx + 1}
                  </span>
                  <span className="font-semibold text-[#0f1923]">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Situational */}
          {situationalItems && situationalItems.length > 0 && (
            <div className="flex flex-col gap-1 mt-1">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#5e6b77]">
                Situacionales / Opcionales
              </span>
              <div className="flex flex-wrap gap-1.5 mt-1">
                {situationalItems.map((item, idx) => (
                  <span key={idx} className="bg-[#eadecd]/60 border border-[#d8ccb4]/60 text-[#5e6b77] px-2.5 py-1 rounded-sm text-[10px] font-medium">
                    {item}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Col 3: Habilidades & Plan Macro */}
      <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e]">
        <div className="flex items-center gap-2 mb-4 border-b border-[#eadecd] pb-2">
          <BookOpen className="w-5 h-5 text-[#c8aa6e]" />
          <h3 className="lol-title font-bold text-sm text-[#0f1923]">
            Planificación de Habilidades
          </h3>
        </div>

        <div className="flex flex-col gap-4 text-xs">
          {/* Skill Order */}
          <div className="flex flex-col gap-1">
            <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28]">
              Orden de Prioridad
            </span>
            <div className="bg-[#0a1428] border border-[#c8aa6e] p-3 text-center text-sm font-serif font-black tracking-widest text-[#f0e6d3] uppercase rounded-sm mt-1">
              {skillOrder.split(" (")[0]}
            </div>
            <p className="text-[10px] text-[#5e6b77] italic mt-1 leading-normal">
              {skillOrder.includes(" (") ? skillOrder.substring(skillOrder.indexOf(" (") + 2, skillOrder.length - 1) : ""}
            </p>
          </div>

          {/* Notes */}
          {notes && (
            <div className="flex flex-col gap-1.5 mt-2 border-t border-[#eadecd]/60 pt-3">
              <span className="text-[9px] uppercase font-extrabold tracking-wider text-rose-800 flex items-center gap-1">
                <Shield className="w-3 h-3" />
                Notas del Entrenador
              </span>
              <p className="text-[#0f1923] text-[11px] leading-relaxed bg-[#fdfbf7] border border-[#eadecd] p-3 rounded-sm italic">
                "{notes}"
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
