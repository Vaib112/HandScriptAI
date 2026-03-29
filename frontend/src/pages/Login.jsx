import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GoogleLogin } from '@react-oauth/google';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.BASE_URL;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  // const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
const BASE_URL = import.meta.env.BASE_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    // setError('');
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Login failed');

      toast.success('Login successful!');
      login(data.data.token, data.data.user);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    // setError('');
    setIsLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/auth/google`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential: credentialResponse.credential })
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Google login failed');

      toast.success('Login successful!');
      login(data.data.token, data.data.user);
      navigate('/');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="glass-panel auth-card glass-animation">
        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Log in to view your MedScript portal</p>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px', marginTop: '10px' }}>
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => toast.error('Google Login Failed')}
            theme="filled_blue"
            shape="pill"
          />
        </div>

        <div style={{ textAlign: 'center', margin: '15px 0', color: 'rgba(255, 255, 255, 0.6)', fontSize: '0.9rem' }}>
          <span>OR</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="input-group">
            <label>Email Address</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              className="glass-input"
            />
          </div>
          <div className="input-group">
            <label>Password</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="glass-input"
            />
          </div>
          
          <button type="submit" className="btn auth-btn" disabled={isLoading}>
            {isLoading ? <div className="loading-spinner"></div> : 'Log In'}
          </button>
        </form>
        
        <p className="auth-footer">
          Don't have an account? <Link to="/register" className="auth-link">Register</Link>
        </p>
      </div>
    </div>
  );
}
