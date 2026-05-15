import type { AppVersion } from '@/types';

interface Props {
  versions: AppVersion[];
  appId: string;
}

const scanBadge = (status: AppVersion['scan_status']) => {
  if (status === 'clean') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px]"
        style={{ background: 'rgba(0,255,135,0.08)', color: 'var(--neon-green)', border: '1px solid rgba(0,255,135,0.15)' }}
      >
        Clean
      </span>
    );
  }
  if (status === 'flagged') {
    return (
      <span
        className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px]"
        style={{ background: 'rgba(255,107,107,0.08)', color: '#ff6b6b', border: '1px solid rgba(255,107,107,0.15)' }}
      >
        Flagged
      </span>
    );
  }
  return (
    <span
      className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-[4px]"
      style={{ background: 'rgba(250,200,0,0.07)', color: '#fac800', border: '1px solid rgba(250,200,0,0.15)' }}
    >
      Pending
    </span>
  );
};

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function VersionHistory({ versions, appId }: Props) {
  if (versions.length === 0) return null;

  return (
    <section className="mt-12">
      <h2
        className="text-base font-heading mb-4"
        style={{ color: 'var(--text-primary)', fontWeight: 660, letterSpacing: '-0.02em' }}
      >
        Version history
        <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: 13 }}> · {versions.length}</span>
      </h2>

      <div
        className="rounded-12 overflow-hidden"
        style={{ border: '1px solid var(--border-1)' }}
      >
        <table className="w-full text-xs" style={{ borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-1)', background: 'var(--bg-1)' }}>
              {['Version', 'Scan', 'Changelog', 'Date', ''].map((h) => (
                <th
                  key={h}
                  className="px-4 py-2.5 text-left"
                  style={{ color: 'var(--text-muted)', fontWeight: 590, letterSpacing: '0.05em', fontSize: 10, textTransform: 'uppercase' }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {versions.map((v, i) => (
              <tr
                key={v.id}
                style={{
                  borderBottom: i < versions.length - 1 ? '1px solid var(--border-1)' : 'none',
                  background: i % 2 === 0 ? 'var(--bg-0)' : 'var(--bg-1)',
                }}
              >
                <td className="px-4 py-3" style={{ color: 'var(--text-primary)', fontFamily: 'monospace', fontWeight: 500 }}>
                  v{v.version_number}
                </td>
                <td className="px-4 py-3">
                  {scanBadge(v.scan_status)}
                </td>
                <td
                  className="px-4 py-3 max-w-[320px]"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  {v.changelog ? (
                    <span className="line-clamp-2">{v.changelog}</span>
                  ) : (
                    <span style={{ color: 'var(--text-muted)', fontStyle: 'italic' }}>No notes</span>
                  )}
                </td>
                <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'var(--text-muted)' }}>
                  {formatDate(v.created_at)}
                </td>
                <td className="px-4 py-3">
                  {v.scan_status === 'clean' && (
                    <a
                      href={`/api/download/${appId}?v=${v.id}`}
                      download
                      className="text-[10px] transition-opacity hover:opacity-70"
                      style={{ color: 'var(--electric-blue)', textDecoration: 'none', fontWeight: 510 }}
                    >
                      ↓ Download
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
