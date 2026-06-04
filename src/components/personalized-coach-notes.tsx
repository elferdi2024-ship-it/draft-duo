// filepath: src/components/personalized-coach-notes.tsx
"use client";

import { useDraftStore } from "@/store/draft-store";
import { Shield, Sparkles, User, Sword } from "lucide-react";

interface PersonalizedCoachNotesProps {
  championId: string;
  championName: string;
  role: "ADC" | "Support" | string;
  defaultNotes?: string;
}

export default function PersonalizedCoachNotes({
  championId,
  championName,
  role,
  defaultNotes = "",
}: PersonalizedCoachNotesProps) {
  const { userRole } = useDraftStore();

  const getPersonalizedNotes = () => {
    if (!userRole) return null;

    const id = championId.toLowerCase();

    if (userRole === "fer") {
      // ADC specific notes
      if (id === "ashe") {
        return "Fer: Wmaxeada temprano te da prioridad de línea. Dispara perpendicularmente al tirador rival. Exige a Ralph su R-E de Karma para reposicionarte rápido.";
      }
      if (id === "varus") {
        return "Fer: Tu Q cargada de letalidad inflige 800+ de daño desde arbustos ciegos. Juega pasivo temprano, y busca all-in con R en cooldown sobre el soporte enemigo.";
      }
      if (id === "lucian") {
        return "Fer: Tu trade de E + doble auto es destructivo. Espera a que Ralph (Nami) te coloque la E antes de saltar. Snowballea y rota para tirar placas.";
      }
      if (id === "caitlyn") {
        return "Fer: Asedia constantemente con rango de auto-ataque. Coloca trampas (W) en cadena justo cuando Ralph inmovilice al rival (Morgana Q).";
      }
      if (id === "ezreal") {
        return "Fer: Kiting constante con Q. Tu E (Shift) es sagrada; no la uses ofensivamente si no tienes visión completa del jungla rival.";
      }
      if (role === "Support") {
        return `Fer: Este es el campeón de soporte de Ralph. Conoce sus habilidades para coordinar all-ins. Su power spike de nivel 6 (${championName} R) te habilitará kills limpias.`;
      }
      return `Fer: Mantén farm alto (>8 CS/min). Posiciónate detrás de tu frontline y de Ralph. Respeta las alertas del minimapa.`;
    }

    if (userRole === "ralph") {
      // Support specific notes
      if (id === "karma") {
        return "Ralph: Prioriza R-E (Escudo de velocidad) en teamfights para acelerar a Fer. Limpia visión en el pixel bush y pokea con R-Q.";
      }
      if (id === "nautilus") {
        return "Ralph: Nautilus es el coloso del dive. Crashea oleada grande de cañón y hookea de inmediato al tirador rival. Tu Aftershock mitiga la torre.";
      }
      if (id === "nami") {
        return "Ralph: Coloca la E en Fer (Lucian) justo cuando entre a tradear. La Burbuja (Q) se guarda para seguir su CC o para desenganchar si lo divean.";
      }
      if (id === "braum") {
        return "Ralph: Bloquea definitivas (Ashe R, Caitlyn Q/R) colocando tu escudo (E) de frente. Salta con W a súbditos aliados para cubrir a Fer.";
      }
      if (id === "thresh") {
        return "Ralph: Lanza la W (Linterna) para salvar a Fer si se expone a flancos. Conecta la E en dirección opuesta para acercar objetivos.";
      }
      if (id === "morgana") {
        return "Ralph: Tu Escudo Negro (E) anula hooks de Nautilus/Pyke. Úsalo reactivamente en Fer justo antes de que lo toquen.";
      }
      if (role === "ADC") {
        return `Ralph: Este es el tirador confort de Fer. Prepárate para coverearlo en early y pokear con él. Tu rol es blindarlo contra iniciaciones duras.`;
      }
      return `Ralph: Wardea el río 45s antes de dragones. Compra Locket o Helia temprano para mantener a Fer vivo.`;
    }

    return null;
  };

  const notes = getPersonalizedNotes();

  if (!notes) return null;

  return (
    <div className={`lol-panel p-4 border flex gap-3 text-xs items-start rounded-sm ${
      userRole === "fer" 
        ? "bg-[#c8aa6e]/5 border-[#c8aa6e]/60 text-[#785a28]" 
        : "bg-[#0397ab]/5 border-[#0397ab]/60 text-[#005a82]"
    }`}>
      <div className="shrink-0 mt-0.5">
        {userRole === "fer" ? (
          <Sword className="w-4 h-4 text-[#c8aa6e]" />
        ) : (
          <Shield className="w-4 h-4 text-[#0397ab]" />
        )}
      </div>
      <div className="flex flex-col gap-1">
        <span className="text-[9px] uppercase tracking-wider font-extrabold font-sans">
          {userRole === "fer" ? "Directiva de Combate (Fer)" : "Directiva de Utilidad (Ralph)"}
        </span>
        <p className="leading-relaxed font-semibold">
          {notes}
        </p>
      </div>
    </div>
  );
}
