// filepath: src/app/draft/page.tsx
import DraftPageClient from "@/components/draft/draft-page-client";

export const metadata = {
  title: "Simulador de Draft en Vivo — DUO DRAFT",
  description: "Fase de pick/ban interactiva con recomendaciones competitivas de IA en vivo.",
};

export default function DraftPage() {
  return (
    <div className="w-full max-w-[1720px] mx-auto px-4 md:px-10 py-6 xl:py-3 flex flex-col gap-6 xl:gap-3 xl:h-[calc(100vh-112px)] xl:overflow-hidden">
      {/* Page Title & Subtitle */}
      <div className="shrink-0">
        <h1 className="font-serif text-4xl md:text-5xl xl:text-3xl font-black tracking-widest uppercase text-[#0f1923] shimmer-text-dark">
          Simulador de Draft en Vivo
        </h1>
        <p className="text-xs md:text-sm xl:text-[10px] text-[#c8aa6e] uppercase font-black tracking-widest mt-2">
          Liga de Leyendas • Parche 26.11 (Season 16 — Demacia)
        </p>
      </div>

      <DraftPageClient />
    </div>
  );
}
