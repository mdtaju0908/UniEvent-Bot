import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

const Dashboard = () => {
  const [duties, setDuties] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const [approvalStatus, setApprovalStatus] = useState(user.approvalStatus);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  useEffect(() => {
    // Check approval status for non-users (volunteers, admins)
    if (user.role !== 'user' && user.role !== 'owner' && user.approvalStatus !== 'approved') {
       // If admin, we have a specific page. If volunteer, maybe just show a message or redirect.
       if (user.role === 'admin') navigate('/admin/pending');
       // For volunteer, we can stay here but show a warning if we don't have a pending page.
    }

    // Poll approval status for volunteers until approved
    let intervalId;
    if (user.role === 'volunteer' && user.approvalStatus !== 'approved') {
      const pollStatus = async () => {
        try {
          const res = await axios.get(`http://localhost:5000/api/auth/status/${user.id || user._id}`);
          if (res.data?.status && res.data.status !== approvalStatus) {
            setApprovalStatus(res.data.status);
            const updated = { ...user, approvalStatus: res.data.status };
            localStorage.setItem('user', JSON.stringify(updated));
          }
        } catch (err) {
          // silent fail
        }
      };
      intervalId = setInterval(pollStatus, 5000);
      // run immediately too
      pollStatus();
    }

    if (user.role === 'volunteer') {
      const fetchDuties = async () => {
        try {
          const res = await axios.get('http://localhost:5000/api/volunteers/my-duties', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setDuties(res.data);
        } catch (err) {
          console.error(err);
        }
      };
      fetchDuties();
    }

    if (user.role === 'user') {
        const fetchEvents = async () => {
            try {
                const res = await axios.get('http://localhost:5000/api/events/all');
                setUpcomingEvents(res.data.slice(0, 3)); // Show top 3
            } catch (err) {
                console.error(err);
            }
        };
        fetchEvents();
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, []);

  if (user.role !== 'user' && user.role !== 'owner' && approvalStatus !== 'approved' && user.role !== 'admin') {
      return (
          <div className="container mx-auto px-6 py-10 text-center">
              <h1 className="text-3xl font-bold text-yellow-600 mb-4">Account Pending</h1>
              <p className="text-gray-600">Your account is currently {approvalStatus}. Please contact your administrator.</p>
          </div>
      );
  }

  return (
    <div className="container mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-6">Welcome, {user.name}</h1>
      
      {user.role === 'volunteer' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Your Assigned Duties</h2>
          <div className="grid gap-4">
            {duties.length > 0 ? duties.map(duty => (
              <div key={duty._id} className="bg-white p-6 rounded-xl shadow border border-gray-100">
                <h3 className="text-lg font-bold">{duty.eventId?.title || 'Event'} - {duty.dutyTitle}</h3>
                <p className="text-gray-600 mt-2"><strong>Duty:</strong> {duty.dutyDescription}</p>
                <p className="text-gray-600"><strong>Time:</strong> {duty.timeSlot}</p>
                <span className="inline-block mt-3 px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                  {duty.status}
                </span>
              </div>
            )) : <p className="text-gray-500">No duties assigned yet.</p>}
          </div>
        </div>
      )}

      {user.role === 'user' && (
        <div>
            <div className="bg-indigo-50 p-6 rounded-xl mb-8">
                <h2 className="text-2xl font-bold mb-4">Ready for the next event?</h2>
                <p className="text-gray-600 mb-4">Explore upcoming events, register, and join the fun!</p>
                <Link to="/events" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
                    Browse All Events
                </Link>
            </div>

            <h3 className="text-xl font-bold mb-4">Upcoming Events</h3>
            <div className="grid md:grid-cols-3 gap-6">
                {upcomingEvents.map(event => (
                    <div key={event._id} className="bg-white p-4 rounded-lg shadow hover:shadow-md transition">
                        <h4 className="font-bold text-lg">{event.title}</h4>
                        <p className="text-sm text-gray-500">{event.date} | {event.venue}</p>
                    </div>
                ))}
            </div>
        </div>
      )}

      {user.role === 'admin' && (
        <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
            <h2 className="text-xl font-bold mb-2">Admin Dashboard</h2>
            <p className="text-gray-600 mb-4">Manage events, volunteers, and forms.</p>
            <Link to="/admin" className="text-blue-600 font-bold hover:underline">
                Go to Admin Panel &rarr;
            </Link>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
