// filepath: src/app/draft/page.tsx
import DraftBoard from "@/components/draft/draft-board";
import BrainPanel from "@/components/draft/brain-panel";

export const metadata = {
  title: "Simulador de Draft en Vivo — DraftLab Pro",
  description: "Fase de pick/ban interactiva con recomendaciones competitivas de IA en vivo.",
};

export default function DraftPage() {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-serif text-3xl font-bold tracking-widest uppercase text-[#0f1923]">
          Simulador de Draft en Vivo
        </h1>
        <p className="text-xs text-[#5e6b77] uppercase font-bold tracking-widest mt-1">
          Liga de Leyendas • Parche 26.11 (Season 16 — Demacia)
        </p>
      </div>

      {/* Interactive layout grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Main interactive draft board */}
        <div className="xl:col-span-8">
          <DraftBoard />
        </div>

        {/* Real-time assistant AI sidebar */}
        <div className="xl:col-span-4">
          <BrainPanel />
        </div>
      </div>
    </div>
  );
}
