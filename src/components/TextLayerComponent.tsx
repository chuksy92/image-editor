import React, { useRef, useEffect } from 'react';
import { Text, Transformer } from 'react-konva';
import { useStore } from '@/hooks/useStore';
import Konva from 'konva';

/**
 * Component to render a single text layer on the Konva stage.
 */
const TextLayerComponent = ({ layer, isSelected, onSelect }: { layer: any, isSelected: boolean, onSelect: () => void }) => {
    const shapeRef = useRef<Konva.Text>(null);
    const trRef = useRef<Konva.Transformer>(null);
    const updateTextLayer = useStore((state) => state.updateTextLayer);

    // Attach the transformer to the selected shape.
    useEffect(() => {
        if (isSelected && trRef.current && shapeRef.current) {
            trRef.current.nodes([shapeRef.current]);
            trRef.current.getLayer()?.batchDraw();
        }
    }, [isSelected]);

    // Handle transformations (scale, rotate) and update the layer state.
    const handleTransformEnd = () => {
        const node = shapeRef.current;
        if (node) {
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
            const newLayer = {
                ...layer,
                x: node.x(),
                y: node.y(),
                width: Math.max(20, node.width() * scaleX),
                height: Math.max(20, node.height() * scaleY),
                rotation: node.rotation(),
            };

            // Reset scale to 1 to prevent issues with Konva and our state.
            node.scaleX(1);
            node.scaleY(1);

            updateTextLayer(newLayer);
        }
    };

    return (
        <>
            <Text
                ref={shapeRef}
                text={layer.text}
                x={layer.x}
                y={layer.y}
                width={layer.width}
                rotation={layer.rotation}
                fontSize={layer.fontSize}
                fontFamily={layer.fontFamily}
                fill={layer.fill}
                fontStyle={layer.fontStyle}
                align={layer.align}
                opacity={layer.opacity}
                draggable
                onClick={onSelect}
                onDragEnd={(e) => {
                    updateTextLayer({ ...layer, x: e.target.x(), y: e.target.y() });
                }}
                onTransformEnd={handleTransformEnd}
            />
            {isSelected && (
                <Transformer
                    ref={trRef}
                    boundBoxFunc={(oldBox, newBox) => {
                        if (newBox.width < 5 || newBox.height < 5) {
                            return oldBox;
                        }
                        return newBox;
                    }}
                />
            )}
        </>
    );
};

export default TextLayerComponent;
