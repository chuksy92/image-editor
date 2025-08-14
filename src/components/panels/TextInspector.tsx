"use client";

import React, { useMemo } from "react";
import { useStore } from "@/hooks/useStore";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const TextInspector: React.FC = () => {
    const layers = useStore((s) => s.layers);
    const selectedLayerId = useStore((s) => s.selectedLayerId);
    const update = useStore((s) => s.updateTextLayer);
    const toggleLock = useStore((s) => s.toggleLayerLock);

    const layer = useMemo(
        () => layers.find((l) => l.id === selectedLayerId) || null,
        [layers, selectedLayerId]
    );

    if (!layer) {
        return (
            <div className="p-3 text-sm text-slate-500">
                Select a text layer to edit line-height and letter-spacing.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3 p-3 border rounded-md text-slate-500">
            <div className="flex items-center justify-between">
                <div className="font-medium text-sm">Text Inspector</div>
                <button
                    className="px-2 py-1 text-xs rounded border"
                    onClick={() => toggleLock(layer.id)}
                    title={layer.locked ? "Unlock layer" : "Lock layer"}
                >
                    {layer.locked ? "Unlock" : "Lock"}
                </button>
            </div>

            <label className="flex items-center justify-between gap-3 text-sm">
                <span>Line height</span>
                <input
                    type="number"
                    step={0.1}
                    min={0.5}
                    max={4}
                    value={Number(layer.lineHeight ?? 1).toString()}
                    onChange={(e) => {
                        const v = clamp(parseFloat(e.target.value || "1"), 0.5, 4);
                        update({ id: layer.id, lineHeight: v });
                    }}
                    className="w-24 px-2 py-1 border rounded"
                />
            </label>

            <label className="flex items-center justify-between gap-3 text-sm">
                <span>Letter spacing (px)</span>
                <input
                    type="number"
                    step={0.5}
                    min={-5}
                    max={20}
                    value={Number(layer.letterSpacing ?? 0).toString()}
                    onChange={(e) => {
                        const v = clamp(parseFloat(e.target.value || "0"), -5, 20);
                        update({ id: layer.id, letterSpacing: v });
                    }}
                    className="w-24 px-2 py-1 border rounded"
                />
            </label>
        </div>
    );
};

export default TextInspector;
