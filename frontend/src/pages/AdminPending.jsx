import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminPending = () => {
  const navigate = useNavigate();
  const [now, setNow] = useState(Date.now());
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
      // Poll for approval status
      const checkStatus = async () => {
          if (!user.id) return;
          try {
              const res = await axios.get(`http://localhost:5000/api/auth/status/${user.id}`);
              if (res.data.status === 'approved') {
                  // Update user object in localStorage
                  const updatedUser = { ...user, approvalStatus: 'approved' };
                  localStorage.setItem('user', JSON.stringify(updatedUser));
                  alert('Your account has been approved!');
                  navigate('/dashboard');
              }
          } catch (err) {
              console.error("Status check failed", err);
          }
      };

      const interval = setInterval(checkStatus, 5000); // Check every 5 seconds
      return () => clearInterval(interval);
  }, [user.id, navigate]);

  const formatDuration = () => {
    if (!user.createdAt) return '';
    const ms = now - new Date(user.createdAt).getTime();
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const d = Math.floor(h / 24);
    const hh = h % 24;
    return `${d}d ${hh}h ${m}m ${sec}s`;
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto animate-pulse">
            <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Account Under Review</h2>
        <p className="text-gray-600 mb-6">
          ⏳ Your admin account is currently under review. Please wait for owner approval.
        </p>
        
        <div className="bg-blue-50 p-4 rounded-lg text-sm text-blue-800 mb-6">
          Status: <span className="font-bold">Pending Approval</span>
          <div className="mt-2 text-blue-700">Waiting for: {formatDuration()}</div>
        </div>

        <button 
          onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            navigate('/login');
          }}
          className="w-full bg-gray-800 text-white py-2 px-4 rounded hover:bg-gray-900 transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

export default AdminPending;
