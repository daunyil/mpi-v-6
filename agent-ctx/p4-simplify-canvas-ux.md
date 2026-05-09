# Priority 4: Simplify Canvas Panel UX — Work Record

## Summary
Simplified the canvas builder UX from 5 simultaneous panels to a cleaner, collapsible layout. The build passes successfully.

## Changes Made

### 1. CanvaBuilder.tsx
- Removed `IconRail` import and usage (its functionality is now in LeftPanel's tab bar)
- Added `leftCollapsed` state (default: `false`) and `rightCollapsed` state (default: `true`)
- Added `useEffect` to auto-expand RightPanel when elements are selected, auto-collapse when deselected
- Passed `isCollapsed` and `onToggleCollapse` props to both `LeftPanel` and `RightPanel`

### 2. LeftPanel.tsx
- Changed component signature to accept `{ isCollapsed, onToggleCollapse }` props
- **Collapsed mode**: Renders a thin 40px vertical strip with tab icons (same emojis as tab bar). Clicking an icon sets the tab AND expands the panel. An expand chevron button at the bottom also re-expands.
- **Expanded mode**: Same layout as before with tab bar + content, plus a collapse chevron button positioned on the right edge (overlapping the border with Stage).
- IconRail's content (pages, elems, ratio, layers tabs) was already fully represented in LeftPanel's tab bar, so no additional merge was needed — removing the separate IconRail column is the merge.

### 3. RightPanel.tsx
- Changed component signature to accept `{ isCollapsed, onToggleCollapse }` props
- **Collapsed mode**: Renders a thin 40px vertical strip with property/background/layer icons. Each icon expands the panel on click. An expand chevron at the bottom also re-expands.
- **Expanded mode**: Same layout as before, plus a collapse chevron button positioned on the left edge (overlapping the border with Stage).
- Auto-collapse/expand behavior managed by parent `CanvaBuilder` via `useEffect` on `selectedElIds`.

### 4. Toolbar.tsx
- Reorganized buttons into 4 logical groups separated by `Divider` components:
  1. **Navigation**: Undo, Redo
  2. **Page actions**: Select tool, Text tool, Add page, Duplicate page, Delete page
  3. **View**: Ratio badge, Zoom controls (−/+/percent)
  4. **Export/Preview**: Live Preview, Preview, Export HTML, Export Slideshow, Clear
- Added a `Divider` helper component for consistent visual separators
- Multi-select badge still appears conditionally
- Keyboard hints simplified (removed Ctrl+A to reduce clutter)

### 5. StatusBar.tsx
- Made more compact: reduced font size to `text-[10px]`, reduced padding to `py-0.5`
- Left side: page info (📄 1/3) and element count (🧩 5)
- Center: mouse position (x:0 y:0)
- Right side: zoom percentage
- Removed ratio dimensions display (already shown in Toolbar ratio badge)

## Build Status
- `next build` passes successfully
- Pre-existing TS error in LeftPanel.tsx line 657 (unrelated to our changes, in TemplatesContent's BUILTIN_TEMPLATES config typing)
