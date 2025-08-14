"use client"
import React, {useCallback, useEffect, useMemo, useRef} from "react";
import Konva from "konva";
import {Image as KonvaImage, Layer, Stage} from "react-konva";
import type { Stage as KonvaStage } from "konva/lib/Stage";
import type { KonvaEventObject } from "konva/lib/Node";
import {useStore} from "@/hooks/useStore";
import TextLayerNode from "./TextLayerNode";

/**
 * CanvasComponent
 *
 * Responsibilities:
 * - Own the Konva Stage and keep its size locked to the uploaded image.
 * - Render the background PNG + all text layers.
 * - Provide "click-empty-to-deselect", keyboard shortcuts, and light perf hygiene.
 */
const CanvasComponent: React.FC = () => {
    const {
        image,
        imageObject,
        layers,
        selectedLayerId,
        setCanvasDimensions,
        setSelectedLayer,
        setStageRef,
        setImageObject,
        deleteSelected,
        duplicateSelected,
    } = useStore();

    const stageRef = useRef<KonvaStage>(null);

    // Expose Stage to the store (for export and tooling)
    useEffect(() => {
        if (stageRef.current) setStageRef(stageRef);
    }, [setStageRef]);

    useEffect(() => {
        const el = stageRef.current?.container();
        if (!el) return;
        // start with default cursor
        el.classList.add("konva-cursor-default");
        return () => {
            el.classList.remove("konva-cursor-default", "konva-cursor-grab", "konva-cursor-grabbing");
        };
    }, []);

    /**
     * Handle image load: create an object URL, size the canvas to the PNG,
     * and revoke the URL on cleanup to prevent leaks.
     */
    useEffect(() => {
        if (!image) {
            setImageObject(null);
            setCanvasDimensions({ width: 0, height: 0 });
            return;
        }

        const url = URL.createObjectURL(image);
        const img = new window.Image();
        img.src = url;

        img.onload = () => {
            setImageObject(img);
            setCanvasDimensions({width: img.width, height: img.height});
        };

        return () => {
            img.onload = null;
            URL.revokeObjectURL(url);
        };
    }, [image, setCanvasDimensions, setImageObject]);

    // Batch a redraw whenever layer geometry changes (refresh Konva's hit graph).
    useEffect(() => {
        const id = requestAnimationFrame(() => stageRef.current?.batchDraw());
        return () => cancelAnimationFrame(id);
    }, [layers]);



    /**
     * Deselect when clicking the true background (the Stage).
     * We use mouse events only because the app is desktop-only.
     */
    const handleStageMouseDown = useCallback(
        (e: KonvaEventObject <MouseEvent>) => {
            if (e.target === e.target.getStage() || e.target.getClassName() === "Image") {
                setSelectedLayer(null);
            }
        },
        [setSelectedLayer]
    );

    /**
     * Keyboard shortcuts:
     * - Delete / Backspace: remove selected layer
     * - Cmd/Ctrl + D: duplicate selected layer
     * - Arrow keys (+Shift for 10px): nudge selected layer
     */
    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            const stage = stageRef.current;
            if (!stage) return;

            // If the user is focused in a text input/textarea, do not hijack keys
            const active = document.activeElement;
            if (active instanceof HTMLInputElement || active instanceof HTMLTextAreaElement) return;

            const isShift = e.shiftKey;
            const nudge = isShift ? 10 : 1;

            switch (e.key) {
                case "Delete":
                case "Backspace": {
                    e.preventDefault();
                    deleteSelected();
                    break;
                }
                case "d":
                case "D": {
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        duplicateSelected();
                    }
                    break;
                }
                case "ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight": {
                    const id = selectedLayerId;
                    if (!id) return;

                    // We move the Group (TextLayerNode sets id on its Group)
                    const node = stage.findOne(`#${id}`) as Konva.Group | null;
                    if (!node) return;

                    e.preventDefault();
                    const dx = e.key === "ArrowLeft" ? -nudge : e.key === "ArrowRight" ? nudge : 0;
                    const dy = e.key === "ArrowUp" ? -nudge : e.key === "ArrowDown" ? nudge : 0;
                    node.x(node.x() + dx);
                    node.y(node.y() + dy);
                    node.getLayer()?.batchDraw();

                    // Persist new position (merge-patch in store)
                    useStore.getState().updateTextLayer({ id, x: node.x(), y: node.y() });
                    break;
                }
                default:
                    break;
            }
        },
        [deleteSelected, duplicateSelected, selectedLayerId]
    );

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onKeyDown]);

    // Guard stage size to avoid NaN/0 flashes before image is ready.
    const stageSize = useMemo(
        () => ({
            width: imageObject?.width ?? 0,
            height: imageObject?.height ?? 0,
        }),
        [imageObject?.width, imageObject?.height]
    );

    return (
        <Stage
            ref={stageRef}
            width={stageSize.width}
            height={stageSize.height}
            onMouseDown={handleStageMouseDown}
        >
            <Layer>
                {imageObject && (
                    <KonvaImage image={imageObject} width={imageObject.width} height={imageObject.height} />
                )}

                {layers.map((layer) => (
                    <TextLayerNode
                        key={layer.id}
                        layer={layer}
                        isSelected={layer.id === selectedLayerId}
                        onSelect={() => setSelectedLayer(layer.id)}
                    />
                ))}
            </Layer>
        </Stage>
    );
};

export default CanvasComponent;
