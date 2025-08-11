// src/components/ImageEditor.tsx
import React from 'react';
import { useStore } from '@/hooks/useStore';
import CanvasComponent from './CanvasComponent';
import ImageUpload from './ImageUploadComponent';
import Toolbar from './Toolbar';
import LayerPanel from './LayerPanelComponent';

const ImageEditor: React.FC = () => {
    const { image } = useStore();

    return (
        <div className="flex min-h-screen bg-gray-100">
            {/* Sidebar for controls */}
            <div className="w-1/4 p-4 bg-white shadow-md flex flex-col">
                <h1 className="text-2xl font-bold mb-4">Image Editor</h1>
                {/* The toolbar for editing text properties */}
                <Toolbar />
                {/* The panel for reordering layers */}
                <div className="mt-4 flex-grow overflow-y-auto">
                    <LayerPanel />
                </div>
            </div>

            {/* Main editor canvas area */}
            <div className="flex-1 p-8 flex items-center justify-center">
                {image ? (
                    // Render the canvas if an image is uploaded
                    <CanvasComponent />
                ) : (
                    // Show the upload component if no image is present
                    <ImageUpload />
                )}
            </div>
        </div>
    );
};

export default ImageEditor;