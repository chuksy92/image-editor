"use client";

import React from "react";
import { useStore } from "@/hooks/useStore";
import FontUploadButton from "./FontUploadButton";
import FontFamilySelect from "./FontFamilySelect";

const StylePanel: React.FC = () => {
    const selectedId = useStore((s) => s.selectedLayerId);
    const layer = useStore((s) => s.layers.find((l) => l.id === selectedId));

    return (
        <div className="space-y-4">
            <FontUploadButton />
            {layer ? (
                <FontFamilySelect layer={layer} />
            ) : (
                <p className="text-xs text-slate-500">Select a text layer to edit its font</p>
            )}
        </div>
    );
};

export default StylePanel;
