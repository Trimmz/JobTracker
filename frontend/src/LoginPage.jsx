// frontend/src/LoginPage.jsx
import React from 'react';
import { useState } from 'react';
import { useAuth } from './AuthContext';
import { useNavigate, Link } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await login(username, password);
    if (success) {
      navigate('/'); // go to main app
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-gray-400">Sign in to track your job applications</p>
        </div>

        <div className="bg-slate-800/70 border border-slate-700 rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-bold mb-6 text-white">Login</h2>

          {error && (
            <div className="bg-red-900/20 border border-red-800 text-red-300 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 text-sm font-medium mb-2">Username</label>
              <input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400"
                required
              />
            </div>

            <div className="mb-6">
              <label className="block text-gray-300 text-sm font-medium mb-2">Password</label>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-700 border border-slate-600 text-white rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-lg font-medium"
            >
              Log In
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-400">
              Don't have an account?{' '}
              <Link to="/signup" className="text-blue-400 hover:text-blue-300 hover:underline font-medium">
                Sign up
              </Link>
            </p>
          </div>

          <div className="mt-4 text-center">
            <Link to="/" className="text-gray-500 hover:text-gray-400 text-sm">
              ← Back to home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}