// filepath: src/lib/draft-engine.ts

import type { 
  LiveDraftState, 
  BrainAnalysis, 
  BrainRecommendation, 
  CompAnalysis, 
  ChampionData, 
  ChampionScore,
  DraftPhaseStep,
  CompType
} from "@/lib/types";
import { DRAFT_ORDER } from "@/lib/types";
import { ownChampions, staticFallbackChampions } from "@/data/champions";
import { duos } from "@/data/duos";

export class CompetitiveBrain {
  private allChampions: ChampionData[];

  constructor(allChampions: ChampionData[] = staticFallbackChampions) {
    this.allChampions = allChampions;
  }

  private getChampionById(id: string): ChampionData | undefined {
    return this.allChampions.find(c => c.id === id);
  }

  /**
   * Detects the composition type of a team based on their picked champions
   */
  public analyzeComp(pickedIds: (string | null)[]): CompAnalysis | null {
    const validChamps = pickedIds
      .filter((id): id is string => !!id)
      .map(id => this.getChampionById(id))
      .filter((c): c is ChampionData => !!c);

    if (validChamps.length === 0) return null;

    let diveCount = 0;
    let pokeCount = 0;
    let scalingCount = 0;
    let peelCount = 0;

    validChamps.forEach(c => {
      const tags = c.tags || [];
      const classes = c.philosophy || "";

      // Heuristics based on tags and strategic philosophy
      if (tags.includes("Dive") || tags.includes("Engage") || tags.includes("Assassin") || classes.includes("Dive") || classes.includes("CC")) {
        diveCount++;
      }
      if (tags.includes("Poke") || tags.includes("Range") || classes.includes("Poke") || classes.includes("Asedio")) {
        pokeCount++;
      }
      if (tags.includes("Scaling") || tags.includes("Hypercarry") || classes.includes("Late") || classes.includes("1v9") || classes.includes("scaling")) {
        scalingCount++;
      }
      if (tags.includes("Peel") || tags.includes("Anti-dive") || tags.includes("Disengage") || classes.includes("Peel") || classes.includes("counter-engage")) {
        peelCount++;
      }
    });

    const total = validChamps.length;
    let type: CompType = "balanced";
    const strengths: string[] = [];
    const weaknesses: string[] = [];

    if (diveCount / total >= 0.4) {
      type = "dive";
      strengths.push("Iniciación explosiva y presión bajo torre.", "Fuerte escaramuza y cadena de resets.");
      weaknesses.push("Débil ante contra-iniciación coordinada.", "Sufre si el rival resiste el primer impacto.");
    } else if (pokeCount / total >= 0.4) {
      type = "poke";
      strengths.push("Excelente asedio a larga distancia.", "Reduce vida enemiga antes de objetivos.");
      weaknesses.push("Muy vulnerable a flancos e iniciación directa.", "Requiere mantener la distancia.");
    } else if (scalingCount / total >= 0.4) {
      type = "scaling";
      strengths.push("Poder imparable en el juego tardío.", "Fuerte pelea en equipo 5v5 estructurada.");
      weaknesses.push("Fase de líneas pasiva y débil.", "Cede dragones tempranos por falta de prioridad.");
    } else if (peelCount / total >= 0.4) {
      type = "protect";
      strengths.push("Supervivencia garantizada para los carries.", "Excelente capacidad de desenganche.");
      weaknesses.push("Poco daño proactivo propio.", "Totalmente dependiente del rendimiento del tirador.");
    } else {
      type = "balanced";
      strengths.push("Composición versátil adaptable a cualquier fase.", "Buen equilibrio entre iniciación y defensa.");
      weaknesses.push("No destaca de manera sobresaliente en un estilo.", "Puede ser superada por composiciones especializadas.");
    }

    return { type, strengths, weaknesses };
  }

  /**
   * Scores a champion in the context of the current draft
   */
  public scoreChampion(champ: ChampionData, state: LiveDraftState, activeStep: DraftPhaseStep): ChampionScore {
    const isAlly = activeStep.team === state.side;
    
    // 1. Comfort score (highly values our 10 comfort champions)
    let comfort = 20;
    if (champ.isOwnPool) {
      if (champ.learningStatus === "mastered") comfort = 100;
      else if (champ.learningStatus === "learning") comfort = 80;
      else if (champ.learningStatus === "backup") comfort = 60;
    }

    // 2. Meta score
    let meta = 50;
    if (champ.tier === "S+") meta = 100;
    else if (champ.tier === "S") meta = 90;
    else if (champ.tier === "A+") meta = 80;
    else if (champ.tier === "A") meta = 70;

    // Resolve current team picks
    const myTeamPicks = state.side === "blue" ? state.bluePicks : state.redPicks;
    const enemyTeamPicks = state.side === "blue" ? state.redPicks : state.bluePicks;

    const validAllyPicks = myTeamPicks
      .filter((id): id is string => !!id)
      .map(id => this.getChampionById(id))
      .filter((c): c is ChampionData => !!c);

    const validEnemyPicks = enemyTeamPicks
      .filter((id): id is string => !!id)
      .map(id => this.getChampionById(id))
      .filter((c): c is ChampionData => !!c);

    // 3. Synergy Score
    let synergy = 50;
    if (validAllyPicks.length > 0) {
      // Check if we form one of our 10 consolidated duos
      let bestSynergy = 50;
      validAllyPicks.forEach(allyChamp => {
        // Look up duo definition
        const foundDuo = duos.find(
          d => (d.adcId === champ.id && d.supId === allyChamp.id) || 
               (d.adcId === allyChamp.id && d.supId === champ.id)
        );
        if (foundDuo) {
          bestSynergy = Math.max(bestSynergy, 100);
        } else {
          // Semi-comfort synergy
          const hasExplicitSynergy = champ.synergies?.includes(allyChamp.name) || 
                                     allyChamp.synergies?.includes(champ.name);
          if (hasExplicitSynergy) {
            bestSynergy = Math.max(bestSynergy, 85);
          } else {
            // General class overlap
            const bothPoke = (champ.tags?.includes("Poke") || false) && (allyChamp.tags?.includes("Poke") || false);
            const bothDive = (champ.tags?.includes("Dive") || false) && (allyChamp.tags?.includes("Dive") || false);
            if (bothPoke || bothDive) {
              bestSynergy = Math.max(bestSynergy, 70);
            }
          }
        }
      });
      synergy = bestSynergy;
    }

    // 4. Counter Score
    let counter = 50;
    if (validEnemyPicks.length > 0) {
      let counterSum = 0;
      validEnemyPicks.forEach(enemyChamp => {
        let singleCounter = 50;

        // Threat detector: check if enemy counters us
        const enemyThreatToUs = champ.counters?.includes(enemyChamp.name) || 
                                 champ.counters?.includes(enemyChamp.id);
        
        // Counter detector: check if we counter them based on PLAN MACRO rules
        const weCounterEnemy = enemyChamp.counters?.includes(champ.name) || 
                               enemyChamp.counters?.includes(champ.id) ||
                               // Ashe counters Jinx, Smolder
                               (champ.id === "ashe" && (enemyChamp.id === "jinx" || enemyChamp.id === "smolder" || enemyChamp.id === "caitlyn")) ||
                               // Varus counters tanks/enchanters
                               (champ.id === "varus" && (enemyChamp.tags?.includes("Tank") || enemyChamp.id === "lulu" || enemyChamp.id === "janna")) ||
                               // Renata counters engage/dive
                               (champ.id === "renata" && (enemyChamp.tags?.includes("Engage") || enemyChamp.id === "nautilus" || enemyChamp.id === "leona" || enemyChamp.id === "rakan")) ||
                               // Lulu counters dive
                               (champ.id === "lulu" && (enemyChamp.id === "rengar" || enemyChamp.id === "malphite" || enemyChamp.id === "nautilus"));

        if (enemyThreatToUs) {
          singleCounter = 30; // High threat
        } else if (weCounterEnemy) {
          singleCounter = 95; // We counter them
        } else {
          // General lane dynamics
          const isPokeVsAllIn = champ.tags?.includes("Poke") && enemyChamp.tags?.includes("Dive");
          const isAllInVsPoke = champ.tags?.includes("Dive") && enemyChamp.tags?.includes("Poke");
          
          if (isAllInVsPoke) {
            singleCounter = 80; // Dive counters poke in lane
          } else if (isPokeVsAllIn) {
            singleCounter = 40; // Poke suffers vs hard engage all-in
          }
        }
        counterSum += singleCounter;
      });
      counter = Math.round(counterSum / validEnemyPicks.length);

      // Adaptive Composition Counter modifiers based on enemy comp
      const enemyComp = this.analyzeComp(enemyTeamPicks);
      if (enemyComp) {
        if (enemyComp.type === "dive") {
          // Boost peelers/disengage against dive
          if (champ.role === "Support" && (champ.tags?.includes("Peel") || ["lulu", "renata", "braum"].includes(champ.id))) {
            counter = Math.min(100, counter + 20);
          }
          // Boost safe ADCs against dive
          if (champ.id === "ezreal") {
            counter = Math.min(100, counter + 15);
          }
          // Penalize immobile ADCs against dive
          if (champ.role === "ADC" && ["jinx", "ashe"].includes(champ.id)) {
            counter = Math.max(0, counter - 15);
          }
        } else if (enemyComp.type === "poke") {
          // Boost engage/dive supports to lock down poke
          if (champ.role === "Support" && (champ.tags?.includes("Engage") || ["nautilus", "pyke"].includes(champ.id))) {
            counter = Math.min(100, counter + 20);
          }
          // Boost healers/sustain to survive poke
          if (champ.id === "nami") {
            counter = Math.min(100, counter + 15);
          }
        } else if (enemyComp.type === "scaling") {
          // Boost early game aggressive lane bullies to shut down scaling
          if (champ.id === "lucian" || champ.id === "tristana" || champ.id === "caitlyn") {
            counter = Math.min(100, counter + 15);
          }
        }
      }
    }

    // 5. Comp Score (Cohesion)
    let comp = 50;
    if (validAllyPicks.length > 0) {
      const allyAnalysis = this.analyzeComp(myTeamPicks);
      if (allyAnalysis) {
        const allyType = allyAnalysis.type;
        // Do we match the ally team identity?
        const matchesIdentity = 
          (allyType === "dive" && champ.tags?.includes("Dive")) ||
          (allyType === "poke" && champ.tags?.includes("Poke")) ||
          (allyType === "scaling" && champ.tags?.includes("Scaling")) ||
          (allyType === "protect" && champ.tags?.includes("Peel"));
        
        comp = matchesIdentity ? 90 : 60;
      }
    }

    return { counter, synergy, meta, comfort, comp };
  }

  /**
   * Recommends picking options for our team
   */
  private recommendPicks(state: LiveDraftState, activeStep: DraftPhaseStep): BrainRecommendation[] {
    const isAlly = activeStep.team === state.side;
    
    // Only recommend ADC/Support roles since we are locked in those roles
    // Figure out if our slot is ADC or Support
    // The store defines myPickSlots: [number, number] representing the indices in bluePicks or redPicks
    const picksList = state.side === "blue" ? state.bluePicks : state.redPicks;
    const isMySlotADC = state.myPickSlots.includes(activeStep.index) && 
      (!picksList[state.myPickSlots[0]] && activeStep.index === state.myPickSlots[0] 
        ? true 
        : activeStep.index === state.myPickSlots[1]);

    const targetRole = isMySlotADC ? "ADC" : "Support";

    // Filter champions of the correct role
    const candidates = this.allChampions.filter(c => c.role === targetRole || c.roles?.includes(targetRole));

    // Exclude already picked/banned champions
    const pickedBannedIds = new Set<string>();
    state.blueBans.forEach(id => id && pickedBannedIds.add(id));
    state.redBans.forEach(id => id && pickedBannedIds.add(id));
    state.bluePicks.forEach(id => id && pickedBannedIds.add(id));
    state.redPicks.forEach(id => id && pickedBannedIds.add(id));

    const availableCandidates = candidates.filter(c => !pickedBannedIds.has(c.id));

    const recommendations: BrainRecommendation[] = availableCandidates.map(champ => {
      const scores = this.scoreChampion(champ, state, activeStep);
      
      // Calculate total score
      const totalScore = Math.round(
        scores.comfort * 0.35 +
        scores.counter * 0.25 +
        scores.synergy * 0.20 +
        scores.comp * 0.10 +
        scores.meta * 0.10
      );

      // Determine appropriate tag
      let tag: BrainRecommendation["tag"] = "COMFORT_PICK";
      let reasoning = "";

      if (champ.isOwnPool && scores.counter > 80) {
        tag = "BEST_PICK";
        reasoning = `${champ.name} es la mejor opción. Tiene alta sinergia con tus aliados y counterea la composición rival.`;
      } else if (scores.counter > 85) {
        tag = "COUNTER_PICK";
        reasoning = `Excelente counter directo para la botlane enemiga revelada.`;
      } else if (champ.isOwnPool && scores.comfort === 100) {
        tag = "COMFORT_PICK";
        reasoning = `Pick confort prioritario dominado del Plan Macro. Seguro y consistente.`;
      } else {
        tag = "SAFE_PICK";
        reasoning = `Pick seguro que aporta equilibrio a la composición de tu equipo.`;
      }

      // Contextual reasoning based on plan macro details
      if (champ.id === "ashe") {
        reasoning += " Aporta presión de oleadas, visión perpendicular (E) e iniciaciones con R.";
      } else if (champ.id === "varus") {
        reasoning += " Da asedio devastador y kill-potential en arbustos ciegos con Q de letalidad.";
      } else if (champ.id === "jhin") {
        reasoning += " Ofrece control de visión y picks seguros desde la niebla (W + R).";
      } else if (champ.id === "tristana") {
        reasoning += " Gran presión de demolición de placas y capacidad de dive seguro.";
      } else if (champ.id === "jinx") {
        reasoning += " Hypercarry de escalado monstruoso con resets limpios en peleas tardías.";
      } else if (champ.id === "karma") {
        reasoning += " Tu enchanter de poke prioritario, acelerador de rotaciones con R-E.";
      } else if (champ.id === "nautilus") {
        reasoning += " Control total de línea con engage duro e iniciación perfecta de dives.";
      } else if (champ.id === "pyke") {
        reasoning += " Generador de bola de nieve en la niebla y ejecutor clave con R.";
      } else if (champ.id === "renata") {
        reasoning += " Salvavidas con W y desarmador masivo de composiciones agresivas con R.";
      } else if (champ.id === "lulu") {
        reasoning += " Peel inigualable para blindar a tu tirador contra asesinos y diveadores.";
      }

      return {
        championId: champ.id,
        championName: champ.name,
        ddragonKey: champ.ddragonKey,
        totalScore,
        scores,
        reasoning,
        tag
      };
    });

    // Sort by total score descending
    return recommendations.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
  }

  /**
   * Recommends bans for the current team
   */
  private recommendBans(state: LiveDraftState, activeStep: DraftPhaseStep): BrainRecommendation[] {
    const isAlly = activeStep.team === state.side;
    
    // Standard ban priorities from macro plan
    // 1. Senna (Always banned)
    // 2. Caitlyn (Counter to Ashe, Jhin)
    // 3. Rakan (Counter to dives)
    // 4. Lulu (If enemy has scaling hypercarry)
    const macroBans = [
      { id: "senna", reason: "Anti-dictadura de oleada. Bloqueo obligatorio número 1.", tag: "PRIORITY_BAN" as const },
      { id: "caitlyn", reason: "Counter directo de rango a Ashe/Jhin. Bloqueo de línea.", tag: "PRIORITY_BAN" as const },
      { id: "rakan", reason: "Contrarresta nuestros setups de dive. Alta prioridad.", tag: "VALUE_BAN" as const },
      { id: "lulu", reason: "Blindaje de carry enemigo e inmortalidad contra poke. Bloqueo de confort.", tag: "VALUE_BAN" as const },
    ];

    // Filter already banned or picked
    const bannedPicked = new Set<string>();
    state.blueBans.forEach(id => id && bannedPicked.add(id));
    state.redBans.forEach(id => id && bannedPicked.add(id));
    state.bluePicks.forEach(id => id && bannedPicked.add(id));
    state.redPicks.forEach(id => id && bannedPicked.add(id));

    const finalRecommendations: BrainRecommendation[] = [];

    macroBans.forEach(mb => {
      if (!bannedPicked.has(mb.id)) {
        const champ = this.getChampionById(mb.id);
        if (champ) {
          finalRecommendations.push({
            championId: mb.id,
            championName: champ.name,
            ddragonKey: champ.ddragonKey,
            totalScore: mb.tag === "PRIORITY_BAN" ? 95 : 85,
            scores: { comfort: 100, counter: 80, meta: 90, synergy: 0, comp: 0 },
            reasoning: mb.reason,
            tag: mb.tag
          });
        }
      }
    });

    // If we need more bans, find high-tier enemy counters that are not banned
    if (finalRecommendations.length < 5) {
      const topPicks = this.allChampions
        .filter(c => !bannedPicked.has(c.id))
        .filter(c => c.tier === "S+" || c.tier === "S")
        .filter(c => c.role === "ADC" || c.role === "Support");

      topPicks.forEach(tp => {
        if (finalRecommendations.length < 5 && !finalRecommendations.some(r => r.championId === tp.id)) {
          finalRecommendations.push({
            championId: tp.id,
            championName: tp.name,
            ddragonKey: tp.ddragonKey,
            totalScore: 75,
            scores: { comfort: 50, counter: 50, meta: 90, synergy: 50, comp: 50 },
            reasoning: `Bloqueo de alto tier meta (${tp.tier}) para denegar confort a la botlane rival.`,
            tag: "VALUE_BAN"
          });
        }
      });
    }

    return finalRecommendations.sort((a, b) => b.totalScore - a.totalScore).slice(0, 5);
  }

  /**
   * Performs complete analysis of the current draft state
   */
  public analyze(state: LiveDraftState, userRole: "fer" | "ralph" | null = null): BrainAnalysis {
    const stepIndex = state.currentStepIndex;
    
    if (stepIndex >= DRAFT_ORDER.length) {
      return {
        isMyTurn: false,
        actionType: "pick",
        recommendations: [],
        enemyComp: this.analyzeComp(state.side === "blue" ? state.redPicks : state.bluePicks),
        allyComp: this.analyzeComp(state.side === "blue" ? state.bluePicks : state.redPicks),
        warnings: [],
        winConditions: [
          userRole === "fer" 
            ? "Fer: Fase de Draft Completada. Asegura tu farm de late game y mantén el posicionamiento perpendicular."
            : userRole === "ralph"
            ? "Ralph: Fase de Draft Completada. Secuestra wards enemigos, mantén visión en río y da peel a Fer."
            : "Fase de Draft Completada. Ejecuta tu plan macro minuto a minuto."
        ],
        phase: "complete"
      };
    }

    const currentStep = DRAFT_ORDER[stepIndex];
    const isMyTurn = currentStep.team === state.side;
    
    // Evaluate current phase label
    let phaseLabel: BrainAnalysis["phase"] = "pick1";

    // Recommendations
    const recommendations = currentStep.type === "ban" 
      ? this.recommendBans(state, currentStep)
      : this.recommendPicks(state, currentStep);

    // Resolve compositions
    const allyPicks = state.side === "blue" ? state.bluePicks : state.redPicks;
    const enemyPicks = state.side === "blue" ? state.redPicks : state.bluePicks;

    const allyComp = this.analyzeComp(allyPicks);
    const enemyComp = this.analyzeComp(enemyPicks);

    // Contextual warnings & win conditions
    const warnings: string[] = [];
    const winConditions: string[] = [];

    // Analyze warnings
    const enemyPickedIds = enemyPicks.filter(Boolean) as string[];
    const allyPickedIds = allyPicks.filter(Boolean) as string[];

    if (enemyPickedIds.includes("caitlyn") && !allyPickedIds.includes("ashe")) {
      if (userRole === "fer") {
        warnings.push("¡Fer, peligro! El rival eligió Caitlyn. Evita tiradores de corto rango. Considera Ashe o Varus para pelear su rango.");
      } else if (userRole === "ralph") {
        warnings.push("¡Ralph, peligro! Caitlyn enemiga revelada. Protege a Fer con escudos (Braum/Karma) y mitiga su poke.");
      } else {
        warnings.push("¡Peligro! El rival pickeó Caitlyn. Evita jugar tiradores de corto rango. Considera Ashe + Karma o Varus.");
      }
    }
    if (enemyPickedIds.includes("senna")) {
      if (userRole === "fer") {
        warnings.push("¡Fer, Senna enemiga! Prepárate para castigarla rápido. Dile a Ralph que busque iniciaciones (Lucian/Nami o Tristana/Nautilus).");
      } else if (userRole === "ralph") {
        warnings.push("¡Ralph, Senna enemiga! Castiga su fragilidad temprano. Elige Nautilus, Pyke o Thresh para engancharla.");
      } else {
        warnings.push("¡Senna revelada! Rompe la dictadura de oleadas con dives pesados de Tristana + Nautilus.");
      }
    }
    if (enemyPickedIds.some(id => ["nautilus", "leona", "rakan", "rengar", "malphite"].includes(id))) {
      if (userRole === "fer") {
        warnings.push("¡Fer, amenaza de dive/engage detectada! Posiciónate atrás, compra Edge of Night y espera el peel de Ralph.");
      } else if (userRole === "ralph") {
        warnings.push("¡Ralph, amenaza de dive detectada! Prioriza Renata Glasc, Lulu o Braum para dar peel instantáneo a Fer.");
      } else {
        warnings.push("Amenaza de DIVE o hard engage detectada. Prioriza Renata Glasc o Lulu en support para peel.");
      }
    }

    // Default macro guidelines if no warnings
    if (warnings.length === 0) {
      if (userRole === "fer") {
        warnings.push("Fer: Línea despejada. Asegura tus tiradores de confort y concéntrate en last hits.");
      } else if (userRole === "ralph") {
        warnings.push("Ralph: Línea despejada. Coordina la visión del río y prepara tus supports de confort.");
      } else {
        warnings.push("Línea despejada. Sigue el orden de picks y asegura tus campeones de confort.");
      }
    }

    // Dynamic win conditions
    if (allyComp?.type === "poke") {
      if (userRole === "fer") {
        winConditions.push("Fer: Desgasta con W de Ashe o Q de Varus desde arbustos sin revelar tu posición.");
        winConditions.push("Fer: Asegura farm alto (>8 CS/min) y asedia la torre bot con flechas cargadas.");
      } else if (userRole === "ralph") {
        winConditions.push("Ralph: Usa R-E de Karma para dar velocidad a Fer y pokear con R-Q.");
        winConditions.push("Ralph: Asegura el pixel bush 45s antes del spawn de dragones.");
      } else {
        winConditions.push("Desgastar con W de Ashe o Q de Varus desde arbustos ciegos antes de dragones.");
        winConditions.push("Crashear oleadas y golpear placas. Evitar peleas extendidas cara a cara.");
      }
    } else if (allyComp?.type === "dive") {
      if (userRole === "fer") {
        winConditions.push("Fer: Crashea oleada grande de cañón y salta con Tristana/Lucian cuando Ralph fije al rival.");
        winConditions.push("Fer: Espera resets de kills en escaramuzas limpias.");
      } else if (userRole === "ralph") {
        winConditions.push("Ralph: Nautilus/Thresh inicia con Q o R, fija al carry rival e inicia el dive.");
        winConditions.push("Ralph: Bloquea proyectiles y all-ins enemigos con tu escudo (Braum).");
      } else {
        winConditions.push("Crash de oleada grande con cañón → Dive coordinado bajo torre a nivel 3 o 6.");
        winConditions.push("Tristana salta tras iniciación del Nautilus. Conseguir resets.");
      }
    } else {
      if (userRole === "fer") {
        winConditions.push("Fer: Mantén el farm regular. Mantente seguro usando el halcón de Ashe (E).");
      } else if (userRole === "ralph") {
        winConditions.push("Ralph: Controla la visión del río y trackea al jungla enemigo para proteger a Fer.");
      } else {
        winConditions.push("Farmear eficientemente y mantener el control de visión en arbustos de línea.");
        winConditions.push("Wardear pixel bush 45s antes de dragones y trackear al jungla rival.");
      }
    }

    return {
      isMyTurn,
      actionType: currentStep.type,
      recommendations,
      enemyComp,
      allyComp,
      warnings,
      winConditions,
      phase: phaseLabel
    };
  }
}
