'use client';

import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignoutButton() {
  const router = useRouter();

  async function handleSignout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  }

  return (
    <button
      data-testid="signout"
      onClick={handleSignout}
      className="px-2.5 py-1.5 rounded-8 text-xs transition-colors hover:text-white"
      style={{
        color: 'var(--text-muted)',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontFamily: 'inherit',
      }}
    >
      Sign out
    </button>
  );
}
