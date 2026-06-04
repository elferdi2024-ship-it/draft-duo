import DraftPageClient from "@/components/draft/draft-page-client";

export const metadata = {
  title: "Simulador de Draft en Vivo — DUO DRAFT",
  description: "Fase de pick/ban interactiva con recomendaciones competitivas de IA en vivo.",
};

export default function DraftPage() {
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 md:px-8 py-6 flex flex-col gap-6">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-serif text-4xl font-bold tracking-widest uppercase text-[#0f1923]">
          Simulador de Draft en Vivo
        </h1>
        <p className="text-sm text-[#5e6b77] uppercase font-bold tracking-widest mt-1">
          Liga de Leyendas • Parche 26.11 (Season 16 — Demacia)
        </p>
      </div>

      <DraftPageClient />
    </div>
  );
}
