// filepath: bridge/index.ts
import { authenticate, connect, request } from "league-connect";
import { WebSocketServer, WebSocket } from "ws";
import { LCUSession, AdvancedDraftState, OutgoingDraftUpdatePayload, OutgoingRunesExportedPayload } from "./types";

// Puerto del servidor WebSocket local
const PORT = 3015;
const wss = new WebSocketServer({ port: PORT });
let webClient: WebSocket | null = null;

console.log(`[Bridge] Iniciando Servidor WebSocket local en ws://localhost:${PORT}`);

wss.on("connection", (ws: WebSocket) => {
  console.log("[Bridge] Web App conectada correctamente.");
  webClient = ws;

  // Escuchar mensajes de la Web App
  ws.on("message", async (message: string) => {
    try {
      const payload = JSON.parse(message) as { type: string; data: { championName: string; buildTitle: string } };
      if (payload.type === "EXPORT_RUNES") {
        const { championName, buildTitle } = payload.data;
        console.log(`[Bridge] Solicitud de exportación de runas para: ${championName} (${buildTitle})`);

        try {
          // Intentar obtener credenciales de LCU
          const credentials = await authenticate();
          
          // Obtener la página actual
          const currentPageRes = await request({
            method: "GET",
            url: "/lol-perks/v1/currentpage"
          }, credentials);

          if (currentPageRes.status === 200) {
            interface PerkPage {
              id: number;
              name: string;
              [key: string]: unknown;
            }
            const currentPage = await currentPageRes.json() as PerkPage;
            const pageId = currentPage.id;

            // Renombrar la página de runas activa en el cliente de LoL
            const cleanTitle = (buildTitle || "").split("—")[0].trim();
            const newName = `DraftDuo: ${championName} (${cleanTitle})`.substring(0, 30); // Limite de 30 chars de Riot

            await request({
              method: "PUT",
              url: `/lol-perks/v1/pages/${pageId}`,
              body: {
                ...currentPage,
                name: newName
              }
            }, credentials);

            console.log(`[Bridge] Página de runas renombrada con éxito a: "${newName}"`);
            const successPayload: OutgoingRunesExportedPayload = {
              type: "RUNES_EXPORTED",
              data: { success: true, championName, buildTitle: newName, simulated: false }
            };
            ws.send(JSON.stringify(successPayload));
          } else {
            throw new Error("No se pudo obtener la página de runas activa.");
          }
        } catch (lcuError) {
          const errMsg = lcuError instanceof Error ? lcuError.message : String(lcuError);
          console.log(`[Bridge] Error al conectar con LCU REST API. Ejecutando exportación simulada. Detalle:`, errMsg);
          // Responder con simulación exitosa si el cliente no está encendido
          const simulatedPayload: OutgoingRunesExportedPayload = {
            type: "RUNES_EXPORTED",
            data: { success: true, championName, buildTitle, simulated: true }
          };
          ws.send(JSON.stringify(simulatedPayload));
        }
      }
    } catch (err) {
      console.error("[Bridge] Error al procesar mensaje de Web App:", err);
    }
  });

  ws.on("close", () => {
    console.log("[Bridge] Web App desconectada.");
    if (webClient === ws) {
      webClient = null;
    }
  });
});

// ALPHA-DRAFT FIX: Mapeo dinámico e inteligente de campeones con respaldo estático completo
const CHAMPION_MAP_FALLBACK: Record<number, string> = {
  22: "ashe",
  110: "varus",
  202: "jhin",
  18: "tristana",
  222: "jinx",
  236: "lucian",
  51: "caitlyn",
  81: "ezreal",
  43: "karma",
  111: "nautilus",
  555: "pyke",
  183: "renata",
  117: "lulu",
  267: "nami",
  201: "braum",
  412: "thresh",
  25: "morgana",
  89: "leona",
  526: "rell",
  145: "kaisa",
  67: "vayne",
  96: "kogmaw",
  9017: "smolder",
  99: "lux",
  235: "senna",
  497: "rakan",
  266: "aatrox",
  54: "malphite",
  24: "jax",
  114: "fiora",
  64: "leesin",
  203: "viego",
  113: "sejuani",
  107: "rengar",
  103: "ahri",
  157: "yasuo",
  134: "syndra",
  38: "kassadin",
  121: "ezreal",
};

// ALPHA-DRAFT FIX: Construir Map en memoria
const championMap = new Map<number, string>();
for (const [key, value] of Object.entries(CHAMPION_MAP_FALLBACK)) {
  championMap.set(parseInt(key), value);
}

// ALPHA-DRAFT FIX: Fetch dinámico al iniciar el servidor para actualizar championMap
async function initializeDynamicChampionMap(): Promise<void> {
  try {
    console.log("[Bridge] ALPHA-DRAFT FIX: Iniciando sincronización con Riot Data Dragon...");
    const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    if (!versionRes.ok) throw new Error(`HTTP error fetching versions: ${versionRes.status}`);
    const versions = await versionRes.json() as string[];
    const version = versions[0];
    console.log(`[Bridge] ALPHA-DRAFT FIX: Versión detectada: ${version}`);

    const championsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    if (!championsRes.ok) throw new Error(`HTTP error fetching champions: ${championsRes.status}`);
    const championsJson = await championsRes.json() as { data: Record<string, { key: string; id: string }> };

    const championsData = Object.values(championsJson.data);
    championsData.forEach((champ) => {
      const numericKey = parseInt(champ.key);
      const stringId = champ.id.toLowerCase();
      if (!isNaN(numericKey)) {
        championMap.set(numericKey, stringId);
      }
    });
    console.log(`[Bridge] ALPHA-DRAFT FIX: Sincronización exitosa. ${championMap.size} campeones cargados dinámicamente.`);
  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.error("[Bridge] ALPHA-DRAFT FIX: Error al conectar con Riot Data Dragon. Se utilizará el mapa de respaldo estático. Detalle:", errMsg);
  }
}

initializeDynamicChampionMap();

// ALPHA-DRAFT FIX: Función mapChampId lee del Map dinámico en memoria
function mapChampId(id: number): string | null {
  if (!id || id <= 0) return null;
  const mapped = championMap.get(id);
  if (mapped) return mapped;
  return `unknown-${id}`;
}

// Robust parsing of LCU Champ Select session
function parseLCUSession(session: LCUSession): OutgoingDraftUpdatePayload["data"] {
  const localPlayerCellId = session.localPlayerCellId;
  const isBlueSide = localPlayerCellId < 5;
  const side = isBlueSide ? "blue" : "red";

  // Inicializar slots
  const bluePicks: (string | null)[] = Array(5).fill(null);
  const redPicks: (string | null)[] = Array(5).fill(null);
  const blueBans: (string | null)[] = Array(5).fill(null);
  const redBans: (string | null)[] = Array(5).fill(null);

  // 1. Mapear picks desde session.myTeam y session.theirTeam
  const myTeam = session.myTeam || [];
  const theirTeam = session.theirTeam || [];

  myTeam.forEach((player) => {
    const idx = player.cellId < 5 ? player.cellId : player.cellId - 5;
    const champ = mapChampId(player.championId);
    if (player.cellId < 5) {
      bluePicks[idx] = champ;
    } else {
      redPicks[idx] = champ;
    }
  });

  theirTeam.forEach((player) => {
    const idx = player.cellId < 5 ? player.cellId : player.cellId - 5;
    const champ = mapChampId(player.championId);
    if (player.cellId < 5) {
      bluePicks[idx] = champ;
    } else {
      redPicks[idx] = champ;
    }
  });

  // 2. Mapear bans del objeto bans secuencialmente
  const bansObj = session.bans || {};
  const myBansRaw = (bansObj.myTeamBans || []).map(id => mapChampId(id));
  const theirBansRaw = (bansObj.theirTeamBans || []).map(id => mapChampId(id));

  const rawBlueBans = isBlueSide ? myBansRaw : theirBansRaw;
  const rawRedBans = isBlueSide ? theirBansRaw : myBansRaw;

  for (let i = 0; i < 5; i++) {
    if (i < rawBlueBans.length) blueBans[i] = rawBlueBans[i];
    if (i < rawRedBans.length) redBans[i] = rawRedBans[i];
  }

  // 3. Procesar acciones para hovers en progreso y estado avanzado del draft
  let totalPicks = 0;
  let totalBans = 0;
  let enemyPicksCompleted = 0;
  let isOurTurn = false;
  let currentActionType: 'pick' | 'ban' | null = null;
  let remainingEnemyPicks = 0;

  const localTeamId = isBlueSide ? 100 : 200;
  const enemyTeamId = isBlueSide ? 200 : 100;

  if (session.actions && Array.isArray(session.actions)) {
    for (const phase of session.actions) {
      if (Array.isArray(phase)) {
        for (const action of phase) {
          const { type, completed, isInProgress, teamId, championId, actorCellId } = action;
          const mappedChamp = mapChampId(championId);
          const cellIdx = actorCellId < 5 ? actorCellId : actorCellId - 5;
          const isBlueAction = actorCellId < 5;

          if (completed) {
            if (type === 'pick') {
              totalPicks++;
              if (teamId === enemyTeamId) {
                enemyPicksCompleted++;
              }
              // Garantizar pick final locked-in
              if (isBlueAction) {
                bluePicks[cellIdx] = mappedChamp;
              } else {
                redPicks[cellIdx] = mappedChamp;
              }
            } else if (type === 'ban') {
              totalBans++;
            }
          }

          if (isInProgress) {
            isOurTurn = (teamId === localTeamId);
            currentActionType = type;

            // Mostrar el hover actual del pick o ban en progreso
            if (type === 'pick') {
              if (isBlueAction) {
                bluePicks[cellIdx] = mappedChamp;
              } else {
                redPicks[cellIdx] = mappedChamp;
              }
            } else if (type === 'ban') {
              const targetBans = isBlueAction ? blueBans : redBans;
              const openIdx = targetBans.indexOf(null);
              if (openIdx !== -1) {
                targetBans[openIdx] = mappedChamp;
              }
            }
          }

          if (!completed && !isInProgress && teamId === enemyTeamId && type === 'pick') {
            remainingEnemyPicks++;
          }
        }
      }
    }
  }

  let macroPhase: AdvancedDraftState["macroPhase"] = 'PLANNING';
  if (totalPicks === 0 && totalBans > 0) macroPhase = 'BAN_PHASE_1';
  else if (totalPicks > 0 && totalPicks <= 4) macroPhase = 'PICK_PHASE_1';
  else if (totalPicks > 4 && totalBans > 4) macroPhase = 'BAN_PHASE_2';
  else if (totalPicks > 4) macroPhase = 'PICK_PHASE_2';
  if (totalPicks === 10) macroPhase = 'FINISHED';

  const totalPicksMade = bluePicks.filter(Boolean).length + redPicks.filter(Boolean).length;
  const isComplete = macroPhase === 'FINISHED' || totalPicksMade >= 10;

  const draftState: AdvancedDraftState = {
    currentStepIndex: totalPicks + totalBans,
    macroPhase,
    isOurTurn,
    currentActionType,
    remainingEnemyPicks,
    isLastPick: (totalPicks === 9 && isOurTurn),
    isEnemyBotLaneClosed: (enemyPicksCompleted >= 2)
  };

  return {
    side,
    bluePicks,
    redPicks,
    blueBans,
    redBans,
    currentStepIndex: draftState.currentStepIndex,
    isComplete,
    draftState
  };
}

async function startLCUListener(): Promise<void> {
  console.log("[Bridge] Esperando a que se inicie el cliente de League of Legends...");
  
  try {
    // Intentar conectarse a las credenciales locales de LCU
    const credentials = await authenticate();
    console.log(`[Bridge] Conectado a LCU en el puerto: ${credentials.port}`);

    // Conectar vía WebSockets al cliente de LoL para escuchar eventos en vivo
    const lcuWs = await connect(credentials);

    console.log("[Bridge] Suscribiendo a eventos de Selección de Campeones (Champ Select)...");

    // Suscribirse a la sesión de selección de campeones
    lcuWs.subscribe("/lol-champ-select/v1/session", (data: LCUSession | null) => {
      if (!data) return;

      try {
        console.log(`[Bridge] Evento de draft recibido de LCU.`);

        // Parsear la sesión LCU robustamente
        const parsedData = parseLCUSession(data);

        // Preparar payload de transmisión
        const payload: OutgoingDraftUpdatePayload = {
          type: "DRAFT_UPDATE",
          data: parsedData
        };

        // Retransmitir a la Web App si está conectada
        if (webClient && webClient.readyState === 1) {
          console.log(`[Bridge] Enviando actualización a Web App (Fase: ${parsedData.draftState.macroPhase}, Turno: ${parsedData.draftState.isOurTurn ? "Nuestro" : "Enemigo"}).`);
          webClient.send(JSON.stringify(payload));
        }

      } catch (err) {
        console.error("[Bridge] Error al procesar el JSON de LCU:", err);
      }
    });

    lcuWs.on("close", () => {
      console.log("[Bridge] Conexión cerrada con LCU. Reintentando...");
      setTimeout(startLCUListener, 5000);
    });

  } catch (error) {
    const errMsg = error instanceof Error ? error.message : String(error);
    console.log("[Bridge] Error de conexión con LoL Client. ¿Está abierto el juego? Detalle:", errMsg);
    setTimeout(startLCUListener, 6000);
  }
}

// Iniciar detector del cliente de League of Legends
startLCUListener();
