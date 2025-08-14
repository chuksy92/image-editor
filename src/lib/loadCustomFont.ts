
/**
 * Load a custom font file (TTF/OTF/WOFF/WOFF2) using the FontFace API,
 * register it in document. Fonts, and return its family + object URL.
 */
export type LoadedFont = {
    family: string;
    url: string;
};

const SUPPORTED_EXTENSIONS = new Set(["ttf", "otf", "woff", "woff2"]);

export function inferFamilyName(filename: string): string {
    const base = filename.replace(/\.[^.]+$/, "");
    // Normalize a bit (optional)
    return base.replace(/[_\-]+/g, " ").trim();
}

export async function loadCustomFontFromFile(file: File, familyOverride?: string): Promise<LoadedFont> {
    const name = file.name.toLowerCase();
    const ext = name.split(".").pop();
    if (!ext || !SUPPORTED_EXTENSIONS.has(ext)) {
        throw new Error("Unsupported font file. Please upload TTF, OTF, WOFF, or WOFF2.");
    }

    const family = familyOverride?.trim() || inferFamilyName(file.name);
    const url = URL.createObjectURL(file);

    const fontFace = new FontFace(family, `url(${url})`);

    // load + register
    await fontFace.load();
    document.fonts.add(fontFace);

    return { family, url };
}

