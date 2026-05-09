// ═══════════════════════════════════════════════════════════════
// BRIDGE — Unified data pipeline: authoring-store → template engine
// ═══════════════════════════════════════════════════════════════
//
// This module is the SINGLE entry point for exporting a project.
// It reads authoring store data (passed explicitly — no require()),
// builds all HTML segments (modules, materi, games, fungsi), and
// feeds them into the template engine's exportWithTemplateSystem().
//
// Consumers (ImportExport, LivePreview, future server-side export)
// should call exportProject() — nothing else.
// ═══════════════════════════════════════════════════════════════

import type { AutoBuildData } from './template-types';
import type { ExportData } from '@/lib/shared/types';
import { exportWithTemplateSystem } from './auto-build';
import { getModuleTypeInfo } from '@/lib/shared/module-types';
import { FUNGSI_NORMA, esc } from '@/lib/shared/constants';
import { renderModule } from './module-renderers';
import { buildAllGamesHtml } from '@/lib/export/game-populator';

// ── Unified type — re-export for backward compat ───────────
// AuthoringExportData is now an alias for the unified ExportData type
// defined in @/lib/shared/types. This eliminates 3x type duplication
// (ExportState in old export-html.ts, AuthoringExportData here,
// and ExportData in shared/types.ts).
export type AuthoringExportData = ExportData;

// ═══════════════════════════════════════════════════════════════
// 1. MODULE HTML BUILDER
// Iterates modules[], uses MODUL_TYPE_MAP for icon/color/label,
// renders a card for each module. (Placeholder — flesh out in P5)
// ═══════════════════════════════════════════════════════════════
export function buildModulesHtml(modules: AutoBuildData['modules']): string {
  if (!modules || modules.length === 0) return '';

  return modules.map((mod, i) => {
    const type = String(mod.type || '');
    const info = getModuleTypeInfo(type);
    const title = String(mod.title || info.label || `Modul ${i + 1}`);

    // Module header card with type info
    let body = '';

    // Simple type-specific rendering for common types
    switch (type) {
      case 'hero': {
        const subjudul = String(mod.subjudul || '');
        const ikon = String(mod.ikon || info.icon);
        body = `<div class="hero-banner" style="background:linear-gradient(135deg,${info.color}33,${info.color}11)">
          <div class="hero-glow"></div>
          <div class="hero-icon">${ikon}</div>
          <div class="hero-title">${esc(title)}</div>
          ${subjudul ? `<div class="hero-sub">${esc(subjudul)}</div>` : ''}
        </div>`;
        break;
      }
      case 'kutipan': {
        const teks = String(mod.teks || '');
        const sumber = String(mod.sumber || '');
        const jabatan = String(mod.jabatan || '');
        const warna = String(mod.warna || info.color);
        body = `<div class="card" style="border-left:4px solid ${warna};background:${warna}0a">
          <div style="font-size:2rem;margin-bottom:8px;opacity:.7">❝</div>
          <div style="font-size:1rem;font-style:italic;line-height:1.7;margin-bottom:12px">${esc(teks)}</div>
          ${sumber ? `<div style="font-weight:800;color:${warna};font-size:.85rem">— ${esc(sumber)}${jabatan ? ', ' + esc(jabatan) : ''}</div>` : ''}
        </div>`;
        break;
      }
      case 'statistik': {
        const items = (mod.items as Array<{ icon?: string; angka?: string; satuan?: string; label?: string; warna?: string; judul?: string; isi?: string }>) || [];
        if (items.length > 0) {
          body = `<div class="card"><div class="h2">${info.icon} <span class="hl">${esc(title)}</span></div>
            <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:10px;margin-top:14px">
              ${items.map(it => `<div style="text-align:center;padding:14px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:12px">
                <div style="font-size:1.4rem;margin-bottom:4px">${esc(it.icon || '📊')}</div>
                <div style="font-family:'Fredoka One',cursive;font-size:1.5rem;color:${esc(it.warna || info.color)}">${esc(it.angka || '0')}</div>
                <div style="font-size:.7rem;font-weight:800;color:var(--muted)">${esc(it.satuan || '')}</div>
                <div style="font-size:.78rem;font-weight:700;margin-top:4px">${esc(it.label || it.judul || '')}</div>
              </div>`).join('')}
            </div>
          </div>`;
        }
        break;
      }
      case 'langkah': {
        const langkah = (mod.langkah as Array<{ icon: string; judul: string; isi: string }>) || [];
        if (langkah.length > 0) {
          body = `<div class="card"><div class="h2">${info.icon} <span class="hl">${esc(title)}</span></div>
            <div style="margin-top:14px">
              ${langkah.map((s, si) => `<div style="display:flex;gap:12px;padding:10px 0;${si < langkah.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
                <div style="width:32px;height:32px;border-radius:50%;background:${info.color}22;color:${info.color};display:flex;align-items:center;justify-content:center;font-size:.8rem;font-weight:900;flex-shrink:0">${si + 1}</div>
                <div>
                  <div style="font-weight:800;font-size:.88rem">${esc(s.icon)} ${esc(s.judul)}</div>
                  <div style="font-size:.82rem;color:var(--muted);line-height:1.6;margin-top:2px">${esc(s.isi)}</div>
                </div>
              </div>`).join('')}
            </div>
          </div>`;
        }
        break;
      }
      case 'accordion': {
        const items = (mod.items as Array<{ judul?: string; isi?: string; icon?: string }>) || [];
        if (items.length > 0) {
          body = `<div class="card"><div class="h2">${info.icon} <span class="hl">${esc(title)}</span></div>
            <div style="margin-top:14px">
              ${items.map((it, si) => `<details style="border:1px solid var(--border);border-radius:10px;margin-bottom:8px;overflow:hidden">
                <summary style="padding:12px 14px;cursor:pointer;font-weight:800;font-size:.88rem;background:rgba(255,255,255,.03)">${esc(it.icon || '📌')} ${esc(it.judul || `Item ${si + 1}`)}</summary>
                <div style="padding:0 14px 14px;font-size:.84rem;color:var(--muted);line-height:1.7">${esc(it.isi || '')}</div>
              </details>`).join('')}
            </div>
          </div>`;
        }
        break;
      }
      default: {
        // Use dedicated module renderers for types that have them
        const rendered = renderModule(type, mod);
        if (rendered) {
          body = rendered;
        } else {
          // Generic placeholder card for all other module types
          body = `<div class="card" style="border-left:4px solid ${info.color};background:${info.color}0a">
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px">
              <span style="font-size:1.5rem">${info.icon}</span>
              <div>
                <div style="font-weight:900;font-size:.95rem;color:${info.color}">${esc(title)}</div>
                <div style="font-size:.72rem;color:var(--muted);font-weight:600">${esc(info.desc)}</div>
              </div>
            </div>
            <div style="font-size:.82rem;color:var(--muted);line-height:1.6">
              🚧 Modul <strong>${esc(info.label)}</strong> — konten akan tersedia di versi lengkap.
            </div>
          </div>`;
        }
        break;
      }
    }

    return body;
  }).join('\n');
}

// ═══════════════════════════════════════════════════════════════
// 2. MATERI HTML BUILDER
// Iterates materi.blok[], renders each block by tipe
// ═══════════════════════════════════════════════════════════════
export function buildMateriHtml(materi: ExportData['materi']): string {
  if (!materi?.blok || materi.blok.length === 0) return '';

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return materi.blok.map((blok: any) => {
    const tipe = String(blok.tipe || '');
    const judul = blok.judul || '';

    switch (tipe) {
      case 'teks':
        return `<div class="card mt14">
          ${judul ? `<div class="h2">${esc(judul)}</div>` : ''}
          <div style="font-size:.91rem;line-height:1.8;color:var(--muted)">${esc(blok.isi || '')}</div>
        </div>`;

      case 'definisi':
        return `<div class="card mt14">
          ${judul ? `<div class="h2">📖 <span class="hl">${esc(judul)}</span></div>` : ''}
          <div class="def-box">${esc(blok.isi || '')}</div>
        </div>`;

      case 'poin': {
        const butir = (blok.butir as string[]) || [];
        return `<div class="card mt14">
          ${judul ? `<div class="h2">📌 <span class="hl">${esc(judul)}</span></div>` : ''}
          <ul style="list-style:none;padding:0;margin-top:8px">
            ${butir.map(b => `<li style="display:flex;gap:8px;font-size:.86rem;line-height:1.7;margin-bottom:4px">
              <span style="color:var(--y);font-weight:900;flex-shrink:0">→</span>
              <span>${esc(b)}</span>
            </li>`).join('')}
          </ul>
        </div>`;
      }

      case 'tabel': {
        const baris = (blok.baris as string[][]) || [];
        if (baris.length === 0) return '';
        return `<div class="card mt14">
          ${judul ? `<div class="h2">📊 <span class="hl">${esc(judul)}</span></div>` : ''}
          <div style="overflow-x:auto;margin-top:10px">
            <table style="width:100%;border-collapse:collapse;font-size:.84rem">
              ${baris.map((row, ri) => `<tr>
                ${row.map(cell => `<td style="padding:8px 12px;border:1px solid var(--border);${ri === 0 ? 'background:rgba(255,255,255,.06);font-weight:800;color:var(--y)' : 'color:var(--muted)'}">${esc(cell)}</td>`).join('')}
              </tr>`).join('')}
            </table>
          </div>
        </div>`;
      }

      case 'kutipan':
        return `<div class="card mt14" style="border-left:4px solid var(--p);background:rgba(167,139,250,.05)">
          ${judul ? `<div style="font-weight:900;font-size:.9rem;color:var(--p);margin-bottom:8px">💬 ${esc(judul)}</div>` : ''}
          <div style="font-size:.92rem;font-style:italic;line-height:1.7">"${esc(blok.isi || '')}"</div>
        </div>`;

      case 'gambar':
        return `<div class="card mt14" style="text-align:center">
          ${judul ? `<div style="font-weight:900;font-size:.9rem;margin-bottom:10px">${esc(judul)}</div>` : ''}
          <div style="background:rgba(255,255,255,.04);border:1px dashed var(--border);border-radius:12px;padding:40px;color:var(--muted);font-size:.85rem">
            🖼️ Gambar: ${esc(blok.isi || 'Belum diunggah')}
          </div>
        </div>`;

      case 'timeline': {
        const langkah = (blok.langkah as Array<{ icon: string; judul: string; isi: string }>) || [];
        return `<div class="card mt14">
          ${judul ? `<div class="h2">📅 <span class="hl">${esc(judul)}</span></div>` : ''}
          <div style="margin-top:12px">
            ${langkah.map((s, i) => `<div style="display:flex;gap:12px;padding:10px 0;${i < langkah.length - 1 ? 'border-bottom:1px solid var(--border)' : ''}">
              <div style="width:30px;height:30px;border-radius:50%;background:var(--c)22;color:var(--c);display:flex;align-items:center;justify-content:center;font-size:.75rem;font-weight:900;flex-shrink:0">${i + 1}</div>
              <div>
                <div style="font-weight:800;font-size:.86rem">${esc(s.icon)} ${esc(s.judul)}</div>
                <div style="font-size:.8rem;color:var(--muted);line-height:1.6;margin-top:2px">${esc(s.isi)}</div>
              </div>
            </div>`).join('')}
          </div>
        </div>`;
      }

      case 'highlight':
        return `<div class="card mt14" style="border-left:4px solid ${esc(blok.warna || 'var(--y)')};background:${esc(blok.warna || 'var(--y)')}0a">
          ${judul ? `<div style="display:flex;align-items:center;gap:8px;margin-bottom:8px">
            <span style="font-size:1.3rem">${esc(blok.icon || '⚡')}</span>
            <div style="font-weight:900;font-size:.95rem;color:${esc(blok.warna || 'var(--y)')}">${esc(judul)}</div>
          </div>` : ''}
          <div style="font-size:.88rem;line-height:1.7;color:var(--muted)">${esc(blok.isi || '')}</div>
        </div>`;

      case 'compare': {
        const kiri = blok.kiri || {};
        const kanan = blok.kanan || {};
        return `<div class="card mt14">
          ${judul ? `<div class="h2">⚖️ <span class="hl">${esc(judul)}</span></div>` : ''}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
            <div style="background:rgba(62,207,207,.06);border:1px solid rgba(62,207,207,.2);border-radius:12px;padding:14px;text-align:center">
              <div style="font-size:1.5rem;margin-bottom:4px">${esc((kiri as any).icon || '👈')}</div>
              <div style="font-weight:900;font-size:.88rem;color:var(--c);margin-bottom:6px">${esc((kiri as any).judul || 'Kiri')}</div>
              <div style="font-size:.82rem;color:var(--muted);line-height:1.6">${esc((kiri as any).isi || '')}</div>
            </div>
            <div style="background:rgba(249,193,46,.06);border:1px solid rgba(249,193,46,.2);border-radius:12px;padding:14px;text-align:center">
              <div style="font-size:1.5rem;margin-bottom:4px">${esc((kanan as any).icon || '👉')}</div>
              <div style="font-weight:900;font-size:.88rem;color:var(--y);margin-bottom:6px">${esc((kanan as any).judul || 'Kanan')}</div>
              <div style="font-size:.82rem;color:var(--muted);line-height:1.6">${esc((kanan as any).isi || '')}</div>
            </div>
          </div>
        </div>`;
      }

      case 'infobox': {
        const style = String(blok.style || 'info');
        const styles: Record<string, { border: string; bg: string; icon: string }> = {
          info: { border: 'var(--c)', bg: 'rgba(62,207,207,.06)', icon: '💡' },
          tip: { border: 'var(--g)', bg: 'rgba(52,211,153,.06)', icon: '✨' },
          warning: { border: 'var(--y)', bg: 'rgba(249,193,46,.06)', icon: '⚠️' },
          danger: { border: 'var(--r)', bg: 'rgba(255,107,107,.06)', icon: '🚨' },
        };
        const s = styles[style] || styles.info;
        return `<div class="card mt14" style="border-left:4px solid ${s.border};background:${s.bg}">
          ${judul ? `<div style="font-weight:900;font-size:.9rem;margin-bottom:6px">${s.icon} ${esc(judul)}</div>` : ''}
          <div style="font-size:.86rem;line-height:1.7;color:var(--muted)">${esc(blok.isi || '')}</div>
        </div>`;
      }

      case 'checklist': {
        const butir = (blok.butir as string[]) || [];
        return `<div class="card mt14">
          ${judul ? `<div class="h2">✅ <span class="hl">${esc(judul)}</span></div>` : ''}
          <div style="margin-top:10px">
            ${butir.map(b => `<div style="display:flex;gap:8px;font-size:.86rem;line-height:1.6;margin-bottom:6px;align-items:flex-start">
              <span style="color:var(--g);flex-shrink:0;margin-top:1px">☐</span>
              <span>${esc(b)}</span>
            </div>`).join('')}
          </div>
        </div>`;
      }

      case 'statistik': {
        const items = (blok.items as Array<{ icon?: string; angka?: string; satuan?: string; label?: string; warna?: string; judul?: string; isi?: string }>) || [];
        return `<div class="card mt14">
          ${judul ? `<div class="h2">📊 <span class="hl">${esc(judul)}</span></div>` : ''}
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(100px,1fr));gap:10px;margin-top:12px">
            ${items.map(it => `<div style="text-align:center;padding:12px;background:rgba(255,255,255,.04);border:1px solid var(--border);border-radius:10px">
              <div style="font-size:1.2rem;margin-bottom:2px">${esc(it.icon || '📊')}</div>
              <div style="font-family:'Fredoka One',cursive;font-size:1.3rem;color:${esc(it.warna || 'var(--c)')}">${esc(it.angka || '0')}</div>
              <div style="font-size:.68rem;color:var(--muted)">${esc(it.satuan || '')}</div>
              <div style="font-size:.78rem;font-weight:700;margin-top:2px">${esc(it.label || it.judul || '')}</div>
            </div>`).join('')}
          </div>
        </div>`;
      }

      case 'studi':
        return `<div class="card mt14" style="border-left:4px solid var(--o);background:rgba(251,146,60,.05)">
          ${judul ? `<div class="h2">📰 <span class="hl">${esc(judul)}</span></div>` : ''}
          <div style="background:rgba(255,255,255,.04);border-radius:10px;padding:14px;margin-top:10px">
            <div style="font-size:.8rem;color:var(--muted);margin-bottom:8px">🎭 ${esc(blok.karakter || 'Karakter')}</div>
            <div style="font-size:.86rem;line-height:1.7;margin-bottom:10px">${esc(blok.situasi || '')}</div>
            ${blok.pertanyaan ? `<div style="font-weight:800;font-size:.86rem;color:var(--o);margin-bottom:6px">❓ ${esc(blok.pertanyaan)}</div>` : ''}
            ${blok.pesan ? `<div style="font-size:.82rem;color:var(--g);font-style:italic">💡 ${esc(blok.pesan)}</div>` : ''}
          </div>
        </div>`;

      default:
        // Unknown block type — render as generic card
        return `<div class="card mt14">
          ${judul ? `<div class="h2">${esc(judul)}</div>` : ''}
          <div style="font-size:.86rem;color:var(--muted)">${esc(blok.isi || '')}</div>
        </div>`;
    }
  }).join('\n');
}

// ═══════════════════════════════════════════════════════════════
// 3. GAME HTML BUILDER
// Uses the game-populator to generate fully interactive game HTML.
// Falls back to generic placeholder for unknown game types.
// ═══════════════════════════════════════════════════════════════
export function buildGamesHtml(games: AutoBuildData['games']): string {
  if (!games || games.length === 0) return '';
  return buildAllGamesHtml(games);
}

// ═══════════════════════════════════════════════════════════════
// 4. FUNGSI HTML BUILDER
// Generates the fungsi norma tab shell HTML.
// The JS part (generateFungsiJS) is already handled by
// exportWithTemplateSystem() via base-engine.
// ═══════════════════════════════════════════════════════════════
export function buildFungsiHtml(): string {
  // Only render the shell if we have fungsi norma data
  if (!FUNGSI_NORMA || FUNGSI_NORMA.length === 0) return '';

  return `<div class="card mt14">
    <div class="h2">⚖️ Fungsi <span class="hl">Norma</span></div>
    <p class="sub mt8">Klik setiap tab untuk menjelajahi fungsi norma dalam kehidupan.</p>
    <div class="ftab-row" id="ftabRow"></div>
    <div id="ftabContent"></div>
  </div>`;
}

// ═══════════════════════════════════════════════════════════════
// 5. MODULE → PER-SCREEN HTML BUILDER
// Distributes modules into per-screen HTML segments so that
// exportWithTemplateSystem() can fill the right screen slots.
// ═══════════════════════════════════════════════════════════════
export function buildExtraScreenHtml(modules: AutoBuildData['modules']): Record<string, string> {
  const extra: Record<string, string> = {};

  // Group modules by type for specialized screens
  const comparisonMods = modules.filter(m => m.type === 'comparison' || m.type === 'icon-explore');
  const flashcardMods = modules.filter(m => m.type === 'flashcard' || m.type === 'flipcard');
  const hotspotMods = modules.filter(m => m.type === 'hotspot-image');
  const sortingMods = modules.filter(m => m.type === 'matching' || m.type === 'memory' || m.type === 'truefalse' || m.type === 'sorting');
  const rodaMods = modules.filter(m => m.type === 'roda' || m.type === 'spinwheel');
  const diskusiMods = modules.filter(m => m.type === 'diskusi');

  if (comparisonMods.length > 0) {
    extra['s-hubungan'] = buildModulesHtml(comparisonMods);
  }
  if (flashcardMods.length > 0) {
    extra['s-flashcard'] = buildModulesHtml(flashcardMods);
  }
  if (hotspotMods.length > 0) {
    extra['s-hotspot'] = buildModulesHtml(hotspotMods);
  }
  if (sortingMods.length > 0) {
    extra['s-sortir'] = buildModulesHtml(sortingMods);
  }
  if (rodaMods.length > 0) {
    extra['s-roda'] = buildModulesHtml(rodaMods);
  }
  if (diskusiMods.length > 0) {
    extra['s-diskusi'] = buildModulesHtml(diskusiMods);
  }

  return extra;
}

// ═══════════════════════════════════════════════════════════════
// 6. UNIFIED exportProject()
// The single entry point for generating a complete HTML export.
//
// Works on both client-side (for preview) and server-side (for
// export) because it receives data explicitly — no require().
// ═══════════════════════════════════════════════════════════════
export function exportProject(data: AuthoringExportData): string {
  // 1. Build HTML segments from authoring data
  const modulesHtml = buildModulesHtml(data.modules);
  const materiHtml = buildMateriHtml(data.materi);
  const gamesHtml = buildGamesHtml(data.games);
  const fungsiHtml = buildFungsiHtml();
  const extraScreenHtml = buildExtraScreenHtml(data.modules);

  // 2. Build the AutoBuildData shape expected by the template engine
  //    Cast materi.blok from MateriBlok[] to Record<string, unknown>[]
  //    since AutoBuildData expects the looser type.
  const buildData: AutoBuildData = {
    meta: data.meta,
    cp: data.cp,
    tp: data.tp,
    atp: data.atp,
    alur: data.alur,
    skenario: data.skenario,
    kuis: data.kuis,
    modules: data.modules,
    games: data.games,
    materi: {
      blok: data.materi.blok as unknown as Array<Record<string, unknown>>,
    },
  };

  // 3. Call the template engine with all HTML slots filled
  const html = exportWithTemplateSystem(
    buildData,
    modulesHtml,
    gamesHtml,
    materiHtml,
    {
      ...extraScreenHtml,
      // Pass fungsi HTML so exportWithTemplateSystem can use it
      // instead of its hardcoded default
      _fungsiHtml: fungsiHtml,
    },
  );

  return html;
}
