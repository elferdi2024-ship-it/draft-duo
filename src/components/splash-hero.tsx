// filepath: src/components/splash-hero.tsx
"use client";

import Image from "next/image";
import { getChampionSplashUrl } from "@/lib/ddragon";

interface SplashHeroProps {
  ddragonKey: string;
  name: string;
  children: React.ReactNode;
}

export default function SplashHero({ ddragonKey, name, children }: SplashHeroProps) {
  const splashUrl = getChampionSplashUrl(ddragonKey, 0);

  return (
    <div className="relative w-full h-[220px] md:h-[320px] bg-[#0a1428] border-b border-[#c8aa6e] overflow-hidden flex items-end">
      {/* Background Splash Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={splashUrl}
          alt={name}
          fill
          priority
          className="object-cover object-top opacity-70"
          sizes="100vw"
        />
        {/* Deep navy/parchment radial gradient overlays for contrast */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a1428] via-[#0a1428]/60 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a1428]/85 via-transparent to-[#0a1428]/85 z-10" />
      </div>

      {/* Children content wrapper */}
      <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-6 md:pb-8 z-20 flex flex-col justify-end">
        {children}
      </div>
    </div>
  );
}
