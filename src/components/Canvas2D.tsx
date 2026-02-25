"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import * as fabric from "fabric";
import { useGarmentStore, PatternPoint, Shape } from "@/store/useGarmentStore";
import { v4 as uuidv4 } from "uuid";

// Constants
const GRID_SIZE = 20;
const CLOSE_SNAP_RADIUS = 15;

const snapToGrid = (val: number) => Math.round(val / GRID_SIZE) * GRID_SIZE;

const isTypingTarget = (target: EventTarget | null) => {
    const element = target as HTMLElement | null;
    return !!element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA');
};

type DragStartMap = Record<string, { x: number; y: number }>;

export default function Canvas2D() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const fabricRef = useRef<fabric.Canvas | null>(null);
    const dragStartRef = useRef<DragStartMap>({});

    const {
        activeTool,
        selectedVertexId, setSelectedVertexId,
        selectedShapeId, setSelectedShapeId,
        shapes, addShape, updateShape, saveHistory, deleteShape, undo, redo
    } = useGarmentStore();

    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [drawingPoints, setDrawingPoints] = useState<PatternPoint[]>([]);
    const [editingShapeId, setEditingShapeId] = useState<string | null>(null);
    const [isClosePreview, setIsClosePreview] = useState(false);

    const drawingPointsRef = useRef(drawingPoints);
    const shapesRef = useRef(shapes);
    const updateShapeRef = useRef(updateShape);
    const saveHistoryRef = useRef(saveHistory);

    useEffect(() => {
        drawingPointsRef.current = drawingPoints;
        shapesRef.current = shapes;
        updateShapeRef.current = updateShape;
        saveHistoryRef.current = saveHistory;
    }, [drawingPoints, shapes, updateShape, saveHistory]);

    const pushDrawingPoint = useCallback((point: PatternPoint) => {
        setDrawingPoints((prevPoints) => {
            const nextPoints = [...prevPoints, point];
            drawingPointsRef.current = nextPoints;
            return nextPoints;
        });
    }, []);

    const popDrawingPoint = useCallback(() => {
        setDrawingPoints((prevPoints) => {
            const nextPoints = prevPoints.slice(0, -1);
            drawingPointsRef.current = nextPoints;
            return nextPoints;
        });
    }, []);

    const clearDrawingPoints = useCallback(() => {
        drawingPointsRef.current = [];
        setDrawingPoints([]);
        setIsClosePreview(false);
    }, []);

    const clearSelection = useCallback((clearEditMode: boolean = true) => {
        if (clearEditMode) {
            setEditingShapeId(null);
        }
        setSelectedShapeId(null);
        setSelectedVertexId(null);
    }, [setSelectedShapeId, setSelectedVertexId]);

    const isSelectTool = activeTool === 'select';
    const isEditTool = activeTool === 'cut';
    const canInspectShapes = isSelectTool || isEditTool;

    const closeDrawingShape = useCallback(() => {
        const points = drawingPointsRef.current;
        if (points.length < 3) return false;

        const newShape: Shape = {
            id: uuidv4(),
            type: 'polygon',
            points: [...points],
            isClosed: true,
            color: '#1e2936',
        };

        addShape(newShape);
        clearDrawingPoints();
        return true;
    }, [addShape, clearDrawingPoints]);

    useEffect(() => {
        if (!canInspectShapes) {
            setEditingShapeId(null);
            setSelectedVertexId(null);
        }
    }, [canInspectShapes, setSelectedVertexId]);

    useEffect(() => {
        if (activeTool !== 'pen' && drawingPointsRef.current.length > 0) {
            clearDrawingPoints();
        }
    }, [activeTool, clearDrawingPoints]);

    useEffect(() => {
        if (selectedShapeId && !shapes.some((shape) => shape.id === selectedShapeId)) {
            clearSelection(false);
        }

        if (editingShapeId && !shapes.some((shape) => shape.id === editingShapeId)) {
            setEditingShapeId(null);
            setSelectedVertexId(null);
        }
    }, [shapes, selectedShapeId, editingShapeId, clearSelection, setSelectedVertexId]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;

            if (isTypingTarget(event.target)) return;

            if (activeTool === 'pen' && drawingPointsRef.current.length > 0) {
                clearDrawingPoints();
                event.preventDefault();
                return;
            }

            if (editingShapeId) {
                setEditingShapeId(null);
                setSelectedVertexId(null);
                return;
            }

            clearSelection();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [activeTool, clearDrawingPoints, editingShapeId, clearSelection]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (isTypingTarget(event.target)) return;

            if (activeTool === 'pen' && event.key === 'Enter') {
                if (closeDrawingShape()) {
                    event.preventDefault();
                }
                return;
            }

            if (activeTool === 'pen' && event.key === 'Backspace' && drawingPointsRef.current.length > 0) {
                popDrawingPoint();
                event.preventDefault();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [activeTool, closeDrawingShape, popDrawingPoint]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (isTypingTarget(event.target)) return;

            const isUndo = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'z' && !event.shiftKey;
            const isRedo = (event.ctrlKey || event.metaKey) && (event.key.toLowerCase() === 'y' || (event.key.toLowerCase() === 'z' && event.shiftKey));

            if (isUndo) {
                undo();
                event.preventDefault();
                return;
            }

            if (isRedo) {
                redo();
                event.preventDefault();
            }
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [undo, redo]);

    useEffect(() => {
        const onKeyDown = (event: KeyboardEvent) => {
            if (isTypingTarget(event.target)) return;
            if (event.key !== 'Delete' && event.key !== 'Backspace') return;
            if (!canInspectShapes || !selectedShapeId) return;

            deleteShape(selectedShapeId);
            setEditingShapeId(null);
            clearSelection();
            event.preventDefault();
        };

        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [canInspectShapes, selectedShapeId, deleteShape, clearSelection]);

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

        canvas.selection = isSelectTool;
        canvas.defaultCursor = activeTool === 'pen' ? 'crosshair' : (isEditTool ? 'cell' : 'default');

        if (!isSelectTool) {
            dragStartRef.current = {};
        }

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
                if (drawingPointsRef.current.length > 2) {
                    const firstPt = drawingPointsRef.current[0];
                    const dist = Math.sqrt(Math.pow(firstPt.x - x, 2) + Math.pow(firstPt.y - y, 2));
                    if (dist < CLOSE_SNAP_RADIUS) {
                        if (closeDrawingShape()) {
                            canvas.renderAll();
                            return;
                        }
                    }
                }

                const newPoint: PatternPoint = { id: uuidv4(), x, y };
                pushDrawingPoint(newPoint);
            });

            canvas.on('mouse:move', (e) => {
                const pointer = canvas.getPointer(e.e);
                const snappedX = snapToGrid(pointer.x);
                const snappedY = snapToGrid(pointer.y);
                setMousePos({ x: snappedX, y: snappedY });

                if (drawingPointsRef.current.length > 2) {
                    const firstPoint = drawingPointsRef.current[0];
                    const distanceToStart = Math.sqrt(Math.pow(firstPoint.x - snappedX, 2) + Math.pow(firstPoint.y - snappedY, 2));
                    setIsClosePreview(distanceToStart < CLOSE_SNAP_RADIUS);
                } else {
                    setIsClosePreview(false);
                }

                canvas.renderAll();
            });

        } else if (canInspectShapes) {
            canvas.on('object:modified', (e) => {
                if (!isSelectTool) return;

                const obj = e.target as fabric.Polygon & { shapeId?: string };
                const shapeId = obj?.shapeId;
                if (!obj || obj.type !== 'polygon' || !shapeId) return;

                const dragStart = dragStartRef.current[shapeId];
                if (!dragStart) {
                    delete dragStartRef.current[shapeId];
                    return;
                }

                const deltaX = snapToGrid((obj.left || 0) - dragStart.x);
                const deltaY = snapToGrid((obj.top || 0) - dragStart.y);

                if (deltaX !== 0 || deltaY !== 0) {
                    const movedShape = shapesRef.current.find((shape) => shape.id === shapeId);
                    if (movedShape) {
                        const shiftedPoints = movedShape.points.map((point) => ({
                            ...point,
                            x: point.x + deltaX,
                            y: point.y + deltaY,
                        }));
                        updateShapeRef.current(movedShape.id, { points: shiftedPoints });
                        saveHistoryRef.current();
                    }
                }

                delete dragStartRef.current[shapeId];
            });

            canvas.on('object:moving', (e) => {
                if (!isSelectTool) return;

                const obj = e.target;
                if (obj) {
                    obj.left = snapToGrid(obj.left || 0);
                    obj.top = snapToGrid(obj.top || 0);
                }
            });

            canvas.on('mouse:down', (e) => {
                if (!e.target) {
                    dragStartRef.current = {};
                    clearSelection();
                }
            });
        }

    }, [activeTool, isSelectTool, isEditTool, canInspectShapes, addShape, closeDrawingShape, pushDrawingPoint, clearSelection, setSelectedShapeId, setSelectedVertexId]);

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
                selectable: canInspectShapes,
                evented: canInspectShapes,
                hasControls: false,
                hasBorders: canInspectShapes,
                lockMovementX: isEditTool,
                lockMovementY: isEditTool,
            });

            const polygonWithMeta = poly as fabric.Polygon & { shapeId?: string };
            polygonWithMeta.shapeId = shape.id;

            poly.on('mousedown', () => {
                if (!canInspectShapes) return;

                if (isSelectTool) {
                    dragStartRef.current[shape.id] = { x: poly.left || 0, y: poly.top || 0 };
                }

                if (selectedShapeId !== shape.id) {
                    setSelectedVertexId(null);
                }

                setSelectedShapeId(shape.id);

                if (isEditTool) {
                    setEditingShapeId(shape.id);
                } else if (!isSelectTool) {
                    setEditingShapeId(null);
                }
            });

            poly.on('mousedblclick', () => {
                if (isSelectTool) {
                    setSelectedShapeId(shape.id);
                    setEditingShapeId(shape.id);
                }
            });

            canvas.add(poly);

            // Render Measurements (Distance between consecutive points)
            if (shape.isClosed) {
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

            // Render controls for editing vertices only in edit mode
            if (selectedShapeId === shape.id && editingShapeId === shape.id && canInspectShapes) {
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

                    circle.on('moving', () => {
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

            if (isClosePreview && drawingPoints.length > 2) {
                const firstPt = drawingPoints[0];
                const closeHalo = new fabric.Circle({
                    radius: 10,
                    left: firstPt.x,
                    top: firstPt.y,
                    originX: 'center',
                    originY: 'center',
                    fill: 'rgba(48, 140, 232, 0.2)',
                    stroke: '#60a5fa',
                    strokeWidth: 2,
                    selectable: false,
                    evented: false,
                });
                canvas.add(closeHalo);
            }

            // Draw nodes
            drawingPoints.forEach(pt => {
                const circle = new fabric.Circle({
                    radius: 4, fill: '#308ce8', left: pt.x, top: pt.y, originX: 'center', originY: 'center', selectable: false
                });
                canvas.add(circle);
            });
        }

    }, [shapes, activeTool, drawingPoints, mousePos, selectedShapeId, selectedVertexId, editingShapeId, isClosePreview, updateShape, setSelectedShapeId, setSelectedVertexId, saveHistory]);


    // Helper to find selected vertex specifically
    const getSelectedVertexObj = () => {
        if (!selectedShapeId || !selectedVertexId) return null;
        const shape = shapes.find(s => s.id === selectedShapeId);
        if (!shape) return null;
        return shape.points.find(p => p.id === selectedVertexId) || null;
    };

    const selVertex = editingShapeId === selectedShapeId ? getSelectedVertexObj() : null;

    const updateSelectedVertexAxis = (axis: 'x' | 'y', value: number) => {
        if (!selectedShapeId || !selVertex || Number.isNaN(value)) return;

        const shape = shapes.find((item) => item.id === selectedShapeId);
        if (!shape) return;

        const snapped = snapToGrid(value);
        const newPoints = shape.points.map((point) => point.id === selVertex.id ? { ...point, [axis]: snapped } : point);
        updateShape(shape.id, { points: newPoints });
    };

    const modeHint = isEditTool
        ? 'Edit Pattern: click shape to edit vertices · Esc to exit'
        : isSelectTool
            ? 'Select: drag shape · double-click edit · Ctrl/Cmd+Z undo · Delete remove · Esc clear'
            : activeTool === 'pen'
                ? 'Pen: click to add points · Enter close · Backspace undo · Esc cancel'
                : null;

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

            {modeHint && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-surface-dark/90 border border-border-dark rounded px-3 py-1.5 text-[11px] text-slate-300 pointer-events-none">
                    {modeHint}
                </div>
            )}

            {activeTool === 'pen' && drawingPoints.length > 0 && (
                <div className="absolute top-12 left-8 z-20 bg-surface-dark/90 border border-border-dark rounded px-2 py-1 text-[11px] text-slate-300 pointer-events-none">
                    In-progress points: {drawingPoints.length}
                </div>
            )}

            {activeTool === 'pen' && isClosePreview && (
                <div className="absolute top-20 left-8 z-20 bg-primary/20 border border-primary/60 rounded px-2 py-1 text-[11px] text-primary pointer-events-none">
                    Click to close shape
                </div>
            )}

            {editingShapeId && (
                <div className="absolute top-12 right-4 z-20 bg-surface-dark/90 border border-border-dark rounded px-3 py-2 text-xs text-slate-200 flex items-center gap-2">
                    <span>Editing Pattern</span>
                    <button
                        type="button"
                        className="text-primary hover:text-white transition-colors"
                        onClick={() => {
                            setEditingShapeId(null);
                            setSelectedVertexId(null);
                        }}
                    >
                        Exit (Esc)
                    </button>
                </div>
            )}

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
                                    updateSelectedVertexAxis('x', Number(e.target.value));
                                }}
                                onBlur={saveHistory}
                            />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-text-secondary">Y-Axis</label>
                            <input
                                className="bg-background-dark border border-border-dark rounded px-2 py-1 text-white focus:border-primary focus:outline-none w-full"
                                type="number"
                                value={selVertex.y}
                                onChange={(e) => {
                                    updateSelectedVertexAxis('y', Number(e.target.value));
                                }}
                                onBlur={saveHistory}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
