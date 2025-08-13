"use client";

import React from "react";
import { useStore } from "@/hooks/useStore";

const TopBar = () => {
    const { image, addTextLayer, exportImage, deleteSelected, duplicateSelected, } = useStore();

    return (
        <div className="sticky top-0 z-10 p-2 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
                <div className="text-xl font-extrabold text-blue-600">Image Editor</div>
                {image ? (
                    <div className="flex items-center gap-2">
                        <button onClick={addTextLayer} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">
                            + Text
                        </button>
                        <button onClick={duplicateSelected} className="rounded-lg border px-3 py-2 text-sm hover:bg-blue-500">
                            Duplicate
                        </button>
                        <button onClick={deleteSelected} className="rounded-lg border px-3 py-2 text-sm hover:bg-blue-500">
                            Delete
                        </button>

                        <div className="mx-2 h-6 w-px bg-gray-300" />
                        <button onClick={exportImage} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700">
                            Export PNG
                        </button>
                    </div>
                ) : (
                    <div className="text-sm text-slate-500">Upload a PNG to get started</div>
                )}
            </div>
        </div>
    );
};

export default TopBar;
