// ═══════════════════════════════════════════════════════════════
// TEMPLATE ENGINE — Unified export for the Level 2 Template System
// ═══════════════════════════════════════════════════════════════

// Types
export type { ScreenTemplate, SlotDefinition, SlotType, RenderContext, AutoBuildData, BuiltScreen, ExportConfig, ThemeConfig } from './template-types';
export { DEFAULT_THEME } from './template-types';

// Base Engine
export { generateBaseCSS, generateBaseJS, generateHead, generateSkenarioJS, generateFungsiJS, generateKuisJS } from './base-engine';

// Screen Templates
export { SCREEN_TEMPLATES, ALL_TEMPLATES, TEMPLATE_CATEGORIES, getTemplate, renderTemplate } from './screen-templates';

// Auto-Build
export { autoBuildScreens, exportWithTemplateSystem } from './auto-build';

// Bridge — unified data pipeline
export { exportProject, buildModulesHtml, buildMateriHtml, buildGamesHtml, buildFungsiHtml, buildExtraScreenHtml } from './bridge';
export type { AuthoringExportData } from './bridge';

// Module renderers
export { renderModule, renderFlipcard, renderDiskusi, renderCallout, renderFillblank, renderHero, renderKutipan, renderStatistik, renderLangkah, renderAccordion, hasModuleRenderer } from './module-renderers';

// Game populator
export { populateGames, buildAllGamesHtml, hasGameRenderer } from './game-populator';
