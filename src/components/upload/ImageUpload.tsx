"use client"
import React, { useRef, useState } from "react";
import { useStore } from "@/hooks/useStore";

const ImageUpload = () => {
    const setImage = useStore((s) => s.setImage);
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    // Cap uploads at 15 MB
    const MAX_BYTES = 15 * 1024 * 1024;

    const isPng = (file: File) =>
        file.type === "image/png" || /\.png$/i.test(file.name);

    const onFile = async (file?: File) => {
        if (!file) return;

        // Type check
        if (!isPng(file)) {
            alert("Please upload a PNG image.");
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        // Size check
        if (file.size > MAX_BYTES) {
            const mb = (MAX_BYTES / (1024 * 1024)).toFixed(0);
            alert(`Image is too large. Max ${mb} MB.`);
            if (inputRef.current) inputRef.current.value = "";
            return;
        }

        try {
            await setImage(file); // setImage from your store is async

        } catch (err) {
            const msg = err instanceof Error ? err.message : "Failed to load image.";
            alert(msg);
        } finally {
            // allow selecting the same file again
            if (inputRef.current) inputRef.current.value = "";
        }
    };


    return (
        <div
            onDragOver={(e) => {
                e.preventDefault();
                setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={async (e) => {
                e.preventDefault();
                setDragOver(false);
                await onFile(e.dataTransfer.files?.[0]);
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
