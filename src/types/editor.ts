
import type Konva from "konva";
import type React from "react";

export type Align = "left" | "center" | "right";

export interface TextLayer {
    id: string;
    x: number;
    y: number;
    text: string;
    fontSize: number;
    fontFamily: string;
    fill: string;
    rotation: number;
    width: number;
    height: number;
    fontStyle: "normal" | "bold" | "italic" | "bold italic";
    align: Align;
    opacity: number; // 0..1
    locked: boolean;
    lineHeight: number;
    letterSpacing: number;
}

export interface CustomFont {
    family: string;
    url: string;
}

export type EditorSnapshot = {
    imageDataUrl: string | null;
    canvasDimensions: { width: number; height: number };
    layers: TextLayer[];
    selectedLayerId: string | null;
    customFonts: CustomFont[];
};

export interface History {
    past: { snap: EditorSnapshot; label?: string }[];
    present: EditorSnapshot;
    future: { snap: EditorSnapshot; label?: string }[];
}

export interface EditorState {
    // Canvas / image (runtime)
    image: File | null;
    imageObject: HTMLImageElement | null;
    canvasDimensions: { width: number; height: number };
    stageRef: React.RefObject<Konva.Stage | null> | null;

    // Persisted image data
    imageDataUrl: string | null;

    // Layers
    layers: TextLayer[];
    selectedLayerId: string | null;
    setSelectedAndPrimeDrag: (id: string) => void;

    // Fonts
    customFonts: CustomFont[];
    addCustomFont: (font: CustomFont) => void;

    // Drag priming
    startDragId: string | null;
    clearStartDrag: () => void;

    // History
    history: History;
    canUndo: () => boolean;
    canRedo: () => boolean;
    historyCounts: () => { back: number; forward: number };
    pushHistory: (label?: string) => void;
    undo: () => void;
    redo: () => void;

    // Locks
    toggleLayerLock: (id: string) => void;
    setLayerLock: (id: string, locked: boolean) => void;

    // Setters / refs
    setImage: (file: File | null) => Promise<void>;
    setImageObject: (img: HTMLImageElement | null) => void;
    setCanvasDimensions: (d: { width: number; height: number }) => void;
    setStageRef: (ref: React.RefObject<Konva.Stage | null>) => void;

    // Layer ops
    addTextLayer: () => void;
    updateTextLayerLive: (patch: Partial<TextLayer> & { id: string }) => void; // no history
    updateTextLayer: (patch: Partial<TextLayer> & { id: string }) => void;      // commit (history)
    setSelectedLayer: (id: string | null) => void;
    reorderLayers: (newLayers: TextLayer[]) => void;
    deleteSelected: () => void;
    duplicateSelected: () => void;

    // Export
    exportImage: () => void;

    // Reset (clear autosave + memory)
    reset: () => void;
}
