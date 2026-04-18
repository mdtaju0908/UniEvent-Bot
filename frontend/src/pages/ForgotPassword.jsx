import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('');
    try {
      await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
      setStatus('Password reset link sent to your email.');
    } catch (err) {
      setStatus(err.response?.data?.message || 'Failed to send reset link');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Forgot Password</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Enter your email"
            className="w-full p-3 border rounded-lg"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            Send Reset Link
          </button>
        </form>
        {status && <p className="mt-4 text-center text-gray-700">{status}</p>}
        <div className="mt-4 text-center">
          <button onClick={() => navigate('/login')} className="text-indigo-600 hover:underline">Back to Login</button>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
