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
    selectedBanSlot,
    setSelectedBanSlot,
    autoFillBans,
  } = useDraftStore();

  const [version, setVersion] = useState("15.11.1");
  const [selectedSide, setSelectedSide] = useState<"blue" | "red">("blue");
  const [selectedSlots, setSelectedSlots] = useState<number[]>([3, 4]); // Por defecto Picks 4 y 5 (índices 3 y 4)
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

  const handleSlotClick = (slotIndex: number) => {
    setSelectedSlots((prev) => {
      if (prev.includes(slotIndex)) {
        return prev.filter((s) => s !== slotIndex);
      }
      if (prev.length < 2) {
        return [...prev, slotIndex].sort((a, b) => a - b);
      }
      // Si ya hay 2, sacamos el primero seleccionado y agregamos el nuevo, luego ordenamos
      return [prev[1], slotIndex].sort((a, b) => a - b);
    });
  };

  const handleStartDraft = () => {
    if (selectedSlots.length !== 2) return;
    initDraft(selectedSide, [selectedSlots[0], selectedSlots[1]]);
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
              2. Tus Posiciones de Pick (Selecciona exactamente 2)
            </label>
            <div className="grid grid-cols-5 gap-2">
              {[
                { label: "Pick 1", index: 0 },
                { label: "Pick 2", index: 1 },
                { label: "Pick 3", index: 2 },
                { label: "Pick 4", index: 3 },
                { label: "Pick 5", index: 4 },
              ].map((opt) => {
                const isSelected = selectedSlots.includes(opt.index);
                const orderLabel = isSelected
                  ? selectedSlots.indexOf(opt.index) === 0
                    ? " (ADC)"
                    : " (SUP)"
                  : "";

                return (
                  <button
                    key={opt.label}
                    onClick={() => handleSlotClick(opt.index)}
                    className={`py-3.5 border rounded text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 ${
                      isSelected
                        ? "bg-[#0a1428] border-[#c8aa6e] text-[#f0e6d3] shadow-md scale-[1.02]"
                        : "bg-[#eadecd]/60 border-[#d8ccb4] text-[#785a28] hover:bg-[#e7dbbf]"
                    }`}
                  >
                    <span>{opt.label}</span>
                    {isSelected && (
                      <span className="text-[8px] uppercase text-[#c8aa6e] font-black tracking-wide">
                        {orderLabel}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-[#5e6b77] italic mt-1 leading-normal">
              Selecciona dos picks del 1 al 5 en el orden en que los harás en la sala. El de menor número será tu ADC y el mayor tu Soporte.
            </p>
          </div>

          <button
            onClick={handleStartDraft}
            disabled={selectedSlots.length !== 2}
            className="w-full py-3.5 mt-4 lol-button lol-button-active font-serif text-sm tracking-widest uppercase transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
    <div className="flex flex-col gap-5 md:gap-6 w-full h-full">
      {/* Draft Header: Ban display */}
      <div className="lol-panel p-5 md:p-6 flex flex-col md:flex-row items-center justify-between gap-5 bg-[#fdfcf9]">
        {/* Blue Bans (5 slots) */}
        <div className="flex items-center gap-3.5 flex-1">
          <span className="text-xs md:text-sm uppercase font-extrabold text-[#0397ab] tracking-widest w-20 shrink-0">
            Bans Azul
          </span>
          <div className="flex gap-1.5">
            {blueBans.map((id, index) => {
              const champ = getChampionById(id);
              const isSelected = selectedBanSlot?.team === "blue" && selectedBanSlot?.index === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedBanSlot({ team: "blue", index })}
                  className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] border rounded bg-[#eadecd] relative overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                    isSelected ? "lol-slot-active border-[#0397ab] ring-2 ring-[#0397ab]/40 animate-pulse" : "border-[#d8ccb4] hover:border-[#c8aa6e]"
                  }`}
                  title="Haz clic para seleccionar o cambiar este ban"
                >
                  {champ ? (
                    <Image
                      src={getChampionIconUrl(version, champ.ddragonKey)}
                      alt={champ.name}
                      fill
                      className="object-cover grayscale filter opacity-75 hover:opacity-100 transition-opacity"
                      sizes="50px"
                    />
                  ) : (
                    <span className="text-xs md:text-sm text-[#785a28] font-bold">{index + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase Indicator */}
        <div className="text-center shrink-0 flex items-center justify-center bg-[#0a1428] px-7 py-3 border-2 border-[#c8aa6e] shadow-md rounded-sm min-w-[200px]">
          <span className="font-serif font-black text-sm md:text-base text-[#f0e6d3] tracking-widest uppercase shimmer-text-light">
            {step ? step.label : "Fase Completada"}
          </span>
        </div>

        {/* Red Bans (5 slots) */}
        <div className="flex items-center gap-3.5 flex-1 justify-end">
          <div className="flex gap-1.5">
            {redBans.map((id, index) => {
              const champ = getChampionById(id);
              const isSelected = selectedBanSlot?.team === "red" && selectedBanSlot?.index === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedBanSlot({ team: "red", index })}
                  className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] border rounded bg-[#eadecd] relative overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                    isSelected ? "lol-slot-active border-[#0397ab] ring-2 ring-[#0397ab]/40 animate-pulse" : "border-[#d8ccb4] hover:border-[#c8aa6e]"
                  }`}
                  title="Haz clic para seleccionar o cambiar este ban"
                >
                  {champ ? (
                    <Image
                      src={getChampionIconUrl(version, champ.ddragonKey)}
                      alt={champ.name}
                      fill
                      className="object-cover grayscale filter opacity-75 hover:opacity-100 transition-opacity"
                      sizes="50px"
                    />
                  ) : (
                    <span className="text-xs md:text-sm text-[#785a28] font-bold">{index + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-xs md:text-sm uppercase font-extrabold text-rose-600 tracking-widest w-20 text-right shrink-0">
            Bans Rojo
          </span>
        </div>
      </div>

      {/* Ban Instructions & AutoFill */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#eadecd]/30 border border-[#c8aa6e]/30 px-5 py-2.5 rounded-sm">
        <span className="text-xs text-[#785a28] font-bold leading-normal text-center sm:text-left">
          💡 <span className="underline">Bans Simultáneos</span>: Haz clic en cualquiera de las 10 ranuras numeradas arriba, luego selecciona un campeón del grid para banearlo.
        </span>
        <button
          onClick={autoFillBans}
          className="px-4 py-2 border border-[#c8aa6e] bg-[#0a1428] text-[#f0e6d3] hover:bg-[#c8aa6e] hover:text-[#0a1428] text-xs font-black uppercase tracking-widest transition-all rounded shadow-sm shrink-0 cursor-pointer"
        >
          Auto-rellenar Bans de Confort
        </button>
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
