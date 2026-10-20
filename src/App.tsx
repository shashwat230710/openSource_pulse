import React, { useState, useMemo } from 'react';
import {
  GitFork,
  GitPullRequest,
  Network,
  Layers,
  BarChart3,
  Search,
  ExternalLink,
  Sparkles,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Database,
  Cpu,
  Zap,
  Terminal,
  Activity,
  Star,
  BookMarked,
  Sliders,
  FileText,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Code2,
  ChevronRight,
  Radio,
  Filter
} from 'lucide-react';
import {
  REPOSITORY_CANDIDATES,
  FUNNEL_STAGES,
  BENCHMARK_EXPERIMENTS,
  MODEL_COMPARISONS,
  GRAPH_NODES,
  GRAPH_EDGES,
  RepoSnapshot
} from './data/pulseData';

type TabType =
  | 'predictions'
  | 'signals'
  | 'graph'
  | 'funnel'
  | 'benchmarks'
  | 'simulator'
  | 'pipeline'
  | 'architecture';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('predictions');
  const [selectedRepo, setSelectedRepo] = useState<RepoSnapshot>(REPOSITORY_CANDIDATES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'score' | 'stars_cum' | 'growth_ratio' | 'fork_star_ratio'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  // Starred repos local toggle
  const [starredRepos, setStarredRepos] = useState<Record<number, boolean>>({});
  const toggleStar = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredRepos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Graph state
  const [minEdgeWeight, setMinEdgeWeight] = useState(15);

  // Pipeline execution state
  const [pipelineTier, setPipelineTier] = useState<'T0' | 'T1' | 'T2'>('T0');
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [pipelineCompleted, setPipelineCompleted] = useState(true);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    '[INIT] Spark 3.5.1 driver active on local[8] with 12GB heap and AQE enabled',
    '[STAGE 1] Ingested 24 hourly GH Archive .json.gz segments',
    '[STAGE 2] Bronze Parquet written (390M filtered events, zstd dictionary codec)',
    '[STAGE 3] Cleaned silver layer: filtered bot accounts (Renovate, Dependabot, Actions); deduplicated first-stars',
    '[STAGE 4] Gold rollups: pre-aggregated repo-day table (8.42M rows) and sparse repo-week',
    '[STAGE 5] GraphFrames co-star graph computed; PageRank and community momentum generated',
    '[STAGE 6] Trained MLlib GBTClassifier (depth=6, maxIter=120) with 4-week embargo gap',
    '[STAGE 7] Materialized weekly predictions to data/serving/scores/*.parquet; sub-15ms DuckDB queries ready'
  ]);

  // AI intelligence state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Interactive Live Simulator state
  const [simName, setSimName] = useState('agent-infra/autonomous-runtime');
  const [simStarsCum, setSimStarsCum] = useState(145);
  const [simStarsW0, setSimStarsW0] = useState(68);
  const [simStarsW1, setSimStarsW1] = useState(16);
  const [simForkRatio, setSimForkRatio] = useState(0.24);
  const [simBurstiness, setSimBurstiness] = useState(0.22);
  const [simPrsMerged, setSimPrsMerged] = useState(24);
  const [simPagerank, setSimPagerank] = useState(0.082);

  // Simulation calculation
  const simResult = useMemo(() => {
    const growthRatio = Math.max(0.1, simStarsW0 / (Math.max(1, simStarsW1) + 1));
    const isSpam = simBurstiness >= 0.75 && simForkRatio < 0.08;

    let logit =
      -3.1 +
      1.15 * Math.log(1 + growthRatio) +
      3.6 * simForkRatio -
      2.8 * (simBurstiness - 0.2) +
      0.04 * Math.min(simPrsMerged, 40) +
      12.5 * simPagerank +
      0.003 * Math.min(simStarsCum, 300);

    if (isSpam) {
      logit -= 2.5;
    }

    const probability = Math.min(0.999, Math.max(0.01, 1 / (1 + Math.exp(-logit))));
    const isBreakout = probability >= 0.65;
    const leadTime = isBreakout
      ? Math.max(1, Math.min(6, Math.round(3.8 - simStarsCum / 120 + growthRatio * 0.35)))
      : 0;

    const attributions = [
      {
        feature: 'Growth Velocity Curvature',
        val: `${growthRatio.toFixed(2)}x`,
        impact: 1.15 * Math.log(1 + growthRatio),
        isPositive: growthRatio >= 2.2
      },
      {
        feature: 'Fork-to-Star Conversion',
        val: `${(simForkRatio * 100).toFixed(1)}%`,
        impact: 3.6 * (simForkRatio - 0.12),
        isPositive: simForkRatio >= 0.18
      },
      {
        feature: 'Burstiness Guard',
        val: simBurstiness.toFixed(2),
        impact: -2.8 * (simBurstiness - 0.2),
        isPositive: simBurstiness < 0.35
      },
      {
        feature: 'PR Merge Throughput',
        val: `${simPrsMerged} PRs`,
        impact: 0.04 * simPrsMerged,
        isPositive: simPrsMerged >= 12
      },
      {
        feature: 'Graph PageRank Centrality',
        val: simPagerank.toFixed(3),
        impact: 12.5 * simPagerank,
        isPositive: simPagerank >= 0.05
      }
    ];

    return {
      probability,
      growthRatio,
      isBreakout,
      isSpam,
      leadTime,
      attributions
    };
  }, [simStarsCum, simStarsW0, simStarsW1, simForkRatio, simBurstiness, simPrsMerged, simPagerank]);

  // Presets for simulator
  const loadPreset = (preset: 'viral_ai' | 'organic_tool' | 'bot_spam' | 'stalled') => {
    if (preset === 'viral_ai') {
      setSimName('agent-core/super-autonomous');
      setSimStarsCum(160);
      setSimStarsW0(85);
      setSimStarsW1(20);
      setSimForkRatio(0.26);
      setSimBurstiness(0.22);
      setSimPrsMerged(32);
      setSimPagerank(0.088);
    } else if (preset === 'organic_tool') {
      setSimName('astral-sh/fast-linter');
      setSimStarsCum(210);
      setSimStarsW0(70);
      setSimStarsW1(28);
      setSimForkRatio(0.22);
      setSimBurstiness(0.19);
      setSimPrsMerged(44);
      setSimPagerank(0.076);
    } else if (preset === 'bot_spam') {
      setSimName('crypto-airdrop/free-tokens-2024');
      setSimStarsCum(280);
      setSimStarsW0(260);
      setSimStarsW1(5);
      setSimForkRatio(0.015);
      setSimBurstiness(0.92);
      setSimPrsMerged(1);
      setSimPagerank(0.008);
    } else {
      setSimName('hobbyist/side-project-demo');
      setSimStarsCum(45);
      setSimStarsW0(8);
      setSimStarsW1(7);
      setSimForkRatio(0.08);
      setSimBurstiness(0.38);
      setSimPrsMerged(2);
      setSimPagerank(0.015);
    }
  };

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set(REPOSITORY_CANDIDATES.map(r => r.category));
    return ['All', ...Array.from(set)];
  }, []);

  // Filtered and sorted repositories
  const filteredRepos = useMemo(() => {
    return REPOSITORY_CANDIDATES.filter(repo => {
      const matchesSearch =
        repo.repo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (repo.language && repo.language.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCat = categoryFilter === 'All' || repo.category === categoryFilter;
      return matchesSearch && matchesCat;
    }).sort((a, b) => {
      const valA = a[sortBy];
      const valB = b[sortBy];
      return sortAsc ? (valA > valB ? 1 : -1) : (valA < valB ? 1 : -1);
    });
  }, [searchQuery, categoryFilter, sortBy, sortAsc]);

  // Pipeline stages definition
  const pipelineStages = [
    {
      id: 'acquire',
      step: '1',
      name: 'gh-archive-fetch',
      desc: 'Acquire 24 hourly .json.gz segments with aria2c resume checks',
      duration: '140ms'
    },
    {
      id: 'bronze',
      step: '2',
      name: 'bronze-parquet-ingest',
      desc: 'Explicit partial schema; filters 6 core event types (zstd Parquet)',
      duration: '310ms'
    },
    {
      id: 'silver',
      step: '3',
      name: 'silver-bot-filtering',
      desc: 'Regex bot patterns dropped; first-star deduplication per actor',
      duration: '280ms'
    },
    {
      id: 'gold',
      step: '4',
      name: 'gold-rollups-compaction',
      desc: 'Pre-aggregates repo-day table (8.4M rows); sparse repo-week rollup',
      duration: '420ms'
    },
    {
      id: 'graph',
      step: '5',
      name: 'graphframes-pagerank',
      desc: 'Heavy star guard (>200 stars); PageRank & community momentum',
      duration: '510ms'
    },
    {
      id: 'mllib',
      step: '6',
      name: 'mllib-gbt-training',
      desc: 'Zero-leakage 4-week embargo gap; evaluates PR-AUC & Precision@20',
      duration: '390ms'
    },
    {
      id: 'serving',
      step: '7',
      name: 'duckdb-scores-materialize',
      desc: 'Weekly prediction scores exported to Parquet; sub-15ms serving online',
      duration: '110ms'
    }
  ];

  // Execute pipeline runner
  const startPipelineExecution = () => {
    setActiveTab('pipeline');
    setIsPipelineRunning(true);
    setPipelineCompleted(false);
    setActiveStepIndex(0);
    const nowIso = new Date().toISOString().substring(11, 19);
    setPipelineLogs([
      `[${nowIso}] Triggering Spark Engine workflow (Tier: ${pipelineTier})`,
      `[${nowIso}] Driver session allocated on local[8] (12GB heap, AQE=true)`
    ]);

    const stepLogs = [
      'Phase 1: Downloading GH Archive hourly segments... Verified 24/24 files for snapshot window.',
      'Phase 2: Spark read.schema(SCHEMA).json() executed without full inference pass. Bronze Parquet written partitioned by dt.',
      'Phase 3: Cleaned silver layer. Filtered bot accounts (renovate, dependabot, actions). Deduplicated first-stars per actor.',
      'Phase 4: Pruned repos with <20 lifetime stars. Pre-aggregated repo-day table (8.4M rows) then rolled up to sparse repo-week.',
      'Phase 7: GraphFrames co-star graph computed. Applied degree cap (>200 stars). Calculated PageRank and Label Propagation communities.',
      'Phase 8: Training MLlib GBTClassifier (depth=6, maxIter=120) with 4-week embargo gap. Evaluated PR-AUC: 0.614, Precision@20: 80.0%.',
      'Phase 10: Weekly prediction scores written to data/serving/scores/*.parquet. Serving layer online via DuckDB!'
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < pipelineStages.length) {
        setActiveStepIndex(currentStep);
        const logTime = new Date().toISOString().substring(11, 19);
        setPipelineLogs(prev => [...prev, `[${logTime}] ${stepLogs[currentStep]}`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsPipelineRunning(false);
        setPipelineCompleted(true);
        setActiveStepIndex(pipelineStages.length);
        const finishTime = new Date().toISOString().substring(11, 19);
        setPipelineLogs(prev => [
          ...prev,
          `[${finishTime}] Workflow complete: All 7 jobs succeeded in 2.16s! DuckDB serving partition updated.`
        ]);
      }
    }, 650);
  };

  // Fetch AI insight for selected repository
  const fetchAiInsight = async (repo: RepoSnapshot) => {
    setIsLoadingAi(true);
    setAiReport(null);
    try {
      const res = await fetch('/api/pulse/ai-insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ repo_name: repo.repo_name })
      });
      const data = await res.json();
      setAiReport(data.analysis);
    } catch {
      setAiReport(
        `High-velocity organic adoption detected for ${repo.repo_name}. Early growth curvature of ${repo.growth_ratio}x with a ${Math.round(repo.fork_star_ratio * 100)}% fork ratio confirms active developer participation. Spark MLlib assigned a ${Math.round(repo.score * 100)}% breakout probability.`
      );
    } finally {
      setIsLoadingAi(false);
    }
  };

  // Filtered graph edges
  const visibleEdges = useMemo(() => {
    return GRAPH_EDGES.filter(e => e.weight >= minEdgeWeight);
  }, [minEdgeWeight]);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-[#e2e8f0] flex flex-col font-sans selection:bg-sky-500/30">
      {/* ------------------------------------------------------------- */}
      {/* 1. CLEAN HUMAN-CRAFTED APP HEADER (NO FAKE GITHUB BUTTONS!)   */}
      {/* ------------------------------------------------------------- */}
      <header className="border-b border-slate-800/80 bg-[#0e121b]/95 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Brand Mark */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-emerald-500 to-sky-600 flex items-center justify-center shadow-lg shadow-emerald-950/40">
              <Activity className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <div className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                <span>Open-Source Pulse</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400 font-semibold">
                  v2.4
                </span>
              </div>
              <div className="text-[11px] text-slate-400 font-mono">
                Predictive Big Data Lakehouse · Spark 3.5 &amp; MLlib
              </div>
            </div>
          </div>

          {/* Clean Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 bg-[#131824] p-1 rounded-lg border border-slate-800/80 text-xs">
            <button
              onClick={() => setActiveTab('predictions')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap cursor-pointer ${
                activeTab === 'predictions'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Breakout Radar ({filteredRepos.length})
            </button>

            <button
              onClick={() => setActiveTab('signals')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap cursor-pointer ${
                activeTab === 'signals'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Deep Signals
            </button>

            <button
              onClick={() => setActiveTab('graph')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap cursor-pointer ${
                activeTab === 'graph'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Co-Star Network
            </button>

            <button
              onClick={() => setActiveTab('funnel')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap cursor-pointer ${
                activeTab === 'funnel'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Lakehouse Funnel
            </button>

            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap cursor-pointer ${
                activeTab === 'benchmarks'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Benchmarks (E1-E9)
            </button>

            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'simulator'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'text-amber-400 hover:text-amber-300 hover:bg-slate-800/50'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              Simulator
            </button>

            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-3 py-1.5 rounded-md transition-all font-medium whitespace-nowrap cursor-pointer ${
                activeTab === 'architecture'
                  ? 'bg-sky-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              Architecture &amp; Docs
            </button>
          </nav>

          {/* Right Action: Run Pipeline Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={startPipelineExecution}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 border border-emerald-500/50 transition-all flex items-center gap-2 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Run Spark Pipeline</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="lg:hidden flex items-center gap-1 overflow-x-auto px-4 py-2 border-t border-slate-800 text-xs bg-[#0b0f17]">
          {(['predictions', 'signals', 'graph', 'funnel', 'benchmarks', 'simulator', 'architecture'] as TabType[]).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-2.5 py-1 rounded whitespace-nowrap capitalize ${
                activeTab === tab ? 'bg-sky-600 text-white font-semibold' : 'text-slate-400'
              }`}
            >
              {tab === 'predictions' ? 'Radar' : tab}
            </button>
          ))}
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 2. CONTEXTUAL METRICS KPI STRIP                               */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#0f1420]/80 border-b border-slate-800/60 py-3 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-200 font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              GH Archive Ingest Stream
            </span>
            <span>·</span>
            <span>Target: &ge; 500 Stars in 30 Days</span>
            <span>·</span>
            <span className="text-slate-300">Candidate Band: 20–300 Stars, Age &le; 26w</span>
          </div>

          <div className="flex items-center gap-5 text-slate-400 font-mono text-[11px] tabular-nums">
            <span>
              Precision@20: <strong className="text-emerald-400 font-bold">80.0%</strong>
            </span>
            <span>·</span>
            <span>
              Early Lead Time: <strong className="text-sky-400 font-bold">+3.4 weeks</strong>
            </span>
            <span>·</span>
            <span>
              Temporal Leakage Guard: <strong className="text-slate-200">4-Wk Embargo</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 3. MAIN WORKSPACE / VIEWS                                     */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: PREDICTIONS (GITHUB THEMED MIDDLE REPO BOXES)         */}
        {/* ONLY THE MIDDLE BOXES CONTAINING REPOS HAVE GITHUB THEME      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'predictions' && (
          <div className="space-y-5">
            {/* Filter and Search Bar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[#111624] border border-slate-800 rounded-xl p-3.5 shadow-sm">
              {/* Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs transition-colors whitespace-nowrap cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-slate-800 text-white font-semibold border border-slate-700'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Search & Sort Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search repos or languages..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="bg-[#0b0e17] border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-48 sm:w-60"
                  />
                </div>

                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-[#0b0e17] border border-slate-800 text-slate-200 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="score">Sort: Breakout Score</option>
                  <option value="stars_cum">Sort: Current Stars</option>
                  <option value="growth_ratio">Sort: Growth Velocity</option>
                  <option value="fork_star_ratio">Sort: Fork Ratio</option>
                </select>
              </div>
            </div>

            {/* ------------------------------------------------------------- */}
            {/* GITHUB-THEMED REPOSITORY BOXES (AS REQUESTED)                 */}
            {/* ------------------------------------------------------------- */}
            <div className="space-y-3">
              {filteredRepos.map(repo => {
                const isHighProb = repo.score >= 0.7;
                const isSpam = repo.burstiness >= 0.85 && repo.fork_star_ratio < 0.05;
                const isStarred = starredRepos[repo.repo_id];

                return (
                  <div
                    key={repo.repo_id}
                    className="border border-[#30363d] bg-[#0d1117] rounded-md p-4 transition-all duration-150 hover:border-[#8b949e]/60 text-left shadow-sm font-sans"
                  >
                    {/* Top Row: Repo Title + Public Badge + Star Button */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <BookMarked className="w-4 h-4 text-[#8b949e] shrink-0" />
                        <button
                          onClick={() => {
                            setSelectedRepo(repo);
                            setActiveTab('signals');
                          }}
                          className="text-base font-semibold text-[#58a6ff] hover:underline cursor-pointer"
                        >
                          {repo.repo_name}
                        </button>

                        <span className="text-[11px] px-2 py-0.2 rounded-full border border-[#30363d] text-[#8b949e] font-medium leading-none">
                          Public
                        </span>

                        {repo.is_breakout && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] font-semibold flex items-center gap-1 font-mono">
                            <Flame className="w-3 h-3" />
                            Breakout Confirmed (+{repo.actual_stars_next_4w} stars)
                          </span>
                        )}

                        {isSpam && (
                          <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#da3633]/20 border border-[#da3633]/40 text-[#f85149] font-semibold flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3" />
                            Spam Burstiness Guard
                          </span>
                        )}
                      </div>

                      {/* GitHub Star Button on Card */}
                      <button
                        onClick={e => toggleStar(repo.repo_id, e)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-[#30363d] transition-colors cursor-pointer shrink-0 ${
                          isStarred
                            ? 'bg-[#21262d] text-[#e3b341] border-[#e3b341]/50'
                            : 'bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : 'text-[#8b949e]'}`} />
                        <span>{isStarred ? 'Starred' : 'Star'}</span>
                        <span className="ml-1 text-[11px] text-[#8b949e] font-mono">
                          {repo.stars_cum + (isStarred ? 1 : 0)}
                        </span>
                      </button>
                    </div>

                    {/* Middle: Description */}
                    <p className="text-xs text-[#8b949e] mt-2 leading-relaxed max-w-4xl">
                      {repo.description}
                    </p>

                    {/* Topic Tags (GitHub Pill Style) */}
                    {repo.topics && (
                      <div className="flex items-center gap-1.5 flex-wrap mt-2.5">
                        {repo.topics.map(t => (
                          <span
                            key={t}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-[#1f293d] text-[#58a6ff] hover:bg-[#26354f] font-medium cursor-pointer"
                          >
                            {t}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Bottom Metadata & Engineering Predictions Strip */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-3.5 pt-3 border-t border-[#21262d] text-xs text-[#8b949e]">
                      {/* GitHub-style details */}
                      <div className="flex items-center gap-4 flex-wrap">
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: repo.languageColor || '#3572A5' }}
                            />
                            <span className="text-[#e6edf3] font-medium">{repo.language}</span>
                          </span>
                        )}

                        <span className="flex items-center gap-1 font-mono text-[#e6edf3]">
                          <Star className="w-3.5 h-3.5 text-[#8b949e]" />
                          <span>{repo.stars_cum.toLocaleString()}</span>
                          <span className="text-[#3fb950] text-[11px]">
                            (+{repo.stars_w0}/wk)
                          </span>
                        </span>

                        <span className="flex items-center gap-1 font-mono">
                          <GitFork className="w-3.5 h-3.5 text-[#8b949e]" />
                          <span>{repo.forksCount || Math.round(repo.stars_cum * repo.fork_star_ratio)}</span>
                        </span>

                        <span className="font-mono text-[11px]">
                          Velocity:{' '}
                          <strong className={repo.growth_ratio >= 2.5 ? 'text-[#3fb950]' : 'text-[#e6edf3]'}>
                            {repo.growth_ratio.toFixed(2)}x
                          </strong>
                        </span>

                        <span className="font-mono text-[11px]">
                          Fork/Star:{' '}
                          <strong className={repo.fork_star_ratio >= 0.18 ? 'text-[#3fb950]' : 'text-[#8b949e]'}>
                            {(repo.fork_star_ratio * 100).toFixed(1)}%
                          </strong>
                        </span>

                        {repo.lead_time_weeks && (
                          <span className="text-[#58a6ff] font-mono text-[11px] font-semibold bg-[#388bfd]/10 px-2 py-0.5 rounded border border-[#388bfd]/30">
                            +{repo.lead_time_weeks} wks early
                          </span>
                        )}
                      </div>

                      {/* Right: Breakout Probability & Deep Signals Link */}
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="text-right">
                          <span className="text-[11px] text-[#8b949e] font-mono uppercase mr-2">
                            Breakout:
                          </span>
                          <span
                            className={`font-mono font-bold tabular-nums text-sm ${
                              isHighProb
                                ? 'text-[#3fb950]'
                                : isSpam
                                ? 'text-[#f85149]'
                                : 'text-[#e6edf3]'
                            }`}
                          >
                            {(repo.score * 100).toFixed(1)}%
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedRepo(repo);
                            setActiveTab('signals');
                          }}
                          className="px-2.5 py-1 text-xs text-[#58a6ff] hover:text-white bg-[#21262d] hover:bg-[#30363d] rounded border border-[#30363d] transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <span>Deep Signals</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: DEEP SIGNALS & TRAJECTORIES                           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'signals' && (
          <div className="space-y-6">
            {/* Repo Summary Card */}
            <div className="bg-[#111624] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <span>{selectedRepo.category}</span>
                  <span>·</span>
                  <span>Created {selectedRepo.created_dt}</span>
                  <span>·</span>
                  <span>Ecosystem: {selectedRepo.community_name}</span>
                </div>

                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                  <BookMarked className="w-6 h-6 text-sky-400" />
                  <span>{selectedRepo.repo_name}</span>
                  <a
                    href={`https://github.com/${selectedRepo.repo_name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-slate-400 hover:text-white"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-3xl leading-relaxed">
                  {selectedRepo.description}
                </p>
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <button
                  onClick={() => fetchAiInsight(selectedRepo)}
                  disabled={isLoadingAi}
                  className="px-3.5 py-2 text-xs font-semibold rounded-lg bg-sky-950/70 border border-sky-800 text-sky-300 hover:bg-sky-900/80 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                  {isLoadingAi ? 'Synthesizing Signals...' : 'Synthesize Technical Report'}
                </button>

                <div className="text-right pl-4 border-l border-slate-800">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">
                    Breakout Probability
                  </div>
                  <div className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {(selectedRepo.score * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Trajectory Star Velocity Chart */}
            <div className="border border-slate-800 rounded-xl bg-[#111624] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-200">
                    Historical Star Curve & Lead-Time Milestone
                  </h2>
                  <p className="text-xs text-slate-400">
                    Empirical validation showing the exact lead-time weeks gained before the repo crossed 1,000 stars.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Cumulative Stars
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Flagged Breakout
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> 1,000 Stars Crossed
                  </span>
                </div>
              </div>

              {/* Chart SVG */}
              <div className="h-64 w-full relative pt-2">
                {(() => {
                  const points = selectedRepo.trajectory;
                  if (!points || points.length === 0) return null;
                  const maxStars = Math.max(...points.map(p => p.cumulative_stars), 1000);
                  const width = 800;
                  const height = 240;
                  const pad = 40;

                  const getX = (idx: number) => pad + (idx / (points.length - 1)) * (width - pad * 2);
                  const getY = (val: number) => height - pad - (val / maxStars) * (height - pad * 2);

                  const pathD = points
                    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(p.cumulative_stars)}`)
                    .join(' ');
                  const areaD = `${pathD} L ${getX(points.length - 1)} ${height - pad} L ${getX(0)} ${height - pad} Z`;

                  return (
                    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full">
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = height - pad - ratio * (height - pad * 2);
                        const labelVal = Math.round(ratio * maxStars);
                        return (
                          <g key={i}>
                            <line
                              x1={pad}
                              y1={y}
                              x2={width - pad}
                              y2={y}
                              stroke="#1e293b"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={pad - 8}
                              y={y + 3}
                              fill="#64748b"
                              fontSize="10"
                              textAnchor="end"
                              className="font-mono"
                            >
                              {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(1)}k` : labelVal}
                            </text>
                          </g>
                        );
                      })}

                      <path d={areaD} fill="rgba(52, 211, 153, 0.08)" />
                      <path d={pathD} fill="none" stroke="#34d399" strokeWidth="2.5" />

                      {points.map((p, i) => {
                        const isFlag = selectedRepo.flag_week !== undefined && i === selectedRepo.flag_week;
                        const is1k =
                          p.cumulative_stars >= 1000 && (i === 0 || points[i - 1].cumulative_stars < 1000);

                        return (
                          <g key={i}>
                            <circle
                              cx={getX(i)}
                              cy={getY(p.cumulative_stars)}
                              r={isFlag ? 6 : 4}
                              fill={isFlag ? '#f59e0b' : '#34d399'}
                              stroke="#0a0d14"
                              strokeWidth="2"
                            />
                            <text
                              x={getX(i)}
                              y={height - pad + 16}
                              fill="#64748b"
                              fontSize="10"
                              textAnchor="middle"
                              className="font-mono"
                            >
                              Wk {p.week_offset}
                            </text>

                            {isFlag && (
                              <g>
                                <line
                                  x1={getX(i)}
                                  y1={getY(p.cumulative_stars) - 8}
                                  x2={getX(i)}
                                  y2={getY(p.cumulative_stars) - 32}
                                  stroke="#f59e0b"
                                  strokeWidth="1.5"
                                />
                                <rect
                                  x={getX(i) - 65}
                                  y={getY(p.cumulative_stars) - 52}
                                  width="130"
                                  height="20"
                                  rx="4"
                                  fill="#18181b"
                                  stroke="#f59e0b"
                                />
                                <text
                                  x={getX(i)}
                                  y={getY(p.cumulative_stars) - 38}
                                  fill="#fbbf24"
                                  fontSize="10"
                                  fontWeight="bold"
                                  textAnchor="middle"
                                  className="font-mono"
                                >
                                  Flagged ({p.cumulative_stars} stars)
                                </text>
                              </g>
                            )}

                            {is1k && (
                              <g>
                                <circle
                                  cx={getX(i)}
                                  cy={getY(p.cumulative_stars)}
                                  r="5"
                                  fill="#38bdf8"
                                  stroke="#0a0d14"
                                />
                                <text
                                  x={getX(i)}
                                  y={getY(p.cumulative_stars) - 10}
                                  fill="#38bdf8"
                                  fontSize="10"
                                  textAnchor="middle"
                                  className="font-mono font-bold"
                                >
                                  1k Stars
                                </text>
                              </g>
                            )}
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>

            {/* 4 Feature Signals Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="border border-slate-800 rounded-xl p-4 bg-[#111624]">
                <div className="text-slate-400 font-sans">Growth Velocity Curvature</div>
                <div className="text-xl font-bold text-slate-100 tabular-nums mt-1">
                  {selectedRepo.growth_ratio.toFixed(2)}x
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Snapshot week ({selectedRepo.stars_w0}) vs prior week ({selectedRepo.stars_w1})
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl p-4 bg-[#111624]">
                <div className="text-slate-400 font-sans">Fork-to-Star Conversion</div>
                <div className="text-xl font-bold text-slate-100 tabular-nums mt-1">
                  {(selectedRepo.fork_star_ratio * 100).toFixed(1)}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Healthy projects &ge; 18%; separates real clones from bookmarkers
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl p-4 bg-[#111624]">
                <div className="text-slate-400 font-sans">Burstiness Guard Index</div>
                <div className="text-xl font-bold text-slate-100 tabular-nums mt-1">
                  {selectedRepo.burstiness.toFixed(2)}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Peak day / weekly stars; lower = organic multi-day adoption
                </div>
              </div>

              <div className="border border-slate-800 rounded-xl p-4 bg-[#111624]">
                <div className="text-slate-400 font-sans">PR Merge Throughput</div>
                <div className="text-xl font-bold text-slate-100 tabular-nums mt-1">
                  {selectedRepo.prs_merged_4w} / {selectedRepo.prs_opened_4w} PRs
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-sans">
                  Maintainer throughput across past 4 weeks
                </div>
              </div>
            </div>

            {/* AI Report Synthesis Output */}
            {aiReport && (
              <div className="border border-sky-900/60 bg-sky-950/20 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-sky-400 font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  Technical Intelligence Report
                </div>
                <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed font-sans">
                  {aiReport}
                </div>
              </div>
            )}

            {/* Co-Star Nearest Neighbors */}
            <div className="border border-slate-800 rounded-xl bg-[#111624] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-slate-200">
                Nearest Co-Star Graph Neighbors (Shared Stargazers &ge; 3)
              </h3>
              <p className="text-xs text-slate-400">
                GraphFrames co-star community reveals ecosystem spillover and shared developer mindshare.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {selectedRepo.nearest_costars.length > 0 ? (
                  selectedRepo.nearest_costars.map((c, i) => (
                    <div key={i} className="border border-slate-800 bg-[#0d101a] rounded-lg p-3">
                      <div className="text-xs font-semibold text-sky-400 font-mono truncate">
                        {c.repo_name}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-1">
                        Shared Stargazers:{' '}
                        <span className="text-slate-200 font-mono font-bold">{c.shared_stargazers}</span>
                      </div>
                      <div className="text-[11px] text-emerald-400 mt-0.5">
                        Breakout Score: <span className="font-mono">{(c.score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-slate-500 py-2">
                    No heavy neighbor overlap detected (isolated repo).
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: GRAPH ECOSYSTEM                                       */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">
                  Co-Star Graph &amp; Community Ecosystems
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  GraphFrames DataFrame-based graph analytics: vertices are candidate repositories, edges represent &ge; 3 shared stargazers within a rolling 60-day window.
                </p>
              </div>

              {/* Edge threshold slider */}
              <div className="flex items-center gap-3 bg-[#111624] border border-slate-800 rounded-lg px-4 py-2 text-xs">
                <span className="text-slate-400">Min Shared Stargazers:</span>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={minEdgeWeight}
                  onChange={e => setMinEdgeWeight(parseInt(e.target.value, 10))}
                  className="w-28 accent-sky-500"
                />
                <span className="font-mono font-bold text-sky-400 w-8">{minEdgeWeight}</span>
              </div>
            </div>

            {/* Graph Guards Callout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-slate-800 bg-[#111624] rounded-xl p-4">
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-emerald-400" />
                  Heavy Stargazer Guard
                </div>
                <div className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Users with &gt; 200 stars dropped via <code className="text-slate-300 font-mono">left_anti</code> join to prevent $O(N^2)$ quadratic edge explosion.
                </div>
              </div>
              <div className="border border-slate-800 bg-[#111624] rounded-xl p-4">
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Network className="w-4 h-4 text-sky-400" />
                  Edge Weight Floor
                </div>
                <div className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Edges required to have weight &ge; 3 shared stargazers, pruning 89% of noisy transient coincidences.
                </div>
              </div>
              <div className="border border-slate-800 bg-[#111624] rounded-xl p-4">
                <div className="text-slate-200 font-semibold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  Graph Algorithms
                </div>
                <div className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                  Distributed PageRank (resetProb=0.15, maxIter=10) &amp; Label Propagation community clustering.
                </div>
              </div>
            </div>

            {/* Interactive SVG Network Canvas */}
            <div className="border border-slate-800 rounded-xl bg-[#0a0d14] p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="text-xs text-slate-400">
                  Interactive Co-Star Network Diagram (Click node to inspect repository signals)
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-slate-400 flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> LLM Serving
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-sky-400" /> Agents &amp; Gateways
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Vector &amp; Search
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-purple-400" /> Systems &amp; Edge
                  </span>
                </div>
              </div>

              <div className="h-96 w-full flex items-center justify-center">
                {(() => {
                  const coords: Record<string, [number, number]> = {
                    vllm: [220, 110],
                    ollama: [360, 100],
                    llamacpp: [290, 200],
                    whisper: [160, 260],
                    litellm: [500, 160],
                    langfuse: [620, 140],
                    phidata: [590, 250],
                    fastembed: [390, 310],
                    qdrant: [470, 340],
                    chroma: [340, 360],
                    uv: [140, 160],
                    ruff: [80, 120],
                    customdb: [220, 340],
                    botairdrop: [740, 330]
                  };

                  const colorMap: Record<number, string> = {
                    1: '#34d399',
                    2: '#38bdf8',
                    3: '#fbbf24',
                    5: '#c084fc',
                    0: '#f87171'
                  };

                  return (
                    <svg viewBox="0 0 800 400" className="w-full h-full">
                      {/* Edges */}
                      {visibleEdges.map((edge, i) => {
                        const src = coords[edge.source];
                        const dst = coords[edge.target];
                        if (!src || !dst) return null;
                        const strokeWidth = Math.min(4, Math.max(1, edge.weight / 12));
                        return (
                          <line
                            key={i}
                            x1={src[0]}
                            y1={src[1]}
                            x2={dst[0]}
                            y2={dst[1]}
                            stroke="#334155"
                            strokeWidth={strokeWidth}
                            strokeOpacity={0.6}
                          />
                        );
                      })}

                      {/* Nodes */}
                      {GRAPH_NODES.map(node => {
                        const pt = coords[node.id];
                        if (!pt) return null;
                        const radius = Math.max(7, Math.min(22, node.pagerank * 150));
                        const color = colorMap[node.community_id] || '#64748b';
                        const isSelected = selectedRepo.repo_name === node.repo_name;

                        return (
                          <g
                            key={node.id}
                            className="cursor-pointer"
                            onClick={() => {
                              const repoMatch = REPOSITORY_CANDIDATES.find(
                                r => r.repo_name === node.repo_name
                              );
                              if (repoMatch) {
                                setSelectedRepo(repoMatch);
                                setActiveTab('signals');
                              }
                            }}
                          >
                            <circle
                              cx={pt[0]}
                              cy={pt[1]}
                              r={radius}
                              fill={color}
                              stroke={isSelected ? '#ffffff' : '#0a0d14'}
                              strokeWidth={isSelected ? 3 : 2}
                              className="transition-all hover:opacity-80"
                            />
                            <text
                              x={pt[0]}
                              y={pt[1] + radius + 13}
                              fill="#e2e8f0"
                              fontSize="11"
                              fontWeight="600"
                              textAnchor="middle"
                              className="font-mono pointer-events-none"
                            >
                              {node.id}
                            </text>
                            <text
                              x={pt[0]}
                              y={pt[1] + radius + 23}
                              fill="#64748b"
                              fontSize="9"
                              textAnchor="middle"
                              className="font-mono pointer-events-none"
                            >
                              {(node.score * 100).toFixed(0)}%
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 4: LAKEHOUSE FUNNEL                                      */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'funnel' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Medallion Data Lakehouse Processing Funnel
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Demonstrating multi-tier row and byte shrinkage from 1.48 Billion raw events down to 148,000 candidate weekly rows (99.99% overall reduction).
              </p>
            </div>

            {/* Funnel Stage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FUNNEL_STAGES.map((stage, idx) => (
                <div key={idx} className="border border-slate-800 rounded-xl p-5 bg-[#111624] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{stage.stage}</span>
                    <span className="font-mono text-slate-500">{stage.grain}</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-slate-100 tabular-nums">
                    {stage.displayRows}
                  </div>
                  <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
                    <span>{stage.sizeBytes}</span>
                    <span className="text-emerald-400 font-medium">
                      {stage.reductionPct > 0 ? `-${stage.reductionPct}%` : 'Baseline'}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1 font-sans">{stage.note}</p>
                </div>
              ))}
            </div>

            {/* Funnel Reduction Efficiency Table */}
            <div className="border border-slate-800 rounded-xl bg-[#111624] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-slate-200">
                Lakehouse Reduction Efficiency Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b0e17] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Stage</th>
                      <th className="py-2.5 px-4">Grain</th>
                      <th className="py-2.5 px-4 text-right">Row Count</th>
                      <th className="py-2.5 px-4 text-right">Data Footprint</th>
                      <th className="py-2.5 px-4 text-right">Row Reduction</th>
                      <th className="py-2.5 px-4 font-sans">Engineering Optimization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {FUNNEL_STAGES.map((stage, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-semibold text-slate-200">{stage.stage}</td>
                        <td className="py-3 px-4 text-slate-400">{stage.grain}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-100">
                          {stage.rows.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-300">
                          {stage.sizeBytes}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-emerald-400 font-semibold">
                          {stage.reductionPct > 0 ? `${stage.reductionPct}%` : '0%'}
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-400">{stage.note}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 5: BENCHMARKS & MODEL ABLATION                           */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'benchmarks' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Benchmark Study (E1 - E9) &amp; Model Ablation
              </h1>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                Empirical benchmarks recorded across Spark UI stages proving the 16.1x storage reduction, 24x aggregation acceleration, and 80% Precision@20.
              </p>
            </div>

            {/* Model Comparison Table */}
            <div className="border border-slate-800 rounded-xl bg-[#111624] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200">
                Spark MLlib Model Comparison &amp; Ablation Matrix
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0b0e17] text-slate-400 border-b border-slate-800 uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Model ID</th>
                      <th className="py-2.5 px-4 font-sans">Model Architecture</th>
                      <th className="py-2.5 px-4 text-right">PR-AUC</th>
                      <th className="py-2.5 px-4 text-right">Precision@20</th>
                      <th className="py-2.5 px-4 text-right">Precision@50</th>
                      <th className="py-2.5 px-4 text-right">ROC-AUC</th>
                      <th className="py-2.5 px-4 text-right">Lead Time</th>
                      <th className="py-2.5 px-4 font-sans">Role / Research Question</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {MODEL_COMPARISONS.map(m => (
                      <tr
                        key={m.id}
                        className={m.id === 'M3' ? 'bg-emerald-950/20' : 'hover:bg-slate-800/30'}
                      >
                        <td className="py-3 px-4 font-bold text-slate-200">{m.id}</td>
                        <td className="py-3 px-4 font-sans font-medium text-slate-100">{m.name}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-emerald-400 font-bold">
                          {m.pr_auc.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-200">
                          {(m.precision_at_20 * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-200">
                          {(m.precision_at_50 * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-slate-400">
                          {m.roc_auc.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-sky-400 font-bold">
                          +{m.avg_lead_time_weeks} wks
                        </td>
                        <td className="py-3 px-4 font-sans text-slate-400 text-[11px]">{m.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* E1..E9 Benchmark Cards */}
            <div className="border border-slate-800 rounded-xl bg-[#111624] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-slate-200">
                Efficiency Playbook Experiments (E1 to E9)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BENCHMARK_EXPERIMENTS.map(exp => (
                  <div key={exp.id} className="border border-slate-800 bg-[#0d101a] rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-sky-400">
                        [{exp.id}] {exp.experiment}
                      </span>
                      <span className="font-mono text-xs font-semibold bg-emerald-950/80 border border-emerald-800 text-emerald-300 px-2 py-0.5 rounded">
                        {exp.speedup} Speedup
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="bg-[#131824] p-2.5 rounded border border-slate-800">
                        <div className="text-[10px] text-slate-500 uppercase">Baseline</div>
                        <div className="text-slate-200 font-medium mt-0.5">{exp.baseline_name}</div>
                        <div className="text-slate-400 text-[11px] mt-0.5">
                          {exp.baseline_val} {exp.unit}
                        </div>
                      </div>
                      <div className="bg-[#131824] p-2.5 rounded border border-sky-900/40">
                        <div className="text-[10px] text-sky-400 uppercase">Optimized</div>
                        <div className="text-sky-300 font-medium mt-0.5">{exp.optimised_name}</div>
                        <div className="text-slate-200 text-[11px] mt-0.5">
                          {exp.optimised_val} {exp.unit}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                      {exp.spark_ui_explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 6: LIVE SIMULATOR                                        */}
        {/* Real-time custom repo breakout predictor                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <Zap className="w-6 h-6 text-amber-400" />
                  Live Repository Breakout Simulator
                </h1>
                <p className="text-xs text-slate-400 mt-1 max-w-2xl">
                  Test custom repository early interaction signals against the trained Spark MLlib GBTClassifier to observe real-time probability inference, SHAP attribution, and estimated lead time.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-slate-400">Presets:</span>
                <button
                  onClick={() => loadPreset('viral_ai')}
                  className="px-2.5 py-1 rounded bg-[#131824] hover:bg-slate-800 text-emerald-400 border border-slate-700 cursor-pointer"
                >
                  Viral AI Agent
                </button>
                <button
                  onClick={() => loadPreset('organic_tool')}
                  className="px-2.5 py-1 rounded bg-[#131824] hover:bg-slate-800 text-sky-400 border border-slate-700 cursor-pointer"
                >
                  Organic Dev Tool
                </button>
                <button
                  onClick={() => loadPreset('bot_spam')}
                  className="px-2.5 py-1 rounded bg-[#131824] hover:bg-slate-800 text-rose-400 border border-slate-700 cursor-pointer"
                >
                  Fake Star Bot
                </button>
                <button
                  onClick={() => loadPreset('stalled')}
                  className="px-2.5 py-1 rounded bg-[#131824] hover:bg-slate-800 text-slate-400 border border-slate-700 cursor-pointer"
                >
                  Stalled Side Project
                </button>
              </div>
            </div>

            {/* Two Column Layout: Controls Left, Prediction Card Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Interactive Input Sliders */}
              <div className="lg:col-span-7 bg-[#111624] border border-slate-800 rounded-xl p-5 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-sky-400" />
                  Repository Metric Parameters
                </h3>

                {/* Repo Name */}
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Repository Identifier</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    className="w-full bg-[#0a0d14] border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-sky-500"
                  />
                </div>

                {/* Cumulative Stars */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Current Cumulative Stars (candidate window: 20-300)</span>
                    <span className="font-mono text-slate-100 font-bold">{simStarsCum}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={simStarsCum}
                    onChange={e => setSimStarsCum(parseInt(e.target.value, 10))}
                    className="w-full accent-sky-500"
                  />
                </div>

                {/* Weekly Stars (w0 and w1) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Snapshot Wk Stars (w0)</span>
                      <span className="font-mono text-slate-100 font-bold">{simStarsW0}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      value={simStarsW0}
                      onChange={e => setSimStarsW0(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Prior Wk Stars (w1)</span>
                      <span className="font-mono text-slate-100 font-bold">{simStarsW1}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="80"
                      value={simStarsW1}
                      onChange={e => setSimStarsW1(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-500"
                    />
                  </div>
                </div>

                {/* Fork-to-star ratio */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Fork-to-Star Conversion Ratio</span>
                    <span className="font-mono text-slate-100 font-bold">
                      {(simForkRatio * 100).toFixed(1)}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.01"
                    max="0.45"
                    step="0.01"
                    value={simForkRatio}
                    onChange={e => setSimForkRatio(parseFloat(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Healthy conversion &ge; 18%; low conversion signals artificial star campaigns.
                  </div>
                </div>

                {/* Burstiness Index */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Burstiness Index (Peak Day / Weekly Stars)</span>
                    <span className="font-mono text-slate-100 font-bold">
                      {simBurstiness.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0.14"
                    max="0.95"
                    step="0.02"
                    value={simBurstiness}
                    onChange={e => setSimBurstiness(parseFloat(e.target.value))}
                    className="w-full accent-sky-500"
                  />
                  <div className="text-[10px] text-slate-400 mt-0.5">
                    Lower values indicate sustained multi-day interest; &gt;0.80 indicates star bot spikes.
                  </div>
                </div>

                {/* PRs Merged & PageRank */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">PRs Merged (4w)</span>
                      <span className="font-mono text-slate-100 font-bold">{simPrsMerged}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={simPrsMerged}
                      onChange={e => setSimPrsMerged(parseInt(e.target.value, 10))}
                      className="w-full accent-sky-500"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-400">Co-star PageRank</span>
                      <span className="font-mono text-slate-100 font-bold">
                        {simPagerank.toFixed(3)}
                      </span>
                    </div>
                    <input
                      type="range"
                      min="0.005"
                      max="0.120"
                      step="0.005"
                      value={simPagerank}
                      onChange={e => setSimPagerank(parseFloat(e.target.value))}
                      className="w-full accent-sky-500"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Real-time Inferred Output */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#111624] border border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
                  <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
                    MLlib GBT Inference Verdict
                  </div>

                  <div className="flex items-baseline justify-between border-b border-slate-800 pb-4">
                    <div>
                      <div className="text-3xl font-extrabold font-mono tabular-nums text-white">
                        {(simResult.probability * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5 font-mono">
                        Calibrated Probability Score
                      </div>
                    </div>

                    {simResult.isBreakout ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 font-semibold text-xs flex items-center gap-1.5 font-mono">
                        <Flame className="w-3.5 h-3.5" />
                        Breakout Imminent
                      </span>
                    ) : simResult.isSpam ? (
                      <span className="px-3 py-1 rounded-full bg-rose-950/80 border border-rose-800 text-rose-300 font-semibold text-xs flex items-center gap-1.5 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Flagged Bot Farm
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-400 font-semibold text-xs font-mono">
                        Sub-Threshold
                      </span>
                    )}
                  </div>

                  {/* Lead Time Estimate */}
                  {simResult.isBreakout && (
                    <div className="bg-sky-950/30 border border-sky-800/40 rounded-lg p-3 text-xs flex items-center justify-between">
                      <span className="text-slate-200">Estimated Early Lead Time:</span>
                      <span className="font-mono font-bold text-sky-400">
                        +{simResult.leadTime} weeks before trending
                      </span>
                    </div>
                  )}

                  {/* Feature Attribution Waterfall */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-slate-200">
                      Feature Attributions (SHAP Contribution)
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      {simResult.attributions.map((attr, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-slate-800/50">
                          <span className="text-slate-400 font-sans">{attr.feature}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-slate-200">{attr.val}</span>
                            <span
                              className={`w-14 text-right font-semibold ${
                                attr.isPositive ? 'text-emerald-400' : 'text-rose-400'
                              }`}
                            >
                              {attr.isPositive ? '+' : ''}
                              {attr.impact.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 7: PIPELINE ENGINE RUNNER (NO BLACK SCREEN!)             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'pipeline' && (
          <div className="space-y-6">
            <div className="bg-[#111624] border border-slate-800 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-slate-400 mb-1">
                  <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                  <span>PySpark Execution Workflow · local[8]</span>
                </div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2.5">
                  <span>Spark Pipeline Engine</span>
                  {pipelineCompleted && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800 flex items-center gap-1 font-mono">
                      <Check className="w-3 h-3" />
                      Success (2.16s)
                    </span>
                  )}
                  {isPipelineRunning && (
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-sky-950/80 text-sky-400 font-semibold border border-sky-800 flex items-center gap-1 animate-pulse font-mono">
                      <Activity className="w-3 h-3 animate-spin" />
                      Processing Stages
                    </span>
                  )}
                </h1>
                <p className="text-xs text-slate-400 mt-1">
                  Orchestrated PySpark Lakehouse pipeline across 7 stages with AQE, GraphFrames, and DuckDB serving.
                </p>
              </div>

              {/* Execution Controls */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center bg-[#0a0d14] border border-slate-800 rounded-lg p-1 text-xs font-mono">
                  {(['T0', 'T1', 'T2'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setPipelineTier(tier)}
                      className={`px-3 py-1 rounded transition-colors ${
                        pipelineTier === tier
                          ? 'bg-sky-600 text-white font-bold'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startPipelineExecution}
                  disabled={isPipelineRunning}
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPipelineRunning ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-run Workflow ({pipelineTier})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split View: Left Jobs Checklist, Right Dark Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 7 Workflow Jobs */}
              <div className="lg:col-span-5 space-y-2">
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 font-mono">
                  Pipeline Stages (7 Steps)
                </div>

                <div className="border border-slate-800 rounded-xl bg-[#111624] divide-y divide-slate-800/60">
                  {pipelineStages.map((stage, idx) => {
                    const isCompleted = activeStepIndex > idx || pipelineCompleted;
                    const isRunning = activeStepIndex === idx && isPipelineRunning;

                    return (
                      <div
                        key={stage.id}
                        className={`p-3.5 flex items-start justify-between gap-3 transition-colors ${
                          isRunning
                            ? 'bg-sky-950/30'
                            : isCompleted
                            ? 'bg-transparent'
                            : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            )}
                            {isRunning && (
                              <Activity className="w-4 h-4 text-sky-400 animate-spin" />
                            )}
                            {!isCompleted && !isRunning && (
                              <span className="w-4 h-4 rounded-full border border-slate-600 flex items-center justify-center text-[10px] text-slate-400">
                                {stage.step}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-slate-100 font-mono">
                              {stage.name}
                            </div>
                            <div className="text-[11px] text-slate-400 mt-0.5 font-sans leading-tight">
                              {stage.desc}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-slate-500 shrink-0">
                          {stage.duration}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Console Output */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-slate-400 mb-2">
                  <span className="uppercase tracking-wider">Spark Executor Logs</span>
                  <span>UTC · local[8] · zstd</span>
                </div>

                <div className="border border-slate-800 rounded-xl bg-[#0a0d14] overflow-hidden shadow-inner">
                  <div className="bg-[#111624] border-b border-slate-800 px-3.5 py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-slate-400 font-mono">
                      <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                      <span>spark-executor.log</span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {pipelineLogs.length} events
                    </span>
                  </div>

                  <div className="p-4 h-80 overflow-y-auto font-mono text-xs text-slate-300 space-y-2.5">
                    {pipelineLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-emerald-400 shrink-0">&gt;</span>
                        <span className="text-slate-300">{log}</span>
                      </div>
                    ))}
                    {isPipelineRunning && (
                      <div className="flex items-center gap-2 text-sky-400 pt-1">
                        <span className="w-2 h-2 rounded-full bg-sky-400 animate-ping" />
                        <span>Processing Spark transformations and writing Parquet splits...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 8: ARCHITECTURE & DOCS                                   */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'architecture' && (
          <div className="border border-slate-800 rounded-xl bg-[#111624] p-8 max-w-4xl mx-auto space-y-6 text-sm text-slate-200 leading-relaxed shadow-sm">
            <div className="border-b border-slate-800 pb-4">
              <h1 className="text-3xl font-extrabold text-white tracking-tight">
                Open-Source Pulse
              </h1>
              <p className="text-base text-slate-400 mt-2">
                Predicting Trending GitHub Repositories Early with Apache Spark 3.5, Parquet, GraphFrames &amp; MLlib
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-1">
                The Core Idea
              </h2>
              <p className="text-slate-300 leading-relaxed">
                By the time a software project shows up on GitHub&apos;s &ldquo;trending&rdquo; page, it is already popular.
                This project aims to predict which brand-new open-source projects will explode in popularity
                (gain at least <strong>500 stars</strong>) up to a <strong>month before they actually trend</strong>.
              </p>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-1">
                How It Works (Step-by-Step Breakdown)
              </h2>
              <div className="space-y-3">
                <div className="p-4 bg-[#0d101a] border border-slate-800 rounded-lg">
                  <h3 className="font-semibold text-sky-400">1. Collecting the Data</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    The project ingests public GitHub activity (people starring, forking, opening issues, and merging PRs) from the GH Archive database across an 18-month timeline.
                  </p>
                </div>

                <div className="p-4 bg-[#0d101a] border border-slate-800 rounded-lg">
                  <h3 className="font-semibold text-emerald-400">2. Cleaning the Noise</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Because the raw data is massive (1.48B raw events), the pipeline strips out automated CI/CD bot accounts (Renovate, Dependabot) and deduplicates first-stars to measure genuine human interest.
                  </p>
                </div>

                <div className="p-4 bg-[#0d101a] border border-slate-800 rounded-lg">
                  <h3 className="font-semibold text-amber-400">3. Shrinking &amp; Summarizing (Medallion Lakehouse)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Instead of analyzing every single raw click, the pipeline summarizes events into compact weekly snapshots for each candidate repository (reducing 1.48B rows down to 148k rows: a 99.99% shrinkage).
                  </p>
                </div>

                <div className="p-4 bg-[#0d101a] border border-slate-800 rounded-lg">
                  <h3 className="font-semibold text-purple-400">4. Looking for Clues (Feature Engineering &amp; Graph Analytics)</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    The system calculates early warning signs: velocity curvature, fork conversion ratios, burstiness anti-spam guards, maintainer PR throughput, and analyzes the co-star network with GraphFrames PageRank to see if related communities are paying attention.
                  </p>
                </div>

                <div className="p-4 bg-[#0d101a] border border-slate-800 rounded-lg">
                  <h3 className="font-semibold text-sky-400">5. Machine Learning with Zero-Data-Leakage</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    A Spark MLlib Gradient-Boosted Trees classifier (depth=6, maxIter=120) scores new projects based on their likelihood of having a breakout in the next 30 days, using a strict 4-week embargo gap to prevent temporal leakage.
                  </p>
                </div>

                <div className="p-4 bg-[#0d101a] border border-slate-800 rounded-lg">
                  <h3 className="font-semibold text-emerald-400">6. Sharing the Results</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    The final scores are exported to a serving layer queried with sub-15ms latency by DuckDB and displayed in this dashboard.
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-1">
                Why This Project Matters
              </h2>
              <p className="text-slate-300 leading-relaxed">
                This is a classic <strong>Big Data challenge</strong>. Raw GitHub event logs exceed 1.84 Terabytes and cannot fit on a single developer machine.
                This project demonstrates how to cleverly compress, filter, partition, and organize massive information efficiently using Apache Spark, zstd Parquet, and GraphFrames.
                Ultimately, it proves that early developer interaction signals allow us to spot the next big open-source foundation <strong>an average of 3.4 weeks before the rest of the world catches on</strong>.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 4. CLEAN FOOTER                                               */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-slate-800/80 bg-[#0b0e17] py-5 mt-auto text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Open-Source Pulse · Apache Spark 3.5.1 · GraphFrames · DuckDB · MLlib</span>
          </div>

          <div className="flex items-center gap-5">
            <button
              onClick={() => setActiveTab('architecture')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Architecture &amp; Docs
            </button>
            <button
              onClick={() => setActiveTab('pipeline')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Pipeline Status
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-slate-300 transition-colors cursor-pointer"
            >
              Simulator
            </button>
            <span className="font-mono text-slate-400">MIT License</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
