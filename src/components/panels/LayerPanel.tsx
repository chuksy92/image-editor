import React, { useCallback, useRef } from "react";
import { useStore } from "@/hooks/useStore";

const LayerPanel = () => {
    const {
        layers,
        reorderLayers,
        selectedLayerId,
        setSelectedLayer
    } = useStore();

    const isReordering = useRef(false);

    const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
        isReordering.current = true;
        e.dataTransfer.setData("layerId", id);
    }, []);

    const handleDragEnd = useCallback(() => {
        setTimeout(() => {
            isReordering.current = false;
        }, 0);
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent, targetId: string) => {
            e.preventDefault();
            const draggedId = e.dataTransfer.getData("layerId");
            if (!draggedId || draggedId === targetId) return;

            const next = [...layers];
            const dragged = next.find((l) => l.id === draggedId);
            const targetIdx = next.findIndex((l) => l.id === targetId);
            if (!dragged || targetIdx < 0) return;

            const filtered = next.filter((l) => l.id !== draggedId);
            filtered.splice(targetIdx, 0, dragged);
            reorderLayers(filtered);
        },
        [layers, reorderLayers]
    );

    const handleClick = (id: string) => {
        if (isReordering.current) return;
        setSelectedLayer(id);            // ✅ select only; dragging starts on canvas click
    };

    return (
        <div className="h-[calc(100vh-140px)] overflow-auto rounded-lg bg-white p-4 shadow">
            <div className="mb-3 text-sm font-semibold text-slate-500">Layers</div>
            <ul className="flex flex-col-reverse gap-2">
                {layers.map((l) => (
                    <li
                        key={l.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, l.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => e.preventDefault()}
                        onDrop={(e) => handleDrop(e, l.id)}
                        onClick={() => handleClick(l.id)}
                        className={`flex cursor-pointer items-center justify-between rounded-md border px-3 py-2 text-sm transition ${
                            selectedLayerId === l.id ? "border-blue-500 bg-blue-50" : "border-transparent bg-gray-100 hover:bg-gray-200"
                        }`}
                        title="Drag to reorder, click to select"
                    >
                        <span className="truncate">{l.text || `Layer ${l.id.slice(0, 4)}`}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LayerPanel;
