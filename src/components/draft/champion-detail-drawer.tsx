// filepath: src/components/draft/champion-detail-drawer.tsx
"use client";

import Image from "next/image";
import { X, Heart, Sparkles, Swords, Shield, AlertTriangle } from "lucide-react";
import { getChampionIconUrl } from "@/lib/ddragon";
import type { ChampionData } from "@/lib/types";
import { motion, useReducedMotion } from "framer-motion";

interface ChampionDetailDrawerProps {
  champion: ChampionData | null;
  onClose: () => void;
  onSelect: (championId: string) => void;
  isMyTurn: boolean;
  version: string;
}

export default function ChampionDetailDrawer({
  champion,
  onClose,
  onSelect,
  isMyTurn,
  version,
}: ChampionDetailDrawerProps) {
  const shouldReduceMotion = useReducedMotion();

  if (!champion) return null;

  const getTierStyle = (tier: string) => {
    switch (tier) {
      case "S+":
        return "bg-amber-500 text-[#010a13] border border-[#f0e6d3] font-serif font-black animate-pulse";
      case "S":
        return "bg-amber-500/80 text-[#010a13] font-serif font-bold";
      case "A+":
      case "A":
        return "bg-[#00c8c8] text-[#010a13] font-bold";
      default:
        return "bg-[#1e232a] text-[#8a9dae] border border-[#785a28]/40";
    }
  };

  const getLearningBadge = (status?: string) => {
    switch (status) {
      case "mastered":
        return "bg-[#00c8c8]/10 border-[#00c8c8] text-[#00c8c8]";
      case "learning":
        return "bg-amber-500/10 border-amber-500/60 text-amber-500";
      case "backup":
        return "bg-slate-700/10 border-slate-500/40 text-[#8a9dae]";
      default:
        return null;
    }
  };

  const slideVariants: any = {
    hidden: { x: shouldReduceMotion ? 0 : "100%", opacity: shouldReduceMotion ? 0 : 1 },
    visible: { x: 0, opacity: 1, transition: { type: "spring", damping: 20, stiffness: 150 } },
    exit: { x: shouldReduceMotion ? 0 : "100%", opacity: shouldReduceMotion ? 0 : 0, transition: { duration: 0.2 } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit="exit"
      variants={slideVariants}
      className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-[#091420] border-l border-[#c8aa6e] shadow-2xl z-[100] flex flex-col text-[#f0e6d3] outline-none"
      aria-label={`Detalles de campeón: ${champion.name}`}
      role="dialog"
      aria-modal="true"
    >
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-5 border-b border-[#c8aa6e]/30 bg-[#0a1428]">
        <div className="flex items-center gap-3">
          <div className="relative w-12 h-12 rounded border border-[#c8aa6e] overflow-hidden bg-[#010a13]">
            <Image
              src={getChampionIconUrl(version, champion.ddragonKey)}
              alt={champion.name}
              fill
              className="object-cover"
              sizes="48px"
            />
          </div>
          <div className="flex flex-col">
            <h3 className="font-serif font-black text-lg md:text-xl tracking-wider text-[#f0e6d3]">
              {champion.name}
            </h3>
            <span className="text-[10px] text-[#c8aa6e] uppercase tracking-widest font-black">
              {champion.role} • Patch 26.11
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 border border-[#785a28]/40 rounded bg-[#1e232a]/40 text-[#c8aa6e] hover:bg-amber-500 hover:text-[#010a13] hover:border-[#f0e6d3] transition-all cursor-pointer"
          aria-label="Cerrar detalles de campeón"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Scrollable Content */}
      <div className="flex-1 overflow-y-auto p-5 md:p-6 flex flex-col gap-6">
        {/* Tier and comfort status */}
        <div className="flex flex-wrap gap-2.5">
          <span className={`text-[10px] uppercase font-black tracking-widest px-3 py-1 rounded-sm ${getTierStyle(champion.tier || "A")}`}>
            Tier {champion.tier || "A"}
          </span>
          {champion.isOwnPool && (
            <span className="flex items-center gap-1.5 text-[10px] uppercase font-black tracking-widest bg-rose-950/20 border border-rose-500 text-rose-500 px-3 py-1 rounded-sm">
              <Heart className="w-3.5 h-3.5 fill-rose-500" />
              Confort Pool
            </span>
          )}
          {champion.learningStatus && (
            <span className={`text-[10px] uppercase font-black tracking-widest border px-3 py-1 rounded-sm ${getLearningBadge(champion.learningStatus)}`}>
              {champion.learningStatus === "mastered"
                ? "Dominado"
                : champion.learningStatus === "learning"
                ? "En Aprendizaje"
                : "Backup"}
            </span>
          )}
        </div>

        {/* Philosophy Card */}
        <div className="p-4 border border-[#c8aa6e]/20 bg-[#1e232a]/30 rounded">
          <span className="text-[9px] uppercase font-black tracking-widest text-[#c8aa6e] flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" />
            Filosofía Estratégica
          </span>
          <p className="text-xs md:text-sm text-[#f0e6d3] mt-2 leading-relaxed italic">
            "{champion.philosophy || "Equilibrio táctico y respuesta adaptativa en la botlane."}"
          </p>
        </div>

        {/* Dynamic Tags */}
        {champion.tags && champion.tags.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#8a9dae]">
              Características
            </span>
            <div className="flex flex-wrap gap-1.5">
              {champion.tags.map((tag) => (
                <span key={tag} className="text-[10px] font-bold bg-[#1e2830] text-[#00c8c8] px-2.5 py-1 rounded border border-[#00c8c8]/30">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* When to pick */}
        {champion.pickWhen && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#8a9dae] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#c8aa6e]" />
              Cuándo Seleccionar
            </span>
            <p className="text-xs text-[#a0a8b0] leading-relaxed pl-1">
              {champion.pickWhen}
            </p>
          </div>
        )}

        {/* Dynamic Win Condition */}
        {champion.winCondition && (
          <div className="flex flex-col gap-2 border-t border-[#785a28]/20 pt-4">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#c8aa6e] flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
              Directiva de Victoria (Win Condition)
            </span>
            <p className="text-xs text-[#f0e6d3] leading-relaxed pl-1 bg-[#1a2233]/40 p-3 rounded border-l-2 border-amber-500">
              {champion.winCondition}
            </p>
          </div>
        )}

        {/* Spikes */}
        {champion.powerSpikes && champion.powerSpikes.length > 0 && (
          <div className="flex flex-col gap-2">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#8a9dae]">
              Picos de Poder (Spikes)
            </span>
            <ul className="text-xs text-[#a0a8b0] flex flex-col gap-1.5 pl-4 list-disc">
              {champion.powerSpikes.map((spike) => (
                <li key={spike}>{spike}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Matchup Synergies & Counters */}
        <div className="grid grid-cols-2 gap-4 border-t border-[#785a28]/20 pt-4">
          {/* Synergies */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#00c8c8] flex items-center gap-1">
              <Swords className="w-3.5 h-3.5" />
              Sinergias
            </span>
            <div className="flex flex-col gap-1.5">
              {champion.synergies && champion.synergies.length > 0 ? (
                champion.synergies.map((syn) => (
                  <span key={syn} className="text-xs text-[#f0e6d3] pl-1 block font-medium">
                    ✓ {syn}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#8a9dae] italic pl-1">Matchups estándar</span>
              )}
            </div>
          </div>

          {/* Counters */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[9px] uppercase font-black tracking-widest text-[#ff4655] flex items-center gap-1">
              <AlertTriangle className="w-3.5 h-3.5" />
              Amenazas / Counters
            </span>
            <div className="flex flex-col gap-1.5">
              {champion.counters && champion.counters.length > 0 ? (
                champion.counters.map((c) => (
                  <span key={c} className="text-xs text-[#ff4655] pl-1 block font-medium">
                    ✗ {c}
                  </span>
                ))
              ) : (
                <span className="text-xs text-[#8a9dae] italic pl-1">Ninguno directo</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawer Action Footer */}
      {isMyTurn && (
        <div className="p-5 border-t border-[#c8aa6e]/30 bg-[#0a1428] flex gap-3">
          <button
            onClick={() => {
              onSelect(champion.id);
              onClose();
            }}
            className="w-full py-3.5 bg-[#c8aa6e] hover:bg-[#785a28] text-[#010a13] hover:text-[#f0e6d3] border border-[#f0e6d3]/20 font-serif font-black uppercase text-xs md:text-sm tracking-widest transition-all rounded shadow-lg cursor-pointer"
          >
            Confirmar Selección
          </button>
        </div>
      )}
    </motion.div>
  );
}
