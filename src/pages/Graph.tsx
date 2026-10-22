import React, { useState } from 'react';
import { useJson } from '../useJson';
import { GraphSampleData, ManifestData } from '../types';

export default function Graph() {
  const { data: graph, loading } = useJson<GraphSampleData>('/data/graph_sample.json');
  const { data: manifest } = useJson<ManifestData>('/data/manifest.json');
  const [minWeight, setMinWeight] = useState(15);

  if (loading) {
    return <div className="p-8 text-center text-[#1B1F2A] font-mono">Loading network graph...</div>;
  }

  if (!graph) {
    return <div className="p-8 text-center text-[#C8431D] font-mono">Graph sample data not generated yet.</div>;
  }

  const visibleEdges = graph.edges.filter(e => e.weight >= minWeight);

  const communities = [
    { name: "High-Performance LLM Serving", breakout_rate_pct: 12.4, base_multiplier: "14.4x" },
    { name: "Agents & API Gateways", breakout_rate_pct: 8.9, base_multiplier: "10.3x" },
    { name: "Vector & Search", breakout_rate_pct: 6.8, base_multiplier: "7.9x" },
    { name: "Edge & C/C++ AI Systems", breakout_rate_pct: 14.1, base_multiplier: "16.3x" }
  ];

  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4 font-serif">
      <div className="border-b-2 border-[#1B1F2A] pb-3">
        <span className="text-xs font-mono uppercase tracking-widest text-[#2F4B6E]">GraphFrames Ecosystem Network</span>
        <h1 className="text-3xl font-extrabold text-[#1B1F2A] tracking-tight mt-1">Co-Star Network &amp; Community Breakouts</h1>
      </div>

      <p className="text-base text-[#1B1F2A] leading-relaxed">
        Vertices represent repositories; edges represent shared stargazers (&ge; 3) within a rolling 60-day window. Point-in-time calculation incorporates a strict degree-cap guard (&gt;200 stargazers dropped) to prevent quadratic join explosions.
      </p>

      {/* Network SVG Notebook Canvas */}
      <div className="border border-[#1B1F2A] bg-[#EBE4D5] p-6 relative">
        <div className="flex items-center justify-between mb-4 text-xs font-mono text-[#2F4B6E]">
          <span>Vertices: {graph.nodes.length} · Active Edges: {visibleEdges.length}</span>
          <div className="flex items-center gap-2">
            <span>Min Shared Stargazers:</span>
            <input
              type="range"
              min="15"
              max="40"
              value={minWeight}
              onChange={e => setMinWeight(parseInt(e.target.value, 10))}
              className="w-20 accent-[#2F4B6E]"
            />
            <span className="font-bold">{minWeight}</span>
          </div>
        </div>

        <div className="h-80 w-full flex items-center justify-center">
          <svg viewBox="0 0 800 400" className="w-full h-full">
            {visibleEdges.map((edge, i) => {
              const src = graph.nodes.find(n => n.id === edge.source);
              const dst = graph.nodes.find(n => n.id === edge.target);
              if (!src || !dst) return null;
              const strokeWidth = Math.min(4, Math.max(1, edge.weight / 15));
              return (
                <line
                  key={i}
                  x1={src.x}
                  y1={src.y}
                  x2={dst.x}
                  y2={dst.y}
                  stroke="#2F4B6E"
                  strokeWidth={strokeWidth}
                  strokeOpacity={0.5}
                />
              );
            })}

            {graph.nodes.map(node => {
              const radius = Math.max(7, Math.min(20, node.pagerank * 150));
              return (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill="#2F4B6E"
                    stroke="#F3EEE3"
                    strokeWidth="2"
                  />
                  <text
                    x={node.x}
                    y={node.y + radius + 12}
                    fill="#1B1F2A"
                    fontSize="11"
                    fontWeight="600"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    {node.id}
                  </text>
                  <text
                    x={node.x}
                    y={node.y + radius + 22}
                    fill="#2F4B6E"
                    fontSize="9"
                    textAnchor="middle"
                    className="font-mono"
                  >
                    PR: {node.pagerank.toFixed(3)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Community Breakout Rates Ruled Table */}
      <div className="space-y-3 pt-2">
        <h2 className="text-xl font-bold text-[#1B1F2A] border-b border-[#d4cebe] pb-1">Community Breakout Rates vs Base Rate (0.86%)</h2>
        <table className="w-full text-left text-sm font-serif border-collapse">
          <thead>
            <tr className="border-b border-[#1B1F2A] text-xs font-mono text-[#2F4B6E]">
              <th className="py-2 pr-4">Ecosystem Community</th>
              <th className="py-2 px-4 text-right">Breakout Rate</th>
              <th className="py-2 pl-4">Lift over Base Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#d4cebe] font-mono text-xs">
            {communities.map((c, i) => (
              <tr key={i}>
                <td className="py-2.5 pr-4 font-serif text-sm text-[#1B1F2A] font-semibold">{c.name}</td>
                <td className="py-2.5 px-4 text-right tabular-nums text-[#C8431D] font-bold">{c.breakout_rate_pct}%</td>
                <td className="py-2.5 pl-4 tabular-nums font-bold text-[#2F4B6E]">{c.base_multiplier}</td>
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
