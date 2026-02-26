"use client";

import React, { useMemo, useState } from 'react';
import { useGarmentStore } from '@/store/useGarmentStore';

const FABRIC_OPTIONS = [
    { id: 'denim', label: 'Denim Raw' },
    { id: 'cotton', label: 'Cotton Twill' },
    { id: 'leather', label: 'Black Leather' },
    { id: 'silk', label: 'Silk Charmeuse' },
    { id: 'wool', label: 'Wool Felt' },
];

const SEAM_STYLES = ['basic', 'topstitch', 'double'] as const;

export default function PropertiesPanel() {
    const [activeTab, setActiveTab] = useState<'properties' | 'library' | 'scene'>('properties');
    const [statusMessage, setStatusMessage] = useState('');
    const [grainline, setGrainline] = useState(0);
    const [seamStyle, setSeamStyle] = useState<typeof SEAM_STYLES[number]>('topstitch');
    const [physicsEnabled, setPhysicsEnabled] = useState(false);

    const {
        width,
        length,
        setWidth,
        setLength,
        activeMaterial,
        setActiveMaterial,
        sceneGraph,
        toggleSceneObject,
        setViewMode,
    } = useGarmentStore();

    const setStatus = (message: string) => {
        setStatusMessage(message);
        window.setTimeout(() => setStatusMessage(''), 2200);
    };

    const area = useMemo(() => (width * length).toFixed(1), [width, length]);

    return (
        <aside className="w-80 flex-none flex flex-col bg-surface-dark border-l border-border-dark z-20 shadow-xl overflow-hidden shrink-0 relative">
            <div className="h-48 bg-black relative border-b border-border-dark group shrink-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520975954732-57dd22299614?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')" }}
                ></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 flex justify-between items-end">
                    <span className="text-white text-xs font-bold">3D Simulation</span>
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode('3d');
                            setStatus('3D 시뮬레이션 뷰로 전환했습니다.');
                        }}
                        className="bg-primary/90 hover:bg-primary text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1"
                    >
                        <span className="material-symbols-outlined text-[12px]">play_arrow</span> SIMULATE
                    </button>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        if (!document.fullscreenElement) {
                            document.documentElement.requestFullscreen().catch(() => setStatus('전체화면 전환에 실패했습니다.'));
                        } else {
                            document.exitFullscreen().catch(() => setStatus('전체화면 종료에 실패했습니다.'));
                        }
                    }}
                    className="absolute top-2 right-2 bg-black/50 p-1 rounded hover:bg-black/70 cursor-pointer"
                >
                    <span className="material-symbols-outlined text-[16px] text-white">open_in_full</span>
                </button>
            </div>

            <div className="flex border-b border-border-dark shrink-0">
                <button
                    type="button"
                    onClick={() => setActiveTab('properties')}
                    className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary bg-surface-dark' : 'text-text-secondary hover:text-white hover:bg-surface-dark/30'}`}
                >
                    PROPERTIES
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('library')}
                    className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeTab === 'library' ? 'text-primary border-b-2 border-primary bg-surface-dark' : 'text-text-secondary hover:text-white hover:bg-surface-dark/30'}`}
                >
                    LIBRARY
                </button>
                <button
                    type="button"
                    onClick={() => setActiveTab('scene')}
                    className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeTab === 'scene' ? 'text-primary border-b-2 border-primary bg-surface-dark' : 'text-text-secondary hover:text-white hover:bg-surface-dark/30'}`}
                >
                    SCENE
                </button>
            </div>

            <div className="flex-1 overflow-y-auto w-full custom-scrollbar">
                {activeTab === 'properties' && (
                    <div className="flex flex-col p-4 gap-6">
                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-white text-sm font-bold flex items-center gap-2">
                                    <span className="material-symbols-outlined text-[16px] text-primary">check_box_outline_blank</span>
                                    Front_Panel_L
                                </h3>
                                <span className="text-xs text-text-secondary bg-border-dark px-2 py-0.5 rounded">ID: 294A</span>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Fabric</label>
                                    <select
                                        value={activeMaterial}
                                        onChange={(event) => setActiveMaterial(event.target.value)}
                                        className="w-full bg-surface-dark border border-border-dark rounded text-xs text-white p-1.5 focus:border-primary focus:ring-0"
                                    >
                                        {FABRIC_OPTIONS.map((option) => (
                                            <option key={option.id} value={option.id}>{option.label}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Grainline</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            className="w-full bg-surface-dark border border-border-dark rounded text-xs text-white p-1.5 focus:border-primary focus:ring-0"
                                            type="number"
                                            value={grainline}
                                            onChange={(event) => setGrainline(Number(event.target.value) || 0)}
                                        />
                                        <span className="text-xs text-text-secondary">deg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border-dark"></div>

                        <div className="flex flex-col gap-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dimensions</h4>
                            <div className="grid grid-cols-2 gap-3 text-xs">
                                <div className="flex flex-col gap-1">
                                    <label className="text-text-secondary">Width</label>
                                    <input
                                        type="number"
                                        value={width}
                                        onChange={(event) => setWidth(Number(event.target.value) || 0)}
                                        className="bg-background-dark border border-border-dark rounded text-white p-1.5"
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-text-secondary">Length</label>
                                    <input
                                        type="number"
                                        value={length}
                                        onChange={(event) => setLength(Number(event.target.value) || 0)}
                                        className="bg-background-dark border border-border-dark rounded text-white p-1.5"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 col-span-2">
                                    <label className="text-text-secondary">Area</label>
                                    <input className="bg-background-dark border border-transparent rounded text-xs text-text-secondary p-1.5" disabled type="text" value={area} />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border-dark"></div>

                        <div className="flex flex-col gap-3">
                            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seam Properties</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {SEAM_STYLES.map((style) => (
                                    <button
                                        key={style}
                                        type="button"
                                        onClick={() => {
                                            setSeamStyle(style);
                                            setStatus(`Seam 스타일: ${style}`);
                                        }}
                                        className={`rounded p-2 flex flex-col items-center gap-1 transition-colors ${seamStyle === style ? 'border border-primary bg-surface-dark' : 'border border-border-dark bg-surface-dark hover:border-primary'}`}
                                    >
                                        <div className={`w-6 h-6 rounded-full border-white ${style === 'basic' ? 'border border-dashed' : style === 'topstitch' ? 'border-2' : 'border-4'}`}></div>
                                        <span className={`text-[9px] ${seamStyle === style ? 'text-white font-medium' : 'text-text-secondary'}`}>{style}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'library' && (
                    <div className="p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Fabric Library</h4>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {FABRIC_OPTIONS.map((mat) => (
                                <button
                                    type="button"
                                    key={mat.id}
                                    onClick={() => {
                                        setActiveMaterial(mat.id);
                                        setStatus(`${mat.label} 적용`);
                                    }}
                                    className={`group relative aspect-square bg-background-dark rounded border cursor-pointer transition-all flex flex-col items-center justify-center text-center p-2 ${activeMaterial === mat.id ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-surface-dark' : 'border-border-dark hover:border-primary'}`}
                                >
                                    <div className="text-xs font-medium text-white">{mat.label}</div>
                                    {activeMaterial === mat.id && (
                                        <div className="absolute top-1 right-1 bg-primary text-white text-[9px] px-1 rounded">Active</div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'scene' && (
                    <div className="p-4">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Scene Objects</h4>
                        <ul className="text-sm space-y-1">
                            {Object.entries(sceneGraph).map(([key, visible]) => (
                                <li
                                    key={key}
                                    onClick={() => {
                                        toggleSceneObject(key);
                                        setStatus(`${key.replace(/_/g, ' ')} ${visible ? '숨김' : '표시'}`);
                                    }}
                                    className="flex items-center gap-2 text-slate-300 p-1 hover:bg-background-dark rounded cursor-pointer"
                                >
                                    <span className={`material-symbols-outlined text-[16px] ${visible ? 'text-slate-500' : 'text-slate-700'}`}>
                                        {visible ? 'visibility' : 'visibility_off'}
                                    </span>
                                    <span className="material-symbols-outlined text-[16px] text-primary">checkroom</span>
                                    <span className={visible ? 'text-white' : 'text-slate-500 line-through'}>{key.replace(/_/g, ' ')}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="p-4 border-t border-border-dark bg-background-dark shrink-0">
                <button
                    type="button"
                    onClick={() => {
                        setPhysicsEnabled((prev) => !prev);
                        setStatus(`Advanced Physics ${!physicsEnabled ? 'ON' : 'OFF'}`);
                    }}
                    className={`w-full text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2 ${physicsEnabled ? 'bg-primary hover:bg-primary/90' : 'bg-border-dark hover:bg-slate-600'}`}
                >
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    Advanced Physics
                </button>
            </div>

            {statusMessage && (
                <div className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-surface-dark border border-border-dark text-slate-200 text-[11px] px-3 py-1.5 rounded shadow-lg">
                    {statusMessage}
                </div>
            )}
        </aside>
    );
}
