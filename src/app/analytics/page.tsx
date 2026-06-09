// filepath: src/app/analytics/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getLatestVersion, getChampionIconUrl } from "@/lib/ddragon";
import { staticFallbackChampions } from "@/data/champions";
import { 
  getAllSnapshots, 
  deleteSnapshot, 
  updateSnapshotResult, 
  type DraftSnapshot 
} from "@/lib/analytics-db";
import { 
  Trophy, 
  History, 
  Trash2, 
  TrendingUp, 
  Calendar, 
  Flame, 
  ArrowLeft, 
  Skull, 
  Percent, 
  Target, 
  Swords 
} from "lucide-react";

export default function AnalyticsPage() {
  const [snapshots, setSnapshots] = useState<DraftSnapshot[]>([]);
  const [version, setVersion] = useState<string>("15.11.1");
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"all" | "evaluated">("all");

  useEffect(() => {
    async function loadData() {
      try {
        const v = await getLatestVersion();
        setVersion(v);
        const data = await getAllSnapshots();
        // Sort by timestamp descending (newest first)
        data.sort((a, b) => b.timestamp - a.timestamp);
        setSnapshots(data);
      } catch (err) {
        console.error("Error loading analytics data:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (confirm("¿Seguro que deseas eliminar este registro del historial?")) {
      try {
        await deleteSnapshot(id);
        setSnapshots(prev => prev.filter(item => item.id !== id));
      } catch (err) {
        console.error("Error deleting snapshot:", err);
      }
    }
  };

  const handleSetResult = async (id: string, result: 'win' | 'loss') => {
    try {
      await updateSnapshotResult(id, result);
      setSnapshots(prev => 
        prev.map(item => item.id === id ? { ...item, actualResult: result } : item)
      );
    } catch (err) {
      console.error("Error updating result:", err);
    }
  };

  // Stats calculation
  const totalDrafts = snapshots.length;
  const evaluatedDrafts = snapshots.filter(s => s.actualResult).length;
  const wins = snapshots.filter(s => s.actualResult === 'win').length;
  const losses = snapshots.filter(s => s.actualResult === 'loss').length;

  // Accuracy: correct prediction if:
  // - Predicted prob >= 50% and result is win
  // - Predicted prob < 50% and result is loss
  const correctPredictions = snapshots.filter(s => {
    if (!s.actualResult) return false;
    const predictedWin = s.predictedWinProbability >= 50;
    const actualWin = s.actualResult === 'win';
    return predictedWin === actualWin;
  }).length;

  const brainAccuracy = evaluatedDrafts > 0 
    ? Math.round((correctPredictions / evaluatedDrafts) * 100) 
    : 0;

  const getChampInfo = (id: string) => {
    const champ = staticFallbackChampions.find(c => c.id.toLowerCase() === id.toLowerCase());
    return champ || { name: id, ddragonKey: id };
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleDateString("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const filteredSnapshots = activeTab === "all" 
    ? snapshots 
    : snapshots.filter(s => s.actualResult);

  return (
    <div className="min-h-screen bg-[#010a13] text-[#f0e6d3] font-sans antialiased pb-16">
      {/* Top Navigation Bar */}
      <nav className="border-b border-[#c8aa6e]/30 bg-[#0a1428]/90 backdrop-blur-md sticky top-0 z-50 py-4 px-6 md:px-12 flex items-center justify-between">
        <Link 
          href="/" 
          className="flex items-center gap-2 text-[#c8aa6e] hover:text-[#f0e6d3] transition-colors text-xs md:text-sm font-bold uppercase tracking-wider group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Volver al Draft
        </Link>
        <div className="flex items-center gap-3">
          <History className="w-5 h-5 text-[#c8aa6e] animate-pulse" />
          <span className="font-serif font-black text-sm md:text-lg uppercase tracking-widest text-[#f0e6d3]">
            LCK POST-MORTEM ANALYTICS
          </span>
        </div>
        <div className="text-[10px] md:text-xs font-mono text-[#5e6b77] select-none">
          Client Version: {version}
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-8 flex flex-col gap-8">
        {/* Metric Cards Header */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Card 1: Total Drafts */}
          <div className="border border-[#785a28]/30 bg-[#1e232a]/40 p-5 rounded-sm relative overflow-hidden group hover:border-[#c8aa6e]/60 transition-all flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[10px] md:text-xs font-black uppercase text-[#8a9dae] tracking-widest block mb-1">
                Drafts Registrados
              </span>
              <span className="text-3xl font-serif font-black text-[#ebd6b3] block">
                {totalDrafts}
              </span>
            </div>
            <History className="w-10 h-10 absolute right-3 bottom-3 text-[#c8aa6e]/10 group-hover:text-[#c8aa6e]/20 transition-colors pointer-events-none" />
          </div>

          {/* Card 2: Winrate Real */}
          <div className="border border-[#785a28]/30 bg-[#1e232a]/40 p-5 rounded-sm relative overflow-hidden group hover:border-[#c8aa6e]/60 transition-all flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[10px] md:text-xs font-black uppercase text-[#8a9dae] tracking-widest block mb-1">
                Resultado Real
              </span>
              <span className="text-3xl font-serif font-black text-emerald-400 block">
                {wins}V <span className="text-[#5e6b77]">/</span> <span className="text-rose-400">{losses}D</span>
              </span>
            </div>
            <Trophy className="w-10 h-10 absolute right-3 bottom-3 text-emerald-400/10 group-hover:text-emerald-400/20 transition-colors pointer-events-none" />
          </div>

          {/* Card 3: Evaluated Percent */}
          <div className="border border-[#785a28]/30 bg-[#1e232a]/40 p-5 rounded-sm relative overflow-hidden group hover:border-[#c8aa6e]/60 transition-all flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[10px] md:text-xs font-black uppercase text-[#8a9dae] tracking-widest block mb-1">
                Tasa de Evaluación
              </span>
              <span className="text-3xl font-serif font-black text-amber-400 block">
                {totalDrafts > 0 ? Math.round((evaluatedDrafts / totalDrafts) * 100) : 0}%
              </span>
            </div>
            <Percent className="w-10 h-10 absolute right-3 bottom-3 text-amber-400/10 group-hover:text-amber-400/20 transition-colors pointer-events-none" />
          </div>

          {/* Card 4: Prediction Accuracy */}
          <div className="border border-[#00c8c8]/30 bg-[#00c8c8]/5 p-5 rounded-sm relative overflow-hidden group hover:border-[#00c8c8] transition-all flex flex-col justify-between min-h-[110px]">
            <div>
              <span className="text-[10px] md:text-xs font-black uppercase text-[#80f0ff] tracking-widest block mb-1">
                Accuracy del Cerebro
              </span>
              <span className="text-3xl font-serif font-black text-[#00c8c8] block">
                {brainAccuracy}%
              </span>
            </div>
            <Target className="w-10 h-10 absolute right-3 bottom-3 text-[#00c8c8]/10 group-hover:text-[#00c8c8]/20 transition-colors pointer-events-none" />
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-between border-b border-[#c8aa6e]/20 pb-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setActiveTab("all")}
              className={`pb-2 text-xs md:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeTab === "all" 
                  ? "border-[#c8aa6e] text-[#f0e6d3]" 
                  : "border-transparent text-[#8a9dae] hover:text-[#f0e6d3]"
              }`}
            >
              Todos los Drafts ({totalDrafts})
            </button>
            <button
              onClick={() => setActiveTab("evaluated")}
              className={`pb-2 text-xs md:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer border-b-2 ${
                activeTab === "evaluated" 
                  ? "border-[#c8aa6e] text-[#f0e6d3]" 
                  : "border-transparent text-[#8a9dae] hover:text-[#f0e6d3]"
              }`}
            >
              Evaluados ({evaluatedDrafts})
            </button>
          </div>
          <span className="text-[10px] font-mono text-[#5e6b77]">
            Post-Mortem Engine v1.0
          </span>
        </div>

        {/* Main List / Grid */}
        {loading ? (
          <div className="text-center py-16 text-[#8a9dae] border border-[#c8aa6e]/20 bg-[#1e232a]/20">
            <div className="animate-spin w-8 h-8 border-2 border-t-transparent border-[#c8aa6e] rounded-full mx-auto mb-4"></div>
            Cargando historial de IndexedDB...
          </div>
        ) : filteredSnapshots.length === 0 ? (
          <div className="text-center py-16 px-4 border border-dashed border-[#c8aa6e]/30 bg-[#1e232a]/30 rounded-sm flex flex-col gap-3 justify-center items-center">
            <Swords className="w-10 h-10 text-[#c8aa6e] opacity-75" />
            <h3 className="font-serif font-black text-sm uppercase text-[#c8aa6e] tracking-widest">
              Historial Vacío
            </h3>
            <p className="text-xs md:text-sm text-[#8a9dae] max-w-md leading-relaxed">
              No se han encontrado registros en esta sección. El cerebro analítico guarda snapshots automáticamente cada vez que un draft finaliza. ¡Completa tu primer draft en vivo para empezar!
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {filteredSnapshots.map((snapshot) => {
              // Calculate if prediction matched the actual outcome
              const isPredictionCorrect = snapshot.actualResult
                ? (snapshot.predictedWinProbability >= 50 === (snapshot.actualResult === 'win'))
                : null;

              return (
                <div 
                  key={snapshot.id}
                  className="border border-[#785a28]/30 bg-[#0a1428]/80 hover:border-[#c8aa6e]/60 transition-all rounded-sm p-4 md:p-6 flex flex-col gap-5 relative group"
                >
                  {/* Top Bar of Snapshot Card */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#785a28]/25 pb-3">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-4 h-4 text-[#c8aa6e]" />
                      <span className="text-xs font-mono font-bold text-[#c8aa6e]">
                        {formatDate(snapshot.timestamp)}
                      </span>
                      {snapshot.actualResult ? (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          snapshot.actualResult === 'win' 
                            ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/40"
                            : "bg-rose-950/40 text-rose-400 border-rose-500/40"
                        }`}>
                          {snapshot.actualResult === 'win' ? "Victoria" : "Derrota"}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded border bg-amber-950/40 text-amber-400 border-amber-500/40 animate-pulse">
                          Pendiente de Evaluación
                        </span>
                      )}

                      {isPredictionCorrect !== null && (
                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${
                          isPredictionCorrect 
                            ? "bg-[#00c8c8]/10 text-[#00c8c8] border-[#00c8c8]/30"
                            : "bg-red-950/20 text-red-300 border-red-500/20"
                        }`}>
                          {isPredictionCorrect ? "🔮 Predicción Correcta" : "🔮 Predicción Incorrecta"}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => handleDelete(snapshot.id)}
                        className="text-[#5e6b77] hover:text-rose-500 transition-colors p-1 rounded-sm cursor-pointer"
                        title="Eliminar registro"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Main Info Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                    {/* Column 1: Team Picks and Bans (7/12 cols) */}
                    <div className="md:col-span-7 flex flex-col gap-4">
                      {/* Ally Picks & Bans */}
                      <div className="flex flex-col gap-2 bg-[#1e232a]/40 border border-[#785a28]/15 p-3 rounded-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-[#ebd6b3] tracking-wider">
                            Nuestra Composición (Aliado)
                          </span>
                          <span className="text-[8px] font-mono text-[#5e6b77]">
                            Bans: {snapshot.allyBans.join(", ") || "Ninguno"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2.5 mt-1">
                          {snapshot.allyPicks.map((champId, idx) => {
                            const info = getChampInfo(champId);
                            const icon = getChampionIconUrl(version, info.ddragonKey);
                            return (
                              <div key={idx} className="relative w-10 h-10 border border-[#c8aa6e]/60 rounded overflow-hidden group/pick hover:border-[#c8aa6e] transition-colors" title={info.name}>
                                <Image src={icon} alt={info.name} fill className="object-cover" sizes="40px" />
                                <span className="absolute bottom-0 left-0 right-0 bg-[#0a1428]/85 text-[8px] text-center font-bold truncate px-0.5 select-none text-[#f0e6d3] group-hover/pick:bg-[#c8aa6e] group-hover/pick:text-[#0a1428]">
                                  {info.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Enemy Picks & Bans */}
                      <div className="flex flex-col gap-2 bg-[#1e232a]/40 border border-[#785a28]/15 p-3 rounded-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider">
                            Composición Rival (Enemigo)
                          </span>
                          <span className="text-[8px] font-mono text-[#5e6b77]">
                            Bans: {snapshot.enemyBans.join(", ") || "Ninguno"}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2.5 mt-1">
                          {snapshot.enemyPicks.map((champId, idx) => {
                            const info = getChampInfo(champId);
                            const icon = getChampionIconUrl(version, info.ddragonKey);
                            return (
                              <div key={idx} className="relative w-10 h-10 border border-rose-900/40 rounded overflow-hidden group/pick hover:border-rose-500 transition-colors" title={info.name}>
                                <Image src={icon} alt={info.name} fill className="object-cover" sizes="40px" />
                                <span className="absolute bottom-0 left-0 right-0 bg-[#0a1428]/85 text-[8px] text-center font-bold truncate px-0.5 select-none text-rose-300 group-hover/pick:bg-rose-900 group-hover/pick:text-[#f0e6d3]">
                                  {info.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Column 2: Math Metrics & Engine Predictions (5/12 cols) */}
                    <div className="md:col-span-5 flex flex-col gap-3">
                      {/* Metricas de Predicción */}
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-[#1e232a]/30 border border-[#785a28]/15 p-2 rounded-sm">
                          <span className="text-[8px] font-black uppercase text-[#8a9dae] tracking-widest block mb-0.5">Win Prob</span>
                          <span className="text-base font-serif font-black text-[#c8aa6e]">{snapshot.predictedWinProbability}%</span>
                        </div>
                        <div className="bg-[#1e232a]/30 border border-[#785a28]/15 p-2 rounded-sm" title="Vulnerabilidad de Bot Lane (Vg)">
                          <span className="text-[8px] font-black uppercase text-[#8a9dae] tracking-widest block mb-0.5">Vg Score</span>
                          <span className={`text-base font-serif font-black ${
                            snapshot.vgScore > 10.0 ? "text-rose-400" : snapshot.vgScore > 5.0 ? "text-amber-400" : "text-emerald-400"
                          }`}>{snapshot.vgScore}</span>
                        </div>
                        <div className="bg-[#1e232a]/30 border border-[#785a28]/15 p-2 rounded-sm" title="CFR Regret Score">
                          <span className="text-[8px] font-black uppercase text-[#8a9dae] tracking-widest block mb-0.5">CFR Score</span>
                          <span className="text-base font-serif font-black text-indigo-400">{snapshot.cfrScore}</span>
                        </div>
                      </div>

                      {/* Win Condition text block */}
                      <div className="p-3 bg-[#1e232a]/45 border border-[#785a28]/20 rounded-sm">
                        <span className="text-[9px] font-black uppercase text-[#c8aa6e] tracking-widest block mb-1">Estrategia & Win Condition</span>
                        <p className="text-xs text-[#ebd6b3] leading-relaxed line-clamp-2" title={snapshot.winCondition}>
                          "{snapshot.winCondition}"
                        </p>
                      </div>

                      {/* Update actual result buttons */}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-black uppercase text-[#8a9dae] tracking-wider mr-2 shrink-0">Evaluar:</span>
                        <button
                          onClick={() => handleSetResult(snapshot.id, 'win')}
                          className={`flex-1 py-1 rounded text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            snapshot.actualResult === 'win'
                              ? "bg-emerald-600 text-[#010a13] border-emerald-500 shadow"
                              : "bg-transparent text-emerald-400 border-emerald-500/30 hover:bg-emerald-950/20"
                          }`}
                        >
                          Victoria
                        </button>
                        <button
                          onClick={() => handleSetResult(snapshot.id, 'loss')}
                          className={`flex-1 py-1 rounded text-[10px] font-black uppercase tracking-wider border cursor-pointer transition-all ${
                            snapshot.actualResult === 'loss'
                              ? "bg-rose-600 text-[#010a13] border-rose-500 shadow"
                              : "bg-transparent text-rose-400 border-rose-500/30 hover:bg-rose-950/20"
                          }`}
                        >
                          Derrota
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
