export async function loadCustomFontFromFile(file: File): Promise<{ family: string; url: string }> {
    const extOk = /\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/.test(file.name);
    if (!extOk) throw new Error("Unsupported font type. Please upload TTF, OTF, WOFF, or WOFF2.");

    // Derive a readable family name from the file name
    const base = file.name.replace(/\.(ttf|otf|woff2?|TTF|OTF|WOFF2?)$/, "");
    const family = base.replace(/[-_]+/g, " ").trim() || "Custom Font";

    const url = URL.createObjectURL(file);

    // Use the FontFace API to load and register
    const font = new FontFace(family, `url(${url})`, { style: "normal", weight: "400" });
    const loaded = await font.load();
    (document as any).fonts.add(loaded); // document.fonts is a FontFaceSet

    // Optionally: Ensure the browser is ready to render this font at a reasonable size
    try {
        await (document as any).fonts.load(`16px "${family}"`);
    } catch {
        // non-fatal; some browsers may not reject properly
    }

    return { family, url };
}
