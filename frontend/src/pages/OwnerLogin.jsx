import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
      
      if (res.data.user.role !== 'owner') {
        setError('Access Denied: Not an owner account.');
        return;
      }

      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      navigate('/owner/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex justify-center items-center bg-gray-900 px-4">
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-md border-t-4 border-indigo-600">
        <h2 className="text-3xl font-bold text-center mb-2 text-gray-800">Owner Access</h2>
        <p className="text-center text-gray-500 mb-6">Restricted Area</p>
        
        {error && <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 mb-4">{error}</div>}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-gray-700 font-bold mb-2">Email</label>
            <input 
              type="email" 
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              required 
            />
          </div>
          <div>
            <label className="block text-gray-700 font-bold mb-2">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              required 
            />
          </div>
          <button type="submit" className="w-full bg-indigo-900 text-white p-3 rounded font-bold hover:bg-indigo-800 transition">
            Login as Owner
          </button>
        </form>
      </div>
    </div>
  );
};

export default OwnerLogin;
