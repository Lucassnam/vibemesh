import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { reportSchema } from '@/lib/validations';

export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const parsed = reportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { app_id, reason, notes } = parsed.data;

  // Verify the app exists and is visible to this user
  const { data: app } = await supabase
    .from('apps')
    .select('id')
    .eq('id', app_id)
    .single();

  if (!app) {
    return NextResponse.json({ error: 'App not found' }, { status: 404 });
  }

  const { error: insertError } = await supabase.from('reports').insert({
    app_id,
    reporter_id: user.id,
    reason,
    notes: notes ?? null,
  });

  if (insertError) {
    // Deduplicate — don't let a user report the same app twice
    if (insertError.code === '23505') {
      return NextResponse.json({ error: 'Already reported' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Failed to submit report' }, { status: 500 });
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
