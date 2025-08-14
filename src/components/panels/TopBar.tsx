"use client";
import React from "react";
import { useStore } from "@/hooks/useStore";

const TopBar: React.FC = () => {
    const image             = useStore((s) => s.image);
    const addTextLayer      = useStore((s) => s.addTextLayer);
    const duplicateSelected = useStore((s) => s.duplicateSelected);
    const deleteSelected    = useStore((s) => s.deleteSelected);
    const exportImage       = useStore((s) => s.exportImage);
    const undo              = useStore((s) => s.undo);
    const redo              = useStore((s) => s.redo);
    const reset             = useStore((s) => s.reset);

    const pastLen    = useStore((s) => s.history.past.length);
    const futureLen  = useStore((s) => s.history.future.length);
    const canUndo    = pastLen > 0;
    const canRedo    = futureLen > 0;

    return (
        <div className={`sticky top-0 z-30 border-b border-gray-200 ${image ? "" : "bg-white/70"} backdrop-blur`}>
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-2">
                <div className="text-xl font-extrabold text-blue-600">Image Editor</div>

                {image ? (
                    <>
                        <div className="ml-2 flex items-center gap-2">
                            <button
                                onClick={undo}
                                disabled={!canUndo}
                                className={`rounded-md px-3 py-1 text-sm transition ${
                                    canUndo
                                        ? "bg-slate-800 text-white hover:bg-slate-900"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                                title="Undo (Ctrl/Cmd+Z)"
                            >
                                Undo
                            </button>
                            <button
                                onClick={redo}
                                disabled={!canRedo}
                                className={`rounded-md px-3 py-1 text-sm transition ${
                                    canRedo
                                        ? "bg-slate-800 text-white hover:bg-slate-900"
                                        : "bg-slate-200 text-slate-400 cursor-not-allowed"
                                }`}
                                title="Redo (Ctrl/Cmd+Shift+Z)"
                            >
                                Redo
                            </button>

                            <span
                                className="ml-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600"
                                title="History steps (back/forward)"
                            >
                {pastLen} / {futureLen}
              </span>
                        </div>

                        <div className="mx-3 h-6 w-px bg-gray-300" />

                        <div className="flex items-center gap-2">
                            <button
                                onClick={addTextLayer}
                                className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-blue-700"
                            >
                                + Text
                            </button>
                            <button
                                onClick={duplicateSelected}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-300 hover:bg-slate-100"
                            >
                                Duplicate
                            </button>
                            <button
                                onClick={deleteSelected}
                                className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-red-400 hover:bg-slate-100"
                            >
                                Delete
                            </button>
                        </div>

                        <div className="mx-3 h-6 w-px bg-gray-300" />

                        <div className="ml-auto flex items-center gap-2">
                            <button
                                onClick={exportImage}
                                className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-emerald-700"
                            >
                                Export PNG
                            </button>
                            <button
                                onClick={reset}
                                className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white shadow hover:bg-red-700"
                                title="Clear autosave and start fresh"
                            >
                                Reset
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="ml-auto text-sm text-slate-500">Upload a PNG to get started</div>
                )}
            </div>
        </div>
    );
};

export default TopBar;
