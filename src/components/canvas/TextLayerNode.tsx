import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import Konva from "konva";
import { TextLayer, useStore } from "@/hooks/useStore";

type Props = {
    layer: TextLayer;
    isSelected: boolean;
    onSelect: () => void;
};

const HIT_PAD = 8;          // generous hit padding for easy grabbing
const TEXT_MIN_SIZE = 20;   // prevent collapsing on transform

const TextLayerNode: React.FC<Props> = ({ layer, isSelected, onSelect }) => {
    const groupRef = useRef<Konva.Group>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const update = useStore((s) => s.updateTextLayer);

    // Live position during drag to avoid snap-back
    const [livePos, setLivePos] = useState<{ x: number; y: number } | null>(null);
    const rafId = useRef<number | null>(null);

    const widthWithPad = useMemo(
        () => Math.max(TEXT_MIN_SIZE, layer.width) + HIT_PAD * 2,
        [layer.width]
    );
    const heightWithPad = useMemo(
        () => Math.max(TEXT_MIN_SIZE, layer.height) + HIT_PAD * 2,
        [layer.height]
    );

    // Attach transformer to GROUP when selected
    useEffect(() => {
        if (!isSelected) return;
        const tr = trRef.current;
        const g = groupRef.current;
        if (!tr || !g) return;
        tr.nodes([g]);
        tr.getLayer()?.batchDraw();
    }, [isSelected]);

    // Clear livePos only after store catches up with final coords
    useEffect(() => {
        if (!livePos) return;
        if (Math.abs(livePos.x - layer.x) < 0.001 && Math.abs(livePos.y - layer.y) < 0.001) {
            setLivePos(null);
        }
    }, [layer.x, layer.y, livePos]);

    // 🔧 Reliable cursor on the Stage container via classes
    const setCursor = useCallback((cursor: "default" | "grab" | "grabbing") => {
        const stage = groupRef.current?.getStage();
        const el = stage?.container();
        if (!el) return;
        el.classList.remove("konva-cursor-default", "konva-cursor-grab", "konva-cursor-grabbing");
        if (cursor === "grab") el.classList.add("konva-cursor-grab");
        else if (cursor === "grabbing") el.classList.add("konva-cursor-grabbing");
        else el.classList.add("konva-cursor-default");
    }, []);

    const handleMouseDown = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            e.cancelBubble = true;

            const g = groupRef.current;
            if (!g) return;

            // 1) put this group on top so it receives all subsequent events
            g.moveToTop();
            g.getLayer()?.batchDraw();

            // 2) cursor + immediate drag
            setCursor("grabbing");
            g.stopDrag();
            g.startDrag();
            setLivePos({ x: g.x(), y: g.y() });

            // 3) defer selection to next frame to avoid re-render interrupting the drag
            if (!isSelected) requestAnimationFrame(onSelect);
        },
        [isSelected, onSelect, setCursor]
    );

    // rAF-throttled live position while dragging
    const handleDragMove = useCallback((e: Konva.KonvaEventObject<DragEvent>) => {
        const g = e.target as Konva.Group;
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
            setLivePos({ x: g.x(), y: g.y() });
        });
    }, []);

    const handleDragStart = useCallback(() => {
        setCursor("grabbing");
    }, [setCursor]);

    const handleDragEnd = useCallback(() => {
        const g = groupRef.current;
        if (!g) return;

        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }

        const finalX = g.x();
        const finalY = g.y();

        // Hold visually steady until store reflects it
        setLivePos({ x: finalX, y: finalY });
        setCursor("grab");

        update({ id: layer.id, x: finalX, y: finalY });
    }, [layer.id, setCursor, update]);

    // Normalize transform → width/height + rotation; reset scale
    const handleTransformEnd = useCallback(() => {
        const g = groupRef.current;
        if (!g) return;

        const sx = g.scaleX();
        const sy = g.scaleY();
        const nextWidth = Math.max(TEXT_MIN_SIZE, layer.width * sx);
        const nextHeight = Math.max(TEXT_MIN_SIZE, layer.height * sy);

        g.scaleX(1);
        g.scaleY(1);

        update({
            id: layer.id,
            x: g.x(),
            y: g.y(),
            rotation: g.rotation(),
            width: nextWidth,
            height: nextHeight,
        });
    }, [layer.height, layer.id, layer.width, update]);

    // Drive the Group with live position while dragging
    const x = livePos?.x ?? layer.x;
    const y = livePos?.y ?? layer.y;

    return (
        <>
            <Group
                id={layer.id}
                ref={groupRef}
                x={x}
                y={y}
                rotation={layer.rotation}
                draggable
                dragDistance={0}
                listening
                onMouseEnter={(e) => { e.cancelBubble = true; setCursor("grab"); }}
                onMouseLeave={(e) => {
                    e.cancelBubble = true;
                    if (!groupRef.current?.isDragging()) setCursor("default");
                }}
                onMouseDown={handleMouseDown}
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onMouseUp={() => setCursor("grab")}
                onDragEnd={handleDragEnd}
            >
                {/* generous invisible hit area so grabbing is easy */}
                <Rect
                    x={-HIT_PAD}
                    y={-HIT_PAD}
                    width={widthWithPad}
                    height={heightWithPad}
                    fill="rgba(0,0,0,0.002)"  // >0 alpha => Konva builds a hit region
                    listening
                    hitStrokeWidth={HIT_PAD}
                />

                {/* actual text; all events handled on the Group */}
                <Text
                    x={0}
                    y={0}
                    width={layer.width}
                    height={layer.height}
                    text={layer.text}
                    fontSize={layer.fontSize}
                    fontFamily={layer.fontFamily}
                    fill={layer.fill}
                    fontStyle={layer.fontStyle}
                    align={layer.align}
                    opacity={layer.opacity}
                    listening={false}
                    perfectDrawEnabled={false}
                    shadowForStrokeEnabled={false}
                />
            </Group>

            {isSelected && (
                <Transformer
                    ref={trRef}
                    rotateEnabled
                    keepRatio={false}
                    enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                    boundBoxFunc={(oldBox, newBox) =>
                        newBox.width < TEXT_MIN_SIZE || newBox.height < TEXT_MIN_SIZE ? oldBox : newBox
                    }
                    onTransformEnd={handleTransformEnd}
                />
            )}
        </>
    );
};

export default React.memo(TextLayerNode);
