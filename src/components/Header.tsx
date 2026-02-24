import React from 'react';

export default function Header() {
    return (
        <header className="flex-none flex items-center justify-between whitespace-nowrap border-b border-solid border-border-dark px-6 py-3 bg-surface-dark z-20">
            <div className="flex items-center gap-4 text-white">
                <div className="size-6 text-primary">
                    <span className="material-symbols-outlined text-[24px]">view_in_ar</span>
                </div>
                <h2 className="text-white text-lg font-bold leading-tight tracking-tight">FashionCAD Pro</h2>
            </div>

            <div className="flex flex-1 justify-end gap-6 items-center">
                <nav className="hidden md:flex items-center gap-6">
                    <a className="text-slate-400 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">File</a>
                    <a className="text-slate-400 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Edit</a>
                    <a className="text-slate-400 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">View</a>
                    <a className="text-white text-sm font-medium leading-normal border-b-2 border-primary pb-0.5" href="#">Simulation</a>
                    <a className="text-slate-400 hover:text-white text-sm font-medium leading-normal transition-colors" href="#">Help</a>
                </nav>

                <div className="w-px h-6 bg-border-dark mx-2"></div>

                <div className="flex gap-3">
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-primary hover:bg-primary/90 text-white text-sm font-bold leading-normal transition-colors shadow-lg shadow-primary/20">
                        <span className="truncate">Render</span>
                    </button>
                    <button className="flex cursor-pointer items-center justify-center overflow-hidden rounded h-9 px-4 bg-border-dark hover:bg-slate-600 text-white text-sm font-bold leading-normal transition-colors">
                        <span className="truncate">Save</span>
                    </button>

                    <div className="flex gap-1">
                        <button className="flex items-center justify-center rounded h-9 w-9 text-slate-400 hover:text-white hover:bg-border-dark transition-colors relative">
                            <span className="material-symbols-outlined text-[20px]">notifications</span>
                            <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full border border-border-dark"></span>
                        </button>
                        <button className="flex items-center justify-center rounded h-9 w-9 text-slate-400 hover:text-white hover:bg-border-dark transition-colors">
                            <span className="material-symbols-outlined text-[20px]">account_circle</span>
                        </button>
                    </div>
                </div>

                <div className="bg-center bg-no-repeat bg-cover rounded-full size-9 border border-border-dark flex items-center justify-center bg-slate-700 text-white overflow-hidden">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                </div>
            </div>
        </header>
    );
}
