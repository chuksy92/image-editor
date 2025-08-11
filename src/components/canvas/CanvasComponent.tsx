import React, { useEffect, useRef, useCallback } from "react";
import Konva from "konva";
import { Stage, Layer, Image as KonvaImage } from "react-konva";
import { useStore } from "@/hooks/useStore";
import TextLayerNode from "./TextLayerNode";

const CanvasComponent = () => {
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

    const stageRef = useRef<Konva.Stage>(null);

    // Put Stage ref into store
    useEffect(() => {
        if (stageRef.current) setStageRef(stageRef);
    }, [setStageRef]);

    // Load image & set canvas size
    useEffect(() => {
        if (!image) return;
        const img = new window.Image();
        img.src = URL.createObjectURL(image);
        img.onload = () => {
            setImageObject(img);
            setCanvasDimensions({ width: img.width, height: img.height });
        };
        return () => URL.revokeObjectURL(img.src);
    }, [image, setCanvasDimensions, setImageObject]);

    // Redraw when layers change (refresh hit graph)
    useEffect(() => {
        stageRef.current?.batchDraw();
    }, [layers]);

    // Deselect only when clicking *true* background
    const handleStageMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) setSelectedLayer(null);
    };

    // Keyboard shortcuts (delete, duplicate, nudge)
    const onKeyDown = useCallback(
        (e: KeyboardEvent) => {
            if (!stageRef.current || document.activeElement instanceof HTMLTextAreaElement) return;

            const isShift = e.shiftKey;
            const nudge = isShift ? 10 : 1;

            switch (e.key) {
                case "Delete":
                case "Backspace":
                    deleteSelected();
                    break;
                case "d":
                case "D":
                    if (e.metaKey || e.ctrlKey) {
                        e.preventDefault();
                        duplicateSelected();
                    }
                    break;
                case "ArrowUp":
                case "ArrowDown":
                case "ArrowLeft":
                case "ArrowRight": {
                    const id = selectedLayerId;
                    if (!id) break;
                    const node = stageRef.current.findOne(`#${id}`) as Konva.Group | null;
                    if (!node) break;
                    e.preventDefault();
                    const dx = e.key === "ArrowLeft" ? -nudge : e.key === "ArrowRight" ? nudge : 0;
                    const dy = e.key === "ArrowUp" ? -nudge : e.key === "ArrowDown" ? nudge : 0;
                    node.x(node.x() + dx);
                    node.y(node.y() + dy);
                    node.getLayer()?.batchDraw();
                    useStore.getState().updateTextLayer({ id, x: node.x(), y: node.y() });
                    break;
                }
            }
        },
        [deleteSelected, duplicateSelected, selectedLayerId]
    );

    useEffect(() => {
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [onKeyDown]);

    return (
        <Stage
            width={imageObject?.width || 0}
            height={imageObject?.height || 0}
            ref={stageRef}
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
