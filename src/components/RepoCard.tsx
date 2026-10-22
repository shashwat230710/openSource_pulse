import React, { useState } from 'react';
import { RepoSnapshot } from '../data/pulseData';
import { 
  BookMarked, 
  Star, 
  GitFork, 
  ChevronDown, 
  ChevronUp, 
  TrendingUp, 
  CheckCircle2, 
  AlertTriangle,
  GitPullRequest,
  Clock,
  Activity,
  Layers,
  ArrowUpRight
} from 'lucide-react';

interface RepoCardProps {
  repo: RepoSnapshot;
  isExpanded?: boolean;
  onToggleExpand?: () => void;
}

export default function RepoCard({ repo, isExpanded: externalExpanded, onToggleExpand }: RepoCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const isExpanded = externalExpanded !== undefined ? externalExpanded : internalExpanded;
  const toggle = onToggleExpand || (() => setInternalExpanded(!internalExpanded));

  const scorePct = Math.round(repo.score * 100);
  const isHighProb = repo.score >= 0.80;
  const isMediumProb = repo.score >= 0.50 && repo.score < 0.80;

  // Max star calculation for trajectory bar heights
  const maxWeeklyStars = Math.max(...repo.trajectory.map(t => t.weekly_stars), 1);
  const maxCumStars = Math.max(...repo.trajectory.map(t => t.cumulative_stars), 1);

  return (
    <div 
      className={`rounded-md border transition-all duration-200 ${
        isExpanded 
          ? 'bg-[#161b22] border-[#58a6ff]/60 shadow-lg shadow-black/40' 
          : 'bg-[#161b22] border-[#30363d] hover:border-[#8b949e]/50 hover:bg-[#1c2128]'
      }`}
    >
      {/* GitHub Standard Repository Card Content */}
      <div className="p-4 sm:p-5">
        {/* Repo Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            {/* Book Icon */}
            <BookMarked className="w-4 h-4 text-[#8b949e] shrink-0 mt-1" />
            
            <div className="min-w-0">
              <div className="flex items-center flex-wrap gap-2">
                <a
                  href={`https://github.com/${repo.repo_name}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#58a6ff] hover:underline font-semibold text-base sm:text-lg tracking-tight break-all inline-flex items-center gap-1.5 group"
                  title={`Open https://github.com/${repo.repo_name} on GitHub`}
                >
                  <span>{repo.owner} <span className="text-[#8b949e] font-normal">/</span> {repo.name}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#58a6ff] opacity-70 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all shrink-0" />
                </a>
                
                {/* Public Pill */}
                <span className="text-[11px] font-medium text-[#8b949e] border border-[#30363d] px-2 py-0.5 rounded-full leading-none">
                  Public
                </span>

                {/* Category Pill */}
                <span className="text-[11px] font-mono text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-md leading-none">
                  {repo.category}
                </span>
              </div>
            </div>
          </div>

          {/* Model Breakout Score Pill */}
          <div className="flex items-center gap-2 self-start shrink-0">
            <div 
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${
                isHighProb 
                  ? 'bg-[#238636]/20 border-[#238636]/50 text-[#3fb950]' 
                  : isMediumProb 
                    ? 'bg-[#d29922]/20 border-[#d29922]/50 text-[#d29922]' 
                    : 'bg-[#30363d]/50 border-[#30363d] text-[#8b949e]'
              }`}
              title="Calibrated probability of gaining >=500 stars in the next 4 weeks"
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>{scorePct}% Breakout</span>
            </div>

            {/* Verification Status Tag */}
            {repo.is_breakout ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono bg-[#388bfd]/15 text-[#58a6ff] border border-[#388bfd]/30" title="Model correctly predicted >=500 stars gained in next 4 weeks">
                <CheckCircle2 className="w-3 h-3 text-[#3fb950]" />
                <span>HIT</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-mono bg-[#f85149]/15 text-[#f85149] border border-[#f85149]/30" title="Did not reach 500 stars in 4 weeks (filtered or organic slow)">
                <AlertTriangle className="w-3 h-3" />
                <span>FILTERED</span>
              </span>
            )}
          </div>
        </div>

        {/* Repository Description */}
        <p className="mt-2.5 text-sm text-[#8b949e] leading-relaxed line-clamp-2">
          {repo.description}
        </p>

        {/* Topic Badges (Standard GitHub Style) */}
        {repo.topics && repo.topics.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {repo.topics.map(topic => (
              <span 
                key={topic}
                className="text-xs font-medium text-[#58a6ff] bg-[#388bfd]/10 hover:bg-[#388bfd]/20 px-2.5 py-0.5 rounded-full border border-[#388bfd]/20 transition-colors cursor-pointer"
              >
                {topic}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Metadata Bar (Language, Stars, Forks, Lead Time, Expand Button) */}
        <div className="mt-4 pt-3 border-t border-[#30363d]/60 flex flex-wrap items-center justify-between gap-3 text-xs text-[#8b949e]">
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            {/* Primary Language */}
            {repo.language && (
              <div className="flex items-center gap-1.5">
                <span 
                  className="w-3 h-3 rounded-full inline-block" 
                  style={{ backgroundColor: repo.languageColor || '#8b949e' }}
                />
                <span className="font-medium text-[#e6edf3]">{repo.language}</span>
              </div>
            )}

            {/* Stars Count (Cumulative at snapshot & weekly velocity) */}
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5 text-[#8b949e]" />
              <span className="text-[#e6edf3] font-medium">{repo.stars_cum.toLocaleString()}</span>
              <span className="text-[#3fb950] font-mono text-[11px]">+{repo.stars_w0}/wk</span>
            </div>

            {/* Fork Count */}
            {repo.forksCount !== undefined && (
              <div className="flex items-center gap-1.5">
                <GitFork className="w-3.5 h-3.5 text-[#8b949e]" />
                <span className="text-[#e6edf3] font-medium">{repo.forksCount.toLocaleString()}</span>
              </div>
            )}

            {/* Lead Time Alert */}
            {repo.lead_time_weeks && repo.lead_time_weeks > 0 && (
              <div className="flex items-center gap-1 text-[#bc8cff] font-mono text-[11px] bg-[#bc8cff]/10 px-2 py-0.5 rounded border border-[#bc8cff]/20">
                <Clock className="w-3 h-3" />
                <span>+{repo.lead_time_weeks}w Lead Time</span>
              </div>
            )}

            {/* Growth Ratio */}
            <div className="hidden sm:flex items-center gap-1 text-[11px] font-mono">
              <span className="text-[#8b949e]">Accel:</span>
              <span className="text-[#e6edf3] font-bold">{repo.growth_ratio.toFixed(1)}x</span>
            </div>
          </div>

          {/* Action Buttons: View on GitHub & Expand Deep Analysis */}
          <div className="flex items-center gap-2">
            <a
              href={`https://github.com/${repo.repo_name}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 text-xs font-medium text-[#8b949e] hover:text-[#f0f6fc] px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] transition-colors border border-transparent hover:border-[#30363d]"
              title={`View ${repo.repo_name} repository on GitHub`}
            >
              <span>GitHub</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[#58a6ff]" />
            </a>

            <button 
              onClick={toggle}
              className="flex items-center gap-1.5 text-xs font-medium text-[#58a6ff] hover:text-[#79c0ff] px-2.5 py-1 rounded bg-[#21262d] hover:bg-[#30363d] transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Hide Analysis' : 'Inspect Breakout Signals'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </div>

      {/* In-Depth Breakout Analysis Expandable Section */}
      {isExpanded && (
        <div className="border-t border-[#30363d] bg-[#0d1117]/80 p-4 sm:p-6 space-y-6 animate-fadeIn">
          {/* Analysis Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#30363d]">
            <div>
              <span className="text-[11px] font-mono uppercase tracking-wider text-[#58a6ff] font-semibold">
                Spark MLlib + GraphFrames Feature Decomposition
              </span>
              <h4 className="text-base font-bold text-[#e6edf3] mt-0.5">
                Why Model Predicted Breakout for {repo.repo_name}
              </h4>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-[#8b949e]">Observation Date:</span>
              <span className="text-[#e6edf3] bg-[#21262d] px-2 py-0.5 rounded">{repo.week_start}</span>
              <a
                href={`https://github.com/${repo.repo_name}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-[11px] text-[#58a6ff] hover:text-[#79c0ff] bg-[#21262d] hover:bg-[#30363d] border border-[#30363d] px-2 py-0.5 rounded transition-colors ml-1"
                title={`Open ${repo.repo_name} on GitHub`}
              >
                <span>GitHub repo</span>
                <ArrowUpRight className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* 1. Growth Trajectory Chart & Lead Time Verification */}
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-[#e6edf3] flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-[#3fb950]" />
                Historical Weekly Stars &amp; Cumulative Trajectory
              </span>
              <span className="font-mono text-[#8b949e] text-[11px]">
                Actual +4w Outcome: <strong className="text-[#3fb950]">+{repo.actual_stars_next_4w.toLocaleString()} stars</strong>
              </span>
            </div>

            {/* Trajectory Small Multiples Bar + Line Visualizer */}
            <div className="bg-[#161b22] border border-[#30363d] p-4 rounded-md">
              <div className="h-32 flex items-end gap-2 sm:gap-4 pt-6 px-2">
                {repo.trajectory.map((point, idx) => {
                  const barHeightPct = Math.max(12, Math.round((point.weekly_stars / maxWeeklyStars) * 100));
                  const isSnapshotPoint = point.week_start === repo.week_start;
                  const isLeadPoint = repo.officialTrendingDate === point.week_start;

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group relative">
                      {/* Tooltip on Hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-[#21262d] border border-[#30363d] text-[10px] font-mono px-2 py-1 rounded whitespace-nowrap z-20 pointer-events-none text-white shadow-md">
                        <div>{point.week_start}</div>
                        <div className="text-[#3fb950]">+{point.weekly_stars} stars/wk</div>
                        <div className="text-[#8b949e]">Cum: {point.cumulative_stars.toLocaleString()}</div>
                      </div>

                      {/* Bar Value Indicator */}
                      <span className="text-[10px] font-mono text-[#8b949e] group-hover:text-white transition-colors">
                        +{point.weekly_stars >= 1000 ? `${(point.weekly_stars / 1000).toFixed(1)}k` : point.weekly_stars}
                      </span>

                      {/* Bar Pillar */}
                      <div 
                        className={`w-full rounded-t transition-all ${
                          isSnapshotPoint 
                            ? 'bg-[#3fb950] ring-2 ring-[#3fb950]/40' 
                            : point.week_offset > (repo.flag_week || 2)
                              ? 'bg-[#238636]/60 hover:bg-[#238636]'
                              : 'bg-[#30363d] hover:bg-[#58a6ff]'
                        }`}
                        style={{ height: `${barHeightPct}%` }}
                      />

                      {/* Week Label */}
                      <span className={`text-[10px] font-mono truncate max-w-full ${isSnapshotPoint ? 'text-[#3fb950] font-bold' : 'text-[#8b949e]'}`}>
                        {point.week_start.slice(5)}
                      </span>

                      {/* Marker Pill */}
                      {isSnapshotPoint && (
                        <span className="absolute -bottom-5 text-[9px] font-mono text-[#3fb950] uppercase tracking-tighter whitespace-nowrap">
                          Flagged
                        </span>
                      )}
                      {isLeadPoint && (
                        <span className="absolute -bottom-5 text-[9px] font-mono text-[#bc8cff] uppercase tracking-tighter whitespace-nowrap">
                          Trending
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Trajectory Key Note */}
              <div className="mt-7 pt-3 border-t border-[#30363d]/60 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#8b949e] font-mono">
                <div className="flex items-center gap-4">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#3fb950] rounded-sm inline-block" />
                    Model Detection Snapshot ({repo.stars_cum} stars)
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 bg-[#238636]/60 rounded-sm inline-block" />
                    Subsequent Realized Stars
                  </span>
                </div>
                {repo.officialTrendingDate && (
                  <span className="text-[#bc8cff]">
                    GitHub Trending Explorer picked up on: {repo.officialTrendingDate} (+{repo.lead_time_weeks}w later)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* 2. Key Signal Drivers / Feature Attribution */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[#e6edf3] flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#58a6ff]" />
              Signal Attribution &amp; Quality Filters
            </span>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
              {/* Velocity & Acceleration */}
              <div className="bg-[#161b22] border border-[#30363d] p-3 rounded space-y-1">
                <span className="text-[#8b949e] text-[11px] font-mono">Velocity Acceleration</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-[#e6edf3] font-mono">{repo.growth_ratio.toFixed(2)}x</span>
                  <span className="text-[11px] text-[#3fb950] font-mono">w0: +{repo.stars_w0} / w1: {repo.stars_w1}</span>
                </div>
                <p className="text-[11px] text-[#8b949e] leading-snug">
                  Rate of star inflection vs prior 7 days.
                </p>
              </div>

              {/* Fork / Star Ratio */}
              <div className="bg-[#161b22] border border-[#30363d] p-3 rounded space-y-1">
                <span className="text-[#8b949e] text-[11px] font-mono">Fork / Star Conversion</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-[#e6edf3] font-mono">{(repo.fork_star_ratio * 100).toFixed(1)}%</span>
                  <span className={`text-[11px] font-mono ${repo.fork_star_ratio >= 0.12 ? 'text-[#3fb950]' : 'text-[#d29922]'}`}>
                    {repo.fork_star_ratio >= 0.12 ? 'High Dev Utility' : 'Bookmark Heavy'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8b949e] leading-snug">
                  Developers running code vs casual bookmarking.
                </p>
              </div>

              {/* Burstiness Index */}
              <div className="bg-[#161b22] border border-[#30363d] p-3 rounded space-y-1">
                <span className="text-[#8b949e] text-[11px] font-mono">Burstiness Index</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-[#e6edf3] font-mono">{repo.burstiness.toFixed(2)}</span>
                  <span className={`text-[11px] font-mono ${repo.burstiness <= 0.35 ? 'text-[#3fb950]' : 'text-[#f85149]'}`}>
                    {repo.burstiness <= 0.35 ? 'Organic Spread' : 'Single-Day Spike'}
                  </span>
                </div>
                <p className="text-[11px] text-[#8b949e] leading-snug">
                  Max day share; penalizes artificial bot pushes.
                </p>
              </div>

              {/* GraphFrames PageRank */}
              <div className="bg-[#161b22] border border-[#30363d] p-3 rounded space-y-1">
                <span className="text-[#8b949e] text-[11px] font-mono">GraphFrames PageRank</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold text-[#e6edf3] font-mono">{repo.pagerank.toFixed(3)}</span>
                  <span className="text-[11px] text-[#bc8cff] font-mono">Rank Top 1.2%</span>
                </div>
                <p className="text-[11px] text-[#8b949e] leading-snug">
                  Eigenvector centrality across co-stargazers.
                </p>
              </div>
            </div>

            {/* Additional Maintainer Activity Bar */}
            <div className="bg-[#161b22] border border-[#30363d] p-3 rounded flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
              <div className="flex items-center gap-2">
                <GitPullRequest className="w-3.5 h-3.5 text-[#58a6ff]" />
                <span className="text-[#8b949e]">PRs Merged (4W):</span>
                <span className="text-[#e6edf3] font-bold">{repo.prs_merged_4w}</span>
                <span className="text-[#8b949e]">({repo.prs_opened_4w} opened)</span>
              </div>
              <div>
                <span className="text-[#8b949e]">Pushes (4W):</span>
                <span className="text-[#e6edf3] font-bold ml-1">{repo.pushes_4w} commits</span>
              </div>
              <div>
                <span className="text-[#8b949e]">Active Days:</span>
                <span className="text-[#e6edf3] font-bold ml-1">{repo.active_days_4w}/28 days</span>
              </div>
              <div>
                <span className="text-[#8b949e]">Community:</span>
                <span className="text-[#bc8cff] ml-1">{repo.community_name}</span>
              </div>
            </div>
          </div>

          {/* 3. Nearest Co-Star Neighbors */}
          {repo.nearest_costars && repo.nearest_costars.length > 0 && (
            <div className="space-y-2 pt-1">
              <span className="text-xs font-semibold text-[#e6edf3]">
                GraphFrames Bipartite Co-Star Neighbors (Shared High-Activity Stargazers):
              </span>
              <div className="flex flex-wrap gap-2">
                {repo.nearest_costars.map((cs, i) => (
                  <a
                    key={i}
                    href={`https://github.com/${cs.repo_name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 bg-[#161b22] hover:bg-[#21262d] border border-[#30363d] hover:border-[#58a6ff]/50 px-3 py-1.5 rounded text-xs font-mono group transition-all"
                    title={`Open https://github.com/${cs.repo_name} on GitHub`}
                  >
                    <span className="text-[#58a6ff] group-hover:underline flex items-center gap-1">
                      {cs.repo_name}
                      <ArrowUpRight className="w-3 h-3 text-[#58a6ff] opacity-60 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                    </span>
                    <span className="text-[#8b949e] text-[11px]">({cs.shared_stargazers} shared)</span>
                    <span className="text-[#3fb950] text-[10px] bg-[#3fb950]/15 px-1.5 py-0.5 rounded">
                      Score: {Math.round(cs.score * 100)}%
                    </span>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
