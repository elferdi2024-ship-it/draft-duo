// filepath: src/data/matchups.ts

import type { MatchupDetail } from "@/lib/types";

export const matchups: MatchupDetail[] = [
  {
    id: "ashe-karma-vs-caitlyn-lux",
    ourDuo: "ashe-karma",
    enemyDuo: "caitlyn-lux",
    difficulty: "HARD",
    problem: "Caitlyn outrangea a Ashe en auto-ataques. Lux pokea con E y Q desde 1000 de distancia, haciéndolo una línea opresiva.",
    decisionTrees: [
      {
        question: "¿Caitlyn se acerca a farmear expuesta?",
        yes: {
          question: "¿Caitlyn está a menos de 70% de HP?",
          yes: "Ashe R desde arbusto ciego → Karma R-Q → Kill potential alto.",
          no: "Ashe W poke para desgastar + Karma Q de respuesta. Retroceder inmediatamente.",
        },
        no: "Mantener farm pasivo y seguro bajo torre. Esperar a nivel 6 para buscar iniciación.",
      },
      {
        question: "¿Lux intenta pokear con su E?",
        yes: {
          question: "¿Lux está a menos de 50% de HP y sin flash?",
          yes: "Karma R-E (Escudo + Velocidad) → Esquivar E → Ashe R a Lux → Asegurar kill.",
          no: "Karma R-E (Escudo) en Ashe para mitigar daño. Esquivar usando la velocidad de movimiento extra.",
        },
        no: "Mantenerse en movimiento perpendicular para evitar que Lux halle ángulos de Q fáciles.",
      },
    ],
    itemsSpecific: "Ashe: Comprar Cloth Armor temprano si la presión física es alta. Karma: Spectre's Cowl / MR temprano para mitigar el poke de Lux.",
    winCondition: "Llegar al minuto 14 con la torre en pie y al menos 2 dragones asegurados. Castigar a Caitlyn cuando no tenga el soporte de Lux cerca.",
  },
  {
    id: "varus-karma-vs-nautilus-lucian",
    ourDuo: "varus-karma",
    enemyDuo: "nautilus-lucian",
    difficulty: "HARD",
    problem: "Lucian posee un burst de daño altísimo y Nautilus tiene un engage fortísimo y dive letal. Si logran agarrarte, mueres al instante.",
    decisionTrees: [
      {
        question: "¿Nautilus tiene su Q (Ancla) disponible?",
        yes: {
          question: "¿Nautilus conecta su Q sobre alguno de ustedes?",
          yes: "Flash defensivo instantáneo. Varus R al tirador enemigo (Lucian) + Karma R-Q/W para mitigar el all-in.",
          no: "Jugar en posición defensiva detrás de los súbditos. No intentar trades largos.",
        },
        no: "Fase de castigo: Varus Q cargada desde arbusto ciego + Karma Q-R para desgastar a Lucian.",
      },
    ],
    itemsSpecific: "Varus: Edge of Night (Escudo anti-all in de Nautilus/Lucian). Karma: Locket of the Iron Solari temprano para mitigar el burst de Lucian.",
    winCondition: "Completar Edge of Night y Youmuu's en Varus. Pokear a Lucian desde lejos para que no pueda entrar sin morir en el intento.",
  },
  {
    id: "ashe-karma-vs-lulu-kogmaw",
    ourDuo: "ashe-karma",
    enemyDuo: "lulu-kogmaw",
    difficulty: "FREE",
    problem: "Kog'Maw potenciado por Lulu escala de forma masiva en el late game, pero en early game carecen de movilidad y sufren ante el poke lineal.",
    decisionTrees: [
      {
        question: "¿Kog'Maw se adelanta para dar el último golpe a un súbdito?",
        yes: {
          question: "¿Kog'Maw está a menos de 60% de HP?",
          yes: "Ashe R desde arbusto → Karma R-Q → Asegurar kill fácil debido a su nula movilidad.",
          no: "Ashe W para ralentizar y Karma Q. Castigar con auto-ataques cada vez que intente farmear.",
        },
        no: "Mantener la oleada empujada (push constante) para desgastar su torre y forzar placas.",
      },
    ],
    itemsSpecific: "Ashe: Manru Emblem como primer o segundo item para potenciar el burst de críticos en peleas clave. Karma: Echoes of Helia + Moonstone.",
    winCondition: "Cerrar la partida antes del minuto 25. Controlar todos los dragones tempranos y tirar la primera torre antes del minuto 12.",
  },
  {
    id: "varus-karma-vs-lulu-vayne",
    ourDuo: "varus-karma",
    enemyDuo: "lulu-vayne",
    difficulty: "HARD",
    problem: "Vayne junto a Lulu es extremadamente escurridiza gracias a su Q (Tumble) y cuenta con sustain y peel, lo que puede contrarrestar tu pokeo.",
    decisionTrees: [
      {
        question: "Vayne usa su Q (Tumble) de forma ofensiva?",
        yes: {
          question: "¿Vayne se expone sin súbditos enfrente?",
          yes: "Karma R-E (Velocidad) → Seguir a Vayne → Varus R root instantáneo → Karma R-Q → Kill.",
          no: "Esperar a que expire su bufo de movilidad. Seguir pokeando con Q de Varus desde las sombras.",
        },
        no: "Lanzar Varus Q cargada desde niebla. Si conecta, seguir con Varus E para ralentizar y Karma Q.",
      },
    ],
    itemsSpecific: "Varus: Serylda's Grudge para ralentizar a Vayne en trades y penetrar su armadura. Karma: R-Q potenciado con AP para forzar resets de Vayne.",
    winCondition: "Ganar el mid game. Destruir la primera torre bot y rotar al carril central para negar el escalado pasivo de Vayne.",
  },
  // ============================================
  // New clinical matchups (Phase 9)
  // ============================================
  {
    id: "lucian-nami-vs-caitlyn-morgana",
    ourDuo: "lucian-nami",
    enemyDuo: "caitlyn-morgana",
    difficulty: "HARD",
    problem: "Caitlyn tiene una ventaja abismal de rango y Morgana puede bloquear el CC de la burbuja (Q) de Nami o el burst de Lucian con su Escudo Negro (E).",
    decisionTrees: [
      {
        question: "¿Morgana tiene su Escudo Negro (E) en cooldown?",
        yes: {
          question: "¿Caitlyn se adelanta a dar un auto-ataque?",
          yes: "Nami usa E en Lucian → Lucian Dash (E) + Q + pasiva → Nami Q Burbuja para cazar → Asegurar kill.",
          no: "Mantenerse en arbustos. Esperar gank del jungla o limpiar oleadas bajo torre.",
        },
        no: "No gastar habilidades de CC. Hostigar con auto-ataques de Lucian para baitear el escudo de Morgana primero.",
      },
    ],
    itemsSpecific: "Lucian: Mercurial Scimitar / QSS temprano si Morgana conecta Qs constantes. Nami: Imperial Mandate.",
    winCondition: "Baitear el escudo negro de Morgana. Castigar a Morgana si se expone a trades cortos. Negar las placas de Caitlyn.",
  },
  {
    id: "kaisa-nautilus-vs-ezreal-braum",
    ourDuo: "kaisa-nautilus",
    enemyDuo: "ezreal-braum",
    difficulty: "MEDIUM",
    problem: "Braum intercepta las definitivas y hooks de Nautilus con su escudo (E) y bloquea el daño de plasma de Kai'Sa. Ezreal se reposiciona fácilmente con E.",
    decisionTrees: [
      {
        question: "¿Braum tiene su escudo (E) activo?",
        yes: "Detener el trade de daño. Kai'Sa retrocede. Nautilus guarda su Q para cuando expire la barrera.",
        no: {
          question: "¿Ezreal gastó su E (Shift) de forma ofensiva?",
          yes: "Nautilus hook instantáneo en Ezreal → Kai'Sa se desliza con R → Aplicar plasma y estallar al carry.",
          no: "Hookear a Braum si se adelanta, o farmear pasivamente esperando que Kai'Sa escale en mid-game.",
        },
      },
    ],
    itemsSpecific: "Kai'Sa: Guinsoo's Rageblade para penetración de armadura dual contra Braum. Nautilus: Knight's Vow.",
    winCondition: "Baitear el escudo de Braum y su R. En teamfights, enfocar a los aliados desprotegidos de Ezreal, ya que Ezreal es difícil de atrapar.",
  },
];
