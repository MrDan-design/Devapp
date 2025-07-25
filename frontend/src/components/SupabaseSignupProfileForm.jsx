// --- Supabase signup with profile creation (added July 25, 2025) ---
import React, { useState } from 'react';
import { supabase } from '../services/supabaseClient';

export default function SupabaseSignupProfileForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [country, setCountry] = useState('');
  const [message, setMessage] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    setMessage('');
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    // Insert profile data
    const userId = data.user?.id;
    if (userId) {
      const { error: profileError } = await supabase.from('profiles').insert([
        { id: userId, email, full_name: fullName, country }
      ]);
      if (profileError) {
        setMessage('Signup succeeded, but profile creation failed: ' + profileError.message);
        return;
      }
    }
    setMessage('Signup successful! Check your email for confirmation.');
  };

  return (
    <div style={{ maxWidth: 400, margin: '2rem auto', padding: 20, border: '1px solid #eee', borderRadius: 8 }}>
      <h2>Sign Up (Supabase + Profile)</h2>
      <form onSubmit={handleSignup}>
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
        <input
          type="text"
          placeholder="Full Name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <input
          type="text"
          placeholder="Country"
          value={country}
          onChange={e => setCountry(e.target.value)}
          required
          style={{ width: '100%', marginBottom: 10 }}
        />
        <button type="submit" style={{ width: '100%', marginBottom: 10 }}>
          Sign Up
        </button>
      </form>
      {message && <div style={{ marginTop: 10, color: 'red' }}>{message}</div>}
    </div>
  );
}
