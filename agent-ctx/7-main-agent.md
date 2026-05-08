# Task 7 — Split canva-store.ts export logic

## Summary
Successfully extracted ~490 lines of HTML export rendering logic from `canva-store.ts` into a new `canva-export.ts` file.

## Files Created
- `/home/z/my-project/src/store/canva-export.ts` (503 lines)
  - Exports: `MODUL_TYPE_COLOR_MAP`, `renderElHTML`, `ExportPageOptions`, `exportPageHTML`, `ExportSlideshowOptions`, `exportSlideshowHTML`
  - Contains `parseTimerSeconds` helper (moved from canva-store.ts)

## Files Modified
- `/home/z/my-project/src/store/canva-store.ts` (1474 → 1002 lines, 32% reduction)
  - Added import of extracted functions
  - Removed `parseTimerSeconds` (now in canva-export.ts)
  - Replaced `_renderElHTML`, `exportPageHTML`, `exportSlideshowHTML` with thin wrappers delegating to canva-export.ts

## Verification
- TypeScript: 0 errors in src/
- Dev server: compiled successfully
- All external consumers (Toolbar.tsx, LivePreview.tsx) unaffected — they call store methods which now delegate
