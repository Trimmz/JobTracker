// frontend/src/AdminJobManager.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { API_ENDPOINTS } from './config';

const API_URL = API_ENDPOINTS.JOBS;

export default function AdminJobManager() {
  const { user, isAdmin } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    location: '',
    jobLink: ''
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const headers = {};
      if (user) {
        headers['user-id'] = user.id;
      }

      const res = await fetch(API_URL, { headers });
      const data = await res.json();
      setJobs(data);
    } catch (err) {
      console.error('Failed to load jobs:', err);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAdmin) {
      alert('Admin access required');
      return;
    }

    const headers = {
      'Content-Type': 'application/json',
      'user-id': user.id
    };

    try {
      if (editingId) {
        // Update existing job
        const res = await fetch(`${API_URL}/${editingId}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          setJobs(jobs.map(job => job.id === editingId ? { ...job, ...formData } : job));
          setEditingId(null);
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to update job');
        }
      } else {
        // Create new job
        const res = await fetch(API_URL, {
          method: 'POST',
          headers,
          body: JSON.stringify(formData)
        });

        if (res.ok) {
          const result = await res.json();
          setJobs([{ ...formData, id: result.id }, ...jobs]);
        } else {
          const error = await res.json();
          alert(error.error || 'Failed to create job');
        }
      }

      setFormData({ company: '', role: '', location: '', jobLink: '' });
    } catch (err) {
      alert('Failed to save job: ' + err.message);
    }
  };

  const handleEdit = (job) => {
    setFormData({
      company: job.company,
      role: job.role,
      location: job.location || '',
      jobLink: job.jobLink || ''
    });
    setEditingId(job.id);
  };

  const handleCancelEdit = () => {
    setFormData({ company: '', role: '', location: '', jobLink: '' });
    setEditingId(null);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this job? All user applications for this job will also be deleted.')) {
      return;
    }

    const headers = {
      'user-id': user.id
    };

    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers
      });

      if (res.ok) {
        setJobs(jobs.filter(job => job.id !== id));
      } else {
        const error = await res.json();
        alert(error.error || 'Failed to delete job');
      }
    } catch (err) {
      alert('Failed to delete job: ' + err.message);
    }
  };

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center p-6">
        <div className="bg-red-900/20 border border-red-800 text-red-300 px-6 py-4 rounded-lg max-w-md">
          Admin access required to manage jobs.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
      <div className="max-w-6xl mx-auto p-4 md:p-6 lg:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
              Job Management
            </h1>
            <p className="text-sm text-gray-400">Admin Panel</p>
          </div>
          <a
            href="/"
            className="px-4 py-2 text-sm bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors shadow-lg"
          >
            ← Back to Jobs
          </a>
        </div>

        {/* Job Form */}
        <form onSubmit={handleSubmit} className="bg-slate-800/70 border border-slate-700 p-6 rounded-lg shadow-xl mb-8">
          <h2 className="text-xl font-semibold mb-4 text-white">
            {editingId ? '✏️ Edit Job' : '➕ Add New Job'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input
              name="company"
              placeholder="Company *"
              value={formData.company}
              onChange={handleChange}
              required
              className="bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400"
            />
            <input
              name="role"
              placeholder="Role *"
              value={formData.role}
              onChange={handleChange}
              required
              className="bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400"
            />
            <input
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              className="bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400"
            />
            <input
              name="jobLink"
              placeholder="Job Link"
              value={formData.jobLink}
              onChange={handleChange}
              type="url"
              className="bg-slate-700 border border-slate-600 text-white p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400"
            />
          </div>
          <div className="mt-4 flex gap-2">
            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
            >
              {editingId ? 'Update Job' : 'Add Job'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={handleCancelEdit}
                className="bg-slate-600 text-white px-6 py-2 rounded-lg hover:bg-slate-500 transition-colors"
              >
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* Jobs List */}
        <div>
          <h2 className="text-xl font-semibold text-white mb-4">
            All Jobs <span className="text-gray-500">({jobs.length})</span>
          </h2>
          {jobs.length === 0 ? (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
              <p className="text-gray-400 text-lg">No jobs created yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {jobs.map(job => (
                <div
                  key={job.id}
                  className="bg-slate-800/70 border border-slate-700 rounded-lg p-4 hover:border-slate-600 transition-all hover:shadow-xl"
                >
                  <div className="mb-3">
                    <h3 className="font-bold text-white text-lg leading-tight mb-1">{job.role}</h3>
                    <p className="text-gray-400 text-sm font-medium">{job.company}</p>
                    {job.location && (
                      <p className="text-gray-500 text-xs mt-1">📍 {job.location}</p>
                    )}
                  </div>
                  {job.jobLink && (
                    <a
                      href={job.jobLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-400 text-xs hover:text-blue-300 hover:underline inline-block mb-3"
                    >
                      View Posting →
                    </a>
                  )}
                  <div className="flex gap-2 pt-3 border-t border-slate-700">
                    <button
                      onClick={() => handleEdit(job)}
                      className="flex-1 bg-blue-600 text-white text-sm py-2 rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(job.id)}
                      className="flex-1 bg-red-600 text-white text-sm py-2 rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
