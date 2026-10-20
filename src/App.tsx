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
  Eye,
  Sliders,
  FileText,
  Check,
  Flame,
  ArrowRight,
  TrendingUp,
  AlertTriangle,
  Info,
  Calendar,
  Code2
} from 'lucide-react';
import {
  REPOSITORY_CANDIDATES,
  FUNNEL_STAGES,
  BENCHMARK_EXPERIMENTS,
  MODEL_COMPARISONS,
  GRAPH_NODES,
  GRAPH_EDGES,
  RepoSnapshot,
  GraphNode
} from './data/pulseData';

type TabType =
  | 'repositories'
  | 'intelligence'
  | 'graph'
  | 'funnel'
  | 'benchmarks'
  | 'actions'
  | 'simulator'
  | 'readme';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('repositories');
  const [selectedRepo, setSelectedRepo] = useState<RepoSnapshot>(REPOSITORY_CANDIDATES[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'score' | 'stars_cum' | 'growth_ratio' | 'fork_star_ratio'>('score');
  const [sortAsc, setSortAsc] = useState(false);

  // Starred repos local state
  const [starredRepos, setStarredRepos] = useState<Record<number, boolean>>({});
  const toggleStar = (id: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setStarredRepos(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // Graph state
  const [minEdgeWeight, setMinEdgeWeight] = useState(15);

  // Pipeline Actions runner execution state
  const [pipelineTier, setPipelineTier] = useState<'T0' | 'T1' | 'T2'>('T0');
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [activeStepIndex, setActiveStepIndex] = useState(-1);
  const [pipelineCompleted, setPipelineCompleted] = useState(true);
  const [pipelineLogs, setPipelineLogs] = useState<string[]>([
    '[2024-03-15T08:00:00Z] Pipeline initialized: workflow_dispatch triggered on runner local[8]',
    '[2024-03-15T08:00:01Z] Spark 3.5.1 session active with driver-memory=12g, AQE=true, codec=zstd',
    '[2024-03-15T08:00:01Z] Phase 1: Downloaded and verified 24 hourly GH Archive .json.gz segments',
    '[2024-03-15T08:00:02Z] Phase 2: Bronze Parquet partitioned by dt. Filtered 6 event types (Watch, Fork, Create, PR, Issue, Push)',
    '[2024-03-15T08:00:02Z] Phase 3: Silver bot filter removed automated runners; first-star deduplication applied',
    '[2024-03-15T08:00:03Z] Phase 4: Gold repo-day aggregation collapsed 342M events to 8.42M rows (99.4% reduction)',
    '[2024-03-15T08:00:03Z] Phase 7: GraphFrames co-star graph computed with degree-cap guard (>200 stars dropped)',
    '[2024-03-15T08:00:04Z] Phase 8: MLlib GBTClassifier evaluated (PR-AUC: 0.614, Precision@20: 80.0%, 3.4 wk lead time)',
    '[2024-03-15T08:00:04Z] Phase 10: Serving scores written to data/serving/scores/*.parquet; sub-15ms DuckDB queries ready'
  ]);

  // AI intelligence state
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isLoadingAi, setIsLoadingAi] = useState(false);

  // Interactive Live Simulator state
  const [simName, setSimName] = useState('my-org/next-gen-agent');
  const [simStarsCum, setSimStarsCum] = useState(140);
  const [simStarsW0, setSimStarsW0] = useState(72);
  const [simStarsW1, setSimStarsW1] = useState(18);
  const [simForkRatio, setSimForkRatio] = useState(0.24);
  const [simBurstiness, setSimBurstiness] = useState(0.21);
  const [simPrsMerged, setSimPrsMerged] = useState(26);
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

  // Pipeline stages definition for the Actions workflow DAG
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

  // Execute pipeline runner in Actions view
  const startPipelineExecution = () => {
    setActiveTab('actions');
    setIsPipelineRunning(true);
    setPipelineCompleted(false);
    setActiveStepIndex(0);
    const nowIso = new Date().toISOString();
    setPipelineLogs([
      `[${nowIso}] Triggering GitHub Actions workflow: open-source-pulse.yml (Tier: ${pipelineTier})`,
      `[${nowIso}] Allocated runner: ubuntu-latest (8 cores, 12GB memory, PySpark 3.5.1)`
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
        const logTime = new Date().toISOString();
        setPipelineLogs(prev => [...prev, `[${logTime}] ${stepLogs[currentStep]}`]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsPipelineRunning(false);
        setPipelineCompleted(true);
        setActiveStepIndex(pipelineStages.length);
        const finishTime = new Date().toISOString();
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
    <div className="min-h-screen bg-[#0d1117] text-[#e6edf3] flex flex-col font-sans">
      {/* ------------------------------------------------------------- */}
      {/* 1. GITHUB TOP GLOBAL NAVIGATION BAR                           */}
      {/* ------------------------------------------------------------- */}
      <header className="border-b border-[#30363d] bg-[#161b22] sticky top-0 z-40 text-sm">
        <div className="max-w-[1440px] mx-auto px-4 h-14 flex items-center justify-between gap-4">
          {/* Left: GitHub Octocat Logo & Repo Breadcrumb */}
          <div className="flex items-center gap-3 shrink-0">
            {/* GitHub Octocat Mark SVG */}
            <a
              href="#"
              onClick={e => {
                e.preventDefault();
                setActiveTab('repositories');
              }}
              className="text-white hover:opacity-80 transition-opacity"
              title="GitHub Open-Source Pulse"
            >
              <svg height="32" viewBox="0 0 16 16" version="1.1" width="32" fill="currentColor">
                <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
              </svg>
            </a>

            {/* Breadcrumb: apache-spark / open-source-pulse */}
            <div className="flex items-center gap-1.5 text-sm">
              <span className="text-[#58a6ff] hover:underline cursor-pointer">apache-spark</span>
              <span className="text-[#8b949e]">/</span>
              <span className="font-semibold text-[#e6edf3] hover:underline cursor-pointer">
                open-source-pulse
              </span>
              <span className="ml-1.5 text-[11px] px-2 py-0.5 rounded-full border border-[#30363d] text-[#8b949e] font-medium leading-none">
                Public
              </span>
            </div>
          </div>

          {/* Center: GitHub Search Input */}
          <div className="hidden lg:flex items-center flex-1 max-w-md mx-2">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                placeholder="Type / to search repositories, models, or topics..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] rounded-md pl-8 pr-8 py-1 text-xs text-[#e6edf3] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-[#8b949e] border border-[#30363d] px-1 rounded font-mono">
                /
              </span>
            </div>
          </div>

          {/* Right: GitHub Action Buttons & Profile */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Watch count */}
            <div className="hidden sm:inline-flex items-center border border-[#30363d] rounded-md bg-[#21262d] text-xs font-medium text-[#e6edf3] overflow-hidden">
              <button className="px-2.5 py-1 hover:bg-[#30363d] transition-colors flex items-center gap-1.5 cursor-pointer">
                <Eye className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>Watch</span>
              </button>
              <span className="px-2 py-1 bg-[#161b22] border-l border-[#30363d] text-[11px] text-[#8b949e] font-mono">
                94
              </span>
            </div>

            {/* Fork count */}
            <div className="hidden sm:inline-flex items-center border border-[#30363d] rounded-md bg-[#21262d] text-xs font-medium text-[#e6edf3] overflow-hidden">
              <button className="px-2.5 py-1 hover:bg-[#30363d] transition-colors flex items-center gap-1.5 cursor-pointer">
                <GitFork className="w-3.5 h-3.5 text-[#8b949e]" />
                <span>Fork</span>
              </button>
              <span className="px-2 py-1 bg-[#161b22] border-l border-[#30363d] text-[11px] text-[#8b949e] font-mono">
                312
              </span>
            </div>

            {/* Interactive Star button */}
            <button
              onClick={() => toggleStar(9999)}
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-[#30363d] transition-colors cursor-pointer ${
                starredRepos[9999]
                  ? 'bg-[#21262d] text-[#e3b341] border-[#e3b341]/40'
                  : 'bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]'
              }`}
            >
              <Star className={`w-3.5 h-3.5 ${starredRepos[9999] ? 'fill-current' : 'text-[#8b949e]'}`} />
              <span>{starredRepos[9999] ? 'Starred' : 'Star'}</span>
              <span className="ml-1 text-[11px] text-[#8b949e] font-mono">1.8k</span>
            </button>

            {/* GitHub Green Run Workflow Button (Switches to Actions tab without black screens) */}
            <button
              onClick={startPipelineExecution}
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] border border-[rgba(240,246,252,0.1)] transition-colors shadow-sm cursor-pointer whitespace-nowrap"
              title="Execute Apache Spark Pipeline Engine"
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Run Pipeline</span>
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* 2. GITHUB REPOSITORY SUBHEADER TABS                           */}
        {/* ------------------------------------------------------------- */}
        <div className="max-w-[1440px] mx-auto px-4 overflow-x-auto">
          <nav className="flex items-center gap-1 text-xs font-medium text-[#8b949e] border-t border-[#21262d] pt-1">
            {/* Tab 1: Repositories (Trending Breakouts) */}
            <button
              onClick={() => setActiveTab('repositories')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'repositories'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <BookMarked className="w-4 h-4 text-[#8b949e]" />
              <span>Repositories</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[#30363d] text-[#e6edf3] font-mono">
                {filteredRepos.length}
              </span>
            </button>

            {/* Tab 2: Repository Intelligence */}
            <button
              onClick={() => setActiveTab('intelligence')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'intelligence'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <Activity className="w-4 h-4 text-[#8b949e]" />
              <span>Deep Intelligence</span>
            </button>

            {/* Tab 3: Graph Ecosystem */}
            <button
              onClick={() => setActiveTab('graph')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'graph'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <Network className="w-4 h-4 text-[#8b949e]" />
              <span>Graph Ecosystem</span>
            </button>

            {/* Tab 4: Lakehouse Funnel */}
            <button
              onClick={() => setActiveTab('funnel')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'funnel'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <Layers className="w-4 h-4 text-[#8b949e]" />
              <span>Lakehouse Funnel</span>
              <span className="ml-1 px-1.5 py-0.2 text-[10px] rounded-full bg-[#30363d] text-[#3fb950] font-mono">
                -99.99%
              </span>
            </button>

            {/* Tab 5: Benchmarks & Ablation */}
            <button
              onClick={() => setActiveTab('benchmarks')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'benchmarks'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#8b949e]" />
              <span>Benchmarks & MLlib</span>
            </button>

            {/* Tab 6: Actions (Pipeline Workflow Runner) */}
            <button
              onClick={() => setActiveTab('actions')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'actions'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <Terminal className="w-4 h-4 text-[#3fb950]" />
              <span>Actions Workflow</span>
              {pipelineCompleted && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#3fb950]" />
              )}
            </button>

            {/* Tab 7: Live Simulator (NEW FEATURE) */}
            <button
              onClick={() => setActiveTab('simulator')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'simulator'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <Zap className="w-4 h-4 text-[#d29922]" />
              <span>Live Simulator</span>
            </button>

            {/* Tab 8: README.md */}
            <button
              onClick={() => setActiveTab('readme')}
              className={`flex items-center gap-2 px-3 py-2.5 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
                activeTab === 'readme'
                  ? 'border-[#fd8c73] text-[#e6edf3] font-semibold'
                  : 'border-transparent hover:text-[#e6edf3] hover:border-[#8b949e]'
              }`}
            >
              <FileText className="w-4 h-4 text-[#8b949e]" />
              <span>README.md</span>
            </button>
          </nav>
        </div>
      </header>

      {/* ------------------------------------------------------------- */}
      {/* 3. GITHUB REPOSITORY BANNER STRIP                             */}
      {/* ------------------------------------------------------------- */}
      <section className="bg-[#161b22] border-b border-[#30363d] py-3 text-xs text-[#8b949e]">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-[#e6edf3] font-medium">
              <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
              GH Archive 18-Month Continuous Stream
            </span>
            <span>·</span>
            <span>Candidate Filter: 20–300 Stars, Age &le; 26w</span>
            <span>·</span>
            <span className="text-[#e6edf3]">Target: &ge; 500 Stars in 30 Days</span>
          </div>

          <div className="flex items-center gap-4 font-mono text-[11px] tabular-nums">
            <span>
              Precision@20: <strong className="text-[#3fb950] font-semibold">80.0%</strong>
            </span>
            <span>·</span>
            <span>
              Avg Early Lead Time: <strong className="text-[#58a6ff] font-semibold">+3.4 weeks</strong>
            </span>
            <span>·</span>
            <span className="text-[#8b949e]">
              Data Leakage Guard: <strong className="text-[#e6edf3]">4-Wk Embargo</strong>
            </span>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------------- */}
      {/* 4. MAIN WORKSPACE / VIEWS                                     */}
      {/* ------------------------------------------------------------- */}
      <main className="flex-1 max-w-[1440px] w-full mx-auto px-4 py-6">
        {/* ------------------------------------------------------------- */}
        {/* VIEW 1: REPOSITORIES (GITHUB TRENDING / EXPLORE STYLE)         */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'repositories' && (
          <div className="space-y-4">
            {/* GitHub Header Filter Toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-[#161b22] border border-[#30363d] rounded-md p-3">
              {/* Category / Language Segmented Buttons */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs">
                {categories.map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-2.5 py-1 rounded-md text-xs transition-colors whitespace-nowrap cursor-pointer ${
                      categoryFilter === cat
                        ? 'bg-[#30363d] text-[#e6edf3] font-semibold'
                        : 'text-[#8b949e] hover:text-[#e6edf3] hover:bg-[#21262d]'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Sort selector */}
              <div className="flex items-center gap-2 text-xs shrink-0">
                <span className="text-[#8b949e]">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value as any)}
                  className="bg-[#0d1117] border border-[#30363d] text-[#e6edf3] rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-[#58a6ff]"
                >
                  <option value="score">Breakout Probability (High to Low)</option>
                  <option value="stars_cum">Current Stars</option>
                  <option value="growth_ratio">Weekly Growth Velocity</option>
                  <option value="fork_star_ratio">Fork-to-Star Conversion</option>
                </select>
              </div>
            </div>

            {/* GitHub Repository List Container */}
            <div className="border border-[#30363d] rounded-md bg-[#0d1117] divide-y divide-[#30363d]">
              {filteredRepos.map((repo, idx) => {
                const isHighProb = repo.score >= 0.70;
                const isSpam = repo.burstiness >= 0.85 && repo.fork_star_ratio < 0.05;
                const isStarred = starredRepos[repo.repo_id];

                return (
                  <div
                    key={repo.repo_id}
                    className="p-5 hover:bg-[#161b22]/50 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    {/* Left: Repository info */}
                    <div className="space-y-2 flex-1">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <BookMarked className="w-4 h-4 text-[#8b949e] shrink-0" />
                        <button
                          onClick={() => {
                            setSelectedRepo(repo);
                            setActiveTab('intelligence');
                          }}
                          className="text-base font-semibold text-[#58a6ff] hover:underline text-left cursor-pointer"
                        >
                          {repo.repo_name}
                        </button>

                        <span className="text-[11px] px-2 py-0.2 rounded-full border border-[#30363d] text-[#8b949e] font-medium leading-none">
                          Public
                        </span>

                        {repo.is_breakout && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] font-semibold flex items-center gap-1 font-mono">
                            <Flame className="w-3 h-3" />
                            Breakout Confirmed (+{repo.actual_stars_next_4w} stars)
                          </span>
                        )}

                        {isSpam && (
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-[#da3633]/20 border border-[#da3633]/40 text-[#f85149] font-semibold flex items-center gap-1 font-mono">
                            <AlertTriangle className="w-3 h-3" />
                            Spam Campaign Guard
                          </span>
                        )}
                      </div>

                      {/* Description */}
                      <p className="text-xs text-[#8b949e] leading-relaxed max-w-4xl">
                        {repo.description}
                      </p>

                      {/* GitHub Topic tags */}
                      {repo.topics && (
                        <div className="flex items-center gap-1.5 flex-wrap pt-1">
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

                      {/* Bottom metadata row */}
                      <div className="flex items-center gap-4 text-xs text-[#8b949e] pt-1 flex-wrap">
                        {/* Language */}
                        {repo.language && (
                          <span className="flex items-center gap-1.5">
                            <span
                              className="w-2.5 h-2.5 rounded-full inline-block"
                              style={{ backgroundColor: repo.languageColor || '#3572A5' }}
                            />
                            <span className="text-[#e6edf3] font-medium">{repo.language}</span>
                          </span>
                        )}

                        {/* Stars */}
                        <span className="flex items-center gap-1 font-mono tabular-nums text-[#e6edf3]">
                          <Star className="w-3.5 h-3.5 text-[#8b949e]" />
                          <strong>{repo.stars_cum.toLocaleString()}</strong>
                          <span className="text-[#3fb950] text-[11px]">
                            (+{repo.stars_w0}/wk)
                          </span>
                        </span>

                        {/* Forks */}
                        <span className="flex items-center gap-1 font-mono tabular-nums">
                          <GitFork className="w-3.5 h-3.5 text-[#8b949e]" />
                          <span>{repo.forksCount || Math.round(repo.stars_cum * repo.fork_star_ratio)}</span>
                        </span>

                        {/* Growth velocity curvature */}
                        <span className="font-mono text-[11px]">
                          Velocity: <strong className={repo.growth_ratio >= 2.5 ? 'text-[#3fb950]' : 'text-[#e6edf3]'}>{repo.growth_ratio.toFixed(2)}x</strong>
                        </span>

                        {/* Fork/Star ratio */}
                        <span className="font-mono text-[11px]">
                          Fork/Star: <strong className={repo.fork_star_ratio >= 0.18 ? 'text-[#3fb950]' : 'text-[#8b949e]'}>{(repo.fork_star_ratio * 100).toFixed(1)}%</strong>
                        </span>

                        {/* Lead time */}
                        {repo.lead_time_weeks && (
                          <span className="text-[#58a6ff] font-mono text-[11px] font-semibold bg-[#388bfd]/10 px-2 py-0.5 rounded border border-[#388bfd]/30">
                            +{repo.lead_time_weeks} wks lead time
                          </span>
                        )}

                        {/* License */}
                        {repo.license && (
                          <span className="text-[#8b949e] text-[11px]">{repo.license}</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Breakout Score & Actions */}
                    <div className="flex md:flex-col items-center md:items-end justify-between gap-3 shrink-0">
                      {/* GitHub Star toggle button */}
                      <button
                        onClick={e => toggleStar(repo.repo_id, e)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium border border-[#30363d] transition-colors cursor-pointer ${
                          isStarred
                            ? 'bg-[#21262d] text-[#e3b341] border-[#e3b341]/50'
                            : 'bg-[#21262d] text-[#e6edf3] hover:bg-[#30363d]'
                        }`}
                      >
                        <Star className={`w-3.5 h-3.5 ${isStarred ? 'fill-current' : 'text-[#8b949e]'}`} />
                        <span>{isStarred ? 'Starred' : 'Star'}</span>
                      </button>

                      {/* Breakout score badge */}
                      <div className="text-right">
                        <div className="text-[10px] uppercase text-[#8b949e] tracking-wider font-mono">
                          Breakout Probability
                        </div>
                        <div
                          className={`text-lg font-bold font-mono tabular-nums ${
                            isHighProb
                              ? 'text-[#3fb950]'
                              : isSpam
                              ? 'text-[#f85149]'
                              : 'text-[#e6edf3]'
                          }`}
                        >
                          {(repo.score * 100).toFixed(1)}%
                        </div>
                        <div className="w-24 bg-[#21262d] h-1.5 rounded-full overflow-hidden mt-1">
                          <div
                            className={`h-full ${
                              isHighProb
                                ? 'bg-[#3fb950]'
                                : isSpam
                                ? 'bg-[#f85149]'
                                : 'bg-[#58a6ff]'
                            }`}
                            style={{ width: `${repo.score * 100}%` }}
                          />
                        </div>
                      </div>

                      {/* Inspect details button */}
                      <button
                        onClick={() => {
                          setSelectedRepo(repo);
                          setActiveTab('intelligence');
                        }}
                        className="text-xs text-[#58a6ff] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                      >
                        <span>Deep Signals</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 2: DEEP INTELLIGENCE (TRAJECTORIES & SIGNALS)             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'intelligence' && (
          <div className="space-y-6">
            {/* Repo Header Box */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8b949e] mb-1">
                  <span>{selectedRepo.category}</span>
                  <span>·</span>
                  <span>Created {selectedRepo.created_dt}</span>
                  <span>·</span>
                  <span>Ecosystem Community: {selectedRepo.community_name}</span>
                </div>

                <h1 className="text-2xl font-bold text-[#e6edf3] flex items-center gap-3">
                  <BookMarked className="w-6 h-6 text-[#8b949e]" />
                  <span>{selectedRepo.repo_name}</span>
                  <a
                    href={`https://github.com/${selectedRepo.repo_name}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[#8b949e] hover:text-[#58a6ff]"
                    title="View on GitHub"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </h1>
                <p className="text-xs text-[#8b949e] mt-1 max-w-3xl leading-relaxed">
                  {selectedRepo.description}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={() => fetchAiInsight(selectedRepo)}
                  disabled={isLoadingAi}
                  className="px-3.5 py-1.5 text-xs font-semibold rounded-md bg-[#21262d] border border-[#30363d] text-[#58a6ff] hover:bg-[#30363d] transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#58a6ff]" />
                  {isLoadingAi ? 'Synthesizing...' : 'Synthesize AI Report'}
                </button>

                <div className="text-right pl-4 border-l border-[#30363d]">
                  <div className="text-[10px] text-[#8b949e] uppercase font-mono">
                    Breakout Probability
                  </div>
                  <div className="text-2xl font-bold font-mono text-[#3fb950] tabular-nums">
                    {(selectedRepo.score * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Historical Star Curve & Lead Time SVG Chart */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] p-5 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-[#e6edf3]">
                    Historical Star Velocity Curve & Lead-Time Milestone
                  </h2>
                  <p className="text-xs text-[#8b949e]">
                    Demonstrating the exact lead-time weeks gained before the repository crossed 1,000 stars on GitHub Trending.
                  </p>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e]">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" /> Star Trajectory
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e3b341]" /> Flagged Breakout
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#58a6ff]" /> 1,000 Stars Crossed
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
                              stroke="#30363d"
                              strokeDasharray="3 3"
                            />
                            <text
                              x={pad - 8}
                              y={y + 3}
                              fill="#8b949e"
                              fontSize="10"
                              textAnchor="end"
                              className="font-mono"
                            >
                              {labelVal >= 1000 ? `${(labelVal / 1000).toFixed(1)}k` : labelVal}
                            </text>
                          </g>
                        );
                      })}

                      <path d={areaD} fill="rgba(63, 185, 80, 0.08)" />
                      <path d={pathD} fill="none" stroke="#3fb950" strokeWidth="2.5" />

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
                              fill={isFlag ? '#e3b341' : '#3fb950'}
                              stroke="#0d1117"
                              strokeWidth="2"
                            />
                            <text
                              x={getX(i)}
                              y={height - pad + 16}
                              fill="#8b949e"
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
                                  stroke="#e3b341"
                                  strokeWidth="1.5"
                                />
                                <rect
                                  x={getX(i) - 65}
                                  y={getY(p.cumulative_stars) - 52}
                                  width="130"
                                  height="20"
                                  rx="4"
                                  fill="#21262d"
                                  stroke="#e3b341"
                                />
                                <text
                                  x={getX(i)}
                                  y={getY(p.cumulative_stars) - 38}
                                  fill="#f2cc60"
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
                                  fill="#58a6ff"
                                  stroke="#0d1117"
                                />
                                <text
                                  x={getX(i)}
                                  y={getY(p.cumulative_stars) - 10}
                                  fill="#58a6ff"
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

            {/* 4 Core Signal Indicators */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono">
              <div className="border border-[#30363d] rounded-md p-4 bg-[#161b22]">
                <div className="text-[#8b949e] font-sans">Growth Velocity Curvature</div>
                <div className="text-xl font-bold text-[#e6edf3] tabular-nums mt-1">
                  {selectedRepo.growth_ratio.toFixed(2)}x
                </div>
                <div className="text-[11px] text-[#8b949e] mt-1 font-sans">
                  Snapshot week ({selectedRepo.stars_w0}) vs prior week ({selectedRepo.stars_w1})
                </div>
              </div>

              <div className="border border-[#30363d] rounded-md p-4 bg-[#161b22]">
                <div className="text-[#8b949e] font-sans">Fork-to-Star Conversion</div>
                <div className="text-xl font-bold text-[#e6edf3] tabular-nums mt-1">
                  {(selectedRepo.fork_star_ratio * 100).toFixed(1)}%
                </div>
                <div className="text-[11px] text-[#8b949e] mt-1 font-sans">
                  Healthy projects &ge; 18%; separates real forks from bookmarkers
                </div>
              </div>

              <div className="border border-[#30363d] rounded-md p-4 bg-[#161b22]">
                <div className="text-[#8b949e] font-sans">Burstiness Guard Index</div>
                <div className="text-xl font-bold text-[#e6edf3] tabular-nums mt-1">
                  {selectedRepo.burstiness.toFixed(2)}
                </div>
                <div className="text-[11px] text-[#8b949e] mt-1 font-sans">
                  Single-day peak / weekly stars; lower = organic multi-day adoption
                </div>
              </div>

              <div className="border border-[#30363d] rounded-md p-4 bg-[#161b22]">
                <div className="text-[#8b949e] font-sans">PR Merge Throughput</div>
                <div className="text-xl font-bold text-[#e6edf3] tabular-nums mt-1">
                  {selectedRepo.prs_merged_4w} / {selectedRepo.prs_opened_4w} PRs
                </div>
                <div className="text-[11px] text-[#8b949e] mt-1 font-sans">
                  Maintainer responsiveness across rolling 4-week window
                </div>
              </div>
            </div>

            {/* AI Intelligence Output */}
            {aiReport && (
              <div className="border border-[#388bfd]/40 bg-[#388bfd]/10 rounded-md p-5 space-y-3">
                <div className="flex items-center gap-2 text-[#58a6ff] font-semibold text-sm">
                  <Sparkles className="w-4 h-4" />
                  Gemini AI Repository Intelligence Synthesis
                </div>
                <div className="text-xs text-[#e6edf3] whitespace-pre-line leading-relaxed font-sans">
                  {aiReport}
                </div>
              </div>
            )}

            {/* Nearest Co-Star Graph Neighbors */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#e6edf3]">
                Nearest Co-Star Graph Neighbors (Shared Stargazers &ge; 3)
              </h3>
              <p className="text-xs text-[#8b949e]">
                GraphFrames co-star community reveals ecosystem spillover and shared mindshare.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-2">
                {selectedRepo.nearest_costars.length > 0 ? (
                  selectedRepo.nearest_costars.map((c, i) => (
                    <div key={i} className="border border-[#30363d] bg-[#0d1117] rounded-md p-3">
                      <div className="text-xs font-semibold text-[#58a6ff] font-mono truncate">
                        {c.repo_name}
                      </div>
                      <div className="text-[11px] text-[#8b949e] mt-1">
                        Shared Stargazers:{' '}
                        <span className="text-[#e6edf3] font-mono font-bold">{c.shared_stargazers}</span>
                      </div>
                      <div className="text-[11px] text-[#3fb950] mt-0.5">
                        Breakout Score: <span className="font-mono">{(c.score * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-xs text-[#8b949e] py-2">
                    No heavy neighbor overlap detected (isolated repo).
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 3: GRAPH ECOSYSTEM (GRAPHFRAMES)                         */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'graph' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#e6edf3]">
                  Co-Star Graph & Community Ecosystems
                </h1>
                <p className="text-xs text-[#8b949e] mt-1 max-w-2xl">
                  GraphFrames DataFrame-based graph analytics: vertices are candidate repositories, edges represent &ge; 3 shared stargazers within a rolling 60-day window.
                </p>
              </div>

              {/* Edge threshold filter slider */}
              <div className="flex items-center gap-3 bg-[#161b22] border border-[#30363d] rounded-md px-4 py-2 text-xs">
                <span className="text-[#8b949e]">Min Shared Stargazers:</span>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={minEdgeWeight}
                  onChange={e => setMinEdgeWeight(parseInt(e.target.value, 10))}
                  className="w-28 accent-[#58a6ff]"
                />
                <span className="font-mono font-bold text-[#58a6ff] w-8">{minEdgeWeight}</span>
              </div>
            </div>

            {/* Graph Guards Callout Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div className="border border-[#30363d] bg-[#161b22] rounded-md p-4">
                <div className="text-[#e6edf3] font-semibold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-[#3fb950]" />
                  Heavy Stargazer Guard
                </div>
                <div className="text-[#8b949e] mt-1 text-[11px] leading-relaxed">
                  Users with &gt; 200 stars dropped via <code className="text-[#e6edf3] font-mono">left_anti</code> join to prevent $O(N^2)$ quadratic edge explosion.
                </div>
              </div>
              <div className="border border-[#30363d] bg-[#161b22] rounded-md p-4">
                <div className="text-[#e6edf3] font-semibold flex items-center gap-2">
                  <Network className="w-4 h-4 text-[#58a6ff]" />
                  Edge Weight Floor
                </div>
                <div className="text-[#8b949e] mt-1 text-[11px] leading-relaxed">
                  Edges required to have weight &ge; 3 shared stargazers, pruning 89% of noisy transient coincidences.
                </div>
              </div>
              <div className="border border-[#30363d] bg-[#161b22] rounded-md p-4">
                <div className="text-[#e6edf3] font-semibold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-[#d29922]" />
                  Graph Algorithms
                </div>
                <div className="text-[#8b949e] mt-1 text-[11px] leading-relaxed">
                  Distributed PageRank (resetProb=0.15, maxIter=10) & Label Propagation community clustering.
                </div>
              </div>
            </div>

            {/* Interactive SVG Network Canvas */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] p-6 relative">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
                <div className="text-xs text-[#8b949e]">
                  Interactive Co-Star Network Diagram (Click node to inspect trajectory)
                </div>
                <div className="flex items-center gap-4 text-xs font-mono text-[#8b949e] flex-wrap">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#3fb950]" /> LLM Serving
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#58a6ff]" /> Agents & Gateways
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#e3b341]" /> Vector & Search
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#a371f7]" /> Systems & Edge
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
                    1: '#3fb950',
                    2: '#58a6ff',
                    3: '#e3b341',
                    5: '#a371f7',
                    0: '#f85149'
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
                            stroke="#30363d"
                            strokeWidth={strokeWidth}
                            strokeOpacity={0.7}
                          />
                        );
                      })}

                      {/* Nodes */}
                      {GRAPH_NODES.map(node => {
                        const pt = coords[node.id];
                        if (!pt) return null;
                        const radius = Math.max(7, Math.min(22, node.pagerank * 150));
                        const color = colorMap[node.community_id] || '#8b949e';
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
                                setActiveTab('intelligence');
                              }
                            }}
                          >
                            <circle
                              cx={pt[0]}
                              cy={pt[1]}
                              r={radius}
                              fill={color}
                              stroke={isSelected ? '#ffffff' : '#161b22'}
                              strokeWidth={isSelected ? 3 : 2}
                              className="transition-all hover:opacity-80"
                            />
                            <text
                              x={pt[0]}
                              y={pt[1] + radius + 13}
                              fill="#e6edf3"
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
                              fill="#8b949e"
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
        {/* VIEW 4: LAKEHOUSE FUNNEL (MEDALLION ARCHITECTURE)             */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'funnel' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-xl font-bold text-[#e6edf3]">
                Medallion Data Lakehouse Processing Funnel
              </h1>
              <p className="text-xs text-[#8b949e] mt-1 max-w-2xl">
                Demonstrating multi-tier row and byte shrinkage from 1.48 Billion raw events down to 148,000 candidate weekly rows (99.99% overall reduction).
              </p>
            </div>

            {/* Funnel Stage Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {FUNNEL_STAGES.map((stage, idx) => (
                <div key={idx} className="border border-[#30363d] rounded-md p-5 bg-[#161b22] space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-[#e6edf3]">{stage.stage}</span>
                    <span className="font-mono text-[#8b949e]">{stage.grain}</span>
                  </div>
                  <div className="text-xl font-bold font-mono text-[#e6edf3] tabular-nums">
                    {stage.displayRows}
                  </div>
                  <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono">
                    <span>{stage.sizeBytes}</span>
                    <span className="text-[#3fb950] font-medium">
                      {stage.reductionPct > 0 ? `-${stage.reductionPct}%` : 'Baseline'}
                    </span>
                  </div>
                  <p className="text-[11px] text-[#8b949e] pt-1 font-sans">{stage.note}</p>
                </div>
              ))}
            </div>

            {/* Funnel Architecture Table */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] p-5 space-y-4">
              <h3 className="text-sm font-semibold text-[#e6edf3]">
                Lakehouse Reduction Efficiency Table
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d] uppercase text-[10px]">
                    <tr>
                      <th className="py-2.5 px-4">Stage</th>
                      <th className="py-2.5 px-4">Grain</th>
                      <th className="py-2.5 px-4 text-right">Row Count</th>
                      <th className="py-2.5 px-4 text-right">Data Footprint</th>
                      <th className="py-2.5 px-4 text-right">Row Reduction</th>
                      <th className="py-2.5 px-4 font-sans">Engineering Optimization</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#30363d]">
                    {FUNNEL_STAGES.map((stage, idx) => (
                      <tr key={idx} className="hover:bg-[#21262d]/50">
                        <td className="py-3 px-4 font-semibold text-[#e6edf3]">{stage.stage}</td>
                        <td className="py-3 px-4 text-[#8b949e]">{stage.grain}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#e6edf3]">
                          {stage.rows.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#8b949e]">
                          {stage.sizeBytes}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#3fb950] font-semibold">
                          {stage.reductionPct > 0 ? `${stage.reductionPct}%` : '0%'}
                        </td>
                        <td className="py-3 px-4 font-sans text-[#8b949e]">{stage.note}</td>
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
              <h1 className="text-xl font-bold text-[#e6edf3]">
                Benchmark Study (E1 - E9) & Model Ablation
              </h1>
              <p className="text-xs text-[#8b949e] mt-1 max-w-2xl">
                Empirical measurements recorded across Spark UI stages proving the 16.1x storage reduction and 25.6x graph speedup.
              </p>
            </div>

            {/* Model Comparison Table */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#e6edf3]">
                Spark MLlib Model Comparison & Ablation Matrix
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0d1117] text-[#8b949e] border-b border-[#30363d] uppercase text-[10px]">
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
                  <tbody className="divide-y divide-[#30363d]">
                    {MODEL_COMPARISONS.map(m => (
                      <tr
                        key={m.id}
                        className={m.id === 'M3' ? 'bg-[#238636]/10' : 'hover:bg-[#21262d]/50'}
                      >
                        <td className="py-3 px-4 font-bold text-[#e6edf3]">{m.id}</td>
                        <td className="py-3 px-4 font-sans font-medium text-[#e6edf3]">{m.name}</td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#3fb950] font-bold">
                          {m.pr_auc.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#e6edf3]">
                          {(m.precision_at_20 * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#e6edf3]">
                          {(m.precision_at_50 * 100).toFixed(1)}%
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#8b949e]">
                          {m.roc_auc.toFixed(3)}
                        </td>
                        <td className="py-3 px-4 text-right tabular-nums text-[#58a6ff] font-bold">
                          +{m.avg_lead_time_weeks} wks
                        </td>
                        <td className="py-3 px-4 font-sans text-[#8b949e] text-[11px]">{m.role}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* E1..E9 Benchmark Cards */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] p-5 space-y-4">
              <h2 className="text-sm font-semibold text-[#e6edf3]">
                Efficiency Playbook Experiments (E1 to E9)
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {BENCHMARK_EXPERIMENTS.map(exp => (
                  <div key={exp.id} className="border border-[#30363d] bg-[#0d1117] rounded-md p-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono font-bold text-[#58a6ff]">
                        [{exp.id}] {exp.experiment}
                      </span>
                      <span className="font-mono text-xs font-semibold bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] px-2 py-0.5 rounded">
                        {exp.speedup} Speedup
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1">
                      <div className="bg-[#161b22] p-2.5 rounded border border-[#30363d]">
                        <div className="text-[10px] text-[#8b949e] uppercase">Baseline</div>
                        <div className="text-[#e6edf3] font-medium mt-0.5">{exp.baseline_name}</div>
                        <div className="text-[#8b949e] text-[11px] mt-0.5">
                          {exp.baseline_val} {exp.unit}
                        </div>
                      </div>
                      <div className="bg-[#161b22] p-2.5 rounded border border-[#388bfd]/30">
                        <div className="text-[10px] text-[#58a6ff] uppercase">Optimized</div>
                        <div className="text-[#58a6ff] font-medium mt-0.5">{exp.optimised_name}</div>
                        <div className="text-[#e6edf3] text-[11px] mt-0.5">
                          {exp.optimised_val} {exp.unit}
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-[#8b949e] leading-relaxed font-sans">
                      {exp.spark_ui_explanation}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 6: ACTIONS WORKFLOW (SPARK PIPELINE RUNNER)              */}
        {/* ZERO BLACK SCREEN! Modeled after GitHub Actions Run UI        */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'actions' && (
          <div className="space-y-6">
            {/* GitHub Actions Run Header */}
            <div className="bg-[#161b22] border border-[#30363d] rounded-md p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs text-[#8b949e] mb-1">
                  <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
                  <span>.github/workflows/pulse-pipeline.yml</span>
                  <span>·</span>
                  <span>Run #142 (workflow_dispatch)</span>
                </div>
                <h1 className="text-xl font-bold text-[#e6edf3] flex items-center gap-2.5">
                  <span>Open-Source Pulse Pipeline Engine</span>
                  {pipelineCompleted && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#238636]/20 text-[#3fb950] font-semibold border border-[#238636]/40 flex items-center gap-1">
                      <Check className="w-3 h-3" />
                      Success
                    </span>
                  )}
                  {isPipelineRunning && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-[#388bfd]/20 text-[#58a6ff] font-semibold border border-[#388bfd]/40 flex items-center gap-1 animate-pulse">
                      <Activity className="w-3 h-3 animate-spin" />
                      In progress
                    </span>
                  )}
                </h1>
                <p className="text-xs text-[#8b949e] mt-1">
                  Orchestrated PySpark Lakehouse pipeline across 7 stages with AQE, GraphFrames, and DuckDB serving.
                </p>
              </div>

              {/* Execution Controls */}
              <div className="flex items-center gap-2 shrink-0">
                <div className="flex items-center bg-[#0d1117] border border-[#30363d] rounded-md p-0.5 text-xs font-mono">
                  {(['T0', 'T1', 'T2'] as const).map(tier => (
                    <button
                      key={tier}
                      onClick={() => setPipelineTier(tier)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        pipelineTier === tier
                          ? 'bg-[#30363d] text-[#e6edf3] font-bold'
                          : 'text-[#8b949e] hover:text-[#e6edf3]'
                      }`}
                    >
                      {tier}
                    </button>
                  ))}
                </div>

                <button
                  onClick={startPipelineExecution}
                  disabled={isPipelineRunning}
                  className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#238636] hover:bg-[#2ea043] rounded-md transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isPipelineRunning ? (
                    <>
                      <Activity className="w-3.5 h-3.5 animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <RotateCcw className="w-3.5 h-3.5" />
                      <span>Re-run All Jobs ({pipelineTier})</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Split View: Left Jobs Checklist, Right Dark Console */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: 7 Workflow Jobs */}
              <div className="lg:col-span-5 space-y-2">
                <div className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider mb-2 font-mono">
                  Workflow Jobs (7 Steps)
                </div>

                <div className="border border-[#30363d] rounded-md bg-[#161b22] divide-y divide-[#30363d]">
                  {pipelineStages.map((stage, idx) => {
                    const isCompleted = activeStepIndex > idx || pipelineCompleted;
                    const isRunning = activeStepIndex === idx && isPipelineRunning;

                    return (
                      <div
                        key={stage.id}
                        className={`p-3 flex items-start justify-between gap-3 transition-colors ${
                          isRunning
                            ? 'bg-[#388bfd]/10'
                            : isCompleted
                            ? 'bg-transparent'
                            : 'opacity-60'
                        }`}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="mt-0.5">
                            {isCompleted && (
                              <CheckCircle2 className="w-4 h-4 text-[#3fb950]" />
                            )}
                            {isRunning && (
                              <Activity className="w-4 h-4 text-[#58a6ff] animate-spin" />
                            )}
                            {!isCompleted && !isRunning && (
                              <span className="w-4 h-4 rounded-full border border-[#8b949e] flex items-center justify-center text-[10px] text-[#8b949e]">
                                {stage.step}
                              </span>
                            )}
                          </div>
                          <div>
                            <div className="text-xs font-semibold text-[#e6edf3] font-mono">
                              {stage.name}
                            </div>
                            <div className="text-[11px] text-[#8b949e] mt-0.5 font-sans leading-tight">
                              {stage.desc}
                            </div>
                          </div>
                        </div>

                        <span className="text-[11px] font-mono text-[#8b949e] shrink-0">
                          {stage.duration}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: GitHub Actions Console Output */}
              <div className="lg:col-span-7 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono text-[#8b949e] mb-2">
                  <span className="uppercase tracking-wider">Runner Console Output</span>
                  <span>UTC · local[8] · zstd</span>
                </div>

                <div className="border border-[#30363d] rounded-md bg-[#0d1117] overflow-hidden shadow-inner">
                  <div className="bg-[#161b22] border-b border-[#30363d] px-3 py-2 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2 text-[#8b949e] font-mono">
                      <Terminal className="w-3.5 h-3.5 text-[#3fb950]" />
                      <span>spark-executor.log</span>
                    </div>
                    <span className="text-[11px] text-[#8b949e] font-mono">
                      {pipelineLogs.length} lines
                    </span>
                  </div>

                  <div className="p-4 h-80 overflow-y-auto font-mono text-xs text-[#e6edf3] space-y-2.5">
                    {pipelineLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2 leading-relaxed">
                        <span className="text-[#3fb950] shrink-0">&gt;</span>
                        <span className="text-[#8b949e]">{log}</span>
                      </div>
                    ))}
                    {isPipelineRunning && (
                      <div className="flex items-center gap-2 text-[#58a6ff] pt-1">
                        <span className="w-2 h-2 rounded-full bg-[#58a6ff] animate-ping" />
                        <span>Processing Spark RDD transformations and writing Parquet blocks...</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Generated Artifacts Summary */}
            <div className="border border-[#30363d] rounded-md bg-[#161b22] p-5 space-y-3">
              <h3 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
                <Database className="w-4 h-4 text-[#58a6ff]" />
                Materialized Lakehouse Artifacts
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs font-mono">
                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                  <div className="text-[#8b949e] text-[10px]">OUTPUT FILE</div>
                  <div className="text-[#58a6ff] font-semibold mt-1">
                    data/bronze/events/dt=*
                  </div>
                  <div className="text-[#8b949e] mt-1 text-[11px]">
                    390M filtered events · zstd dictionary compression
                  </div>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                  <div className="text-[#8b949e] text-[10px]">OUTPUT FILE</div>
                  <div className="text-[#3fb950] font-semibold mt-1">
                    data/gold/graph_edges.parquet
                  </div>
                  <div className="text-[#8b949e] mt-1 text-[11px]">
                    1.2M co-star edges · weight &ge; 3 shared stargazers
                  </div>
                </div>

                <div className="bg-[#0d1117] border border-[#30363d] rounded p-3">
                  <div className="text-[#8b949e] text-[10px]">OUTPUT FILE</div>
                  <div className="text-[#e3b341] font-semibold mt-1">
                    data/serving/scores/*.parquet
                  </div>
                  <div className="text-[#8b949e] mt-1 text-[11px]">
                    148K scored candidates · &lt;15ms query response
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ------------------------------------------------------------- */}
        {/* VIEW 7: LIVE SIMULATOR (NEW FEATURE!)                         */}
        {/* Real-time custom repo breakout predictor                     */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-[#e6edf3] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-[#d29922]" />
                  Live Repository Breakout Simulator
                </h1>
                <p className="text-xs text-[#8b949e] mt-1 max-w-2xl">
                  Test any custom repository metrics against the trained Spark MLlib GBTClassifier to observe real-time probability inference, SHAP attribution, and estimated lead time.
                </p>
              </div>

              {/* Quick Presets */}
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="text-[#8b949e]">Presets:</span>
                <button
                  onClick={() => loadPreset('viral_ai')}
                  className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#3fb950] border border-[#30363d] cursor-pointer"
                >
                  Viral AI Agent
                </button>
                <button
                  onClick={() => loadPreset('organic_tool')}
                  className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#58a6ff] border border-[#30363d] cursor-pointer"
                >
                  Organic Dev Tool
                </button>
                <button
                  onClick={() => loadPreset('bot_spam')}
                  className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#f85149] border border-[#30363d] cursor-pointer"
                >
                  Fake Star Bot
                </button>
                <button
                  onClick={() => loadPreset('stalled')}
                  className="px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] text-[#8b949e] border border-[#30363d] cursor-pointer"
                >
                  Stalled Project
                </button>
              </div>
            </div>

            {/* Two Column Layout: Controls Left, Prediction Card Right */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: Interactive Input Sliders */}
              <div className="lg:col-span-7 bg-[#161b22] border border-[#30363d] rounded-md p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#e6edf3] flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-[#58a6ff]" />
                  Repository Metric Parameters
                </h3>

                {/* Repo Name */}
                <div>
                  <label className="text-xs text-[#8b949e] block mb-1">Repository Identifier</label>
                  <input
                    type="text"
                    value={simName}
                    onChange={e => setSimName(e.target.value)}
                    className="w-full bg-[#0d1117] border border-[#30363d] rounded px-3 py-1.5 text-xs text-[#e6edf3] font-mono focus:outline-none focus:border-[#58a6ff]"
                  />
                </div>

                {/* Cumulative Stars */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8b949e]">Current Cumulative Stars (snapshot window: 20-300)</span>
                    <span className="font-mono text-[#e6edf3] font-bold">{simStarsCum}</span>
                  </div>
                  <input
                    type="range"
                    min="20"
                    max="300"
                    value={simStarsCum}
                    onChange={e => setSimStarsCum(parseInt(e.target.value, 10))}
                    className="w-full accent-[#58a6ff]"
                  />
                </div>

                {/* Weekly Stars (w0 and w1) */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8b949e]">Snapshot Wk Stars (w0)</span>
                      <span className="font-mono text-[#e6edf3] font-bold">{simStarsW0}</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="150"
                      value={simStarsW0}
                      onChange={e => setSimStarsW0(parseInt(e.target.value, 10))}
                      className="w-full accent-[#58a6ff]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8b949e]">Prior Wk Stars (w1)</span>
                      <span className="font-mono text-[#e6edf3] font-bold">{simStarsW1}</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="80"
                      value={simStarsW1}
                      onChange={e => setSimStarsW1(parseInt(e.target.value, 10))}
                      className="w-full accent-[#58a6ff]"
                    />
                  </div>
                </div>

                {/* Fork-to-star ratio */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8b949e]">Fork-to-Star Conversion Ratio</span>
                    <span className="font-mono text-[#e6edf3] font-bold">
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
                    className="w-full accent-[#58a6ff]"
                  />
                  <div className="text-[10px] text-[#8b949e] mt-0.5">
                    Healthy conversion &ge; 18%; low conversion signals artificial star campaigns.
                  </div>
                </div>

                {/* Burstiness Index */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#8b949e]">Burstiness Index (Peak Day / Weekly Stars)</span>
                    <span className="font-mono text-[#e6edf3] font-bold">
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
                    className="w-full accent-[#58a6ff]"
                  />
                  <div className="text-[10px] text-[#8b949e] mt-0.5">
                    Lower values indicate sustained multi-day interest; &gt;0.80 indicates star bot spikes.
                  </div>
                </div>

                {/* PRs Merged & PageRank */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8b949e]">PRs Merged (4w)</span>
                      <span className="font-mono text-[#e6edf3] font-bold">{simPrsMerged}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      value={simPrsMerged}
                      onChange={e => setSimPrsMerged(parseInt(e.target.value, 10))}
                      className="w-full accent-[#58a6ff]"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-[#8b949e]">Co-star PageRank</span>
                      <span className="font-mono text-[#e6edf3] font-bold">
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
                      className="w-full accent-[#58a6ff]"
                    />
                  </div>
                </div>
              </div>

              {/* Right: Real-time Inferred Output */}
              <div className="lg:col-span-5 space-y-4">
                <div className="bg-[#161b22] border border-[#30363d] rounded-md p-5 space-y-4">
                  <div className="text-xs font-mono text-[#8b949e] uppercase tracking-wider">
                    MLlib GBT Inference Verdict
                  </div>

                  <div className="flex items-baseline justify-between border-b border-[#30363d] pb-4">
                    <div>
                      <div className="text-3xl font-extrabold font-mono tabular-nums text-[#e6edf3]">
                        {(simResult.probability * 100).toFixed(1)}%
                      </div>
                      <div className="text-xs text-[#8b949e] mt-0.5 font-mono">
                        Calibrated Probability Score
                      </div>
                    </div>

                    {simResult.isBreakout ? (
                      <span className="px-3 py-1 rounded bg-[#238636]/20 border border-[#238636]/40 text-[#3fb950] font-semibold text-xs flex items-center gap-1.5 font-mono">
                        <Flame className="w-3.5 h-3.5" />
                        Breakout Imminent
                      </span>
                    ) : simResult.isSpam ? (
                      <span className="px-3 py-1 rounded bg-[#da3633]/20 border border-[#da3633]/40 text-[#f85149] font-semibold text-xs flex items-center gap-1.5 font-mono">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Flagged Bot Farm
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded bg-[#30363d] text-[#8b949e] font-semibold text-xs font-mono">
                        Sub-Threshold
                      </span>
                    )}
                  </div>

                  {/* Lead Time Estimate */}
                  {simResult.isBreakout && (
                    <div className="bg-[#388bfd]/10 border border-[#388bfd]/30 rounded p-3 text-xs flex items-center justify-between">
                      <span className="text-[#e6edf3]">Estimated Early Lead Time:</span>
                      <span className="font-mono font-bold text-[#58a6ff]">
                        +{simResult.leadTime} weeks before trending
                      </span>
                    </div>
                  )}

                  {/* Feature Attribution Waterfall */}
                  <div className="space-y-2 pt-2">
                    <div className="text-xs font-semibold text-[#e6edf3]">
                      Feature Attributions (SHAP Contribution)
                    </div>
                    <div className="space-y-1.5 font-mono text-xs">
                      {simResult.attributions.map((attr, i) => (
                        <div key={i} className="flex items-center justify-between text-[11px] py-1 border-b border-[#30363d]/50">
                          <span className="text-[#8b949e] font-sans">{attr.feature}</span>
                          <div className="flex items-center gap-3">
                            <span className="text-[#e6edf3]">{attr.val}</span>
                            <span
                              className={`w-14 text-right font-semibold ${
                                attr.isPositive ? 'text-[#3fb950]' : 'text-[#f85149]'
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
        {/* VIEW 8: README.MD (PROJECT BLUEPRINT & NARRATIVE)             */}
        {/* Formatted in authentic GitHub Markdown view                  */}
        {/* ------------------------------------------------------------- */}
        {activeTab === 'readme' && (
          <div className="border border-[#30363d] rounded-md bg-[#0d1117] overflow-hidden">
            {/* GitHub File Header */}
            <div className="bg-[#161b22] border-b border-[#30363d] px-4 py-2.5 flex items-center justify-between text-xs text-[#8b949e]">
              <div className="flex items-center gap-2 text-[#e6edf3] font-mono">
                <FileText className="w-4 h-4 text-[#8b949e]" />
                <span>README.md</span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span>154 lines (118 sloc)</span>
                <span>·</span>
                <span>4.82 KB</span>
              </div>
            </div>

            {/* Markdown Body */}
            <article className="p-8 max-w-4xl mx-auto space-y-6 text-sm text-[#e6edf3] leading-relaxed">
              <div className="border-b border-[#30363d] pb-4">
                <h1 className="text-3xl font-extrabold text-[#e6edf3] tracking-tight">
                  Open-Source Pulse
                </h1>
                <p className="text-base text-[#8b949e] mt-2">
                  Predicting Trending GitHub Repositories Early with Apache Spark 3.5, Parquet, GraphFrames & MLlib
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-[#e6edf3] border-b border-[#30363d] pb-1">
                  The Core Idea
                </h2>
                <p className="text-[#8b949e] leading-relaxed">
                  By the time a software project shows up on GitHub&apos;s &ldquo;trending&rdquo; page, it is already popular.
                  This project aims to predict which brand-new open-source projects will explode in popularity
                  (gain at least <strong>500 stars</strong>) up to a <strong>month before they actually trend</strong>.
                </p>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-[#e6edf3] border-b border-[#30363d] pb-1">
                  How It Works (Step-by-Step Breakdown)
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                    <h3 className="font-semibold text-[#58a6ff]">1. Collecting the Data</h3>
                    <p className="text-xs text-[#8b949e] mt-1">
                      The project downloads public GitHub activity (people starring, forking, opening issues, and merging PRs) from the GH Archive database across an 18-month timeline.
                    </p>
                  </div>

                  <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                    <h3 className="font-semibold text-[#3fb950]">2. Cleaning the Noise</h3>
                    <p className="text-xs text-[#8b949e] mt-1">
                      Because the data is massive (1.48B raw events), the system strips out automated CI/CD bot accounts (Renovate, Dependabot) and deduplicates first-stars to measure genuine human interest.
                    </p>
                  </div>

                  <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                    <h3 className="font-semibold text-[#e3b341]">3. Shrinking & Summarizing (Medallion Lakehouse)</h3>
                    <p className="text-xs text-[#8b949e] mt-1">
                      Instead of analyzing every single click, the pipeline summarizes the events into compact weekly snapshots for each candidate repository (reducing 1.48B rows down to 148k rows: a 99.99% shrinkage).
                    </p>
                  </div>

                  <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                    <h3 className="font-semibold text-[#a371f7]">4. Looking for Clues (Feature Engineering & Graph Analytics)</h3>
                    <p className="text-xs text-[#8b949e] mt-1">
                      The system calculates early warning signs: velocity curvature, fork conversion ratios, burstiness anti-spam guards, maintainer PR throughput, and analyzes the co-star network with GraphFrames PageRank to see if related communities are paying attention.
                    </p>
                  </div>

                  <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                    <h3 className="font-semibold text-[#58a6ff]">5. Machine Learning with Zero-Data-Leakage</h3>
                    <p className="text-xs text-[#8b949e] mt-1">
                      A Spark MLlib Gradient-Boosted Trees classifier (depth=6, maxIter=120) scores new projects based on their likelihood of having a breakout in the next 30 days, using a strict 4-week embargo gap to prevent temporal leakage.
                    </p>
                  </div>

                  <div className="p-3 bg-[#161b22] border border-[#30363d] rounded-md">
                    <h3 className="font-semibold text-[#3fb950]">6. Sharing the Results</h3>
                    <p className="text-xs text-[#8b949e] mt-1">
                      The final scores are exported to a serving layer queried with sub-15ms latency by DuckDB and displayed in this GitHub-styled intelligence dashboard.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold text-[#e6edf3] border-b border-[#30363d] pb-1">
                  Why This Project Matters
                </h2>
                <p className="text-[#8b949e] leading-relaxed">
                  This is a classic <strong>Big Data challenge</strong>. Raw GitHub event logs exceed 1.84 Terabytes and cannot fit on a single developer machine.
                  This project demonstrates how to cleverly compress, filter, partition, and organize massive information efficiently using Apache Spark, zstd Parquet, and GraphFrames.
                  Ultimately, it proves that early developer interaction signals allow us to spot the next big open-source foundation <strong>an average of 3.4 weeks before the rest of the world catches on</strong>.
                </p>
              </div>

              <div className="space-y-2 pt-2 border-t border-[#30363d] text-xs font-mono text-[#8b949e]">
                <div>Architecture: Apache Spark 3.5.1 · PyArrow · DuckDB · GraphFrames · MLlib GBT</div>
                <div>Evaluation: PR-AUC 0.614 · Precision@20 80.0% · Lead Time +3.4 weeks · License: MIT</div>
              </div>
            </article>
          </div>
        )}
      </main>

      {/* ------------------------------------------------------------- */}
      {/* 5. GITHUB COMPATIBLE FOOTER                                   */}
      {/* ------------------------------------------------------------- */}
      <footer className="border-t border-[#30363d] bg-[#161b22] py-6 mt-auto text-xs text-[#8b949e]">
        <div className="max-w-[1440px] mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <svg height="20" viewBox="0 0 16 16" width="20" fill="#8b949e">
              <path d="M8 0c4.42 0 8 3.58 8 8a8.013 8.013 0 0 1-5.45 7.59c-.4.08-.55-.17-.55-.38 0-.27.01-1.13.01-2.2 0-.75-.25-1.23-.54-1.48 1.78-.2 3.65-.88 3.65-3.95 0-.88-.31-1.59-.82-2.15.08-.2.36-1.02-.08-2.12 0 0-.67-.22-2.2.82-.64-.18-1.32-.27-2-.27-.68 0-1.36.09-2 .27-1.53-1.03-2.2-.82-2.2-.82-.44 1.1-.16 1.92-.08 2.12-.51.56-.82 1.28-.82 2.15 0 3.06 1.86 3.75 3.64 3.95-.23.2-.44.55-.51 1.07-.46.21-1.61.55-2.33-.66-.15-.24-.6-.83-1.23-.82-.67.01-.27.38.01.53.34.19.73.9.82 1.13.16.45.68 1.31 2.69.94 0 .67.01 1.3.01 1.49 0 .21-.15.45-.55.38A7.995 7.995 0 0 1 0 8c0-4.42 3.58-8 8-8Z" />
            </svg>
            <span>&copy; 2024 Open-Source Pulse Engine</span>
          </div>

          <div className="flex items-center gap-6 flex-wrap">
            <button
              onClick={() => setActiveTab('readme')}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              Docs &amp; Architecture
            </button>
            <button
              onClick={() => setActiveTab('actions')}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              Pipeline Status
            </button>
            <button
              onClick={() => setActiveTab('simulator')}
              className="hover:text-[#58a6ff] transition-colors cursor-pointer"
            >
              Live Simulator
            </button>
            <span className="font-mono text-[#8b949e]">PySpark 3.5 · DuckDB · MIT</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
