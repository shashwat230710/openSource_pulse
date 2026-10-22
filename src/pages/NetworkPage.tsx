import React, { useState, useMemo } from 'react';
import { GRAPH_NODES, GRAPH_EDGES, GraphNode, GraphEdge } from '../data/pulseData';
import { Network, Sliders, ShieldCheck, Zap, Info, ExternalLink, Star, TrendingUp, ArrowUpRight } from 'lucide-react';

export default function NetworkPage() {
  const [minWeight, setMinWeight] = useState(15);
  const [selectedCommunity, setSelectedCommunity] = useState<number | 'all'>('all');
  const [selectedNodeId, setSelectedNodeId] = useState<string>('vllm');

  // Hardcoded 2D layout coordinates for clean, beautiful SVG rendering
  const nodeCoordinates: Record<string, { x: number; y: number }> = {
    vllm: { x: 380, y: 140 },
    ollama: { x: 490, y: 120 },
    llamacpp: { x: 440, y: 220 },
    whisper: { x: 320, y: 250 },
    litellm: { x: 230, y: 130 },
    langfuse: { x: 170, y: 210 },
    phidata: { x: 130, y: 110 },
    fastembed: { x: 260, y: 310 },
    qdrant: { x: 370, y: 340 },
    chroma: { x: 480, y: 330 },
    uv: { x: 600, y: 240 },
    ruff: { x: 680, y: 200 },
    customdb: { x: 530, y: 300 },
    botairdrop: { x: 100, y: 340 }
  };

  // Color mapping per community
  const communityColors: Record<number, { bg: string; stroke: string; label: string; text: string }> = {
    1: { bg: '#8957e5', stroke: '#bc8cff', label: 'High-Performance LLM Serving', text: '#d2a8ff' },
    2: { bg: '#1f6feb', stroke: '#58a6ff', label: 'AI Agents & Gateways', text: '#79c0ff' },
    3: { bg: '#238636', stroke: '#3fb950', label: 'Vector & Search Engines', text: '#56d364' },
    5: { bg: '#d29922', stroke: '#e3b341', label: 'Systems & Fast Tooling', text: '#e3b341' },
    0: { bg: '#484f58', stroke: '#8b949e', label: 'Isolated / Low Density', text: '#8b949e' }
  };

  // Filter edges based on weight
  const visibleEdges = useMemo(() => {
    return GRAPH_EDGES.filter(e => e.weight >= minWeight);
  }, [minWeight]);

  // Selected node details
  const selectedNode = useMemo(() => {
    return GRAPH_NODES.find(n => n.id === selectedNodeId) || GRAPH_NODES[0];
  }, [selectedNodeId]);

  // Connected neighbors of selected node
  const connectedEdges = useMemo(() => {
    return GRAPH_EDGES.filter(e => e.source === selectedNodeId || e.target === selectedNodeId);
  }, [selectedNodeId]);

  return (
    <div className="space-y-6">
      {/* Header explanation */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#58a6ff] font-semibold flex items-center gap-1">
                <Network className="w-3.5 h-3.5 text-[#bc8cff]" />
                GraphFrames Bipartite Co-Star Projection
              </span>
              <span className="text-xs font-mono text-[#8b949e]">· Rolling 60-Day Window</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">
              Developer Mindshare &amp; Ecosystem Centrality
            </h2>
            <p className="text-sm text-[#8b949e] max-w-3xl leading-relaxed">
              In open source, stars from prolific engineers who also star adjacent cutting-edge libraries 
              are 14x more predictive than random traffic. Vertices represent repositories sized by 
              GraphFrames PageRank; edges denote shared active stargazers.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t lg:border-t-0 lg:border-l border-[#30363d] pt-3 lg:pt-0 lg:pl-6 shrink-0 gap-1 font-mono text-xs">
            <div className="text-[#8b949e]">Graph Signal Lift</div>
            <div className="text-lg font-bold text-[#3fb950]">+0.066 PR-AUC</div>
            <div className="text-[11px] text-[#8b949e]">Tests Research RQ3</div>
          </div>
        </div>
      </div>

      {/* Main Interactive Network Viewport & Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Canvas & Graph Controls (2 Cols) */}
        <div className="lg:col-span-2 space-y-3">
          {/* Controls Bar */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-t-lg p-3.5 flex flex-wrap items-center justify-between gap-3 text-xs">
            {/* Slider */}
            <div className="flex items-center gap-3">
              <span className="text-[#8b949e] font-mono">Min Shared Stargazers:</span>
              <input
                type="range"
                min="5"
                max="45"
                value={minWeight}
                onChange={e => setMinWeight(parseInt(e.target.value, 10))}
                className="w-24 sm:w-36 accent-[#58a6ff] cursor-pointer"
              />
              <span className="font-mono text-[#58a6ff] font-bold bg-[#0d1117] border border-[#30363d] px-2 py-0.5 rounded">
                &ge; {minWeight}
              </span>
            </div>

            {/* Active stats */}
            <div className="text-[11px] font-mono text-[#8b949e]">
              <span>Edges: <strong className="text-[#f0f6fc]">{visibleEdges.length}</strong></span>
              <span className="mx-2">·</span>
              <span>Vertices: <strong className="text-[#f0f6fc]">{GRAPH_NODES.length}</strong></span>
            </div>
          </div>

          {/* SVG Network Canvas */}
          <div className="bg-[#0d1117] border border-[#30363d] rounded-b-lg p-4 relative overflow-hidden">
            <div className="w-full h-[420px] relative flex items-center justify-center">
              <svg 
                viewBox="0 0 800 420" 
                className="w-full h-full select-none"
              >
                {/* Background Grid Pattern */}
                <defs>
                  <pattern id="graph-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#21262d" strokeWidth="0.75" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#graph-grid)" />

                {/* Edges */}
                {visibleEdges.map((edge, i) => {
                  const srcCoord = nodeCoordinates[edge.source];
                  const dstCoord = nodeCoordinates[edge.target];
                  if (!srcCoord || !dstCoord) return null;

                  const isConnectedToSelected = 
                    edge.source === selectedNodeId || edge.target === selectedNodeId;

                  const strokeWidth = Math.min(4.5, Math.max(1, edge.weight / 12));

                  return (
                    <g key={i}>
                      <line
                        x1={srcCoord.x}
                        y1={srcCoord.y}
                        x2={dstCoord.x}
                        y2={dstCoord.y}
                        stroke={isConnectedToSelected ? '#58a6ff' : '#30363d'}
                        strokeWidth={isConnectedToSelected ? strokeWidth + 1 : strokeWidth}
                        strokeOpacity={isConnectedToSelected ? 0.9 : 0.45}
                        strokeDasharray={isConnectedToSelected ? undefined : undefined}
                      />
                      {/* Edge weight label for connected */}
                      {isConnectedToSelected && (
                        <text
                          x={(srcCoord.x + dstCoord.x) / 2}
                          y={(srcCoord.y + dstCoord.y) / 2 - 4}
                          fill="#79c0ff"
                          fontSize="10"
                          fontFamily="monospace"
                          textAnchor="middle"
                          className="font-bold pointer-events-none"
                        >
                          {edge.weight}
                        </text>
                      )}
                    </g>
                  );
                })}

                {/* Nodes */}
                {GRAPH_NODES.map(node => {
                  const coord = nodeCoordinates[node.id] || { x: 400, y: 200 };
                  const color = communityColors[node.community_id] || communityColors[0];
                  const isSelected = node.id === selectedNodeId;
                  const radius = Math.max(9, Math.min(22, node.pagerank * 170));

                  return (
                    <g
                      key={node.id}
                      onClick={() => setSelectedNodeId(node.id)}
                      className="cursor-pointer transition-transform hover:scale-110"
                      transform={`translate(${coord.x}, ${coord.y})`}
                    >
                      {/* Outer pulse ring for selected */}
                      {isSelected && (
                        <circle
                          r={radius + 6}
                          fill="none"
                          stroke="#58a6ff"
                          strokeWidth="2"
                          strokeOpacity="0.8"
                          className="animate-pulse"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={radius}
                        fill={color.bg}
                        stroke={isSelected ? '#ffffff' : color.stroke}
                        strokeWidth={isSelected ? 2.5 : 1.5}
                        fillOpacity={0.85}
                      />

                      {/* Node Label */}
                      <text
                        y={radius + 14}
                        fill={isSelected ? '#ffffff' : '#c9d1d9'}
                        fontSize={isSelected ? '11' : '10'}
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        fontFamily="monospace"
                        textAnchor="middle"
                        className="pointer-events-none"
                      >
                        {node.repo_name.split('/')[1] || node.id}
                      </text>
                    </g>
                  );
                })}
              </svg>

              {/* Watermark badge on canvas */}
              <div className="absolute bottom-2 left-3 text-[10px] font-mono text-[#8b949e]">
                Click any node to inspect co-star affinity &amp; PageRank
              </div>
            </div>
          </div>

          {/* Community Legend Bar */}
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-3 flex flex-wrap items-center justify-between gap-3 text-xs">
            <span className="text-[#8b949e] font-medium">Community Clusters:</span>
            <div className="flex flex-wrap items-center gap-3">
              {[1, 2, 3, 5].map(commId => {
                const comm = communityColors[commId];
                return (
                  <div key={commId} className="flex items-center gap-1.5 font-mono text-[11px]">
                    <span 
                      className="w-2.5 h-2.5 rounded-full inline-block" 
                      style={{ backgroundColor: comm.bg, border: `1px solid ${comm.stroke}` }} 
                    />
                    <span className="text-[#c9d1d9]">{comm.label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Repository Detail Panel (1 Col) */}
        <div className="space-y-4">
          <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#30363d]">
              <span className="text-xs font-mono uppercase tracking-wider text-[#58a6ff] font-semibold">
                Selected Vertex Analysis
              </span>
              <span className="text-xs font-mono text-[#3fb950] bg-[#238636]/20 border border-[#238636]/40 px-2 py-0.5 rounded">
                Score: {Math.round(selectedNode.score * 100)}%
              </span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <a
                  href={`https://github.com/${selectedNode.repo_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-lg font-bold text-[#f0f6fc] hover:text-[#58a6ff] hover:underline break-all inline-flex items-center gap-1.5 group"
                  title={`Open https://github.com/${selectedNode.repo_name} on GitHub`}
                >
                  <span>{selectedNode.repo_name}</span>
                  <ArrowUpRight className="w-4 h-4 text-[#58a6ff] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </a>
                <p className="text-xs text-[#8b949e] mt-1 font-mono">
                  Cluster: <span className="text-[#e6edf3]">{selectedNode.community_name}</span>
                </p>
              </div>

              <a
                href={`https://github.com/${selectedNode.repo_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-mono text-[#58a6ff] hover:text-[#79c0ff] bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] px-2.5 py-1.5 rounded shrink-0 transition-colors"
                title={`Open ${selectedNode.repo_name} on GitHub`}
              >
                <span>GitHub</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </a>
            </div>

            {/* Graph Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded">
                <span className="text-[#8b949e] text-[10px] block">PageRank Score</span>
                <span className="text-base font-bold text-[#bc8cff]">{selectedNode.pagerank.toFixed(3)}</span>
                <span className="text-[10px] text-[#8b949e] block mt-0.5">Ecosystem Top 1%</span>
              </div>

              <div className="bg-[#0d1117] border border-[#30363d] p-2.5 rounded">
                <span className="text-[#8b949e] text-[10px] block">Snapshot Stars</span>
                <span className="text-base font-bold text-[#e6edf3]">{selectedNode.stars_cum}</span>
                <span className="text-[10px] text-[#3fb950] block mt-0.5">Pre-breakout</span>
              </div>
            </div>

            {/* Connected Co-Star Neighbors Table */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-semibold text-[#f0f6fc] flex items-center justify-between">
                <span>Direct Co-Star Edges:</span>
                <span className="text-[11px] font-mono text-[#8b949e]">{connectedEdges.length} connections</span>
              </span>

              {connectedEdges.length === 0 ? (
                <div className="text-xs text-[#8b949e] italic py-2">
                  No co-star edges above threshold.
                </div>
              ) : (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {connectedEdges.map((edge, idx) => {
                    const neighborId = edge.source === selectedNodeId ? edge.target : edge.source;
                    const neighborNode = GRAPH_NODES.find(n => n.id === neighborId);
                    if (!neighborNode) return null;

                    return (
                      <div
                        key={idx}
                        className="flex items-center justify-between p-2 rounded bg-[#0d1117] hover:bg-[#21262d] border border-[#30363d] text-xs font-mono transition-colors group"
                      >
                        <div 
                          onClick={() => setSelectedNodeId(neighborId)}
                          className="flex items-center gap-1.5 cursor-pointer truncate mr-2"
                        >
                          <span className="text-[#58a6ff] group-hover:underline truncate">
                            {neighborNode.repo_name}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-[#8b949e] text-[11px]">
                            {edge.weight} shared
                          </span>
                          <span className="text-[10px] text-[#3fb950] bg-[#3fb950]/10 px-1 rounded">
                            {Math.round(neighborNode.score * 100)}%
                          </span>
                          <a
                            href={`https://github.com/${neighborNode.repo_name}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[#8b949e] hover:text-[#58a6ff] p-0.5 transition-colors"
                            title={`Open https://github.com/${neighborNode.repo_name} on GitHub`}
                          >
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Spark Optimization Callout */}
            <div className="bg-[#0d1117] border border-[#30363d] p-3 rounded text-xs space-y-1.5">
              <div className="flex items-center gap-1.5 text-[#e3b341] font-semibold text-[11px]">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Spark Optimization: Degree Capping</span>
              </div>
              <p className="text-[11px] text-[#8b949e] leading-snug">
                Self-joins on bipartite graphs risk explosive $O(N^2)$ shuffles. Dropping users with &gt;200 stars reduced edge count by 89% and sped up GraphFrames execution by 25.6x.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
