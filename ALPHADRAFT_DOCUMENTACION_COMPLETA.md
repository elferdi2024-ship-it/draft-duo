# AlphaDraft Pro - Documentación Técnica de Arquitectura y Motor Algorítmico (v5.0 - Live Auto-Sync)

Este documento proporciona la especificación técnica completa de la plataforma **AlphaDraft Pro**, un sistema de análisis y recomendación de drafts en tiempo real para League of Legends, especializado en la optimización del carril inferior (Bot Lane: ADC + Support) con sincronización automática de lectura en tiempo real.

---

## 1. Visión General del Sistema

### Propósito y Restricción Estratégica
**AlphaDraft Pro** asiste a jugadores competitivos y cuerpo técnico en la fase de selección de campeones (Draft), enfocándose en la optimización del carril inferior mediante un flujo **100% de lectura automática (Read-Only)** del cliente de juego, eliminando cualquier interacción de escritura o simulación de clics (PATCH/POST) para garantizar una seguridad total contra bloqueos de cuentas de Riot Games.
*   **Pool de Tiradores Limitado y Versátil (ADC)**: Optimización nativa del pool de tiradores de confort de la bot lane (Ashe, Varus, Jhin, Tristana, Jinx, Lucian, Caitlyn, Ezreal).
*   **Restricción de Soportes**: Priorización de soportes de tipo Tanque/Iniciación (Nautilus, Thresh, Braum, Leona, Rell) y Magos/Controladores (Karma, Renata Glasc, Morgana, Nami, Lulu), penalizando la selección de Enchanters puros no optimizados mediante puntuación algorítmica.

### Stack Tecnológico
La plataforma está construida bajo una arquitectura modular y de alto rendimiento:
*   **Framework Principal**: Next.js 15 (App Router) sobre React 19.
*   **Arquitectura de Renderizado**: Server Components (RSC) por defecto para datos estáticos; Client Components en las hojas interactivas inferiores de la interfaz.
*   **Gestión de Estado**: Zustand para el store reactivo global de la Web App.
*   **Comunicación en Tiempo Real**: WebSockets nativos localizados en el puerto `3015` para la transferencia de estados con una latencia inferior a 15ms.
*   **Integración LCU**: LCU Bridge en Node.js, conectado a la API de WebSockets de Riot mediante la biblioteca `league-connect`.
*   **APIs Externas**: Riot Data Dragon API para la sincronización dinámica de metadatos, versiones de parches e imágenes de campeones.
*   **Ajuste Visual**: Lenguaje estético *Hextech Neo-Brutalist* con un banner de sincronización de estado de LCU activo en tiempo real.

---

## 2. Arquitectura de Flujo de Datos (End-to-End)

El flujo de información se propaga automáticamente desde el cliente oficial de League of Legends (LCU) hasta la interfaz gráfica del navegador:

1.  **Captura en el Cliente (LCU)**: El cliente de League of Legends emite eventos en su WebSocket local al endpoint `/lol-champ-select/v1/session`.
2.  **Sincronización de Lectura (LCU Bridge)**: 
    *   El proceso local Node.js (`bridge/index.ts`) detecta las credenciales dinámicas de Riot a través de `league-connect` y se suscribe de forma segura a los eventos de selección de campeones.
    *   **Mapeo Crítico de IDs**: El bridge realiza un fetch dinámico a Riot Data Dragon al arrancar para mapear claves numéricas (ej. `103`) a IDs semánticos de campeones (ej. `"ahri"`). Si falla la API de Riot, utiliza el mapa de contingencia `CHAMPION_MAP_FALLBACK`.
    *   **Algoritmo de Parsing**: Procesa el estado crudo del cliente mediante la función `parseLCUSession(session)`, determinando el lado del jugador (Azul/Rojo), turnos de picks/bans activos y hovers activos en progreso en `session.actions`.
3.  **Transmisión por WebSocket**: El Bridge envía el payload tipado `OutgoingDraftUpdatePayload` a la Web App a través de un WebSocket Server local.
4.  **Mutación de Estado en Zustand**: El store de Next.js (`src/store/draft-store.ts`) captura el evento `DRAFT_UPDATE`, actualiza el estado local y dispara síncronamente `recalculateBrain()` de forma automática.
5.  **Renderizado en UI**: Los componentes de React 19, suscritos selectivamente mediante Zustand para mitigar re-renders innecesarios, actualizan la visualización del draft en <15ms.

```mermaid
graph TD
    subgraph Cliente de Juego (Riot LoL)
        LCU[Riot LCU Client WebSockets]
    end

    subgraph LCU Bridge (Node.js backend)
        LCU_WS[league-connect WebSocket Connection]
        DD_Fetch[Dynamic Data Dragon ID Translator]
        Bridge_Server[WS Server ws://localhost:3015]
    end

    subgraph Web App (Next.js 15)
        Zustand_Store[Zustand Store src/store/draft-store.ts]
        Comp_Brain[CompetitiveBrain Engine]
        React_UI[React 19 UI Components]
    end

    LCU -- "Updates on /lol-champ-select/v1/session" --> LCU_WS
    LCU_WS --> DD_Fetch
    DD_Fetch -- "Translates numeric IDs & hovers" --> Bridge_Server
    Bridge_Server -- "Broadcast DRAFT_UPDATE" --> Zustand_Store
    Zustand_Store -- "Triggers recalculateBrain()" --> Comp_Brain
    Comp_Brain -- "Runs Core Formulas Vg, CFR, Scoring" --> Zustand_Store
    Zustand_Store -- "Updates state & re-renders UI" --> React_UI
    React_UI -- "Export Runes Request" --> Bridge_Server
    Bridge_Server -- "PUT /lol-perks/v1/pages" --> LCU
```

---

## 3. Motor Algorítmico y Matemático (CORE)

El motor analítico reside en `src/lib/draft-engine.ts` y contiene las funciones avanzadas del cerebro de IA, las cuales permanecen intactas y optimizadas:

### A. Fórmula de Vulnerabilidad a Ganks ($V_g$)
El índice de vulnerabilidad a ganks de la bot lane se calcula en tiempo real con la siguiente ecuación restrictiva:

$$V_g = \frac{P_{\text{jungla}} \times E_{\text{empuje}}}{M_{\text{adc}} + C_{\text{support}} + \epsilon}$$

*   $P_{\text{jungla}}$: Presión en juego temprano del jungla enemigo (0.0 a 10.0) definido en `JUNGLER_PRESSURE` (ej. Lee Sin: `9.5`, Malphite: `4.0`, default: `5.0`).
*   $E_{\text{empuje}}$: Capacidad promedio de limpieza/empuje de oleadas del dúo (0.0 a 10.0).
*   $M_{\text{adc}}$: Movilidad y herramientas de escape del tirador (0.0 a 10.0, ej. Ezreal: `9.0`, Jinx: `1.5`).
*   $C_{\text{support}}$: Capacidad de CC defensivo y desenganche del soporte (0.0 a 10.0, ej. Janna: `9.5`, Brand: `1.5`).
*   $\epsilon$: Factor de estabilidad constante (`0.1`) para mitigar divisiones por cero.
*   **Acotación**: El resultado final se restringe estrictamente en el rango $[0.0, 15.0]$.

### B. Cálculo de CFR (Counter-Pick Regret / Arrepentimiento Contrafáctico)
Determina el riesgo de recibir un contra-pick en el paso del draft actual:
*   **Colapso a 0.05**: Si el dúo de bot lane enemigo ya está cerrado (`isEnemyBotLaneClosed === true`) o si tenemos el pick final del draft (`isLastPick === true`), el CFR colapsa a `0.05`.
*   **Picks Blind y Counter-Exposed**:
    *   Campeones blind-pick de alta seguridad (ej. Ezreal, Ashe) reciben un arrepentimiento base de `0.10`.
    *   Campeones inmóviles o expuestos a engage (ej. Jinx, Caitlyn, Kog'Maw) reciben un arrepentimiento base de `0.35`.
    *   Otros casos por defecto inician en `0.22`.
*   **Penalización por Selecciones Pendientes**: Sube `remainingEnemyPicks * 0.03`.
*   **Counters Libres**: Sube `openCounters * 0.04` por cada counter directo del campeón que no esté baneado o seleccionado.

### C. Sistema de Scoring Ponderado
La puntuación global para las recomendaciones de selección se pondera bajo la siguiente fórmula:

$$\text{Puntaje Total} = (\text{comfort} \times 0.35) + (\text{counter} \times 0.25) + (\text{synergy} \times 0.20) + (\text{comp} \times 0.10) + (\text{meta} \times 0.10)$$

*   **Comfort (35%)**: Evalúa el pool del jugador (`isOwnPool`). Los tanques prioritarios de soporte reciben una bonificación directa de $+35$ puntos. Los Enchanters tradicionales reciben $+15$. ADC fuera de pool recibe penalización severa (confort base `20`).
*   **Counter (25%)**: Modificadores tácticos por arquetipos (ej. Dive obtiene `85` frente a Poke, Poke obtiene `35` frente a Dive).
*   **Synergy (20%)**: Revisa la compatibilidad de dúo en `duos.ts`.
*   **Comp (10%)**: Alineación del estilo global del equipo (Poke, Dive, Engage, Scaling).
*   **Meta (10%)**: Tier list competitiva (`S+`: 100, `S`: 90, `A+`: 80, `A`: 70, default: 50).

---

## 4. Gestión de Datos y Estado

### Data Layer (`src/data/`)
*   `champions.ts`: Define `ownChampions`, mapeando metadatos estratégicos de roles, tags competitivos, filosofía táctica, condiciones de selección (`pickWhen`), sinergias y estado de aprendizaje (`learningStatus`).
*   `duos.ts`: Define las combinaciones viables del carril inferior junto a su patrón de posicionamiento en fase de líneas (ej. *Diagonal en V abierta*, *Triangulación Defensiva*) y su secuencia de CC óptima (`ccChainSequence`).

### Zustand Store (`src/store/draft-store.ts`)
El almacén centraliza el estado de picks, bans, lado seleccionado, indicador de bridge y el objeto `draftState`. Las actualizaciones del WebSocket se consolidan en llamadas de estado atómicas que desencadenan automáticamente la actualización del motor:
```typescript
socket.onmessage = (event: MessageEvent<string>) => {
  const payload = JSON.parse(event.data) as BridgeMessage;
  if (payload.type === "DRAFT_UPDATE") {
    const { side, bluePicks, redPicks, blueBans, redBans, currentStepIndex, isComplete, draftState } = payload.data;
    set({
      side,
      bluePicks,
      redPicks,
      blueBans,
      redBans,
      currentStepIndex,
      isComplete,
      draftState: draftState || null,
    });
    get().recalculateBrain();
  }
};
```

---

## 5. Integración con LCU y APIs Externas

### LCU Bridge (Node.js)
El bridge expone un servidor WebSocket local en el puerto `3015`. Es **100% de Solo Lectura** para el flujo del draft. Su única acción de modificación es el renombrado de la página de runas activa en el cliente del juego a través de un método `PUT` sobre `/lol-perks/v1/pages/${pageId}` al activar la exportación de runas desde la interfaz web, encapsulado de manera segura para evitar interrupciones.

### Riot Data Dragon
El bridge y el cargador de datos web se sincronizan con las APIs oficiales de Riot para mantener actualizados los IDs numéricos de campeones, metadatos y assets visuales. En caso de fallas de red, el sistema recurre de manera automática a la base de datos estática fallback para asegurar una resiliencia total.

---

## 6. Estado de la Auditoría Técnica (Hallazgos Resueltos en Sprint 3)

| Hallazgo Previo | Gravedad | Estado | Solución Aplicada |
| :--- | :--- | :--- | :--- |
| **1. Estimación Imprecisa del Turno (`currentStepIndex`)** | Alta | **Resuelto** | Se eliminó la estimación simplificada por conteo de picks. Ahora el bridge recorre las fases de `session.actions` de LCU para consolidar de forma matemática el paso del draft exacto (picks + bans completados). |
| **2. Riesgo de Mapeo Incompleto (`CHAMPION_MAP`)** | Alta | **Resuelto** | Se implementó la sincronización dinámica inicial con Riot Data Dragon en el arranque de LCU Bridge, cargando el diccionario dinámico de campeones. Se conserva `CHAMPION_MAP_FALLBACK` como contingencia. |
| **3. Falta de Validación de Bloqueos (Bans)** | Media | **Resuelto** | Se expandió `parseLCUSession(session)` para iterar los estados de bloqueo, procesando tanto bloqueos finalizados como los bloqueos y selecciones en progreso (hovers activos). |
| **4. Hardcoding de Roles en Data Loader** | Media | **Resuelto** | Se implementó un algoritmo dinámico en `data-loader.ts` que infiere los roles de campeones externos en base a las etiquetas y clasificaciones oficiales de Data Dragon. |
