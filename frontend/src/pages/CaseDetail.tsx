import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Case as CaseType, Session } from '../types/models';

export function CaseDetail() {
  const { caseId } = useParams<{ caseId: string }>();
  const [caseData, setCaseData] = useState<CaseType | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingSession, setCreatingSession] = useState(false);

  useEffect(() => {
    if (!caseId) return;
    Promise.all([api.cases.get(caseId), api.cases.getSessions(caseId)])
      .then(([c, s]) => {
        setCaseData(c);
        setSessions(s);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [caseId]);

  const startNewSession = () => {
    if (!caseId) return;
    setCreatingSession(true);
    api.sessions
      .create(caseId)
      .then((s) => (window.location.href = `/cases/${caseId}/sessions/${s.session_id}`))
      .catch((e) => {
        setError(e.message);
        setCreatingSession(false);
      });
  };

  if (loading || !caseData) {
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
        <span>{caseData.case_name_or_reference}</span>
      </nav>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
          {caseData.case_name_or_reference}
        </h1>
        <p className="page-subtitle" style={{ margin: 0 }}>
          {caseData.domain} · {caseData.participant_role}
          {caseData.jurisdiction ? ` · ${caseData.jurisdiction}` : ''}
        </p>
      </div>

      <section className="card">
        <h2 className="card-title">Strategy sessions</h2>
        <p className="muted" style={{ marginBottom: '1rem' }}>
          Phase 1 — Fixed question protocol. One session = one strategy.
        </p>
        <button
          type="button"
          className="btn btn-primary"
          onClick={startNewSession}
          disabled={creatingSession}
        >
          {creatingSession ? 'Creating…' : 'New strategy session'}
        </button>

        {sessions.length > 0 ? (
          <ul className="list-plain" style={{ marginTop: '1.25rem' }}>
            {sessions.map((s) => (
              <li key={s.session_id}>
                <Link
                  to={`/cases/${caseId}/sessions/${s.session_id}`}
                  className="list-item-link"
                >
                  <span>
                    Session · <span className={s.status === 'finalized' ? 'badge badge-finalized' : 'badge badge-draft'}>{s.status}</span>
                  </span>
                  <span className="muted" style={{ display: 'block', marginTop: '0.25rem', fontSize: '0.8125rem' }}>
                    {s.session_id.slice(0, 8)}…
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty-state" style={{ padding: '1rem 0', margin: 0 }}>
            No sessions yet. Start a new strategy session to run the fixed question protocol.
          </p>
        )}
      </section>
    </div>
  );
}
