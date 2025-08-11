import React, { useCallback } from 'react';
import { useStore } from '@/hooks/useStore';

/**
 * The panel to manage layer stacking order.
 */
const LayerPanelComponent = () => {
    const { layers, reorderLayers, setSelectedLayer, selectedLayer: activeLayer } = useStore();

    const handleDragStart = useCallback((e: React.DragEvent, layer: any) => {
        e.dataTransfer.setData('layerId', layer.id);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent, targetLayer: any) => {
        e.preventDefault();
        const draggedLayerId = e.dataTransfer.getData('layerId');
        const draggedLayer = layers.find((l) => l.id === draggedLayerId);

        if (draggedLayer) {
            const newLayers = layers.filter((l) => l.id !== draggedLayerId);
            const targetIndex = newLayers.findIndex((l) => l.id === targetLayer.id);

            newLayers.splice(targetIndex, 0, draggedLayer);
            reorderLayers(newLayers);
        }
    }, [layers, reorderLayers]);

    return (
        <div className="bg-white p-4 rounded-lg shadow-inner flex-grow overflow-y-auto">
            <h3 className="text-xl font-bold text-gray-800 mb-4">Layers</h3>
            <ul className="flex flex-col-reverse gap-2">
                {layers.map((layer) => (
                    <li
                        key={layer.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, layer)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, layer)}
                        onClick={() => setSelectedLayer(layer)}
                        className={`p-3 rounded-md shadow-sm cursor-pointer transition-all duration-200 ease-in-out border-2 ${
                            activeLayer?.id === layer.id
                                ? 'bg-blue-50 border-blue-500'
                                : 'bg-gray-100 border-transparent hover:bg-gray-200'
                        }`}
                    >
            <span className="font-semibold text-gray-700 truncate">
              {layer.text || `Layer ${layer.id.substring(0, 4)}`}
            </span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LayerPanelComponent;
