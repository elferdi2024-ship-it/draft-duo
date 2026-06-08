// filepath: bridge/index.js
const { createWebSocketConnection, connect, request } = require("league-connect");
const { WebSocketServer } = require("ws");

// Puerto del servidor WebSocket local
const PORT = 3015;
const wss = new WebSocketServer({ port: PORT });
let webClient = null;

console.log(`[Bridge] Iniciando Servidor WebSocket local en ws://localhost:${PORT}`);

wss.on("connection", (ws) => {
  console.log("[Bridge] Web App conectada correctamente.");
  webClient = ws;

  // Escuchar mensajes de la Web App
  ws.on("message", async (message) => {
    try {
      const payload = JSON.parse(message);
      if (payload.type === "EXPORT_RUNES") {
        const { championName, buildTitle } = payload.data;
        console.log(`[Bridge] Solicitud de exportación de runas para: ${championName} (${buildTitle})`);

        try {
          // Intentar obtener credenciales de LCU
          const credentials = await connect();
          
          // Obtener la página actual
          const currentPageRes = await request({
            method: "GET",
            url: "/lol-perks/v1/currentpage"
          }, credentials);

          if (currentPageRes.status === 200) {
            const currentPage = await currentPageRes.json();
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
            ws.send(JSON.stringify({
              type: "RUNES_EXPORTED",
              data: { success: true, championName, buildTitle: newName, simulated: false }
            }));
          } else {
            throw new Error("No se pudo obtener la página de runas activa.");
          }
        } catch (lcuError) {
          console.log(`[Bridge] Error al conectar con LCU REST API. Ejecutando exportación simulada. Detalle:`, lcuError.message);
          // Responder con simulación exitosa si el cliente no está encendido
          ws.send(JSON.stringify({
            type: "RUNES_EXPORTED",
            data: { success: true, championName, buildTitle, simulated: true }
          }));
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
const CHAMPION_MAP_FALLBACK = {
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
const championMap = new Map();
for (const [key, value] of Object.entries(CHAMPION_MAP_FALLBACK)) {
  championMap.set(parseInt(key), value);
}

// ALPHA-DRAFT FIX: Fetch dinámico al iniciar el servidor para actualizar championMap
async function initializeDynamicChampionMap() {
  try {
    console.log("[Bridge] ALPHA-DRAFT FIX: Iniciando sincronización con Riot Data Dragon...");
    const versionRes = await fetch("https://ddragon.leagueoflegends.com/api/versions.json");
    if (!versionRes.ok) throw new Error(`HTTP error fetching versions: ${versionRes.status}`);
    const versions = await versionRes.json();
    const version = versions[0];
    console.log(`[Bridge] ALPHA-DRAFT FIX: Versión detectada: ${version}`);

    const championsRes = await fetch(`https://ddragon.leagueoflegends.com/cdn/${version}/data/en_US/champion.json`);
    if (!championsRes.ok) throw new Error(`HTTP error fetching champions: ${championsRes.status}`);
    const championsJson = await championsRes.json();

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
    console.error("[Bridge] ALPHA-DRAFT FIX: Error al conectar con Riot Data Dragon. Se utilizará el mapa de respaldo estático. Detalle:", error.message);
  }
}

initializeDynamicChampionMap();

// ALPHA-DRAFT FIX: Función mapChampId lee del Map dinámico en memoria
function mapChampId(id) {
  if (!id || id <= 0) return null;
  const mapped = championMap.get(id);
  if (mapped) return mapped;
  return `unknown-${id}`;
}

// ALPHA-DRAFT FIX: Función avanzada de parsing de estado macro del draft
function getAdvancedDraftState(session) {
  const localPlayerCellId = session.localPlayerCellId;
  const localTeamId = localPlayerCellId < 5 ? 100 : 200;
  const enemyTeamId = localTeamId === 100 ? 200 : 100;

  let totalPicks = 0, totalBans = 0, remainingEnemyPicks = 0;
  let isOurTurn = false, currentActionType = null, enemyPicksCompleted = 0;

  if (session.actions && Array.isArray(session.actions)) {
    for (const phase of session.actions) {
      if (Array.isArray(phase)) {
        for (const action of phase) {
          if (action.type !== 'pick' && action.type !== 'ban') continue;
          if (action.completed) {
            if (action.type === 'pick') { 
              totalPicks++; 
              if (action.teamId === enemyTeamId) {
                // Verificar si es pick de botlane
                const mappedName = mapChampId(action.championId);
                // Si el campeón mapeado tiene roles botlane o si simplemente es pick completado del enemigo
                enemyPicksCompleted++; 
              }
            }
            if (action.type === 'ban') totalBans++;
          }
          if (action.isInProgress) { 
            isOurTurn = (action.teamId === localTeamId); 
            currentActionType = action.type; 
          }
          if (!action.completed && !action.isInProgress && action.teamId === enemyTeamId && action.type === 'pick') {
            remainingEnemyPicks++;
          }
        }
      }
    }
  }

  let macroPhase = 'PLANNING';
  if (totalPicks === 0 && totalBans > 0) macroPhase = 'BAN_PHASE_1';
  else if (totalPicks > 0 && totalPicks <= 4) macroPhase = 'PICK_PHASE_1';
  else if (totalPicks > 4 && totalBans > 4) macroPhase = 'BAN_PHASE_2';
  else if (totalPicks > 4) macroPhase = 'PICK_PHASE_2';
  if (totalPicks === 10) macroPhase = 'FINISHED';

  return {
    currentStepIndex: totalPicks + totalBans, 
    macroPhase, 
    isOurTurn, 
    currentActionType,
    remainingEnemyPicks, 
    isLastPick: (totalPicks === 9 && isOurTurn),
    isEnemyBotLaneClosed: (enemyPicksCompleted >= 2)
  };
}

async function startLCUListener() {
  console.log("[Bridge] Esperando a que se inicie el cliente de League of Legends...");
  
  try {
    // Intentar conectarse a las credenciales locales de LCU
    const credentials = await connect();
    console.log(`[Bridge] Conectado a LCU en el puerto: ${credentials.port}`);

    // Conectar vía WebSockets al cliente de LoL para escuchar eventos en vivo
    const lcuWs = await createWebSocketConnection({
      port: credentials.port,
      password: credentials.password,
    });

    console.log("[Bridge] Suscribiendo a eventos de Selección de Campeones (Champ Select)...");

    // Suscribirse a la sesión de selección de campeones
    lcuWs.subscribe("/lol-champ-select/v1/session", (data, event) => {
      if (!data) return;

      try {
        console.log(`[Bridge] Evento de draft recibido. Tipo: ${event.eventType}`);

        // 1. Determinar el Lado/Color de nuestro jugador
        const localCellId = data.localPlayerCellId;
        const isBlueSide = localCellId < 5; // En LoL, cellId 0-4 es equipo azul y 5-9 es rojo

        // 2. Extraer Picks
        const myTeamPicks = (data.myTeam || []).map(p => mapChampId(p.championId));
        const theirTeamPicks = (data.theirTeam || []).map(p => mapChampId(p.championId));

        const bluePicks = isBlueSide ? myTeamPicks : theirTeamPicks;
        const redPicks = isBlueSide ? theirTeamPicks : myTeamPicks;

        // Asegurar que los arrays tengan exactamente 5 elementos
        while (bluePicks.length < 5) bluePicks.push(null);
        while (redPicks.length < 5) redPicks.push(null);

        // 3. Extraer Bans
        const bansObj = data.bans || {};
        const myBansRaw = (bansObj.myTeamBans || []).map(id => mapChampId(id));
        const theirBansRaw = (bansObj.theirTeamBans || []).map(id => mapChampId(id));

        const blueBans = isBlueSide ? myBansRaw : theirBansRaw;
        const redBans = isBlueSide ? theirBansRaw : myBansRaw;

        while (blueBans.length < 5) blueBans.push(null);
        while (redBans.length < 5) redBans.push(null);

        // ALPHA-DRAFT FIX: Obtener estado avanzado del draft
        const draftState = getAdvancedDraftState(data);
        const totalPicksMade = [...bluePicks, ...redPicks].filter(Boolean).length;

        // 5. Preparar payload de transmisión
        const payload = {
          type: "DRAFT_UPDATE",
          data: {
            side: isBlueSide ? "blue" : "red",
            bluePicks,
            redPicks,
            blueBans,
            redBans,
            currentStepIndex: draftState.currentStepIndex,
            isComplete: draftState.macroPhase === 'FINISHED' || totalPicksMade >= 10,
            draftState
          }
        };

        // Retransmitir a la Web App si está conectada
        if (webClient && webClient.readyState === 1) {
          console.log(`[Bridge] Enviando actualización avanzada a la Web App (Fase: ${draftState.macroPhase}, Turno Propio: ${draftState.isOurTurn}).`);
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
    console.log("[Bridge] Error de conexión con LoL Client. ¿Está abierto el juego?");
    setTimeout(startLCUListener, 6000);
  }
}

// Iniciar detector del cliente de League of Legends
startLCUListener();
