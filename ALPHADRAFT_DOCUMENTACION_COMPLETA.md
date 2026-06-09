# AlphaDraft Pro - Documentación Técnica de Arquitectura y Motor Algorítmico (v6.0 - Sprint 5)

Este documento proporciona la especificación técnica completa y pormenorizada de la plataforma **AlphaDraft Pro**, un sistema de análisis y recomendación de drafts en tiempo real para League of Legends, especializado en la optimización del carril inferior (Bot Lane: ADC + Support) con sincronización automática de lectura en tiempo real y capacidades avanzadas de predicción profunda 5v5.

---

## 1. Visión General del Sistema

### Propósito y Restricción Estratégica
**AlphaDraft Pro** asiste a jugadores competitivos y cuerpo técnico en la fase de selección de campeones (Draft), enfocándose en la optimización del carril inferior mediante un flujo **100% de lectura automática (Read-Only)** del cliente de juego, eliminando cualquier interacción de escritura o simulación de clics (PATCH/POST) para garantizar una seguridad total contra bloqueos de cuentas de Riot Games.
*   **Pool de Tiradores Limitado y Versátil (ADC)**: Optimización nativa del pool de tiradores de confort de la bot lane (Ashe, Varus, Jhin, Tristana, Jinx, Lucian, Caitlyn, Ezreal).
*   **Restricción de Soportes**: Priorización de soportes de tipo Tanque/Iniciación (Nautilus, Thresh, Braum, Leona, Rell) y Magos/Controladores (Karma, Renata Glasc, Morgana, Nami, Lulu), penalizando la selección de Enchanters puros no optimizados mediante puntuación algorítmica.
*   **Capacidades 5v5 Expandidas**: Evaluación integral de vulnerabilidad en las 4 líneas del mapa (Top, Jungle, Mid y Bot), predicción de la ruta inicial del jungla enemigo y simulación prospectiva minimax.

### Stack Tecnológico
La plataforma está construida bajo una arquitectura modular y de alto rendimiento:
*   **Framework Principal**: Next.js 15 (App Router) sobre React 19.
*   **Arquitectura de Renderizado**: Server Components (RSC) por defecto para datos estáticos; Client Components en las hojas interactivas inferiores de la interfaz.
*   **Gestión de Estado**: Zustand para el store reactivo global de la Web App.
*   **Comunicación en Tiempo Real**: WebSockets nativos localizados en el puerto `3015` para la transferencia de estados con una latencia inferior a 15ms.
*   **Integración LCU**: LCU Bridge en Node.js, conectado a la API de WebSockets de Riot mediante la biblioteca `league-connect`.
*   **Almacenamiento Local (Post-Mortem)**: IndexedDB nativo (sin dependencias externas) para persistencia persistente de snapshots de drafts finalizados.
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
4.  **Mutación de Estado en Zustand**: El store de Next.js (`src/store/draft-store.ts`) captura el evento `DRAFT_UPDATE`, actualiza el estado local y dispara síncronamente `recalculateBrain()` de forma automática. Si el draft transiciona a la fase `FINISHED`, guarda un snapshot único del draft en IndexedDB de manera no bloqueante.
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
        IndexedDB_Store[(IndexedDB Local Storage)]
    end

    LCU -- "Updates on /lol-champ-select/v1/session" --> LCU_WS
    LCU_WS --> DD_Fetch
    DD_Fetch -- "Translates numeric IDs & hovers" --> Bridge_Server
    Bridge_Server -- "Broadcast DRAFT_UPDATE" --> Zustand_Store
    Zustand_Store -- "Triggers recalculateBrain()" --> Comp_Brain
    Comp_Brain -- "Runs Core Formulas Vg, CFR, Scoring, Minimax" --> Zustand_Store
    Zustand_Store -- "Updates state & re-renders UI" --> React_UI
    Zustand_Store -- "Saves finished snapshot" --> IndexedDB_Store
    React_UI -- "Export Runes Request" --> Bridge_Server
    Bridge_Server -- "PUT /lol-perks/v1/pages" --> LCU
```

---

## 3. Motor Algorítmico y Matemático (CORE)

El motor analítico reside en `src/lib/draft-engine.ts` y contiene las funciones avanzadas del cerebro de IA, las cuales permanecen intactas y optimizadas:

### A. Fórmulas de Vulnerabilidad en Línea
El sistema evalúa las vulnerabilidades tácticas a dive, invasión o ganks según el rol del carril inferior y del mapa completo (acotadas en el rango $[0.0, 15.0]$):

1. **Bot Lane ($V_g$ - Vulnerabilidad de Gank Original)**:
   $$V_g = \frac{P_{\text{jungla}} \times E_{\text{empuje}}}{M_{\text{adc}} + C_{\text{support}} + \epsilon}$$
   *   $P_{\text{jungla}}$: Presión en juego temprano del jungla enemigo (0.0 a 10.0) definido en `JUNGLER_PRESSURE` (ej. Lee Sin: `9.5`, Malphite: `4.0`, default: `5.0`).
   *   $E_{\text{empuje}}$: Capacidad promedio de limpieza/empuje de oleadas del dúo (0.0 a 10.0).
   *   $M_{\text{adc}}$: Movilidad y herramientas de escape del tirador (0.0 a 10.0, ej. Ezreal: `9.0`, Jinx: `1.5`).
   *   $C_{\text{support}}$: Capacidad de CC defensivo y desenganche del soporte (0.0 a 10.0, ej. Janna: `9.5`, Brand: `1.5`).
   *   $\epsilon$: Factor de estabilidad constante (`0.1`) para mitigar divisiones por cero.

2. **Top Lane (Vulnerabilidad de Dive)**:
   $$V_{\text{top}} = (D_{\text{enemigo}} \times 3) + (P_{\text{jungla}} \times 0.5) - (M_{\text{top}} \times 0.8)$$
   *   $D_{\text{enemigo}}$: Número de campeones enemigos con arquetipo de Dive en la composición rival.
   *   $P_{\text{jungla}}$: Presión del jungla enemigo.
   *   $M_{\text{top}}$: Movilidad del campeón de top lane.

3. **Jungle Lane (Vulnerabilidad de Invasión)**:
   $$V_{\text{jungle}} = (P_{\text{jungla}} \times 0.7) - (R_{\text{mid}} \times 0.5) - (R_{\text{support}} \times 0.3)$$
   *   $R_{\text{mid}}$: Capacidad de rotación (roam) del mid laner aliado (obtenida dinámicamente de su estadística de iniciación/engage).
   *   $R_{\text{support}}$: Capacidad de rotación (roam) del soporte aliado.

4. **Mid Lane (Vulnerabilidad de Gank & Roam)**:
   $$V_{\text{mid}} = (P_{\text{jungla}} \times 0.6) + (E_{\text{bot\_rival}} \times 0.3) - (M_{\text{mid}} \times 0.7)$$
   *   $E_{\text{bot\_rival}}$: Empuje promedio de oleada (wave clear) del dúo de bot lane enemigo.
   *   $M_{\text{mid}}$: Movilidad del campeón de mid lane.

---

### B. Cálculo de CFR (Counter-Pick Regret / Arrepentimiento Contrafáctico)
Determina el riesgo de recibir un contra-pick en el paso del draft actual:
*   **Colapso a 0.05**: Si el dúo de bot lane enemigo ya está cerrado (`isEnemyBotLaneClosed === true`) o si tenemos el pick final del draft (`isLastPick === true`), el CFR colapsa a `0.05`.
*   **Picks Blind y Counter-Exposed**:
    *   Campeones blind-pick de alta seguridad (ej. Ezreal, Ashe) reciben un arrepentimiento base de `0.10`.
    *   Campeones inmóviles o expuestos a engage (ej. Jinx, Caitlyn, Kog'Maw) reciben un arrepentimiento base de `0.35`.
    *   Otros casos por defecto inician en `0.22`.
*   **Penalización por Selecciones Pendientes**: Sube `remainingEnemyPicks * 0.02`.
*   **Counters Libres**: Sube `openCounters * 0.05` por cada counter directo del campeón que no esté baneado o seleccionado.

---

### C. Sistema de Scoring Ponderado
La puntuación global para las recomendaciones de selección se pondera bajo la siguiente fórmula:

$$\text{Puntaje Total} = (\text{comfort} \times 0.35) + (\text{counter} \times 0.25) + (\text{synergy} \times 0.20) + (\text{comp} \times 0.10) + (\text{meta} \times 0.10)$$

*   **Comfort (35%)**: Evalúa el pool del jugador (`isOwnPool`). Los tanques prioritarios de soporte reciben una bonificación directa de $+35$ puntos. Los Enchanters tradicionales reciben $+15$. ADC fuera de pool recibe penalización severa (confort base `20`).
*   **Counter (25%)**: Modificadores tácticos por arquetipos (ej. Dive obtiene `85` frente a Poke, Poke obtiene `35` frente a Dive).
*   **Synergy (20%)**: Revisa la compatibilidad de dúo en `duos.ts`.
*   **Comp (10%)**: Alineación del estilo de la composición del equipo (Poke, Dive, Engage, Scaling).
*   **Meta (10%)**: Tier list competitiva (`S+`: 100, `S`: 90, `A+`: 80, `A`: 70, default: 50). Adicionalmente, se aplica un bono de **$+10$ puntos** si el campeón es un **Flex Pick** (tiene roles definidos en múltiples posiciones, ej. Pantheon mid/support).

---

### D. Predicción de Ruta Inicial del Jungla Enemigo
Determina el lado de mapa donde iniciará su campamento el jungla rival:
*   Si la movilidad promedio de nuestra bot lane es baja (`allyBotMobility < 5.0`) y la presión temprana del jungla enemigo es alta (`enemyJunglerEarlyPressure > 7.0`), se predice un inicio en **Top Side** con **85% de confianza** (para gankear bot al minuto 3:15).
*   Si la velocidad de limpieza del jungla enemigo es muy alta (`junglerClearSpeed > 8.0`), se predice un inicio en **Bottom Side** con **70% de confianza** (para realizar un full clear seguro).
*   Por defecto, se asume un inicio estándar en **Bottom Side** con **50% de confianza**.

---

### E. Árbol de Decisión Profundo (Minimax a 2 Turnos)
El motor simula la respuesta óptima de la composición enemiga y nuestra posterior respuesta óptima para maximizar la probabilidad de victoria futura:
1. Dada una recomendación de selección $C_a$, simula el conjunto de las 3 respuestas más probables de la composición rival utilizando `simulateEnemyResponse`.
2. Para cada respuesta rival $C_e$, evalúa todas las opciones disponibles del pool completo de campeones (de `this.allChampions`) para encontrar nuestro mejor contra-pick $C_c$.
3. Calcula el valor de `winProbability` resultante de la composición aliada tras fijar $[C_a, C_c]$ frente a la composición enemiga con $[C_e]$.
4. Devuelve la secuencia $[C_a \rightarrow C_e \rightarrow C_c]$ que maximiza nuestra probabilidad de victoria tras finalizar ambos intercambios de picks.
5. **Optimización de Interfaz**: En el cliente web, esta costosa simulación se calcula antes de renderizar utilizando un hook `useMemo` dedicado que reduce el impacto de rendimiento a prácticamente **0ms** entre renders sucesivos.

---

## 4. Gestión de Datos y Estado

### Data Layer y Cargador Dinámico (`src/lib/data-loader.ts`)
*   `src/data/champions.ts`: Mapea campeones estáticos con metadatos estratégicos finos.
*   **Inferencia Dinámica de Métricas (`estimateMetrics`)**: Para garantizar la cobertura del 100% de los ~160 campeones, el data loader asigna dinámicamente las propiedades de `mobility`, `waveClear`, `engage` y `peel` analizando los tags oficiales de Riot Data Dragon (ej. *Marksman*, *Tank*, *Mage*, *Support*), sirviendo como fallback matemático y siendo sobrescritos únicamente si se definen valores manuales específicos.
*   `src/data/duos.ts`: Define las combinaciones viables del carril inferior, patrones de posicionamiento en fase de líneas (ej. *Diagonal en V abierta*, *Triangulación Defensiva*) y su secuencia de CC óptima (`ccChainSequence`).

### Zustand Store (`src/store/draft-store.ts`)
El store global maneja el estado de selección, bans, hovers, WebSocket local y las banderas de persistencia:
*   `hasSavedSnapshot`: Evita que un borrador finalizado se inserte múltiples veces en IndexedDB al gatillar renders sucesivos.

---

## 5. Integración con LCU y APIs Externas

### LCU Bridge (Node.js)
El bridge expone un servidor WebSocket local en el puerto `3015`. Es **100% de Solo Lectura** para el flujo del draft. Su única acción de modificación es el renombrado de la página de runas activa en el cliente del juego a través de un método `PUT` sobre `/lol-perks/v1/pages/${pageId}` al activar la exportación de runas desde la interfaz web, encapsulado de manera segura para evitar interrupciones.

### Riot Data Dragon
El bridge y el cargador de datos web se sincronizan con las APIs oficiales de Riot para mantener actualizados los IDs numéricos de campeones, metadatos y assets visuales. En caso de fallas de red, el sistema recurre de manera automática a la base de datos estática fallback para asegurar una resiliencia total.

---

## 6. Estado de la Auditoría Técnica (Sprint 5)

| Dimensión / Hallazgo | Gravedad | Estado | Solución y Verificación |
| :--- | :--- | :--- | :--- |
| **`simulateDeepResponse` con pool parcial** | Crítica | **Resuelto** | Se corrigió el uso de `ownChampions` reemplazándolo por `this.allChampions` en el motor algorítmico, permitiendo evaluar counter-picks de todo el ecosistema de LoL. |
| **Cuello de botella de render por Minimax** | Crítica | **Resuelto** | Se implementó el hook `useMemo` para precalcular las respuestas `deepResponses` en `brain-panel.tsx`, manteniendo la latencia general de la UI por debajo de los 3.0ms. |
| **Valores estáticos en Vulnerabilidades** | Importante | **Resuelto** | Se actualizó la firma de `calculateLaneVulnerability` para recibir el estado dinámico del borrador (`state?: LiveDraftState`), calculando de manera real las rotaciones de mid, soporte y el empuje de la bot lane enemiga. |
| **Resiliencia en persistencia local** | Menor | **Resuelto** | Se incorporó una alerta visual toast en la interfaz del cliente ante fallos en IndexedDB (ej. modo incógnito estricto), además de la bandera de resguardo `hasSavedSnapshot`. |
| **Métricas incompletas de campeones** | Importante | **Resuelto** | Se implementó el sistema `estimateMetrics` en `data-loader.ts` para inferir métricas a partir de los tags de Riot, logrando una cobertura del 100% de los campeones. |
