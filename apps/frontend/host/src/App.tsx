import { FC, lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import { AuthProvider } from './contexts/AuthContext';

const DashboardModule = lazy(() => import('mfe-dashboard/Module'));
const ChatModule = lazy(() => import('mfe-chat/Module'));

const App: FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/" element={<DashboardModule />} />
              <Route path="/chat" element={<ChatModule />} />
              <Route path="/documents" element={<div>Documents Page</div>} />
              <Route path="/history" element={<div>History Page</div>} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
