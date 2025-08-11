'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { getFontFamilies } from '@/lib/fonts';
// import 'webfontloader';

// Dynamically import the EditorApp component with SSR disabled.
// This prevents Next.js from trying to render the Konva-related
// modules on the server, which causes the 'canvas' module not found error.
const EditorApp = dynamic(() => import('@/components/EditorApp'), { ssr: false });

// This is the main page component that handles the app's initialization
// and ensures it only runs on the client-side.
export default function Home() {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Dynamically import webfontloader on the client side to avoid SSR errors.
        const loadFonts = async () => {

            const WebFont = (await import('webfontloader')).default;
            if (WebFont) {
                WebFont.load({
                    google: { families: getFontFamilies() },
                    active: () => console.log('Fonts loaded successfully!'),
                });
            }
        };

        setIsClient(true);
        loadFonts();
    }, []);

    if (!isClient) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-slate-50 text-slate-900">
                <div className="text-xl font-bold">Loading Editor...</div>
            </div>
        );
    }

    return <EditorApp />;
}
