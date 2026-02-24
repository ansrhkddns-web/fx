"use client";

import React, { useState } from 'react';
import { useGarmentStore } from '@/store/useGarmentStore';

export default function PropertiesPanel() {
    const [activeTab, setActiveTab] = useState<'properties' | 'library' | 'scene'>('properties');
    const { width, length, setWidth, setLength, activeMaterial, setActiveMaterial, sceneGraph, toggleSceneObject } = useGarmentStore();

    return (
        <aside className="w-80 flex-none flex flex-col bg-surface-dark border-l border-border-dark z-20 shadow-xl overflow-hidden shrink-0">
            {/* Mini 3D Preview */}
            <div className="h-48 bg-black relative border-b border-border-dark group shrink-0">
                <div
                    className="absolute inset-0 bg-cover bg-center opacity-80"
                    style={{ backgroundImage: "url('https://images.unsplash.com/photo-1520975954732-57dd22299614?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=80')" }}
                ></div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-3 flex justify-between items-end">
                    <span className="text-white text-xs font-bold">3D Simulation</span>
                    <button className="bg-primary/90 hover:bg-primary text-white text-[10px] font-bold px-2 py-1 rounded flex items-center gap-1">
                        <span className="material-symbols-outlined text-[12px]">play_arrow</span> SIMULATE
                    </button>
                </div>
                <div className="absolute top-2 right-2 bg-black/50 p-1 rounded hover:bg-black/70 cursor-pointer">
                    <span className="material-symbols-outlined text-[16px] text-white">open_in_full</span>
                </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border-dark shrink-0">
                <button
                    onClick={() => setActiveTab('properties')}
                    className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeTab === 'properties' ? 'text-primary border-b-2 border-primary bg-surface-dark' : 'text-text-secondary hover:text-white hover:bg-surface-dark/30'}`}
                >
                    PROPERTIES
                </button>
                <button
                    onClick={() => setActiveTab('library')}
                    className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeTab === 'library' ? 'text-primary border-b-2 border-primary bg-surface-dark' : 'text-text-secondary hover:text-white hover:bg-surface-dark/30'}`}
                >
                    LIBRARY
                </button>
                <button
                    onClick={() => setActiveTab('scene')}
                    className={`flex-1 py-3 text-[11px] font-bold transition-colors ${activeTab === 'scene' ? 'text-primary border-b-2 border-primary bg-surface-dark' : 'text-text-secondary hover:text-white hover:bg-surface-dark/30'}`}
                >
                    SCENE
                </button>
            </div>

            {/* Content Area */}
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
                                    <select className="w-full bg-surface-dark border border-border-dark rounded text-xs text-white p-1.5 focus:border-primary focus:ring-0">
                                        <option>Denim Raw 12oz</option>
                                        <option>Cotton Twill</option>
                                        <option>Silk Charmeuse</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] uppercase font-bold text-text-secondary tracking-wider">Grainline</label>
                                    <div className="flex items-center gap-2">
                                        <input className="w-full bg-surface-dark border border-border-dark rounded text-xs text-white p-1.5 focus:border-primary focus:ring-0" type="number" defaultValue="0" />
                                        <span className="text-xs text-text-secondary">deg</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border-dark"></div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between cursor-pointer group">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Dimensions</h4>
                                <span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:text-white">expand_less</span>
                            </div>
                            <div className="grid grid-cols-2 gap-y-3 gap-x-2">
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-text-secondary">Width (cm)</label>
                                    <input
                                        className="bg-surface-dark border border-border-dark rounded text-xs text-white p-1.5 focus:border-primary focus:outline-none"
                                        type="number"
                                        value={width}
                                        onChange={(e) => setWidth(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-[10px] text-text-secondary">Height (cm)</label>
                                    <input
                                        className="bg-surface-dark border border-border-dark rounded text-xs text-white p-1.5 focus:border-primary focus:outline-none"
                                        type="number"
                                        value={length}
                                        onChange={(e) => setLength(Number(e.target.value))}
                                    />
                                </div>
                                <div className="flex flex-col gap-1 col-span-2">
                                    <label className="text-[10px] text-text-secondary">Area (cm²)</label>
                                    <input className="bg-background-dark border border-transparent rounded text-xs text-text-secondary p-1.5" disabled type="text" value={(width * length).toFixed(1)} />
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-border-dark"></div>

                        <div className="flex flex-col gap-3">
                            <div className="flex items-center justify-between cursor-pointer group">
                                <h4 className="text-xs font-bold text-white uppercase tracking-wider">Seam Properties</h4>
                                <span className="material-symbols-outlined text-[16px] text-text-secondary group-hover:text-white">expand_less</span>
                            </div>
                            <div className="grid grid-cols-3 gap-2">
                                <div className="bg-surface-dark border border-border-dark rounded p-2 flex flex-col items-center gap-1 hover:border-primary cursor-pointer transition-colors">
                                    <div className="w-6 h-6 rounded-full border border-dashed border-white"></div>
                                    <span className="text-[9px] text-text-secondary">Basic</span>
                                </div>
                                <div className="bg-surface-dark border border-primary rounded p-2 flex flex-col items-center gap-1 cursor-pointer">
                                    <div className="w-6 h-6 rounded-full border-2 border-white"></div>
                                    <span className="text-[9px] text-white font-medium">Topstitch</span>
                                </div>
                                <div className="bg-surface-dark border border-border-dark rounded p-2 flex flex-col items-center gap-1 hover:border-primary cursor-pointer transition-colors">
                                    <div className="w-6 h-6 rounded-full border-4 double border-white"></div>
                                    <span className="text-[9px] text-text-secondary">Double</span>
                                </div>
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
                            {[
                                { id: 'denim', label: 'Denim Raw' },
                                { id: 'cotton', label: 'Cotton Twill' },
                                { id: 'leather', label: 'Black Leather' },
                                { id: 'silk', label: 'Silk Charmeuse' },
                                { id: 'wool', label: 'Wool Felt' },
                            ].map(mat => (
                                <div
                                    key={mat.id}
                                    onClick={() => setActiveMaterial(mat.id)}
                                    className={`group relative aspect-square bg-background-dark rounded border cursor-pointer transition-all flex flex-col items-center justify-center text-center p-2 ${activeMaterial === mat.id ? 'border-primary ring-2 ring-primary ring-offset-1 ring-offset-surface-dark' : 'border-border-dark hover:border-primary'}`}
                                >
                                    <div className="text-xs font-medium text-white">{mat.label}</div>
                                    {activeMaterial === mat.id && (
                                        <div className="absolute top-1 right-1 bg-primary text-white text-[9px] px-1 rounded">Active</div>
                                    )}
                                </div>
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
                                    onClick={() => toggleSceneObject(key)}
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
                <button className="w-full bg-border-dark hover:bg-slate-600 text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-2">
                    <span className="material-symbols-outlined text-[16px]">tune</span>
                    Advanced Physics
                </button>
            </div>
        </aside>
    );
}
