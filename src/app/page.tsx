// filepath: src/app/page.tsx
"use client";

import { useEffect } from "react";
import Link from "next/link";
import { ownChampions } from "@/data/champions";
import { duos } from "@/data/duos";
import { useDraftStore } from "@/store/draft-store";
import ChampionAvatar from "@/components/champion-avatar";
import { Sparkles, Trophy, Compass, Heart, Shield, User, ShieldAlert, Award } from "lucide-react";

import { useState } from "react";

export default function Home() {
  const { userRole, setUserRole, loadChampions } = useDraftStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    loadChampions();
    setMounted(true);
  }, []);

  const adcs = ownChampions.filter((c) => c.role === "ADC");
  const supports = ownChampions.filter((c) => c.role === "Support");

  // Get Top Tier duos
  const bestDuos = duos.filter((d) => d.tier === "S+" || d.tier === "S").slice(0, 5);

  // If user has not chosen their role yet, show beautiful role selection screen
  if (!mounted || !userRole) {
    return (
      <div className="w-full max-w-4xl mx-auto px-4 py-12 flex flex-col items-center justify-center gap-10 min-h-[80vh]">
        <div className="text-center">
          <div className="w-14 h-14 rounded-full border-2 border-[#c8aa6e] flex items-center justify-center bg-gradient-to-b from-[#1e232a] to-[#12161a] mx-auto mb-4 shadow-md">
            <span className="text-[#c8aa6e] font-serif font-bold text-2xl select-none">Δ</span>
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-black tracking-widest text-[#0f1923] uppercase shimmer-text">
            DUO DRAFT
          </h1>
          <p className="text-xs text-[#785a28] uppercase tracking-widest font-black mt-2">
            Competitive League Draft Intelligence • Patch 26.11
          </p>
        </div>

        <div className="w-full flex flex-col md:flex-row gap-6 items-stretch justify-center max-w-3xl">
          {/* Card Fer (ADC) */}
          <button
            onClick={() => setUserRole("fer")}
            className="flex-1 text-left lol-panel p-6 bg-[#fcf9f2] border border-[#c8aa6e] hover:border-[#0397ab] hover:shadow-[0_0_20px_rgba(3,151,171,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-[#c8aa6e]/10 border border-[#c8aa6e] flex items-center justify-center text-[#c8aa6e] group-hover:bg-[#0397ab]/15 group-hover:text-[#0397ab] group-hover:border-[#0397ab] transition-all">
                <FlameIcon className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-2xl font-black tracking-wider text-[#0f1923]">
                FER (ADC)
              </h2>
              <p className="text-xs text-[#5e6b77] leading-relaxed">
                Optimiza todo el sistema para tu rol de **Tirador**. Enfócate en wave control, posicionamiento perpendicular, daño crítico máximo y timelines de asedio al carril.
              </p>
            </div>
            <div className="mt-8 border-t border-[#eadecd] pt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#785a28] group-hover:text-[#0397ab] transition-colors">
                Ingresar como ADC
              </span>
              <span className="text-[#c8aa6e] font-bold text-xs select-none">→</span>
            </div>
          </button>

          {/* Card Ralph (Support) */}
          <button
            onClick={() => setUserRole("ralph")}
            className="flex-1 text-left lol-panel p-6 bg-[#fcf9f2] border border-[#c8aa6e] hover:border-emerald-600 hover:shadow-[0_0_20px_rgba(16,185,129,0.15)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-3">
              <div className="w-10 h-10 rounded bg-emerald-500/10 border border-emerald-500/60 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-500/15 group-hover:text-emerald-500 group-hover:border-emerald-500 transition-all">
                <ShieldIcon className="w-5 h-5" />
              </div>
              <h2 className="font-serif text-2xl font-black tracking-wider text-[#0f1923]">
                RALPH (SUP)
              </h2>
              <p className="text-xs text-[#5e6b77] leading-relaxed">
                Optimiza todo el sistema para tu rol de **Soporte**. Enfócate en control de visión en la niebla, setups de warding profundo, desenganches anti-all in y peel.
              </p>
            </div>
            <div className="mt-8 border-t border-[#eadecd] pt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#785a28] group-hover:text-emerald-600 transition-colors">
                Ingresar como Soporte
              </span>
              <span className="text-[#c8aa6e] font-bold text-xs select-none">→</span>
            </div>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-10">
      {/* Hero Welcome Banner */}
      <div className="lol-panel-dark p-6 md:p-10 relative overflow-hidden flex flex-col items-center text-center shadow-lg">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(200,170,110,0.08),transparent_60%)] pointer-events-none" />

        <div className="flex items-center gap-2 mb-3 bg-[#c8aa6e]/10 border border-[#c8aa6e]/40 px-3 py-1 rounded-sm text-[10px] text-[#c8aa6e] font-mono">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          SESIÓN ACTIVA: {userRole === "fer" ? "FER (ADC)" : "RALPH (SUPORT)"}
        </div>

        <h1 className="font-serif text-3xl md:text-5xl font-black tracking-widest text-[#f0e6d3] uppercase drop-shadow-md shimmer-text-light">
          DUO DRAFT
        </h1>
        <p className="text-xs md:text-sm text-[#c8aa6e] uppercase tracking-widest font-black mt-2">
          Competitive Botlane Draft Intelligence • Patch 26.11
        </p>

        {/* Personalized welcome quote */}
        <p className="max-w-2xl text-xs md:text-sm text-[#a0a8b0] mt-4 leading-relaxed italic">
          {userRole === "fer"
            ? "\"Fer, tu rol es dictar el ritmo de la oleada y asegurar el daño core. El pokeo perpendicular de Ashe y la letalidad de Varus son tus herramientas. Posicionamiento impecable = Victoria.\""
            : "\"Ralph, tu rol es gobernar el mapa desde la niebla profunda. Wards en el pixel bush, linternas salvavidas y desenganches perfectos son tus armas. La supervivencia de Fer es tu prioridad.\""}
        </p>

        <div className="flex flex-wrap gap-4 justify-center mt-8">
          <Link
            href="/draft"
            className="px-6 py-3 bg-[#c8aa6e] hover:bg-[#785a28] text-[#0a1428] hover:text-[#f0e6d3] border border-[#f0e6d3] font-serif font-black uppercase text-xs md:text-sm tracking-widest rounded-sm transition-all shadow-md flex items-center gap-2 group"
          >
            <Sparkles className="w-4 h-4 group-hover:rotate-12 transition-transform" />
            Iniciar Simulador en Vivo
          </Link>
          <button
            onClick={() => setUserRole(null)}
            className="lol-button hover:bg-transparent"
          >
            Cambiar de Perfil
          </button>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left column: Duos and guides */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#c8aa6e]/40 pb-2">
            <h2 className="lol-title font-bold text-base text-[#0f1923] flex items-center gap-2">
              <Trophy className="w-5 h-5 text-[#c8aa6e]" />
              Dúos Clínicos del Meta (Total 15)
            </h2>
            <Link
              href="/duos"
              className="text-xs uppercase tracking-wider font-extrabold text-[#785a28] hover:text-[#c8aa6e] flex items-center gap-1"
            >
              Ver los 15 Dúos <Compass className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {bestDuos.map((duo) => (
              <Link
                key={duo.id}
                href={`/duos/${duo.id}`}
                className="lol-panel lol-panel-interactive p-4 bg-[#fcf9f2] border border-[#c8aa6e] flex gap-4 group"
              >
                <div className="flex gap-1 shrink-0 items-center justify-center">
                  <ChampionAvatar
                    ddragonKey={duo.adcDdragonKey}
                    name={duo.adcId}
                    size="sm"
                    isComfort
                  />
                  <span className="text-[#c8aa6e] font-serif font-black text-xs px-1 select-none">
                    +
                  </span>
                  <ChampionAvatar
                    ddragonKey={duo.supDdragonKey}
                    name={duo.supId}
                    size="sm"
                    isComfort
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-serif font-bold text-sm text-[#0f1923] group-hover:text-[#785a28] transition-colors truncate">
                      {duo.name}
                    </span>
                    <span className="bg-amber-500 text-[#0a1428] text-[9px] font-extrabold uppercase px-1 rounded-sm">
                      {duo.tier}
                    </span>
                  </div>
                  <span className="text-[10px] text-[#785a28] uppercase font-bold tracking-wider mt-0.5 truncate">
                    {duo.pillar}
                  </span>
                  <p className="text-[10px] text-[#5e6b77] italic mt-1 line-clamp-1">
                    "{duo.philosophy}"
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Right column: Personalized pool view */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="flex items-center justify-between border-b border-[#c8aa6e]/40 pb-2">
            <h2 className="lol-title font-bold text-base text-[#0f1923] flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-700" />
              {userRole === "fer" ? "Tus ADC Confort (Fer)" : "Tus Soportes Confort (Ralph)"}
            </h2>
          </div>

          <div className="lol-panel p-4 bg-[#fcf9f2] border border-[#c8aa6e] flex flex-col gap-4">
            {/* Show list according to role */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#785a28] border-b border-[#eadecd] pb-1">
                {userRole === "fer" ? "Tiradores Core de Fer" : "Protectores Core de Ralph"}
              </span>
              <div className="flex flex-wrap gap-2.5">
                {(userRole === "fer" ? adcs : supports).map((champ) => (
                  <Link
                    key={champ.id}
                    href={`/champions/${champ.id}`}
                    className="flex flex-col items-center gap-1 group"
                  >
                    <ChampionAvatar
                      ddragonKey={champ.ddragonKey}
                      name={champ.name}
                      tier={champ.tier}
                      size="sm"
                    />
                    <span className="text-[8px] font-extrabold uppercase text-[#5e6b77] group-hover:text-[#785a28] transition-colors">
                      {champ.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Other teammate pool for reference */}
            <div className="flex flex-col gap-3">
              <span className="text-[10px] uppercase font-extrabold tracking-wider text-[#5e6b77] border-b border-[#eadecd] pb-1">
                {userRole === "fer" ? "Soportes Asociados de Ralph" : "Tiradores Asociados de Fer"}
              </span>
              <div className="flex flex-wrap gap-2">
                {(userRole === "fer" ? supports : adcs).map((champ) => (
                  <Link
                    key={champ.id}
                    href={`/champions/${champ.id}`}
                    className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <ChampionAvatar
                      ddragonKey={champ.ddragonKey}
                      name={champ.name}
                      tier={champ.tier}
                      size="sm"
                    />
                    <span className="text-[8px] font-extrabold uppercase text-[#5e6b77]">
                      {champ.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Micro banner directives */}
            <div className="p-3 border border-[#c8aa6e]/20 bg-[#eadecd]/30 flex gap-2 rounded-sm text-[10px] text-[#785a28] items-start mt-2">
              <Shield className="w-4 h-4 text-[#c8aa6e] shrink-0" />
              <span>
                {userRole === "fer"
                  ? "Fer: Recuerda comprar Edge of Night en Varus contra iniciaciones duras y Manru Emblem en Ashe para el spike crítico global."
                  : "Ralph: Recuerda wardear el pixel bush 45s antes de dragones y usar Locket/Mikael's para blindar a Fer."}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helpers icons
function FlameIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z" />
    </svg>
  );
}

function ShieldIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M20 13c0 5-3.5 7.5-7.66 9.7a1 1 0 0 1-.68 0C7.5 20.5 4 18 4 13V6a1 1 0 0 1 .76-.97l8-2a1 1 0 0 1 .48 0l8 2A1 1 0 0 1 20 6z" />
    </svg>
  );
}
