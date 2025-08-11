import React, { useEffect, useRef } from "react";
import { Group, Rect, Text, Transformer } from "react-konva";
import Konva from "konva";
import { TextLayer, useStore } from "@/hooks/useStore";

const HIT_PAD = 8; // generous grab area

const TextLayerNode = ({
                           layer,
                           isSelected,
                           onSelect,
                       }: {
    layer: TextLayer;
    isSelected: boolean;
    onSelect: () => void;
}) => {
    const groupRef = useRef<Konva.Group>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const update = useStore((s) => s.updateTextLayer);

    // Attach Transformer to GROUP when selected
    useEffect(() => {
        if (isSelected && trRef.current && groupRef.current) {
            trRef.current.nodes([groupRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    // Commit geometry after resize/rotate
    const commitTransform = () => {
        const g = groupRef.current;
        if (!g) return;
        const sx = g.scaleX();
        const sy = g.scaleY();
        const newWidth = Math.max(20, layer.width * sx);
        const newHeight = Math.max(20, layer.height * sy);
        g.scaleX(1);
        g.scaleY(1);
        update({ id: layer.id, x: g.x(), y: g.y(), rotation: g.rotation(), width: newWidth, height: newHeight });
    };

    const setCursor = (v: string) => groupRef.current?.getStage()?.container().style.setProperty("cursor", v);

    const widthWithPad = Math.max(20, layer.width) + HIT_PAD * 2;
    const heightWithPad = Math.max(20, layer.height) + HIT_PAD * 2;

    return (
        <>
            <Group
                id={layer.id}
                ref={groupRef}
                x={layer.x}
                y={layer.y}
                rotation={layer.rotation}
                draggable
                dragDistance={0} // tiny movement starts drag
                listening
                // Desktop mouse interactions
                onMouseEnter={() => setCursor("grab")}
                onMouseLeave={() => {
                    if (!groupRef.current?.isDragging()) setCursor("default");
                }}
                onMouseDown={(e) => {
                    e.cancelBubble = true;     // don’t let stage deselect
                    onSelect();
                    setCursor("grabbing");
                    const g = groupRef.current;
                    g?.stopDrag();             // defensive
                    g?.startDrag();            // press = drag
                }}
                onDragStart={() => setCursor("grabbing")}
                onMouseUp={() => setCursor("grab")}
                onDragEnd={() => {
                    const g = groupRef.current;
                    if (!g) return;
                    setCursor("grab");
                    // ✅ persist once at end; avoids mid-drag re-renders
                    update({ id: layer.id, x: g.x(), y: g.y() });
                }}
            >
                {/* Invisible but hittable padded area (prevents “losing focus” at edges) */}
                <Rect
                    x={-HIT_PAD}
                    y={-HIT_PAD}
                    width={widthWithPad}
                    height={heightWithPad}
                    fill="rgba(0,0,0,0.001)" // create hit region but visually invisible
                    listening
                />
                {/* Actual text; Group handles events */}
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
                    boundBoxFunc={(oldBox, newBox) => (newBox.width < 20 || newBox.height < 20 ? oldBox : newBox)}
                    onTransformEnd={commitTransform}
                />
            )}
        </>
    );
};

export default TextLayerNode;
