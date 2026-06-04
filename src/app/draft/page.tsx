import DraftPageClient from "@/components/draft/draft-page-client";

export const metadata = {
  title: "Simulador de Draft en Vivo — DUO DRAFT",
  description: "Fase de pick/ban interactiva con recomendaciones competitivas de IA en vivo.",
};

export default function DraftPage() {
  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 md:px-10 py-8 flex flex-col gap-8">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-serif text-4xl md:text-5xl font-black tracking-widest uppercase text-[#0f1923] shimmer-text-dark">
          Simulador de Draft en Vivo
        </h1>
        <p className="text-xs md:text-sm text-[#785a28] uppercase font-black tracking-widest mt-2">
          Liga de Leyendas • Parche 26.11 (Season 16 — Demacia)
        </p>
      </div>

      <DraftPageClient />
    </div>
  );
}
