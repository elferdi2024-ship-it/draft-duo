// filepath: src/app/champions/[id]/page.tsx
import { notFound } from "next/navigation";
import { ownChampions } from "@/data/champions";
import { builds } from "@/data/builds";
import SplashHero from "@/components/splash-hero";
import BuildDisplay from "@/components/build-display";
import { Clock, Heart, Award, CheckCircle, Flame } from "lucide-react";
import PersonalizedCoachNotes from "@/components/personalized-coach-notes";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ChampionDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Find the champion in comfort pool
  const champion = ownChampions.find((c) => c.id === id.toLowerCase());
  if (!champion) {
    notFound();
  }

  // Find all builds matching this champion (e.g. Varus has Lethality and On-Hit)
  const champBuilds = builds.filter((b) => b.championId === champion.id);

  const getStatusLabel = (status?: string) => {
    if (status === "mastered") return "Dominado (Core)";
    if (status === "learning") return "En Aprendizaje";
    return "Backup / 1v9";
  };

  return (
    <div className="w-full flex flex-col gap-6 bg-[#f3ebd7]/30 min-h-screen pb-12">
      {/* High-res Splash Header */}
      <SplashHero ddragonKey={champion.ddragonKey} name={champion.name}>
        <div className="flex items-center gap-2 mb-2">
          <span className="bg-amber-500 text-[#0a1428] text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">
            Tier {champion.tier}
          </span>
          <span className="bg-[#0397ab] text-white text-[9px] font-black uppercase px-2 py-0.5 rounded-sm">
            {getStatusLabel(champion.learningStatus)}
          </span>
        </div>
        <h1 className="font-serif text-3xl md:text-5xl font-black tracking-widest text-[#f0e6d3] uppercase drop-shadow-md">
          {champion.name}
        </h1>
        <p className="text-xs text-[#c8aa6e] uppercase tracking-widest font-black mt-1">
          {champion.role} de Confort del Plan Macro
        </p>
      </SplashHero>

      {/* Main Grid content */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 flex flex-col gap-8">
        <PersonalizedCoachNotes championId={champion.id} championName={champion.name} role={champion.role} />
        
        {/* Strategic Card Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Filosofía */}
          <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e]">
            <div className="flex items-center gap-2 mb-3 border-b border-[#eadecd] pb-2 text-[#785a28]">
              <Heart className="w-4 h-4" />
              <h3 className="lol-title font-bold text-xs uppercase tracking-wider">
                Filosofía Estratégica
              </h3>
            </div>
            <p className="text-xs text-[#0f1923] leading-relaxed italic">
              "{champion.philosophy}"
            </p>
          </div>

          {/* Cuándo elegir */}
          <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e]">
            <div className="flex items-center gap-2 mb-3 border-b border-[#eadecd] pb-2 text-[#785a28]">
              <Flame className="w-4 h-4" />
              <h3 className="lol-title font-bold text-xs uppercase tracking-wider">
                Cuándo Pickear
              </h3>
            </div>
            <p className="text-xs text-[#0f1923] leading-relaxed">
              {champion.pickWhen}
            </p>
          </div>

          {/* Win Condition */}
          <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e]">
            <div className="flex items-center gap-2 mb-3 border-b border-[#eadecd] pb-2 text-[#785a28]">
              <CheckCircle className="w-4 h-4" />
              <h3 className="lol-title font-bold text-xs uppercase tracking-wider">
                Condición de Victoria
              </h3>
            </div>
            <p className="text-xs text-[#0f1923] leading-relaxed">
              {champion.winCondition}
            </p>
          </div>
        </div>

        {/* Spikes & Matchups & Synergies Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Spikes and timelines */}
          <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#eadecd] pb-2 text-[#785a28]">
              <Clock className="w-4 h-4" />
              <h3 className="lol-title font-bold text-xs uppercase tracking-wider">
                Picos de Poder (Power Spikes)
              </h3>
            </div>
            <div className="flex flex-col gap-2">
              {champion.powerSpikes?.map((spike, idx) => (
                <div key={idx} className="flex gap-2 text-xs items-start bg-[#fdfbf7] border border-[#eadecd] p-2.5 rounded-sm">
                  <span className="w-4 h-4 rounded-full bg-[#0a1428] text-[#c8aa6e] flex items-center justify-center font-bold text-[9px] shrink-0 mt-0.5">
                    {idx + 1}
                  </span>
                  <span className="text-[#0f1923] leading-relaxed">{spike}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sinergias & Counters */}
          <div className="lol-panel p-5 bg-[#fcf9f2] border border-[#c8aa6e] flex flex-col gap-4">
            <div className="flex items-center gap-2 border-b border-[#eadecd] pb-2 text-[#785a28]">
              <Award className="w-4 h-4" />
              <h3 className="lol-title font-bold text-xs uppercase tracking-wider">
                Aliados & Amenazas
              </h3>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Sinergias */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-emerald-800 bg-emerald-500/10 px-2 py-0.5 self-start rounded-sm">
                  Sinergias Máximas (Botlane)
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {champion.synergies?.map((syn) => (
                    <span key={syn} className="bg-[#fdfbf7] border border-[#d8ccb4] text-[#0f1923] px-3 py-1 rounded text-xs font-semibold">
                      {syn}
                    </span>
                  ))}
                </div>
              </div>

              {/* Counters / Amenazas */}
              <div className="flex flex-col gap-1.5">
                <span className="text-[9px] uppercase font-extrabold tracking-wider text-rose-800 bg-rose-500/10 px-2 py-0.5 self-start rounded-sm">
                  Amenazas Directas (Evitar o Banear)
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {champion.counters && champion.counters.length > 0 ? (
                    champion.counters.map((count) => (
                      <span key={count} className="bg-red-950/5 border border-red-800/30 text-[#c63333] px-3 py-1 rounded text-xs font-semibold">
                        {count}
                      </span>
                    ))
                  ) : (
                    <span className="text-xs text-[#5e6b77] italic pl-1">
                      Ningún counter crítico listado. Pick de alta estabilidad.
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* builds and gear */}
        <div className="flex flex-col gap-4">
          <div className="border-b border-[#c8aa6e]/40 pb-1.5">
            <h2 className="lol-title font-bold text-base text-[#0f1923] tracking-widest uppercase">
              Rutas de Objetos & Runas
            </h2>
          </div>

          <div className="flex flex-col gap-8">
            {champBuilds.length === 0 ? (
              <div className="lol-panel p-6 text-center text-xs text-[#5e6b77] bg-[#fcf9f2]">
                No hay builds registradas para este campeón.
              </div>
            ) : (
              champBuilds.map((build, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <div className="bg-[#0a1428] border-l-4 border-[#c8aa6e] py-2 px-4">
                    <span className="font-serif font-black text-[#f0e6d3] text-sm uppercase tracking-wider">
                      {build.title}
                    </span>
                  </div>
                  <BuildDisplay build={build} />
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
