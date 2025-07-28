import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import './BackendAuthForm.css';

export default function BackendAuthForm({ onAuthSuccess }) {
  const { login } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    country: '',
    currency: 'USD',
    nextOfKin: '',
    nextOfKinNumber: ''
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isLogin ? '/users/login' : '/users/signup';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;

      // Use relative URL for Vercel deployment, fallback to env variable
      const apiBaseUrl = window.location.hostname.includes('vercel.app') 
        ? '/api' 
        : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api');
      
      const fullUrl = `${apiBaseUrl}${endpoint}`;
      console.log('API Request:', { 
        url: fullUrl, 
        method: 'POST', 
        payload: isLogin ? payload : { ...payload, password: '[HIDDEN]' } 
      });
      
      const response = await fetch(fullUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      console.log('API Response:', { status: response.status, data });

      if (response.ok) {
        if (isLogin && data.token) {
          // Store token and user data using auth context
          login(data.user, data.token);
          toast.success(`Welcome back, ${data.user.fullname}! 🎉`);
          console.log('Backend auth success:', { token: data.token, user: data.user });
          onAuthSuccess?.();
        } else if (!isLogin) {
          // For signup, switch to login
          setIsLogin(true);
          setFormData({
            fullname: '',
            email: formData.email, // Keep email for convenience
            password: '',
            country: '',
            currency: 'USD',
            nextOfKin: '',
            nextOfKinNumber: ''
          });
          toast.success(`Account created successfully! Please log in with your new account.`);
        }
      } else {
        console.error('API Error:', data);
        toast.error(data.message || `${isLogin ? 'Login' : 'Signup'} failed`);
      }
    } catch (error) {
      console.error('Network/Auth error:', error);
      toast.error('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  return (
    <div className="auth-form-container">
      <div className="auth-form-inner">
        {/* Header */}
        <div className="auth-form-header">
          <h2 className="auth-form-title">
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p className="auth-form-subtitle">
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="auth-form-field">
              <label className="auth-form-label">
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleChange}
                className="auth-form-input"
                required
              />
            </div>
          )}
          
          <div className="auth-form-field">
            <label className="auth-form-label">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              className="auth-form-input"
              required
            />
          </div>
          
          <div className="auth-form-field">
            <label className="auth-form-label">
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              className="auth-form-input"
              required
            />
          </div>
          
          {!isLogin && (
            <div className="auth-form-grid">
              <div className="auth-form-field">
                <label className="auth-form-label">
                  Country
                </label>
                <input
                  type="text"
                  name="country"
                  placeholder="Your country"
                  value={formData.country}
                  onChange={handleChange}
                  className="auth-form-input"
                />
              </div>
              <div className="auth-form-field">
                <label className="auth-form-label">
                  Currency
                </label>
                <select
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                  className="auth-form-input"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="NGN">NGN</option>
                </select>
              </div>
            </div>
          )}
          
          {!isLogin && (
            <div className="auth-form-grid">
              <div className="auth-form-field">
                <label className="auth-form-label">
                  Next of Kin
                </label>
                <input
                  type="text"
                  name="nextOfKin"
                  placeholder="Emergency contact"
                  value={formData.nextOfKin}
                  onChange={handleChange}
                  className="auth-form-input"
                />
              </div>
              <div className="auth-form-field">
                <label className="auth-form-label">
                  Phone Number
                </label>
                <input
                  type="text"
                  name="nextOfKinNumber"
                  placeholder="Contact number"
                  value={formData.nextOfKinNumber}
                  onChange={handleChange}
                  className="auth-form-input"
                />
              </div>
            </div>
          )}
          
          <button
            type="submit"
            disabled={loading}
            className="auth-form-button"
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="loading-spinner"></div>
                Processing...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>
        
        <div style={{ textAlign: 'center' }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            className="auth-form-toggle"
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
