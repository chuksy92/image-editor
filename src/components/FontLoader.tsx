"use client";

import { useEffect } from 'react';
import { getFontFamilies } from '@/lib/fonts';

const FontLoader = () => {
    useEffect(() => {
        // Dynamically import webfontloader inside useEffect
        import('webfontloader')
            .then((WebFont) => {
                WebFont.load({
                    google: {
                        families: getFontFamilies(),
                    },
                    active: () => {
                        console.log('Fonts loaded successfully!');
                    },
                });
            })
            .catch((error) => {
                console.error('Failed to load WebFont:', error);
            });
    }, []);

    return null;
};

export default FontLoader;