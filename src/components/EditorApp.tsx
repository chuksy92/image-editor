// import React, {useEffect} from "react";
// import { useStore } from "@/hooks/useStore";
// import CanvasComponent from "./canvas/CanvasComponent";
// import ImageUpload from "./upload/ImageUpload";
// import LayerPanel from "./panels/LayerPanel";
// import PropertiesPanel from "./panels/PropertiesPanel";
// import TopBar from "./panels/TopBar";
//
// const EditorApp = () => {
//     const { image, canvasDimensions } = useStore();
//
//     useEffect(() => {
//         const { customFonts } = useStore.getState();
//         return () => {
//             customFonts.forEach(f => URL.revokeObjectURL(f.url));
//         };
//     }, []);
//
//     return (
//         <div className="min-h-screen">
//             <TopBar />
//             <div className={`${image ? "hidden" : "m-3 text-xl font-extrabold text-center gradient-text"}`}>
//                 Upload your image — edit, move, and style text effortlessly.
//             </div>
//             <div className="mx-auto flex max-w-7xl gap-4 p-4">
//                 {/* Left: layers */}
//                 <aside className="hidden w-64 shrink-0 lg:block">
//                     <LayerPanel />
//                 </aside>
//
//                 {/* Center: canvas or uploader */}
//                 <main className="flex min-h-[70vh] flex-1 items-start justify-center">
//                     {image ? (
//                         <div
//                             className="overflow-auto rounded-xl border-2 border-gray-200 bg-white p-2 shadow"
//                             style={{ maxWidth: "100%", maxHeight: "calc(100vh - 180px)" }}
//                         >
//                             <div
//                                 className="inline-block rounded"
//                                 style={{
//                                     width: canvasDimensions.width,
//                                     height: canvasDimensions.height
//                                 }}
//                             >
//                                 <CanvasComponent />
//                             </div>
//                         </div>
//                     ) : (
//                         <ImageUpload />
//                     )}
//                 </main>
//
//                 {/* Right: properties */}
//                 <aside className="hidden w-80 shrink-0 xl:block">
//                     <PropertiesPanel />
//                 </aside>
//             </div>
//         </div>
//     );
// };
//
// export default EditorApp;

import React, { useEffect } from "react";
import { useStore } from "@/hooks/useStore";
import CanvasComponent from "./canvas/CanvasComponent";
import LayerPanel from "./panels/LayerPanel";
import StylePanel from "./panels/StylePanel";
import PropertiesPanel from "./panels/PropertiesPanel";
import TopBar from "./panels/TopBar";
import ImageUpload from "@/components/upload/ImageUpload";

const EditorApp: React.FC = () => {
    const { image, canvasDimensions } = useStore();

    // Optional: revoke uploaded font URLs on unmount (nice memory hygiene)
    useEffect(() => {
        return () => {
            const { customFonts } = useStore.getState();
            customFonts.forEach((f) => URL.revokeObjectURL(f.url));
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col">
            {/* Top bar */}
            <div className="sticky top-0 z-30 backdrop-blur border-b border-gray-600">
                <TopBar />
            </div>

            {/* Main content grid */}
            <div className="mx-auto w-full max-w-7xl flex-1 grid grid-cols-12 gap-4 p-4">

                {/* Left sidebar */}
                <aside className="hidden lg:block col-span-3">
                    <div className="sticky top-20 space-y-4">
                        <div className="rounded-xl border bg-white shadow-sm p-4">
                            <LayerPanel />
                        </div>

                        <div className="rounded-xl border bg-white shadow-inner p-4">
                            <h2 className="text-sm font-semibold text-slate-700 mb-3">Typography</h2>
                            <StylePanel />
                        </div>
                    </div>
                </aside>

                {/* Center (canvas / upload) */}
                <main className="col-span-12 lg:col-span-6 flex items-center justify-center">
                    {image ? (
                        <div
                            className="rounded-xl border bg-white shadow-xl overflow-hidden"
                            style={{ width: canvasDimensions.width, height: canvasDimensions.height }}
                        >
                            <CanvasComponent />
                        </div>
                    ) : (
                        <div className="w-full">
                            {/* Headline */}
                            <div className="mb-6 text-center">
                                <div className="m-3 text-2xl font-extrabold gradient-text">
                                    Upload your image — edit, move, and style text effortlessly.
                                </div>
                                <p className="text-sm text-slate-500">
                                    PNG only. Canvas will match your image’s aspect ratio automatically.
                                </p>
                            </div>

                            {/* Upload card */}
                            <div className="mx-auto max-w-xl rounded-2xl border bg-white shadow-sm p-6">
                                <ImageUpload />
                                <div className="mt-3 text-center text-slate-500">
                                    Drag &amp; drop or click to upload a PNG
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                {/* Right sidebar */}
                <aside className="hidden xl:block col-span-3">
                    <div className="sticky top-20">
                        <div className="rounded-xl border bg-white shadow-sm p-4">
                            <h2 className="text-sm font-semibold text-slate-700 mb-3">Properties</h2>
                            <PropertiesPanel />
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default EditorApp;


