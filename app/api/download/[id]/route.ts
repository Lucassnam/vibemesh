import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const ZIP_BUCKET = process.env.APP_ZIP_BUCKET ?? 'app-zips';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();

  // Optional: caller can request a specific version via ?v=VERSION_ID
  const requestedVersionId = req.nextUrl.searchParams.get('v');

  // Verify the app passed the scan gate
  const { data: app, error } = await supabase
    .from('apps')
    .select('id, slug, zip_path, status, scan_status, download_count, current_version_id')
    .eq('id', id)
    .single();

  if (error || !app) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (app.status !== 'active' || app.scan_status !== 'clean') {
    return NextResponse.json({ error: 'Blueprint not available' }, { status: 403 });
  }

  let zipPath = app.zip_path; // fallback for apps without versioning

  if (requestedVersionId) {
    // Specific version requested — verify it belongs to this app and is clean
    const { data: version } = await supabase
      .from('app_versions')
      .select('zip_path, scan_status')
      .eq('id', requestedVersionId)
      .eq('app_id', app.id)
      .single();

    if (!version || version.scan_status !== 'clean') {
      return NextResponse.json({ error: 'Version not available' }, { status: 403 });
    }
    zipPath = version.zip_path;
  } else if (app.current_version_id) {
    // Use the current clean version's zip
    const { data: version } = await supabase
      .from('app_versions')
      .select('zip_path')
      .eq('id', app.current_version_id)
      .single();

    if (version) zipPath = version.zip_path;
  }

  // Service client for write operations (bypasses RLS)
  const svc = createServiceClient();

  // Increment download_count BEFORE returning the URL
  await svc
    .from('apps')
    .update({ download_count: (app.download_count ?? 0) + 1 })
    .eq('id', app.id);

  // Log the download — downloader_id is nullable (anonymous downloads are allowed)
  const {
    data: { user },
  } = await supabase.auth.getUser();

  await svc.from('downloads').insert({
    app_id: app.id,
    downloader_id: user?.id ?? null,
  });

  // Sign a short-lived URL from the private bucket
  const { data: signed, error: signError } = await svc.storage
    .from(ZIP_BUCKET)
    .createSignedUrl(zipPath, 60);

  if (signError || !signed) {
    return NextResponse.json({ error: 'Could not generate download URL' }, { status: 500 });
  }

  return NextResponse.redirect(signed.signedUrl);
}
