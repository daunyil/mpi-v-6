# Bridge Fix: Preset → Canva-Store → Canva-Export → Renderers End-to-End

## Task ID: bridge-fix-bridge
## Agent: main-agent
## Date: 2025-06-04

## Summary

Fixed the end-to-end data flow from Preset → Authoring Store → Sync Bridge → Template Engine/Canvas Export → HTML. The audit said "Bridge 20% functional" and "End-to-end Flow 10%". After analysis, the main issues were:

1. **Diskusi modules not detected** in template pipeline's content analysis
2. **Diskusi screen never received module HTML** (missing handler in exportWithTemplateSystem)
3. **Quiz buttons in Alpine slideshow were non-functional** — detected but no action taken
4. **No pre-export validation** existed

## Files Modified

1. **`src/lib/template-engine/auto-build.ts`**
   - Added `hasDiskusiInModules` check in `analyzeContent()` (line 144)
   - Updated `hasDiskusi` to combine ATP and module detection (line 160)
   - Updated diskusi screen creation to use module data when available (lines 299-333)
   - Added `s-diskusi` handler in `exportWithTemplateSystem()` (lines 531-534)

2. **`src/lib/export/alpine-slideshow.ts`**
   - Rewrote `answerQuiz()` to accept `choice` (number|boolean) instead of `(slideIdx, choiceIdx, correctIdx)` (lines 250-298)
   - Added visual feedback (green/red highlighting) on quiz answer buttons
   - Rewrote `handleBtn()` to dispatch quiz option clicks to `answerQuiz()` (lines 301-328)
   - "Opsi A/B/C/D" buttons now map to correct index and call answerQuiz
   - "Benar"/"Salah" buttons now call answerQuiz with boolean values

3. **`src/lib/template-engine/bridge.ts`**
   - Fixed diskusi module HTML to avoid duplication: only render 2nd+ modules in extraScreenHtml since the first module's data is already used by the template (lines 380-388)

4. **`src/lib/template-engine/screen-templates.ts`**
   - Added `modulesHtml` slot to diskusi-timer template (line 228)
   - Template now renders `modulesHtml` after the main discussion card (line 257)

5. **`src/lib/sync-bridge.ts`**
   - Added `ValidationResult` interface (lines 332-336)
   - Added `validateExportData()` function (lines 338-460) that checks:
     - Meta fields (judulPertemuan, mapel, kelas)
     - CP fields (elemen, capaianFase)
     - TP items (verb, desc)
     - Kuis items (q, opts count, ans range)
     - Materi blocks (tipe required)
     - Modules (type required, title recommended)
     - Games (type required)
     - Alur items (fase, judul)
     - Skenario items (title, choices)
     - Canvas pages (kuis elements with dataIdx)
     - Cross-store consistency
     - Empty content detection

## Data Flow Verification

### Template Pipeline (Authoring → Export HTML) ✅
1. `getAuthoringExportData()` correctly reads all 10 fields from authoring store
2. `exportProject()` correctly builds `AutoBuildData` with type cast for `materi.blok`
3. `autoBuildScreens()` correctly detects content and builds screens
4. `exportWithTemplateSystem()` correctly fills screen HTML slots
5. All field mappings verified: meta, cp, tp, atp, alur, skenario, kuis, materi, modules, games

### Canvas Pipeline (Canva Store → Alpine Slideshow) ✅
1. `canva-store.ts` correctly calls `exportSlideshowHTMLExport()` with pages and ratio
2. `alpine-slideshow.ts` renders all element types correctly
3. Quiz elements with `correctIdx`/`correctBS` are properly handled in Alpine data
4. Quiz buttons now actually trigger answer submission with visual feedback

### Known Limitations
- The `games[]` array in authoring store is always empty (presets put game content in `modules[]` instead). This is by design — game-type modules are rendered through the modules pipeline.
- The 'kuis' element type in canvas is just a visual placeholder; actual quiz functionality uses text+button elements
- The `s-games` screen is never created by `autoBuildScreens()`, making the `gamesHtml` code path dead (but harmless)

## No Type Errors
All changes pass `tsc --noEmit` with zero new errors in the modified files.
