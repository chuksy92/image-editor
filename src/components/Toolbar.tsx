// src/components/Toolbar.tsx
import React from 'react';
import { useStore } from '@/hooks/useStore';

const Toolbar: React.FC = () => {
    const { selectedLayer, updateTextLayer, addTextLayer } = useStore();

    const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        if (selectedLayer) {
            updateTextLayer({ ...selectedLayer, text: e.target.value });
        }
    };

    const handlePropertyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (selectedLayer) {
            const { name, value } = e.target;
            updateTextLayer({ ...selectedLayer, [name]: value });
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <button
                onClick={addTextLayer}
                className="bg-blue-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-600"
            >
                Add Text Layer
            </button>

            {selectedLayer && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                    <h3 className="text-lg font-bold mb-2">Edit Text Properties</h3>

                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium">Content:</label>
                        <textarea
                            value={selectedLayer.text}
                            onChange={handleTextChange}
                            rows={4}
                            className="p-2 border rounded-md"
                        />
                    </div>

                    <div className="flex flex-col gap-2 mt-4">
                        <label className="text-sm font-medium">Font Size:</label>
                        <input
                            type="number"
                            name="fontSize"
                            value={selectedLayer.fontSize}
                            onChange={handlePropertyChange}
                            className="p-2 border rounded-md"
                        />
                    </div>

                    {/* Add more inputs for font family, color, etc. */}
                </div>
            )}
        </div>
    );
};

export default Toolbar;