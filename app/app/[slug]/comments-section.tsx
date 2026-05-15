'use client';

import { useEffect, useState } from 'react';
import type { Comment } from '@/types';

interface Props {
  appId: string;
  userId: string | null;
}

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

function Avatar({ username }: { username: string }) {
  return (
    <div
      className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
      style={{
        background: 'linear-gradient(135deg, var(--electric-blue) 0%, #0075a8 100%)',
        color: 'var(--bg-0)',
        fontWeight: 700,
      }}
    >
      {username[0]?.toUpperCase() ?? '?'}
    </div>
  );
}

export default function CommentsSection({ appId, userId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState('');
  const [reportedIds, setReportedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch(`/api/comments?app_id=${appId}`)
      .then((r) => r.json())
      .then((data) => {
        setComments(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [appId]);

  async function handlePost(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setPosting(true);
    setPostError('');

    const res = await fetch('/api/comments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, body: body.trim() }),
    });

    if (res.ok) {
      const newComment = await res.json();
      setComments((prev) => [...prev, newComment]);
      setBody('');
    } else {
      const json = await res.json().catch(() => ({}));
      setPostError(json.error ?? 'Failed to post');
    }
    setPosting(false);
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/comments/${id}`, { method: 'DELETE' });
    if (res.ok || res.status === 204) {
      setComments((prev) => prev.filter((c) => c.id !== id));
    }
  }

  async function handleReport(id: string) {
    await fetch(`/api/comments/${id}?action=report`, { method: 'POST' });
    setReportedIds((prev) => new Set([...prev, id]));
  }

  return (
    <section>
      <h2
        className="text-sm font-semibold mb-4"
        style={{ color: 'var(--text-secondary)', fontWeight: 590, letterSpacing: '-0.01em' }}
      >
        Comments{comments.length > 0 && <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}> · {comments.length}</span>}
      </h2>

      {/* Comment list */}
      {loading ? (
        <div className="flex flex-col gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-14 rounded-10 animate-pulse"
              style={{ background: 'var(--bg-2)' }}
            />
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          No comments yet. Be the first.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {comments.map((c) => {
            const username = c.profile?.username ?? 'anonymous';
            const isOwn = c.user_id === userId;
            return (
              <div
                key={c.id}
                className="flex gap-3 group"
              >
                <Avatar username={username} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span
                      className="text-xs font-medium"
                      style={{ color: 'var(--text-secondary)', fontWeight: 510 }}
                    >
                      {c.profile?.display_name ?? username}
                    </span>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {relativeTime(c.created_at)}
                    </span>
                  </div>
                  <p
                    className="text-sm leading-relaxed"
                    style={{ color: 'var(--text-secondary)', wordBreak: 'break-word' }}
                  >
                    {c.body}
                  </p>
                  {/* Comment actions */}
                  <div className="flex items-center gap-3 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {isOwn ? (
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="text-[10px] transition-colors hover:text-red-400"
                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
                      >
                        Delete
                      </button>
                    ) : userId ? (
                      <button
                        onClick={() => handleReport(c.id)}
                        disabled={reportedIds.has(c.id)}
                        className="text-[10px] transition-colors hover:text-yellow-400"
                        style={{ color: 'var(--text-muted)', background: 'none', border: 'none', cursor: reportedIds.has(c.id) ? 'default' : 'pointer', padding: 0, fontFamily: 'inherit', opacity: reportedIds.has(c.id) ? 0.5 : 1 }}
                      >
                        {reportedIds.has(c.id) ? 'Reported' : 'Report'}
                      </button>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Post form */}
      <div className="mt-5" style={{ borderTop: '1px solid var(--border-1)', paddingTop: 20 }}>
        {userId ? (
          <form onSubmit={handlePost} className="flex flex-col gap-2">
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Add a comment…"
              rows={3}
              maxLength={2000}
              className="text-sm rounded-8"
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--border-2)',
                color: 'var(--text-primary)',
                padding: '9px 12px',
                resize: 'none',
                outline: 'none',
                fontFamily: 'inherit',
                lineHeight: 1.6,
                width: '100%',
                transition: 'border-color 0.15s ease',
              }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'var(--border-3)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'var(--border-2)'; }}
            />
            {postError && (
              <p className="text-[11px]" style={{ color: '#ff6b6b' }}>{postError}</p>
            )}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={posting || !body.trim()}
                className="text-xs px-4 py-2 rounded-8 font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
                style={{
                  background: 'var(--neon-green)',
                  color: 'var(--bg-0)',
                  border: 'none',
                  cursor: posting || !body.trim() ? 'not-allowed' : 'pointer',
                  fontFamily: 'inherit',
                  fontWeight: 590,
                  letterSpacing: '-0.01em',
                }}
              >
                {posting ? 'Posting…' : 'Post'}
              </button>
            </div>
          </form>
        ) : (
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
            <a href="/login" style={{ color: 'var(--electric-blue)', textDecoration: 'none' }}>
              Sign in
            </a>{' '}
            to leave a comment.
          </p>
        )}
      </div>
    </section>
  );
}
