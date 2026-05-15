'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

// ─── Tag picker ───────────────────────────────────────────────────────────────

const PRESET_TAGS = [
  'react', 'vue', 'svelte', 'next.js', 'angular',
  'typescript', 'javascript', 'python', 'rust', 'go',
  'dashboard', 'tool', 'game', 'utility', 'api',
  'cli', 'design', 'landing-page', 'portfolio', 'e-commerce',
  'ai', 'data-viz', 'animation', '3d', 'audio',
  'chat', 'auth', 'mobile', 'canvas', 'blog',
];

interface TagPickerProps {
  selected: string[];
  onChange: (tags: string[]) => void;
}

function TagPicker({ selected, onChange }: TagPickerProps) {
  const [customInput, setCustomInput] = useState('');

  function toggle(tag: string) {
    if (selected.includes(tag)) {
      onChange(selected.filter((t) => t !== tag));
    } else if (selected.length < 10) {
      onChange([...selected, tag]);
    }
  }

  function addCustom() {
    const val = customInput.trim().toLowerCase().replace(/\s+/g, '-');
    if (!val || selected.includes(val) || selected.length >= 10) return;
    onChange([...selected, val]);
    setCustomInput('');
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addCustom();
    } else if (e.key === 'Backspace' && !customInput && selected.length > 0) {
      onChange(selected.slice(0, -1));
    }
  }

  const atMax = selected.length >= 10;

  return (
    <div className="flex flex-col gap-3">
      {/* Selected pills */}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-6"
              style={{
                background: 'rgba(0,255,135,0.12)',
                color: 'var(--neon-green)',
                border: '1px solid rgba(0,255,135,0.28)',
                fontWeight: 510,
              }}
            >
              {tag}
              <button
                type="button"
                onClick={() => toggle(tag)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0, lineHeight: 1, opacity: 0.65, display: 'flex', alignItems: 'center' }}
              >
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                  <path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Preset grid */}
      <div
        className="rounded-10 p-3 flex flex-wrap gap-1.5"
        style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}
      >
        {PRESET_TAGS.map((tag) => {
          const isSelected = selected.includes(tag);
          return (
            <button
              key={tag}
              type="button"
              onClick={() => toggle(tag)}
              disabled={atMax && !isSelected}
              className="text-xs px-2.5 py-1 rounded-6 transition-all duration-100"
              style={{
                background: isSelected ? 'rgba(0,255,135,0.12)' : 'var(--bg-2)',
                color: isSelected ? 'var(--neon-green)' : 'var(--text-tertiary)',
                border: isSelected ? '1px solid rgba(0,255,135,0.3)' : '1px solid var(--border-1)',
                cursor: atMax && !isSelected ? 'not-allowed' : 'pointer',
                opacity: atMax && !isSelected ? 0.35 : 1,
                fontFamily: 'inherit',
                fontWeight: isSelected ? 510 : 400,
                transform: isSelected ? 'scale(1.04)' : 'scale(1)',
              }}
            >
              {isSelected && <span style={{ marginRight: 3, fontSize: 9 }}>✓</span>}
              {tag}
            </button>
          );
        })}
      </div>

      {/* Custom input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={atMax ? 'Max 10 tags reached' : 'Add a custom tag…'}
          disabled={atMax}
          style={{
            flex: 1,
            background: 'var(--bg-0)',
            border: '1px solid var(--border-2)',
            borderRadius: 8,
            padding: '7px 10px',
            color: 'var(--text-primary)',
            fontSize: 12,
            outline: 'none',
            fontFamily: 'inherit',
            opacity: atMax ? 0.4 : 1,
            transition: 'border-color 0.15s ease',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
        />
        <button
          type="button"
          onClick={addCustom}
          disabled={!customInput.trim() || atMax}
          className="text-xs px-3 py-2 rounded-8 transition-opacity hover:opacity-80 disabled:opacity-30"
          style={{ background: 'var(--bg-2)', border: '1px solid var(--border-2)', color: 'var(--text-secondary)', cursor: !customInput.trim() || atMax ? 'not-allowed' : 'pointer', fontFamily: 'inherit', whiteSpace: 'nowrap' }}
        >
          + Add
        </button>
      </div>
      <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>
        {selected.length}/10 tags · Press Enter or comma to add custom
      </p>
    </div>
  );
}

// ─── Screenshot picker ────────────────────────────────────────────────────────

interface ScreenshotItem { id: string; file: File; preview: string; }

function ScreenshotPicker({ items, onChange }: { items: ScreenshotItem[]; onChange: (next: ScreenshotItem[]) => void; }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function addFiles(files: FileList | null) {
    if (!files) return;
    const toAdd: ScreenshotItem[] = [];
    for (let i = 0; i < Math.min(files.length, 5 - items.length); i++) {
      const file = files[i];
      if (!file.type.startsWith('image/')) continue;
      toAdd.push({ id: `${Date.now()}-${i}`, file, preview: URL.createObjectURL(file) });
    }
    onChange([...items, ...toAdd]);
    if (fileRef.current) fileRef.current.value = '';
  }

  function remove(id: string) {
    const item = items.find((x) => x.id === id);
    if (item) URL.revokeObjectURL(item.preview);
    onChange(items.filter((x) => x.id !== id));
  }

  function handleDrop(targetId: string) {
    if (!draggingId || draggingId === targetId) { setDraggingId(null); setDragOverId(null); return; }
    const from = items.findIndex((x) => x.id === draggingId);
    const to = items.findIndex((x) => x.id === targetId);
    const reordered = [...items];
    const [moved] = reordered.splice(from, 1);
    reordered.splice(to, 0, moved);
    onChange(reordered);
    setDraggingId(null); setDragOverId(null);
  }

  return (
    <div>
      {items.length > 0 ? (
        <div className="flex gap-2 flex-wrap mb-2">
          {items.map((item, idx) => (
            <div key={item.id} draggable onDragStart={() => setDraggingId(item.id)} onDragOver={(e) => { e.preventDefault(); setDragOverId(item.id); }} onDrop={() => handleDrop(item.id)} onDragEnd={() => { setDraggingId(null); setDragOverId(null); }} className="relative rounded-8 overflow-hidden cursor-grab active:cursor-grabbing" style={{ width: 80, height: 60, flexShrink: 0, border: dragOverId === item.id ? '2px solid var(--neon-green)' : '2px solid var(--border-2)', opacity: draggingId === item.id ? 0.4 : 1, transition: 'border-color 0.1s, opacity 0.1s' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.preview} alt="" className="w-full h-full object-cover" />
              <div className="absolute bottom-0.5 left-0.5 text-[9px] px-1 rounded-[3px]" style={{ background: 'rgba(0,0,0,0.7)', color: 'rgba(255,255,255,0.7)' }}>{idx + 1}</div>
              <button type="button" onClick={() => remove(item.id)} className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.75)', border: 'none', cursor: 'pointer', color: 'white' }}>
                <svg width="8" height="8" viewBox="0 0 8 8" fill="none"><path d="M1.5 1.5l5 5M6.5 1.5l-5 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" /></svg>
              </button>
            </div>
          ))}
          {items.length < 5 && (
            <button type="button" onClick={() => fileRef.current?.click()} className="flex items-center justify-center rounded-8" style={{ width: 80, height: 60, border: '2px dashed var(--border-2)', cursor: 'pointer', background: 'transparent', color: 'var(--text-muted)', flexShrink: 0 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
            </button>
          )}
        </div>
      ) : (
        <div className="rounded-8 flex flex-col items-center justify-center gap-2 py-6 cursor-pointer" style={{ border: '2px dashed var(--border-2)', background: 'var(--bg-0)' }} onClick={() => fileRef.current?.click()}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--text-muted)' }}>
            <rect x="2" y="4" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.3" />
            <circle cx="7" cy="9" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M2 14l4-4 3 3 3-4 4 5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>Click to add screenshots</span>
        </div>
      )}
      <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>Up to 5 images · Max 5 MB each · Drag to reorder</p>
      <input ref={fileRef} type="file" accept="image/*" multiple className="sr-only" onChange={(e) => addFiles(e.target.files)} />
    </div>
  );
}

// ─── Shared style helpers ─────────────────────────────────────────────────────

const inputStyle: React.CSSProperties = {
  background: 'var(--bg-0)', border: '1px solid var(--border-2)', borderRadius: 8,
  padding: '9px 12px', color: 'var(--text-primary)', fontSize: 13, width: '100%',
  outline: 'none', fontFamily: 'inherit', transition: 'border-color 0.15s ease',
};
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 6, fontWeight: 510,
};
function Field({ id, label, hint, required, children }: { id?: string; label: string; hint?: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={id} style={labelStyle}>
        {label}
        {hint && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> — {hint}</span>}
        {!required && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> (optional)</span>}
      </label>
      {children}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

interface UploadFormProps {
  updateAppId?: string;
  parentId?: string;
  parentSlug?: string;
  parentVersionId?: string;
  parentTags?: string[];
  parentPackages?: Record<string, string>;
}

export default function UploadForm({
  updateAppId: propUpdateAppId,
  parentId: propParentId,
  parentSlug: propParentSlug,
  parentVersionId: propParentVersionId,
  parentTags: propParentTags,
  parentPackages: propParentPackages,
}: UploadFormProps) {
  const router = useRouter();
  const urlSearchParams = useSearchParams();

  const parentId = propParentId ?? urlSearchParams.get('parent_id') ?? '';
  const parentSlug = propParentSlug ?? urlSearchParams.get('parent_slug') ?? '';
  const parentVersionId = propParentVersionId ?? urlSearchParams.get('parent_version_id') ?? '';
  const updateAppId = propUpdateAppId ?? urlSearchParams.get('update_app_id') ?? '';

  const isRemix = Boolean(parentId);
  const isUpdate = Boolean(updateAppId);

  const prefillTags: string[] = propParentTags ?? (() => {
    try { return JSON.parse(urlSearchParams.get('parent_tags') ?? '[]'); } catch { return []; }
  })();
  const prefillPackages: Record<string, string> = propParentPackages ?? (() => {
    try { return JSON.parse(urlSearchParams.get('parent_packages') ?? '{}'); } catch { return {}; }
  })();

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [tags, setTags] = useState<string[]>(prefillTags);
  const [screenshots, setScreenshots] = useState<ScreenshotItem[]>([]);

  const didInit = useRef(false);
  useEffect(() => {
    if (!didInit.current && prefillTags.length > 0) {
      setTags(prefillTags);
      didInit.current = true;
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(prefillTags)]);

  const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (tags.length === 0) { setError('Add at least one tag'); return; }
    setError('');
    setLoading(true);

    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set('tags', JSON.stringify(tags));
    if (parentId) formData.set('parent_id', parentId);
    if (parentVersionId) formData.set('parent_version_id', parentVersionId);
    if (updateAppId) formData.set('update_app_id', updateAppId);
    screenshots.forEach((item, idx) => formData.set(`screenshot_${idx}`, item.file, item.file.name));

    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (!res.ok) { setError(json.error ?? 'Upload failed'); setLoading(false); return; }
      router.push(`/app/${json.slug}`);
    } catch (err) {
      setError(String(err));
      setLoading(false);
    }
  }, [tags, parentId, parentVersionId, updateAppId, screenshots, router]);

  const accent = isRemix ? 'var(--purple)' : isUpdate ? 'var(--electric-blue)' : 'var(--neon-green)';
  const accentBg = isRemix ? 'rgba(155,92,255,0.1)' : isUpdate ? 'rgba(0,180,255,0.08)' : 'rgba(0,255,135,0.08)';
  const accentBorder = isRemix ? '1px solid rgba(155,92,255,0.2)' : isUpdate ? '1px solid rgba(0,180,255,0.15)' : '1px solid rgba(0,255,135,0.15)';
  const submitLabel = loading ? 'Uploading…' : isRemix ? 'Upload remix' : isUpdate ? 'Upload new version' : 'Upload blueprint';

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12" style={{ background: 'var(--bg-0)' }}>
      <div className="w-full max-w-[520px]">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="inline-flex items-center gap-1.5 text-xs mb-6 transition-colors hover:text-white" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M8 2L4 6l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" /></svg>
            Back to Discover
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-12 flex items-center justify-center flex-shrink-0" style={{ background: accentBg, border: accentBorder }}>
              {isRemix ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--purple)' }}><path d="M14 5L9.5 1v2C5 3 1 6 1 11c1.2-3 4-5 8.5-5V8L14 5Z" fill="currentColor" /></svg>
              ) : isUpdate ? (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--electric-blue)' }}><path d="M8 2v8M5 7l3 3 3-3M2 13h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--neon-green)' }}><path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
              )}
            </div>
            <div>
              <h1 className="text-lg font-heading" style={{ color: 'var(--text-primary)', fontWeight: 680, letterSpacing: '-0.02em' }}>
                {isRemix
                  ? <><span>Remix </span><span style={{ color: 'var(--purple)' }}>{parentSlug ? `/${parentSlug}` : 'blueprint'}</span></>
                  : isUpdate
                  ? <><span>Upload </span><span style={{ color: 'var(--electric-blue)' }}>new version</span></>
                  : 'Upload blueprint'}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                {isRemix ? 'Fork and build on an existing blueprint' : isUpdate ? 'A new version will be queued for scanning' : 'Share your AI-built app with the Blueprint community'}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} encType="multipart/form-data" className="flex flex-col gap-5">
          <Field id="title" label="Title" required>
            <input id="title" name="title" type="text" required placeholder="My awesome app" style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
          </Field>

          <Field id="tagline" label="Tagline" hint="max 80 chars · shows on cards">
            <input id="tagline" name="tagline" type="text" maxLength={80} placeholder="A punchy one-liner for what this does" style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
          </Field>

          <Field id="description" label="Description" required>
            <textarea id="description" name="description" required rows={4} placeholder="What does this blueprint do?" style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
          </Field>

          <Field id="how_to_run" label="How to run" hint="setup steps, commands">
            <textarea id="how_to_run" name="how_to_run" rows={4} placeholder={`npm install\nnpm run dev\n\nOpen http://localhost:3000`} style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.6', fontFamily: 'monospace', fontSize: 12.5 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
          </Field>

          <Field id="demo_url" label="Demo URL" hint="live preview link">
            <input id="demo_url" name="demo_url" type="url" placeholder="https://my-demo.vercel.app" style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
          </Field>

          <Field id="claude_md" label="AI context" hint="tell remixers what's in your blueprint · helps with AI-assisted editing">
            <textarea id="claude_md" name="claude_md" rows={3} placeholder="This app is a React dashboard that displays real-time analytics. Key files: src/components/Chart.tsx (charting), src/api/fetch.ts (data). Safe to modify: colors, layout, API endpoints. Do NOT: change authentication logic." style={{ ...inputStyle, resize: 'none', lineHeight: '1.6', fontSize: 12 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.55 }}>
              This becomes the project context inside the zip. When a remixer opens your blueprint with an AI assistant, this helps it understand the codebase instantly — it&apos;s why remixes use 5× fewer tokens.
            </p>
          </Field>

          <Field id="remix_md" label="Remix ideas" hint="suggest changes remixers could make · optional">
            <textarea id="remix_md" name="remix_md" rows={3} placeholder="• Add dark mode\n• Change the color scheme to ocean blue\n• Replace static data with live API\n• Add export to CSV" style={{ ...inputStyle, resize: 'none', lineHeight: '1.6', fontSize: 12 }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.55 }}>
              Blueprints with remix ideas get discovered more. Give the next builder a starting point.
            </p>
          </Field>

          {/* Tags */}
          <div>
            <label style={labelStyle}>
              Tags <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>— click to select or type your own</span>
            </label>
            <TagPicker selected={tags} onChange={setTags} />
          </div>

          {/* Parent packages hint on remix */}
          {isRemix && Object.keys(prefillPackages).length > 0 && (
            <div className="flex flex-wrap gap-1 px-3 py-2 rounded-8 text-[11px]" style={{ background: 'rgba(155,92,255,0.06)', border: '1px solid rgba(155,92,255,0.12)', color: 'var(--text-muted)' }}>
              <span style={{ color: 'var(--purple)', fontWeight: 510, marginRight: 4 }}>Packages from parent:</span>
              {Object.keys(prefillPackages).slice(0, 8).map((pkg) => (<span key={pkg} style={{ color: 'var(--electric-blue)' }}>{pkg} </span>))}
              {Object.keys(prefillPackages).length > 8 && <span>+{Object.keys(prefillPackages).length - 8} more</span>}
            </div>
          )}

          {isRemix && (
            <Field id="remix_notes" label="What did you change?" required>
              <textarea id="remix_notes" name="remix_notes" required rows={3} placeholder="Describe the changes you made to the original blueprint…" style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
            </Field>
          )}

          {isUpdate && (
            <Field id="changelog" label="Changelog" hint="what changed in this version" required>
              <textarea id="changelog" name="changelog" required rows={3} placeholder="Describe what changed in this version…" style={{ ...inputStyle, resize: 'none', lineHeight: '1.6' }}
                onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
                onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }} />
            </Field>
          )}

          <Field label="Screenshots" hint="shown in the detail page carousel">
            <ScreenshotPicker items={screenshots} onChange={setScreenshots} />
          </Field>

          <Field id="zip" label="Blueprint zip" required>
            <div className="rounded-8 overflow-hidden" style={{ border: '1px solid var(--border-2)', background: 'var(--bg-0)' }}>
              <input id="zip" name="zip" type="file" accept=".zip" required className="w-full text-xs px-3 py-2.5" style={{ color: 'var(--text-tertiary)', fontFamily: 'inherit', background: 'transparent', border: 'none', outline: 'none', cursor: 'pointer' }} />
            </div>
            <p className="text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>Max 50 MB · .zip only</p>
          </Field>

          {error && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-8 text-xs" style={{ background: 'rgba(255,107,107,0.07)', border: '1px solid rgba(255,107,107,0.15)', color: '#ff6b6b' }}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.2" />
                <path d="M6 4v3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                <circle cx="6" cy="8.5" r="0.5" fill="currentColor" />
              </svg>
              <span data-testid="upload-error">{error}</span>
            </div>
          )}

          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-8 text-sm font-semibold transition-opacity hover:opacity-85 disabled:opacity-40"
            style={{ background: accent, color: 'var(--bg-0)', fontWeight: 590, fontFamily: 'inherit', cursor: loading ? 'not-allowed' : 'pointer', letterSpacing: '-0.01em', border: 'none' }}>
            {submitLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
