import React from 'react';
import { useStore } from '@/hooks/useStore';

/**
 * Component for uploading the initial PNG image.
 */
const ImageUploadComponent = () => {
    const setImage = useStore((state) => state.setImage);
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type === 'image/png') {
            setImage(file);
        } else {
            console.error('Please upload a valid PNG image.');
        }
    };

    return (
        <div className="flex flex-col items-center justify-center p-12 border-4 border-dashed border-gray-300 rounded-2xl bg-gray-50 text-gray-500 hover:border-blue-400 hover:bg-blue-50 transition-all duration-300 ease-in-out cursor-pointer min-h-full">
            <h2 className="text-3xl font-bold mb-4 text-blue-600">Upload PNG</h2>
            <p className="text-lg">Click or drag an image here to begin.</p>
            <input
                type="file"
                accept="image/png"
                onChange={handleImageChange}
                className="w-full h-full absolute inset-0 opacity-0 cursor-pointer"
            />
        </div>
    );
};

export default ImageUploadComponent;