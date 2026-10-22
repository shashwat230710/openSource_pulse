import React from 'react';
import { Sparkles, Network, Database, Sliders, Activity } from 'lucide-react';

export type TabType = 'radar' | 'network' | 'lakehouse' | 'forecast';

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function Header({ activeTab, setActiveTab }: HeaderProps) {
  const tabs = [
    { id: 'radar' as TabType, label: 'Breakout Radar', icon: Activity, count: '148k' },
    { id: 'network' as TabType, label: 'Co-Star Network', icon: Network, count: 'GraphFrames' },
    { id: 'lakehouse' as TabType, label: 'Big Data Lakehouse', icon: Database, count: '1.48B' },
    { id: 'forecast' as TabType, label: 'Verification & What-If', icon: Sliders, count: '80.0% P@10' }
  ];

  return (
    <header className="border-b border-[#30363d] bg-[#161b22]/95 backdrop-blur sticky top-0 z-40 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Main Brand & Metric Row */}
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Subtitle */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#238636] to-[#1f6feb] flex items-center justify-center text-white shadow-md shadow-black/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-[#f0f6fc] tracking-tight">
                  Open-Source Pulse
                </h1>
                <span className="text-[10px] font-mono text-[#3fb950] bg-[#238636]/20 border border-[#238636]/40 px-1.5 py-0.5 rounded font-semibold">
                  Spark 3.5.1
                </span>
              </div>
              <p className="text-xs text-[#8b949e] hidden sm:block">
                Early Breakout Radar for Fast-Growing GitHub Repositories
              </p>
            </div>
          </div>

          {/* Dataset Scale Badges (Desktop) */}
          <div className="hidden lg:flex items-center gap-2 text-xs font-mono">
            <div className="bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded text-[#8b949e]">
              <span className="text-[#3fb950] font-bold">1.48B</span> Events
            </div>
            <div className="bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded text-[#8b949e]">
              <span className="text-[#58a6ff] font-bold">2,184</span> Files
            </div>
            <div className="bg-[#0d1117] border border-[#30363d] px-2.5 py-1 rounded text-[#8b949e]">
              <span className="text-[#bc8cff] font-bold">+3.4w</span> Lead Time
            </div>
          </div>
        </div>

        {/* Tab Navigation Row */}
        <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto pb-0 -mb-px text-sm">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2.5 border-b-2 font-medium transition-all whitespace-nowrap cursor-pointer text-xs sm:text-sm ${
                  isActive
                    ? 'border-[#f78166] text-[#f0f6fc] font-semibold'
                    : 'border-transparent text-[#8b949e] hover:text-[#f0f6fc] hover:border-[#8b949e]'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#f78166]' : 'text-[#8b949e]'}`} />
                <span>{tab.label}</span>
                <span 
                  className={`hidden sm:inline-block text-[11px] font-mono px-1.5 py-0.2 rounded-full ${
                    isActive 
                      ? 'bg-[#f78166]/15 text-[#f78166]' 
                      : 'bg-[#21262d] text-[#8b949e]'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
