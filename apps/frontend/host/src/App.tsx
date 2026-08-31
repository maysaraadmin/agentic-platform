import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

const App: FC = () => {
  return (
    <BrowserRouter>
      <div style={{ padding: 40, fontFamily: 'Arial' }}>
        <h1 style={{ color: 'blue' }}>Agentic Platform</h1>
        <p>React is working!</p>
        <Routes>
          <Route path="/" element={<div>Dashboard Page</div>} />
          <Route path="/chat" element={<div>Chat Page</div>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;
