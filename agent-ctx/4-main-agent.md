# Task 4: Implement Dark/Light Theme Toggle for the Authoring Tool editor

## Agent: Main Agent

## Summary
Implemented a complete dark/light theme toggle for the editor UI using CSS custom properties and Zustand store. The student-facing output (export/preview) remains unaffected.

## Files Created
- `src/store/theme-store.ts` — Zustand store with mode, toggleTheme(), setTheme(), localStorage persistence

## Files Modified
- `src/app/globals.css` — Added .theme-dark and .theme-light CSS custom property classes, light scrollbar override, theme-aware range/color inputs
- `src/components/authoring/AuthoringTool.tsx` — Theme wrapper, all hardcoded zinc classes replaced with CSS vars, theme toggle button at sidebar bottom
- `src/components/canva/CanvaBuilder.tsx` — Theme class wrapper + CSS var main container
- `src/components/canva/Toolbar.tsx` — Outer container bg, borders, text colors → CSS vars
- `src/components/canva/StatusBar.tsx` — Outer container bg, borders, text → CSS vars
- `src/components/canva/IconRail.tsx` — Outer container bg, borders, active states → CSS vars
- `src/components/canva/LeftPanel.tsx` — Outer container bg, borders, tab bar → CSS vars
- `src/components/canva/RightPanel.tsx` — Outer container bg, borders → CSS vars
- `src/components/canva/Stage.tsx` — Canvas area background → CSS var

## Key Design Decisions
1. **CSS variable wrapper approach** — Instead of replacing every zinc class, used `.theme-dark`/`.theme-light` wrapper classes with CSS custom properties. This avoids touching every nested element.
2. **Theme store with localStorage** — Theme preference persists across sessions.
3. **Only editor UI changes** — Student-facing content (LivePreview iframe, export HTML, Canva canvas elements) always renders on dark backgrounds regardless of theme.
4. **Canva: outer wrappers only** — Updated main container backgrounds and borders but not every nested element in LeftPanel/RightPanel panels.

## Verification
- ESLint: 0 errors on all modified files
- Dev server: running, compiled successfully
