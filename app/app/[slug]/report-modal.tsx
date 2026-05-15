'use client';

import { useState } from 'react';

interface Props {
  appId: string;
  userId: string | null;
}

export default function ReportModal({ appId, userId }: Props) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('spam');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  if (!userId) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');

    const res = await fetch('/api/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ app_id: appId, reason, notes }),
    });

    if (res.ok) {
      setStatus('done');
    } else {
      const json = await res.json().catch(() => ({}));
      setErrorMsg(json.error ?? 'Report failed');
      setStatus('error');
    }
  }

  const inputStyle = {
    background: 'var(--bg-0)',
    border: '1px solid var(--border-2)',
    borderRadius: '8px',
    padding: '8px 12px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    width: '100%',
    outline: 'none',
    fontFamily: 'inherit',
  };

  return (
    <>
      <button
        data-testid="report-btn"
        onClick={() => setOpen(true)}
        className="px-3 py-1.5 rounded-8 text-xs transition-all hover:opacity-80"
        style={{
          border: '1px solid var(--border-2)',
          color: 'var(--text-muted)',
          background: 'transparent',
          cursor: 'pointer',
          fontFamily: 'inherit',
        }}
      >
        Report
      </button>

      {open && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50 p-4"
          style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(false); }}
        >
          <div
            className="w-full max-w-sm rounded-16 p-6"
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--border-2)',
              boxShadow: '0px 24px 48px rgba(0,0,0,0.5)',
            }}
          >
            {status === 'done' ? (
              <div className="text-center py-4">
                <div
                  className="w-10 h-10 rounded-12 flex items-center justify-center mx-auto mb-3"
                  style={{ background: 'rgba(0,255,135,0.1)', border: '1px solid rgba(0,255,135,0.2)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ color: 'var(--neon-green)' }}>
                    <path d="M3 8l3.5 3.5L13 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p
                  className="text-sm font-semibold mb-1"
                  style={{ color: 'var(--text-primary)', fontWeight: 590 }}
                >
                  Report submitted
                </p>
                <p className="text-xs mb-4" style={{ color: 'var(--text-muted)' }}>
                  Our team will review this blueprint.
                </p>
                <button
                  onClick={() => { setOpen(false); setStatus('idle'); }}
                  className="text-xs px-4 py-2 rounded-8 transition-colors hover:opacity-80"
                  style={{
                    background: 'var(--bg-2)',
                    color: 'var(--text-secondary)',
                    border: '1px solid var(--border-1)',
                    cursor: 'pointer',
                    fontFamily: 'inherit',
                  }}
                >
                  Close
                </button>
              </div>
            ) : (
              <form onSubmit={submit} className="flex flex-col gap-4">
                <div className="flex items-center justify-between">
                  <h2
                    className="text-sm font-semibold"
                    style={{ color: 'var(--text-primary)', fontWeight: 590 }}
                  >
                    Report blueprint
                  </h2>
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-muted)',
                      padding: 4,
                      fontFamily: 'inherit',
                    }}
                  >
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="report-reason"
                    className="block text-xs mb-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Reason
                  </label>
                  <select
                    id="report-reason"
                    name="reason"
                    data-testid="report-reason"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    style={inputStyle}
                  >
                    <option value="spam">Spam</option>
                    <option value="malware">Malware</option>
                    <option value="copyright">Copyright violation</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="report-notes"
                    className="block text-xs mb-1.5"
                    style={{ color: 'var(--text-tertiary)' }}
                  >
                    Notes{' '}
                    <span style={{ color: 'var(--text-muted)' }}>(optional)</span>
                  </label>
                  <textarea
                    id="report-notes"
                    name="notes"
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ ...inputStyle, resize: 'none' }}
                  />
                </div>

                {status === 'error' && (
                  <p className="text-xs" style={{ color: '#ff6b6b' }}>
                    {errorMsg}
                  </p>
                )}

                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="text-xs px-4 py-2 rounded-8 transition-colors hover:opacity-80"
                    style={{
                      color: 'var(--text-muted)',
                      background: 'var(--bg-2)',
                      border: '1px solid var(--border-1)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    data-testid="report-submit"
                    disabled={status === 'loading'}
                    className="text-xs px-4 py-2 rounded-8 transition-opacity hover:opacity-80 disabled:opacity-50"
                    style={{
                      background: 'rgba(255,107,107,0.15)',
                      color: '#ff6b6b',
                      border: '1px solid rgba(255,107,107,0.25)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      fontWeight: 510,
                    }}
                  >
                    {status === 'loading' ? 'Submitting…' : 'Submit report'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
