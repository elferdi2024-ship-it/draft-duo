// filepath: src/components/draft/draft-board.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useDraftStore } from "@/store/draft-store";
import { useShallow } from "zustand/react/shallow";
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
    isBridgeConnected,
    connectBridge,
    disconnectBridge,
  } = useDraftStore(useShallow((state) => ({
    side: state.side,
    currentStepIndex: state.currentStepIndex,
    blueBans: state.blueBans,
    redBans: state.redBans,
    bluePicks: state.bluePicks,
    redPicks: state.redPicks,
    myPickSlots: state.myPickSlots,
    allChampions: state.allChampions,
    loadChampions: state.loadChampions,
    initDraft: state.initDraft,
    setChampion: state.setChampion,
    isComplete: state.isComplete,
    selectedBanSlot: state.selectedBanSlot,
    setSelectedBanSlot: state.setSelectedBanSlot,
    autoFillBans: state.autoFillBans,
    isBridgeConnected: state.isBridgeConnected,
    connectBridge: state.connectBridge,
    disconnectBridge: state.disconnectBridge,
  })));

  const [version, setVersion] = useState("15.11.1");
  const [selectedSide, setSelectedSide] = useState<"blue" | "red">("blue");
  const [selectedSlots, setSelectedSlots] = useState<number[]>([3, 4]); // Picks 4 y 5
  const [mobileSubTab, setMobileSubTab] = useState<"picks" | "grid">("grid");

  useEffect(() => {
    loadChampions();
    getLatestVersion().then(setVersion);
    connectBridge();
    return () => {
      disconnectBridge();
    };
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
      // Si ya hay 2, sacamos el primero seleccionado y agregamos el nuevo
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
      <div className="lol-panel max-w-2xl mx-auto p-6 md:p-8 bg-[#091420] border border-[#785a28] text-[#f0e6d3] shadow-2xl">
        <div className="text-center mb-8">
          <Trophy className="w-12 h-12 text-[#c8aa6e] mx-auto mb-2 animate-bounce" />
          <h2 className="lol-title text-2xl font-serif text-[#f0e6d3] tracking-widest uppercase">
            Iniciar Live Draft
          </h2>
          <p className="text-xs text-[#8a9dae] uppercase font-bold tracking-wider mt-1.5">
            Configura el lado y turnos de selección para tu duo
          </p>
        </div>

        <div className="flex flex-col gap-6">
          {/* Lado selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-[#c8aa6e]">
              1. Selecciona tu Lado del Draft
            </label>
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => setSelectedSide("blue")}
                className={`py-6 border rounded font-serif font-black uppercase text-sm md:text-base tracking-widest transition-all cursor-pointer ${
                  selectedSide === "blue"
                    ? "bg-[#00c8c8]/10 border-[#00c8c8] text-[#00c8c8] shadow-[0_0_12px_rgba(0,200,200,0.15)]"
                    : "bg-[#1e232a]/40 border-[#785a28]/30 text-[#8a9dae] hover:bg-[#1e232a]"
                }`}
              >
                Lado Azul (Blue Side)
                <span className="block text-[9px] uppercase tracking-normal font-sans font-bold text-[#8a9dae] mt-1">
                  Tiene primer pick
                </span>
              </button>
              <button
                onClick={() => setSelectedSide("red")}
                className={`py-6 border rounded font-serif font-black uppercase text-sm md:text-base tracking-widest transition-all cursor-pointer ${
                  selectedSide === "red"
                    ? "bg-[#ff4655]/10 border-[#ff4655] text-[#ff4655] shadow-[0_0_12px_rgba(255,70,85,0.15)]"
                    : "bg-[#1e232a]/40 border-[#785a28]/30 text-[#8a9dae] hover:bg-[#1e232a]"
                }`}
              >
                Lado Rojo (Red Side)
                <span className="block text-[9px] uppercase tracking-normal font-sans font-bold text-[#8a9dae] mt-1">
                  Tiene counterpick final
                </span>
              </button>
            </div>
          </div>

          {/* Posiciones de Pick selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase font-extrabold tracking-wider text-[#c8aa6e]">
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
                    className={`py-3.5 border rounded text-xs font-bold transition-all flex flex-col items-center justify-center gap-1 cursor-pointer ${
                      isSelected
                        ? "bg-[#0a1428] border-[#c8aa6e] text-[#f0e6d3] shadow-md scale-[1.02]"
                        : "bg-[#1e232a]/60 border-[#785a28]/30 text-[#8a9dae] hover:bg-[#1e232a]"
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
            <p className="text-[10px] text-[#8a9dae] italic mt-1.5 leading-normal">
              Selecciona dos picks del 1 al 5 en el orden en que los harás en la sala. El de menor número será tu ADC y el mayor tu Soporte.
            </p>
          </div>

          <button
            onClick={handleStartDraft}
            disabled={selectedSlots.length !== 2}
            className="w-full py-4 mt-4 lol-button lol-button-active font-serif text-sm tracking-widest uppercase transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
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
    <div className="flex flex-col gap-4 lg:gap-2.5 w-full h-full text-[#f0e6d3] lg:min-h-0 lg:overflow-hidden">
      {/* Draft Header: Ban display */}
      <div className="lol-panel p-4 lg:p-2.5 flex flex-col md:flex-row items-center justify-between gap-4 lg:gap-3 bg-[#091420] border border-[#785a28]/60 shadow-xl shrink-0">
        {/* Blue Bans (5 slots) */}
        <div className="flex items-center gap-3 flex-1 w-full justify-between md:justify-start">
          <span className="text-xs md:text-sm lg:text-[11px] uppercase font-extrabold text-[#00c8c8] tracking-widest w-20 lg:w-16 shrink-0">
            Bans Azul
          </span>
          <div className="flex gap-1.5 lg:gap-1">
            {blueBans.map((id, index) => {
              const champ = getChampionById(id);
              const isSelected = selectedBanSlot?.team === "blue" && selectedBanSlot?.index === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedBanSlot({ team: "blue", index })}
                  className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[35px] lg:h-[35px] border rounded bg-[#1e232a]/60 relative overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                    isSelected 
                      ? "lol-slot-active border-[#00c8c8] ring-2 ring-[#00c8c8]/40 animate-pulse" 
                      : "border-[#785a28]/40 hover:border-[#c8aa6e]"
                  }`}
                  title="Haz clic para seleccionar o cambiar este ban"
                  aria-label={champ ? `Baneo Azul ${index + 1}: ${champ.name}` : `Ranura de baneo Azul ${index + 1} vacía. Haz clic para asignar baneo.`}
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
                    <span className="text-xs md:text-sm lg:text-xs text-[#c8aa6e] font-bold">{index + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Phase Indicator & LCU Sincronización */}
        <div className="flex flex-col items-center gap-2 lg:gap-1 shrink-0">
          <div className="text-center shrink-0 flex items-center justify-center bg-[#0a1428] px-7 py-3 lg:py-1.5 lg:px-4 border-2 border-[#c8aa6e] shadow-md rounded-sm min-w-[200px] lg:min-w-[150px]">
            <span className="font-serif font-black text-sm md:text-base lg:text-xs text-[#f0e6d3] tracking-widest uppercase shimmer-text-light">
              {step ? step.label : "Fase Completada"}
            </span>
          </div>
          <button
            onClick={isBridgeConnected ? disconnectBridge : connectBridge}
            className={`px-3 py-1 lg:py-0.5 lg:px-2 border rounded-sm text-[9px] font-black uppercase tracking-widest transition-all cursor-pointer ${
              isBridgeConnected
                ? "bg-emerald-950/20 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white"
                : "bg-rose-950/20 border-rose-600 text-rose-500 hover:bg-rose-600 hover:text-white animate-pulse"
            }`}
            title={isBridgeConnected ? "Sincronización activa. Haz clic para desconectar." : "Sincronización inactiva. Haz clic para conectar tu cliente de LoL en vivo."}
            aria-label={isBridgeConnected ? "Sincronización de cliente LCU activa. Haz clic para desconectar." : "Sincronización de cliente LCU inactiva. Haz clic para conectar cliente de League."}
          >
            {isBridgeConnected ? "🟢 LCU" : "🔴 Conectar"}
          </button>
        </div>

        {/* Red Bans (5 slots) */}
        <div className="flex items-center gap-3 flex-1 w-full justify-between md:justify-end">
          <div className="flex gap-1.5 lg:gap-1">
            {redBans.map((id, index) => {
              const champ = getChampionById(id);
              const isSelected = selectedBanSlot?.team === "red" && selectedBanSlot?.index === index;

              return (
                <button
                  key={index}
                  onClick={() => setSelectedBanSlot({ team: "red", index })}
                  className={`w-[40px] h-[40px] md:w-[50px] md:h-[50px] lg:w-[35px] lg:h-[35px] border rounded bg-[#1e232a]/60 relative overflow-hidden flex items-center justify-center transition-all cursor-pointer ${
                    isSelected 
                      ? "lol-slot-active border-[#00c8c8] ring-2 ring-[#00c8c8]/40 animate-pulse" 
                      : "border-[#785a28]/40 hover:border-[#c8aa6e]"
                  }`}
                  title="Haz clic para seleccionar o cambiar este ban"
                  aria-label={champ ? `Baneo Rojo ${index + 1}: ${champ.name}` : `Ranura de baneo Rojo ${index + 1} vacía. Haz clic para asignar baneo.`}
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
                    <span className="text-xs md:text-sm lg:text-xs text-[#c8aa6e] font-bold">{index + 1}</span>
                  )}
                </button>
              );
            })}
          </div>
          <span className="text-xs md:text-sm lg:text-[11px] uppercase font-extrabold text-[#ff4655] tracking-widest w-20 lg:w-16 text-right shrink-0">
            Bans Rojo
          </span>
        </div>
      </div>

      {/* Ban Instructions & AutoFill */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 lg:gap-2 bg-[#0a1428]/60 border border-[#c8aa6e]/30 px-5 py-2.5 lg:py-1.5 rounded-sm shrink-0">
        <span className="text-xs lg:text-[10px] text-[#c8aa6e] font-bold leading-normal text-center sm:text-left">
          💡 <span className="underline">Bans Simultáneos</span>: Haz clic en cualquiera de las 10 ranuras numeradas arriba, luego selecciona un campeón del grid para banearlo.
        </span>
        <button
          onClick={autoFillBans}
          className="px-4 py-2 lg:py-1 lg:px-3 border border-[#c8aa6e] bg-[#0a1428] text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#010a13] text-xs lg:text-[10px] font-black uppercase tracking-widest transition-all rounded shadow-sm shrink-0 cursor-pointer"
        >
          Auto-rellenar Bans
        </button>
      </div>

      {/* Mobile Sub-Tab Switcher */}
      <div className="flex lg:hidden border border-[#c8aa6e]/30 bg-[#0a1428]/80 rounded p-1.5 gap-1 shadow-sm mt-1">
        <button
          onClick={() => setMobileSubTab("grid")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all text-center cursor-pointer ${
            mobileSubTab === "grid"
              ? "bg-[#c8aa6e] text-[#010a13] shadow-sm font-bold"
              : "text-[#8a9dae] hover:bg-[#1e232a]/50"
          }`}
        >
          🔍 Selección (Grid)
        </button>
        <button
          onClick={() => setMobileSubTab("picks")}
          className={`flex-1 py-2.5 text-xs font-bold uppercase tracking-wider rounded-sm transition-all text-center cursor-pointer ${
            mobileSubTab === "picks"
              ? "bg-[#c8aa6e] text-[#010a13] shadow-sm font-bold"
              : "text-[#8a9dae] hover:bg-[#1e232a]/50"
          }`}
        >
          ⚔️ Ver Picks (Bot)
        </button>
      </div>

      {/* Board Layout: Side picks + Grid */}
      <div className="grid gap-4 lg:gap-3.5 items-stretch lg:flex-1 lg:min-h-0 lg:overflow-hidden grid-cols-1 lg:grid-cols-12">
        {/* Left Side (Blue picks) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3 lg:gap-1.5 lg:h-full lg:min-h-0 lg:overflow-hidden">
          <div className="bg-[#00c8c8]/10 border border-[#00c8c8]/30 text-[#00c8c8] text-xs lg:text-[10px] uppercase tracking-widest font-black py-2.5 lg:py-1 px-4 rounded-sm text-center shadow-sm shrink-0">
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
        <div className="hidden lg:flex lg:col-span-6 flex-col w-full h-full lg:min-h-0 lg:overflow-hidden">
          <ChampionGrid
            onSelectChampion={setChampion}
            disabled={isComplete}
          />
        </div>

        {/* Right Side (Red picks) */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-3 lg:gap-1.5 lg:h-full lg:min-h-0 lg:overflow-hidden">
          <div className="bg-[#ff4655]/10 border border-[#ff4655]/30 text-[#ff4655] text-xs lg:text-[10px] uppercase tracking-widest font-black py-2.5 lg:py-1 px-4 rounded-sm text-center shadow-sm shrink-0">
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
