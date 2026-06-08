// filepath: src/components/navigation.tsx
"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Sparkles, Trophy, User, ArrowLeftRight, HelpCircle } from "lucide-react";
import { useDraftStore } from "@/store/draft-store";

import { useState, useEffect } from "react";

export default function Navigation() {
  const pathname = usePathname();
  const { userRole, setUserRole } = useDraftStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // ALPHA-DRAFT FIX: Hook de efecto cliente para alternar clases de tema y destello visual en document.body
  useEffect(() => {
    if (!mounted) return;

    // Remover clases anteriores
    document.body.classList.remove(
      "theme-fer",
      "theme-ralph",
      "flash-theme-fer",
      "flash-theme-ralph"
    );

    if (userRole === "fer") {
      document.body.classList.add("theme-fer", "flash-theme-fer");
      const timer = setTimeout(() => {
        document.body.classList.remove("flash-theme-fer");
      }, 800);
      return () => clearTimeout(timer);
    } else if (userRole === "ralph") {
      document.body.classList.add("theme-ralph", "flash-theme-ralph");
      const timer = setTimeout(() => {
        document.body.classList.remove("flash-theme-ralph");
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [userRole, mounted]);

  const navItems = [
    { href: "/draft", label: "Simulador", icon: Sparkles },
    { href: "/champions", label: "Campeones", icon: User },
    { href: "/duos", label: "Dúos Maestros", icon: Trophy },
  ];

  const handleToggleRole = () => {
    if (userRole === "fer") {
      setUserRole("ralph");
    } else {
      setUserRole("fer");
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full bg-[#0a1428] border-b border-[var(--border)] px-4 md:px-8 py-3 flex items-center justify-between shadow-lg transition-colors duration-500">
      {/* Brand Logo */}
      <Link href="/" className="flex items-center gap-3 group">
        <div className="relative w-9 h-9 rounded border border-[var(--border)]/40 overflow-hidden bg-gradient-to-b from-[#1e232a] to-[#12161a] group-hover:scale-105 transition-transform flex items-center justify-center">
          <Image
            src="/logo-draft.png"
            alt="DUO DRAFT"
            width={32}
            height={32}
            className="object-contain"
          />
        </div>
        <div className="flex flex-col">
          <span className="text-[#f0e6d3] font-serif font-bold tracking-widest text-sm md:text-base leading-none shimmer-text-light">
            DUO DRAFT
          </span>
          <span className="text-[#c8aa6e] text-[9px] uppercase tracking-wider font-semibold">
            Competitive Brain v26.11
          </span>
        </div>
      </Link>

      {/* Navigation tabs */}
      <nav className="flex items-center gap-1 md:gap-4">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2 px-3 py-1.5 text-xs md:text-sm font-semibold uppercase tracking-wider transition-all duration-200 border-b-2 ${
                isActive
                  ? "border-[var(--border)] text-[#f0e6d3]"
                  : "border-transparent text-[#a0a8b0] hover:text-[#f0e6d3] hover:border-transparent"
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? "text-[var(--border)]" : "text-[#a0a8b0]"}`} />
              <span className="hidden sm:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Role Switcher */}
      <div className="flex items-center gap-3">
        {mounted && userRole ? (
          <button
            onClick={handleToggleRole}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm cursor-pointer duration-300 ${
              userRole === "fer"
                ? "bg-[#00c8c8] text-[#0a1428] border-[#00c8c8] hover:bg-[#008c8c] hover:text-white"
                : "bg-[#c8aa6e] text-[#0a1428] border-[#ebd6b3] hover:bg-[#785a28] hover:text-[#f0e6d3]"
            }`}
            title={`Cambiar a perfil de ${userRole === "fer" ? "Ralph" : "Fer"}`}
          >
            <ArrowLeftRight className="w-3 h-3" />
            <span className="hidden xs:inline">Perfil:</span>
            {userRole === "fer" ? "Fer (ADC)" : "Ralph (SUP)"}
          </button>
        ) : (
          <Link
            href="/"
            className="flex items-center gap-1 px-3 py-1.5 rounded border border-dashed border-[#5e6b77] text-[10px] text-[#5e6b77] hover:border-[#c8aa6e] hover:text-[#c8aa6e] font-bold uppercase transition-all"
          >
            <HelpCircle className="w-3 h-3" />
            Elegir Rol
          </Link>
        )}
      </div>
    </header>
  );
}
