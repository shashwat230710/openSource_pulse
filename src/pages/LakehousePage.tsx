import React, { useState } from 'react';
import { 
  ENGINEERED_FEATURES, 
  DATASET_LEDGER, 
  FUNNEL_STAGES, 
  BENCHMARK_EXPERIMENTS, 
  EngineeredFeature 
} from '../data/pulseData';
import { 
  Database, 
  Layers, 
  Cpu, 
  HardDrive, 
  FileText, 
  Search, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  CheckCircle2,
  ArrowRight
} from 'lucide-react';

export default function LakehousePage() {
  const [featureCategory, setFeatureCategory] = useState<string>('all');
  const [featureSearch, setFeatureSearch] = useState<string>('');

  const categories = [
    { id: 'all', label: 'All 16 Features' },
    { id: 'Velocity & Acceleration', label: 'Velocity & Acceleration (5)' },
    { id: 'Developer Utility', label: 'Developer Utility (3)' },
    { id: 'Activity & Maintenance', label: 'Activity & Maintenance (4)' },
    { id: 'GraphFrames Ecosystem', label: 'GraphFrames Ecosystem (4)' }
  ];

  const filteredFeatures = ENGINEERED_FEATURES.filter(f => {
    if (featureCategory !== 'all' && f.category !== featureCategory) return false;
    if (featureSearch) {
      const q = featureSearch.toLowerCase();
      return f.name.toLowerCase().includes(q) || 
             f.formula.toLowerCase().includes(q) || 
             f.description.toLowerCase().includes(q) ||
             f.sparkImplementation.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Hero Big Data Scale Header */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#3fb950] font-semibold flex items-center gap-1.5">
                <Database className="w-3.5 h-3.5" />
                Apache Spark 3.5.1 Medallion Architecture
              </span>
              <span className="text-xs font-mono text-[#8b949e]">· GH Archive Ingestion</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#f0f6fc] tracking-tight">
              1.48 Billion Events Big Data Lakehouse
            </h2>
            <p className="text-sm text-[#8b949e] max-w-3xl leading-relaxed">
              Complete end-to-end distributed data pipeline executing on Apache Spark. 
              Ingesting continuous hourly GitHub Archive JSON streams across Q1 2024, filtering 
              bot automation, and collapsing event data into sparse weekly window features.
            </p>
          </div>

          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#30363d] p-3 rounded-lg text-xs font-mono shrink-0">
            <div>
              <span className="text-[#8b949e] block text-[10px]">Parquet zstd Ratio</span>
              <span className="text-lg font-bold text-[#3fb950]">16.1x</span>
              <span className="text-[#8b949e] text-[10px] block">1.84 TB &rarr; 114 GB</span>
            </div>
            <div className="h-8 w-px bg-[#30363d] mx-2" />
            <div>
              <span className="text-[#8b949e] block text-[10px]">Continuous Files</span>
              <span className="text-lg font-bold text-[#58a6ff]">2,184</span>
              <span className="text-[#8b949e] text-[10px] block">Hourly JSON.gz</span>
            </div>
          </div>
        </div>

        {/* 4 Big Data Scale Pillars */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-2 text-xs font-mono">
          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded">
            <span className="text-[#8b949e] text-[11px] block">Raw Ingest Volume</span>
            <span className="text-xl font-bold text-[#f0f6fc] block mt-0.5">1,480,000,000</span>
            <span className="text-[11px] text-[#8b949e]">Public GitHub events</span>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded">
            <span className="text-[#8b949e] text-[11px] block">Silver Cleaned Events</span>
            <span className="text-xl font-bold text-[#58a6ff] block mt-0.5">342,000,000</span>
            <span className="text-[11px] text-[#3fb950]">12.4% bot traffic dropped</span>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded">
            <span className="text-[#8b949e] text-[11px] block">Gold Repo-Day Rows</span>
            <span className="text-xl font-bold text-[#bc8cff] block mt-0.5">8,420,000</span>
            <span className="text-[11px] text-[#8b949e]">Daily rollups (&gt;20 stars)</span>
          </div>

          <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded">
            <span className="text-[#8b949e] text-[11px] block">Screened Candidates</span>
            <span className="text-xl font-bold text-[#3fb950] block mt-0.5">148,000</span>
            <span className="text-[11px] text-[#e3b341]">1,280 true breakouts</span>
          </div>
        </div>
      </div>

      {/* Dataset Ledger Section (Per 1,000 Raw Events Survival) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-1 border-b border-[#30363d]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#58a6ff] font-semibold">
              Data Shrinkage &amp; Filtration Funnel
            </span>
            <h3 className="text-lg font-bold text-[#f0f6fc]">
              Dataset Ledger: Survival Rates per 1,000 Raw Events
            </h3>
          </div>
          <span className="text-xs font-mono text-[#8b949e]">
            Standardized ledger to compare data reduction across pipeline runs
          </span>
        </div>

        <div className="bg-[#161b22] border border-[#30363d] rounded-lg overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-[#30363d] bg-[#21262d] text-[#8b949e]">
                <th className="py-2.5 px-4">Pipeline Stage</th>
                <th className="py-2.5 px-4 text-right">Per 1,000 Raw Events</th>
                <th className="py-2.5 px-4 text-right">Retention of Prev.</th>
                <th className="py-2.5 px-4 text-right">Global Share</th>
                <th className="py-2.5 px-4">Distributed Engineering Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#30363d]/60">
              {DATASET_LEDGER.map((row, i) => (
                <tr key={i} className="hover:bg-[#1c2128] transition-colors">
                  <td className="py-3 px-4 font-semibold text-[#f0f6fc] flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#58a6ff]" />
                    {row.stage}
                  </td>
                  <td className="py-3 px-4 text-right font-bold tabular-nums text-[#3fb950]">
                    {row.per1000Raw >= 1 ? row.per1000Raw.toFixed(2) : row.per1000Raw.toFixed(5)}
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#8b949e]">
                    {row.ofPreviousPct.toFixed(2)}%
                  </td>
                  <td className="py-3 px-4 text-right tabular-nums text-[#bc8cff]">
                    {row.sharePct.toFixed(4)}%
                  </td>
                  <td className="py-3 px-4 text-[#8b949e] font-sans text-xs">
                    {row.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 16 Engineered Big Data Features Catalog */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1 border-b border-[#30363d]">
          <div>
            <span className="text-xs font-mono uppercase tracking-wider text-[#3fb950] font-semibold">
              Feature Engineering Specification
            </span>
            <h3 className="text-lg font-bold text-[#f0f6fc]">
              16 Engineered PySpark &amp; GraphFrames Features
            </h3>
          </div>

          {/* Search Feature */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={featureSearch}
              onChange={e => setFeatureSearch(e.target.value)}
              placeholder="Search features..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded pl-8 pr-3 py-1.5 text-xs text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff]"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 text-xs">
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => setFeatureCategory(c.id)}
              className={`px-3 py-1.5 rounded-md font-mono transition-colors cursor-pointer ${
                featureCategory === c.id
                  ? 'bg-[#238636] text-white font-semibold'
                  : 'bg-[#161b22] border border-[#30363d] text-[#8b949e] hover:text-[#f0f6fc]'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredFeatures.map(feat => {
            const signalBadgeColor = 
              feat.signalType === 'Positive Driver' 
                ? 'bg-[#238636]/20 text-[#3fb950] border-[#238636]/40'
                : feat.signalType === 'Organic Quality Filter'
                  ? 'bg-[#1f6feb]/20 text-[#58a6ff] border-[#1f6feb]/40'
                  : feat.signalType === 'Bot/Hype Penalizer'
                    ? 'bg-[#d29922]/20 text-[#e3b341] border-[#d29922]/40'
                    : 'bg-[#8957e5]/20 text-[#bc8cff] border-[#8957e5]/40';

            return (
              <div 
                key={feat.id} 
                className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-3 hover:border-[#8b949e]/50 transition-colors"
              >
                {/* Feature Header */}
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-[#8b949e] bg-[#21262d] px-1.5 py-0.5 rounded">
                        {feat.id}
                      </span>
                      <h4 className="text-sm font-bold text-[#f0f6fc]">
                        {feat.name}
                      </h4>
                    </div>
                    <span className="text-[11px] font-mono text-[#8b949e] mt-0.5 block">
                      {feat.category}
                    </span>
                  </div>

                  <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${signalBadgeColor} shrink-0`}>
                    {feat.signalType}
                  </span>
                </div>

                {/* Mathematical Formula */}
                <div className="bg-[#0d1117] border border-[#30363d] p-2 rounded text-xs font-mono text-[#58a6ff] overflow-x-auto">
                  {feat.formula}
                </div>

                {/* PySpark Code Snippet */}
                <div className="bg-[#0d1117]/80 border border-[#30363d]/60 p-2 rounded text-[11px] font-mono text-[#8b949e] overflow-x-auto">
                  <span className="text-[#3fb950]">PySpark: </span>
                  {feat.sparkImplementation}
                </div>

                {/* Description */}
                <p className="text-xs text-[#8b949e] leading-relaxed">
                  {feat.description}
                </p>

                {/* Importance Weight Bar */}
                <div className="pt-2 border-t border-[#30363d]/50 flex items-center justify-between gap-3 text-xs font-mono">
                  <span className="text-[#8b949e] text-[11px]">GBT Importance:</span>
                  <div className="flex-1 max-w-[140px] bg-[#21262d] rounded-full h-2 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-[#238636] to-[#58a6ff] h-full rounded-full" 
                      style={{ width: `${feat.importanceWeight * 350}%` }}
                    />
                  </div>
                  <span className="text-[#f0f6fc] font-bold">{(feat.importanceWeight * 100).toFixed(0)}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Spark Distributed Optimization Benchmarks */}
      <div className="space-y-3 pt-2">
        <div className="pb-1 border-b border-[#30363d]">
          <span className="text-xs font-mono uppercase tracking-wider text-[#e3b341] font-semibold">
            Execution Performance &amp; Cluster Efficiency
          </span>
          <h3 className="text-lg font-bold text-[#f0f6fc]">
            Spark Optimization Experiments &amp; Speedup Factors
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BENCHMARK_EXPERIMENTS.slice(0, 6).map(exp => (
            <div key={exp.id} className="bg-[#161b22] border border-[#30363d] rounded-lg p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-[#8b949e] font-bold">[{exp.id}] {exp.experiment}</span>
                <span className="text-[#3fb950] font-bold bg-[#238636]/15 px-2 py-0.5 rounded">
                  {exp.speedup} Speedup
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-[#0d1117] border border-[#30363d] p-2 rounded">
                <div>
                  <span className="text-[#8b949e] text-[10px] block">Baseline</span>
                  <span className="text-red-400 font-medium">{exp.baseline_val} {exp.unit}</span>
                </div>
                <div>
                  <span className="text-[#8b949e] text-[10px] block">Optimized</span>
                  <span className="text-[#3fb950] font-bold">{exp.optimised_val} {exp.unit}</span>
                </div>
              </div>

              <p className="text-xs text-[#8b949e] leading-snug">
                {exp.spark_ui_explanation}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
