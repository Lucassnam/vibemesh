import { z } from 'zod';

// ─── Upload ──────────────────────────────────────────────────────────────────

export const uploadSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(80, 'Title must be at most 80 characters'),
  tagline: z
    .string()
    .max(80, 'Tagline must be at most 80 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description must be at most 1000 characters'),
  how_to_run: z
    .string()
    .max(2000, 'How-to-run must be at most 2000 characters')
    .optional(),
  demo_url: z
    .string()
    .url('Demo URL must be a valid URL')
    .optional()
    .or(z.literal('')),
  tags: z
    .array(z.string().min(1).max(30))
    .min(1, 'Add at least one tag')
    .max(10, 'Maximum 10 tags'),
  parent_id: z.string().uuid().optional(),
  parent_version_id: z.string().uuid().optional(),
  /** Only present when re-uploading an existing app */
  update_app_id: z.string().uuid().optional(),
  changelog: z
    .string()
    .max(2000, 'Changelog must be at most 2000 characters')
    .optional(),
  /** Required "what changed" field on remixes */
  remix_notes: z
    .string()
    .min(10, 'Please describe what you changed (at least 10 characters)')
    .max(1000)
    .optional(),
  /** Claude context for remixing */
  claude_md: z
    .string()
    .max(2000, 'Claude context must be at most 2000 characters')
    .optional(),
  /** Remix suggestions */
  remix_md: z
    .string()
    .max(1000, 'Remix ideas must be at most 1000 characters')
    .optional(),
});

export type UploadInput = z.infer<typeof uploadSchema>;

// ─── Comment ─────────────────────────────────────────────────────────────────

export const commentSchema = z.object({
  app_id: z.string().uuid(),
  body: z
    .string()
    .min(1, 'Comment cannot be empty')
    .max(2000, 'Comment must be at most 2000 characters'),
});

export type CommentInput = z.infer<typeof commentSchema>;

// ─── Report ──────────────────────────────────────────────────────────────────

export const reportSchema = z.object({
  app_id: z.string().uuid(),
  reason: z.enum(['spam', 'malware', 'copyright', 'other']),
  notes: z.string().max(500).optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;

// ─── Zip validation (server-side) ────────────────────────────────────────────

export const MAX_ZIP_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_SCREENSHOT_BYTES = 5 * 1024 * 1024; // 5 MB per image
export const PREVIEWS_BUCKET = process.env.APP_PREVIEWS_BUCKET ?? 'previews';

export function assertValidZip(file: File): void {
  if (!file.name.endsWith('.zip')) {
    throw new Error('File must be a .zip archive');
  }
  if (file.size > MAX_ZIP_BYTES) {
    throw new Error(`File exceeds the 50 MB limit (${(file.size / 1024 / 1024).toFixed(1)} MB)`);
  }
  if (file.size === 0) {
    throw new Error('File is empty');
  }
}

export function assertValidScreenshot(file: File): void {
  if (!file.type.startsWith('image/')) {
    throw new Error(`${file.name} is not an image`);
  }
  if (file.size > MAX_SCREENSHOT_BYTES) {
    throw new Error(`${file.name} exceeds the 5 MB limit per screenshot`);
  }
}

// ─── Content validation (block dangerous executables) ──────────────────────

const BLOCKED_EXTENSIONS = new Set([
  'exe', 'bat', 'cmd', 'dll', 'so', 'sh', 'bin', 'app', 'deb', 'rpm',
  'msi', 'dmg', 'pkg', 'scr', 'vbs', 'ps1', 'psm1', 'psd1',
]);

export async function assertValidZipContents(zipBytes: ArrayBuffer): Promise<void> {
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(zipBytes);

    for (const [filePath, file] of Object.entries(zip.files)) {
      // Skip directories
      if (file.dir) continue;

      // Block executable/dangerous file types only
      const ext = filePath.split('.').pop()?.toLowerCase() ?? '';
      if (BLOCKED_EXTENSIONS.has(ext)) {
        throw new Error(`Executable files not allowed: .${ext} in ${filePath}`);
      }
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes('not allowed')) {
      throw err;
    }
    // If we can't parse the zip, that's a different error
    if (err instanceof Error && (err.message.includes('Cannot find End of Central Directory') || err.message.includes('not a valid zip'))) {
      throw new Error('Invalid zip file');
    }
    // If it's some other parsing error, just throw it
    if (err instanceof Error) throw err;
    throw new Error('Could not validate zip contents');
  }
}

// ─── Slug ────────────────────────────────────────────────────────────────────

export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}
