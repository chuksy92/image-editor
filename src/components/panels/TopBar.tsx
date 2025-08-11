"use client";

import React from "react";
import { useStore } from "@/hooks/useStore";

const TopBar = () => {
    const { image, addTextLayer, exportImage, deleteSelected, duplicateSelected, bringForward, sendBackward } = useStore();

    return (
        <div className="sticky top-0 z-10 border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 p-3">
                <div className="text-xl font-extrabold text-blue-600">Image Editor</div>
                {image ? (
                    <div className="flex items-center gap-2">
                        <button onClick={addTextLayer} className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700">
                            + Text
                        </button>
                        <button onClick={duplicateSelected} className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">
                            Duplicate
                        </button>
                        <button onClick={deleteSelected} className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200">
                            Delete
                        </button>
                        <div className="mx-2 h-6 w-px bg-gray-300" />
                        <button onClick={bringForward} className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200" title="Bring forward">
                            Bring ↑
                        </button>
                        <button onClick={sendBackward} className="rounded-lg bg-gray-100 px-3 py-2 text-sm hover:bg-gray-200" title="Send backward">
                            Send ↓
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
