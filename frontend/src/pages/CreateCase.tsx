import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api, type CreateCaseBody } from '../api/client';

const DEFAULT_DOMAIN = 'Legal Strategy';

export function CreateCase() {
  const navigate = useNavigate();
  const [domain, setDomain] = useState(DEFAULT_DOMAIN);
  const [caseName, setCaseName] = useState('');
  const [participantRole, setParticipantRole] = useState('');
  const [jurisdiction, setJurisdiction] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseName.trim() || !participantRole.trim()) {
      setError('Case name and participant role are required.');
      return;
    }
    setError(null);
    setSubmitting(true);
    const body: CreateCaseBody = {
      domain: domain || DEFAULT_DOMAIN,
      case_name_or_reference: caseName.trim(),
      participant_role: participantRole.trim(),
      jurisdiction: jurisdiction.trim() || undefined,
    };
    api.cases
      .create(body)
      .then((c) => navigate(`/cases/${c.case_id}`))
      .catch((e) => {
        setError(e.message);
        setSubmitting(false);
      });
  };

  return (
    <div className="page">
      <nav className="breadcrumb">
        <Link to="/">Cases</Link>
        <span style={{ color: 'var(--ary-muted)', margin: '0 0.25rem' }}>/</span>
        <span>New case</span>
      </nav>

      <header className="page-header">
        <h1 className="page-title">Create case</h1>
        <p className="page-subtitle">
          Phase 0 — Context declaration. Case metadata only; not evidence of reasoning.
        </p>
      </header>

      <div className="card">
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="domain">Domain</label>
            <input
              id="domain"
              type="text"
              value={domain}
              onChange={(e) => setDomain(e.target.value)}
              placeholder="Legal Strategy"
            />
          </div>
          <div className="form-group">
            <label htmlFor="caseName">Case name / reference *</label>
            <input
              id="caseName"
              type="text"
              value={caseName}
              onChange={(e) => setCaseName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="participantRole">Participant role *</label>
            <input
              id="participantRole"
              type="text"
              value={participantRole}
              onChange={(e) => setParticipantRole(e.target.value)}
              placeholder="Partner / Associate / Counsel / etc."
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="jurisdiction">Jurisdiction (optional)</label>
            <input
              id="jurisdiction"
              type="text"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
            />
          </div>
          {error && <p className="error">{error}</p>}
          <div className="form-actions">
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create case'}
            </button>
            <Link to="/" className="btn btn-secondary" style={{ marginLeft: '0.5rem', textDecoration: 'none' }}>
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
