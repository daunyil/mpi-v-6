# Task 5, 6 — Multi-select Elements and Element Locking

## Task ID: 5, 6
## Agent: Main Agent

## Summary
Implemented multi-select elements (Shift+click, Ctrl+A, batch operations) and element locking (user-toggled position lock) in Canva mode.

## Key Changes

### types.ts
- Added `locked?: boolean` to CanvaElement interface

### canva-store.ts
- Changed `selectedElId: string | null` → `selectedElIds: string[]`
- Added `_sel()` helper for backward compat with `selectedElId`
- New actions: `selectElement(id, multi?)`, `deselectAll()`, `selectAllElements()`, `isElementSelected()`, `deleteSelectedElements()`, `moveSelectedElements()`, `toggleElementLock()`
- Updated `nudgeSelected()` to delegate to `moveSelectedElements()`
- All 28+ references to `selectedElId` updated

### Stage.tsx
- Shift+click multi-select, amber ring on all selected, resize handles only on primary
- Locked elements: orange ring, no drag/resize, cursor-not-allowed, 🔒 icon
- Multi-select badge "☑️ N selected"

### CanvaBuilder.tsx
- Delete/Backspace: delete ALL selected, Arrow keys: nudge ALL, Escape: deselectAll, Ctrl+A: selectAll

### Toolbar.tsx
- Multi-delete button with count badge when multiple selected

### RightPanel.tsx
- MultiSelectPanel: batch color, lock toggle, delete all, deselect all
- Lock toggle on single element panels with disabled position inputs when locked

### LeftPanel.tsx
- Lock/unlock buttons per layer row, dimmed locked elements, shift+click multi-select

## Files Modified
- src/components/canva/types.ts
- src/store/canva-store.ts
- src/components/canva/Stage.tsx
- src/components/canva/CanvaBuilder.tsx
- src/components/canva/Toolbar.tsx
- src/components/canva/RightPanel.tsx
- src/components/canva/LeftPanel.tsx
