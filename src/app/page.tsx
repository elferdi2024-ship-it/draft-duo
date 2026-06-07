// filepath: src/app/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ownChampions } from "@/data/champions";
import { duos } from "@/data/duos";
import { useDraftStore } from "@/store/draft-store";
import ChampionAvatar from "@/components/champion-avatar";
import TeemoCoach from "@/components/teemo-coach";
import { Sparkles, Trophy, Compass, Heart, Shield, User, ShieldAlert, Award } from "lucide-react";

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
          <div className="relative w-20 h-20 rounded border-2 border-[#c8aa6e] overflow-hidden bg-gradient-to-b from-[#1e232a] to-[#12161a] mx-auto mb-5 shadow-lg flex items-center justify-center">
            <Image
              src="/logo-draft.png"
              alt="DUO DRAFT"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>
          <h1 className="font-serif text-4xl md:text-5xl font-black tracking-widest text-[#0f1923] uppercase shimmer-text">
            DUO DRAFT
          </h1>
          <p className="text-xs text-[#c8aa6e] uppercase tracking-widest font-black mt-2">
            Competitive League Draft Intelligence • Patch 26.11
          </p>
        </div>        <div className="w-full flex flex-col md:flex-row gap-6 items-stretch justify-center max-w-3xl">
          {/* Card Fer (ADC) */}
          <button
            onClick={() => setUserRole("fer")}
            aria-label="Ingresar como ADC (Fer)"
            className="flex-1 text-left lol-panel p-6 bg-[var(--panel)] border border-[var(--border-dark)] hover:border-[#0097e6] hover:shadow-[0_0_24px_rgba(0,151,230,0.25)] hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-4">
              <div className="relative w-16 h-16 rounded border border-[#785a28]/60 overflow-hidden bg-gradient-to-b from-[#1e232a] to-[#0a1428] flex items-center justify-center shadow-md group-hover:border-[#0097e6] group-hover:shadow-[0_0_15px_rgba(0,151,230,0.3)] transition-all duration-300">
                <Image
                  src="/icon-adc.png"
                  alt="ADC Icon"
                  width={52}
                  height={52}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h2 className="font-serif text-2xl font-black tracking-wider text-[#f0e6d3] mt-2">
                FER (ADC)
              </h2>
              <p className="text-xs text-[#8a9dae] leading-relaxed">
                Optimiza todo el sistema para tu rol de **Tirador**. Enfócate en wave control, posicionamiento perpendicular, daño crítico máximo y timelines de asedio al carril.
              </p>
            </div>
            <div className="mt-8 border-t border-[#c8aa6e]/20 pt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#c8aa6e] group-hover:text-[#0097e6] transition-colors">
                Ingresar como ADC
              </span>
              <span className="text-[#c8aa6e] font-bold text-xs select-none">→</span>
            </div>
          </button>

          {/* Card Ralph (Support) */}
          <button
            onClick={() => setUserRole("ralph")}
            aria-label="Ingresar como Soporte (Ralph)"
            className="flex-1 text-left lol-panel p-6 bg-[var(--panel)] border border-[var(--border-dark)] hover:border-[#00c8c8] hover:shadow-[0_0_24px_rgba(0,200,200,0.25)] hover:-translate-y-1 transition-all duration-350 flex flex-col justify-between group cursor-pointer"
          >
            <div className="flex flex-col gap-4">
              <div className="relative w-16 h-16 rounded border border-[#785a28]/60 overflow-hidden bg-gradient-to-b from-[#1e232a] to-[#0a1428] flex items-center justify-center shadow-md group-hover:border-[#00c8c8] group-hover:shadow-[0_0_15px_rgba(0,200,200,0.3)] transition-all duration-300">
                <Image
                  src="/icon-support.png"
                  alt="Support Icon"
                  width={52}
                  height={52}
                  className="object-contain transition-transform duration-300 group-hover:scale-110"
                />
              </div>
              <h2 className="font-serif text-2xl font-black tracking-wider text-[#f0e6d3] mt-2">
                RALPH (SUP)
              </h2>
              <p className="text-xs text-[#8a9dae] leading-relaxed">
                Optimiza todo el sistema para tu rol de **Soporte**. Enfócate en control de visión en la niebla, setups de warding profundo, desenganches anti-all in y peel.
              </p>
            </div>
            <div className="mt-8 border-t border-[#c8aa6e]/20 pt-3 flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-[#c8aa6e] group-hover:text-[#00c8c8] transition-colors">
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
    <div className="w-full max-w-[1720px] mx-auto px-4 md:px-12 py-8 flex flex-col gap-12">
      {/* Hero Welcome Banner */}
      <div className="lol-panel-dark p-8 md:p-16 relative overflow-hidden flex flex-col items-center text-center shadow-lg min-h-[380px] justify-center">
        {/* Background Banner Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/banner.webp"
            alt="Duo Draft Background Banner"
            fill
            className="object-cover opacity-20 filter brightness-90 select-none pointer-events-none"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/70 to-[#0a1428]/45" />
        </div>

        <div className="relative z-10 flex flex-col items-center">
          {/* Logo centered */}
          <div className="relative w-20 h-20 rounded border border-[#c8aa6e]/30 overflow-hidden bg-[#0a1428]/75 mb-5 shadow-lg flex items-center justify-center">
            <Image
              src="/logo-draft.png"
              alt="DUO DRAFT LOGO"
              width={64}
              height={64}
              className="object-contain"
            />
          </div>

          <div className="flex items-center gap-2.5 mb-4 bg-[#c8aa6e]/10 border border-[#c8aa6e]/40 px-4 py-1.5 rounded-sm text-xs text-[#c8aa6e] font-mono backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            SESIÓN ACTIVA: {userRole === "fer" ? "FER (ADC)" : "RALPH (SOPORTE)"}
          </div>

          <h1 className="font-serif text-4xl md:text-6xl font-black tracking-widest text-[#f0e6d3] uppercase drop-shadow-md shimmer-text-light">
            DUO DRAFT
          </h1>
          <p className="text-xs md:text-base text-[#c8aa6e] uppercase tracking-widest font-black mt-3">
            Competitive Botlane Draft Intelligence • Patch 26.11
          </p>

          {/* Teemo Coach Presenter on Welcome Screen */}
          <div className="mt-4 scale-95">
            <TeemoCoach
              isTalking={true}
              message={
                userRole === "fer"
                  ? "Fer, tu rol es dictar el ritmo de la oleada y asegurar el daño core. ¡Ashe y Varus son tus herramientas clave!"
                  : "Ralph, tu rol es gobernar el mapa desde la niebla profunda. ¡La supervivencia de Fer es tu prioridad!"
              }
            />
          </div>

          <div className="flex flex-wrap gap-6 justify-center mt-10">
            <Link
              href="/draft"
              className="px-8 py-4 bg-[#c8aa6e] hover:bg-[#785a28] text-[#0a1428] hover:text-[#f0e6d3] border border-[#f0e6d3] font-serif font-black uppercase text-sm md:text-base tracking-widest rounded-sm transition-all shadow-md flex items-center gap-3 group"
            >
              <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />
              Iniciar Simulador en Vivo
            </Link>
            <button
              onClick={() => setUserRole(null)}
              className="px-6 py-3 border border-[#c8aa6e]/60 bg-transparent text-[#c8aa6e] hover:bg-[#c8aa6e] hover:text-[#0a1428] font-serif font-black uppercase text-xs md:text-sm tracking-widest rounded-sm transition-all shadow-md cursor-pointer"
            >
              Cambiar de Perfil
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid content */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 items-start">
        {/* Left column: Duos and guides */}
        <div className="xl:col-span-8 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#c8aa6e]/40 pb-3">
            <h2 className="lol-title font-bold text-lg md:text-xl text-[#f0e6d3] flex items-center gap-2.5">
              <Trophy className="w-6 h-6 text-[#c8aa6e]" />
              Dúos Clínicos del Meta (Total 15)
            </h2>
            <Link
              href="/duos"
              className="text-xs md:text-sm uppercase tracking-widest font-extrabold text-[#c8aa6e] hover:text-[#fcf9f2] flex items-center gap-1.5"
            >
              Ver los 15 Dúos <Compass className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bestDuos.map((duo) => (
              <Link
                key={duo.id}
                href={`/duos/${duo.id}`}
                className="lol-panel lol-panel-interactive p-5 md:p-6 bg-[var(--panel)] border border-[var(--border-dark)] flex gap-5 group shadow-sm hover:shadow-md"
              >
                <div className="flex gap-2 shrink-0 items-center justify-center bg-[#0a1428]/40 p-2 rounded-sm border border-[#c8aa6e]/20">
                  <ChampionAvatar
                    ddragonKey={duo.adcDdragonKey}
                    name={duo.adcId}
                    size="md"
                    isComfort
                  />
                  <span className="text-[#c8aa6e] font-serif font-black text-sm px-1.5 select-none">
                    +
                  </span>
                  <ChampionAvatar
                    ddragonKey={duo.supDdragonKey}
                    name={duo.supId}
                    size="md"
                    isComfort
                  />
                </div>
                <div className="flex flex-col justify-center min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-serif font-black text-base md:text-lg text-[#f0e6d3] group-hover:text-[#c8aa6e] transition-colors truncate">
                      {duo.name}
                    </span>
                    <span className="bg-amber-500 text-[#0a1428] text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-sm">
                      {duo.tier}
                    </span>
                  </div>
                  <span className="text-xs text-[#c8aa6e] uppercase font-bold tracking-widest mt-1 truncate">
                    {duo.pillar}
                  </span>
                  <p className="text-xs md:text-sm text-[#8a9dae] italic mt-2 line-clamp-2 leading-relaxed">
                    "{duo.philosophy}"
                  </p>
                </div>
              </Link>
            ))}
          </div>

        </div>

        {/* Right column: Personalized pool view */}
        <div className="xl:col-span-4 flex flex-col gap-6">
          <div className="flex items-center justify-between border-b border-[#c8aa6e]/40 pb-3">
            <h2 className="lol-title font-bold text-lg md:text-xl text-[#f0e6d3] flex items-center gap-2.5">
              <Heart className="w-6 h-6 text-[#ff4655]" />
              {userRole === "fer" ? "Tus ADC Confort (Fer)" : "Tus Soportes Confort (Ralph)"}
            </h2>
          </div>

          <div className="lol-panel p-5 md:p-6 bg-[var(--panel)] border border-[var(--border-dark)] flex flex-col gap-5 shadow-sm">
            {/* Show list according to role */}
            <div className="flex flex-col gap-3.5">
              <span className="text-xs uppercase font-black tracking-widest text-[#c8aa6e] border-b border-[#c8aa6e]/20 pb-2">
                {userRole === "fer" ? "Tiradores Core de Fer" : "Protectores Core de Ralph"}
              </span>
              <div className="flex flex-wrap gap-3.5">
                {(userRole === "fer" ? adcs : supports).map((champ) => (
                  <Link
                    key={champ.id}
                    href={`/champions/${champ.id}`}
                    className="flex flex-col items-center gap-1.5 group"
                  >
                    <ChampionAvatar
                      ddragonKey={champ.ddragonKey}
                      name={champ.name}
                      tier={champ.tier}
                      size="md"
                    />
                    <span className="text-[10px] md:text-xs font-bold uppercase text-[#8a9dae] group-hover:text-[#c8aa6e] transition-colors">
                      {champ.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Other teammate pool for reference */}
            <div className="flex flex-col gap-3.5 mt-2">
              <span className="text-xs uppercase font-black tracking-widest text-[#8a9dae] border-b border-[#c8aa6e]/20 pb-2">
                {userRole === "fer" ? "Soportes Asociados de Ralph" : "Tiradores Asociados de Fer"}
              </span>
              <div className="flex flex-wrap gap-3">
                {(userRole === "fer" ? supports : adcs).map((champ) => (
                  <Link
                    key={champ.id}
                    href={`/champions/${champ.id}`}
                    className="flex flex-col items-center gap-1.5 opacity-70 hover:opacity-100 transition-opacity"
                  >
                    <ChampionAvatar
                      ddragonKey={champ.ddragonKey}
                      name={champ.name}
                      tier={champ.tier}
                      size="md"
                    />
                    <span className="text-[10px] md:text-xs font-bold uppercase text-[#8a9dae]">
                      {champ.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Micro banner directives */}
            <div className="p-4 border border-[#c8aa6e]/30 bg-[#0a1428]/60 flex gap-3 rounded-sm text-xs md:text-sm text-[#c8aa6e] items-start mt-3 leading-relaxed">
              <Shield className="w-5 h-5 text-[#c8aa6e] shrink-0 mt-0.5" />
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
