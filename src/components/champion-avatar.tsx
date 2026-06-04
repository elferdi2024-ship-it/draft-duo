// filepath: src/components/champion-avatar.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getChampionIconUrl, getLatestVersion } from "@/lib/ddragon";
import { Heart } from "lucide-react";

interface ChampionAvatarProps {
  ddragonKey: string;
  name: string;
  tier?: string;
  isComfort?: boolean;
  size?: "sm" | "md" | "lg" | "xl";
}

export default function ChampionAvatar({
  ddragonKey,
  name,
  tier = "B",
  isComfort = false,
  size = "md",
}: ChampionAvatarProps) {
  const [version, setVersion] = useState("15.11.1");

  useEffect(() => {
    getLatestVersion().then(setVersion);
  }, []);

  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-16 h-16",
    xl: "w-24 h-24",
  };

  const getBorderColor = () => {
    if (!tier) return "border-[#d8ccb4]";
    switch (tier) {
      case "S+":
        return "border-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]";
      case "S":
        return "border-[#c8aa6e] shadow-[0_0_4px_rgba(200,170,110,0.3)]";
      case "A+":
        return "border-slate-400";
      case "A":
        return "border-amber-800";
      default:
        return "border-[#d8ccb4]";
    }
  };

  const iconUrl = getChampionIconUrl(version, ddragonKey);

  return (
    <div className="relative shrink-0">
      <div
        className={`relative rounded-sm border-2 overflow-hidden aspect-square ${sizes[size]} ${getBorderColor()}`}
      >
        <Image
          src={iconUrl}
          alt={name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      {isComfort && (
        <div className="absolute -top-1 -right-1 bg-[#0a1428] border border-[#c8aa6e] p-0.5 rounded-full z-10 shadow-sm">
          <Heart className="w-2 h-2 fill-[#c8aa6e] text-[#c8aa6e]" />
        </div>
      )}
    </div>
  );
}
