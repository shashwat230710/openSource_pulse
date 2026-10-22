import React from 'react';
import { useJson } from '../useJson';
import { BenchmarkData, ManifestData } from '../types';

export default function Optimizations() {
  const { data: benchmarks, loading } = useJson<BenchmarkData[]>('/data/benchmarks.json');
  const { data: manifest } = useJson<ManifestData>('/data/manifest.json');

  if (loading) {
    return <div className="p-8 text-center text-[#1B1F2A] font-mono">Loading benchmark ledgers...</div>;
  }

  if (!benchmarks) {
    return <div className="p-8 text-center text-[#C8431D] font-mono">Benchmark data not generated yet.</div>;
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 font-serif">
      <div className="border-b-2 border-[#1B1F2A] pb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#2F4B6E]">Big Data Performance Study</span>
        <h1 className="text-3xl font-extrabold text-[#1B1F2A] tracking-tight mt-1">Optimization Experiments (B1 – B6)</h1>
      </div>

      <p className="text-base text-[#1B1F2A] leading-relaxed">
        Every experiment runs on a real sample from the observation ledger. Measurements compare baseline execution against optimized Spark strategies, recording exact speedups and runtime evidence.
      </p>

      {/* Benchmarks Ruled Table */}
      <div className="space-y-3">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">Empirical Benchmark Ledger</h2>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-3">ID</th>
              <th className="py-2 px-3">Experiment Title</th>
              <th className="py-2 px-3 text-right">Baseline</th>
              <th className="py-2 px-3 text-right">Optimized</th>
              <th className="py-2 px-3 text-right">Speedup</th>
              <th className="py-2 pl-3">Spark Execution Concept</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            {benchmarks.map(b => (
              <tr key={b.id}>
                <td className="py-3 pr-3 font-bold text-[#2F4B6E]">{b.id}</td>
                <td className="py-3 px-3 font-serif text-sm font-semibold text-[#1B1F2A]">{b.title}</td>
                <td className="py-3 px-3 text-right tabular-nums text-slate-600">{b.baseline_value} {b.unit}</td>
                <td className="py-3 px-3 text-right tabular-nums text-[#C8431D] font-bold">{b.optimized_value} {b.unit}</td>
                <td className="py-3 px-3 text-right tabular-nums font-bold text-[#2F4B6E]">{b.speedup}</td>
                <td className="py-3 pl-3 font-serif text-[#1B1F2A] text-xs">{b.note}</td>
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
