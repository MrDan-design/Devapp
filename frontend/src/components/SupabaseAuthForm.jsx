// --- Supabase signup/signin form (added for migration to Supabase, July 25, 2025) ---
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function SupabaseAuthForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (mode === 'signup') {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Signup successful! Check your email for confirmation.');
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMessage(error.message);
      else setMessage('Signin successful!');
    }
  };

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
      {message && <div style={{ marginTop: 10, color: 'red' }}>{message}</div>}
    </div>
  );
}
