import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../api/client';
import type { ArtifactOutput } from '../types/models';

export function ArtifactViewer() {
  const { artifactId } = useParams<{ artifactId: string }>();
  const [artifact, setArtifact] = useState<ArtifactOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!artifactId) return;
    api.artifacts
      .get(artifactId)
      .then(setArtifact)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [artifactId]);

  if (loading) {
    return (
      <div className="page">
        <p className="muted">Loading artifact…</p>
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

  if (!artifact) {
    return (
      <div className="page">
        <p className="muted">Artifact not found.</p>
      </div>
    );
  }

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Cases</Link>
        <span style={{ color: 'var(--ary-muted)', margin: '0 0.25rem' }}>/</span>
        <span>Artifact</span>
      </nav>

      <header className="page-header">
        <h1 className="page-title">Strategy artifact</h1>
        <p className="page-subtitle">
          Read-only. Immutable output from finalized session.
        </p>
        <div style={{ marginTop: '0.75rem', fontSize: '0.8125rem', color: 'var(--ary-muted)' }}>
          <span>Artifact ID: {artifact.artifact_id}</span>
          <span style={{ marginLeft: '1rem' }}>
            Question set: {artifact.session.question_set.id} v{artifact.session.question_set.version}
          </span>
          <span style={{ marginLeft: '1rem' }}>Finalized: {artifact.session.finalized_at}</span>
        </div>
      </header>

      <section className="card">
        <h2 className="card-title">Strategy (Q1)</h2>
        <div className={artifact.strategy.q1_text ? 'verbatim' : 'verbatim verbatim-empty'}>
          {artifact.strategy.q1_text || '—'}
        </div>
      </section>

      <section className="card">
        <h2 className="card-title">Answers (verbatim)</h2>
        {(['Q2', 'Q3', 'Q4', 'Q5'] as const).map((q) => (
          <div key={q} style={{ marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '0.9375rem', fontWeight: 600, margin: '0 0 0.5rem 0', color: 'var(--ary-text-secondary)' }}>
              {q}
            </h3>
            {artifact.answers[q].length === 0 ? (
              <div className="verbatim verbatim-empty">—</div>
            ) : (
              <ul className="list-plain">
                {artifact.answers[q].map((a) => (
                  <li key={a.entry_id} className="verbatim" style={{ listStyle: 'none', marginBottom: '0.5rem' }}>
                    {a.text}
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      {artifact.semantic_proposals.length > 0 && (
        <section className="card">
          <h2 className="card-title">Semantic proposals & decisions</h2>
          <ul className="list-plain">
            {artifact.semantic_proposals.map((p) => (
              <li
                key={p.proposal_id}
                style={{
                  padding: '0.5rem 0',
                  borderBottom: '1px solid var(--ary-border)',
                  fontSize: '0.9375rem',
                }}
              >
                <span className="badge badge-draft" style={{ marginRight: '0.5rem' }}>{p.mechanism_id}</span>
                <span className="verbatim" style={{ display: 'inline', padding: 0, margin: 0, border: 'none', background: 'transparent' }}>
                  "{p.span_text}"
                </span>
                <span style={{ color: 'var(--ary-muted)', marginLeft: '0.5rem' }}>— {p.decision}</span>
                {p.decision_reason && (
                  <span style={{ color: 'var(--ary-text-secondary)', display: 'block', marginTop: '0.25rem' }}>
                    {p.decision_reason}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}

      {artifact.integrity?.hash_sha256 && (
        <section className="card">
          <h2 className="card-title">Integrity</h2>
          <p style={{ fontFamily: 'var(--ary-font-mono)', fontSize: '0.8125rem', color: 'var(--ary-muted)', margin: 0 }}>
            SHA-256: {artifact.integrity.hash_sha256}
          </p>
        </section>
      )}
    </div>
  );
}
