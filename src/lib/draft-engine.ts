// filepath: src/lib/draft-engine.ts

import type { 
  LiveDraftState, 
  BrainAnalysis, 
  BrainRecommendation, 
  CompAnalysis, 
  ChampionData, 
  ChampionScore,
  DraftPhaseStep,
  CompType,
  DuoData
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
      if (tags.includes("Dive") || tags.includes("Engage") || tags.includes("Assassin") || classes.includes("Dive") || classes.includes("CC") || tags.includes("CC")) {
        diveCount++;
      }
      if (tags.includes("Poke") || tags.includes("Range") || classes.includes("Poke") || classes.includes("Asedio") || tags.includes("Siege")) {
        pokeCount++;
      }
      if (tags.includes("Scaling") || tags.includes("Hypercarry") || classes.includes("Late") || classes.includes("1v9") || classes.includes("scaling") || tags.includes("Vision")) {
        // Vision / control counts as scaling utility
        scalingCount++;
      }
      if (tags.includes("Peel") || tags.includes("Anti-dive") || tags.includes("Disengage") || classes.includes("Peel") || classes.includes("counter-engage") || tags.includes("Anti-projectile")) {
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
  public scoreChampion(champ: ChampionData, state: LiveDraftState, activeStep: DraftPhaseStep, userRole: "fer" | "ralph" | null = null): ChampionScore {
    const isAlly = activeStep.team === state.side;
    
    // 1. Comfort score (highly values our comfort champions)
    let comfort = 20;
    if (champ.isOwnPool) {
      if (champ.learningStatus === "mastered") comfort = 100;
      else if (champ.learningStatus === "learning") comfort = 80;
      else if (champ.learningStatus === "backup") comfort = 60;
    }

    // Priorización para Ralph: supports tanques primero, luego enchanters
    if (isAlly && (champ.role === "Support" || champ.roles?.includes("Support"))) {
      const priorityTanks = ["thresh", "braum", "nautilus", "leona", "rell"];
      const priorityEnchanters = ["karma", "lulu", "nami", "janna"];

      if (priorityTanks.includes(champ.id)) {
        comfort = Math.min(100, comfort + 35);
      } else if (priorityEnchanters.includes(champ.id)) {
        comfort = Math.min(100, comfort + 15);
      }
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
      // Check if we form one of our consolidated duos
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
          // Semi-comfort synergy or known competitive synergies
          const hasExplicitSynergy = champ.synergies?.includes(allyChamp.name) || 
                                     allyChamp.synergies?.includes(champ.name) ||
                                     (champ.id === "ezreal" && allyChamp.id === "thresh") ||
                                     (champ.id === "thresh" && allyChamp.id === "ezreal") ||
                                     (champ.id === "kaisa" && allyChamp.id === "thresh") ||
                                     (champ.id === "thresh" && allyChamp.id === "kaisa") ||
                                     (champ.id === "ashe" && allyChamp.id === "braum") ||
                                     (champ.id === "braum" && allyChamp.id === "ashe");

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
          if (champ.role === "Support" && (champ.tags?.includes("Engage") || ["nautilus", "pyke", "thresh"].includes(champ.id))) {
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
  private recommendPicks(state: LiveDraftState, activeStep: DraftPhaseStep, userRole: "fer" | "ralph" | null = null): BrainRecommendation[] {
    const isAlly = activeStep.team === state.side;
    
    // Only recommend ADC/Support roles since we are locked in those roles
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
      const scores = this.scoreChampion(champ, state, activeStep, userRole);
      
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
      } else if (champ.id === "thresh") {
        reasoning += " Salvación de carries inmovilizados con linterna (W) y control versátil (Q + E).";
      } else if (champ.id === "braum") {
        reasoning += " Baluarte defensivo ideal para detener proyectiles pesados y proteger con escudo (E).";
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
    
    // Recommendations
    const recommendations = currentStep.type === "ban" 
      ? this.recommendBans(state, currentStep)
      : this.recommendPicks(state, currentStep, userRole);

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
        winConditions.push("Wardear pixel bush 45s antes de dragones y trackea al jungla rival.");
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
      phase: stepIndex < 6 ? "pick1" : "pick2"
    };
  }

  /**
   * Generates dynamic DuoData in real-time for any arbitrary ADC + Support combination
   * Highly optimized with professional meta heuristics for millions of drafts (e.g. Ezreal + Thresh)
   */
  public generateDynamicDuo(adcId: string, supId: string): DuoData | null {
    const adc = this.getChampionById(adcId);
    const sup = this.getChampionById(supId);
    if (!adc || !sup) return null;

    const adcTags = adc.tags || [];
    const supTags = sup.tags || [];
    const combinedTags = Array.from(new Set([...adcTags, ...supTags]));

    // 1. Detectar duos competitivos clasicos conocidos que no esten explicitamente en duos.ts
    const comboKey = `${adc.id}-${sup.id}`;
    
    if (comboKey === "ezreal-thresh") {
      return {
        id: comboKey,
        name: "Ezreal + Thresh",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Desenganche y Kiting Seguro",
        tier: "S",
        philosophy: "Línea sumamente elusiva y reactiva. Combina el posicionamiento libre de Ezreal con la salvación instantánea de la Linterna de Thresh.",
        execution: "Ezreal pokea con Qs seguras. Thresh zonea con la amenaza de Q (Sentencia). Si el jungla enemigo ataca, Thresh tira W hacia atrás para sacar a Ezreal de peligro.",
        winCondition: "Mantener neutralidad en fase de líneas sin morir, castigar errores de posicionamiento con ganks del jungla facilitados por Thresh y desgastar antes de teamfights.",
        powerSpikes: [
          "Nivel 2 (Hook chain a larga distancia)",
          "Nivel 6 (Engache con Thresh R + Ezreal R)",
          "2 Items (Ezreal Muramana + Trinity / Thresh Locket)"
        ],
        tags: ["Kiting", "Peel", "Safe", "Poke", "Linterna"]
      };
    }

    if (comboKey === "kaisa-thresh") {
      return {
        id: comboKey,
        name: "Kai'Sa + Thresh",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Dive de Salto de Plasma",
        tier: "S",
        philosophy: "Agresividad en base a control. Los cc prolongados de Thresh cargan marcas de plasma permitiendo que Kai'Sa vuele instantáneamente al combate.",
        execution: "Thresh busca Q/Flay en el carry rival → Aplica marcas → Kai'Sa responde con W + Q y usa R (Instinto Asesino) para reposicionarse detrás y burstear.",
        winCondition: "Bola de nieve en línea. Forzar peleas en 2v2 cerca de paredes y neutralizar objetivos con la ventaja de rango de entrada de Kai'Sa.",
        powerSpikes: [
          "Nivel 2 (Hook + All-In de Plasma)",
          "Nivel 6 (R de Kai'Sa para seguimiento de Hook)",
          "Evolución Q de Kai'Sa (Spike de daño masivo)"
        ],
        tags: ["Burst", "Dive", "Plasma Chain", "Engage"]
      };
    }

    if (comboKey === "ashe-braum") {
      return {
        id: comboKey,
        name: "Ashe + Braum",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Cadena de Aturdimiento Glacial",
        tier: "A+",
        philosophy: "Defensa absoluta y control de masas ininterrumpido. Las ralentizaciones constantes de Ashe facilitan la aplicación del aturdimiento de Braum.",
        execution: "Ashe ataca primero aplicando perma-slow con básicos o W. Braum salta con W + Q aplicando Golpe Conmocionante. Ashe activa Q e inflige stun instantáneo.",
        winCondition: "Bloquear toda agresión enemiga con escudo de Braum y castigar desenganches enemigos lentos con perma-slow e iniciación de Flechas.",
        powerSpikes: [
          "Nivel 1 (Invasiones potentes por pasiva de Braum)",
          "Nivel 6 (R de Ashe + R de Braum lockdown)",
          "2 Items (KRAKEN + LOCKET)"
        ],
        tags: ["Anti-engage", "Peel", "CC Chain", "Glacial"]
      };
    }

    if (comboKey === "caitlyn-lux") {
      return {
        id: comboKey,
        name: "Caitlyn + Lux",
        adcId,
        supId,
        adcDdragonKey: adc.ddragonKey,
        supDdragonKey: sup.ddragonKey,
        pillar: "Asedio y Captura a Larga Distancia",
        tier: "S",
        philosophy: "Castigo y pokeo insoportable bajo torre enemiga. Cadena de inmovilización letal sin riesgo de exposición.",
        execution: "Lux busca Q (Hechizo Luminoso) → Si conecta, Caitlyn deposita trampa W inmediatamente debajo → Burst de Lux (E + R) y Caitlyn Headshot.",
        winCondition: "Demoler todas las placas antes de los 14 minutos negándole farm bajo torre al rival mediante poke.",
        powerSpikes: [
          "Nivel 2 (Lux Q + Caitlyn W combo letal)",
          "Nivel 6 (Lux R + Caitlyn R combo de ejecución)",
          "1.5 Items (Lethality/Crit en Caitlyn + Luden en Lux)"
        ],
        tags: ["Poke", "Asedio", "Cepo Chain", "Range"]
      };
    }

    // 2. Inferencia algoritmica inteligente si es un combo arbitrario
    let pillar = "Línea Híbrida Adaptativa";
    let tier = "A";
    let philosophy = "";
    let execution = "";
    let winCondition = "";
    const powerSpikes = [
      "Nivel 2 (Intercambio temprano de habilidades)",
      "Nivel 6 (Encadenamiento de habilidades definitivas)",
      "2 Items (Spike de poder del tirador y utilidad del soporte)"
    ];

    const hasEngage = supTags.includes("Engage") || supTags.includes("CC") || ["nautilus", "thresh", "leona", "rell", "rakan"].includes(sup.id);
    const hasPoke = supTags.includes("Poke") || ["karma", "lux", "nami"].includes(sup.id);
    const hasPeel = supTags.includes("Peel") || supTags.includes("Anti-dive") || ["lulu", "renata", "braum", "janna"].includes(sup.id);

    const adcBurst = adcTags.includes("Burst") || adcTags.includes("All-in") || ["lucian", "tristana", "kaisa", "caitlyn"].includes(adc.id);
    const adcPoke = adcTags.includes("Poke") || adcTags.includes("Range") || ["varus", "ashe", "ezreal", "smolder"].includes(adc.id);
    const adcLate = adcTags.includes("Hypercarry") || adcTags.includes("Scaling") || ["jinx", "kaisa", "vayne", "kogmaw"].includes(adc.id);

    // Deducir variables
    if (hasEngage) {
      if (adcBurst) {
        pillar = "Iniciación y Ráfaga Explosiva (All-In)";
        tier = "S";
        philosophy = `Sinergia ofensiva brutal. Aprovecha el control pesado de ${sup.name} para asestar todo el daño en ráfaga de ${adc.name} al instante.`;
        execution = `Fase de líneas: Acumular oleada corta y buscar el choque de nivel 2 o 3. ${sup.name} inicia con CC y ${adc.name} desgasta la barra de vida rival rápidamente. Forzar flashes tempranos.`;
        winCondition = `Dominar los asesinatos en línea para conseguir placas e invadir la jungla enemiga con prioridad.`;
      } else if (adcLate) {
        pillar = "Iniciación y Escalado Protegido";
        tier = "A+";
        philosophy = `Línea equilibrada de control. ${sup.name} actúa como disuasor principal para mantener a salvo a ${adc.name} mientras acumula súbditos de cara al juego tardío.`;
        execution = `Fase de líneas: Priorizar farm estable. Solo iniciar si el oponente comete un error grave de posicionamiento cerca de tu torre. Mantener al tirador a salvo.`;
        winCondition = `Asegurar farm alto y ganar peleas por objetivos grupales en el río a base de control de masas frontal.`;
      } else {
        pillar = "Control y Desgaste Híbrido";
        tier = "A";
        philosophy = `Línea adaptativa basada en picks rápidos. Combina la iniciación de ${sup.name} con las respuestas de medio alcance de ${adc.name}.`;
        execution = `Buscar castigar al soporte enemigo frágil mediante iniciaciones desde arbustos ciegos usando baratijas de visión.`;
        winCondition = `Capturar carries en la transición de río y neutralizar la botlane mediante control de visión.`;
      }
    } else if (hasPoke) {
      if (adcPoke) {
        pillar = "Asedio Lineal y Poke Sostenido";
        tier = "S-";
        philosophy = `Control por distancia y opresión. Mantiene al rival bajo su torre debido al daño incesante infligido a rango máximo por ambos campeones.`;
        execution = `Fase de líneas: Disparar constantemente habilidades sobre el tirador rival cuando vaya a dar el último golpe. Empujar oleadas rápido para golpear placas.`;
        winCondition = `Reducir la vida enemiga al 30% antes de dragones para denegar su entrada y demoler estructuras por presión de asedio.`;
      } else if (adcBurst) {
        pillar = "Desgaste y Remate Agresivo";
        tier = "A+";
        philosophy = `Línea de desgaste estratégico. ${sup.name} reduce la vida enemiga lentamente hasta que entran en rango de ejecución de ${adc.name}.`;
        execution = `Hostigar con habilidades a distancia segura. Una vez el rival baje de la mitad de la barra de vida, ${adc.name} inicia con un salto o ráfaga para liquidar.`;
        winCondition = `Expulsar al rival de línea repetidamente provocando pérdida masiva de experiencia y oro.`;
      } else {
        pillar = "Opresión y Zonificación";
        tier = "A";
        philosophy = `Espaciamiento defensivo con rango. Limita la toma de decisiones enemiga zonificando las entradas al carril inferior.`;
        execution = `Establecer trampas o proyectiles para forzar movimientos incómodos del rival y ganar prioridad de empuje constante.`;
        winCondition = `Conseguir ventajas sustanciales de placas de torre y rotar al carril central de forma segura.`;
      }
    } else if (hasPeel) {
      if (adcLate) {
        pillar = "Hiperescalado Defensivo";
        tier = "S";
        philosophy = `Seguro de vida de late game. Blindaje absoluto para ${adc.name} potenciando su velocidad, escudos y curaciones.`;
        execution = `Fase de líneas: Jugar de forma conservadora. ${sup.name} guarda habilidades clave para mitigar iniciaciones enemigas (peel reactivo). ${adc.name} solo asesta last-hits.`;
        winCondition = `Mantener al tirador con 0 muertes y farm perfecto hasta conseguir sus objetos clave y destruir teamfights 5v5.`;
        powerSpikes[2] = "3 Items (Hiperescalado desbloqueado)";
      } else {
        pillar = "Kiteo y Supervivencia Adaptativa";
        tier = "A";
        philosophy = `Sinergia de desgaste seguro. Enfocada en repeler asaltos y permitir que el tirador se reposicione continuamente.`;
        execution = `Mantener la línea en un estado neutro, castigando las entradas agresivas del oponente y conservando el maná para el juego medio.`;
        winCondition = `Resistir la presión del rival en fases tempranas y brillar en las escaramuzas de mid game por mejor posicionamiento.`;
      }
    } else {
      // Valor por defecto adaptativo
      philosophy = `Sinergia mixta para el carril inferior enfocada en el rango de ${adc.name} y la adaptabilidad de ${sup.name}.`;
      execution = `Mantener posicionamiento en V abierta, priorizar farm y visión perpendicular para evitar emboscadas del jungla.`;
      winCondition = `Neutralizar la línea en early game y conseguir ventajas mediante rotaciones y peleas de equipo estructuradas.`;
    }

    return {
      id: comboKey,
      name: `${adc.name} + ${sup.name}`,
      adcId: adc.id,
      supId: sup.id,
      adcDdragonKey: adc.ddragonKey,
      supDdragonKey: sup.ddragonKey,
      pillar,
      tier,
      philosophy,
      execution,
      winCondition,
      powerSpikes,
      tags: combinedTags,
    };
  }
}
