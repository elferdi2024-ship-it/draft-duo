// filepath: src/components/draft/draft-board.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDraftStore } from "@/store/draft-store";
import { DRAFT_ORDER } from "@/lib/types";
import { getChampionIconUrl, getLatestVersion } from "@/lib/ddragon";
import PickSlot from "./pick-slot";
import ChampionGrid from "./champion-grid";
import { ArrowLeftRight, HelpCircle, Trophy } from "lucide-react";

export default function DraftBoard() {
  const {
    side,
    currentStepIndex,
    blueBans,
    redBans,
    bluePicks,
    redPicks,
    myPickSlots,
    allChampions,
    loadChampions,
    initDraft,
    setChampion,
    isComplete,
  } = useDraftStore();

  const [version, setVersion] = useState("15.11.1");
  const [selectedSide, setSelectedSide] = useState<"blue" | "red">("blue");
  const [slotsConfig, setSlotsConfig] = useState<[number, number]>([3, 4]); // Default to Pick 4 & 5
  const [mobileSubTab, setMobileSubTab] = useState<"picks" | "grid">("grid");

  useEffect(() => {
    loadChampions();
    getLatestVersion().then(setVersion);
  }, []);

  const getChampionById = (id: string | null): any => {
    if (!id) return null;
    return allChampions.find((c) => c.id === id) || null;
  };

  // Check if slot index belongs to our team and is one of our pick slots
  const checkIsOurs = (team: "blue" | "red", index: number): boolean => {
    return side === team && myPickSlots.includes(index);
  };

  const getMyRoleName = (index: number): "ADC" | "SUPPORT" | undefined => {
    if (index === myPickSlots[0]) return "ADC";
    if (index === myPickSlots[1]) return "SUPPORT";
    return undefined;
  };

  const handleStartDraft = () => {
    initDraft(selectedSide, slotsConfig);
  };

  // If side is null, show setup/configuration screen
  if (side === null) {
    return (
      <div className="lol-panel max-w-2xl mx-auto p-6 md:p-8 bg-[#fcf9f2] border border-[#c8aa6e]">
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 text-[#c8aa6e] mx-auto mb-2 animate-bounce" />
          <h2 className="lol-title text-2xl font-serif text-[#0f1923] tracking-widest uppercase">
            Iniciar Live Draft
          </h2>
          <p className="text-xs text-[#5e6b77] uppercase font-bold tracking-wider mt-1">
            Configura el lado y turnos de selección para tu duo
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Lado selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-[#785a28]">
              1. Selecciona tu Lado del Draft
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedSide("blue")}
                className={`py-6 border rounded font-serif font-black uppercase text-sm md:text-base tracking-widest transition-all ${
                  selectedSide === "blue"
                    ? "bg-[#0397ab]/10 border-[#0397ab] text-[#0397ab]"
                    : "bg-[#eadecd]/60 border-[#d8ccb4] text-[#5e6b77] hover:bg-[#e7dbbf]"
                }`}
              >
                Lado Azul (Blue Side)
                <span className="block text-[9px] uppercase tracking-normal font-sans font-bold text-[#5e6b77] mt-1">
                  Tiene primer pick
                </span>
              </button>
              <button
                onClick={() => setSelectedSide("red")}
                className={`py-6 border rounded font-serif font-black uppercase text-sm md:text-base tracking-widest transition-all ${
                  selectedSide === "red"
                    ? "bg-rose-500/10 border-rose-500 text-rose-600"
                    : "bg-[#eadecd]/60 border-[#d8ccb4] text-[#5e6b77] hover:bg-[#e7dbbf]"
                }`}
              >
                Lado Rojo (Red Side)
                <span className="block text-[9px] uppercase tracking-normal font-sans font-bold text-[#5e6b77] mt-1">
                  Tiene counterpick final
                </span>
              </button>
            </div>
          </div>

          {/* Posiciones de Pick selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-[#785a28]">
              2. Tus Posiciones de Pick (ADC + Soporte)
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[
                { label: "Picks 1 + 2", slots: [0, 1] as [number, number] },
                { label: "Picks 2 + 3", slots: [1, 2] as [number, number] },
                { label: "Picks 3 + 4", slots: [2, 3] as [number, number] },
                { label: "Picks 4 + 5", slots: [3, 4] as [number, number] },
              ].map((opt) => {
                const isSelected = slotsConfig[0] === opt.slots[0] && slotsConfig[1] === opt.slots[1];
                return (
                  <button
                    key={opt.label}
                    onClick={() => setSlotsConfig(opt.slots)}
                    className={`py-3.5 border rounded text-xs font-bold transition-all ${
                      isSelected
                        ? "bg-[#0a1428] border-[#c8aa6e] text-[#f0e6d3] shadow-md"
                        : "bg-[#eadecd]/60 border-[#d8ccb4] text-[#785a28] hover:bg-[#e7dbbf]"
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#5e6b77] italic mt-1 leading-normal">
              Marca las posiciones exactas donde tu ADC y Soporte serán seleccionados en la fase de picks real. El Competitive Brain te dirá cuándo te toca elegir.
            </p>
          </div>

          <button
            onClick={handleStartDraft}
            className="w-full py-3.5 mt-4 lol-button lol-button-active font-serif text-sm tracking-widest uppercase transition-all shadow-md"
          >
            Iniciar Simulación
          </button>
        </div>
      </div>
    );
  }

  // Active step details
  const step = currentStepIndex < DRAFT_ORDER.length ? DRAFT_ORDER[currentStepIndex] : null;

  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full h-full">
      {/* Draft Header: Ban display */}
      <div className="lol-panel p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-[#fdfcf9]">
        {/* Blue Bans (5 slots) */}
        <div className="flex items-center gap-4 flex-1">
          <span className="text-xs md:text-sm uppercase font-extrabold text-[#0397ab] tracking-widest w-20 shrink-0">
            Bans Azul
          </span>
          <div className="flex gap-2">
            {blueBans.map((id, index) => {
              const champ = getChampionById(id);
              const isActive =
                step?.team === "blue" && step?.type === "ban" && step?.index === index;

              return (
                <div
                  key={index}
                  className={`w-[44px] h-[44px] md:w-[58px] md:h-[58px] border rounded bg-[#eadecd] relative overflow-hidden flex items-center justify-center transition-all ${
                    isActive ? "lol-slot-active border-[#0397ab]" : "border-[#d8ccb4] hover:border-[#c8aa6e]"
                  }`}
                >
                  {champ ? (
                    <Image
                      src={getChampionIconUrl(version, champ.ddragonKey)}
                      alt={champ.name}
                      fill
                      className="object-cover grayscale filter opacity-75 hover:opacity-100 transition-opacity"
                      sizes="58px"
                    />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0397ab] animate-ping" />
                  ) : (
                    <span className="text-xs md:text-sm text-[#5e6b77] font-bold">{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="text-center shrink-0 flex items-center justify-center bg-[#0a1428] px-9 py-4 border-2 border-[#c8aa6e] shadow-md rounded-sm min-w-[240px]">
          <span className="font-serif font-black text-base md:text-lg text-[#f0e6d3] tracking-widest uppercase shimmer-text-light">
            {step ? step.label : "Fase Completada"}
          </span>
        </div>

        {/* Red Bans (5 slots) */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <div className="flex gap-2">
            {redBans.map((id, index) => {
              const champ = getChampionById(id);
              const isActive =
                step?.team === "red" && step?.type === "ban" && step?.index === index;

              return (
                <div
                  key={index}
                  className={`w-[44px] h-[44px] md:w-[58px] md:h-[58px] border rounded bg-[#eadecd] relative overflow-hidden flex items-center justify-center transition-all ${
                    isActive ? "lol-slot-active border-[#0397ab]" : "border-[#d8ccb4] hover:border-[#c8aa6e]"
                  }`}
                >
                  {champ ? (
                    <Image
                      src={getChampionIconUrl(version, champ.ddragonKey)}
                      alt={champ.name}
                      fill
                      className="object-cover grayscale filter opacity-75 hover:opacity-100 transition-opacity"
                      sizes="58px"
                    />
                  ) : isActive ? (
                    <div className="w-2.5 h-2.5 rounded-full bg-[#0397ab] animate-ping" />
                  ) : (
                    <span className="text-xs md:text-sm text-[#5e6b77] font-bold">{index + 1}</span>
                  )}
                </div>
              );
            })}
          </div>
          <span className="text-xs md:text-sm uppercase font-extrabold text-rose-600 tracking-widest w-20 text-right shrink-0">
            Bans Rojo
          </span>
        </div>
      </div>

      {/* Mobile Sub-Tab Switcher */}
      <div className="flex lg:hidden border border-[#c8aa6e] bg-[#fdfcf9] rounded p-1.5 gap-1 shadow-sm mt-1">
        <button
          onClick={() => setMobileSubTab("grid")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all text-center cursor-pointer ${
            mobileSubTab === "grid"
              ? "bg-[#0a1428] text-[#f0e6d3] shadow-sm"
              : "text-[#785a28] hover:bg-[#eadecd]/30"
          }`}
        >
          🔍 Selección (Grid)
        </button>
        <button
          onClick={() => setMobileSubTab("picks")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all text-center cursor-pointer ${
            mobileSubTab === "picks"
              ? "bg-[#0a1428] text-[#f0e6d3] shadow-sm"
              : "text-[#785a28] hover:bg-[#eadecd]/30"
          }`}
        >
          ⚔️ Ver Picks (Bot)
        </button>
      </div>

      {/* Board Layout: Side picks + Grid */}
      <div className={`grid gap-6 md:gap-8 items-stretch ${
        mobileSubTab === "picks" ? "grid-cols-2 lg:grid-cols-12" : "grid-cols-1 lg:grid-cols-12"
      }`}>
        {/* Left Side (Blue picks) */}
        <div className={
          mobileSubTab === "picks" 
            ? "col-span-1 lg:col-span-3 flex flex-col gap-4" 
            : "hidden lg:flex lg:col-span-3 flex-col gap-4"
        }>
          <div className="bg-[#0397ab]/10 border border-[#0397ab]/30 text-[#005a82] text-xs md:text-sm uppercase tracking-widest font-black py-3 px-4 rounded-sm text-center shadow-sm">
            Equipo Azul
          </div>
          {bluePicks.map((id, index) => {
            const champ = getChampionById(id);
            const isActive =
              step?.team === "blue" && step?.type === "pick" && step?.index === index;
            const isOurs = checkIsOurs("blue", index);
            const myRole = getMyRoleName(index);

            return (
              <PickSlot
                key={index}
                champion={champ}
                roleLabel={`Pick ${index + 1}`}
                isActive={isActive}
                isOurs={isOurs}
                myRoleName={myRole}
                team="blue"
              />
            );
          })}
        </div>

        {/* Center Champion Selection Grid */}
        <div className={
          mobileSubTab === "grid" 
            ? "col-span-1 lg:col-span-6 flex flex-col w-full h-full" 
            : "hidden lg:flex lg:col-span-6 flex-col w-full h-full"
        }>
          <ChampionGrid
            onSelectChampion={setChampion}
            disabled={isComplete}
          />
        </div>

        {/* Right Side (Red picks) */}
        <div className={
          mobileSubTab === "picks" 
            ? "col-span-1 lg:col-span-3 flex flex-col gap-4" 
            : "hidden lg:flex lg:col-span-3 flex-col gap-4"
        }>
          <div className="bg-rose-500/10 border border-rose-500/30 text-rose-800 text-xs md:text-sm uppercase tracking-widest font-black py-3 px-4 rounded-sm text-center shadow-sm">
            Equipo Rojo
          </div>
          {redPicks.map((id, index) => {
            const champ = getChampionById(id);
            const isActive =
              step?.team === "red" && step?.type === "pick" && step?.index === index;
            const isOurs = checkIsOurs("red", index);
            const myRole = getMyRoleName(index);

            return (
              <PickSlot
                key={index}
                champion={champ}
                roleLabel={`Pick ${index + 1}`}
                isActive={isActive}
                isOurs={isOurs}
                myRoleName={myRole}
                team="red"
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}
