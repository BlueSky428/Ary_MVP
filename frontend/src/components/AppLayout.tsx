import { Outlet, Link } from 'react-router-dom';
import { getApiBase } from '../api/client';

export function AppLayout() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <Link to="/" className="app-brand">
          <span>Ary</span> — Guided Protocol Pilot
        </Link>
        <nav className="app-nav">
          <Link to="/">Cases</Link>
          <Link to="/cases/new">New case</Link>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
      <footer className="app-api-hint" title="Resolved API base — remove this once everything works">
        API: {getApiBase()}
      </footer>
    </div>
  );
}
