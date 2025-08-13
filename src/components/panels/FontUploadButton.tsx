"use client";

import React, { useRef } from "react";
import { loadCustomFontFromFile } from "@/lib/loadCustomFont";
import { useStore } from "@/hooks/useStore";

const ACCEPT = ".ttf,.otf,.woff,.woff2";

const FontUploadButton: React.FC = () => {
    const inputRef = useRef<HTMLInputElement>(null);
    const addCustomFont = useStore((s) => s.addCustomFont);
    const stageRef = useStore((s) => s.stageRef);

    const handlePick = () => inputRef.current?.click();

    const handleChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const { family, url } = await loadCustomFontFromFile(file);
            addCustomFont({ family, url });

            // Force a redraw so Konva uses the newly available font
            stageRef?.current?.batchDraw();

            // Reset input so user can upload the same file again if needed
            e.currentTarget.value = "";
        } catch (err: any) {
            console.error(err);
            alert(err?.message || "Failed to load font.");
        }
    };

    return (
        <div className="flex items-center gap-2">
            <button
                type="button"
                onClick={handlePick}
                className="rounded-lg px-3 py-2 text-sm font-medium bg-white text-gray-600 shadow border hover:bg-slate-50"
                title="Upload custom font (TTF/OTF/WOFF/WOFF2)"
            >
                + Upload Font
            </button>
            <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                className="hidden"
                onChange={handleChange}
            />
        </div>
    );
};

export default FontUploadButton;
