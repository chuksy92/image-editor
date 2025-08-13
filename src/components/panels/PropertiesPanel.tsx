"use client";

import React from "react";
import { FONT_FAMILIES } from "@/lib/fonts";
import { Align, useStore } from "@/hooks/useStore";

const Row = ({ children }: { children: React.ReactNode }) => <div className="flex items-center gap-3">{children}</div>;

const PropertiesPanel = () => {
    const { layers, selectedLayerId, updateTextLayer } = useStore();
    const layer = layers.find((l) => l.id === selectedLayerId);

    if (!layer) {
        return (
            <div className="rounded-lg bg-white p-4 shadow">
                <div className="text-sm text-slate-500">Select a text layer to edit its properties.</div>
            </div>
        );
    }

    const set = <K extends keyof typeof layer>(key: K, value: (typeof layer)[K]) => updateTextLayer({ id: layer.id, [key]: value } as any);

    const toggleStyle = (token: "bold" | "italic") => {
        const parts = new Set(layer.fontStyle.split(" ").filter(Boolean));
        parts.has(token) ? parts.delete(token) : parts.add(token);
        const val = Array.from(parts).join(" ") || "normal";
        set("fontStyle", val as any);
    };

    const setAlign = (a: Align) => set("align", a);

    return (
        <div className="h-[calc(100vh-140px)] overflow-auto rounded-lg bg-white p-4 shadow">
            <div className="mb-3 text-sm font-semibold text-slate-500">Text Properties</div>

            <div className="space-y-4">
                <label className="block">
                    <span className="mb-1 block text-xs font-medium text-slate-600">Content</span>
                    <textarea
                        value={layer.text}
                        onChange={(e) => set("text", e.target.value)}
                        className="w-full text-gray-600 resize-none rounded-md border px-3 py-2 text-sm outline-none"
                        rows={4}
                    />
                </label>

                <Row>
                    <label className="flex-1">
                        <span className="mb-1 block text-xs font-medium text-slate-600">Font Family</span>
                        <select
                            value={layer.fontFamily}
                            onChange={(e) => set("fontFamily", e.target.value)}
                            className="w-full text-gray-600 rounded-md border px-3 py-2 text-sm outline-none"
                        >
                            {FONT_FAMILIES.map((f) => (
                                <option key={f} value={f}>
                                    {f}
                                </option>
                            ))}
                        </select>
                    </label>

                    <label className="w-28">
                        <span className="mb-1 block text-xs font-medium text-slate-600">Size</span>
                        <input
                            type="number"
                            min={6}
                            max={512}
                            value={layer.fontSize}
                            onChange={(e) => set("fontSize", Number(e.target.value))}
                            className="w-full text-gray-600 rounded-md border px-2 py-2 text-sm outline-none"
                        />
                    </label>
                </Row>

                <Row>
                    <button
                        onClick={() => toggleStyle("bold")}
                        className={`rounded-md border px-3 py-2 text-sm text-gray-600 ${layer.fontStyle.includes("bold") ? "border-blue-500 bg-blue-50" : "bg-gray-100"}`}
                    >
                        Bold
                    </button>
                    <button
                        onClick={() => toggleStyle("italic")}
                        className={`rounded-md border px-3 py-2 text-sm text-gray-600 ${
                            layer.fontStyle.includes("italic") ? "border-blue-500 bg-blue-50" : "bg-gray-100"
                        }`}
                    >
                        Italic
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                        <button
                            onClick={() => setAlign("left")}
                            className={`rounded-md border px-2 py-2 text-sm text-gray-600 ${layer.align === "left" ? "border-blue-500 bg-blue-50" : "bg-gray-100"}`}
                            title="Align left"
                        >
                            ⬅
                        </button>
                        <button
                            onClick={() => setAlign("center")}
                            className={`rounded-md border px-2 py-2 text-sm text-gray-600 ${layer.align === "center" ? "border-blue-500 bg-blue-50" : "bg-gray-100"}`}
                            title="Align center"
                        >
                            ⬍
                        </button>
                        <button
                            onClick={() => setAlign("right")}
                            className={`rounded-md border px-2 py-2 text-sm text-gray-600 ${layer.align === "right" ? "border-blue-500 bg-blue-50" : "bg-gray-100"}`}
                            title="Align right"
                        >
                            ➡
                        </button>
                    </div>
                </Row>

                <Row>
                    <label className="flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">Color</span>
                        <input type="color" value={layer.fill} onChange={(e) => set("fill", e.target.value)} />
                    </label>

                    <label className="ml-auto flex items-center gap-2">
                        <span className="text-xs font-medium text-slate-600">Opacity</span>
                        <input
                            type="range"
                            min={0}
                            max={1}
                            step={0.01}
                            value={layer.opacity}
                            onChange={(e) => set("opacity", Number(e.target.value))}
                        />
                        <span className="w-10 text-right text-xs">{Math.round(layer.opacity * 100)}%</span>
                    </label>
                </Row>

                <Row>
                    <label className="w-28">
                        <span className="mb-1 block text-xs font-medium text-slate-600">Rotate</span>
                        <input
                            type="number"
                            value={layer.rotation}
                            onChange={(e) => set("rotation", Number(e.target.value))}
                            className="w-full rounded-md border px-2 py-2 text-sm text-gray-600 outline-none"
                        />
                    </label>
                    <label className="flex-1">
                        <span className="mb-1 block text-xs font-medium text-slate-600">Width</span>
                        <input
                            type="number"
                            min={20}
                            value={Math.round(layer.width)}
                            onChange={(e) => set("width", Number(e.target.value))}
                            className="w-full rounded-md border px-2 py-2 text-sm text-gray-600 outline-none"
                        />
                    </label>
                </Row>
            </div>
        </div>
    );
};

export default PropertiesPanel;
