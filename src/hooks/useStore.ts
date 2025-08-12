// src/hooks/useStore.ts
import { create } from "zustand";
import type Konva from "konva";          // type-only import (no runtime cost)
import type React from "react";           // type-only import

// ----- Types -----

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
}

interface EditorState {
    // Canvas / image
    image: File | null;
    imageObject: HTMLImageElement | null;
    canvasDimensions: { width: number; height: number };
    stageRef: React.RefObject<Konva.Stage | null> | null;

    // Layers
    layers: TextLayer[];
    selectedLayerId: string | null;

    // Setters / refs
    setImage: (file: File | null) => void;
    setImageObject: (img: HTMLImageElement | null) => void;
    setCanvasDimensions: (d: { width: number; height: number }) => void;
    setStageRef: (ref: React.RefObject<Konva.Stage | null>) => void;

    // Layer ops
    addTextLayer: () => void;
    updateTextLayer: (patch: Partial<TextLayer> & { id: string }) => void; // merge patch
    setSelectedLayer: (id: string | null) => void;
    reorderLayers: (newLayers: TextLayer[]) => void;

    deleteSelected: () => void;
    duplicateSelected: () => void;

    // Export
    exportImage: () => void;
}

// ----- Utilities -----

const makeId = (): string =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

const createDefaultTextLayer = (id: string): TextLayer => ({
    id,
    x: 60,
    y: 60,
    text: "Double-click to edit",
    fontSize: 36,
    fontFamily: "Inter",
    fill: "#111827",
    rotation: 0,
    width: 300,
    height: 60,
    fontStyle: "normal",
    align: "left",
    opacity: 1,
});

// ----- Store -----

export const useStore = create<EditorState>((set, get) => ({
    // canvas / image
    image: null,
    imageObject: null,
    canvasDimensions: { width: 0, height: 0 },
    stageRef: null,

    // layers
    layers: [],
    selectedLayerId: null,

    // setters
    setImage: (file) => set({ image: file }),
    setImageObject: (img) => set({ imageObject: img }),
    setCanvasDimensions: (dimensions) => set({ canvasDimensions: dimensions }),
    setStageRef: (ref) => set({ stageRef: ref }),

    // layer ops
    addTextLayer: () => {
        const id = makeId();
        const newLayer = createDefaultTextLayer(id);
        set((s) => ({
            layers: [...s.layers, newLayer],
            selectedLayerId: id,
        }));
    },

    /**
     * Merge-patch a layer by id.
     * Only fields included in `patch` are updated—others remain unchanged.
     */
    updateTextLayer: (patch) =>
        set((s) => ({
            layers: s.layers.map((l) => (l.id === patch.id ? { ...l, ...patch } : l)),
        })),

    setSelectedLayer: (id) => set({ selectedLayerId: id }),

    /**
     * Replace the entire layer array (used by drag-reorder in the panel).
     * Expectation: caller already computed the new order immutably.
     */
    reorderLayers: (newLayers) => set({ layers: newLayers }),

    deleteSelected: () =>
        set((s) => {
            const id = s.selectedLayerId;
            if (!id) return {};
            const idx = s.layers.findIndex((l) => l.id === id);
            if (idx < 0) return {};

            const layers = s.layers.filter((l) => l.id !== id);

            // Choose a reasonable next selection (previous index, clamped)
            const next = layers[Math.max(0, Math.min(idx, layers.length - 1))] || null;

            return { layers, selectedLayerId: next?.id ?? null };
        }),

    duplicateSelected: () =>
        set((s) => {
            const src = s.layers.find((l) => l.id === s.selectedLayerId);
            if (!src) return {};
            const id = makeId();
            const copy: TextLayer = { ...src, id, x: src.x + 24, y: src.y + 24 };
            return { layers: [...s.layers, copy], selectedLayerId: id };
        }),

    /**
     * Export the current stage content to PNG at the stage's current size.
     * (Preserves original image dimensions since Stage matches the image.)
     */
    exportImage: () => {
        const { stageRef, imageObject } = get();
        const stage = stageRef?.current;
        if (!stage || !imageObject) return;

        const dataURL = stage.toDataURL({ mimeType: "image/png", pixelRatio: 1 });

        const link = document.createElement("a");
        link.href = dataURL;
        link.download = "edited-image.png";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    },
}));
