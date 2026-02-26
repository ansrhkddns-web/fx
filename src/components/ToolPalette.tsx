"use client";

import React, { useEffect, useRef, useState } from 'react';
import { useGarmentStore } from '@/store/useGarmentStore';

export default function ToolPalette() {
    const { activeTool, setActiveTool, undo, redo } = useGarmentStore();
    const [statusMessage, setStatusMessage] = useState('');
    const statusTimeoutRef = useRef<number | null>(null);

    const setStatus = (message: string) => {
        setStatusMessage(message);
        if (statusTimeoutRef.current !== null) {
            window.clearTimeout(statusTimeoutRef.current);
        }
        statusTimeoutRef.current = window.setTimeout(() => setStatusMessage(''), 2000);
    };

    useEffect(() => {
        return () => {
            if (statusTimeoutRef.current !== null) {
                window.clearTimeout(statusTimeoutRef.current);
            }
        };
    }, []);

    const tools = [
        { id: 'select', icon: 'ads_click', label: 'Select Tool (V)' },
        { id: 'pen', icon: 'edit', label: 'Pen Tool' },
        { id: 'polygon', icon: 'hexagon', label: 'Polygon', fallbackTool: 'pen' },
        { id: 'curve', icon: 'gesture', label: 'Curve', fallbackTool: 'pen' },
    ];

    const editTools = [
        { id: 'cut', icon: 'content_cut', label: 'Edit Pattern' },
        { id: 'measure', icon: 'straighten', label: 'Internal Line', fallbackTool: 'cut' },
        { id: 'seam', icon: 'border_style', label: 'Seam Allowance', fallbackTool: 'cut' },
        { id: 'text', icon: 'title', label: 'Text', fallbackTool: 'cut' },
    ];

    const handleToolClick = (toolId: string, label: string, fallbackTool?: string) => {
        if (fallbackTool) {
            setActiveTool(fallbackTool);
            setStatus(`${label}은(는) 현재 ${fallbackTool.toUpperCase()} 워크플로우로 연결됩니다.`);
            return;
        }

        setActiveTool(toolId);
        setStatus(`${label} 활성화`);
    };

    return (
        <aside className="w-16 flex flex-col items-center py-4 gap-2 bg-background-dark border-r border-border-dark shrink-0 z-20 overflow-y-auto relative">
            <div className="flex flex-col gap-1 w-full px-2">
                {tools.map((tool) => (
                    <button
                        key={tool.id}
                        type="button"
                        onClick={() => handleToolClick(tool.id, tool.label, tool.fallbackTool)}
                        className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${activeTool === tool.id || activeTool === tool.fallbackTool
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
                        type="button"
                        onClick={() => handleToolClick(tool.id, tool.label, tool.fallbackTool)}
                        className={`group relative flex items-center justify-center w-full h-10 rounded-lg transition-colors ${activeTool === tool.id || activeTool === tool.fallbackTool
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
                    type="button"
                    onClick={() => {
                        undo();
                        setStatus('Undo 실행');
                    }}
                    className="flex items-center justify-center w-full h-10 rounded-lg hover:bg-surface-border text-text-secondary hover:text-white transition-colors"
                    title="Undo"
                >
                    <span className="material-symbols-outlined text-[24px]">undo</span>
                </button>
                <button
                    type="button"
                    onClick={() => {
                        redo();
                        setStatus('Redo 실행');
                    }}
                    className="flex items-center justify-center w-full h-10 rounded-lg hover:bg-surface-border text-text-secondary hover:text-white transition-colors"
                    title="Redo"
                >
                    <span className="material-symbols-outlined text-[24px]">redo</span>
                </button>
            </div>

            {statusMessage && (
                <div className="absolute bottom-2 left-20 w-52 bg-surface-dark border border-border-dark text-[11px] text-slate-200 px-2 py-1 rounded shadow-lg">
                    {statusMessage}
                </div>
            )}
        </aside>
    );
}
