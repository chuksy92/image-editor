## Image Text Editor (NextJs + Konva)

Edit text layers on top of an uploaded PNG and export a final image at original dimensions. Built with React, react-konva/Konva, and Zustand.

## Requirements

- Node.js ≥ 18, npm/yarn/pnpm
- Next.js app (client components where Konva touches the DOM)


## Getting Started

First, run the development server:

```bash
# install
npm install

# dev
npm run dev  # http://localhost:3000

# build & run prod
npm run build
npm start
```
Global CSS
```
.konva-cursor-default { cursor: default; }
.konva-cursor-grab    { cursor: grab; }
.konva-cursor-grabbing{ cursor: grabbing; }
```
## What It Does (Core)

- Background image: Upload a PNG; the canvas (Konva Stage) locks to the image’s bitmap size. Export preserves original dimensions.

- Text layers: Add multiple layers; edit font family, size, style, color, opacity, alignment; multi-line rendering within a box.

- Transforms: Click-and-hold to drag; resize with handles; rotate.

- Layer management: Select, duplicate, reorder (API available; minimal UI stub provided).

- Keyboard: Delete/Backspace to remove; ⌘/Ctrl+D duplicate; arrows nudge (Shift = 10px).

- Undo/Redo: Bounded history (≥20 snapshots).

- Autosave: Full editor state persisted to localStorage; auto-restored on refresh.

- Reset: wipes persisted state and returns to blank editor.

- Export: PNG with text overlay at original image dimensions.

## State model (useStore)

- imageObject, canvasDimensions → Stage sizing

- layers: TextLayer[] with:
id, x, y, text, fontSize, fontFamily, fill, rotation, width, height, fontStyle, align, opacity, locked, lineHeight, letterSpacing

- Live vs commit updates:

- updateTextLayerLive (no history) on onDragMove for smooth drags

- updateTextLayer (with history) on onDragEnd/transform end and inspector edits

- History ring with MAX_HISTORY = 20, persisted via zustand/persist

## Technology Choices & Trade-offs

- React + Konva (react-konva)

- ✅ Retained-mode canvas, hit-testing, drag/transform, transformer anchors

- ⚠️ Client-only; Next.js components must include "use client"

- Zustand (+ persist, + subscribeWithSelector)

- ✅ Minimal boilerplate, easy snapshot-style history

- ⚠️ Snapshot history is coarse; memory grows with MAX_HISTORY

- LocalStorage persistence

- ✅ Offline and instant resume

- ⚠️ Stores images as data URLs; very large images can hit browser storage limits

- Live/Commit split for drag

- ✅ Eliminates “snap-back” from controlled/uncontrolled conflicts



## Bonus Points — Implemented

- ✅ Duplicate layers (with visible offset)

- ✅ Lock / unlock layers (locked: boolean → disables dragging, transforms, and pointer events)

- ✅ Line-height & letter-spacing (mapped to Konva Text props; inspector controls)

- ✅ Undo/Redo (≥20)

- ✅ Autosave to localStorage

- ✅ Keyboard nudging & shortcuts

- ✅ Export PNG at original dimensions

## Troubleshooting

- Drag doesn’t move
Ensure TextLayerNode is a Client Component, Group is draggable, and onDragMove calls updateTextLayerLive.

- Snaps back while dragging
Confirm live updates on onDragMove (no history) and commit on onDragEnd (with history).

- Cursor not changing
Verify global cursor CSS is loaded and no parent is listening={false}.

- Locked layers not selectable on canvas
Use the LayerList side panel to select/unlock (locked layers ignore pointer events by design).

## Deployed

- https://image-editor-kappa-three.vercel.app/
