import { create } from "zustand";
import { persist, subscribeWithSelector } from "zustand/middleware";
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
    opacity: number;
    locked: boolean;
    lineHeight: number;
    letterSpacing: number;
}

export interface CustomFont {
    family: string;
    url: string;
}

type EditorSnapshot = {
    imageDataUrl: string | null;
    canvasDimensions: { width: number; height: number };
    layers: TextLayer[];
    selectedLayerId: string | null;
    customFonts: CustomFont[];
};

interface History {
    past: { snap: EditorSnapshot; label?: string }[];
    present: EditorSnapshot;
    future: { snap: EditorSnapshot; label?: string }[];
}

interface EditorState {
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

    toggleLayerLock: (id: string) => void;
    setLayerLock: (id: string, locked: boolean) => void;

    // Setters / refs
    setImage: (file: File | null) => Promise<void>;
    setImageObject: (img: HTMLImageElement | null) => void;
    setCanvasDimensions: (d: { width: number; height: number }) => void;
    setStageRef: (ref: React.RefObject<Konva.Stage | null>) => void;

    // Layer ops
    addTextLayer: () => void;
    updateTextLayerLive: (patch: Partial<TextLayer> & { id: string }) => void; // 👈 NEW (no history)
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

const STORAGE_KEY = "image-editor-v1";
const MAX_HISTORY = 20;

const makeId = (): string =>
    typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2);


const createDefaultTextLayer = (id: string): TextLayer => ({
    id,
    x: 60,
    y: 60,
    text: "Enter text here...",
    fontSize: 25,
    fontFamily: "Inter",
    fill: "#111827",
    rotation: 0,
    width: 300,
    height: 60,
    fontStyle: "normal",
    align: "left",
    opacity: 1,
    locked: false,
    lineHeight: 1.2,
    letterSpacing: 0,
});

// File -> data URL (so we can persist the image)
const fileToDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });

const takeSnapshot = (s: EditorState): EditorSnapshot => ({
    imageDataUrl: s.imageDataUrl,
    canvasDimensions: s.canvasDimensions,
    layers: s.layers,
    selectedLayerId: s.selectedLayerId,
    customFonts: s.customFonts,
});

export const useStore = create<EditorState>()(
    persist(
        subscribeWithSelector((set, get) => {
            // ---- Initial snapshot (blank) ----
            const emptySnap: EditorSnapshot = {
                imageDataUrl: null,
                canvasDimensions: { width: 0, height: 0 },
                layers: [],
                selectedLayerId: null,
                customFonts: [],
            };

            const rebuildImageObject = (dataUrl: string | null) => {
                if (!dataUrl) {
                    set({ imageObject: null, canvasDimensions: { width: 0, height: 0 } });
                    return;
                }
                const img = new window.Image();
                img.src = dataUrl;
                img.onload = () =>
                    set({ imageObject: img, canvasDimensions: { width: img.width, height: img.height } });
            };

            return {
                // runtime image + canvas
                image: null,
                imageObject: null,
                imageDataUrl: null,
                canvasDimensions: { width: 0, height: 0 },
                stageRef: null,

                // layers
                layers: [],
                selectedLayerId: null,

                // fonts
                customFonts: [],
                addCustomFont: (font) => set((s) => ({ customFonts: [...s.customFonts, font] })),

                // drag priming
                startDragId: null,
                clearStartDrag: () => set({ startDragId: null }),

                // history
                history: { past: [], present: emptySnap, future: [] },

                canUndo: () => get().history.past.length > 0,
                canRedo: () => get().history.future.length > 0,
                historyCounts: () => {
                    const h = get().history;
                    return { back: h.past.length, forward: h.future.length };
                },

                pushHistory: (label) => {
                    const h = get().history;
                    const curr = takeSnapshot(get());
                    // move current present into past; set present = curr; clear future
                    const past = [...h.past, { snap: h.present, label }];
                    const trimmed = past.length > MAX_HISTORY ? past.slice(past.length - MAX_HISTORY) : past;
                    set({ history: { past: trimmed, present: curr, future: [] } });
                },

                undo: () => {
                    const h = get().history;
                    if (h.past.length === 0) return;
                    const past = [...h.past];
                    const prev = past.pop()!; // last
                    const future = [{ snap: h.present }, ...h.future];
                    const snap = prev.snap;

                    set({
                        history: { past, present: snap, future },
                        imageDataUrl: snap.imageDataUrl,
                        canvasDimensions: snap.canvasDimensions,
                        layers: snap.layers,
                        selectedLayerId: snap.selectedLayerId,
                        customFonts: snap.customFonts,
                    });
                    rebuildImageObject(snap.imageDataUrl);
                },

                redo: () => {
                    const h = get().history;
                    if (h.future.length === 0) return;
                    const future = [...h.future];
                    const next = future.shift()!; // first
                    const past = [...h.past, { snap: h.present }];
                    const snap = next.snap;

                    set({
                        history: { past, present: snap, future },
                        imageDataUrl: snap.imageDataUrl,
                        canvasDimensions: snap.canvasDimensions,
                        layers: snap.layers,
                        selectedLayerId: snap.selectedLayerId,
                        customFonts: snap.customFonts,
                    });
                    rebuildImageObject(snap.imageDataUrl);
                },

                // setters / refs
                setStageRef: (ref) => set({ stageRef: ref }),
                setImageObject: (img) => set({ imageObject: img }),
                setCanvasDimensions: (d) => set({ canvasDimensions: d }),

                setImage: async (file) => {
                    if (!file) {
                        // clear image
                        set({
                            image: null,
                            imageDataUrl: null,
                            imageObject: null,
                            canvasDimensions: { width: 0, height: 0 },
                        });
                        get().pushHistory("clear image");
                        return;
                    }
                    const dataUrl = await fileToDataUrl(file);
                    set({ image: file, imageDataUrl: dataUrl });

                    const img = new window.Image();
                    img.src = dataUrl;
                    img.onload = () => {
                        set({ imageObject: img, canvasDimensions: { width: img.width, height: img.height } });
                        get().pushHistory("set image");
                    };
                },

                // layer ops
                addTextLayer: () => {
                    const id = makeId();
                    const s = get();
                    const n = s.layers.length;
                    const offset = Math.min(n, 8) * 24;

                    const newLayer: TextLayer = {
                        ...createDefaultTextLayer(id),
                        x: 60 + offset,
                        y: 60 + offset,
                    };

                    set({
                        layers: [...s.layers, newLayer],
                        selectedLayerId: id,
                    });
                },

                duplicateSelected: () => {
                    const s = get();
                    const src = s.layers.find((l) => l.id === s.selectedLayerId);
                    if (!src) return;

                    const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
                        ? crypto.randomUUID()
                        : Math.random().toString(36).slice(2);

                    // offset the copy a bit so it's visible
                    const copy: TextLayer = { ...src, id, x: src.x + 24, y: src.y + 24 };

                    set({
                        layers: [...s.layers, copy],
                        selectedLayerId: id,
                    });
                },

                updateTextLayerLive: (patch) => {
                    set((s) => ({
                        layers: s.layers.map((l) => (l.id === patch.id ? { ...l, ...patch } : l)),
                    }));
                },

                // Commit updater (WITH history)
                updateTextLayer: (patch) => {
                    get().pushHistory("update text");
                    set((s) => ({
                        layers: s.layers.map((l) => (l.id === patch.id ? { ...l, ...patch } : l)),
                    }));
                },

                setSelectedLayer: (id) => set({ selectedLayerId: id }),
                setSelectedAndPrimeDrag: (id) => set({ selectedLayerId: id, startDragId: id }),

                reorderLayers: (newLayers) => {
                    get().pushHistory("reorder layers");
                    set({ layers: newLayers });
                },

                toggleLayerLock: (id) => {
                    set((s) => ({
                        layers: s.layers.map((l) => (l.id === id ? { ...l, locked: !l.locked } : l)),
                    }));
                },
                setLayerLock: (id, locked) => {
                    set((s) => ({
                        layers: s.layers.map((l) => (l.id === id ? { ...l, locked } : l)),
                    }));
                },

                deleteSelected: () => {
                    const id = get().selectedLayerId;
                    if (!id) return;
                    get().pushHistory("delete text");
                    set((s) => {
                        const idx = s.layers.findIndex((l) => l.id === id);
                        if (idx < 0) return {};
                        const layers = s.layers.filter((l) => l.id !== id);
                        const next = layers[Math.max(0, Math.min(idx, layers.length - 1))] || null;
                        return { layers, selectedLayerId: next?.id ?? null };
                    });
                },

                // export
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

                // reset
                reset: () => {
                    localStorage.removeItem(STORAGE_KEY);
                    set({
                        image: null,
                        imageDataUrl: null,
                        imageObject: null,
                        canvasDimensions: { width: 0, height: 0 },
                        stageRef: null,
                        layers: [],
                        selectedLayerId: null,
                        customFonts: [],
                        startDragId: null,
                        history: { past: [], present: emptySnap, future: [] },
                    });
                },
            };
        }),
        {
            name: STORAGE_KEY,
            partialize: (s) => ({
                imageDataUrl: s.imageDataUrl,
                canvasDimensions: s.canvasDimensions,
                layers: s.layers,
                selectedLayerId: s.selectedLayerId,
                customFonts: s.customFonts,
                history: s.history, // keep history across reloads
            }),
            version: 1,
            onRehydrateStorage: () => (state) => {
                // rebuild imageObject after we hydrate persisted imageDataUrl
                const dataUrl = state?.imageDataUrl ?? null;
                if (dataUrl) {
                    const img = new window.Image();
                    img.src = dataUrl;
                    img.onload = () => {
                        state?.setImageObject(img);
                        state?.setCanvasDimensions({ width: img.width, height: img.height });
                    };
                }
            },
        }
    )
);
