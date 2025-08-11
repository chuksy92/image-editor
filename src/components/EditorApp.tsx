import React from "react";
import { useStore } from "@/hooks/useStore";
import CanvasComponent from "./canvas/CanvasComponent";
import ImageUpload from "./upload/ImageUpload";
import LayerPanel from "./panels/LayerPanel";
import PropertiesPanel from "./panels/PropertiesPanel";
import TopBar from "./panels/TopBar";

const EditorApp = () => {
    const { image, canvasDimensions } = useStore();

    return (
        <div className="min-h-screen">
            <TopBar />
            <div className="mx-auto flex max-w-7xl gap-4 p-4">
                {/* Left: layers */}
                <aside className="hidden w-64 shrink-0 lg:block">
                    <LayerPanel />
                </aside>

                {/* Center: canvas or uploader */}
                <main className="flex min-h-[70vh] flex-1 items-start justify-center">
                    {image ? (
                        <div
                            className="overflow-auto rounded-xl border-2 border-gray-200 bg-white p-2 shadow"
                            style={{ maxWidth: "100%", maxHeight: "calc(100vh - 180px)" }}
                        >
                            <div
                                className="inline-block rounded"
                                style={{
                                    width: canvasDimensions.width,
                                    height: canvasDimensions.height
                                }}
                            >
                                <CanvasComponent />
                            </div>
                        </div>
                    ) : (
                        <ImageUpload />
                    )}
                </main>

                {/* Right: properties */}
                <aside className="hidden w-80 shrink-0 xl:block">
                    <PropertiesPanel />
                </aside>
            </div>
        </div>
    );
};

export default EditorApp;
