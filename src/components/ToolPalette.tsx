"use client";

import React from 'react';
import { useGarmentStore } from '@/store/useGarmentStore';

export default function ToolPalette() {
    const { activeTool, setActiveTool, undo, redo } = useGarmentStore();

    const tools = [
        { id: 'select', icon: 'ads_click', label: 'Select Tool (V)' },
        { id: 'pen', icon: 'edit', label: 'Pen Tool' },
        { id: 'polygon', icon: 'hexagon', label: 'Polygon' },
        { id: 'curve', icon: 'gesture', label: 'Curve' },
    ];

    const editTools = [
        { id: 'cut', icon: 'content_cut', label: 'Edit Pattern' },
        { id: 'measure', icon: 'straighten', label: 'Internal Line' },
        { id: 'seam', icon: 'border_style', label: 'Seam Allowance' },
        { id: 'text', icon: 'title', label: 'Text' },
    ];

    return (
        <aside className="w-16 flex flex-col items-center py-4 gap-2 bg-background-dark border-r border-border-dark shrink-0 z-20 overflow-y-auto">
            <div className="flex flex-col gap-1 w-full px-2">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${activeTool === tool.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'hover:bg-surface-border text-text-secondary hover:text-white'
                            }`}
                        title={tool.label}
                    >
                        <span className="material-symbols-outlined text-[24px]">{tool.icon}</span>
                        <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 flex group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {tool.label}
                        </span>
                    </button>
                ))}

                <div className="h-px w-8 bg-border-dark my-1 mx-auto"></div>

                {editTools.map((tool) => (
                    <button
                        key={tool.id}
                        onClick={() => setActiveTool(tool.id)}
                        className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${activeTool === tool.id
                            ? 'bg-primary text-white shadow-lg shadow-primary/20'
                            : 'hover:bg-surface-border text-text-secondary hover:text-white'
                            }`}
                        title={tool.label}
                    >
                        <span className="material-symbols-outlined text-[24px]">{tool.icon}</span>
                        <span className="absolute left-14 bg-black text-white text-xs px-2 py-1 rounded opacity-0 flex group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                            {tool.label}
                        </span>
                    </button>
                ))}
            </div>

            <div className="mt-auto flex flex-col gap-1 w-full px-2">
                <button
                    onClick={undo}
                    className="flex items-center justify-center w-full h-10 rounded-lg hover:bg-surface-border text-text-secondary hover:text-white transition-colors" title="Undo">
                    <span className="material-symbols-outlined text-[24px]">undo</span>
                </button>
                <button
                    onClick={redo}
                    className="flex items-center justify-center w-full h-10 rounded-lg hover:bg-surface-border text-text-secondary hover:text-white transition-colors" title="Redo">
                    <span className="material-symbols-outlined text-[24px]">redo</span>
                </button>
            </div>
        </aside>
    );
}
