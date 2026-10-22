import React from 'react';
import { useJson } from '../useJson';
import { FunnelStageData, ManifestData } from '../types';

interface LedgerData {
  total_files: number;
  malformed_rows_total: number;
  event_mix: { type: string; share_pct: number; count: number }[];
  anomalous_hours: { hour: string; z_score: number; reason: string }[];
  retention_stages: { stage: string; rows: number; retention_pct: number }[];
}

export default function Pipeline() {
  const { data: funnel, loading: funnelLoading } = useJson<FunnelStageData[]>('/data/funnel.json');
  const { data: ledger, loading: ledgerLoading } = useJson<LedgerData>('/data/ledger.json');
  const { data: manifest } = useJson<ManifestData>('/data/manifest.json');

  if (funnelLoading || ledgerLoading) {
    return <div className="p-8 text-center text-[#1B1F2A] font-mono">Loading observation ledger &amp; funnel ratios...</div>;
  }

  if (!funnel || !ledger) {
    return <div className="p-8 text-center text-[#C8431D] font-mono">Funnel or ledger data not generated yet.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 font-serif">
      {/* Page Title */}
      <div className="border-b-2 border-[#1B1F2A] pb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#2F4B6E]">Observation Pipeline &amp; Scale</span>
        <h1 className="text-3xl font-extrabold text-[#1B1F2A] tracking-tight mt-1">Medallion Data Lakehouse &amp; File Ledger</h1>
      </div>

      <p className="text-base text-[#1B1F2A] leading-relaxed">
        The raw observation space spans 2,184 hourly files from the GH Archive. Every hourly file is validated, parsed with an explicit schema, checked for anomalous event volume via rolling z-scores, and compacted into zstd-compressed Parquet partitions.
      </p>

      {/* Funnel Ratios Ruled Table */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">Stage Retention &amp; Shrinkage Ratios</h2>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-4">Lakehouse Stage</th>
              <th className="py-2 px-4 text-right">Row Count</th>
              <th className="py-2 px-4 text-right">Retention Rate</th>
              <th className="py-2 pl-4">Grain &amp; Operational Note</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            {funnel.map((stage, idx) => (
              <tr key={idx}>
                <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A] font-semibold">{stage.stage}</td>
                <td className="py-2.5 px-4 text-right tabular-nums">{stage.rows.toLocaleString()}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-[#2F4B6E]">
                  {idx === 0 ? '100.0%' : `${(stage.rows / funnel[0].rows * 100).toFixed(3)}%`}
                </td>
                <td className="py-2.5 pl-4 font-serif text-[#2F4B6E] text-xs">{stage.note}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Event-Type Mix Ruled Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">Raw Event-Type Composition</h2>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-4">Event Type</th>
              <th className="py-2 px-4 text-right">Share (%)</th>
              <th className="py-2 px-4 text-right">Event Count</th>
              <th className="py-2 pl-4">Significance</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            {ledger.event_mix.map((em, i) => (
              <tr key={i}>
                <td className="py-2 pr-4 font-serif text-sm text-[#1B1F2A]">{em.type}</td>
                <td className="py-2 px-4 text-right tabular-nums text-[#2F4B6E] font-bold">{em.share_pct}%</td>
                <td className="py-2 px-4 text-right tabular-nums">{em.count.toLocaleString()}</td>
                <td className="py-2 pl-4 font-serif text-[#2F4B6E]">Primary observation signal</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Anomalous Hours Ruled Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">Per-File Ledger: Anomalous Hours</h2>
        <p className="text-xs text-[#2F4B6E] font-serif">
          Computed via rolling z-scores over hourly event counts across the 2,184 files. Malformed rows detected: {ledger.malformed_rows_total}.
        </p>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-4">Timestamp (UTC)</th>
              <th className="py-2 px-4 text-right">Z-Score</th>
              <th className="py-2 pl-4">Diagnostic Reason</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            {ledger.anomalous_hours.map((ah, i) => (
              <tr key={i}>
                <td className="py-2.5 pr-4 text-[#1B1F2A]">{ah.hour}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-[#C8431D] font-bold">{ah.z_score}</td>
                <td className="py-2.5 pl-4 font-serif text-[#1B1F2A]">{ah.reason}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
