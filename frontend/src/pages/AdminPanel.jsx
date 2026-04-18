import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';

const AdminPanel = () => {
  const [events, setEvents] = useState([]);
  const [users, setUsers] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [forms, setForms] = useState([]);
  const [newEvent, setNewEvent] = useState({ title: '', date: '', venue: '', description: '' });
  const [duty, setDuty] = useState({ volunteerId: '', eventId: '', dutyTitle: '', dutyDescription: '', timeSlot: '' });
  const token = localStorage.getItem('token');
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  const navigate = useNavigate();

  useEffect(() => {
    // Admin Approval Check
    if (currentUser.role === 'admin' && currentUser.approvalStatus !== 'approved') {
      navigate('/admin/pending');
      return;
    }

    fetchEvents();
    fetchUsers();
    fetchVolunteers();
    fetchForms();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/events/my-events', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchUsers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchVolunteers = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/admin/volunteers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setVolunteers(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchForms = async () => {
    try {
      const res = await axios.get('http://localhost:5000/api/forms/all', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setForms(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/events/create', newEvent, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
      setNewEvent({ title: '', date: '', venue: '', description: '' });
      alert('Event Created!');
    } catch (err) {
      alert('Failed to create event');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/events/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchEvents();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleAssignDuty = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/admin/assign-duty', duty, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDuty({ volunteerId: '', eventId: '', dutyTitle: '', dutyDescription: '', timeSlot: '' });
      alert('Duty Assigned Successfully!');
    } catch (err) {
      console.error(err);
      alert('Failed to assign duty');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (userId === currentUser.id) {
      alert('You cannot delete yourself.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/delete-user/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('User deleted successfully');
      fetchUsers();
      fetchVolunteers();
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteForm = async (id) => {
      if (!window.confirm('Are you sure you want to delete this form?')) return;
      try {
          await axios.delete(`http://localhost:5000/api/forms/${id}`, {
              headers: { Authorization: `Bearer ${token}` }
          });
          fetchForms();
          alert('Form deleted successfully');
      } catch (err) {
          console.error(err);
          alert('Failed to delete form');
      }
  };

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Signup Forms</h2>
          <Link to="/admin/create-form" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
            + Create New Form
          </Link>
        </div>
        <div className="grid gap-4">
          {forms.length === 0 ? (
            <p className="text-gray-500">No forms created yet.</p>
          ) : (
            forms.map(form => (
              <div key={form._id} className="border p-4 rounded flex flex-col md:flex-row justify-between items-center bg-gray-50 gap-4">
                <div className="text-center md:text-left">
                  <h3 className="font-bold">{form.title}</h3>
                  <p className="text-sm text-gray-600">{form.description}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 justify-center md:justify-end w-full md:w-auto">
                  <Link 
                    to={`/admin/forms/${form._id}/submissions`}
                    className="text-green-600 hover:underline text-sm"
                  >
                    View Submissions
                  </Link>
                  <Link 
                    to={`/signup/form/${form._id}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline text-sm"
                  >
                    View Public Page
                  </Link>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(`${window.location.origin}/signup/form/${form._id}`);
                      alert('Link copied to clipboard!');
                    }}
                    className="bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded text-sm"
                  >
                    Copy Link
                  </button>
                  <Link
                    to={`/admin/edit-form/${form._id}`}
                    className="bg-yellow-500 text-white hover:bg-yellow-600 px-3 py-1 rounded text-sm"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDeleteForm(form._id)}
                    className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded text-sm"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
        <form onSubmit={handleCreateEvent} className="grid gap-4 md:grid-cols-2">
          <input 
            type="text" placeholder="Title" 
            value={newEvent.title}
            onChange={e => setNewEvent({...newEvent, title: e.target.value})}
            className="p-3 border rounded" required
          />
          <input 
            type="date" 
            value={newEvent.date}
            onChange={e => setNewEvent({...newEvent, date: e.target.value})}
            className="p-3 border rounded" required
          />
          <input 
            type="text" placeholder="Venue" 
            value={newEvent.venue}
            onChange={e => setNewEvent({...newEvent, venue: e.target.value})}
            className="p-3 border rounded" required
          />
          <input 
            type="text" placeholder="Description" 
            value={newEvent.description}
            onChange={e => setNewEvent({...newEvent, description: e.target.value})}
            className="p-3 border rounded"
          />
          <button type="submit" className="md:col-span-2 bg-indigo-600 text-white p-3 rounded font-bold hover:bg-indigo-700">
            Create Event
          </button>
        </form>
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-bold mb-4">Assign Volunteer Duties</h2>
        {volunteers.length === 0 ? (
          <p className="text-red-500 mb-4">No volunteers assigned to you yet. Ask the Owner to assign volunteers to you.</p>
        ) : (
          <form onSubmit={handleAssignDuty} className="grid gap-4 md:grid-cols-2">
            <select 
              value={duty.eventId} 
              onChange={e => setDuty({...duty, eventId: e.target.value})}
              className="p-3 border rounded" required
            >
              <option value="">Select Event</option>
              {events.map(event => (
                <option key={event._id} value={event._id}>{event.title}</option>
              ))}
            </select>
            <select 
              value={duty.volunteerId} 
              onChange={e => setDuty({...duty, volunteerId: e.target.value})}
              className="p-3 border rounded" required
            >
              <option value="">Select Volunteer</option>
              {volunteers.map(volunteer => (
                <option key={volunteer._id} value={volunteer._id}>{volunteer.name} ({volunteer.email})</option>
              ))}
            </select>
            <input 
              type="text" placeholder="Duty Title" 
              value={duty.dutyTitle}
              onChange={e => setDuty({...duty, dutyTitle: e.target.value})}
              className="p-3 border rounded" required
            />
            <input 
              type="text" placeholder="Time Slot" 
              value={duty.timeSlot}
              onChange={e => setDuty({...duty, timeSlot: e.target.value})}
              className="p-3 border rounded" required
            />
            <textarea 
              placeholder="Duty Description" 
              value={duty.dutyDescription}
              onChange={e => setDuty({...duty, dutyDescription: e.target.value})}
              className="p-3 border rounded md:col-span-2" required
            />
            <button type="submit" className="md:col-span-2 bg-green-600 text-white p-3 rounded font-bold hover:bg-green-700">
              Assign Duty
            </button>
          </form>
        )}
      </div>

      {/* Assigned Volunteers Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-bold mb-4">My Assigned Volunteers</h2>
        <div className="overflow-x-auto">
          {volunteers.length === 0 ? (
             <p className="text-gray-500">No volunteers assigned yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Status</th>
                  <th className="p-3 border-b">Assigned At</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map(vol => (
                  <tr key={vol._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{vol.name}</td>
                    <td className="p-3 border-b">{vol.email}</td>
                    <td className="p-3 border-b text-green-600 font-bold">{vol.approvalStatus}</td>
                    <td className="p-3 border-b">{new Date(vol.assignedAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Regular Users Section */}
      <div className="bg-white p-6 rounded-xl shadow-lg mb-10">
        <h2 className="text-xl font-bold mb-4">Registered Users (From Forms)</h2>
        <div className="overflow-x-auto">
          {users.length === 0 ? (
            <p className="text-gray-500">No registered users yet.</p>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-100">
                  <th className="p-3 border-b">Name</th>
                  <th className="p-3 border-b">Email</th>
                  <th className="p-3 border-b">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="p-3 border-b">{user.name}</td>
                    <td className="p-3 border-b">{user.email}</td>
                    <td className="p-3 border-b">
                      <button
                        onClick={() => handleDeleteUser(user._id)}
                        className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {events.map(event => (
          <div key={event._id} className="bg-white p-6 rounded-xl shadow flex justify-between items-center">
            <div>
              <h3 className="text-xl font-bold">{event.title}</h3>
              <p className="text-gray-600">{event.date} | {event.venue}</p>
              <p className="text-gray-500 mt-2">{event.description}</p>
            </div>
            <button
              onClick={() => handleDelete(event._id)}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminPanel;