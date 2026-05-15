'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { createClient, createServiceClient } from '@/lib/supabase/server';

const AVATARS_BUCKET = process.env.APP_AVATARS_BUCKET ?? 'avatars';
const MAX_AVATAR_BYTES = 5 * 1024 * 1024;

function cleanString(value: FormDataEntryValue | null, max: number) {
  const text = typeof value === 'string' ? value.trim() : '';
  return text.slice(0, max);
}

function profileRedirect(params: Record<string, string>) {
  const query = new URLSearchParams(params);
  redirect(`/profile?${query.toString()}`);
}

export async function updateProfile(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const username = cleanString(formData.get('username'), 32).toLowerCase();
  const displayName = cleanString(formData.get('display_name'), 80);
  const bio = cleanString(formData.get('bio'), 240);
  let avatarUrl = cleanString(formData.get('avatar_url'), 500);
  const avatarFile = formData.get('avatar_file');

  if (!/^[a-z0-9_]{3,32}$/.test(username)) {
    profileRedirect({ error: 'Username must be 3-32 characters using letters, numbers, or underscores.' });
  }

  const service = createServiceClient();

  if (avatarFile instanceof File && avatarFile.size > 0) {
    if (!avatarFile.type.startsWith('image/')) {
      profileRedirect({ error: 'Profile picture must be an image file.' });
    }
    if (avatarFile.size > MAX_AVATAR_BYTES) {
      profileRedirect({ error: 'Profile picture must be 5 MB or smaller.' });
    }

    const extension = avatarFile.name.split('.').pop()?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'png';
    const path = `${user.id}/avatar-${Date.now()}.${extension}`;
    const { error: uploadError } = await service.storage
      .from(AVATARS_BUCKET)
      .upload(path, await avatarFile.arrayBuffer(), {
        contentType: avatarFile.type,
        upsert: true,
      });

    if (uploadError) profileRedirect({ error: uploadError.message });

    const { data } = service.storage.from(AVATARS_BUCKET).getPublicUrl(path);
    avatarUrl = data.publicUrl;
  }

  if (avatarUrl) {
    try {
      const url = new URL(avatarUrl);
      if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid protocol');
    } catch {
      profileRedirect({ error: 'Profile picture must be a valid image URL.' });
    }
  }

  const { error } = await service.from('profiles').upsert(
    {
      id: user.id,
      username,
      display_name: displayName || null,
      bio: bio || null,
      avatar_url: avatarUrl || null,
    },
    { onConflict: 'id' },
  );

  if (error) profileRedirect({ error: error.message });

  await supabase.auth.updateUser({
    data: {
      username,
      display_name: displayName || null,
      avatar_url: avatarUrl || null,
    },
  });

  revalidatePath('/profile');
  profileRedirect({ saved: 'profile' });
}

export async function updateEmail(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const email = cleanString(formData.get('email'), 254).toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    profileRedirect({ error: 'Enter a valid email address.' });
  }
  if (email === user.email?.toLowerCase()) {
    profileRedirect({ error: 'That email is already on your account.' });
  }

  const { error } = await supabase.auth.updateUser({ email });
  if (error) profileRedirect({ error: error.message });

  profileRedirect({ saved: 'email' });
}

export async function deleteAccount(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const confirmation = cleanString(formData.get('confirmation'), 16);
  if (confirmation !== 'DELETE') {
    profileRedirect({ error: 'Type DELETE to confirm account deletion.' });
  }

  const service = createServiceClient();
  const { error } = await service.auth.admin.deleteUser(user.id);
  if (error) profileRedirect({ error: error.message });

  await supabase.auth.signOut();
  redirect('/?account=deleted');
}
