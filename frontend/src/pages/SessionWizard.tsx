import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { loadQuestionSet } from '../config/questionSet';
import { api } from '../api/client';
import type { QuestionSetConfig, AnswerEntry, Session } from '../types/models';

export function SessionWizard() {
  const { caseId, sessionId } = useParams<{ caseId: string; sessionId: string }>();
  const [questionSet, setQuestionSet] = useState<QuestionSetConfig | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [entries, setEntries] = useState<AnswerEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [operatorMode, setOperatorMode] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  /* Per-question input state (draft only) */
  const [q1Draft, setQ1Draft] = useState('');
  const [multiDrafts, setMultiDrafts] = useState<Record<string, string>>({ Q2: '', Q3: '', Q4: '', Q5: '' });
  const [saving, setSaving] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const refreshEntries = () => {
    if (!sessionId) return;
    api.entries.list(sessionId).then(setEntries);
  };

  useEffect(() => {
    loadQuestionSet().then(setQuestionSet).catch((e) => setError(e.message));
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    Promise.all([api.sessions.get(sessionId), api.entries.list(sessionId)])
      .then(([s, e]) => {
        setSession(s);
        setEntries(e);
        const q1 = e.find((x) => x.question_id === 'Q1');
        if (q1) setQ1Draft(q1.text);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [sessionId]);

  const isFinalized = session?.status === 'finalized';

  const getEntryForQuestion = (questionId: string): AnswerEntry[] => {
    return entries.filter((e) => e.question_id === questionId);
  };

  const handleSaveQ1 = () => {
    if (!sessionId || isFinalized) return;
    setSaving('Q1');
    const q1Entry = getEntryForQuestion('Q1')[0];
    const doSave = () =>
      api.entries.create(sessionId, { question_id: 'Q1', text: q1Draft.trim() }).then(() => {
        refreshEntries();
        setSaving(null);
      });
    if (q1Entry) {
      api.entries.delete(sessionId, q1Entry.entry_id).then(doSave).catch((e) => {
        setError(e.message);
        setSaving(null);
      });
    } else {
      doSave().catch((e) => {
        setError(e.message);
        setSaving(null);
      });
    }
  };

  const handleAddEntry = (questionId: string) => {
    if (!sessionId || isFinalized) return;
    const text = (multiDrafts[questionId] ?? '').trim();
    if (!text) return;
    setSaving(questionId);
    api.entries
      .create(sessionId, { question_id: questionId, text })
      .then(() => {
        setMultiDrafts((prev) => ({ ...prev, [questionId]: '' }));
        refreshEntries();
        setSaving(null);
      })
      .catch((e) => {
        setError(e.message);
        setSaving(null);
      });
  };

  const handleDeleteEntry = (entryId: string) => {
    if (!sessionId || isFinalized) return;
    setDeletingId(entryId);
    api.entries
      .delete(sessionId, entryId)
      .then(refreshEntries)
      .catch((e) => setError(e.message))
      .finally(() => setDeletingId(null));
  };

  const handleFinalize = () => {
    if (!sessionId) return;
    setFinalizing(true);
    api.artifacts
      .create(sessionId)
      .then((art) => (window.location.href = `/artifacts/${art.artifact_id}`))
      .catch((e) => {
        setError(e.message);
        setFinalizing(false);
      });
  };

  if (loading || !questionSet || !session) {
    return (
      <div className="page">
        <p className="muted">Loading…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <p className="error">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Cases</Link>
        <span style={{ color: 'var(--ary-muted)', margin: '0 0.25rem' }}>/</span>
        <Link to={`/cases/${caseId}`}>Case</Link>
        <span style={{ color: 'var(--ary-muted)', margin: '0 0.25rem' }}>/</span>
        <span>Session</span>
      </nav>

      <header className="page-header">
        <h1 className="page-title">Strategy session</h1>
        <p className="page-subtitle">
          Phase 1 — Fixed question protocol. Question set {questionSet.question_set_id} v{questionSet.version}.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.5rem' }}>
          <span className={session.status === 'finalized' ? 'badge badge-finalized' : 'badge badge-draft'}>
            {session.status}
          </span>
          {!isFinalized && (
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--ary-text-secondary)' }}>
              <input
                type="checkbox"
                checked={operatorMode}
                onChange={(e) => setOperatorMode(e.target.checked)}
              />
              Operator mode (accept/reject proposals)
            </label>
          )}
        </div>
      </header>

      {!isFinalized && (
        <p className="muted" style={{ marginBottom: '1.25rem' }}>
          Q1: single text. Q2–Q5: add one entry at a time. Verbatim capture only; proposals are non-authoritative.
        </p>
      )}

      {questionSet.questions.map((q) => (
        <section key={q.question_id} className="card">
          <h2 className="card-title">
            {q.question_id} — {q.purpose}
          </h2>
          <p style={{ margin: '0 0 0.75rem 0', color: 'var(--ary-text-secondary)', fontSize: '0.9375rem' }}>
            {q.prompt}
          </p>

          {q.answer_mode === 'single' ? (
            <>
              {isFinalized ? (
                <div className={getEntryForQuestion(q.question_id)[0]?.text ? 'verbatim' : 'verbatim verbatim-empty'}>
                  {getEntryForQuestion(q.question_id)[0]?.text ?? '—'}
                </div>
              ) : (
                <>
                  <textarea
                    className="form-group"
                    value={q1Draft}
                    onChange={(e) => setQ1Draft(e.target.value)}
                    placeholder="Enter strategy under consideration (verbatim)…"
                    rows={4}
                    style={{
                      width: '100%',
                      maxWidth: 'none',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--ary-border-strong)',
                      borderRadius: 'var(--ary-radius)',
                      background: 'var(--ary-surface)',
                      fontFamily: 'inherit',
                      resize: 'vertical',
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={handleSaveQ1}
                    disabled={saving === 'Q1' || !q1Draft.trim()}
                  >
                    {saving === 'Q1' ? 'Saving…' : 'Save'}
                  </button>
                </>
              )}
            </>
          ) : (
            <>
              {!isFinalized && (
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <input
                    type="text"
                    value={multiDrafts[q.question_id] ?? ''}
                    onChange={(e) => setMultiDrafts((prev) => ({ ...prev, [q.question_id]: e.target.value }))}
                    placeholder="Add one factor (verbatim)…"
                    style={{
                      flex: '1',
                      minWidth: '12rem',
                      padding: '0.5rem 0.75rem',
                      border: '1px solid var(--ary-border-strong)',
                      borderRadius: 'var(--ary-radius)',
                    }}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddEntry(q.question_id))}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => handleAddEntry(q.question_id)}
                    disabled={saving === q.question_id || !(multiDrafts[q.question_id] ?? '').trim()}
                  >
                    {saving === q.question_id ? 'Adding…' : 'Add entry'}
                  </button>
                </div>
              )}
              <ul className="list-plain">
                {getEntryForQuestion(q.question_id).length === 0 ? (
                  <li className="verbatim verbatim-empty">—</li>
                ) : (
                  getEntryForQuestion(q.question_id).map((e) => (
                    <li
                      key={e.entry_id}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-start',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        listStyle: 'none',
                      }}
                    >
                      <span className="verbatim" style={{ flex: 1, margin: 0 }}>{e.text}</span>
                      {!isFinalized && (
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ flexShrink: 0 }}
                          onClick={() => handleDeleteEntry(e.entry_id)}
                          disabled={deletingId === e.entry_id}
                        >
                          {deletingId === e.entry_id ? '…' : 'Delete'}
                        </button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </>
          )}
        </section>
      ))}

      {!isFinalized && (
        <section className="card">
          <h2 className="card-title">Finalize</h2>
          <p className="muted" style={{ marginBottom: '1rem' }}>
            Lock the session and generate an immutable strategy artifact. No further edits after this.
          </p>
          <button
            type="button"
            className="btn btn-success"
            onClick={handleFinalize}
            disabled={finalizing}
          >
            {finalizing ? 'Finalizing…' : 'Finalize & generate artifact'}
          </button>
        </section>
      )}
    </div>
  );
}
