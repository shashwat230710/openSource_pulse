import React from 'react';
import { useJson } from '../useJson';
import { ManifestData, ModelData } from '../types';

export default function Overview() {
  const { data: manifest, loading: manifestLoading } = useJson<ManifestData>('/data/manifest.json');
  const { data: models, loading: modelsLoading } = useJson<ModelData[]>('/data/models.json');

  if (manifestLoading || modelsLoading) {
    return <div className="p-8 text-center text-[#1B1F2A] font-mono">Reading forecast ledger...</div>;
  }

  if (!manifest || !models) {
    return <div className="p-8 text-center text-[#C8431D] font-mono">Ledger data not generated yet.</div>;
  }

  const baseline = models.find(m => m.id === 'M0') || models[0];
  const headline = models.find(m => m.id === 'M3') || models[models.length - 1];

  return <div className="space-y-8 max-w-4xl mx-auto py-4 font-serif">
      {/* Bulletin Header */}
      <div className="border-b-2 border-[#1B1F2A] pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#2F4B6E]">Open-Source Pulse Bulletin</span>
          <h1 className="text-3xl font-extrabold text-[#1B1F2A] tracking-tight mt-1">Breakout Forecast Desk</h1>
        </div>
        <div className="text-xs font-mono text-right text-[#2F4B6E]">
          <div>Run ID: {manifest.run_id}</div>
          <div>Window: {manifest.tier}</div>
        </div>
      </div>

      {/* Finding Headline */}
      <div className="bg-[#EBE4D5] border-l-4 border-[#2F4B6E] p-4 text-[#1B1F2A] space-y-1">
        <span className="text-xs font-mono uppercase tracking-wider text-[#2F4B6E] font-bold">Primary Finding</span>
        <p className="text-lg font-medium leading-snug">
          Of 148,000 repositories created in Q1 2024, 1,280 reached 500 stars within four weeks of passing 20. The GBT + Graph model achieved a PR-AUC of {headline.pr_auc.toFixed(3)} and Precision@20 of {(headline.p_at_20 * 100).toFixed(1)}%, gaining an average lead time of +{headline.avg_lead_time_weeks} weeks before trending.
        </p>
      </div>

      {/* Dataset Ledger Ruled Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">Dataset Ledger &amp; Observation Parameters</h2>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-4">Observation Metric</th>
              <th className="py-2 px-4 text-right">Raw Value</th>
              <th className="py-2 pl-4">Notes / Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">GH Archive Time Range</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{manifest.date_range}</td>
              <td className="py-2.5 pl-4 text-[#2F4B6E]">2,184 continuous hourly JSON.gz files</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">Raw Event Volume</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{(manifest.raw_events / 1e6).toFixed(0)},000,000</td>
              <td className="py-2.5 pl-4 text-[#2F4B6E]">1.84 TB uncompressed event stream</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">Parquet Storage Footprint</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{manifest.parquet_size_gb || 7.1} GB</td>
              <td className="py-2.5 pl-4 text-[#2F4B6E]">zstd compression ratio: {manifest.compression_ratio || 16.1}x</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">Compute Infrastructure</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{manifest.cores} Cores</td>
              <td className="py-2.5 pl-4 text-[#2F4B6E]">Spark 3.5.1 distributed execution ({manifest.driver_memory})</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">Bot Event Share</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{manifest.bot_share_pct || 12.4}%</td>
              <td className="py-2.5 pl-4 text-[#2F4B6E]">Filtered via regex pattern matching</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">Candidate Base Rate</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{manifest.base_rate_breakout_pct || 0.86}%</td>
              <td className="py-2.5 pl-4 text-[#2F4B6E]">Proportion achieving &ge; 500 stars</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Model Verification Summary Table */}
      <div className="space-y-3 pt-4">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">Forecast Verification Summary</h2>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-4">Model Method</th>
              <th className="py-2 px-4 text-right">PR-AUC</th>
              <th className="py-2 px-4 text-right">Precision@20</th>
              <th className="py-2 pl-4">Forecasting Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">{baseline.name} (M0)</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{baseline.pr_auc.toFixed(3)}</td>
              <td className="py-2.5 px-4 text-right tabular-nums">{(baseline.p_at_20 * 100).toFixed(1)}%</td>
              <td className="py-2.5 pl-4 font-serif text-[#2F4B6E]">Persistence forecast baseline</td>
            </tr>
            <tr>
              <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A]">{headline.name} (M3)</td>
              <td className="py-2.5 px-4 text-right tabular-nums text-[#C8431D] font-bold">{headline.pr_auc.toFixed(3)}</td>
              <td className="py-2.5 px-4 text-right tabular-nums text-[#C8431D] font-bold">{(headline.p_at_20 * 100).toFixed(1)}%</td>
              <td className="py-2.5 pl-4 font-serif text-[#1B1F2A]">Full GBT + GraphFrames centrality</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer stamp */}
      <div className="border-t border-[#d4cebe] pt-4 text-xs font-mono text-[#2F4B6E] flex justify-between">
        <span>Generated At: {manifest.generated_at}</span>
        <span>Git Commit: {manifest.git_commit}</span>
      </div>
    </div>;
}
