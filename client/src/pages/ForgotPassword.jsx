import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/endpoints.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import AuthShell from '../components/AuthShell.jsx';

export default function ForgotPassword() {
  const { resetPassword } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState('request'); // 'request' | 'reset'
  const [email, setEmail] = useState('');
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const requestReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authApi.forgotPassword({ email });
      // In the MVP the token is returned directly (no email provider configured).
      if (res.devResetToken) {
        setToken(res.devResetToken);
        toast.info('Reset token generated (demo mode)');
      }
      setStep('reset');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const doReset = async (e) => {
    e.preventDefault();
    if (password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      await resetPassword({ token, password });
      toast.success('Password reset — you’re signed in');
      navigate('/', { replace: true });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title={step === 'request' ? 'Reset password' : 'Set a new password'}
      subtitle={
        step === 'request'
          ? 'Enter your email to receive a reset link.'
          : 'Enter the reset token and your new password.'
      }
      footer={<Link to="/login" className="font-semibold text-brand-light hover:underline">Back to sign in</Link>}
    >
      {step === 'request' ? (
        <form onSubmit={requestReset} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input" placeholder="you@example.com" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Sending…' : 'Send reset link'}
          </button>
        </form>
      ) : (
        <form onSubmit={doReset} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Reset token</label>
            <input required value={token} onChange={(e) => setToken(e.target.value)} className="input font-mono text-xs" placeholder="Paste your reset token" />
            <p className="mt-1 text-xs text-muted">Demo mode auto-fills this; production sends it by email.</p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium">New password</label>
            <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input" placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full py-3">
            {loading ? 'Resetting…' : 'Reset password'}
          </button>
        </form>
      )}
    </AuthShell>
  );
}
