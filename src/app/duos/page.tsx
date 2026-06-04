// filepath: src/app/duos/page.tsx
import Link from "next/link";
import { duos } from "@/data/duos";
import ChampionAvatar from "@/components/champion-avatar";
import { Trophy, ShieldAlert, Sparkles } from "lucide-react";

export const metadata = {
  title: "Dúos Clínicos del Meta (Total 15) — DUO DRAFT",
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
    <div className="w-full max-w-[1850px] mx-auto px-4 md:px-12 py-8 flex flex-col gap-10">
      {/* Header title */}
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-black tracking-widest uppercase text-[#0f1923] flex items-center gap-3">
          <Trophy className="w-10 h-10 text-[#c8aa6e]" />
          Dúos Clínicos del Meta (Total 15)
        </h1>
        <p className="text-xs md:text-sm text-[#785a28] uppercase font-black tracking-widest mt-2">
          Planificación y Sinergias Botlane Consolidadas • Meta Parche 26.11
        </p>
      </div>

      {/* Intro info box */}
      <div className="lol-panel-dark p-5 md:p-6 flex gap-4 text-xs md:text-sm text-[#f0e6d3] items-start shadow-md">
        <Sparkles className="w-6 h-6 text-[#c8aa6e] shrink-0 mt-0.5" />
        <div className="flex flex-col gap-1.5">
          <strong className="text-[#c8aa6e] uppercase tracking-widest font-serif font-black text-sm">Ejecución del Sistema Macro</strong>
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
            className="lol-panel lol-panel-interactive p-6 bg-[#fcf9f2] border border-[#c8aa6e] flex gap-6 group items-center shadow-sm hover:shadow-md"
          >
            {/* Avatars container */}
            <div className="flex items-center gap-2 shrink-0 bg-[#0a1428]/5 p-2 rounded-sm border border-[#eadecd]">
              <ChampionAvatar
                ddragonKey={duo.adcDdragonKey}
                name={duo.adcId}
                size="md"
                isComfort
              />
              <span className="text-[#c8aa6e] font-serif font-black text-sm px-1 select-none">
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
                <span className="font-serif font-black text-lg md:text-xl text-[#0f1923] group-hover:text-[#785a28] transition-colors leading-none">
                  {duo.name}
                </span>
                <span className={`text-[10px] md:text-xs font-black uppercase px-2 py-0.5 rounded-sm leading-none ${getTierColor(duo.tier)}`}>
                  {duo.tier}
                </span>
              </div>
              <span className="text-xs text-[#785a28] uppercase font-bold tracking-widest block mt-2 leading-none">
                Pilar: {duo.pillar}
              </span>
              <p className="text-xs md:text-sm text-[#5e6b77] italic mt-2.5 leading-relaxed line-clamp-2">
                "{duo.philosophy}"
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-1.5 mt-3.5">
                {duo.tags.map((tag) => (
                  <span key={tag} className="text-[10px] md:text-xs font-bold uppercase text-[#5e6b77] bg-[#eadecd]/60 border border-[#d8ccb4]/40 px-2 py-0.5 rounded-sm">
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
