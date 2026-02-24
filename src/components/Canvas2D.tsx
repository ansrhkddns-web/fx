"use client";

import { useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useGarmentStore, PatternPoint, Shape } from "@/store/useGarmentStore";
import { v4 as uuidv4 } from "uuid";

// Constants
const GRID_SIZE = 20;

const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

export default function Canvas2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);

    const {
        activeTool,
        selectedVertexId, setSelectedVertexId,
        selectedShapeId, setSelectedShapeId,
        shapes, addShape, updateShape, saveHistory
    } = useGarmentStore();

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [drawingPoints, setDrawingPoints] = useState<PatternPoint[]>([]);

    // Initialize Canvas
    useEffect(() => {
        if (!canvasRef.current || !containerRef.current) return;

        const canvas = new fabric.Canvas(canvasRef.current, {
            width: containerRef.current.clientWidth,
            height: containerRef.current.clientHeight,
            selection: activeTool === 'select',
            preserveObjectStacking: true,
        });

        fabricRef.current = canvas;
        canvas.backgroundColor = 'transparent';

        const resizeObserver = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            canvas.setDimensions({ width, height });
            canvas.renderAll();
        });

        resizeObserver.observe(containerRef.current);

        return () => {
            resizeObserver.disconnect();
            canvas.dispose();
        };
    }, []);

    // Tool Behavior & Drawing Logic
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        canvas.selection = activeTool === 'select';
        canvas.defaultCursor = activeTool === 'pen' ? 'crosshair' : 'default';

        // Clear event listeners before re-attaching
        canvas.off('mouse:down');
        canvas.off('mouse:move');
        canvas.off('mouse:up');
        canvas.off('object:moving');
        canvas.off('object:modified');

        if (activeTool === 'pen') {
            canvas.on('mouse:down', (e) => {
                const pointer = canvas.getPointer(e.e);
                const x = snapToGrid(pointer.x);
                const y = snapToGrid(pointer.y);

                // Check if clicked near the first point to close shape
                if (drawingPoints.length > 2) {
                    const firstPt = drawingPoints[0];
                    const dist = Math.sqrt(Math.pow(firstPt.x - x, 2) + Math.pow(firstPt.y - y, 2));
                    if (dist < 15) {
                        // Close shape
                        const newShape: Shape = {
                            id: uuidv4(),
                            type: 'polygon',
                            points: [...drawingPoints],
                            isClosed: true,
                            color: '#1e2936'
                        };
                        addShape(newShape);
                        setDrawingPoints([]);
                        canvas.renderAll();
                        return;
                    }
                }

                const newPoint: PatternPoint = { id: uuidv4(), x, y };
                setDrawingPoints([...drawingPoints, newPoint]);
            });

            canvas.on('mouse:move', (e) => {
                const pointer = canvas.getPointer(e.e);
                setMousePos({ x: snapToGrid(pointer.x), y: snapToGrid(pointer.y) });
                canvas.renderAll();
            });

        } else if (activeTool === 'select') {
            canvas.on('object:modified', (e) => {
                const obj = e.target as any;
                if (obj && obj.shapeId) {
                    // Main polygon modified
                    if (obj.type === 'polygon') {
                        // Update points based on translation
                        // Real CAD needs deep parsing of matrix, but we simplify by recreating or just updating `left`/`top` in state if supported.
                        // For now, save history
                        saveHistory();
                    }
                }
            });

            canvas.on('object:moving', (e) => {
                const obj = e.target;
                if (obj) {
                    obj.left = snapToGrid(obj.left || 0);
                    obj.top = snapToGrid(obj.top || 0);
                }
            });

            canvas.on('mouse:down', (e) => {
                if (!e.target) {
                    setSelectedShapeId(null);
                    setSelectedVertexId(null);
                }
            });
        }

    }, [activeTool, drawingPoints, mousePos, addShape, setSelectedShapeId, setSelectedVertexId, saveHistory]);

    // Render shapes from state + drawing preview
    useEffect(() => {
        const canvas = fabricRef.current;
        if (!canvas) return;

        canvas.clear();

        // 1. Render Commited Shapes
        shapes.forEach(shape => {
            const points = shape.points.map(p => ({ x: p.x, y: p.y }));
            const poly = new fabric.Polygon(points, {
                fill: selectedShapeId === shape.id ? '#253242' : shape.color,
                stroke: '#308ce8',
                strokeWidth: selectedShapeId === shape.id ? 3 : 2,
                opacity: 0.9,
                selectable: activeTool === 'select',
                evented: activeTool === 'select',
                hasControls: false,
                hasBorders: activeTool === 'select',
            });

            (poly as any).shapeId = shape.id;

            poly.on('mousedown', () => {
                if (activeTool === 'select') {
                    setSelectedShapeId(shape.id);
                }
            });

            canvas.add(poly);

            // Render controls for editing vertices if selected
            if (selectedShapeId === shape.id && activeTool === 'select') {
                shape.points.forEach((pt, idx) => {
                    const circle = new fabric.Circle({
                        radius: 5,
                        fill: selectedVertexId === pt.id ? '#ef4444' : '#ffffff',
                        stroke: '#308ce8',
                        strokeWidth: 2,
                        left: pt.x,
                        top: pt.y,
                        originX: 'center',
                        originY: 'center',
                        hasControls: false,
                        hasBorders: false,
                    });

                    circle.on('mousedown', () => {
                        setSelectedVertexId(pt.id);
                    });

                    circle.on('moving', (e) => {
                        const cbX = snapToGrid(circle.left || 0);
                        const cbY = snapToGrid(circle.top || 0);
                        circle.set({ left: cbX, top: cbY });

                        // Update shape state real-time
                        const newPts = [...shape.points];
                        newPts[idx] = { ...newPts[idx], x: cbX, y: cbY };
                        updateShape(shape.id, { points: newPts });
                    });

                    circle.on('modified', () => {
                        saveHistory();
                    });

                    canvas.add(circle);
                });

                // Render Measurements (Distance between consecutive points)
                for (let i = 0; i < shape.points.length; i++) {
                    const p1 = shape.points[i];
                    const p2 = shape.points[(i + 1) % shape.points.length];

                    const dist = Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));
                    const cmDist = (dist / 10).toFixed(1); // Assume 10px = 1cm for prototype

                    const midX = (p1.x + p2.x) / 2;
                    const midY = (p1.y + p2.y) / 2;

                    const text = new fabric.Text(`${cmDist}cm`, {
                        left: midX,
                        top: midY,
                        fontSize: 12,
                        fill: '#ef4444',
                        originX: 'center',
                        originY: 'center',
                        selectable: false,
                        evented: false,
                        backgroundColor: '#111418',
                    });
                    canvas.add(text);
                }
            }
        });

        // 2. Render Drawing Preview
        if (activeTool === 'pen' && drawingPoints.length > 0) {
            // Draw lines connecting points
            for (let i = 0; i < drawingPoints.length - 1; i++) {
                const line = new fabric.Line(
                    [drawingPoints[i].x, drawingPoints[i].y, drawingPoints[i + 1].x, drawingPoints[i + 1].y],
                    { stroke: '#308ce8', strokeWidth: 2, selectable: false }
                );
                canvas.add(line);
            }
            // Guide line to mouse
            const lastPt = drawingPoints[drawingPoints.length - 1];
            const guideLine = new fabric.Line(
                [lastPt.x, lastPt.y, mousePos.x, mousePos.y],
                { stroke: '#308ce8', strokeWidth: 2, strokeDashArray: [5, 5], selectable: false }
            );
            canvas.add(guideLine);

            // Draw nodes
            drawingPoints.forEach(pt => {
                const circle = new fabric.Circle({
                    radius: 4, fill: '#308ce8', left: pt.x, top: pt.y, originX: 'center', originY: 'center', selectable: false
                });
                canvas.add(circle);
            });
        }

    }, [shapes, activeTool, drawingPoints, mousePos, selectedShapeId, selectedVertexId, updateShape, setSelectedShapeId, setSelectedVertexId, saveHistory]);


    // Helper to find selected vertex specifically
    const getSelectedVertexObj = () => {
        if (!selectedShapeId || !selectedVertexId) return null;
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (!shape) return null;
        return shape.points.find(p => p.id === selectedVertexId) || null;
    };

    const selVertex = getSelectedVertexObj();

    return (
        <div ref={containerRef} className="w-full h-full relative">
            <canvas ref={canvasRef} />

            {/* Rulers (Overlay) */}
            <div className="absolute top-0 left-0 right-0 h-6 border-b border-border-dark flex text-[10px] text-text-secondary items-end pb-1 px-8 select-none bg-surface-dark/50 backdrop-blur pointer-events-none">
                <span className="flex-1 border-l border-text-secondary/20 pl-1">0</span>
                <span className="flex-1 border-l border-text-secondary/20 pl-1">10</span>
                <span className="flex-1 border-l border-text-secondary/20 pl-1">20</span>
                <span className="flex-1 border-l border-text-secondary/20 pl-1">30</span>
            </div>
            <div className="absolute top-0 left-0 bottom-0 w-6 border-r border-border-dark flex flex-col text-[10px] text-text-secondary items-end pr-1 py-8 select-none bg-surface-dark/50 backdrop-blur pointer-events-none">
                <span className="flex-1 border-t border-text-secondary/20 pt-1">0</span>
                <span className="flex-1 border-t border-text-secondary/20 pt-1">10</span>
                <span className="flex-1 border-t border-text-secondary/20 pt-1">20</span>
                <span className="flex-1 border-t border-text-secondary/20 pt-1">30</span>
            </div>

            {/* Floating Control overlay for selected vertex */}
            {selVertex && (
                <div
                    className="absolute bg-surface-dark border border-border-dark rounded-lg shadow-xl p-3 w-48 z-30 pointer-events-auto"
                    style={{ top: '20%', left: '10%' }}
                >
                    <div className="flex justify-between items-center mb-2 pb-2 border-b border-border-dark">
                        <span className="text-xs font-bold text-white">Vertex Editor</span>
                        <span
                            className="material-symbols-outlined text-[14px] text-text-secondary cursor-pointer hover:text-white"
                            onClick={() => setSelectedVertexId(null)}
                        >
                            close
                        </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col gap-1">
                            <label className="text-text-secondary">X-Axis</label>
                            <input
                                className="bg-background-dark border border-border-dark rounded px-2 py-1 text-white focus:border-primary focus:outline-none w-full"
                                type="number"
                                value={selVertex.x}
                                onChange={(e) => {
                                    const newX = Number(e.target.value);
                                    const shape = shapes.find(s => s.id === selectedShapeId)!;
                                    const newPts = shape.points.map(p => p.id === selVertex.id ? { ...p, x: newX } : p);
                                    updateShape(shape.id, { points: newPts });
                                }}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-text-secondary">Y-Axis</label>
                            <input
                                className="bg-background-dark border border-border-dark rounded px-2 py-1 text-white focus:border-primary focus:outline-none w-full"
                                type="number"
                                value={selVertex.y}
                                onChange={(e) => {
                                    const newY = Number(e.target.value);
                                    const shape = shapes.find(s => s.id === selectedShapeId)!;
                                    const newPts = shape.points.map(p => p.id === selVertex.id ? { ...p, y: newY } : p);
                                    updateShape(shape.id, { points: newPts });
                                }}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
