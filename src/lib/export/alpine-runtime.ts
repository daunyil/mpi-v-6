// ═══════════════════════════════════════════════════════════════
// ALPINE.JS RUNTIME — For inline export HTML files
// ═══════════════════════════════════════════════════════════════
//
// Strategy: CDN first (fast, cached), inline fallback (offline).
// Alpine.js ~14.7KB minified. For offline guarantee, we inline
// the full minified Alpine into every export HTML.
//
// Source: https://github.com/alpinejs/alpine (MIT License)
// Version: 3.14.8
// ═══════════════════════════════════════════════════════════════

// Store Alpine.js runtime as a JSON-encoded string to avoid
// SWC/webpack parser issues with complex JS inside template literals.
import alpineRuntimeJson from './alpine-runtime.json';

/** The raw Alpine.js v3.14.8 minified code (without script tags) */
export const ALPINE_CODE: string = alpineRuntimeJson as string;

/** Alpine.js v3.14.8 minified — wrapped in <script> tag for inlining */
export const ALPINE_INLINE = `<script>${ALPINE_CODE}<\/script>`;
