// src/components/upload/ImageUpload.tsx
import React, { useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";

const ImageUpload = () => {
    const setImage = useStore((s) => s.setImage);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const onFile = (file?: File) => {
        if (!file) return;
        if (file.type !== "image/png") {
            alert("Please upload a PNG image.");
            return;
        }
        setImage(file);
        // allow selecting the same file again
        if (inputRef.current) inputRef.current.value = "";
    };

    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
                e.preventDefault();
                setDragOver(false);
                onFile(e.dataTransfer.files?.[0]);
            }}
            className={`relative grid min-h-[60vh] w-full place-items-center rounded-2xl border-4 border-dashed p-12 transition ${
                dragOver ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50 hover:border-blue-400"
            }`}
        >
            <div className="pointer-events-none text-center">
                <h2 className="mb-2 text-3xl font-extrabold text-blue-600">Upload PNG</h2>
                <p className="text-lg text-gray-600">Click or drag your image here to begin.</p>
            </div>

            {/* The input captures the click; no onClick on container */}
            <input
                ref={inputRef}
                type="file"
                accept="image/png"
                onChange={(e) => onFile(e.target.files?.[0] ?? undefined)}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                aria-label="Upload PNG"
            />
        </div>
    );
};

export default ImageUpload;
