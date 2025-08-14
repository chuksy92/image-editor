import React, { useCallback, useRef } from "react";
import { useStore } from "@/hooks/useStore";

const LayerPanel = () => {
    const {
        layers,
        reorderLayers,
        selectedLayerId,
        setSelectedLayer,
        toggleLayerLock
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

    if (!layers.length) {
        return <div className="p-3 text-sm text-slate-500">No layers yet.</div>;
    }


    return (
        <div className="max-h-[calc(100vh-140px)] overflow-auto rounded-lg bg-white p-4 shadow">
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
                            selectedLayerId === l.id ? "border-blue-500 bg-blue-600" : "border-transparent bg-black "
                        }`}
                        title="Drag to reorder, click to select"
                    >
                        <div className="truncate">
                            {l.locked ? "🔒 " : ""}{l.text || ""}{" "}
                            <span className="opacity-50">· {Math.round(l.x)},{Math.round(l.y)}</span>
                        </div>
                        <button
                            className="text-xs px-2 py-1 rounded border"
                            onClick={(e) => {
                                e.stopPropagation();
                                toggleLayerLock(l.id);
                            }}
                        >
                            {l.locked ? "Unlock" : "Lock"}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default LayerPanel;
