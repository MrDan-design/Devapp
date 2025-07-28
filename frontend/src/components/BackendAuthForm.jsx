import React, { useState } from 'react';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

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
    <div style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: window.innerWidth <= 768 ? '20px' : '40px',
      borderRadius: '20px',
      boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
      width: '100%',
      maxWidth: window.innerWidth <= 768 ? '95vw' : '600px',
      minWidth: 'auto',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(255,255,255,0.1)'
    }}>
      <div style={{
        background: 'rgba(255,255,255,0.95)',
        padding: window.innerWidth <= 768 ? '20px' : '40px',
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.1)'
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: window.innerWidth <= 768 ? '20px' : '30px' }}>
          <h2 style={{
            fontSize: window.innerWidth <= 768 ? '24px' : '32px',
            fontWeight: '700',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            marginBottom: '8px'
          }}>
            {isLogin ? 'Welcome Back' : 'Join Us'}
          </h2>
          <p style={{
            color: '#666',
            fontSize: window.innerWidth <= 768 ? '14px' : '16px',
            margin: 0
          }}>
            {isLogin ? 'Sign in to your account' : 'Create your account to get started'}
          </p>
        </div>
        
        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <div style={{ marginBottom: '20px', opacity: '0', animation: 'slideIn 0.3s ease forwards' }}>
              <label style={{
                display: 'block',
                marginBottom: '8px',
                fontSize: '14px',
                fontWeight: '600',
                color: '#374151'
              }}>
                Full Name
              </label>
              <input
                type="text"
                name="fullname"
                placeholder="Enter your full name"
                value={formData.fullname}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '14px 16px',
                  border: '2px solid #e5e7eb',
                  borderRadius: '12px',
                  fontSize: window.innerWidth <= 768 ? '16px' : '16px', // 16px prevents zoom on mobile
                  transition: 'all 0.3s ease',
                  outline: 'none',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                required
              />
            </div>
          )}
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Email Address
            </label>
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              required
            />
          </div>
          
          <div style={{ marginBottom: isLogin ? '30px' : '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: '600',
              color: '#374151'
            }}>
              Password
            </label>
            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '14px 16px',
                border: '2px solid #e5e7eb',
                borderRadius: '12px',
                fontSize: '16px',
                transition: 'all 0.3s ease',
                outline: 'none',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
              required
            />
          </div>
          
          {!isLogin && (
            <>
              {!isLogin && (
                <div style={{ display: window.innerWidth <= 768 ? 'block' : 'grid', gridTemplateColumns: window.innerWidth <= 768 ? 'none' : '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '0' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Country
                    </label>
                    <input
                      type="text"
                      name="country"
                      placeholder="Your country"
                      value={formData.country}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Currency
                    </label>
                    <select
                      name="currency"
                      value={formData.currency}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box',
                        background: 'white'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
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
                <div style={{ display: window.innerWidth <= 768 ? 'block' : 'grid', gridTemplateColumns: window.innerWidth <= 768 ? 'none' : '1fr 1fr', gap: '16px', marginBottom: '30px' }}>
                  <div style={{ marginBottom: window.innerWidth <= 768 ? '16px' : '0' }}>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Next of Kin
                    </label>
                    <input
                      type="text"
                      name="nextOfKin"
                      placeholder="Emergency contact"
                      value={formData.nextOfKin}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '8px',
                      fontSize: '14px',
                      fontWeight: '600',
                      color: '#374151'
                    }}>
                      Phone Number
                    </label>
                    <input
                      type="text"
                      name="nextOfKinNumber"
                      placeholder="Contact number"
                      value={formData.nextOfKinNumber}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '14px 16px',
                        border: '2px solid #e5e7eb',
                        borderRadius: '12px',
                        fontSize: '16px',
                        transition: 'all 0.3s ease',
                        outline: 'none',
                        boxSizing: 'border-box'
                      }}
                      onFocus={(e) => e.target.style.borderColor = '#667eea'}
                      onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
                    />
                  </div>
                </div>
              )}
            </>
          )}
          
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              background: loading ? '#9ca3af' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              padding: '16px',
              borderRadius: '12px',
              border: 'none',
              fontSize: '16px',
              fontWeight: '600',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s ease',
              transform: loading ? 'none' : 'translateY(0)',
              boxShadow: loading ? 'none' : '0 4px 15px rgba(102, 126, 234, 0.4)',
              marginBottom: '20px'
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
              }
            }}
          >
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid transparent',
                  borderTop: '2px solid white',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  marginRight: '8px'
                }}></div>
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
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              textDecoration: 'none',
              transition: 'color 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.color = '#764ba2'}
            onMouseLeave={(e) => e.target.style.color = '#667eea'}
          >
            {isLogin ? "Don't have an account? Create one" : "Already have an account? Sign in"}
          </button>
        </div>
      </div>
      
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes slideIn {
          0% { opacity: 0; transform: translateY(-10px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
