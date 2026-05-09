# Priority 5 & 6: Missing Renderers + Game Populator

## Task
Add proper HTML renderers for FlipCard Deck, Diskusi, Callout, Fill-in-the-Blank, and implement Game Populator for memory, matching, roda, sorting, truefalse games.

## Files Created

### 1. `src/lib/template-engine/module-renderers.ts`
- **renderFlipcard()** — Horizontal scrollable deck of flip cards with CSS rotateY transform, click-to-flip, progress indicator
- **renderDiskusi()** — Discussion card with question prompt, optional timer, textarea for answer, "Simpan Jawaban" button
- **renderCallout()** — Colored callout box with left border, variant-based icon/color (info/warning/success/danger)
- **renderFillblank()** — Fill-in-the-blank exercise with [___] placeholders replaced by input fields with "Cek" button and ✓/✗ feedback
- **hasModuleRenderer()** — Checks both module and game renderers
- **renderModule()** — Dispatches to correct renderer, also delegates to game-populator for game types

### 2. `src/lib/export/game-populator.ts`
- **Memory Match** — Grid of face-down cards, flip two at a time to find matching pairs, tracks score and moves
- **Matching Game** — Two-column layout (left terms, right definitions), click one from each to match
- **Roda Putar** — SVG-based spin wheel with colorful slices, spin animation, random selection
- **Sorting Game** — Item pool + category buckets, click to select item then click bucket to sort
- **True/False Quiz** — Card-based quiz with Benar/Salah buttons, score tracking, auto-advance
- **populateGames()** — Returns Map of gameId → HTML string
- **buildAllGamesHtml()** — Convenience function for backwards compat

### 3. Updated `src/lib/template-engine/bridge.ts`
- Imports `renderModule` from module-renderers
- Imports `buildAllGamesHtml` from game-populator
- `buildModulesHtml()` default case now uses `renderModule()` for types with dedicated renderers
- `buildGamesHtml()` now delegates to `buildAllGamesHtml()`
- `buildExtraScreenHtml()` now includes flipcard type in flashcardMods filter and adds diskusiMods

### 4. Updated `src/lib/template-engine/index.ts`
- Added exports for module renderers and game populator functions

## Architecture Decisions
- All renderers produce **inline HTML** with inline CSS/JS — no external dependencies needed
- Game types appearing in `modules[]` array are handled by delegating to game-populator via `renderModule()`
- Each game generates unique IDs via `Math.random()` to support multiple instances on the same page
- Flipcard renderer supports both `cards` (spec) and `kartu` (authoring store) keys for compatibility

## Verification
- TypeScript compilation: No errors in changed files
- Dev server starts successfully and serves pages
- No runtime compilation errors
