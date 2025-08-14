"use client";

import React, { useMemo } from "react";
import { Align, TextLayer, useStore } from "@/hooks/useStore";

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const FONT_STYLES: TextLayer["fontStyle"][] = ["normal", "bold", "italic", "bold italic"];
const ALIGNS: Align[] = ["left", "center", "right"];

const PropertiesPanel: React.FC = () => {
    const layers = useStore((s) => s.layers);
    const selectedLayerId = useStore((s) => s.selectedLayerId);
    const update = useStore((s) => s.updateTextLayer);
    const toggleLock = useStore((s) => s.toggleLayerLock);

    const layer = useMemo(
        () => layers.find((l) => l.id === selectedLayerId) ?? null,
        [layers, selectedLayerId]
    );

    if (!layer) {
        return <div className="p-3 text-sm opacity-80">Select a text layer to edit its properties.</div>;
    }

    const onText: React.ChangeEventHandler<HTMLTextAreaElement> = (e) =>
        update({ id: layer.id, text: e.target.value });

    const onFontFamily: React.ChangeEventHandler<HTMLInputElement> = (e) =>
        update({ id: layer.id, fontFamily: e.target.value });

    const onFontSize: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const v = clamp(parseInt(e.target.value || "0", 10), 1, 1000);
        update({ id: layer.id, fontSize: v });
    };

    const onFontStyle: React.ChangeEventHandler<HTMLSelectElement> = (e) =>
        update({ id: layer.id, fontStyle: e.target.value as TextLayer["fontStyle"] });

    const onColor: React.ChangeEventHandler<HTMLInputElement> = (e) =>
        update({ id: layer.id, fill: e.target.value });

    const onOpacity: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const v = clamp(parseFloat(e.target.value || "1"), 0, 1);
        update({ id: layer.id, opacity: v });
    };

    const onAlign: React.ChangeEventHandler<HTMLSelectElement> = (e) =>
        update({ id: layer.id, align: e.target.value as Align });

    const onLineHeight: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const v = clamp(parseFloat(e.target.value || "1"), 0.5, 4);
        update({ id: layer.id, lineHeight: v });
    };

    const onLetterSpacing: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const v = clamp(parseFloat(e.target.value || "0"), -5, 20);
        update({ id: layer.id, letterSpacing: v });
    };

    return (
        <div className="flex flex-col gap-3 p-3 border rounded-md text-slate-500">
            <div className="flex items-center justify-between">
                <div className="text-sm font-medium">Properties</div>
                <button
                    className="px-2 py-1 text-xs rounded border"
                    onClick={() => toggleLock(layer.id)}
                    title={layer.locked ? "Unlock layer" : "Lock layer"}
                >
                    {layer.locked ? "Unlock" : "Lock"}
                </button>
            </div>

            {/* Text content */}
            <label className="flex flex-col gap-1 text-sm">
                <span>Text</span>
                <textarea
                    value={layer.text}
                    onChange={onText}
                    className="min-h-[80px] resize-y rounded border px-2 py-1"
                />
            </label>

            {/* Typography */}
            <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                    <span>Font family</span>
                    <input
                        type="text"
                        value={layer.fontFamily}
                        onChange={onFontFamily}
                        className="rounded border px-2 py-1"
                        placeholder="Inter, Roboto, etc."
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span>Font size</span>
                    <input
                        type="number"
                        min={1}
                        max={1000}
                        value={layer.fontSize}
                        onChange={onFontSize}
                        className="rounded border px-2 py-1"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span>Font style</span>
                    <select
                        value={layer.fontStyle}
                        onChange={onFontStyle}
                        className="rounded border px-2 py-1"
                    >
                        {FONT_STYLES.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span>Alignment</span>
                    <select
                        value={layer.align}
                        onChange={onAlign}
                        className="rounded border px-2 py-1"
                    >
                        {ALIGNS.map((a) => (
                            <option key={a} value={a}>
                                {a}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {/* Color & opacity */}
            <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                    <span>Color</span>
                    <input
                        type="color"
                        value={layer.fill}
                        onChange={onColor}
                        className="h-10 w-full rounded border"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span>Opacity</span>
                    <input
                        type="range"
                        min={0}
                        max={1}
                        step={0.01}
                        value={layer.opacity}
                        onChange={onOpacity}
                        className="w-full"
                    />
                    <span className="text-xs opacity-70">{Math.round(layer.opacity * 100)}%</span>
                </label>
            </div>

            {/* Advanced typography */}
            <div className="grid grid-cols-2 gap-3">
                <label className="flex flex-col gap-1 text-sm">
                    <span>Line height</span>
                    <input
                        type="number"
                        step={0.1}
                        min={0.5}
                        max={4}
                        value={layer.lineHeight}
                        onChange={onLineHeight}
                        className="rounded border px-2 py-1"
                    />
                </label>

                <label className="flex flex-col gap-1 text-sm">
                    <span>Letter spacing (px)</span>
                    <input
                        type="number"
                        step={0.5}
                        min={-5}
                        max={20}
                        value={layer.letterSpacing}
                        onChange={onLetterSpacing}
                        className="rounded border px-2 py-1"
                    />
                </label>
            </div>
        </div>
    );
};

export default PropertiesPanel;
