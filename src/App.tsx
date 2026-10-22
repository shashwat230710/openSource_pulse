import React, { useState } from 'react';
import Header, { TabType } from './components/Header';
import RadarPage from './pages/RadarPage';
import NetworkPage from './pages/NetworkPage';
import LakehousePage from './pages/LakehousePage';
import ForecastPage from './pages/ForecastPage';

export default function App() {
  const [activeTab, setActiveTab] = useState<TabType>('radar');

  return (
    <div className="min-h-screen bg-[#0d1117] text-[#f0f6fc] flex flex-col font-sans selection:bg-[#58a6ff]/30">
      {/* Header with clean navigation and stats */}
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'radar' && <RadarPage />}
        {activeTab === 'network' && <NetworkPage />}
        {activeTab === 'lakehouse' && <LakehousePage />}
        {activeTab === 'forecast' && <ForecastPage />}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#30363d] bg-[#161b22] py-4 mt-auto text-xs text-[#8b949e] font-mono">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#3fb950]" />
            <span>Run ID: run_t1_2024_03_spark35 · GH Archive Q1 2024 Timeline</span>
          </div>
          <div className="flex items-center gap-3">
            <span>Apache Spark 3.5.1 · GraphFrames · MLlib GBT</span>
            <span>·</span>
            <span>1.48B Events Ingested</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
