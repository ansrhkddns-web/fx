"use client";

import { useGarmentStore } from "@/store/useGarmentStore";
import Header from "@/components/Header";
import ToolPalette from "@/components/ToolPalette";
import PropertiesPanel from "@/components/PropertiesPanel";
import Canvas2D from "@/components/Canvas2D";
import Viewer3D from "@/components/Viewer3D";

export default function Home() {
  const { viewMode, setViewMode } = useGarmentStore();

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-background-dark text-slate-100 font-display">
      <Header />

      {/* Main Workspace Area including ToolPalette and PropertiesPanel */}
      <main className="flex-1 flex overflow-hidden">
        <ToolPalette />

        {/* Center Canvas Area Container */}
        <div className="flex-1 flex flex-col relative bg-[#151b23] overflow-hidden border-r border-border-dark">

          {/* Workspace Toolbar / Breadcrumbs */}
          <div className="h-10 bg-surface-dark border-b border-border-dark flex items-center justify-between px-4 shrink-0 z-10">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-text-secondary">Project 2024</span>
              <span className="text-border-dark">/</span>
              <span className="text-text-secondary">Outerwear</span>
              <span className="text-border-dark">/</span>
              <span className="text-primary font-medium flex items-center gap-1">
                Leather Biker Jacket v3
              </span>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex rounded bg-background-dark p-0.5 border border-border-dark">
                <button
                  onClick={() => setViewMode('2d')}
                  className={`px-3 py-0.5 text-xs rounded transition-colors ${viewMode === '2d' ? 'text-white bg-surface-border shadow-sm' : 'text-text-secondary hover:text-white'}`}
                >
                  2D
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`px-3 py-0.5 text-xs rounded transition-colors ${viewMode === 'split' ? 'text-white bg-surface-border shadow-sm' : 'text-text-secondary hover:text-white'}`}
                >
                  Split
                </button>
                <button
                  onClick={() => setViewMode('3d')}
                  className={`px-3 py-0.5 text-xs rounded transition-colors ${viewMode === '3d' ? 'text-white bg-surface-border shadow-sm' : 'text-text-secondary hover:text-white'}`}
                >
                  3D
                </button>
              </div>
            </div>
          </div>

          {/* Editors Container */}
          <div className="flex-1 flex w-full h-full relative overflow-hidden">
            {/* 2D Viewport */}
            {(viewMode === '2d' || viewMode === 'split') && (
              <section className={`${viewMode === 'split' ? 'flex-[1]' : 'flex-1'} relative flex flex-col border-r border-border-dark bg-[radial-gradient(#2a3645_1px,transparent_1px)] [background-size:20px_20px]`}>
                <div className="absolute top-4 left-4 z-10 bg-surface-dark/90 backdrop-blur border border-border-dark rounded p-2 shadow-lg">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">2D Pattern</h3>
                </div>
                <div className="flex-1 w-full h-full relative">
                  <Canvas2D />
                </div>
              </section>
            )}

            {/* 3D Viewport */}
            {(viewMode === '3d' || viewMode === 'split') && (
              <section className={`${viewMode === 'split' ? 'flex-[1.5]' : 'flex-1'} relative flex flex-col bg-gradient-to-b from-[#0f1216] to-[#1a2129]`}>
                <div className="absolute top-4 right-4 z-10 flex gap-2">
                  <div className="bg-surface-dark/90 backdrop-blur border border-border-dark rounded p-2 shadow-lg flex flex-col items-end">
                    <h3 className="text-xs font-bold text-primary uppercase tracking-wider mb-1 flex items-center gap-1">
                      <span className="block w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                      Live Simulation
                    </h3>
                  </div>
                </div>
                <div className="flex-1 w-full h-full relative">
                  <Viewer3D />
                </div>
              </section>
            )}
          </div>

        </div>

        <PropertiesPanel />
      </main>
    </div>
  );
}
