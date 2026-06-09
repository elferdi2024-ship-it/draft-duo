// filepath: src/lib/draft-engine.test.ts
import { describe, it, expect } from "vitest";
import { CompetitiveBrain } from "./draft-engine";
import { LiveDraftState, DraftPhaseStep } from "./types";
import { staticFallbackChampions } from "@/data/champions";

describe("CompetitiveBrain - Algorithmic Calculations", () => {
  const brain = new CompetitiveBrain(staticFallbackChampions);

  describe("calculateGankVulnerability (Vg)", () => {
    it("should return 0 when both adcId and supId are null", () => {
      const vg = brain.calculateGankVulnerability(null, null, []);
      expect(vg).toBe(0);
    });

    it("should compute higher vulnerability for high-pressure junglers", () => {
      // Ezreal + Yuumi vs Lee Sin (High Pressure) vs Ivern (Low Pressure)
      const vgLeeSin = brain.calculateGankVulnerability("ezreal", "yuumi", ["leesin"]);
      const vgIvern = brain.calculateGankVulnerability("ezreal", "yuumi", ["ivern"]);
      expect(vgLeeSin).toBeGreaterThan(vgIvern);
    });

    it("should compute higher vulnerability for immobile ADCs compared to mobile ones", () => {
      // Kog'Maw (immobile) vs Ezreal (mobile) with Nautilus support and Elise jungler
      const vgKog = brain.calculateGankVulnerability("kogmaw", "nautilus", ["elise"]);
      const vgEz = brain.calculateGankVulnerability("ezreal", "nautilus", ["elise"]);
      expect(vgKog).toBeGreaterThan(vgEz);
    });

    it("should compute lower vulnerability with strong peel supports", () => {
      // Jinx with Janna (9.5 peel) vs Jinx with Xerath (1.0 peel) and Lee Sin jungler
      const vgJanna = brain.calculateGankVulnerability("jinx", "janna", ["leesin"]);
      const vgXerath = brain.calculateGankVulnerability("jinx", "xerath", ["leesin"]);
      expect(vgJanna).toBeLessThan(vgXerath);
    });

    it("should calculate Vg > 10.0 for Jinx + Brand/Xerath vs high pressure jungler", () => {
      // Jinx has 2.0 mobility, Xerath has 1.0 peel. Numerator is high vs Lee Sin.
      const vg = brain.calculateGankVulnerability("jinx", "xerath", ["leesin"]);
      expect(vg).toBeGreaterThan(10.0);
    });
  });

  describe("calculateCfrRegret", () => {
    const defaultState: LiveDraftState = {
      side: "blue",
      currentStepIndex: 4,
      blueBans: [null, null, null, null, null],
      redBans: [null, null, null, null, null],
      bluePicks: [null, null, null, null, null],
      redPicks: [null, null, null, null, null],
      myPickSlots: [3, 4],
      history: [],
      isComplete: false,
    };

    const activeStep: DraftPhaseStep = {
      team: "blue",
      type: "pick",
      index: 1,
      label: "Pick Azul 2",
    };

    it("should collapse to 0.05 when enemy bot lane is closed", () => {
      const draftState = {
        currentStepIndex: 4,
        macroPhase: "PICK_PHASE_1",
        isOurTurn: true,
        currentActionType: "pick" as const,
        remainingEnemyPicks: 3,
        isLastPick: false,
        isEnemyBotLaneClosed: true,
      };

      const regret = brain.calculateCfrRegret("jinx", defaultState, activeStep, draftState);
      expect(regret).toBe(0.05);
    });

    it("should collapse to 0.05 if it is the last pick", () => {
      const draftState = {
        currentStepIndex: 9,
        macroPhase: "PICK_PHASE_2",
        isOurTurn: true,
        currentActionType: "pick" as const,
        remainingEnemyPicks: 0,
        isLastPick: true,
        isEnemyBotLaneClosed: false,
      };

      const regret = brain.calculateCfrRegret("jinx", defaultState, activeStep, draftState);
      expect(regret).toBe(0.05);
    });

    it("should collapse to 0.05 if enemy botlane already has 2 picks in active state", () => {
      const stateWithEnemyPicks: LiveDraftState = {
        ...defaultState,
        side: "blue",
        redPicks: ["ashe", "karma", null, null, null],
      };

      const regret = brain.calculateCfrRegret("jinx", stateWithEnemyPicks, activeStep);
      expect(regret).toBe(0.05);
    });

    it("should assign lower regret to safe blind picks compared to counter-exposed picks", () => {
      const state: LiveDraftState = {
        ...defaultState,
        side: "blue",
        redPicks: [null, null, null, null, null],
      };

      const regretEzreal = brain.calculateCfrRegret("ezreal", state, activeStep);
      const regretCaitlyn = brain.calculateCfrRegret("caitlyn", state, activeStep);
      
      expect(regretEzreal).toBeLessThan(regretCaitlyn);
    });
  });

  describe("Strategic Bot Lane Philosophy & Comfort Scoring", () => {
    const defaultState: LiveDraftState = {
      side: "blue",
      currentStepIndex: 0,
      blueBans: [null, null, null, null, null],
      redBans: [null, null, null, null, null],
      bluePicks: [null, null, null, null, null],
      redPicks: [null, null, null, null, null],
      myPickSlots: [0, 3],
      history: [],
      isComplete: false,
    };

    const activeStep: DraftPhaseStep = {
      team: "blue",
      type: "pick",
      index: 0,
      label: "Pick Azul 1",
    };

    it("should severely penalize (-80) an ADC outside the comfort pool", () => {
      // Kog'Maw is an ADC and has isOwnPool === false/undefined in fallback list
      const kogmaw = staticFallbackChampions.find(c => c.id === "kogmaw")!;
      const score = brain.scoreChampion(kogmaw, defaultState, activeStep);
      
      // Base comfort is 20. Penalization of -80 makes it -60.
      expect(score.comfort).toBeLessThan(20);
      expect(score.comfort).toBe(-60);
    });

    it("should grant +35 comfort to a Tank Support (Leona) when picking for allies", () => {
      // Leona is not in comfort pool (base comfort 20) but is a tank support
      const leona = staticFallbackChampions.find(c => c.id === "leona")!;
      const score = brain.scoreChampion(leona, defaultState, activeStep);
      
      // Base 20 + 35 = 55 comfort score
      expect(score.comfort).toBeGreaterThanOrEqual(55);
    });
  });

  describe("Sprint 4 - Funciones Avanzadas", () => {
    it("calculateWinProbability debe retornar 50 si los arrays están vacíos", () => {
      expect(brain.calculateWinProbability([], [])).toBe(50);
    });

    it("calculateWinProbability debe retornar un valor entre 5 y 95", () => {
      const prob = brain.calculateWinProbability(["ashe", "nautilus"], ["jinx", "leona"]);
      expect(prob).toBeGreaterThanOrEqual(5);
      expect(prob).toBeLessThanOrEqual(95);
    });

    it("simulateEnemyResponse debe filtrar campeones baneados o pickeados", () => {
      const state: LiveDraftState = {
        side: "blue",
        currentStepIndex: 2,
        bluePicks: ["ashe"],
        redPicks: ["jinx"],
        blueBans: ["draven"], // Draven está baneado
        redBans: [],
        myPickSlots: [0, 1],
        history: [],
        isComplete: false
      };
      const result = brain.simulateEnemyResponse("ashe", state);
      // Draven matches 'draven' id
      const probableLower = result.probableResponses.map(r => r.toLowerCase());
      expect(probableLower).not.toContain("draven");
    });
  });

  describe("Sprint 5 - Funciones de Élite (5v5 & Predicción)", () => {
    it("calculateLaneVulnerability debe calcular correctamente la vulnerabilidad de cada carril", () => {
      const state: LiveDraftState = {
        side: "blue",
        currentStepIndex: 4,
        bluePicks: ["ashe", "nautilus", "ahri"],
        redPicks: ["jinx", "leona", "leesin"],
        blueBans: [],
        redBans: [],
        myPickSlots: [0, 1],
        history: [],
        isComplete: false
      };

      const botV = brain.calculateLaneVulnerability("bot", "ashe", ["leesin"], state);
      expect(botV).toBeGreaterThanOrEqual(0);
      expect(botV).toBeLessThanOrEqual(15);

      const topV = brain.calculateLaneVulnerability("top", "aatrox", ["leesin", "malphite"], state);
      expect(topV).toBeGreaterThanOrEqual(0);
      expect(topV).toBeLessThanOrEqual(15);

      const jungleV = brain.calculateLaneVulnerability("jungle", "leesin", ["leesin"], state);
      expect(jungleV).toBeGreaterThanOrEqual(0);
      expect(jungleV).toBeLessThanOrEqual(15);

      const midV = brain.calculateLaneVulnerability("mid", "ahri", ["leesin"], state);
      expect(midV).toBeGreaterThanOrEqual(0);
      expect(midV).toBeLessThanOrEqual(15);
    });

    it("predictJungleStart debe predecir la ruta inicial del jungla enemigo", () => {
      const prediction = brain.predictJungleStart(["ashe", "lux"], "leesin");
      expect(prediction.side).toBe("top");
      expect(prediction.confidence).toBe(85);

      const defaultPred = brain.predictJungleStart(["ezreal", "janna"], "sejuani");
      expect(defaultPred.side).toBe("bottom");
      expect(defaultPred.confidence).toBe(50);
    });

    it("simulateDeepResponse debe simular el Minimax a 2 turnos", () => {
      const state: LiveDraftState = {
        side: "blue",
        currentStepIndex: 1,
        bluePicks: ["ashe"],
        redPicks: [],
        blueBans: [],
        redBans: [],
        myPickSlots: [0, 1],
        history: [],
        isComplete: false
      };

      const result = brain.simulateDeepResponse("ashe", state);
      expect(result).toHaveProperty("enemyResponse");
      expect(result).toHaveProperty("ourCounterResponse");
      expect(result).toHaveProperty("winProbabilityAfter");
      expect(result.winProbabilityAfter).toBeGreaterThanOrEqual(15);
      expect(result.winProbabilityAfter).toBeLessThanOrEqual(95);
    });
  });
});
