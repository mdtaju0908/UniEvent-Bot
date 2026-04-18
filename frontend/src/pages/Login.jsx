import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', formData);
      const user = res.data.user;
      
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(user));

      if (user.role === 'owner') {
        navigate('/owner/dashboard');
      } else if (user.role === 'admin' && !user.isApproved) {
        navigate('/admin/pending');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Welcome Back</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="w-full p-3 border rounded-lg"
            onChange={e => setFormData({...formData, email: e.target.value})}
            required 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="w-full p-3 border rounded-lg"
            onChange={e => setFormData({...formData, password: e.target.value})}
            required 
          />
          <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
            Login
          </button>
        </form>
        <div className="mt-4 text-center">
          <a href="/forgot-password" className="text-indigo-600 hover:underline">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
};

export default Login;
