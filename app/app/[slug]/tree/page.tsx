import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import AppShell from '@/components/AppShell';

interface Props {
  params: Promise<{ slug: string }>;
}

interface TreeApp {
  id: string;
  slug: string;
  title: string;
  status: string;
  scan_status: string;
  remix_count: number;
  children?: TreeApp[];
}

async function fetchChildren(
  supabase: Awaited<ReturnType<typeof createClient>>,
  parentId: string,
): Promise<TreeApp[]> {
  const { data } = await supabase
    .from('apps')
    .select('id, slug, title, status, scan_status, remix_count')
    .eq('parent_id', parentId)
    .eq('status', 'active')
    .eq('scan_status', 'clean')
    .order('created_at', { ascending: true });

  if (!data?.length) return [];

  return Promise.all(
    data.map(async (app) => ({
      ...app,
      children: await fetchChildren(supabase, app.id),
    })),
  );
}

function TreeNode({ app, depth = 0 }: { app: TreeApp; depth?: number }) {
  return (
    <li>
      <div
        data-testid="tree-node"
        data-slug={app.slug}
        className="flex items-center gap-2 py-1.5"
        style={{ paddingLeft: `${depth * 20}px` }}
      >
        {depth > 0 && (
          <span
            className="text-xs select-none"
            style={{ color: 'var(--border-3)', fontFamily: 'var(--font-mono)' }}
          >
            └─
          </span>
        )}
        <Link
          href={`/app/${app.slug}`}
          className="text-xs transition-colors hover:text-white"
          style={{ color: 'var(--electric-blue)', textDecoration: 'none' }}
        >
          {app.title}
        </Link>
        {app.remix_count > 0 && (
          <span
            className="text-[10px] px-1.5 py-0.5 rounded"
            style={{
              background: 'rgba(155, 92, 255, 0.1)',
              color: 'var(--purple)',
            }}
          >
            {app.remix_count} remix{app.remix_count !== 1 ? 'es' : ''}
          </span>
        )}
      </div>
      {app.children && app.children.length > 0 && (
        <ul>
          {app.children.map((child) => (
            <TreeNode key={child.id} app={child} depth={depth + 1} />
          ))}
        </ul>
      )}
    </li>
  );
}

export default async function RemixTreePage({ params }: Props) {
  const { slug } = await params;
  const supabase = await createClient();

  const { data: thisApp } = await supabase
    .from('apps')
    .select('id, slug, title, status, scan_status, remix_count, parent_id')
    .eq('slug', slug)
    .single();

  if (!thisApp) notFound();

  // Walk up to root ancestor
  let rootId = thisApp.id;
  let parentId = thisApp.parent_id;
  while (parentId) {
    const { data: parent } = await supabase
      .from('apps')
      .select('id, parent_id')
      .eq('id', parentId)
      .single();
    if (!parent) break;
    rootId = parent.id;
    parentId = parent.parent_id;
  }

  const { data: root } = await supabase
    .from('apps')
    .select('id, slug, title, status, scan_status, remix_count')
    .eq('id', rootId)
    .single();

  if (!root) notFound();

  const children = await fetchChildren(supabase, root.id);
  const tree: TreeApp = { ...root, children };

  return (
    <AppShell>
      <div className="px-6 py-6 max-w-[680px]">
        {/* Breadcrumb */}
        <nav
          className="flex items-center gap-1.5 text-xs mb-6"
          style={{ color: 'var(--text-muted)' }}
        >
          <Link
            href="/"
            className="transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            Discover
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <Link
            href={`/app/${slug}`}
            className="transition-colors hover:text-white"
            style={{ color: 'var(--text-muted)', textDecoration: 'none' }}
          >
            {slug}
          </Link>
          <span style={{ opacity: 0.4 }}>/</span>
          <span style={{ color: 'var(--text-tertiary)' }}>Remix tree</span>
        </nav>

        <h1
          className="text-xl font-heading mb-6"
          style={{
            color: 'var(--text-primary)',
            fontWeight: 680,
            letterSpacing: '-0.02em',
          }}
        >
          Remix tree
        </h1>

        <div
          className="rounded-12 p-5"
          style={{
            background: 'var(--bg-1)',
            border: '1px solid var(--border-1)',
          }}
        >
          <ul data-testid="remix-tree" className="space-y-0.5 list-none p-0">
            <TreeNode app={tree} depth={0} />
          </ul>
        </div>
      </div>
    </AppShell>
  );
}
