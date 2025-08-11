import React, { useRef, useEffect, useState } from 'react';
import Konva from 'konva';
import { Stage, Layer, Image as KonvaImage } from 'react-konva';
import { useStore } from '@/hooks/useStore';
import TextLayerComponent from './TextLayerComponent';

/**
 * Renders the main canvas with the image and all text layers.
 */
const CanvasComponent = () => {
    const {
        image, layers, selectedLayer, setCanvasDimensions, setSelectedLayer, setStageRef,
    } = useStore();

    const stageRef = useRef<Konva.Stage>(null);
    const [imageObject, setImageObject] = useState<HTMLImageElement | null>(null);

    // Set the stage reference in the store.
    useEffect(() => {
        if (stageRef.current) setStageRef(stageRef);
    }, [setStageRef]);

    // Load the uploaded image and set the canvas dimensions.
    useEffect(() => {
        if (image) {
            const img = new window.Image();
            img.src = URL.createObjectURL(image);
            img.onload = () => {
                setImageObject(img);
                setCanvasDimensions({ width: img.width, height: img.height });
            };
        }
    }, [image, setCanvasDimensions]);

    // Deselect any layer when the user clicks on the canvas background.
    const handleStageClick = (e: Konva.KonvaEventObject<MouseEvent>) => {
        if (e.target === e.target.getStage()) setSelectedLayer(null);
    };

    return (
        <Stage
            width={imageObject?.width || 0}
            height={imageObject?.height || 0}
            ref={stageRef}
            onClick={handleStageClick}
        >
            <Layer>
                {imageObject && (
                    <KonvaImage image={imageObject} width={imageObject.width} height={imageObject.height} />
                )}
                {layers.map((layer) => (
                    <TextLayerComponent
                        key={layer.id}
                        layer={layer}
                        isSelected={layer.id === selectedLayer?.id}
                        onSelect={() => setSelectedLayer(layer)}
                    />
                ))}
            </Layer>
        </Stage>
    );
};

export default CanvasComponent;
