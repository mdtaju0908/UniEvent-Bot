import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'user' });
  const [generatedCode, setGeneratedCode] = useState('');
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/auth/register', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user', JSON.stringify(res.data.user));
      if (res.data.user?.uniqueCode) {
        setGeneratedCode(res.data.user.uniqueCode);
        setSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        {!success ? (
          <>
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Create Account</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                placeholder="Full Name" 
                className="w-full p-3 border rounded-lg"
                onChange={e => setFormData({...formData, name: e.target.value})}
                required 
              />
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
              <select 
                className="w-full p-3 border rounded-lg"
                onChange={e => setFormData({...formData, role: e.target.value})}
              >
                <option value="user">User</option>
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
              <button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition">
                Sign Up
              </button>
            </form>
          </>
        ) : (
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Account Created ✅</h2>
            <p className="text-gray-700 mb-3">Your unique chatbot access code:</p>
            <div className="text-3xl font-extrabold tracking-wider bg-indigo-50 text-indigo-700 inline-block px-6 py-3 rounded-lg border border-indigo-200">
              {generatedCode}
            </div>
            <p className="text-sm text-gray-600 mt-3">Save this code. You'll need it to access the chatbot on the Home page.</p>
            <button 
              onClick={() => navigate('/dashboard')} 
              className="mt-6 w-full bg-indigo-600 text-white p-3 rounded-lg font-semibold hover:bg-indigo-700 transition"
            >
              Go to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Register;
