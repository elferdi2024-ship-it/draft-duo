// filepath: src/app/draft/page.tsx
import DraftPageClient from "@/components/draft/draft-page-client";

export const metadata = {
  title: "Simulador de Draft en Vivo — DUO DRAFT",
  description: "Fase de pick/ban interactiva con recomendaciones competitivas de IA en vivo.",
};

export default function DraftPage() {
  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 md:px-10 py-4 lg:py-2 flex flex-col gap-4 lg:gap-2.5 lg:h-[calc(100vh-100px)] lg:overflow-hidden">
      {/* Page Title & Subtitle */}
      <div className="shrink-0 flex flex-col md:flex-row md:items-baseline justify-between border-b border-[#785a28]/30 pb-2">
        <h1 className="font-serif text-3xl md:text-4xl lg:text-2xl font-black tracking-widest uppercase text-[#0f1923] shimmer-text-dark">
          Simulador de Draft
        </h1>
        <p className="text-xs md:text-sm lg:text-[10px] text-[#c8aa6e] uppercase font-black tracking-widest mt-1">
          Liga de Leyendas • Parche 26.11 (Season 16)
        </p>
      </div>

      <DraftPageClient />
    </div>
  );
}
