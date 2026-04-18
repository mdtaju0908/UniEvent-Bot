import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const OwnerDashboard = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // pending, active, blocked, users
  const [now, setNow] = useState(Date.now());
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');

  useEffect(() => {
    if (currentUser.role !== 'owner') {
      navigate('/owner/login');
      return;
    }
    fetchAccounts();
  }, []);

  // Live timer to show waiting duration
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/owner/accounts', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
      setLoading(false);
    } catch (err) {
      console.error(err);
      if (err.response?.status === 403 || err.response?.status === 401) {
        navigate('/owner/login');
      }
    }
  };

  const handleApprove = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/owner/update-status/${id}`, { status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
      alert('Account Approved!');
    } catch (err) {
      alert('Failed to approve');
    }
  };

  const handleBlock = async (id) => {
    if (!window.confirm('Block this account? They will not be able to login.')) return;
    try {
      await axios.put(`http://localhost:5000/api/owner/update-status/${id}`, { status: 'blocked' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
    } catch (err) {
      alert('Failed to block');
    }
  };

  const handleUnblock = async (id) => {
    try {
      await axios.put(`http://localhost:5000/api/owner/update-status/${id}`, { status: 'approved' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
      alert('Account Unblocked!');
    } catch (err) {
      alert('Failed to unblock');
    }
  };

  const handleReject = async (id) => {
    if (!window.confirm('Reject this pending account?')) return;
    try {
      await axios.put(`http://localhost:5000/api/owner/update-status/${id}`, { status: 'rejected' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
    } catch (err) {
      alert('Failed to reject');
    }
  };

  const handleAssign = async (volunteerId, adminId) => {
    try {
      await axios.post('http://localhost:5000/api/owner/assign-volunteer', { volunteerId, adminId }, {
         headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
      alert(adminId ? 'Volunteer Assigned!' : 'Volunteer Unassigned!');
    } catch (err) {
      alert('Failed to assign volunteer');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Permanently delete this account? This cannot be undone.')) return;
    try {
      await axios.delete(`http://localhost:5000/api/owner/delete-account/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchAccounts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete');
    }
  };

  if (loading) return <div className="p-10 text-center text-xl font-semibold">Loading Dashboard...</div>;

  // Filter Users
  const pendingAdmins = users.filter(u => u.role === 'admin' && u.approvalStatus === 'pending');
  const activeAdmins = users.filter(u => u.role === 'admin' && u.approvalStatus === 'approved');
  const blockedAdmins = users.filter(u => u.role === 'admin' && (u.approvalStatus === 'blocked' || u.approvalStatus === 'rejected'));
  
  const unassignedVolunteers = users.filter(u => u.role === 'volunteer' && !u.assignedAdmin);
  const assignedVolunteers = users.filter(u => u.role === 'volunteer' && u.assignedAdmin);
  const regularUsers = users.filter(u => u.role === 'user');

  const formatDuration = (createdAt) => {
    const ms = now - new Date(createdAt).getTime();
    const s = Math.floor(ms / 1000);
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    const d = Math.floor(h / 24);
    const hh = h % 24;
    return `${d}d ${hh}h ${m}m ${sec}s`;
  };

  const renderTable = (data, type) => (
    <div className="bg-white rounded-lg shadow overflow-hidden overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            {(type === 'active' || type === 'pending') && (
              <>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Events</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Forms</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Volunteers</th>
              </>
            )}
            {type === 'volunteers' && <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assign To</th>}
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center text-gray-500">No accounts found.</td>
            </tr>
          ) : (
            data.map(user => (
              <tr key={user._id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.name}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.email}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{user.role}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${user.approvalStatus === 'approved' ? 'bg-green-100 text-green-800' : 
                      user.approvalStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                    {user.approvalStatus || (user.isApproved ? 'Approved' : 'Pending')}
                  </span>
                </td>
                
                {(type === 'active' || type === 'pending') && (
                   <>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.eventsCount ?? 0}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.formsCount ?? 0}</td>
                     <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{user.volunteersAssigned ?? 0}</td>
                   </>
                )}

                {type === 'volunteers' && (
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <select 
                      className="border rounded p-1" 
                      value={user.assignedAdmin || ""}
                      onChange={(e) => handleAssign(user._id, e.target.value)}
                    >
                      <option value="">-- Unassigned --</option>
                      {activeAdmins.map(admin => (
                        <option key={admin._id} value={admin._id}>{admin.name}</option>
                      ))}
                    </select>
                  </td>
                )}

                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  {type === 'pending' && (
                    <>
                      <button onClick={() => handleApprove(user._id)} className="text-green-600 hover:text-green-900">Approve</button>
                      <button onClick={() => handleReject(user._id)} className="text-yellow-600 hover:text-yellow-900">Reject</button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </>
                  )}
                  {type === 'active' && (
                    <>
                      <button onClick={() => handleBlock(user._id)} className="text-orange-600 hover:text-orange-900">Block</button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </>
                  )}
                  {type === 'blocked' && (
                    <>
                      <button onClick={() => handleUnblock(user._id)} className="text-blue-600 hover:text-blue-900">Unblock</button>
                      <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </>
                  )}
                  {type === 'volunteers' && (
                    <>
                      {user.approvalStatus === 'pending' && (
                        <>
                          <button onClick={() => handleApprove(user._id)} className="text-green-600 hover:text-green-900">Approve</button>
                          <button onClick={() => handleReject(user._id)} className="text-yellow-600 hover:text-yellow-900">Reject</button>
                        </>
                      )}
                      {user.approvalStatus === 'approved' && (
                        <span className="text-green-700 font-semibold">Approved</span>
                      )}
                      {user.approvalStatus === 'rejected' && (
                        <span className="text-red-700 font-semibold">Rejected</span>
                      )}
                      <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                    </>
                  )}
                  {type === 'users' && (
                    <button onClick={() => handleDelete(user._id)} className="text-red-600 hover:text-red-900">Delete</button>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navbar for Owner */}
      <nav className="bg-indigo-900 text-white p-4 shadow-md sticky top-0 z-50">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-wider">UniEvent OWNER DASHBOARD</h1>
          <div className="flex items-center gap-4">
            <span>Welcome, {currentUser.name}</span>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                navigate('/owner/login');
              }}
              className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-700 transition"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex space-x-4 mb-6 border-b border-gray-300 pb-2 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${activeTab === 'pending' ? 'bg-indigo-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Pending Admins ({pendingAdmins.length})
          </button>
          <button 
            onClick={() => setActiveTab('active')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${activeTab === 'active' ? 'bg-green-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Active Admins ({activeAdmins.length})
          </button>
          <button 
            onClick={() => setActiveTab('blocked')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${activeTab === 'blocked' ? 'bg-red-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Blocked/Rejected ({blockedAdmins.length})
          </button>
          <button 
            onClick={() => setActiveTab('volunteers')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${activeTab === 'volunteers' ? 'bg-yellow-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Unassigned Volunteers ({unassignedVolunteers.length})
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-t-lg font-medium transition ${activeTab === 'users' ? 'bg-gray-600 text-white' : 'text-gray-600 hover:bg-gray-200'}`}
          >
            Regular Users ({regularUsers.length})
          </button>
        </div>

        {/* Content Area */}
        <div className="animate-fade-in">
          {activeTab === 'pending' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Pending Approvals</h2>
              <p className="text-gray-600 mb-4">These admins cannot login until you approve them.</p>
              {renderTable(pendingAdmins, 'pending')}
            </div>
          )}

          {activeTab === 'active' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Active Admins</h2>
              <p className="text-gray-600 mb-4">Admins with full access to the system.</p>
              {renderTable(activeAdmins, 'active')}
            </div>
          )}

          {activeTab === 'blocked' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Blocked & Rejected Accounts</h2>
              <p className="text-gray-600 mb-4">These accounts are currently denied access.</p>
              {renderTable(blockedAdmins, 'blocked')}
            </div>
          )}

          {activeTab === 'volunteers' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Unassigned Volunteers</h2>
              <p className="text-gray-600 mb-4">Assign these volunteers to an Admin.</p>
              {renderTable(unassignedVolunteers, 'volunteers')}
            </div>
          )}

          {activeTab === 'users' && (
            <div>
              <h2 className="text-xl font-bold mb-4 text-gray-800">Regular Users</h2>
              <p className="text-gray-600 mb-4">General accounts in the system.</p>
              {renderTable(regularUsers, 'users')}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OwnerDashboard;
