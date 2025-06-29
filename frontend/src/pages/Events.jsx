import React, { useState } from 'react';

const EventsPage = () => {
  const [events, setEvents] = useState([
    { id: 1, title: 'Team Meeting', date: '2025-07-01' },
    { id: 2, title: 'Workshop', date: '2025-07-05' },
  ]);

  const [form, setForm] = useState({ title: '', date: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEvent = (e) => {
    e.preventDefault();
    if (form.title && form.date) {
      const newEvent = {
        id: events.length + 1,
        title: form.title,
        date: form.date,
      };
      setEvents([...events, newEvent]);
      setForm({ title: '', date: '' });
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📅 Events </h1>

      {/* Available Events */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Available Events</h2>
        <ul className="space-y-3">
          {events.map((event) => (
            <li
              key={event.id}
              className="p-4 bg-white shadow rounded-lg flex justify-between"
            >
              <span>{event.title}</span>
              <span className="text-gray-500">{event.date}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Add Event Form */}
      <div className="bg-gray-100 p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Add New Event</h2>
        <form onSubmit={handleAddEvent} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Event title"
            value={form.title}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
          <button
            type="submit"
            className="px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded"
          >
            Add Event
          </button>
        </form>
      </div>
    </div>
  );
};

export default EventsPage;
