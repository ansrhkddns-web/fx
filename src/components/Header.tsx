"use client";

import React, { useMemo, useRef, useState } from 'react';
import { useGarmentStore, ProjectSnapshot } from '@/store/useGarmentStore';

const DOWNLOAD_FILE_NAME = 'fashioncad-project.json';

export default function Header() {
    const [activeMenu, setActiveMenu] = useState<'file' | 'edit' | 'view' | 'help' | null>(null);
    const [statusMessage, setStatusMessage] = useState<string>('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        setViewMode,
        viewMode,
        undo,
        redo,
        clearProject,
        loadProject,
        getProjectSnapshot,
        setActiveTool,
    } = useGarmentStore();

    const setStatus = (message: string) => {
        setStatusMessage(message);
        window.setTimeout(() => setStatusMessage(''), 2500);
    };

    const menuItems = useMemo(() => ([
        {
            key: 'file' as const,
            label: 'File',
            items: [
                {
                    label: 'New Project',
                    action: () => {
                        clearProject();
                        setStatus('새 프로젝트로 초기화되었습니다.');
                    },
                },
                {
                    label: 'Save (Download JSON)',
                    action: () => {
                        const project = getProjectSnapshot();
                        const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
                        const url = URL.createObjectURL(blob);
                        const anchor = document.createElement('a');
                        anchor.href = url;
                        anchor.download = DOWNLOAD_FILE_NAME;
                        document.body.appendChild(anchor);
                        anchor.click();
                        anchor.remove();
                        URL.revokeObjectURL(url);
                        setStatus('프로젝트 파일이 저장되었습니다.');
                    },
                },
                {
                    label: 'Open (Load JSON)',
                    action: () => {
                        fileInputRef.current?.click();
                    },
                },
            ],
        },
        {
            key: 'edit' as const,
            label: 'Edit',
            items: [
                { label: 'Undo', action: undo },
                { label: 'Redo', action: redo },
                {
                    label: 'Select Tool',
                    action: () => {
                        setActiveTool('select');
                        setStatus('선택 도구로 전환했습니다.');
                    },
                },
                {
                    label: 'Pen Tool',
                    action: () => {
                        setActiveTool('pen');
                        setStatus('펜 도구로 전환했습니다.');
                    },
                },
            ],
        },
        {
            key: 'view' as const,
            label: 'View',
            items: [
                { label: '2D View', action: () => setViewMode('2d') },
                { label: 'Split View', action: () => setViewMode('split') },
                { label: '3D View', action: () => setViewMode('3d') },
            ],
        },
        {
            key: 'help' as const,
            label: 'Help',
            items: [
                {
                    label: 'Shortcut Guide',
                    action: () => setStatus('단축키: Esc / Enter / Backspace / Delete / Ctrl(Cmd)+Z / Ctrl(Cmd)+Y'),
                },
            ],
        },
    ]), [clearProject, getProjectSnapshot, redo, setActiveTool, setViewMode, undo]);

    const handleMenuAction = (action: () => void) => {
        action();
        setActiveMenu(null);
    };

    const handleLoadFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const parsed = JSON.parse(text) as ProjectSnapshot;
            const loaded = loadProject(parsed);
            setStatus(loaded ? '프로젝트를 불러왔습니다.' : '파일 형식이 올바르지 않습니다.');
        } catch {
            setStatus('파일을 읽는 중 오류가 발생했습니다.');
        } finally {
            event.target.value = '';
        }
    };

    return (
        <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-6 py-3 bg-surface-dark z-20">
            <div className="flex items-center gap-4 text-white">
                <div className="size-6 text-primary">
                    <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
                </div>
                <h2 className="text-white text-lg font-bold leading-tight tracking-tight">FashionCAD Pro</h2>
            </div>

            <div className="flex flex-1 justify-end gap-6 items-center">
                <nav className="hidden md:flex items-center gap-4 relative">
                    {menuItems.map((menu) => (
                        <div key={menu.key} className="relative">
                            <button
                                type="button"
                                className={`text-sm font-medium leading-normal transition-colors ${activeMenu === menu.key ? 'text-white border-b-2 border-primary pb-0.5' : 'text-slate-400 hover:text-white'}`}
                                onClick={() => setActiveMenu((prev) => (prev === menu.key ? null : menu.key))}
                            >
                                {menu.label}
                            </button>

                            {activeMenu === menu.key && (
                                <div className="absolute top-8 left-0 min-w-48 bg-background-dark border border-border-dark rounded-md shadow-xl z-50 py-1">
                                    {menu.items.map((item) => (
                                        <button
                                            key={item.label}
                                            type="button"
                                            onClick={() => handleMenuAction(item.action)}
                                            className="w-full text-left px-3 py-2 text-sm text-slate-200 hover:bg-surface-border"
                                        >
                                            {item.label}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </nav>

                <div className="w-px h-6 bg-border-dark mx-2"></div>

                <div className="flex gap-3 items-center">
                    <button
                        type="button"
                        onClick={() => {
                            setViewMode('3d');
                            setStatus('3D 렌더 뷰로 전환했습니다.');
                        }}
                        className="flex cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal transition-colors shadow-lg shadow-primary/20"
                    >
                        <span className="truncate">Render</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => {
                            const project = getProjectSnapshot();
                            const blob = new Blob([JSON.stringify(project, null, 2)], { type: 'application/json' });
                            const url = URL.createObjectURL(blob);
                            const anchor = document.createElement('a');
                            anchor.href = url;
                            anchor.download = DOWNLOAD_FILE_NAME;
                            document.body.appendChild(anchor);
                            anchor.click();
                            anchor.remove();
                            URL.revokeObjectURL(url);
                            setStatus('프로젝트 파일이 저장되었습니다.');
                        }}
                        className="flex cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-border-dark hover:bg-slate-600 text-white text-sm font-bold leading-normal transition-colors"
                    >
                        <span className="truncate">Save</span>
                    </button>

                    <div className="flex gap-1">
                        <button
                            type="button"
                            onClick={() => setStatus('새 알림이 없습니다.')}
                            className="flex items-center justify-center rounded h-9 w-9 text-slate-400 hover:text-white hover:bg-border-dark transition-colors relative"
                        >
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-border-dark"></span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setStatus(`현재 뷰: ${viewMode.toUpperCase()}`)}
                            className="flex items-center justify-center rounded h-9 w-9 text-slate-400 hover:text-white hover:bg-border-dark transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        </button>
                    </div>
                </div>

                <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-dark flex items-center justify-center bg-slate-700 text-white overflow-hidden">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
            </div>

            <input
                ref={fileInputRef}
                type="file"
                accept="application/json"
                className="hidden"
                onChange={handleLoadFile}
            />

            {statusMessage && (
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-surface-dark border border-border-dark text-slate-200 text-xs px-3 py-1.5 rounded">
                    {statusMessage}
                </div>
            )}
        </header>
    );
}
