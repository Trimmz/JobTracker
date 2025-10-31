// frontend/src/MainApp.jsx
import React from 'react';
import { useAuth } from './AuthContext';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { API_ENDPOINTS } from './config';

const JOBS_API_URL = API_ENDPOINTS.JOBS;

export default function MainApp() {
  const { user, isAdmin, isLoggedIn, logout } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const headers = {};
        if (isLoggedIn && user) {
          headers['user-id'] = user.id;
        }

        const res = await fetch(JOBS_API_URL, { headers });
        const data = await res.json();
        setJobs(data);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load jobs:', err);
        setLoading(false);
      }
    };

    fetchJobs();
  }, [isLoggedIn, user]);

  const updateStatus = async (jobId, status, currentDateApplied, currentNotes) => {
    if (!isLoggedIn || !user) {
      alert('Please log in to update status');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'user-id': user.id
    };

    // Set dateApplied automatically when status changes from "Not Applied" to "Applied"
    let dateApplied = currentDateApplied;
    if (status === 'Applied' && !currentDateApplied) {
      dateApplied = new Date().toISOString().split('T')[0];
    }

    const res = await fetch(`${JOBS_API_URL}/${jobId}/apply`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        status,
        dateApplied,
        notes: currentNotes || ''
      })
    });

    if (res.ok) {
      setJobs(jobs.map(job =>
        job.id === jobId
          ? { ...job, status, dateApplied, notes: currentNotes || '' }
          : job
      ));
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to update status');
    }
  };

  const updateNotes = async (jobId, notes, currentStatus, currentDateApplied) => {
    if (!isLoggedIn || !user) {
      alert('Please log in to update notes');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'user-id': user.id
    };

    const res = await fetch(`${JOBS_API_URL}/${jobId}/apply`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        status: currentStatus || 'Not Applied',
        dateApplied: currentDateApplied,
        notes
      })
    });

    if (res.ok) {
      setJobs(jobs.map(job =>
        job.id === jobId
          ? { ...job, notes }
          : job
      ));
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to update notes');
    }
  };

  const deleteJob = async (id) => {
    if (!confirm('Are you sure you want to delete this job? All user applications for this job will be deleted.')) return;
    if (!isLoggedIn || !user) {
      alert('Please log in to delete jobs');
      return;
    }

    const headers = {
      'user-id': user.id
    };

    const res = await fetch(`${JOBS_API_URL}/${id}`, {
      method: 'DELETE',
      headers
    });

    if (res.ok) {
      setJobs(jobs.filter(job => job.id !== id));
    } else {
      const error = await res.json();
      alert(error.error || 'Failed to delete job');
    }
  };

  // Status badge colors
  const getStatusColor = (status) => {
    switch (status) {
      case 'Not Applied':
        return 'bg-gray-600 text-gray-200';
      case 'Wishlist':
        return 'bg-purple-600 text-purple-100';
      case 'Applied':
        return 'bg-blue-600 text-blue-100';
      case 'Interview':
        return 'bg-yellow-600 text-yellow-100';
      case 'Offer':
        return 'bg-green-600 text-green-100';
      case 'Rejected':
        return 'bg-red-600 text-red-100';
      default:
        return 'bg-gray-600 text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-lg text-gray-300">Loading jobs...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Job Application Tracker
            </h1>
            {isLoggedIn && user && (
              <p className="text-sm text-gray-400">
                Logged in as <span className="font-medium text-gray-300">{user.username}</span>
                {isAdmin && <span className="ml-2">👑 Admin</span>}
              </p>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {isAdmin && (
              <Link
                to="/admin"
                className="px-4 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors shadow-lg"
              >
                Manage Jobs
              </Link>
            )}
            {isLoggedIn ? (
              <button
                onClick={logout}
                className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-lg"
              >
                Logout
              </button>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
              >
                Log In
              </Link>
            )}
          </div>
        </div>

        {/* Optional note for public users */}
        {!isLoggedIn && (
          <div className="mb-6 p-4 bg-slate-800/50 border border-slate-700 rounded-lg">
            <p className="text-sm text-gray-300">
              👀 Public view: log in to track your application status.
            </p>
          </div>
        )}

        {/* Stats Bar */}
        {isLoggedIn && jobs.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
            {['Not Applied', 'Wishlist', 'Applied', 'Interview', 'Offer', 'Rejected'].map(status => {
              const count = jobs.filter(j => j.status === status).length;
              return (
                <div key={status} className="bg-slate-800/50 border border-slate-700 rounded-lg p-3">
                  <div className="text-xs text-gray-400 mb-1">{status}</div>
                  <div className="text-2xl font-bold text-white">{count}</div>
                </div>
              );
            })}
          </div>
        )}

        {/* Jobs Grid */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-white">
              Available Jobs <span className="text-gray-500">({jobs.length})</span>
            </h2>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">
                No jobs available yet. {isAdmin && 'Go to Manage Jobs to add some!'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-900/20"
                >
                  {/* Job Header */}
                  <div className="mb-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-white text-lg leading-tight">{job.role}</h3>
                      {isLoggedIn && (
                        <span className={`px-2 py-1 text-xs rounded-full whitespace-nowrap ${getStatusColor(job.status)}`}>
                          {job.status}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-400 text-sm font-medium">{job.company}</p>
                    {job.location && (
                      <p className="text-gray-500 text-xs mt-1">📍 {job.location}</p>
                    )}
                  </div>

                  {/* Job Details */}
                  <div className="space-y-2 mb-3">
                    {job.dateApplied && (
                      <p className="text-xs text-gray-500">Applied: {job.dateApplied}</p>
                    )}
                    {job.jobLink && (
                      <a
                        href={job.jobLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-400 text-xs hover:text-blue-300 hover:underline inline-block"
                      >
                        View Posting →
                      </a>
                    )}
                  </div>

                  {/* Status & Notes - Logged in users only */}
                  {isLoggedIn && (
                    <div className="space-y-2 pt-3 border-t border-slate-700">
                      <select
                        value={job.status || 'Not Applied'}
                        onChange={(e) => updateStatus(job.id, e.target.value, job.dateApplied, job.notes)}
                        className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      >
                        <option value="Not Applied">Not Applied</option>
                        <option value="Wishlist">Wishlist</option>
                        <option value="Applied">Applied</option>
                        <option value="Interview">Interview</option>
                        <option value="Offer">Offer</option>
                        <option value="Rejected">Rejected</option>
                      </select>

                      <textarea
                        placeholder="Add personal notes..."
                        value={job.notes || ''}
                        onChange={(e) => {
                          // Update local state immediately for better UX
                          setJobs(jobs.map(j => j.id === job.id ? { ...j, notes: e.target.value } : j));
                        }}
                        onBlur={(e) => {
                          updateNotes(job.id, e.target.value, job.status, job.dateApplied);
                        }}
                        className="w-full bg-slate-700 border border-slate-600 text-white text-sm rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none placeholder-gray-500"
                        rows="2"
                      />

                      {/* Admin delete button */}
                      {isAdmin && (
                        <button
                          onClick={() => deleteJob(job.id)}
                          className="w-full text-red-400 text-xs hover:text-red-300 hover:bg-red-900/20 py-1 rounded transition-colors"
                        >
                          Delete Job
                        </button>
                      )}
                    </div>
                  )}

                  {/* Not logged in message */}
                  {!isLoggedIn && (
                    <div className="pt-3 border-t border-slate-700">
                      <p className="text-xs text-gray-500 text-center italic">Log in to track status</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}