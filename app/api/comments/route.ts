import { NextRequest, NextResponse } from 'next/server';
import { createClient, createServiceClient } from '@/lib/supabase/server';
import { commentSchema } from '@/lib/validations';

export async function GET(req: NextRequest) {
  const appId = req.nextUrl.searchParams.get('app_id');
  if (!appId) {
    return NextResponse.json({ error: 'app_id required' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('comments')
    .select('id, app_id, user_id, body, created_at, deleted_at, profile:profiles!user_id(username, display_name, avatar_url)')
    .eq('app_id', appId)
    .is('deleted_at', null)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch comments' }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Sign in to post a comment' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = commentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // Verify the app exists and is active
  const { data: app } = await supabase
    .from('apps')
    .select('id')
    .eq('id', parsed.data.app_id)
    .eq('status', 'active')
    .eq('scan_status', 'clean')
    .maybeSingle();

  if (!app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  const svc = createServiceClient();
  const { data: comment, error: insertError } = await svc
    .from('comments')
    .insert({
      app_id: parsed.data.app_id,
      user_id: user.id,
      body: parsed.data.body,
    })
    .select('id, app_id, user_id, body, created_at, deleted_at, profile:profiles!user_id(username, display_name, avatar_url)')
    .single();

  if (insertError || !comment) {
    return NextResponse.json({ error: 'Failed to post comment' }, { status: 500 });
  }

  return NextResponse.json(comment, { status: 201 });
}
