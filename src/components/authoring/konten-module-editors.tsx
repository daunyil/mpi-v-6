import { useCallback } from 'react';
import { useAuthoringStore } from '@/store/authoring-store';
import { INPUT_CLS, TEXTAREA_CLS, FieldLabel, SubItemHeader, RemoveButton, ModalShell } from './konten-shared';
import { moduleTypeInfo } from './konten-module-types';

// ── Module Editors ────────────────────────────────────────────

/** Skenario Editor */
function SkenarioEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const chapters = (mod.chapters as Record<string, unknown>[]) || [];

  const addChapter = useCallback(() => {
    update(idx, 'chapters', [...chapters, { title: '', setup: [{ teks: '' }], choices: [] }]);
  }, [idx, chapters, update]);

  const updateChapter = useCallback((ci: number, key: string, val: unknown) => {
    const next = chapters.map((c, j) => (j === ci ? { ...c, [key]: val } : c));
    update(idx, 'chapters', next);
  }, [idx, chapters, update]);

  const removeChapter = useCallback((ci: number) => {
    update(idx, 'chapters', chapters.filter((_, j) => j !== ci));
  }, [idx, chapters, update]);

  // Setup helpers
  const addSetup = useCallback((ci: number) => {
    const ch = chapters[ci];
    const setups = [...((ch.setup as Record<string, unknown>[]) || []), { teks: '' }];
    updateChapter(ci, 'setup', setups);
  }, [chapters, updateChapter]);

  const updateSetup = useCallback((ci: number, si: number, val: string) => {
    const ch = chapters[ci];
    const setups = [...((ch.setup as Record<string, unknown>[]) || [])];
    setups[si] = { ...setups[si], teks: val };
    updateChapter(ci, 'setup', setups);
  }, [chapters, updateChapter]);

  const removeSetup = useCallback((ci: number, si: number) => {
    const ch = chapters[ci];
    const setups = ((ch.setup as Record<string, unknown>[]) || []).filter((_, j) => j !== si);
    updateChapter(ci, 'setup', setups);
  }, [chapters, updateChapter]);

  // Choice helpers
  const addChoice = useCallback((ci: number) => {
    const ch = chapters[ci];
    const choices = [...((ch.choices as Record<string, unknown>[]) || []), { teks: '', konsekuensi: [{ teks: '' }] }];
    updateChapter(ci, 'choices', choices);
  }, [chapters, updateChapter]);

  const updateChoice = useCallback((ci: number, chi: number, key: string, val: unknown) => {
    const ch = chapters[ci];
    const choices = [...((ch.choices as Record<string, unknown>[]) || [])];
    choices[chi] = { ...choices[chi], [key]: val };
    updateChapter(ci, 'choices', choices);
  }, [chapters, updateChapter]);

  const removeChoice = useCallback((ci: number, chi: number) => {
    const ch = chapters[ci];
    const choices = ((ch.choices as Record<string, unknown>[]) || []).filter((_, j) => j !== chi);
    updateChapter(ci, 'choices', choices);
  }, [chapters, updateChapter]);

  // Consequence helpers
  const addConsequence = useCallback((ci: number, chi: number) => {
    const ch = chapters[ci];
    const choices = [...((ch.choices as Record<string, unknown>[]) || [])];
    const choice = choices[chi];
    const kons = [...(((choice.konsekuensi as Record<string, unknown>[]) || [])), { teks: '' }];
    choices[chi] = { ...choice, konsekuensi: kons };
    updateChapter(ci, 'choices', choices);
  }, [chapters, updateChapter]);

  const updateConsequence = useCallback((ci: number, chi: number, ki: number, val: string) => {
    const ch = chapters[ci];
    const choices = [...((ch.choices as Record<string, unknown>[]) || [])];
    const choice = choices[chi];
    const kons = [...(((choice.konsekuensi as Record<string, unknown>[]) || []))];
    kons[ki] = { ...kons[ki], teks: val };
    choices[chi] = { ...choice, konsekuensi: kons };
    updateChapter(ci, 'choices', choices);
  }, [chapters, updateChapter]);

  const removeConsequence = useCallback((ci: number, chi: number, ki: number) => {
    const ch = chapters[ci];
    const choices = [...((ch.choices as Record<string, unknown>[]) || [])];
    const choice = choices[chi];
    const kons = (((choice.konsekuensi as Record<string, unknown>[]) || [])).filter((_, j) => j !== ki);
    choices[chi] = { ...choice, konsekuensi: kons };
    updateChapter(ci, 'choices', choices);
  }, [chapters, updateChapter]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Skenario</FieldLabel>
        <input className={INPUT_CLS} placeholder="Contoh: Konflik di Kampung..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>

      <SubItemHeader label="Bab Skenario" count={chapters.length} onAdd={addChapter} />

      {chapters.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada bab. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {chapters.map((ch, ci) => {
            const setups = (ch.setup as Record<string, unknown>[]) || [];
            const choices = (ch.choices as Record<string, unknown>[]) || [];
            return (
              <div key={ci} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <span className="w-6 h-6 rounded-md bg-amber-500/15 text-amber-400 flex items-center justify-center text-xs font-bold flex-shrink-0">{ci + 1}</span>
                  <input className={`${INPUT_CLS} flex-1`} placeholder={`Judul Bab ${ci + 1}...`} value={(ch.title as string) || ''} onChange={(e) => updateChapter(ci, 'title', e.target.value)} />
                  {chapters.length > 1 && <RemoveButton onClick={() => removeChapter(ci)} />}
                </div>

                {/* Setup / Dialog */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-400">Dialog / Setup</span>
                    <button onClick={() => addSetup(ci)} className="text-xs text-amber-500 hover:text-amber-400 transition-colors">＋ Baris</button>
                  </div>
                  {setups.map((s, si) => (
                    <div key={si} className="flex items-center gap-2 mb-1.5">
                      <span className="text-xs text-zinc-600 w-4 text-right flex-shrink-0">{si + 1}</span>
                      <textarea className={`${TEXTAREA_CLS} rows={2}`} placeholder="Teks dialog..." value={(s.teks as string) || ''} onChange={(e) => updateSetup(ci, si, e.target.value)} />
                      {setups.length > 1 && <RemoveButton onClick={() => removeSetup(ci, si)} />}
                    </div>
                  ))}
                </div>

                {/* Choices */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-medium text-zinc-400">Pilihan ({choices.length})</span>
                    <button onClick={() => addChoice(ci)} className="text-xs text-amber-500 hover:text-amber-400 transition-colors">＋ Pilihan</button>
                  </div>
                  {choices.map((choice, chi) => {
                    const kons = (choice.konsekuensi as Record<string, unknown>[]) || [];
                    return (
                      <div key={chi} className="bg-zinc-800/60 rounded-lg p-3 mb-2 space-y-2 border border-zinc-700/30">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-amber-400 font-bold flex-shrink-0">P{chi + 1}</span>
                          <input className={`${INPUT_CLS} flex-1`} placeholder="Teks pilihan..." value={(choice.teks as string) || ''} onChange={(e) => updateChoice(ci, chi, 'teks', e.target.value)} />
                          {choices.length > 1 && <RemoveButton onClick={() => removeChoice(ci, chi)} />}
                        </div>
                        {/* Consequences */}
                        <div className="pl-6">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs text-zinc-500">Konsekuensi ({kons.length})</span>
                            <button onClick={() => addConsequence(ci, chi)} className="text-[0.65rem] text-amber-500/70 hover:text-amber-400 transition-colors">＋ Baris</button>
                          </div>
                          {kons.map((k, ki) => (
                            <div key={ki} className="flex items-center gap-2 mb-1">
                              <textarea className={`${TEXTAREA_CLS} text-xs`} rows={2} placeholder="Teks konsekuensi..." value={(k.teks as string) || ''} onChange={(e) => updateConsequence(ci, chi, ki, e.target.value)} />
                              {kons.length > 1 && <RemoveButton onClick={() => removeConsequence(ci, chi, ki)} />}
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/** Video Editor */
function VideoEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const pertanyaan = (mod.pertanyaan as string[]) || [];

  const addPertanyaan = useCallback(() => {
    update(idx, 'pertanyaan', [...pertanyaan, '']);
  }, [idx, pertanyaan, update]);

  const updatePertanyaan = useCallback((i: number, val: string) => {
    const next = [...pertanyaan]; next[i] = val;
    update(idx, 'pertanyaan', next);
  }, [idx, pertanyaan, update]);

  const removePertanyaan = useCallback((i: number) => {
    update(idx, 'pertanyaan', pertanyaan.filter((_, j) => j !== i));
  }, [idx, pertanyaan, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Video</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul video..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>URL Video</FieldLabel>
        <input className={INPUT_CLS} placeholder="https://youtube.com/watch?v=..." value={(mod.url as string) || ''} onChange={(e) => update(idx, 'url', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Platform</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['youtube', 'drive', 'vimeo', 'other'].map((p) => (
            <button key={p} onClick={() => update(idx, 'platform', p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.platform === p ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}
            >
              {p === 'youtube' ? '▶️' : p === 'drive' ? '📁' : p === 'vimeo' ? '🎬' : '🔗'} {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <FieldLabel>Durasi</FieldLabel>
          <input className={INPUT_CLS} placeholder="05:30" value={(mod.durasi as string) || ''} onChange={(e) => update(idx, 'durasi', e.target.value)} />
        </div>
      </div>
      <div>
        <FieldLabel>Instruksi untuk Siswa</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Apa yang harus siswa lakukan setelah menonton..." value={(mod.instruksi as string) || ''} onChange={(e) => update(idx, 'instruksi', e.target.value)} />
      </div>

      <SubItemHeader label="Pertanyaan Refleksi" count={pertanyaan.length} onAdd={addPertanyaan} />
      {pertanyaan.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-5 flex-shrink-0">{i + 1}.</span>
          <input className={INPUT_CLS} placeholder={`Pertanyaan refleksi ${i + 1}...`} value={p} onChange={(e) => updatePertanyaan(i, e.target.value)} />
          <RemoveButton onClick={() => removePertanyaan(i)} />
        </div>
      ))}
    </div>
  );
}

/** Flashcard Editor */
function FlashcardEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const kartu = (mod.kartu as Record<string, unknown>[]) || [];

  const addKartu = useCallback(() => {
    update(idx, 'kartu', [...kartu, { depan: '', belakang: '', hint: '' }]);
  }, [idx, kartu, update]);

  const updateKartu = useCallback((i: number, key: string, val: string) => {
    const next = kartu.map((k, j) => (j === i ? { ...k, [key]: val } : k));
    update(idx, 'kartu', next);
  }, [idx, kartu, update]);

  const removeKartu = useCallback((i: number) => {
    update(idx, 'kartu', kartu.filter((_, j) => j !== i));
  }, [idx, kartu, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Flashcard</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul set flashcard..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Instruksi (opsional)</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Petunjuk untuk siswa..." value={(mod.instruksi as string) || ''} onChange={(e) => update(idx, 'instruksi', e.target.value)} />
      </div>

      <SubItemHeader label="Kartu" count={kartu.length} onAdd={addKartu} />

      {kartu.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada kartu. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {kartu.map((k, i) => (
            <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-400">Kartu #{i + 1}</span>
                <RemoveButton onClick={() => removeKartu(i)} />
              </div>
              <div>
                <FieldLabel>Depan (pertanyaan / istilah)</FieldLabel>
                <textarea className={TEXTAREA_CLS} rows={2} placeholder="Istilah atau pertanyaan..." value={(k.depan as string) || ''} onChange={(e) => updateKartu(i, 'depan', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Belakang (jawaban / definisi)</FieldLabel>
                <textarea className={TEXTAREA_CLS} rows={2} placeholder="Jawaban atau definisi..." value={(k.belakang as string) || ''} onChange={(e) => updateKartu(i, 'belakang', e.target.value)} />
              </div>
              <div>
                <FieldLabel>Petunjuk / Hint (opsional)</FieldLabel>
                <input className={INPUT_CLS} placeholder="Petunjuk singkat..." value={(k.hint as string) || ''} onChange={(e) => updateKartu(i, 'hint', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Infografis Editor */
function InfografisEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const kartu = (mod.kartu as Record<string, unknown>[]) || [];

  const addKartu = useCallback(() => {
    update(idx, 'kartu', [...kartu, { judul: '', isi: '', ikon: '📌', warna: '#3ecfcf' }]);
  }, [idx, kartu, update]);

  const updateKartu = useCallback((i: number, key: string, val: string) => {
    const next = kartu.map((k, j) => (j === i ? { ...k, [key]: val } : k));
    update(idx, 'kartu', next);
  }, [idx, kartu, update]);

  const removeKartu = useCallback((i: number) => {
    update(idx, 'kartu', kartu.filter((_, j) => j !== i));
  }, [idx, kartu, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Infografis</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul infografis..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Pengantar (opsional)</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Teks pengantar..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Layout</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[
            { id: 'grid', label: '▦ Grid', icon: '▦' },
            { id: 'list', label: '☰ List', icon: '☰' },
            { id: 'timeline', label: '⟷ Timeline', icon: '⟷' },
          ].map((l) => (
            <button key={l.id} onClick={() => update(idx, 'layout', l.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.layout === l.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}
            >
              {l.icon} {l.label}
            </button>
          ))}
        </div>
      </div>

      <SubItemHeader label="Kartu Infografis" count={kartu.length} onAdd={addKartu} />

      {kartu.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada kartu. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {kartu.map((k, i) => (
            <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-zinc-400">Kartu #{i + 1}</span>
                <RemoveButton onClick={() => removeKartu(i)} />
              </div>
              <div className="grid grid-cols-[40px_1fr] gap-2">
                <div>
                  <FieldLabel>Ikon</FieldLabel>
                  <input className={INPUT_CLS} placeholder="📌" value={(k.ikon as string) || ''} onChange={(e) => updateKartu(i, 'ikon', e.target.value)} />
                </div>
                <div>
                  <FieldLabel>Judul</FieldLabel>
                  <input className={INPUT_CLS} placeholder="Judul kartu..." value={(k.judul as string) || ''} onChange={(e) => updateKartu(i, 'judul', e.target.value)} />
                </div>
              </div>
              <div>
                <FieldLabel>Isi</FieldLabel>
                <textarea className={TEXTAREA_CLS} rows={2} placeholder="Isi kartu..." value={(k.isi as string) || ''} onChange={(e) => updateKartu(i, 'isi', e.target.value)} />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500">Warna</span>
                <input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent" value={(k.warna as string) || '#3ecfcf'} onChange={(e) => updateKartu(i, 'warna', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Studi Kasus Editor */
function StudiKasusEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const pertanyaan = (mod.pertanyaan as string[]) || [];

  const addPertanyaan = useCallback(() => {
    update(idx, 'pertanyaan', [...pertanyaan, '']);
  }, [idx, pertanyaan, update]);

  const updatePertanyaan = useCallback((i: number, val: string) => {
    const next = [...pertanyaan]; next[i] = val;
    update(idx, 'pertanyaan', next);
  }, [idx, pertanyaan, update]);

  const removePertanyaan = useCallback((i: number) => {
    update(idx, 'pertanyaan', pertanyaan.filter((_, j) => j !== i));
  }, [idx, pertanyaan, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Studi Kasus</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul studi kasus..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Narasi / Teks Kasus</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={5} placeholder="Tuliskan narasi kasus di sini..." value={(mod.teks as string) || ''} onChange={(e) => update(idx, 'teks', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Sumber (opsional)</FieldLabel>
        <input className={INPUT_CLS} placeholder="Sumber referensi..." value={(mod.sumber as string) || ''} onChange={(e) => update(idx, 'sumber', e.target.value)} />
      </div>

      <SubItemHeader label="Pertanyaan Analisis" count={pertanyaan.length} onAdd={addPertanyaan} />
      {pertanyaan.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <span className="text-xs text-zinc-500 w-5 flex-shrink-0">{i + 1}.</span>
          <input className={INPUT_CLS} placeholder={`Pertanyaan analisis ${i + 1}...`} value={p} onChange={(e) => updatePertanyaan(i, e.target.value)} />
          <RemoveButton onClick={() => removePertanyaan(i)} />
        </div>
      ))}
    </div>
  );
}

/** Debat Editor */
function DebatEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const pihakA = (mod.pihakA as Record<string, unknown>) || { label: 'Pro / Setuju' };
  const pihakB = (mod.pihakB as Record<string, unknown>) || { label: 'Kontra / Tidak Setuju' };

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Debat</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul debat..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Mosi / Pertanyaan Debat</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Contoh: Norma hukum lebih penting daripada norma agama..." value={(mod.pertanyaan as string) || ''} onChange={(e) => update(idx, 'pertanyaan', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Konteks / Latar Belakang (opsional)</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Jelaskan konteks debat..." value={(mod.konteks as string) || ''} onChange={(e) => update(idx, 'konteks', e.target.value)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 space-y-2">
          <span className="text-xs font-semibold text-emerald-400">Pihak A</span>
          <div>
            <FieldLabel>Label</FieldLabel>
            <input className={INPUT_CLS} placeholder="Pro / Setuju" value={(pihakA.label as string) || ''} onChange={(e) => update(idx, 'pihakA', { ...pihakA, label: e.target.value })} />
          </div>
        </div>
        <div className="p-3 bg-zinc-800/50 rounded-lg border border-zinc-700/50 space-y-2">
          <span className="text-xs font-semibold text-red-400">Pihak B</span>
          <div>
            <FieldLabel>Label</FieldLabel>
            <input className={INPUT_CLS} placeholder="Kontra / Tidak Setuju" value={(pihakB.label as string) || ''} onChange={(e) => update(idx, 'pihakB', { ...pihakB, label: e.target.value })} />
          </div>
        </div>
      </div>
    </div>
  );
}

/** Timeline Module Editor */
function TimelineModuleEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const events = (mod.events as Record<string, unknown>[]) || [];

  const addEvent = useCallback(() => {
    update(idx, 'events', [...events, { icon: '📌', tahun: '', judul: '', deskripsi: '' }]);
  }, [idx, events, update]);

  const updateEvent = useCallback((i: number, key: string, val: string) => {
    const next = events.map((e, j) => (j === i ? { ...e, [key]: val } : e));
    update(idx, 'events', next);
  }, [idx, events, update]);

  const removeEvent = useCallback((i: number) => {
    update(idx, 'events', events.filter((_, j) => j !== i));
  }, [idx, events, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Timeline</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul timeline..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Pengantar (opsional)</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Teks pengantar..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} />
      </div>

      <SubItemHeader label="Peristiwa" count={events.length} onAdd={addEvent} />

      {events.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada peristiwa. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {events.map((ev, i) => (
            <div key={i} className="relative pl-6 border-l-2 border-zinc-700 ml-2 pb-1">
              <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-zinc-700 border-2 border-zinc-600" />
              <div className="space-y-2 bg-zinc-800/30 rounded-lg p-3">
                <div className="flex items-center gap-2">
                  <input className={`${INPUT_CLS} w-16`} placeholder="📌" value={(ev.icon as string) || ''} onChange={(e) => updateEvent(i, 'icon', e.target.value)} />
                  <input className={`${INPUT_CLS} w-28`} placeholder="Tahun" value={(ev.tahun as string) || ''} onChange={(e) => updateEvent(i, 'tahun', e.target.value)} />
                  <RemoveButton onClick={() => removeEvent(i)} />
                </div>
                <input className={INPUT_CLS} placeholder="Judul peristiwa..." value={(ev.judul as string) || ''} onChange={(e) => updateEvent(i, 'judul', e.target.value)} />
                <textarea className={TEXTAREA_CLS} rows={2} placeholder="Deskripsi..." value={(ev.deskripsi as string) || ''} onChange={(e) => updateEvent(i, 'deskripsi', e.target.value)} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Matching Editor */
function MatchingEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const pasangan = (mod.pasangan as Record<string, unknown>[]) || [];

  const addPasangan = useCallback(() => {
    update(idx, 'pasangan', [...pasangan, { kiri: '', kanan: '' }]);
  }, [idx, pasangan, update]);

  const updatePasangan = useCallback((i: number, key: string, val: string) => {
    const next = pasangan.map((p, j) => (j === i ? { ...p, [key]: val } : p));
    update(idx, 'pasangan', next);
  }, [idx, pasangan, update]);

  const removePasangan = useCallback((i: number) => {
    update(idx, 'pasangan', pasangan.filter((_, j) => j !== i));
  }, [idx, pasangan, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Game</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul game pasangkan..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Instruksi (opsional)</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Petunjuk untuk siswa..." value={(mod.instruksi as string) || ''} onChange={(e) => update(idx, 'instruksi', e.target.value)} />
      </div>

      <SubItemHeader label="Pasangan" count={pasangan.length} onAdd={addPasangan} />

      {pasangan.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada pasangan. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pasangan.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-5 flex-shrink-0">{i + 1}.</span>
              <input className={`${INPUT_CLS} flex-1`} placeholder="Istilah / Kiri" value={(p.kiri as string) || ''} onChange={(e) => updatePasangan(i, 'kiri', e.target.value)} />
              <span className="text-zinc-600">↔</span>
              <input className={`${INPUT_CLS} flex-1`} placeholder="Definisi / Kanan" value={(p.kanan as string) || ''} onChange={(e) => updatePasangan(i, 'kanan', e.target.value)} />
              <RemoveButton onClick={() => removePasangan(i)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Materi Module Editor (simplified text blocks) */
function MateriModulEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const blok = (mod.blok as Record<string, unknown>[]) || [];

  const addBlok = useCallback(() => {
    update(idx, 'blok', [...blok, { judul: '', isi: '' }]);
  }, [idx, blok, update]);

  const updateBlok = useCallback((i: number, key: string, val: string) => {
    const next = blok.map((b, j) => (j === i ? { ...b, [key]: val } : b));
    update(idx, 'blok', next);
  }, [idx, blok, update]);

  const removeBlok = useCallback((i: number) => {
    update(idx, 'blok', blok.filter((_, j) => j !== i));
  }, [idx, blok, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Materi</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul materi..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Pengantar (opsional)</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Teks pengantar..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} />
      </div>

      <SubItemHeader label="Blok Konten" count={blok.length} onAdd={addBlok} />

      {blok.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada blok. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {blok.map((b, i) => (
            <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold text-zinc-400">Blok #{i + 1}</span>
                <RemoveButton onClick={() => removeBlok(i)} />
              </div>
              <input className={INPUT_CLS} placeholder="Judul blok (opsional)..." value={(b.judul as string) || ''} onChange={(e) => updateBlok(i, 'judul', e.target.value)} />
              <textarea className={TEXTAREA_CLS} rows={3} placeholder="Isi blok materi..." value={(b.isi as string) || ''} onChange={(e) => updateBlok(i, 'isi', e.target.value)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** True/False Editor */
function TrueFalseEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const soal = (mod.soal as Record<string, unknown>[]) || [];

  const addSoal = useCallback(() => {
    update(idx, 'soal', [...soal, { teks: '', jawaban: true }]);
  }, [idx, soal, update]);

  const updateSoal = useCallback((i: number, key: string, val: unknown) => {
    const next = soal.map((s, j) => (j === i ? { ...s, [key]: val } : s));
    update(idx, 'soal', next);
  }, [idx, soal, update]);

  const removeSoal = useCallback((i: number) => {
    update(idx, 'soal', soal.filter((_, j) => j !== i));
  }, [idx, soal, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul game Benar/Salah..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>
      <div>
        <FieldLabel>Instruksi (opsional)</FieldLabel>
        <textarea className={TEXTAREA_CLS} rows={2} placeholder="Petunjuk..." value={(mod.instruksi as string) || ''} onChange={(e) => update(idx, 'instruksi', e.target.value)} />
      </div>

      <SubItemHeader label="Pernyataan" count={soal.length} onAdd={addSoal} />

      {soal.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada pernyataan. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {soal.map((s, i) => (
            <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-lg p-3 space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-5 flex-shrink-0">{i + 1}.</span>
                <input className={`${INPUT_CLS} flex-1`} placeholder="Pernyataan..." value={(s.teks as string) || ''} onChange={(e) => updateSoal(i, 'teks', e.target.value)} />
                <RemoveButton onClick={() => removeSoal(i)} />
              </div>
              <div className="flex gap-2 pl-7">
                <button onClick={() => updateSoal(i, 'jawaban', true)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${s.jawaban === true ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-zinc-700/50 text-zinc-400'}`}>
                  ✓ Benar
                </button>
                <button onClick={() => updateSoal(i, 'jawaban', false)}
                  className={`px-3 py-1 rounded-md text-xs font-medium border transition-colors ${s.jawaban === false ? 'border-red-500/50 bg-red-500/10 text-red-400' : 'border-zinc-700/50 text-zinc-400'}`}>
                  ✗ Salah
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Memory Match Editor */
function MemoryEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const pasangan = (mod.pasangan as Record<string, unknown>[]) || [];

  const addPasangan = useCallback(() => {
    update(idx, 'pasangan', [...pasangan, { kiri: '', kanan: '' }]);
  }, [idx, pasangan, update]);

  const updatePasangan = useCallback((i: number, key: string, val: string) => {
    const next = pasangan.map((p, j) => (j === i ? { ...p, [key]: val } : p));
    update(idx, 'pasangan', next);
  }, [idx, pasangan, update]);

  const removePasangan = useCallback((i: number) => {
    update(idx, 'pasangan', pasangan.filter((_, j) => j !== i));
  }, [idx, pasangan, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Game</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul Memory Match..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>

      <SubItemHeader label="Pasangan Kartu" count={pasangan.length} onAdd={addPasangan} />

      {pasangan.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada pasangan. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {pasangan.map((p, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-5 flex-shrink-0">{i + 1}.</span>
              <input className={`${INPUT_CLS} flex-1`} placeholder="Kartu 1" value={(p.kiri as string) || ''} onChange={(e) => updatePasangan(i, 'kiri', e.target.value)} />
              <span className="text-zinc-600">↔</span>
              <input className={`${INPUT_CLS} flex-1`} placeholder="Kartu 2" value={(p.kanan as string) || ''} onChange={(e) => updatePasangan(i, 'kanan', e.target.value)} />
              <RemoveButton onClick={() => removePasangan(i)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Roda (Spin Wheel) Editor */
function RodaEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const opsi = (mod.opsi as string[]) || [];

  const addOpsi = useCallback(() => {
    update(idx, 'opsi', [...opsi, '']);
  }, [idx, opsi, update]);

  const updateOpsi = useCallback((i: number, val: string) => {
    const next = [...opsi]; next[i] = val;
    update(idx, 'opsi', next);
  }, [idx, opsi, update]);

  const removeOpsi = useCallback((i: number) => {
    update(idx, 'opsi', opsi.filter((_, j) => j !== i));
  }, [idx, opsi, update]);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel>Judul Roda</FieldLabel>
        <input className={INPUT_CLS} placeholder="Judul roda putar..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} />
      </div>

      <SubItemHeader label="Opsi Roda" count={opsi.length} onAdd={addOpsi} />

      {opsi.length === 0 ? (
        <div className="text-center py-6 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
          <p className="text-sm text-zinc-500">Belum ada opsi. Klik "＋ Tambah" untuk menambahkan.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {opsi.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <span className="text-xs text-zinc-500 w-5 flex-shrink-0">{i + 1}.</span>
              <input className={INPUT_CLS} placeholder={`Opsi ${i + 1}...`} value={o} onChange={(e) => updateOpsi(i, e.target.value)} />
              <RemoveButton onClick={() => removeOpsi(i)} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/** Hero Banner Editor */
function HeroEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const chips = (mod.chips as string[]) || [];
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul Hero</FieldLabel><input className={INPUT_CLS} placeholder="Judul bab / topik..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Subjudul</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Deskripsi singkat..." value={(mod.subjudul as string) || ''} onChange={(e) => update(idx, 'subjudul', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="📚" value={(mod.ikon as string) || ''} onChange={(e) => update(idx, 'ikon', e.target.value)} /></div>
        <div><FieldLabel>CTA Button</FieldLabel><input className={INPUT_CLS} placeholder="Mulai Belajar" value={(mod.cta as string) || ''} onChange={(e) => update(idx, 'cta', e.target.value)} /></div>
      </div>
      <div><FieldLabel>Gradient</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {['sunset','ocean','forest','royal','fire','aurora'].map((g) => (
            <button key={g} onClick={() => update(idx, 'gradient', g)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.gradient === g ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{g}</button>
          ))}
        </div>
      </div>
      <div><FieldLabel>Chips / Tag</FieldLabel>
        {chips.map((c, i) => (
          <div key={i} className="flex items-center gap-2 mb-1.5">
            <input className={INPUT_CLS} placeholder={`Chip ${i+1}...`} value={c} onChange={(e) => { const next = [...chips]; next[i] = e.target.value; update(idx, 'chips', next); }} />
            <RemoveButton onClick={() => update(idx, 'chips', chips.filter((_, j) => j !== i))} />
          </div>
        ))}
        <button onClick={() => update(idx, 'chips', [...chips, ''])} className="text-xs text-amber-500 hover:text-amber-400 transition-colors">＋ Tambah Chip</button>
      </div>
    </div>
  );
}

/** Kutipan Editor */
function KutipanModuleEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Teks Kutipan</FieldLabel><textarea className={TEXTAREA_CLS} rows={3} placeholder="Tulis kutipan..." value={(mod.teks as string) || ''} onChange={(e) => update(idx, 'teks', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Sumber / Tokoh</FieldLabel><input className={INPUT_CLS} placeholder="Aristoteles..." value={(mod.sumber as string) || ''} onChange={(e) => update(idx, 'sumber', e.target.value)} /></div>
        <div><FieldLabel>Jabatan</FieldLabel><input className={INPUT_CLS} placeholder="Filsuf Yunani..." value={(mod.jabatan as string) || ''} onChange={(e) => update(idx, 'jabatan', e.target.value)} /></div>
      </div>
      <div><FieldLabel>Gaya Tampilan</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[{id:'card',label:'🃏 Card'},{id:'big',label:'✨ Big'},{id:'minimal',label:'📝 Minimal'}].map((s) => (
            <button key={s.id} onClick={() => update(idx, 'style', s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.style === s.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{s.label}</button>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Langkah Editor */
function LangkahEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const langkah = (mod.langkah as Record<string, unknown>[]) || [];
  const addLangkah = useCallback(() => { update(idx, 'langkah', [...langkah, { icon: '✅', judul: '', isi: '', warna: '#3ecfcf' }]); }, [idx, langkah, update]);
  const updateLangkah = useCallback((i: number, key: string, val: string) => { const next = langkah.map((l, j) => (j === i ? { ...l, [key]: val } : l)); update(idx, 'langkah', next); }, [idx, langkah, update]);
  const removeLangkah = useCallback((i: number) => { update(idx, 'langkah', langkah.filter((_, j) => j !== i)); }, [idx, langkah, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul langkah-langkah..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Pengantar (opsional)</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Teks pengantar..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <div><FieldLabel>Gaya</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[{id:'numbered',label:'1️⃣ Numbered'},{id:'bubble',label:'🫧 Bubble'},{id:'arrow',label:'➡️ Arrow'}].map((s) => (
            <button key={s.id} onClick={() => update(idx, 'style', s.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.style === s.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{s.label}</button>
          ))}
        </div>
      </div>
      <SubItemHeader label="Langkah" count={langkah.length} onAdd={addLangkah} />
      {langkah.map((l, i) => (
        <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Langkah #{i+1}</span><RemoveButton onClick={() => removeLangkah(i)} /></div>
          <div className="grid grid-cols-[50px_1fr] gap-2">
            <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="✅" value={(l.icon as string) || ''} onChange={(e) => updateLangkah(i, 'icon', e.target.value)} /></div>
            <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul langkah..." value={(l.judul as string) || ''} onChange={(e) => updateLangkah(i, 'judul', e.target.value)} /></div>
          </div>
          <div><FieldLabel>Deskripsi</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Deskripsi langkah..." value={(l.isi as string) || ''} onChange={(e) => updateLangkah(i, 'isi', e.target.value)} /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Warna</span><input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent" value={(l.warna as string) || '#3ecfcf'} onChange={(e) => updateLangkah(i, 'warna', e.target.value)} /></div>
        </div>
      ))}
    </div>
  );
}

/** Accordion Editor */
function AccordionEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const items = (mod.items as Record<string, unknown>[]) || [];
  const addItem = useCallback(() => { update(idx, 'items', [...items, { judul: '', isi: '', icon: '❓' }]); }, [idx, items, update]);
  const updateItem = useCallback((i: number, key: string, val: string) => { const next = items.map((it, j) => (j === i ? { ...it, [key]: val } : it)); update(idx, 'items', next); }, [idx, items, update]);
  const removeItem = useCallback((i: number) => { update(idx, 'items', items.filter((_, j) => j !== i)); }, [idx, items, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul accordion..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Pengantar (opsional)</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Teks pengantar..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <SubItemHeader label="Item Accordion" count={items.length} onAdd={addItem} />
      {items.map((it, i) => (
        <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Item #{i+1}</span><RemoveButton onClick={() => removeItem(i)} /></div>
          <div className="grid grid-cols-[50px_1fr] gap-2">
            <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="❓" value={(it.icon as string) || ''} onChange={(e) => updateItem(i, 'icon', e.target.value)} /></div>
            <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Pertanyaan / judul..." value={(it.judul as string) || ''} onChange={(e) => updateItem(i, 'judul', e.target.value)} /></div>
          </div>
          <div><FieldLabel>Isi</FieldLabel><textarea className={TEXTAREA_CLS} rows={3} placeholder="Jawaban / konten..." value={(it.isi as string) || ''} onChange={(e) => updateItem(i, 'isi', e.target.value)} /></div>
        </div>
      ))}
    </div>
  );
}

/** Statistik Module Editor */
function StatistikModuleEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const items = (mod.items as Record<string, unknown>[]) || [];
  const addItem = useCallback(() => { update(idx, 'items', [...items, { angka: '', satuan: '', label: '', icon: '📊', warna: '#3ecfcf' }]); }, [idx, items, update]);
  const updateItem = useCallback((i: number, key: string, val: string) => { const next = items.map((it, j) => (j === i ? { ...it, [key]: val } : it)); update(idx, 'items', next); }, [idx, items, update]);
  const removeItem = useCallback((i: number) => { update(idx, 'items', items.filter((_, j) => j !== i)); }, [idx, items, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul statistik..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Pengantar (opsional)</FieldLabel><input className={INPUT_CLS} placeholder="Tahukah kamu?" value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <div><FieldLabel>Layout</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[{id:'grid',label:'▦ Grid'},{id:'row',label:'☰ Row'}].map((l) => (
            <button key={l.id} onClick={() => update(idx, 'layout', l.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.layout === l.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{l.label}</button>
          ))}
        </div>
      </div>
      <SubItemHeader label="Item Statistik" count={items.length} onAdd={addItem} />
      {items.map((it, i) => (
        <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Item #{i+1}</span><RemoveButton onClick={() => removeItem(i)} /></div>
          <div className="grid grid-cols-[50px_1fr_1fr] gap-2">
            <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="📊" value={(it.icon as string) || ''} onChange={(e) => updateItem(i, 'icon', e.target.value)} /></div>
            <div><FieldLabel>Angka</FieldLabel><input className={INPUT_CLS} placeholder="85%" value={(it.angka as string) || ''} onChange={(e) => updateItem(i, 'angka', e.target.value)} /></div>
            <div><FieldLabel>Satuan</FieldLabel><input className={INPUT_CLS} placeholder="Jenis..." value={(it.satuan as string) || ''} onChange={(e) => updateItem(i, 'satuan', e.target.value)} /></div>
          </div>
          <div><FieldLabel>Label</FieldLabel><input className={INPUT_CLS} placeholder="Label statistik..." value={(it.label as string) || ''} onChange={(e) => updateItem(i, 'label', e.target.value)} /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Warna</span><input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent" value={(it.warna as string) || '#3ecfcf'} onChange={(e) => updateItem(i, 'warna', e.target.value)} /></div>
        </div>
      ))}
    </div>
  );
}

/** Polling Editor */
function PollingEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const opsi = (mod.opsi as Record<string, unknown>[]) || [];
  const addOpsi = useCallback(() => { update(idx, 'opsi', [...opsi, { icon: '💬', teks: '', warna: '#3ecfcf' }]); }, [idx, opsi, update]);
  const updateOpsi = useCallback((i: number, key: string, val: string) => { const next = opsi.map((o, j) => (j === i ? { ...o, [key]: val } : o)); update(idx, 'opsi', next); }, [idx, opsi, update]);
  const removeOpsi = useCallback((i: number) => { update(idx, 'opsi', opsi.filter((_, j) => j !== i)); }, [idx, opsi, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul Polling</FieldLabel><input className={INPUT_CLS} placeholder="Judul polling..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Instruksi</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Pilih jawaban yang sesuai..." value={(mod.instruksi as string) || ''} onChange={(e) => update(idx, 'instruksi', e.target.value)} /></div>
      <div><FieldLabel>Tipe</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[{id:'single',label:'🔘 Pilihan Tunggal'},{id:'multiple',label:'☑️ Pilihan Ganda'}].map((t) => (
            <button key={t.id} onClick={() => update(idx, 'tipe', t.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.tipe === t.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{t.label}</button>
          ))}
        </div>
      </div>
      <SubItemHeader label="Opsi Polling" count={opsi.length} onAdd={addOpsi} />
      {opsi.map((o, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={`${INPUT_CLS} w-12`} placeholder="💬" value={(o.icon as string) || ''} onChange={(e) => updateOpsi(i, 'icon', e.target.value)} />
          <input className={INPUT_CLS} placeholder={`Opsi ${i+1}...`} value={(o.teks as string) || ''} onChange={(e) => updateOpsi(i, 'teks', e.target.value)} />
          <input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent flex-shrink-0" value={(o.warna as string) || '#3ecfcf'} onChange={(e) => updateOpsi(i, 'warna', e.target.value)} />
          <RemoveButton onClick={() => removeOpsi(i)} />
        </div>
      ))}
    </div>
  );
}

/** Embed Editor */
function EmbedEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul konten embed..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>URL Embed</FieldLabel><input className={INPUT_CLS} placeholder="https://..." value={(mod.url as string) || ''} onChange={(e) => update(idx, 'url', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Tinggi (px)</FieldLabel><input type="number" className={INPUT_CLS} placeholder="420" value={(mod.tinggi as number) || ''} onChange={(e) => update(idx, 'tinggi', parseInt(e.target.value) || 420)} /></div>
        <div><FieldLabel>Label Link</FieldLabel><input className={INPUT_CLS} placeholder="Buka di tab baru" value={(mod.label as string) || ''} onChange={(e) => update(idx, 'label', e.target.value)} /></div>
      </div>
    </div>
  );
}

/** Tab Icons Editor */
function TabIconsEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const tabs = (mod.tabs as Record<string, unknown>[]) || [];
  const addTab = useCallback(() => { update(idx, 'tabs', [...tabs, { icon: '📌', judul: '', isi: '', warna: '#3ecfcf', poin: [], refleksi: '' }]); }, [idx, tabs, update]);
  const updateTab = useCallback((i: number, key: string, val: unknown) => { const next = tabs.map((t, j) => (j === i ? { ...t, [key]: val } : t)); update(idx, 'tabs', next); }, [idx, tabs, update]);
  const removeTab = useCallback((i: number) => { update(idx, 'tabs', tabs.filter((_, j) => j !== i)); }, [idx, tabs, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul tab interaktif..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Pengantar (opsional)</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Teks pengantar..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Layout</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {[{id:'vertical',label:'↕️ Vertikal'},{id:'horizontal',label:'↔️ Horizontal'},{id:'pills',label:'💊 Pills'}].map((l) => (
              <button key={l.id} onClick={() => update(idx, 'layout', l.id)} className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${mod.layout === l.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{l.label}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>Animasi</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {[{id:'fade-in',label:'Fade'},{id:'slide-up',label:'Slide'},{id:'zoom',label:'Zoom'},{id:'bounce',label:'Bounce'}].map((a) => (
              <button key={a.id} onClick={() => update(idx, 'animasi', a.id)} className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${mod.animasi === a.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
      <SubItemHeader label="Tab" count={tabs.length} onAdd={addTab} />
      {tabs.map((t, i) => (
        <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Tab #{i+1}</span><RemoveButton onClick={() => removeTab(i)} /></div>
          <div className="grid grid-cols-[50px_1fr] gap-2">
            <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="📌" value={(t.icon as string) || ''} onChange={(e) => updateTab(i, 'icon', e.target.value)} /></div>
            <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul tab..." value={(t.judul as string) || ''} onChange={(e) => updateTab(i, 'judul', e.target.value)} /></div>
          </div>
          <div><FieldLabel>Isi</FieldLabel><textarea className={TEXTAREA_CLS} rows={3} placeholder="Konten tab..." value={(t.isi as string) || ''} onChange={(e) => updateTab(i, 'isi', e.target.value)} /></div>
          <div><FieldLabel>Refleksi (opsional)</FieldLabel><input className={INPUT_CLS} placeholder="Pertanyaan refleksi..." value={(t.refleksi as string) || ''} onChange={(e) => updateTab(i, 'refleksi', e.target.value)} /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Warna</span><input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent" value={(t.warna as string) || '#3ecfcf'} onChange={(e) => updateTab(i, 'warna', e.target.value)} /></div>
        </div>
      ))}
    </div>
  );
}

/** Icon Explore Editor */
function IconExploreEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const items = (mod.items as Record<string, unknown>[]) || [];
  const addItem = useCallback(() => { update(idx, 'items', [...items, { icon: '📌', judul: '', ringkasan: '', isi: '', contoh: [], sanksi: '', warna: '#3ecfcf' }]); }, [idx, items, update]);
  const updateItem = useCallback((i: number, key: string, val: unknown) => { const next = items.map((it, j) => (j === i ? { ...it, [key]: val } : it)); update(idx, 'items', next); }, [idx, items, update]);
  const removeItem = useCallback((i: number) => { update(idx, 'items', items.filter((_, j) => j !== i)); }, [idx, items, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul eksplorasi..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Pengantar</FieldLabel><input className={INPUT_CLS} placeholder="Klik ikon untuk mempelajari..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <div><FieldLabel>Layout</FieldLabel>
        <div className="flex flex-wrap gap-2">
          {[{id:'grid',label:'▦ Grid'},{id:'carousel',label:'🎠 Carousel'},{id:'wheel',label:'🎡 Wheel'}].map((l) => (
            <button key={l.id} onClick={() => update(idx, 'layout', l.id)} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${mod.layout === l.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{l.label}</button>
          ))}
        </div>
      </div>
      <SubItemHeader label="Item Ikon" count={items.length} onAdd={addItem} />
      {items.map((it, i) => (
        <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Item #{i+1}</span><RemoveButton onClick={() => removeItem(i)} /></div>
          <div className="grid grid-cols-[50px_1fr] gap-2">
            <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="📌" value={(it.icon as string) || ''} onChange={(e) => updateItem(i, 'icon', e.target.value)} /></div>
            <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul item..." value={(it.judul as string) || ''} onChange={(e) => updateItem(i, 'judul', e.target.value)} /></div>
          </div>
          <div><FieldLabel>Ringkasan</FieldLabel><input className={INPUT_CLS} placeholder="Ringkasan singkat..." value={(it.ringkasan as string) || ''} onChange={(e) => updateItem(i, 'ringkasan', e.target.value)} /></div>
          <div><FieldLabel>Isi Detail</FieldLabel><textarea className={TEXTAREA_CLS} rows={3} placeholder="Penjelasan lengkap..." value={(it.isi as string) || ''} onChange={(e) => updateItem(i, 'isi', e.target.value)} /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Warna</span><input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent" value={(it.warna as string) || '#3ecfcf'} onChange={(e) => updateItem(i, 'warna', e.target.value)} /></div>
        </div>
      ))}
    </div>
  );
}

/** Comparison Editor */
function ComparisonEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const kolom = (mod.kolom as Record<string, unknown>[]) || [];
  const baris = (mod.baris as Record<string, unknown>[]) || [];
  const addKolom = useCallback(() => { update(idx, 'kolom', [...kolom, { icon: '📌', judul: '', warna: '#3ecfcf' }]); }, [idx, kolom, update]);
  const removeKolom = useCallback((i: number) => { update(idx, 'kolom', kolom.filter((_, j) => j !== i)); }, [idx, kolom, update]);
  const updateKolom = useCallback((i: number, key: string, val: string) => { const next = kolom.map((k, j) => (j === i ? { ...k, [key]: val } : k)); update(idx, 'kolom', next); }, [idx, kolom, update]);
  const addBaris = useCallback(() => { const nilai = kolom.map(() => ''); update(idx, 'baris', [...baris, { label: '', icon: '📋', nilai }]); }, [idx, kolom, baris, update]);
  const removeBaris = useCallback((i: number) => { update(idx, 'baris', baris.filter((_, j) => j !== i)); }, [idx, baris, update]);
  const updateBaris = useCallback((i: number, key: string, val: unknown) => { const next = baris.map((b, j) => (j === i ? { ...b, [key]: val } : b)); update(idx, 'baris', next); }, [idx, baris, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul perbandingan..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Pengantar</FieldLabel><input className={INPUT_CLS} placeholder="Bandingkan..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <div><FieldLabel>Pertanyaan Refleksi (opsional)</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Pertanyaan..." value={(mod.tanya as string) || ''} onChange={(e) => update(idx, 'tanya', e.target.value)} /></div>
      <SubItemHeader label="Kolom" count={kolom.length} onAdd={addKolom} />
      {kolom.map((k, i) => (
        <div key={i} className="flex items-center gap-2">
          <input className={`${INPUT_CLS} w-12`} placeholder="📌" value={(k.icon as string) || ''} onChange={(e) => updateKolom(i, 'icon', e.target.value)} />
          <input className={INPUT_CLS} placeholder={`Kolom ${i+1}...`} value={(k.judul as string) || ''} onChange={(e) => updateKolom(i, 'judul', e.target.value)} />
          <input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent flex-shrink-0" value={(k.warna as string) || '#3ecfcf'} onChange={(e) => updateKolom(i, 'warna', e.target.value)} />
          <RemoveButton onClick={() => removeKolom(i)} />
        </div>
      ))}
      <SubItemHeader label="Baris" count={baris.length} onAdd={addBaris} />
      {baris.map((b, i) => {
        const nilai = (b.nilai as string[]) || [];
        return (
          <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Baris #{i+1}</span><RemoveButton onClick={() => removeBaris(i)} /></div>
            <div className="grid grid-cols-[50px_1fr] gap-2">
              <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="📋" value={(b.icon as string) || ''} onChange={(e) => updateBaris(i, 'icon', e.target.value)} /></div>
              <div><FieldLabel>Label</FieldLabel><input className={INPUT_CLS} placeholder="Label baris..." value={(b.label as string) || ''} onChange={(e) => updateBaris(i, 'label', e.target.value)} /></div>
            </div>
            {nilai.map((n, ni) => (
              <div key={ni} className="flex items-center gap-2">
                <span className="text-xs text-zinc-500 w-20 flex-shrink-0 truncate">{String(kolom[ni]?.judul || `K${ni+1}`)}</span>
                <input className={INPUT_CLS} placeholder={`Nilai kolom ${ni+1}...`} value={n} onChange={(e) => { const next = [...nilai]; next[ni] = e.target.value; updateBaris(i, 'nilai', next); }} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

/** Card Showcase Editor */
function CardShowcaseEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const cards = (mod.cards as Record<string, unknown>[]) || [];
  const addCard = useCallback(() => { update(idx, 'cards', [...cards, { icon: '📌', judul: '', subtitle: '', isi: '', warna: '#3ecfcf', tag: [] }]); }, [idx, cards, update]);
  const updateCard = useCallback((i: number, key: string, val: unknown) => { const next = cards.map((c, j) => (j === i ? { ...c, [key]: val } : c)); update(idx, 'cards', next); }, [idx, cards, update]);
  const removeCard = useCallback((i: number) => { update(idx, 'cards', cards.filter((_, j) => j !== i)); }, [idx, cards, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul showcase..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>Pengantar</FieldLabel><input className={INPUT_CLS} placeholder="Pelajari..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Layout</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {[{id:'grid',label:'▦ Grid'},{id:'list',label:'☰ List'},{id:'masonry',label:'🧱 Masonry'}].map((l) => (
              <button key={l.id} onClick={() => update(idx, 'layout', l.id)} className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${mod.layout === l.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{l.label}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>Animasi</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {[{id:'fade-in',label:'Fade'},{id:'slide-up',label:'Slide'},{id:'zoom',label:'Zoom'},{id:'bounce',label:'Bounce'}].map((a) => (
              <button key={a.id} onClick={() => update(idx, 'animasi', a.id)} className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${mod.animasi === a.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{a.label}</button>
            ))}
          </div>
        </div>
      </div>
      <SubItemHeader label="Card" count={cards.length} onAdd={addCard} />
      {cards.map((c, i) => {
        const tag = (c.tag as string[]) || [];
        return (
          <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Card #{i+1}</span><RemoveButton onClick={() => removeCard(i)} /></div>
            <div className="grid grid-cols-[50px_1fr] gap-2">
              <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="📌" value={(c.icon as string) || ''} onChange={(e) => updateCard(i, 'icon', e.target.value)} /></div>
              <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul card..." value={(c.judul as string) || ''} onChange={(e) => updateCard(i, 'judul', e.target.value)} /></div>
            </div>
            <div><FieldLabel>Subtitle</FieldLabel><input className={INPUT_CLS} placeholder="Subtitle..." value={(c.subtitle as string) || ''} onChange={(e) => updateCard(i, 'subtitle', e.target.value)} /></div>
            <div><FieldLabel>Isi</FieldLabel><textarea className={TEXTAREA_CLS} rows={3} placeholder="Konten card..." value={(c.isi as string) || ''} onChange={(e) => updateCard(i, 'isi', e.target.value)} /></div>
            <div><FieldLabel>Tag</FieldLabel>
              {tag.map((t, ti) => (
                <div key={ti} className="flex items-center gap-2 mb-1">
                  <input className={INPUT_CLS} placeholder={`Tag ${ti+1}...`} value={t} onChange={(e) => { const next = [...tag]; next[ti] = e.target.value; updateCard(i, 'tag', next); }} />
                  <RemoveButton onClick={() => updateCard(i, 'tag', tag.filter((_, j) => j !== ti))} />
                </div>
              ))}
              <button onClick={() => updateCard(i, 'tag', [...tag, ''])} className="text-xs text-amber-500 hover:text-amber-400 transition-colors">＋ Tambah Tag</button>
            </div>
            <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Warna</span><input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent" value={(c.warna as string) || '#3ecfcf'} onChange={(e) => updateCard(i, 'warna', e.target.value)} /></div>
          </div>
        );
      })}
    </div>
  );
}

/** Hotspot Image Editor */
function HotspotImageEditor({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const update = useAuthoringStore((s) => s.updateModuleField);
  const hotspots = (mod.hotspots as Record<string, unknown>[]) || [];
  const addHotspot = useCallback(() => { update(idx, 'hotspots', [...hotspots, { x: 50, y: 50, icon: '📌', judul: '', isi: '', warna: '#3ecfcf' }]); }, [idx, hotspots, update]);
  const updateHotspot = useCallback((i: number, key: string, val: unknown) => { const next = hotspots.map((h, j) => (j === i ? { ...h, [key]: val } : h)); update(idx, 'hotspots', next); }, [idx, hotspots, update]);
  const removeHotspot = useCallback((i: number) => { update(idx, 'hotspots', hotspots.filter((_, j) => j !== i)); }, [idx, hotspots, update]);
  return (
    <div className="space-y-3">
      <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul hotspot image..." value={(mod.title as string) || ''} onChange={(e) => update(idx, 'title', e.target.value)} /></div>
      <div><FieldLabel>URL Gambar</FieldLabel><input className={INPUT_CLS} placeholder="https://..." value={(mod.imageUrl as string) || ''} onChange={(e) => update(idx, 'imageUrl', e.target.value)} /></div>
      <div><FieldLabel>Pengantar</FieldLabel><input className={INPUT_CLS} placeholder="Klik titik pada gambar..." value={(mod.intro as string) || ''} onChange={(e) => update(idx, 'intro', e.target.value)} /></div>
      <div className="grid grid-cols-2 gap-3">
        <div><FieldLabel>Mode</FieldLabel>
          <div className="flex flex-wrap gap-2">
            {[{id:'pin',label:'📌 Pin'},{id:'tooltip',label:'💬 Tooltip'},{id:'card',label:'🃏 Card'}].map((m) => (
              <button key={m.id} onClick={() => update(idx, 'mode', m.id)} className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors ${mod.mode === m.id ? 'border-amber-500/50 bg-amber-500/10 text-amber-400' : 'border-zinc-700/50 text-zinc-400 hover:text-zinc-200'}`}>{m.label}</button>
            ))}
          </div>
        </div>
        <div><FieldLabel>Tinggi Gambar (px)</FieldLabel><input type="number" className={INPUT_CLS} placeholder="400" value={(mod.imageHeight as number) || ''} onChange={(e) => update(idx, 'imageHeight', parseInt(e.target.value) || 400)} /></div>
      </div>
      <SubItemHeader label="Hotspot" count={hotspots.length} onAdd={addHotspot} />
      {hotspots.map((h, i) => (
        <div key={i} className="bg-zinc-800/40 border border-zinc-700/50 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between"><span className="text-xs font-semibold text-zinc-400">Hotspot #{i+1}</span><RemoveButton onClick={() => removeHotspot(i)} /></div>
          <div className="grid grid-cols-[50px_1fr_60px_60px] gap-2">
            <div><FieldLabel>Ikon</FieldLabel><input className={INPUT_CLS} placeholder="📌" value={(h.icon as string) || ''} onChange={(e) => updateHotspot(i, 'icon', e.target.value)} /></div>
            <div><FieldLabel>Judul</FieldLabel><input className={INPUT_CLS} placeholder="Judul hotspot..." value={(h.judul as string) || ''} onChange={(e) => updateHotspot(i, 'judul', e.target.value)} /></div>
            <div><FieldLabel>X (%)</FieldLabel><input type="number" className={INPUT_CLS} min="0" max="100" value={(h.x as number) || 50} onChange={(e) => updateHotspot(i, 'x', parseInt(e.target.value) || 0)} /></div>
            <div><FieldLabel>Y (%)</FieldLabel><input type="number" className={INPUT_CLS} min="0" max="100" value={(h.y as number) || 50} onChange={(e) => updateHotspot(i, 'y', parseInt(e.target.value) || 0)} /></div>
          </div>
          <div><FieldLabel>Isi</FieldLabel><textarea className={TEXTAREA_CLS} rows={2} placeholder="Deskripsi hotspot..." value={(h.isi as string) || ''} onChange={(e) => updateHotspot(i, 'isi', e.target.value)} /></div>
          <div className="flex items-center gap-2"><span className="text-xs text-zinc-500">Warna</span><input type="color" className="w-7 h-7 rounded cursor-pointer border border-zinc-700 bg-transparent" value={(h.warna as string) || '#3ecfcf'} onChange={(e) => updateHotspot(i, 'warna', e.target.value)} /></div>
        </div>
      ))}
    </div>
  );
}

// ── Module Editor Router ──────────────────────────────────────
function ModuleEditorContent({ mod, idx }: { mod: Record<string, unknown>; idx: number }) {
  const t = mod.type as string;
  switch (t) {
    case 'skenario': return <SkenarioEditor mod={mod} idx={idx} />;
    case 'video': return <VideoEditor mod={mod} idx={idx} />;
    case 'flashcard': return <FlashcardEditor mod={mod} idx={idx} />;
    case 'infografis': return <InfografisEditor mod={mod} idx={idx} />;
    case 'studi-kasus': return <StudiKasusEditor mod={mod} idx={idx} />;
    case 'debat': return <DebatEditor mod={mod} idx={idx} />;
    case 'timeline': return <TimelineModuleEditor mod={mod} idx={idx} />;
    case 'matching': return <MatchingEditor mod={mod} idx={idx} />;
    case 'materi': return <MateriModulEditor mod={mod} idx={idx} />;
    case 'truefalse': return <TrueFalseEditor mod={mod} idx={idx} />;
    case 'memory': return <MemoryEditor mod={mod} idx={idx} />;
    case 'roda': return <RodaEditor mod={mod} idx={idx} />;
    case 'hero': return <HeroEditor mod={mod} idx={idx} />;
    case 'kutipan': return <KutipanModuleEditor mod={mod} idx={idx} />;
    case 'langkah': return <LangkahEditor mod={mod} idx={idx} />;
    case 'accordion': return <AccordionEditor mod={mod} idx={idx} />;
    case 'statistik': return <StatistikModuleEditor mod={mod} idx={idx} />;
    case 'polling': return <PollingEditor mod={mod} idx={idx} />;
    case 'embed': return <EmbedEditor mod={mod} idx={idx} />;
    case 'tab-icons': return <TabIconsEditor mod={mod} idx={idx} />;
    case 'icon-explore': return <IconExploreEditor mod={mod} idx={idx} />;
    case 'comparison': return <ComparisonEditor mod={mod} idx={idx} />;
    case 'card-showcase': return <CardShowcaseEditor mod={mod} idx={idx} />;
    case 'hotspot-image': return <HotspotImageEditor mod={mod} idx={idx} />;
    default: return <div className="text-sm text-zinc-500">Tipe modul tidak dikenali: {t}</div>;
  }
}

// ── Module Editor Modal ───────────────────────────────────────
export function ModuleEditorModal({
  open,
  moduleIndex,
  onClose,
}: {
  open: boolean;
  moduleIndex: number | null;
  onClose: () => void;
}) {
  const modules = useAuthoringStore((s) => s.modules);

  if (!open || moduleIndex === null) return null;
  const mod = modules[moduleIndex];
  if (!mod) return null;

  const info = moduleTypeInfo(mod.type as string);

  return (
    <ModalShell
      title={`${info.icon} ${info.label}`}
      subtitle={`Mengedit modul #${moduleIndex + 1}`}
      onClose={onClose}
    >
      <ModuleEditorContent mod={mod} idx={moduleIndex} />
    </ModalShell>
  );
}
