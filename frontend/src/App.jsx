// frontend/src/App.jsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './LoginPage';
import SignupPage from './SignupPage';
import MainApp from './MainApp';
import AdminJobManager from './AdminJobManager';

// Public route: always shows MainApp, but MainApp will adapt based on auth
export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/admin" element={<AdminJobManager />} />
        <Route path="/" element={<MainApp />} /> {/* ✅ Always accessible */}
      </Routes>
    </Router>
  );
}