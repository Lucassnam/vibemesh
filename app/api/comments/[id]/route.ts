import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';

// Soft delete — only the comment owner can delete their own comment
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('id, user_id')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  if (comment.user_id !== user.id) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const svc = createServiceClient();
  await svc
    .from('comments')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id);

  return new NextResponse(null, { status: 204 });
}

// Flag a comment for review
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const action = req.nextUrl.searchParams.get('action');
  if (action !== 'report') {
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Sign in to report a comment' }, { status: 401 });
  }

  const { data: comment } = await supabase
    .from('comments')
    .select('id')
    .eq('id', id)
    .is('deleted_at', null)
    .maybeSingle();

  if (!comment) {
    return NextResponse.json({ error: 'Comment not found' }, { status: 404 });
  }

  const svc = createServiceClient();
  // Upsert so double-reporting is idempotent
  await svc.from('comment_reports').upsert(
    { comment_id: id, reporter_id: user.id },
    { onConflict: 'comment_id,reporter_id', ignoreDuplicates: true },
  );

  return NextResponse.json({ ok: true });
}
