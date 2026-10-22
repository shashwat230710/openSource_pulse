import React, { useState, useMemo } from 'react';
import { REPOSITORY_CANDIDATES, RepoSnapshot } from '../data/pulseData';
import RepoCard from '../components/RepoCard';
import { Search, Filter, Sparkles, TrendingUp, CheckCircle2, AlertCircle, ArrowUpDown } from 'lucide-react';

export default function RadarPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'high_prob' | 'hits' | 'high_growth'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'score' | 'stars_w0' | 'growth_ratio' | 'stars_cum'>('score');
  const [expandedAll, setExpandedAll] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    REPOSITORY_CANDIDATES.forEach(r => set.add(r.category));
    return ['all', ...Array.from(set)];
  }, []);

  // Filter and sort candidates
  const filteredRepos = useMemo(() => {
    return REPOSITORY_CANDIDATES.filter(repo => {
      // Search matches
      const matchesSearch = 
        repo.repo_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.language?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        repo.topics?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));

      if (!matchesSearch) return false;

      // Filter types
      if (filterType === 'high_prob' && repo.score < 0.80) return false;
      if (filterType === 'hits' && !repo.is_breakout) return false;
      if (filterType === 'high_growth' && repo.growth_ratio < 3.0) return false;

      // Category filter
      if (selectedCategory !== 'all' && repo.category !== selectedCategory) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'score') return b.score - a.score;
      if (sortBy === 'stars_w0') return b.stars_w0 - a.stars_w0;
      if (sortBy === 'growth_ratio') return b.growth_ratio - a.growth_ratio;
      if (sortBy === 'stars_cum') return b.stars_cum - a.stars_cum;
      return 0;
    });
  }, [searchQuery, filterType, selectedCategory, sortBy]);

  return (
    <div className="space-y-6">
      {/* Overview & Key Signal Banner */}
      <div className="bg-[#161b22] border border-[#30363d] rounded-lg p-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-wider text-[#58a6ff] font-semibold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-[#3fb950]" />
                Breakout Forecast Desk · Test Observations
              </span>
              <span className="text-xs font-mono text-[#8b949e]">· Window: Q1 2024</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-[#f0f6fc] tracking-tight">
              Early-Stage Breakout Repositories (20–300 Stars)
            </h2>
            <p className="text-sm text-[#8b949e] max-w-3xl leading-relaxed">
              Repositories monitored at early infancy (20–300 cumulative stars) ranked by the calibrated 
              probability of gaining &ge;500 stars in the next 4 weeks. Click on any repository box below 
              to inspect the growth curve trajectory and the PySpark feature drivers behind the score.
            </p>
          </div>

          <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 sm:border-l border-[#30363d] pt-3 sm:pt-0 sm:pl-6 shrink-0 gap-1 font-mono text-xs">
            <div className="text-[#8b949e]">Candidate Base Rate</div>
            <div className="text-lg font-bold text-[#f0f6fc]">0.86%</div>
            <div className="text-[11px] text-[#3fb950]">Model Lift: 93.0x</div>
          </div>
        </div>
      </div>

      {/* Search, Filter & Controls Toolbar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-[#8b949e] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search repositories by name, language, or topic..."
              className="w-full bg-[#161b22] border border-[#30363d] rounded-md pl-9 pr-4 py-2 text-sm text-[#f0f6fc] placeholder-[#8b949e] focus:outline-none focus:border-[#58a6ff] focus:ring-1 focus:ring-[#58a6ff] transition-all"
            />
          </div>

          {/* Sort & Bulk Expand Controls */}
          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Sort Selector */}
            <div className="flex items-center gap-1.5 bg-[#161b22] border border-[#30363d] rounded-md px-2.5 py-1.5 text-xs text-[#8b949e]">
              <ArrowUpDown className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sort:</span>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-transparent text-[#f0f6fc] font-medium focus:outline-none cursor-pointer"
              >
                <option value="score" className="bg-[#161b22] text-[#f0f6fc]">Breakout Probability</option>
                <option value="stars_w0" className="bg-[#161b22] text-[#f0f6fc]">Weekly Velocity (w0)</option>
                <option value="growth_ratio" className="bg-[#161b22] text-[#f0f6fc]">Growth Ratio (Accel)</option>
                <option value="stars_cum" className="bg-[#161b22] text-[#f0f6fc]">Snapshot Stars</option>
              </select>
            </div>

            {/* Expand / Collapse All Toggle */}
            <button
              onClick={() => setExpandedAll(!expandedAll)}
              className="text-xs font-medium text-[#8b949e] hover:text-[#f0f6fc] bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] rounded-md px-3 py-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              {expandedAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-[#8b949e] mr-1 hidden sm:inline">Filter:</span>
            {[
              { id: 'all', label: 'All Candidates' },
              { id: 'high_prob', label: 'High Prob (≥80%)' },
              { id: 'hits', label: 'Verified Hits' },
              { id: 'high_growth', label: 'Rapid Inflection (≥3x)' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilterType(f.id as any)}
                className={`px-2.5 py-1 rounded-md transition-colors cursor-pointer ${
                  filterType === f.id
                    ? 'bg-[#238636] text-white font-semibold'
                    : 'bg-[#21262d] text-[#8b949e] hover:text-[#f0f6fc] hover:bg-[#30363d]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-1 text-[#8b949e] text-xs">
            <span>Domain:</span>
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="bg-[#21262d] text-[#f0f6fc] border border-[#30363d] rounded px-2 py-0.5 text-xs focus:outline-none cursor-pointer"
            >
              {categories.map(cat => (
                <option key={cat} value={cat} className="bg-[#161b22] text-[#f0f6fc]">
                  {cat === 'all' ? 'All Domains' : cat}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Repository Cards (Middle Boxes with authentic GitHub Theme) */}
      <div className="space-y-3.5">
        <div className="flex items-center justify-between text-xs text-[#8b949e] font-mono px-1">
          <span>Showing {filteredRepos.length} candidate repositories</span>
          <span>Ranked by GBT + GraphFrames probability</span>
        </div>

        {filteredRepos.length === 0 ? (
          <div className="p-12 text-center border border-dashed border-[#30363d] rounded-lg bg-[#161b22] space-y-2">
            <AlertCircle className="w-8 h-8 text-[#8b949e] mx-auto" />
            <h4 className="text-base font-semibold text-[#f0f6fc]">No repositories match your filter</h4>
            <p className="text-xs text-[#8b949e]">
              Try adjusting your search query or reset filter to "All Candidates".
            </p>
            <button
              onClick={() => { setSearchQuery(''); setFilterType('all'); setSelectedCategory('all'); }}
              className="mt-2 text-xs text-[#58a6ff] hover:underline cursor-pointer"
            >
              Reset all filters
            </button>
          </div>
        ) : (
          filteredRepos.map(repo => (
            <RepoCard
              key={repo.repo_id}
              repo={repo}
              isExpanded={expandedAll ? true : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
