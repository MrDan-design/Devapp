// --- Supabase signup/signin form (added for migration to Supabase, July 25, 2025) ---
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabaseClient';

export default function SupabaseAuthForm({ onAuthSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (mode === 'signup') {
      const { data, error } = await supabase.auth.signUp({ email, password });
      console.log('Supabase signup result:', { data, error });
      if (error) setMessage(error.message);
      else {
        if (data.session && data.session.access_token) {
          localStorage.setItem('token', data.session.access_token);
        }
        const user = data.user || (data.session && data.session.user);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        setMessage('Signup successful! Check your email for confirmation.');
        if (onAuthSuccess) onAuthSuccess();
        setTimeout(() => navigate('/dashboard'), 1000);
      }
    } else {
      console.log('Attempting signInWithPassword with:', { email, password });
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('Supabase signin result:', { data, error });
      if (error) setMessage(error.message);
      else {
        if (data.session && data.session.access_token) {
          localStorage.setItem('token', data.session.access_token);
        }
        const user = data.user || (data.session && data.session.user);
        if (user) {
          localStorage.setItem('user', JSON.stringify(user));
        }
        setMessage('Signin successful!');
        if (onAuthSuccess) onAuthSuccess();
        setTimeout(() => navigate('/dashboard'), 500);
      }
    }
  };


  const handleOAuthLogin = async (provider) => {
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({ provider });
    if (error) setMessage(error.message);
    // For OAuth, Supabase will redirect and set the session, so we handle token in useEffect below
  };

  // Always keep token in sync with Supabase session
  useEffect(() => {
    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Supabase onAuthStateChange:', { event, session });
      if (session && session.access_token) {
        localStorage.setItem('token', session.access_token);
        if (session.user) {
          localStorage.setItem('user', JSON.stringify(session.user));
        }
      }
    });
    // On mount, also check current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Supabase getSession on mount:', session);
      if (session && session.access_token) {
        localStorage.setItem('token', session.access_token);
        if (session.user) {
          localStorage.setItem('user', JSON.stringify(session.user));
        }
      }
    });
    return () => {
      listener.subscription.unsubscribe();
    };
  }, []);

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>{mode === 'signup' ? 'Sign Up' : 'Sign In'}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%', marginBottom: 10 }}>
          {mode === 'signup' ? 'Sign Up' : 'Sign In'}
        </button>
      </form>
      <button onClick={() => setMode(mode === 'signup' ? 'signin' : 'signup')} style={{ width: '100%' }}>
        {mode === 'signup' ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
      </button>
      <hr style={{ margin: '20px 0' }} />
      <button onClick={() => handleOAuthLogin('google')} style={{ width: '100%', marginBottom: 10, background: '#4285F4', color: 'white', border: 'none', padding: '10px', borderRadius: 4 }}>
        Continue with Google
      </button>
      <button onClick={() => handleOAuthLogin('facebook')} style={{ width: '100%', marginBottom: 10, background: '#3b5998', color: 'white', border: 'none', padding: '10px', borderRadius: 4 }}>
        Continue with Facebook
      </button>
      {message && <div style={{ marginTop: 10, color: 'red' }}>{message}</div>}
    </div>
  );
}
