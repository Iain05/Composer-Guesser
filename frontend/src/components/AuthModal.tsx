import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '@src/context/AuthContext';

interface AuthModalProps {
  initialMode: 'login' | 'register';
  onClose: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({ initialMode, onClose }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState(initialMode);
  const [username, setUsername] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setError('');
    setUsername('');
    setIdentifier('');
    setEmail('');
    setPassword('');
  }, [mode]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await login(identifier, password);
      } else {
        await register(username, email, password);
      }
      onClose();
    } catch (err) {
      setError(mode === 'login' ? 'Invalid email/username or password.' : 'Registration failed. Email or username may already be in use.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-surface rounded-2xl p-8 w-full max-w-sm shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-ink-subtle hover:text-ink-muted transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="serif text-2xl text-ink mb-6">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {mode === 'register' && (
            <div>
              <label className="block text-sm font-medium text-ink-muted mb-1" htmlFor="auth-username">
                Username
              </label>
              <input
                id="auth-username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                autoComplete="username"
                className="w-full px-4 py-3 bg-surface text-ink border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-all"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink-muted mb-1" htmlFor="auth-identifier">
              {mode === 'login' ? 'Email or username' : 'Email'}
            </label>
            <input
              id="auth-identifier"
              type={mode === 'register' ? 'email' : 'text'}
              value={mode === 'login' ? identifier : email}
              onChange={(e) => mode === 'login' ? setIdentifier(e.target.value) : setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full px-4 py-3 bg-surface text-ink border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-ink-muted mb-1" htmlFor="auth-password">
              Password
            </label>
            <input
              id="auth-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 8 : undefined}
              autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
              className="w-full px-4 py-3 bg-surface text-ink border-2 border-border rounded-xl focus:border-primary focus:outline-none transition-all"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary text-primary-text font-semibold rounded-xl hover:bg-primary-hover disabled:opacity-50 transition-colors"
          >
            {loading ? '...' : mode === 'login' ? 'Sign in' : 'Create account'}
          </button>
        </form>

        <p className="text-center text-sm text-ink-muted mt-4">
          {mode === 'login' ? (
            <>No account?{' '}
              <button onClick={() => setMode('register')} className="text-primary hover:underline font-medium">
                Create one
              </button>
            </>
          ) : (
            <>Already have an account?{' '}
              <button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">
                Sign in
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default AuthModal;
