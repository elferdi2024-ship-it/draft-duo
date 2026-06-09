// filepath: src/lib/coach-teemo-strings.ts

export const TEEMO_INSIGHTS: Record<string, string> = {
  ashe: " Nivel Challenger: Aporta presión constante de oleadas mediante W, revela la ruta del jungla enemigo con E (Halcón) de manera perpendicular, y habilita iniciaciones limpias con R (Flecha de Cristal) para transicionar a objetivos de río.",
  varus: " Nivel Challenger: Habilita composiciones de asedio lineal y poke letal. Utiliza la Q cargada con builds de letalidad desde la niebla para ablandar frontlines. Su R (Cadena de Corrupción) actúa como denegador de engage.",
  jhin: " Nivel Challenger: Ofrece control de visión y picks seguros desde la niebla (W + R). Controla cuellos de botella con cepos (E) y ejecuta objetivos a distancia extrema.",
  tristana: " Nivel Challenger: Opresión mediante empuje de oleada, demolición de placas con E, y gran seguridad con su salto W. Ideal para dives y forzar bola de nieve rápida.",
  jinx: " Nivel Challenger: El hypercarry late game supremo. Limpia peleas grupales mediante su pasiva de resets rápidos. Requiere protección pero ofrece el DPS más alto del draft.",
  karma: " Nivel Challenger: Enchanter dominante de poke y aceleración macro. Acelera rotaciones a dragones con R-E y desgasta al oponente bajo torre con R-Q constante.",
  nautilus: " Nivel Challenger: Iniciador por excelencia y facilitador de dives rápidos. Ralph, inmoviliza al carry rival con Q y pasiva, bloqueando su escape en nivel 2 y 6.",
  pyke: " Nivel Challenger: Generador de snowball ciego. Ralph, limpia centinelas rivales y usa R en ejecuciones para compartir el oro de las escaramuzas.",
  renata: " Nivel Challenger: Especialista anti-dive. La W (Rescate Financiero) salva al carry en trades al límite, y la R (Hostilidad Creciente) desmantela composiciones enemigas de autoataque.",
  lulu: " Nivel Challenger: La protectora definitiva contra asesinos. Usa Polymorph (W) reactivamente en la entrada del rival para anular su ráfaga de daño e inmovilizarlos.",
  thresh: " Nivel Challenger: Soporte de utilidad versátil. La linterna (W) rescata a Fer de sobreextensiones y el Flay (E) cancela saltos de campeones enemigos de engage directo.",
  braum: " Nivel Challenger: Pared infranqueable contra asedios. Detiene proyectiles clave (como definitivas) con la E, aportando aturdimiento glacial masivo mediante autoataques cruzados."
};

export function getCoachInsight(championId: string): string {
  return TEEMO_INSIGHTS[championId.toLowerCase()] || "";
}

export const DRAFT_COMPLETE_INSIGHTS = {
  fer: "Fer: Fase de Draft Completada. Asegura tu farm de late game y mantén el posicionamiento perpendicular.",
  ralph: "Ralph: Fase de Draft Completada. Secuestra wards enemigos, mantén visión en río y da peel a Fer.",
  default: "Fase de Draft Completada. Ejecuta tu plan macro minuto a minuto."
};

export const WARNING_TEMPLATES = {
  caitlyn: {
    fer: "¡Fer, peligro! El rival eligió Caitlyn. Evita tiradores de corto rango. Considera Ashe o Varus para pelear su rango.",
    ralph: "¡Ralph, peligro! Caitlyn enemiga revelada. Protege a Fer con escudos (Braum/Karma) y mitiga su poke.",
    default: "¡Peligro! El rival pickeó Caitlyn. Evita jugar tiradores de corto rango. Considera Ashe + Karma o Varus."
  },
  senna: {
    fer: "¡Fer, Senna enemiga! Prepárate para castigarla rápido. Dile a Ralph que busque iniciaciones (Lucian/Nami o Tristana/Nautilus).",
    ralph: "¡Ralph, Senna enemiga! Castiga su fragilidad temprano. Elige Nautilus, Pyke o Thresh para engancharla.",
    default: "¡Senna revelada! Rompe la dictadura de oleadas con dives pesados de Tristana + Nautilus."
  },
  dive: {
    fer: "¡Fer, amenaza de dive/engage detectada! Posiciónate atrás, compra Edge of Night y espera el peel de Ralph.",
    ralph: "¡Ralph, amenaza de dive detectada! Prioriza Renata Glasc, Lulu o Braum para dar peel instantáneo a Fer.",
    default: "Amenaza de DIVE o hard engage detectada. Prioriza Renata Glasc o Lulu en support para peel."
  },
  fullAd: "⚠️ COACH CHALLENGER: Composición 100% AD detectada. Ralph, prioriza supports de daño mágico (Karma, Lux) para forzar al rival a comprar resistencia mágica.",
  noFrontline: "⚠️ COACH CHALLENGER: Composición sin línea frontal (no frontline). Ralph, prioriza tanques iniciadores o protectores (Nautilus, Braum) para asegurar control.",
  lineClear: {
    fer: "Fer: Línea despejada. Asegura tus tiradores de confort y concéntrate en last hits.",
    ralph: "Ralph: Línea despejada. Coordina la visión del río y prepara tus supports de confort.",
    default: "Línea despejada. Sigue el orden de picks y asegura tus campeones de confort."
  }
};

export const WIN_CONDITION_TEMPLATES = {
  poke: {
    fer: [
      "Fer: Desgasta con W de Ashe o Q de Varus desde arbustos sin revelar tu posición.",
      "Fer: Asegura farm alto (>8 CS/min) y asedia la torre bot con flechas cargadas."
    ],
    ralph: [
      "Ralph: Usa R-E de Karma para dar velocidad a Fer y pokear con R-Q.",
      "Ralph: Asegura el pixel bush 45s antes del spawn de dragones."
    ],
    default: [
      "Desgastar con W de Ashe o Q de Varus desde arbustos ciegos antes de dragones.",
      "Crashear oleadas y golpear placas. Evitar peleas extendidas cara a cara."
    ]
  },
  dive: {
    fer: [
      "Fer: Crashea oleada grande de cañón y salta con Tristana/Lucian cuando Ralph fije al rival.",
      "Fer: Espera resets de kills en escaramuzas limpias."
    ],
    ralph: [
      "Ralph: Nautilus/Thresh inicia con Q o R, fija al carry rival e inicia el dive.",
      "Ralph: Bloquea proyectiles y all-ins enemigos con tu escudo (Braum)."
    ],
    default: [
      "Crash de oleada grande con cañón → Dive coordinado bajo torre a nivel 3 o 6.",
      "Tristana salta tras iniciación del Nautilus. Conseguir resets."
    ]
  },
  default: {
    fer: [
      "Fer: Mantén el farm regular. Mantente seguro usando el halcón de Ashe (E)."
    ],
    ralph: [
      "Ralph: Controls la visión del río y trackea al jungla enemigo para proteger a Fer."
    ],
    default: [
      "Farmear eficientemente y mantener el control de visión en arbustos de línea.",
      "Wardear pixel bush 45s antes de dragones y trackea al jungla rival."
    ]
  },
  level2Spike: "⚠️ TÁCTICA CHALLENGER: El rival tiene un spike de nivel 2 extremadamente agresivo. Cedan la prioridad inicial, absorban oleada bajo torre y eviten muertes.",
  visionPerpendicular: "👁️ CHALLENGER VISION: Colocar wards perpendiculares en la entrada del río a los 2:45 para rastrear flanqueos invisibles o veloces del jungla rival."
};
