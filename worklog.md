# Worklog: Priority 1 — Unify & Simplify the Export Pipeline

## Date: 2025-01-XX

## Summary

Executed 6 tasks to unify and simplify the export pipeline in MPI-v-6.

---

### Task 1: Move game-populator.ts to template-engine/

- **Moved** `src/lib/export/game-populator.ts` → `src/lib/template-engine/game-populator.ts`
- **Updated imports** in 3 files:
  - `bridge.ts` line 20: `'@/lib/export/game-populator'` → `'./game-populator'`
  - `module-renderers.ts` line 11: `'@/lib/export/game-populator'` → `'./game-populator'`
  - `index.ts` line 26: `'@/lib/export/game-populator'` → `'./game-populator'`
- **Deleted** old file at `src/lib/export/game-populator.ts`
- **Rationale**: `game-populator` is only used by the template pipeline, so it belongs in `template-engine/`.

### Task 2: Create src/lib/export/index.ts barrel export

- **Created** new barrel file at `src/lib/export/index.ts`
- Exports:
  - `ALPINE_CODE`, `ALPINE_INLINE` from `alpine-runtime`
  - `renderElHTML`, `exportSlideshowHTML`, `exportPageHTML` (value exports) from `alpine-slideshow`
  - `ExportSlideshowOptions`, `ExportPageOptions` (type exports) from `alpine-slideshow`
  - `generatePrintAdminHtml` from `admin-print`
- **Note**: Does NOT re-export `MODUL_TYPE_COLOR_MAP` (removed in Task 4)

### Task 3: Fix sync-bridge.ts hybrid mode

- **Replaced** the broken `unifiedExport()` hybrid mode
- Old behavior: hybrid mode generated template HTML then discarded canvas content without merging
- New behavior: hybrid mode uses template pipeline as primary output (the richer interactive experience), with clear comments explaining that canvas pages are available for separate canvas-mode export
- This is the safe/clean approach — DOM merging between two fundamentally different HTML structures would be fragile

### Task 4: Clean up redundant code

1. **Removed** `export const MODUL_TYPE_COLOR_MAP = MODUL_TYPE_MAP;` from `alpine-slideshow.ts` (line 22)
   - Never imported anywhere — confirmed via grep
   - Kept `import { MODUL_TYPE_MAP }` since it's used on line 103

2. **Renamed** `_fungsiHtml` hack → `fungsiHtml` (proper key name):
   - `bridge.ts`: Changed `_fungsiHtml: fungsiHtml` → `fungsiHtml: fungsiHtml`
   - `auto-build.ts`: Changed `extraScreenHtml['_fungsiHtml']` → `extraScreenHtml['fungsiHtml']`
   - Removes the underscore-prefixed hack pattern (reserved key convention violation)

### Task 5: Fix TS error in shared/index.ts

- **Fixed** line 10: `export { ExportData, ... }` → split into:
  - `export type { ExportData } from './types';`
  - `export { ALL_TEMPLATE_IDS, getAccentForPertemuan } from './types';`
- `ExportData` is an interface (type-only), so it must use `export type` to comply with `isolatedModules` / strict TS settings

### Task 6: Verify build

- Ran `npx tsc --noEmit` — **zero errors** in `src/lib/`, `src/store/`, `src/components/canva/`, `src/components/authoring/`
- Pre-existing errors in `src/components/ui/` (missing Radix packages) and `examples/` are unrelated
- `bun run lint` has a pre-existing Next.js 16 deprecation issue (not related to our changes)

---

## Files Modified

| File | Change |
|------|--------|
| `src/lib/template-engine/game-populator.ts` | NEW (copied from export/) |
| `src/lib/export/game-populator.ts` | DELETED |
| `src/lib/template-engine/bridge.ts` | Updated import path + `_fungsiHtml` → `fungsiHtml` |
| `src/lib/template-engine/module-renderers.ts` | Updated import path |
| `src/lib/template-engine/index.ts` | Updated import path |
| `src/lib/template-engine/auto-build.ts` | `_fungsiHtml` → `fungsiHtml` |
| `src/lib/export/index.ts` | NEW barrel export |
| `src/lib/export/alpine-slideshow.ts` | Removed `MODUL_TYPE_COLOR_MAP` re-export |
| `src/lib/sync-bridge.ts` | Fixed hybrid mode in `unifiedExport()` |
| `src/lib/shared/index.ts` | Fixed `export type` for `ExportData` |
