import { create } from 'zustand';
import Konva from 'konva';
import React from "react";

// Type definitions for the application state and layers.
interface TextLayer {
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
    fontStyle: string;
    align: 'left' | 'center' | 'right';
    opacity: number;
}

interface EditorState {
    image: File | null;
    canvasDimensions: { width: number; height: number };
    layers: TextLayer[];
    selectedLayer: TextLayer | null;
    stageRef: React.RefObject<Konva.Stage | null> | null;
    setImage: (file: File) => void;
    setCanvasDimensions: (dimensions: { width: number; height: number }) => void;
    addTextLayer: () => void;
    updateTextLayer: (layer: TextLayer) => void;
    setSelectedLayer: (layer: TextLayer | null) => void;
    reorderLayers: (newLayers: TextLayer[]) => void;
    setStageRef: (ref: React.RefObject<Konva.Stage | null>) => void;
    exportImage: () => void;
}

// Zustand is a simple state management library used here.
export const useStore = create<EditorState>((set, get) => ({
    image: null,
    canvasDimensions: { width: 0, height: 0 },
    layers: [],
    selectedLayer: null,
    stageRef: null,

    setImage: (file) => set({ image: file }),
    setCanvasDimensions: (dimensions) => set({ canvasDimensions: dimensions }),

    addTextLayer: () => {
        const newLayer: TextLayer = {
            id: Konva.Util.getRandomColor(),
            x: 50,
            y: 50,
            text: 'New Text',
            fontSize: 30,
            fontFamily: 'Roboto',
            fill: '#000000',
            rotation: 0,
            width: 150,
            height: 40,
            fontStyle: 'normal',
            align: 'left',
            opacity: 1,
        };
        set((state) => ({ layers: [...state.layers, newLayer], selectedLayer: newLayer }));
    },

    updateTextLayer: (updatedLayer) => {
        set((state) => {
            const newLayers = state.layers.map((layer) =>
                layer.id === updatedLayer.id ? updatedLayer : layer
            );
            return { layers: newLayers, selectedLayer: updatedLayer };
        });
    },

    setSelectedLayer: (layer) => set({ selectedLayer: layer }),

    reorderLayers: (newLayers) => set({ layers: newLayers }),

    setStageRef: (ref) => set({ stageRef: ref }),

    exportImage: () => {
        const { stageRef, layers, image, canvasDimensions } = get();
        if (!stageRef?.current || !image) {
            console.error('Canvas or image not available for export.');
            return;
        }

        const stage = stageRef.current;

        // Create a temporary stage to draw the final image and text.
        const tempStage = new Konva.Stage({
            container: document.createElement('div'),
            width: canvasDimensions.width,
            height: canvasDimensions.height,
        });
        const tempLayer = new Konva.Layer();
        tempStage.add(tempLayer);

        const konvaImage = new Konva.Image({
            image: new window.Image(),
            width: canvasDimensions.width,
            height: canvasDimensions.height,
        });

        // This is the fix: check if the konva image object exists and is an HTMLImageElement.
        const konvaImageObj = konvaImage.image();
        if (konvaImageObj instanceof window.Image) {
            konvaImageObj.src = URL.createObjectURL(image);

            konvaImageObj.onload = () => {
                tempLayer.add(konvaImage);
                // Add all text layers to the temporary stage.
                layers.forEach(layer => {
                    const textNode = new Konva.Text({ ...layer });
                    tempLayer.add(textNode);
                });
                tempLayer.batchDraw();

                // Export the temporary stage as a data URL and download it.
                const dataURL = tempStage.toDataURL({
                    mimeType: 'image/png',
                    quality: 1,
                });

                const link = document.createElement('a');
                link.href = dataURL;
                link.download = 'edited-image.png';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);

                tempStage.destroy();
            };
        }
    }
}));
