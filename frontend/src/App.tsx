import { Routes, Route } from 'react-router-dom';
import { AppLayout } from './components/AppLayout';
import { CaseList } from './pages/CaseList';
import { CreateCase } from './pages/CreateCase';
import { CaseDetail } from './pages/CaseDetail';
import { SessionWizard } from './pages/SessionWizard';
import { ArtifactViewer } from './pages/ArtifactViewer';

export default function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<CaseList />} />
        <Route path="/cases/new" element={<CreateCase />} />
        <Route path="/cases/:caseId" element={<CaseDetail />} />
        <Route path="/cases/:caseId/sessions/:sessionId" element={<SessionWizard />} />
        <Route path="/artifacts/:artifactId" element={<ArtifactViewer />} />
      </Route>
    </Routes>
  );
}
