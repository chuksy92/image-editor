"use client";

import React, { useMemo } from "react";
import { useStore } from "@/hooks/useStore";
import { getFontFamilies } from "@/lib/fonts";
import type { TextLayer } from "@/hooks/useStore";

const FontFamilySelect: React.FC<{ layer: TextLayer }> = ({ layer }) => {
    const update = useStore((s) => s.updateTextLayer);
    const customFonts = useStore((s) => s.customFonts);

    const options = useMemo(
        () => Array.from(new Set([...getFontFamilies(), ...customFonts.map(f => f.family)])),
        [customFonts]
    );

    return (
        <label className="flex flex-col gap-1 text-sm">
            <span className="text-slate-600">Font</span>
            <select
                className="rounded-md border border-gray-400 px-2 py-1 bg-white text-gray-600"
                value={layer.fontFamily}
                onChange={(e) => update({ id: layer.id, fontFamily: e.target.value })}
            >
                {options.map((fam) => (
                    <option key={fam} value={fam}>
                        {fam}
                    </option>
                ))}
            </select>
        </label>
    );
};

export default FontFamilySelect;
