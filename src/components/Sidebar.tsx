// src/components/Sidebar.tsx
import React from 'react';
import Toolbar from './Toolbar';
import LayerPanel from './LayerPanelComponent';

const Sidebar: React.FC = () => {
    return (
        <div className="w-1/4 p-4 bg-white shadow-md flex flex-col min-h-screen">
            <h1 className="text-2xl font-bold mb-4">Image Editor</h1>
            <Toolbar />
            <div className="mt-4 flex-grow overflow-y-auto">
                <LayerPanel />
            </div>
        </div>
    );
};

export default Sidebar;