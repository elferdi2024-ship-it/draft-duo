// filepath: src/app/duos/[id]/page.tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import { duos } from "@/data/duos";
import { setups } from "@/data/setups";
import { ownChampions } from "@/data/champions";
import ChampionAvatar from "@/components/champion-avatar";
import Timeline from "@/components/timeline";
import { Trophy, ArrowLeft, ShieldAlert, Sparkles, Star, Compass } from "lucide-react";
import type { SetupCheckpoint, SetupTimeline } from "@/lib/types";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function DuoDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Find the duo in database
  const duo = duos.find((d) => d.id === id.toLowerCase());
  if (!duo) {
    notFound();
  }

  // Resolve champ details
  const adc = ownChampions.find((c) => c.id === duo.adcId);
  const sup = ownChampions.find((c) => c.id === duo.supId);

  // Load custom timeline
  let timeline = setups.find((s) => s.duoId === duo.id);

  // If no custom timeline, generate a premium generic setup timeline
  if (!timeline && adc && sup) {
    const genericCheckpoints: SetupCheckpoint[] = [
      {
        time: "0:00",
        title: "Inicio & Fase Defensiva",
        actions: [
          `Posicionamiento cauto. ${adc.name} prepara last hits y ${sup.name} cubre el arbusto lateral.`,
          "Karma/Soporte coloca ward en la entrada del río.",
          "Evitar intercambios largos de vida hasta asegurar nivel 2."
        ]
      },
      {
        time: "1:30",
        title: "Poder Nivel 2",
        actions: [
          "Presionar la oleada de súbditos para conseguir el nivel 2 antes que el rival.",
          `All-in corto: ${adc.name} inicia trade con ralentización/burst y ${sup.name} protege con escudos/CC.`,
          "Asegurar control de los arbustos de línea."
        ]
      },
      {
        time: "6:00",
        title: "Power Spike de Nivel 6 & Ultimate",
        actions: [
          "Monitorear la posición del jungla enemigo en el mapa.",
          `Coordinar definitivas: Iniciar con R y seguir la cadena de CC.`
        ],
        decision: {
          condition: "¿El tirador enemigo tiene menos del 55% de vida y sin destello?",
          ifTrue: `Buscar all-in directo. ${adc.name} y ${sup.name} gastan definitivas para asegurar asesinato y placas.`,
          ifFalse: "Pushear oleada para forzar prioridad de mapa y rotar hacia el Dragón."
        }
      },
      {
        time: "14:00",
        title: "Destrucción de Primera Torre",
        actions: [
          "Crash perfecto de súbditos bajo la torre enemiga.",
          "Golpear placas y reclamar la torre bot lane.",
          "Rotar a mid lane para continuar la presión."
        ]
      },
      {
        time: "20:00+",
        title: "Peleas de Equipo (Late Game)",
        actions: [
          `Pelear bajo pilar: ${duo.pillar}.`,
          `${adc.name} se posiciona en rango máximo, ${sup.name} proporciona peel y zonificación.`,
          "Control de visión en fosa de Baron Nashor."
        ]
      }
    ];

    timeline = {
      duoId: duo.id,
      name: duo.name,
      checkpoints: genericCheckpoints
    };
  }

  return (
    <div className="w-full flex flex-col gap-6 bg-[#f3ebd7]/30 min-h-screen pb-12">
      {/* Duo Header Banner */}
      <div className="bg-[#0a1428] border-b border-[#c8aa6e] py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col items-center md:items-start text-center md:text-left">
            <Link
              href="/duos"
              className="text-[#c8aa6e] hover:text-[#f0e6d3] text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 mb-3 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Dúos
            </Link>
            <div className="flex items-center gap-2 mb-2 justify-center md:justify-start">
              <span className="bg-amber-500 text-[#0a1428] text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">
                Tier {duo.tier}
              </span>
              <span className="bg-[#0397ab] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">
                BOTLANE DÚO
              </span>
            </div>
            <h1 className="font-serif text-2xl md:text-4xl font-black tracking-widest text-[#f0e6d3] uppercase drop-shadow-md">
              {duo.name}
            </h1>
            <p className="text-xs text-[#c8aa6e] uppercase tracking-widest font-black mt-1">
              Pilar: {duo.pillar}
            </p>
          </div>

          {/* Large Avatars Container */}
          <div className="flex items-center gap-4 bg-[#1e232a]/60 border border-[#c8aa6e]/30 p-4 rounded shadow-md">
            {adc && (
              <Link href={`/champions/${adc.id}`} className="flex flex-col items-center gap-1 group">
                <ChampionAvatar ddragonKey={duo.adcDdragonKey} name={adc.name} tier={adc.tier} size="md" isComfort />
                <span className="text-[9px] font-bold uppercase text-[#a0a8b0] group-hover:text-[#c8aa6e] transition-colors">{adc.name}</span>
              </Link>
            )}
            <span className="text-[#c8aa6e] font-serif font-black text-lg select-none">+</span>
            {sup && (
              <Link href={`/champions/${sup.id}`} className="flex flex-col items-center gap-1 group">
                <ChampionAvatar ddragonKey={duo.supDdragonKey} name={sup.name} tier={sup.tier} size="md" isComfort />
                <span className="text-[9px] font-bold uppercase text-[#a0a8b0] group-hover:text-[#c8aa6e] transition-colors">{sup.name}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Layout Grid */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 xl:grid-cols-12 gap-6 items-start mt-4">
        {/* Left Side: Strategic Info (xl:col-span-4) */}
        <div className="xl:col-span-4 flex flex-col gap-4">
          <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#eadecd] pb-2 text-[#785a28]">
              <Star className="w-4 h-4" />
              <h3 className="lol-title font-bold text-xs uppercase tracking-wider">
                Resumen de Sinergia
              </h3>
            </div>

            <div className="flex flex-col gap-3.5 text-xs">
              {/* Identity */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28]">
                  Filosofía Clave
                </span>
                <p className="text-[#0f1923] leading-relaxed italic">
                  "{duo.philosophy}"
                </p>
              </div>

              {/* Execution */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28]">
                  Directiva de Ejecución
                </span>
                <p className="text-[#0f1923] leading-relaxed">
                  {duo.execution}
                </p>
              </div>

              {/* Win Condition */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28]">
                  Condición de Victoria Bot
                </span>
                <p className="text-[#0f1923] leading-relaxed">
                  {duo.winCondition}
                </p>
              </div>

              {/* Spikes list */}
              <div className="flex flex-col gap-1">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-[#785a28]">
                  Power Spikes del Combo
                </span>
                <div className="flex flex-col gap-1 mt-1 pl-1">
                  {duo.powerSpikes.map((spike, idx) => (
                    <span key={idx} className="text-[#5e6b77]">• {spike}</span>
                  ))}
                </div>
              </div>
            </div>

            {/* Tags display */}
            <div className="flex flex-wrap gap-1 mt-2 border-t border-[#eadecd] pt-3">
              {duo.tags.map((tag) => (
                <span key={tag} className="text-[8px] font-semibold uppercase text-[#5e6b77] bg-[#eadecd]/60 border border-[#d8ccb4]/40 px-1.5 py-0.5 rounded-sm">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right Side: Timeline Checklist (xl:col-span-8) */}
        <div className="xl:col-span-8 flex flex-col gap-4">
          <div className="border-b border-[#c8aa6e]/40 pb-1.5 flex items-center justify-between">
            <h2 className="lol-title font-bold text-base text-[#0f1923] tracking-widest uppercase flex items-center gap-1.5">
              <Compass className="w-5 h-5 text-[#c8aa6e]" />
              Guía de Setup por Minuto
            </h2>
            <span className="text-[9px] uppercase font-extrabold text-[#785a28] bg-[#c8aa6e]/10 border border-[#c8aa6e]/30 px-2 py-0.5 rounded-sm">
              Checklist Interactivo
            </span>
          </div>

          {timeline && <Timeline checkpoints={timeline.checkpoints} />}
        </div>
      </div>
    </div>
  );
}
