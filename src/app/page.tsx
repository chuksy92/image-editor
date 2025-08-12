"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { getFontFamilies } from "@/lib/fonts";

const EditorApp = dynamic(() => import("@/components/EditorApp"), {
    ssr: false,
    // Optional: show something if the editor itself is still loading
    loading: () => (
        <div className="flex min-h-screen items-center justify-center">
            <div className="rounded-xl border bg-white px-6 py-4 shadow">Loading editor…</div>
        </div>
    ),
});

async function loadWebFontsWithTimeout(timeoutMs = 5000): Promise<void> {
    try {
        const WebFont = (await import("webfontloader")).default;

        // Wrap WebFont.load in a Promise so we can await it
        const loadPromise = new Promise<void>((resolve) => {
            WebFont.load({
                google: { families: getFontFamilies() },
                active: () => resolve(),
                inactive: () => resolve(), // resolve even if fonts fail (don’t block the app)
            });
        });

        // Timeout guard so we don’t hang forever
        const timeout = new Promise<void>((resolve) => {
            const id = setTimeout(() => {
                clearTimeout(id);
                resolve();
            }, timeoutMs);
        });

        await Promise.race([loadPromise, timeout]);
    } catch {
        // If webfontloader fails to import, just continue
    }
}

export default function Home() {
    const [ready, setReady] = useState(false);
    const mounted = useRef(true);

    useEffect(() => {
        mounted.current = true;
        (async () => {
            await loadWebFontsWithTimeout(5000);
            if (mounted.current) setReady(true);
        })();
        return () => {
            mounted.current = false;
        };
    }, []);

    if (!ready) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="rounded-xl border  px-6 py-4 shadow">Loading editor…</div>
            </div>
        );
    }

    return <EditorApp />;
}
