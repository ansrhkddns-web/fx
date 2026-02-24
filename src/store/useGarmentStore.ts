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
    const newHistory = state.history.slice(0, state.historyIndex + 1);
    newHistory.push({ shapes: JSON.parse(JSON.stringify(state.shapes)) }); // Deep clone
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
      set({ shapes: JSON.parse(JSON.stringify(history[newIndex].shapes)), historyIndex: newIndex, selectedShapeId: null, selectedVertexId: null });
    } else if (historyIndex === 0) {
      // Revert to empty
      set({ shapes: [], historyIndex: -1, selectedShapeId: null, selectedVertexId: null });
    }
  },

  redo: () => {
    const { historyIndex, history } = get();
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      set({ shapes: JSON.parse(JSON.stringify(history[newIndex].shapes)), historyIndex: newIndex, selectedShapeId: null, selectedVertexId: null });
    }
  }
}));
