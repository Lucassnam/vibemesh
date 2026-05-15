import { notFound, redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UploadForm from '@/app/upload/upload-form';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function RemixPage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  const { data: parent } = await supabase
    .from('apps')
    .select('id, slug, title, tags, packages, status, scan_status, current_version_id')
    .eq('slug', slug)
    .single();

  if (!parent) notFound();
  if (parent.status !== 'active' || parent.scan_status !== 'clean') {
    redirect(`/app/${slug}`);
  }

  // Resolve the specific version the remix is forking from
  const parentVersionId: string | null = parent.current_version_id ?? null;

  // Serialize pre-fill data for the upload form
  const parentTags: string[] = parent.tags ?? [];
  const parentPackages: Record<string, string> = parent.packages ?? {};

  return (
    <UploadForm
      parentId={parent.id}
      parentSlug={parent.slug}
      parentVersionId={parentVersionId ?? undefined}
      parentTags={parentTags}
      parentPackages={parentPackages}
    />
  );
}
