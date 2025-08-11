import React from 'react';
import { useStore } from '@/hooks/useStore';
import CanvasComponent from './CanvasComponent';
import ImageUploadComponent from './ImageUploadComponent';
import LayerPanelComponent from './LayerPanelComponent';

/**
 * Main application component that orchestrates the layout of all sub-components.
 * It displays the canvas and layer panel. The toolbar has been removed.
 */
const EditorApp = () => {
    const { image, canvasDimensions } = useStore();

    return (
        <div className="flex flex-col md:flex-row w-full max-w-7xl mx-auto p-4 md:p-8 space-y-4 md:space-y-0 md:space-x-8 rounded-xl bg-gray-100 shadow-xl min-h-screen">
            <aside className="w-full md:w-1/4 p-4 space-y-6 flex flex-col">
                <h1 className="text-3xl font-extrabold text-blue-600 mb-6">Gemini Editor</h1>
                {/* The toolbar component is no longer rendered here */}
                <LayerPanelComponent />
            </aside>

            <main className="flex-1 flex flex-col items-center justify-center p-4">
                {image ? (
                    <div
                        className="rounded-lg shadow-xl overflow-hidden border-2 border-gray-200"
                        style={{
                            width: canvasDimensions.width,
                            height: canvasDimensions.height,
                        }}
                    >
                        <CanvasComponent />
                    </div>
                ) : (
                    <ImageUploadComponent />
                )}
            </main>
        </div>
    );
};

export default EditorApp;
