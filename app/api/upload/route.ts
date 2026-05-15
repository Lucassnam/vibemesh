import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import {
  uploadSchema,
  assertValidZip,
  assertValidScreenshot,
  assertValidZipContents,
  slugify,
  PREVIEWS_BUCKET,
} from '@/lib/validations';
import { randomBytes } from 'node:crypto';

const ZIP_BUCKET = process.env.APP_ZIP_BUCKET ?? 'app-zips';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Parse multipart form
  let formData: FormData;
  try {
    formData = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const title = formData.get('title') as string | null;
  const tagline = formData.get('tagline') as string | null;
  const description = formData.get('description') as string | null;
  const howToRun = formData.get('how_to_run') as string | null;
  const demoUrl = formData.get('demo_url') as string | null;
  const tagsRaw = formData.get('tags') as string | null;
  const parentId = formData.get('parent_id') as string | null;
  const parentVersionId = formData.get('parent_version_id') as string | null;
  const updateAppId = formData.get('update_app_id') as string | null;
  const changelog = formData.get('changelog') as string | null;
  const remixNotes = formData.get('remix_notes') as string | null;
  const zipFile = formData.get('zip') as File | null;

  // Collect up to 5 screenshots (screenshot_0 … screenshot_4)
  const screenshotFiles: File[] = [];
  for (let i = 0; i < 5; i++) {
    const f = formData.get(`screenshot_${i}`) as File | null;
    if (f && f.size > 0) screenshotFiles.push(f);
  }

  // Validate fields server-side (client validation is UX only)
  let tags: string[] = [];
  try {
    tags = tagsRaw ? JSON.parse(tagsRaw) : [];
  } catch {
    return NextResponse.json({ error: 'Invalid tags format' }, { status: 400 });
  }

  const parsed = uploadSchema.safeParse({
    title,
    tagline: tagline ?? undefined,
    description,
    how_to_run: howToRun ?? undefined,
    demo_url: demoUrl || undefined,
    tags,
    parent_id: parentId ?? undefined,
    parent_version_id: parentVersionId ?? undefined,
    update_app_id: updateAppId ?? undefined,
    changelog: changelog ?? undefined,
    remix_notes: remixNotes ?? undefined,
  });

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  if (!zipFile) {
    return NextResponse.json({ error: 'No zip file provided' }, { status: 400 });
  }

  // Block invalid zips server-side
  try {
    assertValidZip(zipFile);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid zip' },
      { status: 400 },
    );
  }

  // Validate zip contents (allowlist + zipbomb protection)
  try {
    const zipBytes = await zipFile.arrayBuffer();
    await assertValidZipContents(zipBytes);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Invalid zip contents' },
      { status: 400 },
    );
  }

  // Validate screenshots server-side
  for (const img of screenshotFiles) {
    try {
      assertValidScreenshot(img);
    } catch (err: unknown) {
      return NextResponse.json(
        { error: err instanceof Error ? err.message : 'Invalid screenshot' },
        { status: 400 },
      );
    }
  }

  const svc = createServiceClient();

  // ── RE-UPLOAD: new version for an existing app ─────────────────────────────
  if (parsed.data.update_app_id) {
    const { data: existingApp } = await supabase
      .from('apps')
      .select('id, slug, creator_id')
      .eq('id', parsed.data.update_app_id)
      .single();

    if (!existingApp) {
      return NextResponse.json({ error: 'Blueprint not found' }, { status: 404 });
    }
    if (existingApp.creator_id !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Auto-increment version number
    const { data: latestVersion } = await supabase
      .from('app_versions')
      .select('version_number')
      .eq('app_id', existingApp.id)
      .order('version_number', { ascending: false })
      .limit(1)
      .maybeSingle();

    const nextVersionNumber = (latestVersion?.version_number ?? 0) + 1;
    const zipPath = `${user.id}/${existingApp.slug}-v${nextVersionNumber}.zip`;

    // Upload new zip (use authenticated user client — matches storage RLS)
    const zipBytes = await zipFile.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from(ZIP_BUCKET)
      .upload(zipPath, zipBytes, { contentType: 'application/zip', upsert: false });

    if (storageError) {
      return NextResponse.json(
        { error: `Storage upload failed: ${storageError.message}` },
        { status: 500 },
      );
    }

    // Parse packages from zip
    let packages: Record<string, string> = {};
    try {
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(zipBytes);
      const pkgFile = zip.file(/package\.json/i)[0];
      if (pkgFile) {
        const pkg = JSON.parse(await pkgFile.async('text'));
        packages = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
      }
    } catch {
      // non-fatal
    }

    // Insert app_versions row with clean status (content was validated)
    const { error: versionError } = await svc.from('app_versions').insert({
      app_id: existingApp.id,
      version_number: nextVersionNumber,
      zip_path: zipPath,
      changelog: parsed.data.changelog ?? null,
      scan_status: 'clean',
    });

    if (versionError) {
      await supabase.storage.from(ZIP_BUCKET).remove([zipPath]);
      return NextResponse.json(
        { error: `Version insert failed: ${versionError.message}` },
        { status: 500 },
      );
    }

    // Upload new screenshots if provided
    let screenshotUrls: string[] | undefined;
    if (screenshotFiles.length > 0) {
      screenshotUrls = await uploadScreenshots(svc, existingApp.slug, screenshotFiles);
    }

    // Update app metadata and set to active (content was validated)
    const updatePayload: Record<string, unknown> = {
      title: parsed.data.title,
      tagline: parsed.data.tagline ?? null,
      description: parsed.data.description,
      how_to_run: parsed.data.how_to_run ?? null,
      demo_url: parsed.data.demo_url || null,
      tags: parsed.data.tags,
      packages,
      status: 'active',
      scan_status: 'clean',
    };
    if (screenshotUrls) {
      updatePayload.screenshots = screenshotUrls;
      updatePayload.preview_url = screenshotUrls[0];
    }

    await svc.from('apps').update(updatePayload).eq('id', existingApp.id);

    return NextResponse.json({ id: existingApp.id, slug: existingApp.slug }, { status: 201 });
  }

  // ── NEW UPLOAD ─────────────────────────────────────────────────────────────

  // Derive a unique slug
  let slug = slugify(parsed.data.title);
  const { data: existing } = await supabase
    .from('apps')
    .select('id')
    .eq('slug', slug)
    .maybeSingle();

  if (existing) {
    slug = `${slug}-${randomBytes(3).toString('hex')}`;
  }

  // Parse package.json from zip
  let packages: Record<string, string> = {};
  const zipBytes = await zipFile.arrayBuffer();
  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(zipBytes);
    const pkgFile = zip.file(/package\.json/i)[0];
    if (pkgFile) {
      const pkg = JSON.parse(await pkgFile.async('text'));
      packages = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
    }
  } catch {
    // non-fatal
  }

  // Upload zip to private storage (use authenticated user client — matches storage RLS)
  const zipPath = `${user.id}/${slug}.zip`;
  const { error: storageError } = await supabase.storage
    .from(ZIP_BUCKET)
    .upload(zipPath, zipBytes, { contentType: 'application/zip', upsert: false });

  if (storageError) {
    return NextResponse.json(
      { error: `Storage upload failed: ${storageError.message}` },
      { status: 500 },
    );
  }

  // Resolve root_id for remixes
  let rootId: string | null = null;
  if (parsed.data.parent_id) {
    const { data: parent } = await supabase
      .from('apps')
      .select('root_id')
      .eq('id', parsed.data.parent_id)
      .maybeSingle();
    rootId = parent?.root_id ?? parsed.data.parent_id;
  }

  // Insert app row (with status='active' and scan_status='clean' after content validation passes)
  const { data: app, error: insertError } = await svc
    .from('apps')
    .insert({
      slug,
      title: parsed.data.title,
      tagline: parsed.data.tagline ?? null,
      description: parsed.data.description,
      how_to_run: parsed.data.how_to_run ?? null,
      demo_url: parsed.data.demo_url || null,
      tags: parsed.data.tags,
      status: 'active',
      scan_status: 'clean',
      download_count: 0,
      remix_count: 0,
      parent_id: parsed.data.parent_id ?? null,
      root_id: rootId,
      parent_version_id: parsed.data.parent_version_id ?? null,
      creator_id: user.id,
      zip_path: zipPath,
      packages,
      screenshots: [],
    })
    .select('id, slug')
    .single();

  if (insertError || !app) {
    await supabase.storage.from(ZIP_BUCKET).remove([zipPath]);
    return NextResponse.json(
      { error: `Database insert failed: ${insertError?.message ?? 'unknown'}` },
      { status: 500 },
    );
  }

  // Insert first app_versions row (with scan_status='clean' since content was validated)
  await svc.from('app_versions').insert({
    app_id: app.id,
    version_number: 1,
    zip_path: zipPath,
    changelog: null,
    scan_status: 'clean',
  });

  // Increment remix_count on the immediate parent when this is a remix and active
  if (parsed.data.parent_id) {
    const { data: parent } = await svc.from('apps').select('remix_count').eq('id', parsed.data.parent_id).single();
    if (parent) {
      await svc.from('apps').update({ remix_count: (parent.remix_count ?? 0) + 1 }).eq('id', parsed.data.parent_id);
    }
  }

  // Upload screenshots to the public previews bucket
  if (screenshotFiles.length > 0) {
    const screenshotUrls = await uploadScreenshots(svc, app.slug, screenshotFiles);
    if (screenshotUrls.length > 0) {
      await svc.from('apps').update({
        screenshots: screenshotUrls,
        preview_url: screenshotUrls[0]
      }).eq('id', app.id);
    }
  }

  return NextResponse.json({ id: app.id, slug: app.slug }, { status: 201 });
}

async function uploadScreenshots(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  svc: any,
  slug: string,
  files: File[],
): Promise<string[]> {
  const urls: string[] = [];
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = file.name.split('.').pop() ?? 'jpg';
    const path = `${slug}/screenshot-${i}.${ext}`;
    const bytes = await file.arrayBuffer();
    const { error } = await svc.storage
      .from(PREVIEWS_BUCKET)
      .upload(path, bytes, { contentType: file.type, upsert: true });
    if (!error) {
      const { data } = svc.storage.from(PREVIEWS_BUCKET).getPublicUrl(path);
      if (data?.publicUrl) urls.push(data.publicUrl);
    }
  }
  return urls;
}
