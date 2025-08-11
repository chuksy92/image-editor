import { create } from "zustand";
import Konva from "konva";
import React from "react";

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
    image: File | null;
    imageObject: HTMLImageElement | null;
    canvasDimensions: { width: number; height: number };
    layers: TextLayer[];
    selectedLayerId: string | null;
    stageRef: React.RefObject<Konva.Stage | null> | null;

    setImage: (file: File | null) => void;
    setImageObject: (img: HTMLImageElement | null) => void;
    setCanvasDimensions: (d: { width: number; height: number }) => void;
    setStageRef: (ref: React.RefObject<Konva.Stage | null>) => void;

    addTextLayer: () => void;
    updateTextLayer: (patch: Partial<TextLayer> & { id: string }) => void; // <-- MERGE
    setSelectedLayer: (id: string | null) => void;
    reorderLayers: (newLayers: TextLayer[]) => void;

    deleteSelected: () => void;
    duplicateSelected: () => void;

    exportImage: () => void;
}

const makeId = () =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);

export const useStore = create<EditorState>((set, get) => ({
    image: null,
    imageObject: null,
    canvasDimensions: { width: 0, height: 0 },
    layers: [],
    selectedLayerId: null,
    stageRef: null,

    setImage: (file) => set({ image: file }),
    setImageObject: (img) => set({ imageObject: img }),
    setCanvasDimensions: (dimensions) => set({ canvasDimensions: dimensions }),
    setStageRef: (ref) => set({ stageRef: ref }),

    addTextLayer: () => {
        const id = makeId();
        const newLayer: TextLayer = {
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
        };
        set((s) => ({
            layers: [...s.layers, newLayer],
            selectedLayerId: id,
        }));
    },

    // ✅ Merge patch into existing layer (prevents wiping other fields)
    updateTextLayer: (patch) =>
        set((s) => ({
            layers: s.layers.map((l) => (l.id === patch.id ? { ...l, ...patch } : l)),
        })),

    setSelectedLayer: (id) => set({ selectedLayerId: id }),

    reorderLayers: (newLayers) => set({ layers: newLayers }),

    deleteSelected: () =>
        set((s) => {
            if (!s.selectedLayerId) return {};
            const idx = s.layers.findIndex((l) => l.id === s.selectedLayerId);
            const layers = s.layers.filter((l) => l.id !== s.selectedLayerId);
            const next = layers[Math.max(0, Math.min(idx, layers.length - 1))] || null;
            return { layers, selectedLayerId: next?.id ?? null };
        }),

    duplicateSelected: () =>
        set((s) => {
            const src = s.layers.find((l) => l.id === s.selectedLayerId);
            if (!src) return {};
            const copy: TextLayer = { ...src, id: makeId(), x: src.x + 24, y: src.y + 24 };
            return { layers: [...s.layers, copy], selectedLayerId: copy.id };
        }),

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
