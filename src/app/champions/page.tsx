// filepath: src/app/champions/page.tsx
import Link from "next/link";
import { ownChampions } from "@/data/champions";
import ChampionAvatar from "@/components/champion-avatar";
import { User, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "Tus Campeones de Confort — DraftLab Pro",
  description: "Revisa tu pool consolidado de 5 ADC y 5 Soportes prioritarios del Plan Macro.",
};

export default function ChampionsPage() {
  const adcs = ownChampions.filter((c) => c.role === "ADC");
  const supports = ownChampions.filter((c) => c.role === "Support");

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case "mastered":
        return "bg-emerald-500/10 text-emerald-800 border-emerald-500/30";
      case "learning":
        return "bg-[#0397ab]/10 text-[#0397ab] border-[#0397ab]/30";
      default:
        return "bg-gray-400/10 text-gray-500 border-gray-400/30";
    }
  };

  const getStatusLabel = (status?: string) => {
    if (status === "mastered") return "Dominado";
    if (status === "learning") return "En Aprendizaje";
    return "Backup / 1v9";
  };

  const renderChampCard = (champ: typeof ownChampions[0]) => (
    <Link
      key={champ.id}
      href={`/champions/${champ.id}`}
      className="lol-panel lol-panel-interactive p-4 bg-[#fcf9f2] border border-[#c8aa6e] flex gap-4 items-center group"
    >
      <ChampionAvatar
        ddragonKey={champ.ddragonKey}
        name={champ.name}
        tier={champ.tier}
        size="lg"
        isComfort
      />
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-serif font-black text-base text-[#0f1923] group-hover:text-[#785a28] transition-colors leading-none">
            {champ.name}
          </span>
          <span className="bg-amber-500 text-[#0a1428] text-[8px] font-extrabold uppercase px-1 rounded-sm leading-none py-0.5">
            {champ.tier}
          </span>
        </div>

        <span className={`inline-block border text-[8px] font-extrabold uppercase px-1.5 py-0.5 rounded-sm mt-1.5 leading-none ${getStatusBadge(champ.learningStatus)}`}>
          {getStatusLabel(champ.learningStatus)}
        </span>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-2">
          {champ.tags?.map((tag) => (
            <span key={tag} className="text-[8px] font-semibold text-[#5e6b77] bg-[#eadecd]/60 border border-[#d8ccb4]/40 px-1.5 py-0.5 rounded-sm">
              {tag}
            </span>
          ))}
        </div>
      </div>
    </Link>
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-8">
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-widest uppercase text-[#0f1923] flex items-center gap-2">
          <User className="w-8 h-8 text-[#c8aa6e]" />
          Pool de Campeones Confort
        </h1>
        <p className="text-xs text-[#5e6b77] uppercase font-bold tracking-widest mt-1">
          5 ADC (Tú) + 5 Suportes (Duo) • Parche 26.11
        </p>
      </div>

      {/* ADC Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#c8aa6e]/30 pb-1.5">
          <ShieldCheck className="w-4 h-4 text-[#785a28]" />
          <h2 className="lol-title font-bold text-sm text-[#785a28] tracking-widest">
            Tus 5 ADC — Selección de Tiradores
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {adcs.map(renderChampCard)}
        </div>
      </div>

      {/* Support Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2 border-b border-[#c8aa6e]/30 pb-1.5">
          <ShieldCheck className="w-4 h-4 text-[#785a28]" />
          <h2 className="lol-title font-bold text-sm text-[#785a28] tracking-widest">
            Tus 5 Soportes — Selección del Dúo
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {supports.map(renderChampCard)}
        </div>
      </div>
    </div>
  );
}
