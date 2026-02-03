import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api/client';
import type { Case } from '../types/models';

export function CaseList() {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.cases
      .list()
      .then(setCases)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading cases…</p>
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
      <header className="page-header">
        <h1 className="page-title">Cases</h1>
        <p className="page-subtitle">
          Phase 0 — Context declaration. Create a case to start a strategy session.
        </p>
      </header>

      <div className="card" style={{ marginBottom: '1.25rem' }}>
        <Link to="/cases/new" className="btn btn-primary" style={{ textDecoration: 'none' }}>
          Create case
        </Link>
      </div>

      {cases.length === 0 ? (
        <div className="card">
          <p className="empty-state">No cases yet. Create one to begin a guided protocol session.</p>
        </div>
      ) : (
        <ul className="list-plain">
          {cases.map((c) => (
            <li key={c.case_id}>
              <Link to={`/cases/${c.case_id}`} className="list-item-link">
                <strong>{c.case_name_or_reference}</strong>
                <span className="muted" style={{ display: 'block', marginTop: '0.25rem' }}>
                  {c.domain} · {c.participant_role}
                  {c.jurisdiction ? ` · ${c.jurisdiction}` : ''}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
