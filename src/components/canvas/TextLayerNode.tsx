
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import Konva from "konva";
import { TextLayer, useStore } from "@/hooks/useStore";

type Props = {
    layer: TextLayer;
    isSelected: boolean;
    onSelect: () => void;
};

const HIT_PAD = 8;
const TEXT_MIN_SIZE = 20;

const TextLayerNode: React.FC<Props> = ({ layer, isSelected, onSelect }) => {
    const groupRef = useRef<Konva.Group>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const update = useStore((s) => s.updateTextLayer);

    // Live position during drag to prevent snap-back
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

    useEffect(() => {
        if (!isSelected) return;
        const tr = trRef.current;
        const g = groupRef.current;
        if (!tr || !g) return;
        tr.nodes([g]);
        tr.getLayer()?.batchDraw();
    }, [isSelected]);

    // clear livePos only after store catches up
    useEffect(() => {
        if (!livePos) return;
        if (Math.abs(livePos.x - layer.x) < 0.001 && Math.abs(livePos.y - layer.y) < 0.001) {
            setLivePos(null);
        }
    }, [layer.x, layer.y, livePos]);

    const setCursor = useCallback((cursor: string) => {
        const stage = groupRef.current?.getStage();
        const container = stage?.container();
        if (container) container.style.cursor = cursor;
        // fallback if any global CSS overrides canvas cursor
        document.body.style.cursor = cursor;
    }, []);

    const handleDragEnd = useCallback(() => {
        const g = groupRef.current;
        if (!g) return;
        if (rafId.current) {
            cancelAnimationFrame(rafId.current);
            rafId.current = null;
        }
        const finalX = g.x();
        const finalY = g.y();
        setCursor("grab");
        setLivePos({ x: finalX, y: finalY });          // keep position steady
        update({ id: layer.id, x: finalX, y: finalY }); // persist to store
        // livePos will clear when store matches (effect above)
    }, [layer.id, setCursor, update]);

    // ✨ Only select if not already selected
    const handleMouseDown = useCallback(
        (e: Konva.KonvaEventObject<MouseEvent>) => {
            e.cancelBubble = true;
            setCursor("grabbing");
            const g = groupRef.current;
            if (!g) return;

            g.stopDrag();
            g.startDrag();
            setLivePos({ x: g.x(), y: g.y() });

            if (!isSelected) {
                // defer selection so initial drag isn't interrupted by a re-render
                requestAnimationFrame(() => {
                    onSelect();
                });
            }
        },
        [isSelected, onSelect, setCursor]
    );


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
                onDragStart={() => setCursor("grabbing")}
                onMouseUp={() => setCursor("grab")}
                onDragEnd={handleDragEnd}
            >
                <Rect
                    x={-HIT_PAD}
                    y={-HIT_PAD}
                    width={widthWithPad}
                    height={heightWithPad}
                    fill="rgba(0,0,0,0.002)"   // slightly > 0 alpha; ensures Konva builds a hit region
                    listening
                    hitStrokeWidth={HIT_PAD}   // extra forgiveness for edges
                />

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
