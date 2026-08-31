import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const [username, setUsername] = useState('demo@example.com');
  const [password, setPassword] = useState('demo-password');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg)',
      }}>
        <div className="card" style={{ padding: '40px', textAlign: 'center', maxWidth: '400px', width: '100%' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✓</div>
          <h2 style={{ fontSize: '20px', fontWeight: '600', marginBottom: '8px' }}>Already Signed In</h2>
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px', marginBottom: '24px' }}>
            You are authenticated.
          </p>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
            <Link to="/chat" className="btn btn-primary" style={{ textDecoration: 'none' }}>Go to Chat</Link>
            <Link to="/" className="btn btn-secondary" style={{ textDecoration: 'none' }}>Dashboard</Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(username, password);
    } catch (err) {
      setError('Invalid credentials. Use demo@example.com / demo-password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      backgroundColor: 'var(--color-bg)',
    }}>
      {/* Left side - branding */}
      <div style={{
        flex: '1',
        background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '60px',
        color: 'white',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background decoration */}
        <div style={{
          position: 'absolute',
          top: '-100px',
          right: '-100px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />
        <div style={{
          position: 'absolute',
          bottom: '-50px',
          left: '-50px',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(255,255,255,0.05)',
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            marginBottom: '40px',
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: 'var(--radius-md)',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold',
              fontSize: '22px',
            }}>
              A
            </div>
            <div>
              <div style={{ fontWeight: '600', fontSize: '20px' }}>Agentic</div>
              <div style={{ fontSize: '13px', opacity: 0.8 }}>Enterprise Platform</div>
            </div>
          </div>

          <h1 style={{
            fontSize: '36px',
            fontWeight: '700',
            lineHeight: '1.2',
            marginBottom: '16px',
          }}>
            AI-Powered<br />Enterprise Intelligence
          </h1>
          <p style={{
            fontSize: '16px',
            opacity: 0.85,
            lineHeight: '1.6',
            maxWidth: '400px',
          }}>
            Harness the power of AI agents, RAG, and MCP to transform how your organization accesses and interacts with information.
          </p>

          <div style={{
            marginTop: '40px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}>
            {[
              { icon: '🤖', text: 'AI Agent Orchestration' },
              { icon: '🔍', text: 'RAG-Powered Search' },
              { icon: '🔌', text: 'MCP Integration' },
              { icon: '📊', text: 'Real-time Analytics' },
            ].map((feature, idx) => (
              <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontSize: '20px' }}>{feature.icon}</span>
                <span style={{ fontSize: '14px', opacity: 0.9 }}>{feature.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right side - login form */}
      <div style={{
        flex: '1',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px',
      }}>
        <div style={{ width: '100%', maxWidth: '380px' }}>
          <div style={{ marginBottom: '32px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>Welcome back</h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>
              Sign in to access your dashboard
            </p>
          </div>

          {error && (
            <div style={{
              padding: '12px 16px',
              marginBottom: '20px',
              backgroundColor: '#fef2f2',
              color: '#991b1b',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              border: '1px solid #fecaca',
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--color-text)',
              }}>
                Email Address
              </label>
              <input
                type="email"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  backgroundColor: 'var(--color-surface)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                marginBottom: '6px',
                fontSize: '13px',
                fontWeight: '500',
                color: 'var(--color-text)',
              }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--color-border)',
                  fontSize: '14px',
                  backgroundColor: 'var(--color-surface)',
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = 'var(--color-primary)';
                  e.target.style.boxShadow = '0 0 0 3px var(--color-primary-light)';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = 'var(--color-border)';
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '13px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                color: 'white',
                fontSize: '14px',
                fontWeight: '500',
                marginTop: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              {loading ? (
                <>
                  <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px', borderTopColor: 'white' }} />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div style={{
            marginTop: '24px',
            padding: '14px 16px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-primary-light)',
            border: '1px solid #c7d2fe',
          }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--color-primary)', marginBottom: '4px' }}>
              Demo Credentials
            </div>
            <div style={{ fontSize: '13px', color: 'var(--color-text-secondary)', fontFamily: 'monospace' }}>
              demo@example.com / demo-password
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
