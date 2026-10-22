import React, { useState } from 'react';
import { useJson } from '../useJson';
import { ModelData, PredictionData, ManifestData } from '../types';

interface ArchetypeData {
  id: string;
  name: string;
  description: string;
  breakout_rate_pct: number;
  share_of_candidates_pct: number;
  curve: number[];
}

export default function Predictions() {
  const { data: models, loading: modelsLoading } = useJson<ModelData[]>('/data/models.json');
  const { data: predictions, loading: predsLoading } = useJson<PredictionData[]>('/data/predictions.json');
  const { data: archetypes, loading: archLoading } = useJson<ArchetypeData[]>('/data/archetypes.json');
  const { data: manifest } = useJson<ManifestData>('/data/manifest.json');
  const [selectedWeek, setSelectedWeek] = useState('2024-02-19');

  if (modelsLoading || predsLoading || archLoading) {
    return <div className="p-8 text-center text-[#1B1F2A] font-mono">Loading forecast verification ledger...</div>;
  }

  if (!models || !predictions || !archetypes) {
    return <div className="p-8 text-center text-[#C8431D] font-mono">Forecast data not generated yet.</div>;
  }

  const filteredPreds = predictions.filter(p => p.week_start === selectedWeek);
  const headline = models.find(m => m.id === 'M3') || models[models.length - 1];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 font-serif">
      <div className="border-b-2 border-[#1B1F2A] pb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#2F4B6E]">Forecast Verification &amp; Watchlist</span>
        <h1 className="text-3xl font-extrabold text-[#1B1F2A] tracking-tight mt-1">Weekly Watchlist &amp; Growth Archetypes</h1>
      </div>

      <p className="text-base text-[#1B1F2A] leading-relaxed">
        Forecast verification tracks weekly top candidates issued by the model against actual 30-day outcomes. Lift is computed as Precision@20 divided by the base rate (0.86%).
      </p>

      {/* Weekly Watchlist Ruled Table */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#1B1F2A] pb-2">
          <h2 className="text-xl font-bold text-[#1B1F2A]">Top-10 Watchlist (Test Week: {selectedWeek})</h2>
          <span className="text-xs font-mono text-[#2F4B6E]">Base Rate Lift: {(headline.p_at_20 / 0.0086).toFixed(1)}x</span>
        </div>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-3">Rank</th>
              <th className="py-2 px-3">Repository Name</th>
              <th className="py-2 px-3 text-right">Model Score</th>
              <th className="py-2 px-3 text-right">Snapshot Stars</th>
              <th className="py-2 px-3 text-right">Actual (+4w)</th>
              <th className="py-2 pl-3 text-center">Verification Outcome</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            {filteredPreds.map(p => (
              <tr key={p.repo_name}>
                <td className="py-3 pr-3 text-slate-500">#{p.rank}</td>
                <td className="py-3 px-3 font-semibold text-[#2F4B6E] font-mono">{p.repo_name}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#C8431D] font-bold">{(p.score * 100).toFixed(1)}%</td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-700">{p.stars_cum.toLocaleString()}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#1B1F2A] font-semibold">+{p.stars_next_4w.toLocaleString()}</td>
                <td className="py-3 pl-3 text-center">
                  {p.label ? (
                    <span className="text-[#2F4B6E] font-bold font-mono">HIT (&ge;500)</span>
                  ) : (
                    <span className="text-[#C8431D] font-mono">MISS</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Growth Archetypes Small Multiples */}
      <div className="space-y-4 pt-4">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">K-Means Growth Archetypes (Small Multiples)</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {archetypes.map(arch => (
            <div key={arch.id} className="border border-[#d4cebe] bg-[#EBE4D5] p-4 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[#2F4B6E]">
                <span className="font-bold">[{arch.id}] {arch.name}</span>
                <span>Breakout Rate: <strong className="text-[#C8431D]">{arch.breakout_rate_pct}%</strong></span>
              </div>
              <p className="text-xs text-[#1B1F2A]">{arch.description}</p>
              <div className="text-[11px] font-mono text-[#2F4B6E]">
                Candidate Share: {arch.share_of_candidates_pct}%
              </div>
            </div>
          ))}
        </div>
      </div>

      {manifest && (
        <footer className="border-t border-[#d4cebe] pt-4 text-xs font-mono text-[#2F4B6E] flex justify-between">
          <span>Run ID: {manifest.run_id}</span>
          <span>Generated At: {manifest.generated_at}</span>
        </footer>
      )}
    </div>
  );
}
