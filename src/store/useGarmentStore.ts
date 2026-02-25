import { create } from "zustand";

export interface PatternPoint {
  id: string; // Unique ID for each vertex
  x: number;
  y: number;
}

export interface Shape {
  id: string;
  type: 'polygon' | 'path';
  points: PatternPoint[];
  isClosed: boolean;
  color: string;
}

interface HistoryState {
  shapes: Shape[];
}

const cloneShapes = (shapes: Shape[]) => JSON.parse(JSON.stringify(shapes)) as Shape[];
const MAX_HISTORY_ENTRIES = 200;

const shapesAreEqual = (left: Shape[], right: Shape[]) => {
  if (left.length !== right.length) return false;

  return left.every((leftShape, shapeIndex) => {
    const rightShape = right[shapeIndex];
    if (!rightShape) return false;
    if (leftShape.id !== rightShape.id) return false;
    if (leftShape.type !== rightShape.type) return false;
    if (leftShape.isClosed !== rightShape.isClosed) return false;
    if (leftShape.color !== rightShape.color) return false;
    if (leftShape.points.length !== rightShape.points.length) return false;

    return leftShape.points.every((leftPoint, pointIndex) => {
      const rightPoint = rightShape.points[pointIndex];
      return !!rightPoint
        && leftPoint.id === rightPoint.id
        && leftPoint.x === rightPoint.x
        && leftPoint.y === rightPoint.y;
    });
  });
};

interface GarmentState {
  viewMode: "2d" | "3d" | "split";
  activeTool: string;
  selectedVertexId: string | null;
  selectedShapeId: string | null;
  activeMaterial: string;
  width: number;
  length: number;
  sceneGraph: { [key: string]: boolean };

  // Data Model V3
  shapes: Shape[];
  history: HistoryState[];
  historyIndex: number;

  setViewMode: (mode: "2d" | "3d" | "split") => void;
  setActiveTool: (tool: string) => void;
  setSelectedVertexId: (vertexId: string | null) => void;
  setSelectedShapeId: (shapeId: string | null) => void;
  setActiveMaterial: (material: string) => void;
  setWidth: (width: number) => void;
  setLength: (length: number) => void;
  toggleSceneObject: (key: string) => void;

  // Actions for V3
  addShape: (shape: Shape) => void;
  updateShape: (id: string, shape: Partial<Shape>) => void;
  deleteShape: (id: string) => void;
  undo: () => void;
  redo: () => void;

  // Directly pushing to history
  saveHistory: () => void;
}

export const useGarmentStore = create<GarmentState>((set, get) => ({
  viewMode: "split",
  activeTool: "select",
  selectedVertexId: null,
  selectedShapeId: null,
  activeMaterial: "denim",
  width: 50,
  length: 70,
  sceneGraph: {
    'Jacket_Main_Body': true,
    'Sleeve_Left': true,
    'Sleeve_Right': true,
    'Zipper_Metal_YKK': true
  },

  shapes: [],
  history: [],
  historyIndex: -1,

  setViewMode: (mode) => set({ viewMode: mode }),
  setActiveTool: (tool) => {
    // When changing tool, deselect everything
    set({ activeTool: tool, selectedShapeId: null, selectedVertexId: null });
  },
  setSelectedVertexId: (vertexId) => set({ selectedVertexId: vertexId }),
  setSelectedShapeId: (shapeId) => set({ selectedShapeId: shapeId }),
  setActiveMaterial: (material) => set({ activeMaterial: material }),
  setWidth: (width) => set({ width }),
  setLength: (length) => set({ length }),
  toggleSceneObject: (key) => set((state) => ({
    sceneGraph: { ...state.sceneGraph, [key]: !state.sceneGraph[key] }
  })),

  saveHistory: () => {
    const state = get();
    const snapshot = cloneShapes(state.shapes);
    const lastSnapshot = state.history[state.historyIndex];

    if (lastSnapshot && shapesAreEqual(lastSnapshot.shapes, snapshot)) {
      return;
    }

    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ shapes: snapshot });

    if (newHistory.length > MAX_HISTORY_ENTRIES) {
      const trimmedHistory = newHistory.slice(newHistory.length - MAX_HISTORY_ENTRIES);
      set({ history: trimmedHistory, historyIndex: trimmedHistory.length - 1 });
      return;
    }

    set({ history: newHistory, historyIndex: newHistory.length - 1 });
  },

  addShape: (shape) => {
    set((state) => ({ shapes: [...state.shapes, shape] }));
    get().saveHistory();
  },

  updateShape: (id, updatedFields) => {
    set((state) => ({
      shapes: state.shapes.map(s => s.id === id ? { ...s, ...updatedFields } : s)
    }));
    // Note: To avoid flooding history on drag, saveHistory inside canvas mouse:up event generally
  },

  deleteShape: (id) => {
    set((state) => ({ shapes: state.shapes.filter(s => s.id !== id) }));
    get().saveHistory();
  },

  undo: () => {
    const { historyIndex, history } = get();
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      set({ shapes: cloneShapes(history[newIndex].shapes), historyIndex: newIndex, selectedShapeId: null, selectedVertexId: null });
    } else if (historyIndex === 0) {
      // Revert to empty
      set({ shapes: [], historyIndex: -1, selectedShapeId: null, selectedVertexId: null });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ shapes: cloneShapes(history[newIndex].shapes), historyIndex: newIndex, selectedShapeId: null, selectedVertexId: null });
    }
  }
}));
