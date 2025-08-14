import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import type { Group as KonvaGroup } from "konva/lib/Group";
import type { Transformer as KonvaTransformer } from "konva/lib/shapes/Transformer";
import type { KonvaEventObject } from "konva/lib/Node";
import { TextLayer, useStore } from "@/hooks/useStore";

type Props = { layer: TextLayer; isSelected: boolean; onSelect: () => void };

const HIT_PAD = 8;
const TEXT_MIN_SIZE = 20;

const TextLayerNode: React.FC<Props> = ({ layer, isSelected, onSelect }) => {
    const groupRef = useRef<KonvaGroup>(null);
    const trRef = useRef<KonvaTransformer>(null);
    const rafIdRef = useRef<number | null>(null);

    // live (no history) during drag, commit (with history) on end
    const updateLive   = useStore((s) => s.updateTextLayerLive);
    const updateCommit = useStore((s) => s.updateTextLayer);

    const setCursor = useCallback((cursor: "default" | "grab" | "grabbing") => {
        const el = groupRef.current?.getStage()?.container();
        if (!el) return;
        el.classList.remove("konva-cursor-default", "konva-cursor-grab", "konva-cursor-grabbing");
        el.classList.add(
            cursor === "grabbing" ? "konva-cursor-grabbing" :
                cursor === "grab"     ? "konva-cursor-grab" :
                    "konva-cursor-default"
        );
    }, []);

    // Bind transformer when selected
    useEffect(() => {
        if (!isSelected) return;
        const tr = trRef.current;
        const g  = groupRef.current;
        if (!tr || !g) return;
        tr.nodes([g]);
        tr.getLayer()?.batchDraw();
    }, [isSelected]);

    // Press to select and start drag immediately
    const handleMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
        e.cancelBubble = true; // don't let Stage onMouseDown deselect
        const g = groupRef.current;
        if (!g) return;

        // ensure selected so transformer follows
        if (!isSelected) onSelect();

        setCursor("grabbing");

        // Start dragging the group right away
        g.stopDrag();
        g.startDrag();
    }, [isSelected, onSelect, setCursor]);

    const handleDragStart = useCallback(() => {
        setCursor("grabbing");
    }, [setCursor]);

    const handleDragMove = useCallback(() => {
        const g = groupRef.current;
        if (!g) return;
        const x = g.x();
        const y = g.y();
        // coalesce updates to once per frame
        if (rafIdRef.current != null) return;
        rafIdRef.current = requestAnimationFrame(() => {
            rafIdRef.current = null;
            updateLive({ id: layer.id, x, y });
        });
    }, [layer.id, updateLive]);

    const handleDragEnd = useCallback(() => {
        const g = groupRef.current;
        if (!g) return;

        if (rafIdRef.current) {
            cancelAnimationFrame(rafIdRef.current);
            rafIdRef.current = null;
        }

        const finalX = g.x();
        const finalY = g.y();
        setCursor("grab");
        updateCommit({ id: layer.id, x: finalX, y: finalY });
    }, [layer.id, setCursor, updateCommit]);

    const handleTransformEnd = useCallback(() => {
        const g = groupRef.current;
        if (!g) return;

        const sx = g.scaleX();
        const sy = g.scaleY();

        const nextWidth  = Math.max(TEXT_MIN_SIZE, layer.width * sx);
        const nextHeight = Math.max(TEXT_MIN_SIZE, layer.height * sy);

        g.scaleX(1);
        g.scaleY(1);

        updateCommit({
            id:       layer.id,
            x:        g.x(),
            y:        g.y(),
            rotation: g.rotation(),
            width:    nextWidth,
            height:   nextHeight,
        });
    }, [layer.height, layer.id, layer.width, updateCommit]);

    // Big friendly hit area
    const widthWithPad = useMemo(
        () => Math.max(TEXT_MIN_SIZE, layer.width) + HIT_PAD * 2,
        [layer.width]
    );
    const heightWithPad = useMemo(
        () => Math.max(TEXT_MIN_SIZE, layer.height) + HIT_PAD * 2,
        [layer.height]
    );

    // Always controlled by store
    const groupPosProps = { x: layer.x, y: layer.y };
    const draggable = !layer.locked;
    const listening = !layer.locked;

    return (
        <>
            <Group
                id={layer.id}
                ref={groupRef}
                {...groupPosProps}
                rotation={layer.rotation}
                draggable={draggable}
                listening={listening}
                onMouseEnter={() => setCursor("grab")}
                onMouseLeave={() => { if (!groupRef.current?.isDragging()) setCursor("default"); }}
                onMouseDown={handleMouseDown} // start drag here
                onDragStart={handleDragStart}
                onDragMove={handleDragMove}
                onMouseUp={() => setCursor("grab")}
                onDragEnd={handleDragEnd}
            >
                {/* Padded hit target so it's easy to grab */}
                <Rect
                    x={-HIT_PAD}
                    y={-HIT_PAD}
                    width={widthWithPad}
                    height={heightWithPad}
                    fill="rgba(0,0,0,0.002)"
                    listening
                    hitStrokeWidth={HIT_PAD}
                />
                {/* Let the text itself be clickable/draggable */}
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
                    lineHeight={layer.lineHeight}
                    letterSpacing={layer.letterSpacing}
                    listening
                    perfectDrawEnabled={false}
                    shadowForStrokeEnabled={false}
                    onMouseEnter={() => setCursor("grab")}
                    onMouseLeave={() => { if (!groupRef.current?.isDragging()) setCursor("default"); }}
                    onMouseDown={handleMouseDown}
                />
            </Group>

            {isSelected && (
                <Transformer
                    ref={trRef}
                    rotateEnabled
                    keepRatio={false}
                    enabledAnchors={["top-left", "top-right", "bottom-left", "bottom-right"]}
                    boundBoxFunc={(oldBox, n) =>
                        n.width < TEXT_MIN_SIZE || n.height < TEXT_MIN_SIZE ? oldBox : n
                    }
                    onTransformEnd={handleTransformEnd}
                />
            )}
        </>
    );
};

export default React.memo(TextLayerNode);
