import { create } from "zustand";
import { createJSONStorage, persist, subscribeWithSelector } from "zustand/middleware";


import type {
    EditorState,
    EditorSnapshot,
    TextLayer,
} from "@/types/editor";

import { makeId, fileToDataUrl, createSafeLocalStorage } from "@/lib";

const STORAGE_KEY = "image-editor-v1";
const MAX_HISTORY = 20;


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
                    const past = [...h.past, { snap: h.present, label }];
                    const trimmed = past.length > MAX_HISTORY ? past.slice(past.length - MAX_HISTORY) : past;
                    set({ history: { past: trimmed, present: curr, future: [] } });
                },

                undo: () => {
                    const h = get().history;
                    if (h.past.length === 0) return;
                    const past = [...h.past];
                    const prev = past.pop()!;
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
                    const next = future.shift()!;
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

                    const id = makeId();
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
                history: s.history,
            }),
            storage: createJSONStorage(createSafeLocalStorage),
            version: 1,
            onRehydrateStorage: () => (state) => {
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
