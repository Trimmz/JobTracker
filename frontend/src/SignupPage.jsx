// frontend/src/SignupPage.jsx
import React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_ENDPOINTS } from './config';

export default function SignupPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const res = await fetch(API_ENDPOINTS.SIGNUP, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();

    if (data.success) {
      setSuccess('Account created! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } else {
      setError(data.message || 'Signup failed');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Get Started</h1>
          <p className="text-gray-400">Create your account to start tracking applications</p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Create Account</h2>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900/20 border border-green-800 text-green-300 px-4 py-3 rounded-lg mb-4">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                placeholder="Choose a username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none placeholder-gray-400"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Choose a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none placeholder-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-emerald-600 text-white py-3 rounded-lg hover:bg-emerald-700 transition-colors shadow-lg font-medium"
            >
              Sign Up
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Already have an account?{' '}
              <button
                onClick={() => navigate('/login')}
                className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
              >
                Log in
              </button>
            </p>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/')}
              className="text-gray-500 hover:text-gray-400 text-sm"
            >
              ← Back to home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}