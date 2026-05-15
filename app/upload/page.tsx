import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import UploadForm from './upload-form';

interface PageProps {
  searchParams: Promise<{ update_app_id?: string }>;
}

export default async function UploadPage({ searchParams }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Pass resolved searchParams to the client form
  const params = await searchParams;

  return <UploadForm updateAppId={params.update_app_id} />;
}
