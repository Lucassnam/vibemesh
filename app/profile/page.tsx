import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';
import { deleteAccount, updateEmail, updateProfile } from './actions';

function StatusBadge({ status, scanStatus }: { status: string; scanStatus: string }) {
  if (status === 'active' && scanStatus === 'clean') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-6" style={{ background: 'rgba(37,99,235,0.08)', color: 'var(--electric-blue)', border: '1px solid rgba(37,99,235,0.15)', fontWeight: 510 }}>
        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: 'var(--electric-blue)' }} />
        Live
      </span>
    );
  }
  if (scanStatus === 'flagged' || status === 'flagged') {
    return (
      <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-6" style={{ background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.15)', fontWeight: 510 }}>
        <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#ff6b6b' }} />
        Flagged
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-6" style={{ background: 'rgba(245,158,11,0.08)', color: '#b45309', border: '1px solid rgba(245,158,11,0.18)', fontWeight: 510 }}>
      <span className="w-1 h-1 rounded-full flex-shrink-0" style={{ background: '#f59e0b', opacity: 0.8 }} />
      Pending scan
    </span>
  );
}

function Field({
  id,
  label,
  hint,
  children,
}: {
  id: string;
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label htmlFor={id} className="block">
      <span className="block text-xs mb-1.5" style={{ color: 'var(--text-tertiary)', fontWeight: 560 }}>
        {label}
      </span>
      {children}
      {hint && (
        <span className="block text-[11px] mt-1.5" style={{ color: 'var(--text-muted)' }}>
          {hint}
        </span>
      )}
    </label>
  );
}

const inputStyle = {
  width: '100%',
  border: '1px solid var(--border-2)',
  background: '#fff',
  color: 'var(--text-primary)',
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  lineHeight: 1.45,
} as const;

interface PageProps {
  searchParams: Promise<{ saved?: string; error?: string }>;
}

export default async function ProfilePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const [{ data: apps }, { data: profile }] = await Promise.all([
    supabase
      .from('apps')
      .select('id, slug, title, description, status, scan_status, download_count, remix_count, created_at')
      .eq('creator_id', user.id)
      .order('created_at', { ascending: false }),
    supabase
      .from('profiles')
      .select('username, display_name, avatar_url, bio')
      .eq('id', user.id)
      .maybeSingle(),
  ]);

  const metadata = user.user_metadata ?? {};
  const username = profile?.username ?? metadata.username ?? user.email?.split('@')[0] ?? 'you';
  const displayName = profile?.display_name ?? metadata.display_name ?? '';
  const avatarUrl = profile?.avatar_url ?? metadata.avatar_url ?? '';
  const bio = profile?.bio ?? '';
  const publicName = displayName || username;
  const initial = publicName[0]?.toUpperCase() ?? 'U';
  const totalDownloads = apps?.reduce((sum, a) => sum + (a.download_count ?? 0), 0) ?? 0;
  const totalRemixes = apps?.reduce((sum, a) => sum + (a.remix_count ?? 0), 0) ?? 0;

  return (
    <AppShell>
      <div className="px-6 py-6 max-w-[1120px]">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold flex-shrink-0 overflow-hidden" style={{ background: 'linear-gradient(135deg, var(--electric-blue) 0%, #7c3aed 100%)', color: '#fff', fontWeight: 720 }}>
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={avatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                initial
              )}
            </div>
            <div>
              <h1 className="text-xl font-heading" style={{ color: 'var(--text-primary)', fontWeight: 720, letterSpacing: '-0.025em' }}>
                {publicName}
              </h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                @{username} · {user.email}
              </p>
              {bio && (
                <p className="text-sm mt-2 max-w-[520px]" style={{ color: 'var(--text-tertiary)', lineHeight: 1.55 }}>
                  {bio}
                </p>
              )}
            </div>
          </div>

          <Link href="/upload" className="flex items-center gap-1.5 px-3 py-2 rounded-8 text-xs transition-opacity hover:opacity-80 flex-shrink-0" style={{ background: 'var(--electric-blue)', color: '#fff', textDecoration: 'none', fontWeight: 590 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
              <path d="M5 1v8M1 5h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            Upload
          </Link>
        </div>

        {params.saved && (
          <div className="rounded-12 px-4 py-3 mb-5 text-sm" style={{ background: 'rgba(37,99,235,0.08)', border: '1px solid rgba(37,99,235,0.16)', color: 'var(--text-secondary)' }}>
            {params.saved === 'email' ? 'Check your inbox to confirm the email change.' : 'Profile settings saved.'}
          </div>
        )}
        {params.error && (
          <div className="rounded-12 px-4 py-3 mb-5 text-sm" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.18)', color: '#b91c1c' }}>
            {params.error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
          <div className="flex flex-col gap-6">
            {(apps?.length ?? 0) > 0 && (
              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: 'Blueprints', value: apps?.length ?? 0 },
                  { label: 'Downloads', value: totalDownloads.toLocaleString() },
                  { label: 'Remixes', value: totalRemixes.toLocaleString() },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-12 p-4" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}>
                    <div className="text-xl font-heading" style={{ color: 'var(--text-primary)', fontWeight: 680, letterSpacing: '-0.02em' }}>
                      {value}
                    </div>
                    <div className="text-xs mt-0.5" style={{ color: 'var(--text-muted)' }}>
                      {label}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <section>
              <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--text-muted)', fontWeight: 590 }}>
                Your Blueprints
              </h2>
              <div className="flex flex-col gap-2">
                {apps?.map((app) => (
                  <Link key={app.id} href={`/app/${app.slug}`} data-testid="app-card" data-slug={app.slug} className="group flex items-center justify-between gap-4 rounded-12 px-4 py-3.5 transition-all" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)', textDecoration: 'none' }}>
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-8 flex items-center justify-center text-xs font-bold flex-shrink-0" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)', color: 'var(--text-muted)', fontWeight: 680 }}>
                        {app.title[0]?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate" style={{ color: 'var(--text-primary)', fontWeight: 510, letterSpacing: '-0.01em' }}>
                          {app.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <StatusBadge status={app.status} scanStatus={app.scan_status} />
                        </div>
                      </div>
                    </div>
                    <div className="text-right text-[11px] flex-shrink-0" style={{ color: 'var(--text-muted)' }}>
                      <div>{app.download_count.toLocaleString()} downloads</div>
                      <div>{app.remix_count.toLocaleString()} remixes</div>
                    </div>
                  </Link>
                ))}

                {!apps?.length && (
                  <div className="flex flex-col items-center py-16 gap-3 rounded-12" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}>
                    <div className="w-12 h-12 rounded-16 flex items-center justify-center" style={{ background: 'var(--bg-2)', border: '1px solid var(--border-1)' }}>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style={{ color: 'var(--text-muted)' }}>
                        <rect x="3" y="3" width="14" height="14" rx="3" stroke="currentColor" strokeWidth="1.4" />
                        <path d="M10 7v6M7 10h6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
                      </svg>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-secondary)', fontWeight: 510 }}>
                        No blueprints yet
                      </p>
                      <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                        <Link href="/upload" style={{ color: 'var(--electric-blue)', textDecoration: 'none' }}>
                          Upload your first blueprint
                        </Link>{' '}
                        to get started.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </section>
          </div>

          <aside className="flex flex-col gap-4">
            <section className="rounded-12 p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}>
              <h2 className="text-sm mb-4" style={{ color: 'var(--text-primary)', fontWeight: 680 }}>
                Profile Settings
              </h2>
              <form action={updateProfile} className="flex flex-col gap-3">
                <Field id="display_name" label="Display name">
                  <input id="display_name" name="display_name" defaultValue={displayName} placeholder="Your public name" style={inputStyle} />
                </Field>
                <Field id="username" label="Username" hint="Letters, numbers, and underscores only.">
                  <input id="username" name="username" defaultValue={username} placeholder="username" style={inputStyle} />
                </Field>
                <Field id="avatar_file" label="Upload profile picture" hint="PNG, JPG, GIF, or WebP up to 5 MB.">
                  <input id="avatar_file" name="avatar_file" type="file" accept="image/*" style={{ ...inputStyle, padding: 8 }} />
                </Field>
                <Field id="avatar_url" label="Profile picture URL" hint="Optional fallback if you already host the image somewhere.">
                  <input id="avatar_url" name="avatar_url" defaultValue={avatarUrl} placeholder="https://..." style={inputStyle} />
                </Field>
                <Field id="bio" label="Bio">
                  <textarea id="bio" name="bio" defaultValue={bio} rows={3} placeholder="What do you build?" style={{ ...inputStyle, resize: 'vertical' }} />
                </Field>
                <button type="submit" className="rounded-8 px-3 py-2 text-sm transition-opacity hover:opacity-85" style={{ background: 'var(--electric-blue)', color: '#fff', border: 'none', fontWeight: 620 }}>
                  Save profile
                </button>
              </form>
            </section>

            <section className="rounded-12 p-5" style={{ background: 'var(--bg-1)', border: '1px solid var(--border-1)' }}>
              <h2 className="text-sm mb-4" style={{ color: 'var(--text-primary)', fontWeight: 680 }}>
                Email
              </h2>
              <form action={updateEmail} className="flex flex-col gap-3">
                <Field id="email" label="Email address" hint="Supabase may send a confirmation link before this changes.">
                  <input id="email" name="email" type="email" defaultValue={user.email ?? ''} style={inputStyle} />
                </Field>
                <button type="submit" className="rounded-8 px-3 py-2 text-sm transition-opacity hover:opacity-85" style={{ background: '#fff', color: 'var(--text-secondary)', border: '1px solid var(--border-2)', fontWeight: 620 }}>
                  Update email
                </button>
              </form>
            </section>

            <section className="rounded-12 p-5" style={{ background: 'rgba(239,68,68,0.05)', border: '1px solid rgba(239,68,68,0.18)' }}>
              <h2 className="text-sm mb-2" style={{ color: '#991b1b', fontWeight: 720 }}>
                Danger Zone
              </h2>
              <p className="text-xs mb-4" style={{ color: '#7f1d1d', lineHeight: 1.55 }}>
                Delete your account permanently. Type DELETE to confirm.
              </p>
              <form action={deleteAccount} className="flex flex-col gap-3">
                <input name="confirmation" placeholder="DELETE" style={{ ...inputStyle, borderColor: 'rgba(239,68,68,0.28)' }} />
                <button type="submit" className="rounded-8 px-3 py-2 text-sm transition-opacity hover:opacity-85" style={{ background: '#dc2626', color: '#fff', border: 'none', fontWeight: 680 }}>
                  Delete account
                </button>
              </form>
            </section>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}
