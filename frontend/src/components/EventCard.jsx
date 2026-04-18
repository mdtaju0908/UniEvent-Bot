import React from 'react';

const EventCard = ({ event }) => {
  const statusColors = {
    Upcoming: 'bg-blue-100 text-blue-800',
    Live: 'bg-green-100 text-green-800',
    Completed: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <div className="p-6">
        <div className="flex justify-between items-start">
          <h3 className="text-xl font-bold text-gray-900 mb-2">{event.title}</h3>
          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${statusColors[event.status] || 'bg-gray-100'}`}>
            {event.status}
          </span>
        </div>
        <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>
        <div className="space-y-2 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <span>📅</span>
            <span>{new Date(event.date).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span>{event.venue}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventCard;
