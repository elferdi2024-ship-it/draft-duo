// filepath: src/app/duos/page.tsx
import Link from "next/link";
import { duos } from "@/data/duos";
import ChampionAvatar from "@/components/champion-avatar";
import { Trophy, ShieldAlert, Sparkles } from "lucide-react";

export const metadata = {
  title: "Los 10 Dúos Maestros — DraftLab Pro",
  description: "El arsenal botlane consolidado para cubrir todas las fases de juego, contra-selecciones y sinergias del meta.",
};

export default function DuosPage() {
  const getTierColor = (tier: string) => {
    if (tier === "S+") return "bg-amber-500 text-[#0a1428]";
    if (tier === "S") return "bg-amber-600 text-white";
    if (tier === "A+") return "bg-slate-500 text-white";
    return "bg-slate-700 text-white";
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-8">
      {/* Header title */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-widest uppercase text-[#0f1923] flex items-center gap-2">
          <Trophy className="w-8 h-8 text-[#c8aa6e]" />
          Los 10 Dúos Maestros
        </h1>
        <p className="text-xs text-[#5e6b77] uppercase font-bold tracking-widest mt-1">
          Planificación y Sinergias Botlane Consolidadas • Meta Parche 26.11
        </p>
      </div>

      {/* Intro info box */}
      <div className="lol-panel-dark p-4 flex gap-3 text-xs text-[#f0e6d3] items-start">
        <Sparkles className="w-5 h-5 text-[#c8aa6e] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1">
          <strong className="text-[#c8aa6e] uppercase tracking-wider font-serif">Ejecución del Sistema Macro</strong>
          <p className="text-[#a0a8b0] leading-relaxed">
            Cada dúo está mapeado bajo pilares estratégicos (Poke, Asedio, Dive, Niebla, V Defensiva, Protect). Revisa sus descripciones y haz click para ingresar a sus guías por minuto detalladas.
          </p>
        </div>
      </div>

      {/* Grid Duos list */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {duos.map((duo) => (
          <Link
            key={duo.id}
            href={`/duos/${duo.id}`}
            className="lol-panel lol-panel-interactive p-5 bg-[#fcf9f2] border border-[#c8aa6e] flex gap-5 group items-center"
          >
            {/* Avatars container */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ChampionAvatar
                ddragonKey={duo.adcDdragonKey}
                name={duo.adcId}
                size="md"
                isComfort
              />
              <span className="text-[#c8aa6e] font-serif font-black text-sm px-0.5 select-none">
                +
              </span>
              <ChampionAvatar
                ddragonKey={duo.supDdragonKey}
                name={duo.supId}
                size="md"
                isComfort
              />
            </div>

            {/* Info details */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-serif font-bold text-lg text-[#0f1923] group-hover:text-[#785a28] transition-colors leading-none">
                  {duo.name}
                </span>
                <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm leading-none ${getTierColor(duo.tier)}`}>
                  {duo.tier}
                </span>
              </div>
              <span className="text-[10px] text-[#785a28] uppercase font-bold tracking-wider block mt-1 leading-none">
                Pilar: {duo.pillar}
              </span>
              <p className="text-xs text-[#5e6b77] italic mt-2 leading-relaxed line-clamp-2">
                "{duo.philosophy}"
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mt-3">
                {duo.tags.map((tag) => (
                  <span key={tag} className="text-[8px] font-semibold uppercase text-[#5e6b77] bg-[#eadecd]/60 border border-[#d8ccb4]/40 px-1.5 py-0.5 rounded-sm">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
