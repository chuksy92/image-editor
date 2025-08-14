"use client";

import React, { useRef } from "react";
import { useStore } from "@/hooks/useStore";
import { loadCustomFontFromFile } from "@/lib/loadCustomFont";
import { toast } from "react-hot-toast";

type Props = {
    className?: string;
    label?: string;
};

const FontUploadButton: React.FC<Props> = ({ className, label = "Upload font (TTF/OTF/WOFF)" }) => {
    const inputRef = useRef<HTMLInputElement>(null);
    const addCustomFont = useStore((s) => s.addCustomFont);

    const onPick = () => inputRef.current?.click();

    const onChange: React.ChangeEventHandler<HTMLInputElement> = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const loaded = await loadCustomFontFromFile(file);
            addCustomFont({ family: loaded.family, url: loaded.url });
            toast.success(`Loaded font: ${loaded.family}`);
        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to load font.";
            toast.error(msg);
        } finally {
            // allow re-selecting the same file
            if (inputRef.current) inputRef.current.value = "";
        }
    };

    return (
        <>
            <button
                type="button"
                onClick={onPick}
                className={className ?? "px-3 py-2 text-sm rounded border hover:bg-gray-50"}
            >
                {label}
            </button>
            <input
                ref={inputRef}
                type="file"
                accept=".ttf,.otf,.woff,.woff2"
                onChange={onChange}
                hidden
                aria-label="Upload custom font"
            />
        </>
    );
};

export default FontUploadButton;
