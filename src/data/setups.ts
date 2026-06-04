// filepath: src/data/setups.ts

import type { SetupTimeline } from "@/lib/types";

export const setups: SetupTimeline[] = [
  {
    duoId: "ashe-karma",
    name: "Ashe + Karma — La V Perfecta",
    checkpoints: [
      {
        time: "0:00",
        title: "Inicio & Invasión de Visión",
        actions: [
          "Posición en el triángulo inferior o arbusto de entrada del río.",
          "Karma coloca un ward defensivo profundo en la entrada de la jungla rival.",
          "Ashe prepara su primer last hit de súbditos, Karma pokea con Q pasiva sin pushear la oleada."
        ]
      },
      {
        time: "0:30",
        title: "Primera Oleada (Control pasivo)",
        actions: [
          "Ashe realiza last hits a súbditos cuerpo a cuerpo únicamente con auto-ataques.",
          "Karma usa Q en súbditos rivales para ayudar a asegurar el nivel 2.",
          "Si el rival intenta tradear, Karma responde con R-Q para zonearlos."
        ]
      },
      {
        time: "1:30",
        title: "Segunda Oleada (Power spike Nivel 2)",
        actions: [
          "Conseguir el nivel 2 primero.",
          "Ashe aprende la W (Volley) y la lanza sobre súbditos y campeones rivales.",
          "Karma usa W (Focused Resolve) sobre el ADC rival para forzar un intercambio favorable."
        ]
      },
      {
        time: "3:00",
        title: "Nivel 3 & Control de Jungla",
        actions: [
          "Monitorear la posición del jungla enemigo en el mapa.",
          "Si el jungla rival no es visible, Ashe lanza su E (Halcón) hacia los campamentos de Raptors o Gromp enemigo."
        ],
        decision: {
          condition: "¿El tirador enemigo tiene menos del 70% de su vida?",
          ifTrue: "Jugar agresivo. Ashe busca iniciar con W y Karma con R-Q desde arbusto para buscar asesinato.",
          ifFalse: "Pushear la oleada lentamente y farmear de forma segura."
        }
      },
      {
        time: "4:00",
        title: "Preparación de Dragón",
        actions: [
          "Ashe usa su E (Halcón) directamente sobre la fosa del dragón.",
          "Karma camina a colocar un pixel ward en el arbusto del río para detectar rotaciones."
        ],
        decision: {
          condition: "¿El jungla rival está rondando el carril inferior?",
          ifTrue: "Crashear la oleada actual rápidamente y rotar a base para comprar items.",
          ifFalse: "Hacer push lento para mantener la prioridad de línea y habilitar el dragón."
        }
      },
      {
        time: "5:00-6:00",
        title: "Primer Crash Opresivo bajo Torre",
        actions: [
          "Acumular una oleada grande de súbditos bajo la torre enemiga.",
          "Karma activa R-E (Escudo de velocidad) para acelerar a ambos hacia los arbustos de línea.",
          "Ashe pokea con W + auto-ataques constantemente."
        ],
        decision: {
          condition: "¿El tirador enemigo tiene menos del 50% de su vida?",
          ifTrue: "Ashe busca iniciar con R desde niebla para asegurar la baja y tomar la primera placa.",
          ifFalse: "Mantener el poke seguro sin arriesgar un dive bajo torre innecesario."
        }
      },
      {
        time: "7:00-9:00",
        title: "Setup de Dragón en V",
        actions: [
          "Ashe empuja la oleada de forma perpendicular desde el sur.",
          "Karma se sitúa en el vértice de la V listo para desenganchar con R-E en caso de iniciación rival.",
          "Si el jungla aliado inicia el dragón, Karma usa R-E para acelerarlo y asegurar el smite."
        ]
      },
      {
        time: "10:00-12:00",
        title: "Mid Game Spike (1-2 Items)",
        actions: [
          "Ashe tiene 1-2 items (Hexoptics + Phantom Dancer) y W al máximo nivel.",
          "Karma tiene completados Dream Maker e Ionian Boots."
        ],
        decision: {
          condition: "¿Tienen al menos 1 asesinato de ventaja sobre la botlane rival?",
          ifTrue: "Hacer crash perfecto y tirar la primera torre de forma definitiva.",
          ifFalse: "Priorizar el control de visión del río y asegurar el segundo dragón del mapa."
        }
      },
      {
        time: "14:00",
        title: "Asedio de Primera Torre",
        actions: [
          "Generar un crash perfecto con oleada de cañón.",
          "Iniciar dive con Ashe R desde las sombras si algún rival defiende con poca vida.",
          "Destruir la torre inferior y liberar a Karma para rotar con el jungla."
        ]
      },
      {
        time: "20:00+",
        title: "Fase Tardía (Late Game)",
        actions: [
          "Ashe cuenta con 3+ items, incluyendo Manru Emblem (activación de críticos garantizados tras R).",
          "Karma tiene Moonstone Renewer para maximizar escudos grupal.",
          "Iniciar teamfights con la Flecha de Ashe y mantener el posicionamiento detrás de la frontline."
        ]
      }
    ]
  },
  {
    duoId: "varus-karma",
    name: "Varus + Karma — La Máquina de Asedio",
    checkpoints: [
      {
        time: "0:00-1:30",
        title: "Setup Defensivo Inicial",
        actions: [
          "Posicionamiento seguro cerca de la torre. Varus es vulnerable en nivel 1.",
          "Karma coloca ward en la entrada del río.",
          "Varus farmea de forma pasiva y evita intercambios extendidos de auto-ataques."
        ]
      },
      {
        time: "1:30-3:00",
        title: "Poke Desde las Sombras (Fog)",
        actions: [
          "Una vez empujada la oleada bajo torre enemiga, Karma y Varus se ocultan en el arbusto ciego.",
          "Karma usa R-E para dar velocidad de movimiento en el arbusto.",
          "Varus carga su Q (Flecha penetrante) oculto en la niebla y la dispara al tirador enemigo."
        ],
        decision: {
          condition: "¿El tirador enemigo cae a menos del 60% de HP?",
          ifTrue: "Pushear agresivamente la línea para forzar que el enemigo gaste recursos bajo torre.",
          ifFalse: "Continuar el desgaste pasivo y asegurar el farm de súbditos."
        }
      },
      {
        time: "4:00-6:00",
        title: "Caza en la Jungla (Pick Potential)",
        actions: [
          "Cuando el soporte rival intente caminar al río para colocar visión.",
          "Karma coloca un pixel ward y Varus se esconde en el tri-bush o arbusto del río.",
          "Karma usa R-E para acelerar y Varus lanza su R (Cadena de corrupción) para inmovilizar al soporte."
        ]
      },
      {
        time: "6:00-8:00",
        title: "Setup de Dragón",
        actions: [
          "Push lento hacia la torre rival para retenerlos en línea.",
          "Karma limpia visión en la fosa del dragón y Varus usa su E para ralentizar al enemigo en caso de persecución."
        ],
        decision: {
          condition: "¿El jungla rival está gankeando el botlane?",
          ifTrue: "Jugar en rango seguro bajo torre. Varus reserva la R de forma puramente defensiva.",
          ifFalse: "Forzar el dragón en cuanto la prioridad de súbditos lo permita."
        }
      },
      {
        time: "10:00-14:00",
        title: "Spike de Letalidad (Youmuu's + Opportunity)",
        actions: [
          "Varus tiene Youmuu's y Opportunity. Su Q inflige 800+ de daño.",
          "Hacer crash de oleada de cañón bajo torre rival y asediar constantemente.",
          "Karma usa R-Q para obligar al enemigo a posicionarse mal y Varus spamea la Q."
        ],
        decision: {
          condition: "¿El enemigo tiene menos del 50% de HP?",
          ifTrue: "Varus lanza R directo → Asegurar kill → Tomar la primera torre.",
          ifFalse: "Seguir asediando bajo torre."
        }
      },
      {
        time: "15:00-20:00",
        title: "Rotación Macro de Asedio",
        actions: [
          "Tras derribar la torre inferior, Karma usa R-E para rotar rápidamente a la línea de mid o top.",
          "Repetir el patrón de crash + asedio con poke de largo alcance.",
          "Tirar la segunda torre del mapa antes del minuto 20."
        ]
      },
      {
        time: "25:00+",
        title: "Caza Tardía (Late Game)",
        actions: [
          "Varus cuenta con Manru Emblem, infligiendo daño de críticos tras iniciar con R.",
          "Generar picks desde arbustos no controlados por visión enemiga.",
          "Ganar peleas cazando a un carry rival antes de que inicie la teamfight formal."
        ]
      }
    ]
  },
  {
    duoId: "lucian-nami",
    name: "Lucian + Nami — La Iniciación Ciclónica",
    checkpoints: [
      {
        time: "0:00-1:30",
        title: "Inicio Opresivo del Carril",
        actions: [
          "Posicionamiento agresivo en el arbusto lateral medio. Nami wardea el río.",
          "Lucian realiza last hits rápidos y Nami pokea con W cuando el carry rival intente farmear.",
          "Evitar intercambios largos de vida hasta subir a nivel 2."
        ]
      },
      {
        time: "1:30",
        title: "Power Spike Nivel 2 (All-In Letal)",
        actions: [
          "Nami coloca inmediatamente la E (Bendición de Marea) sobre Lucian.",
          "Lucian realiza Dash (E) hacia adelante, activa doble auto-ataque y lanza la Q para burst inmediato.",
          "Nami sigue con W (Mareas vivas) para curar a Lucian y dañar al enemigo al mismo tiempo."
        ]
      },
      {
        time: "3:00",
        title: "Nivel 3 & Control de Visión",
        actions: [
          "Controlar visión del arbusto del río. Nami busca limpiar wards enemigos.",
          "Lucian guarda maná para la rotación completa de habilidades."
        ],
        decision: {
          condition: "¿El tirador o soporte enemigo tiene menos del 60% de HP?",
          ifTrue: "Nami busca atrapar con Q (Burbuja acuática) y Lucian ejecuta con all-in para asegurar kill.",
          ifFalse: "Mantener push lento, desgastar con poke y forzar placas."
        }
      },
      {
        time: "6:00",
        title: "Ultimate Chain (Tsunami + Sacrificio)",
        actions: [
          "Nami inicia con R (Tsunami) desde niebla para levantar al enemigo y ralentizarlo.",
          "Lucian abre con R (El Sacrificio) disparando en ráfaga para bajar vida.",
          "Nami conecta la Q (Burbuja) garantizada al final del levantamiento."
        ]
      },
      {
        time: "10:00-14:00",
        title: "Snowball de Coleccionista",
        actions: [
          "Lucian tiene completados The Collector y Berserker's Greaves.",
          "Nami tiene completados Echoes of Helia e Imperial Mandate."
        ],
        decision: {
          condition: "¿Destruyeron la primera torre inferior?",
          ifTrue: "Rotar inmediatamente a mid/top lane con R-E/Nami pasiva para forzar más torres y Drake.",
          ifFalse: "Forzar peleas en el río alrededor del Drake y asediar la torre inferior."
        }
      },
      {
        time: "20:00+",
        title: "Peleas de Equipo y Flancos",
        actions: [
          "Evitar peleas front-to-back muy largas contra composiciones de poke.",
          "Buscar flancos o peleas rápidas en la jungla donde el Tsunami de Nami cubra pasillos estrechos.",
          "Asegurar peel de Nami sobre Lucian contra asesinos con R y burbujas."
        ]
      }
    ]
  }
];
