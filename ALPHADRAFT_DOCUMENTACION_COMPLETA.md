# AlphaDraft Pro - Documentación Técnica de Arquitectura y Motor Algorítmico

Este documento proporciona una especificación técnica de la plataforma **AlphaDraft Pro**, un sistema de análisis y recomendación de drafts en tiempo real para League of Legends, con especialización en el carril inferior (Bot Lane: ADC + Support).

---

## 1. Visión General del Sistema

### Propósito y Restricción Estratégica
**AlphaDraft Pro** está diseñado para asistir a jugadores de nivel competitivo y cuerpo técnico en la fase de selección de campeones (Draft), enfocándose exclusivamente en la optimización del carril inferior. El sistema opera bajo una estricta directriz de diseño estratégico:
*   **Pool de Tiradores Limitado y Versátil (ADC)**: Soporte nativo y optimización de un pool de 8 tiradores de confort para el jugador principal (Fer): Ashe, Varus, Jhin, Tristana, Jinx, Lucian, Caitlyn y Ezreal.
*   **Restricción de Soportes**: Especialización y priorización en soportes de tipo Tanque/Iniciación (como Nautilus, Thresh, Braum, Leona, Rell) y Magos/Controladores (como Karma, Renata Glasc, Morgana, Nami, Lulu), penalizando la selección libre e indiscriminada de Enchanters puros no optimizados.

### Stack Tecnológico
La plataforma está construida utilizando tecnologías modernas de alto rendimiento:
*   **Framework Principal**: Next.js 15 (App Router) sobre React 19 para la interfaz de usuario.
*   **Arquitectura de Componentes**: Server Components (RSC) por defecto para la carga inicial de datos estáticos y Client Components aislados en las hojas interactivas de la UI.
*   **Gestión de Estado**: Zustand para un almacenamiento reactivo global y eficiente, minimizando re-renders.
*   **Comunicación en Tiempo Real**: WebSockets nativos para la intercomunicación con el cliente oficial de League of Legends.
*   **Integración LCU**: Bridge en Node.js que interactúa con la API REST y de WebSockets del Cliente de League of Legends (LCU) mediante la biblioteca `league-connect`.
*   **APIs Externas**: Riot Data Dragon API para la sincronización, versionado y obtención de metadatos e imágenes de campeones en tiempo real.
*   **Estilo Visual**: Lenguaje de diseño estético *Hextech Neo-Brutalist*, con bordes gruesos, contrastes marcados y animaciones reactivas premium.

---

## 2. Arquitectura de Flujo de Datos (End-to-End)

El flujo de información se despliega desde las entrañas del cliente de League of Legends hasta la interfaz del usuario web de la siguiente manera:

1.  **Captura en el Cliente (LCU)**: Durante la fase de selección de campeones, el cliente de League of Legends emite eventos en su WebSocket local en el endpoint `/lol-champ-select/v1/session`.
2.  **Traducción y Puente (LCU Bridge)**: 
    *   Un proceso secundario en Node.js (`bridge/index.js`) se conecta de forma segura a la API del cliente usando las credenciales dinámicas detectadas por `league-connect`.
    *   Al recibir una actualización del draft, traduce los IDs numéricos de Riot (ej. `22`) a identificadores semánticos compatibles con el motor (ej. `"ashe"`) mediante un mapa estático (`CHAMPION_MAP`).
    *   Determina el color de la sala del jugador local (`blue` o `red`) y consolida los arrays de selecciones y bloqueos de ambos equipos.
3.  **Transmisión por WebSocket**: El bridge retransmite el payload JSON de actualización (`DRAFT_UPDATE`) al navegador del usuario a través de un servidor WebSocket local en el puerto `3015`.
4.  **Procesamiento de Estado (Zustand)**:
    *   El almacén Zustand (`src/store/draft-store.ts`) recibe la trama, actualiza las estructuras primitivas y ejecuta un callback de recálculo (`recalculateBrain`).
    *   El motor algorítmico `CompetitiveBrain` analiza el nuevo estado del draft.
5.  **Renderizado en UI**: React 19 recibe las actualizaciones reactivas del store Zustand y re-renderiza los componentes de recomendación, probabilidad de victoria, alertas del coach y hechizos de invocador recomendados.

```mermaid
graph TD
    subgraph Cliente de Juego (Riot LoL)
        LCU[Riot LCU Client WebSockets]
    end

    subgraph LCU Bridge (Node.js backend)
        LCU_WS[league-connect WebSocket Connection]
        CHAMP_MAP[CHAMPION_MAP Translator]
        Bridge_Server[WS Server ws://localhost:3015]
    end

    subgraph Web App (Next.js 15)
        Zustand_Store[Zustand Store src/store/draft-store.ts]
        Comp_Brain[CompetitiveBrain Engine]
        RDragon[Riot Data Dragon API]
        React_UI[React 19 UI Components]
    end

    LCU -- "Updates on /lol-champ-select/v1/session" --> LCU_WS
    LCU_WS --> CHAMP_MAP
    CHAMP_MAP -- "Translates numeric IDs to strings" --> Bridge_Server
    Bridge_Server -- "Broadcast DRAFT_UPDATE" --> Zustand_Store
    Zustand_Store -- "Triggers recalculateBrain()" --> Comp_Brain
    RDragon -- "Fetches latest JSON & assets" --> RDragon_Cache[Data Dragon Cache]
    RDragon_Cache --> Zustand_Store
    Comp_Brain -- "Runs Algorithmic Engine (Vg, CFR, Scoring)" --> Zustand_Store
    Zustand_Store -- "Updates state & re-renders UI" --> React_UI
    React_UI -- "Export Runes Action" --> Bridge_Server
    Bridge_Server -- "PUT /lol-perks/v1/pages" --> LCU
```

---

## 3. Motor Algorítmico y Matemático (CORE)

El motor principal está implementado en [draft-engine.ts](file:///d:/PROYECTOS/draft%20duo/src/lib/draft-engine.ts) dentro de la clase `CompetitiveBrain`. Su propósito es procesar los datos en cada turno del draft y emitir métricas heurísticas avanzadas de rendimiento competitivo.

### A. Fórmula de Vulnerabilidad a Ganks ($V_g$)
La vulnerabilidad a ganks del dúo de bot lane se calcula dinámicamente en tiempo real mediante la siguiente ecuación matemática implementada en el motor:

$$V_g = \frac{P_{\text{jungla}} \times E_{\text{empuje}}}{M_{\text{adc}} + C_{\text{support}} + \epsilon}$$

Donde:
*   $P_{\text{jungla}}$: Presión en juego temprano del jungla enemigo (escala de 0.0 a 10.0). Se define mediante un diccionario de campeones conocidos (`JUNGLER_PRESSURE`, ej. Lee Sin: `9.5`, Elise: `9.5`, Malphite: `4.0`, default: `5.0`).
*   $E_{\text{empuje}}$: Capacidad promedio de limpieza/empuje de oleadas del dúo (`getChampionWavePush`, de 0.0 a 10.0). Se promedian los valores individuales del ADC y el soporte.
*   $M_{\text{adc}}$: Capacidad de movilidad y herramientas de escape del tirador (`getAdcMobility`, de 0.0 a 10.0, ej. Ezreal: `9.0`, Kog'Maw: `1.5`).
*   $C_{\text{support}}$: Capacidad de CC defensivo y desenganche del soporte (`getSupportPeel`, de 0.0 a 10.0, ej. Janna: `9.5`, Brand: `1.5`).
*   $\epsilon$: Factor de estabilidad numérico constante igual a `0.1` para prevenir divisiones por cero.

El resultado final se restringe al intervalo $[0.0, 15.0]$ y se redondea a un decimal:

```typescript
// Fragmento de código de calculateGankVulnerability (draft-engine.ts)
const epsilon = 0.1;
const Vg = (junglerPressure * pushPower) / (adcMobility + supPeel + epsilon);
return Math.round(Math.min(15.0, Math.max(0.0, Vg)) * 10) / 10;
```

### B. Cálculo de CFR (Arrepentimiento Contrafáctico)
El valor de CFR (`calculateCfrRegret`) mide el riesgo potencial de sufrir un counter-pick si se selecciona un campeón en el paso de draft actual:

*   **Paso Terminal (Last Pick Red Side)**: Si el equipo es del lado rojo y se encuentra en su última selección de campeones, el arrepentimiento se reduce al mínimo absoluto (`0.05`) dado que no hay posibilidad de respuesta enemiga.
*   **Fase de Bot Lane Cerrada**: Si el dúo de bot lane enemigo ya ha sido completamente revelado (picks $\ge 2$), el riesgo de contra-iniciación a ciegas disminuye, fijando el CFR en `0.05`.
*   **Picks Blind y Counter-Exposed**:
    *   Si es un campeón blind-pick seguro (ej. `ezreal`, `ashe`), el arrepentimiento base se sitúa en `0.10`.
    *   Si el campeón es vulnerable a iniciaciones (ej. `caitlyn`, `xerath`, `jinx`, `kogmaw`), el arrepentimiento base sube a `0.35` debido a la exposición del pick.
    *   Otros casos por defecto inician con `0.22`.
*   **Efecto de la Fase Temporal**: A mayor cantidad de selecciones enemigas pendientes por revelar en el draft, el arrepentimiento aumenta: `remainingEnemyPicks * 0.03`.
*   **Contadores Directos Libres**: Si un campeón posee counters declarados en su base de datos, el CFR incrementa por cada counter enemigo que no esté seleccionado ni bloqueado por ningún bando: `openCounters * 0.04`.

### C. Sistema de Scoring Ponderado
El puntaje de recomendación total para cada campeón candidato se calcula mediante una suma ponderada multivariable:

$$\text{Puntaje Total} = (\text{comfort} \times 0.35) + (\text{counter} \times 0.25) + (\text{synergy} \times 0.20) + (\text{comp} \times 0.10) + (\text{meta} \times 0.10)$$

```typescript
// Fragmento de código del cálculo de recomendación (draft-engine.ts)
const totalScore = Math.round(
  scores.comfort * 0.35 +
  scores.counter * 0.25 +
  scores.synergy * 0.20 +
  scores.comp * 0.10 +
  scores.meta * 0.10
);
```

Las puntuaciones secundarias se obtienen bajo las siguientes reglas:
1.  **Comfort (35%)**: Evalúa el dominio del jugador sobre el campeón (`isOwnPool`). Un estado de `mastered` asigna 100 puntos, `learning` otorga 80 y `backup` otorga 60. Si es un rol de soporte aliado, se premian los tanques prioritarios con $+35$ puntos adicionales y los enchanters con $+15$.
2.  **Counter (25%)**: Mide el rendimiento frente a la composición enemiga. Si un rival directo tiene al candidato en su lista de amenazas, se reduce a `25`. Si el candidato es un contra-pick documentado de un oponente seleccionado, sube a `98`. Incorpora modificadores basados en arquetipos (los iniciadores de Dive obtienen `85` frente a campeones de Poke; los de Poke sufren con `35` contra Dive).
3.  **Synergy (20%)**: Revisa la compatibilidad con el resto de selecciones del equipo aliado. Si forma una sinergia perfecta listada en la base de datos de dúos (`duos.ts`), se otorga el valor máximo de `100`. Si es una sinergia competitiva estándar, se asigna `90`. Si comparten arquetipos tácticos (ej. ambos Poke), se asigna `75`.
4.  **Comp (10%)**: Evalúa la cohesión del estilo de juego general del equipo (identidades de Dive, Poke, Scaling, o Protect). Coincidir con el estilo grupal asigna `90` (si no, `65`). Se aplican penalizaciones severas si el equipo cuenta con más del 90% de daño de un solo tipo (físico/mágico).
5.  **Meta (10%)**: Basado en la tier list competitiva (`S+`: 100, `S`: 90, `A+`: 80, `A`: 70, default: 50).

### D. Validación de Restricciones
La plataforma ejerce restricciones estratégicas a través de la penalización de puntuaciones en lugar de bloqueos duros de interfaz:
*   **Filtro de Confort ADC**: Los ADCs que no forman parte del pool de confort establecido del jugador (`isOwnPool === false`) inician con una puntuación de confort base baja de `20` puntos, lo que desploma su idoneidad en las recomendaciones frente a los 6/8 ADCs del pool principal.
*   **Filtro de Supports**: Se penaliza de manera natural a los soportes de tipo Enchanter puro que no pertenezcan al pool optimizado del jugador a través de la priorización algorítmica: los soportes de tipo Tanque/Iniciación reciben una bonificación directa de confort de $+35$ puntos, mientras que los Enchanters tradicionales solo reciben $+15$ puntos, forzando la visualización preferente de campeones de primera línea e iniciadores en el panel de recomendaciones.

---

## 4. Gestión de Datos y Estado

### Data Layer (`src/data/`)
La capa de datos se compone de módulos declarativos que inyectan el conocimiento estratégico en el motor:
*   `champions.ts`: Declara la estructura [ownChampions](file:///d:/PROYECTOS/draft%20duo/src/data/champions.ts#L5), definiendo metadatos como el rol principal, tags competitivos, filosofía de juego (ej. *Presión Perpendicular + Información*), condiciones específicas de selección (`pickWhen`), sinergias, counters y estado de aprendizaje actual (`learningStatus`).
*   `duos.ts`: Contiene la lista consolidada de dúos viables [duos](file:///d:/PROYECTOS/draft%20duo/src/data/duos.ts#L5). Cada par define un objeto rico con las claves tácticas de ejecución, picos de poder (`powerSpikes`), patrón de posicionamiento en el carril (ej. *Triangulación Defensiva*, *Diagonal en V abierta*) y la secuencia ideal de encadenamiento de control de masas (`ccChainSequence`, ej. `Nautilus Q -> AA -> Tristana E + W -> Nautilus E -> Nautilus R`).

### State Management (`src/store/draft-store.ts`)
El estado de la sesión de draft en vivo se gestiona con un store Zustand global [useDraftStore](file:///d:/PROYECTOS/draft%20duo/src/store/draft-store.ts#L69).

#### Mitigación de Re-renders en actualizaciones por WebSocket
El LCU Bridge puede enviar ráfagas rápidas de mensajes en momentos críticos del draft. Para evitar que la Web App sufra degradación de rendimiento y re-renders masivos e innecesarios en componentes secundarios:
1.  **Actualizaciones Agrupadas (Batching)**: La acción `onmessage` del WebSocket actualiza de forma simultánea múltiples campos primitivos en un único bloque de estado de Zustand (`set`).
2.  **Aislamiento de la Lógica Algorítmica**: En lugar de recalcular de manera fragmentada o en base a efectos colaterales de React (como `useEffect`), la actualización del estado dispara inmediatamente la función síncrona `recalculateBrain()`.
3.  **Suscripciones Selectivas**: Los componentes de la interfaz de usuario se conectan al store Zustand consumiendo selectores específicos (ej. `const isBridgeConnected = useDraftStore(s => s.isBridgeConnected)`). Al evitar la desestructuración general del store, React 19 solo desencadena la fase de renderizado cuando las propiedades estrictamente consumidas por el componente cambian de valor, previniendo cascadas de actualización a lo largo del árbol visual.

---

## 5. Integración con LCU y APIs Externas

### LCU Bridge
El LCU Bridge es un servidor WebSocket independiente en Node.js que realiza la conexión bidireccional entre el cliente del juego y la Web App:
*   **ws://localhost:3015**: Mantiene una conexión activa a la que se suscribe la Web App. A través de esta conexión, el Bridge transmite la actualización del draft en tiempo real.
*   **Exportación de Runas**: El bridge implementa un canal de mutación. Al recibir la directiva `EXPORT_RUNES`, el bridge intenta conectarse a la API HTTP del LCU, obtiene la página de runas activa en el cliente del juego mediante una petición `GET` a `/lol-perks/v1/currentpage` y la sobrescribe de forma inmediata ejecutando una llamada `PUT` al endpoint `/lol-perks/v1/pages/${pageId}`, renombrándola con el formato `"DraftDuo: Champion (Build)"`. Si el cliente del juego no se encuentra en ejecución, el bridge simula el éxito de forma segura para evitar excepciones críticas en el frontend.

### Data Loader y Riot Data Dragon
El sistema utiliza [data-loader.ts](file:///d:/PROYECTOS/draft%20duo/src/lib/data-loader.ts) y [ddragon.ts](file:///d:/PROYECTOS/draft%20duo/src/lib/ddragon.ts) para la hidratación y normalización de la base de datos de campeones:
1.  **Versionado Dinámico**: Realiza una petición inicial a la API de Riot para recuperar la versión más reciente del juego (`api/versions.json`). Almacena este dato en el `localStorage` del navegador con un tiempo de vida (TTL) de 24 horas para evitar peticiones repetidas.
2.  **Consumo de Campeones**: Descarga el archivo JSON completo de campeones correspondiente a la versión (`/cdn/{version}/data/en_US/champion.json`).
3.  **Estrategia de Tolerancia a Fallos (Fallback)**: Si la conexión a los servidores de Riot falla o la API responde con un error, el cargador de datos captura la excepción y recurre inmediatamente a la lista estática local `staticFallbackChampions` para garantizar que la plataforma permanezca 100% operativa sin conexión a internet.
4.  **Normalización de Datos**: Fusiona la información de Data Dragon con la base de datos estratégica local (`ownChampions`). Para aquellos campeones que no están definidos en el pool de confort del jugador, infiere dinámicamente sus roles primarios y secundarios ejecutando una heurística de tags oficiales (ej. clasifica al campeón como `ADC` si posee la etiqueta `"Marksman"`).

---

## 6. Puntos de Atención para Auditoría (Hallazgos de la IA)

Durante el análisis exhaustivo del código base actual, se han identificado las siguientes áreas críticas de mejora y desviaciones técnicas:

### 1. Estimación Imprecisa del Paso del Draft (`currentStepIndex`)
En el archivo [bridge/index.js (L179-182)](file:///d:/PROYECTOS/draft%20duo/bridge/index.js#L179-L182), el índice del paso actual se calcula sumando el número de campeones elegidos: `currentStepIndex = Math.min(9, totalPicksMade)`.
*   **Problema**: Esta lógica no considera la fase de baneos inicial ni los turnos intermedios. En una partida real de League of Legends, los baneos ocurren antes y entre las selecciones de campeones. Calcular el paso actual únicamente en base a los campeones pickeados generará desalineaciones importantes en el valor de `currentStepIndex`, lo que a su vez afectará la precisión de las recomendaciones tácticas del motor algorítmico (como el cálculo del turn-key del CFR).

### 2. Riesgo de Mapeo Incompleto de Campeones (`CHAMPION_MAP`)
El bridge realiza la traducción de campeones basándose en una constante dura llamada `CHAMPION_MAP` en [bridge/index.js (L82-121)](file:///d:/PROYECTOS/draft%20duo/bridge/index.js#L82-L121).
*   **Problema**: El mapeo es estático. Si Riot Games lanza un nuevo campeón, o si un jugador elige un campeón que no está en la lista inicial (ej. un personaje poco común en el carril inferior), el bridge enviará el valor `"unmapped-{id}"` a la aplicación. La Web App no podrá encontrar este campeón en el store ni procesar sus tags, provocando errores silenciosos o excepciones lógicas en el cálculo de sinergias y composiciones.
*   **Recomendación**: El bridge debería mapear los IDs dinámicamente consultando el listado completo de campeones descargado desde Data Dragon, relacionando la clave numérica `key` del campeón con su identificador de texto `id`.

### 3. Falta de Sincronización y Validación de Bloqueos (Bans)
El LCU Bridge no actualiza correctamente el índice de turnos para los bloqueos:
*   **Problema**: Al ignorar si el draft se encuentra en fase de bloqueos o selecciones, la interfaz de usuario de la Web App puede iniciar en un paso incoherente en comparación con el estado real del cliente de LoL, teniendo que sincronizarse únicamente cuando se completen todos los bloqueos e inicien las primeras selecciones físicas.

### 4. Hardcoding de Roles y Clases en Data Loader
En el cargador de datos [data-loader.ts (L8-87)](file:///d:/PROYECTOS/draft%20duo/src/lib/data-loader.ts#L8-L87), la clasificación de roles de campeones fuera del pool de confort se realiza analizando si sus nombres coinciden con arrays estáticos hardcodeados en el código (como `adcNames`, `supportNames`, `jungleNames`, etc.).
*   **Problema**: Esta solución no escala y requiere mantenimiento manual constante. Si un campeón cambia de rol habitual debido a un cambio de balance en el juego (ej. un mago que pasa a jugarse en la jungla o como soporte de forma definitiva), la plataforma continuará evaluando al campeón en su posición antigua, emitiendo cálculos erróneos sobre las composiciones y el balance de daño del draft.
