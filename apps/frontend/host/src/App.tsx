import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';

const ChatModule = React.lazy(() => import('mfe-chat/Module'));
const DashboardModule = React.lazy(() => import('mfe-dashboard/Module'));

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <React.Suspense fallback={<div>Loading...</div>}>
            <Routes>
              <Route path="/" element={<DashboardModule />} />
              <Route path="/chat" element={<ChatModule />} />
            </Routes>
          </React.Suspense>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
