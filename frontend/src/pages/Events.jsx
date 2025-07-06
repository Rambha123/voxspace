import React, { useState, useEffect } from 'react';
import axios from 'axios';

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [form, setForm] = useState({ title: '', date: '', time: '', description: '' });

  // Fetch events
const fetchEvents = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await axios.get('http://localhost:6969/api/events', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setEvents(res.data);
  } catch (err) {
    console.error('Failed to fetch events:', err);
  }
};


  // Fetch spaces user has joined
const fetchSpaces = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await axios.get('http://localhost:6969/api/spaces/my-spaces', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setSpaces(res.data);
  } catch (err) {
    console.error('Failed to fetch spaces:', err);
  }
};


  useEffect(() => {
    fetchEvents();
    fetchSpaces();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAddEvent = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().split("T")[0];
    if (form.date < today) {
      alert("Cannot create an event in the past.");
      return;
    }

    if (!selectedSpace) {
      alert("Please select a space.");
      return;
    }

    try {
      const res = await axios.post('http://localhost:6969/api/events', {
        ...form,
        space: selectedSpace
      });
      setEvents([...events, res.data]);
      setForm({ title: '', date: '', time: '', description: '' });
      setSelectedSpace('');
    } catch (err) {
      console.error('Failed to add event:', err);
    }
  };

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: 'rgb(28, 37, 65)' }}>
      <div className="max-w-3xl mx-auto text-white">
        <h1 className="text-3xl font-bold mb-8 text-center">Events</h1>

        {/* Event List */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold mb-4">Available Events</h2>
          <ul className="space-y-3">
            {events.map((event) => (
              <li key={event._id} className="bg-[rgb(58,80,107)] rounded-xl p-4 shadow-lg cursor-pointer hover:bg-[rgb(68,90,117)] text transition">
                <div className="font-semibold">{event.title}</div>
                <div className="text-sm text-gray-950">
                  {event.date} at {event.time}
                </div>
                {event.description && (
                  <div className="mt-1 text-sm text-gray-950">{event.description}</div>
                )}
                {event.space && (
                  <div className="mt-1 text-sm text-gray-400 italic">Space: {event.space.name || event.space}</div>
                )}
              </li>
            ))}
          </ul>
        </div>

        {/* Add Event Form */}
        <div className="p-6 rounded-lg shadow" style={{ backgroundColor: 'rgb(58, 80, 107)' }}>
          <h2 className="text-2xl font-semibold mb-4 text-white">Add New Event</h2>
          <form onSubmit={handleAddEvent} className="space-y-4">
            {/* Space Selector */}
            <select
              value={selectedSpace}
              onChange={(e) => setSelectedSpace(e.target.value)}
              className="w-full p-2 border rounded text-black"
              required
            >
              <option value="">Select a space</option>
              {spaces.map((space) => (
                <option key={space._id} value={space._id}>
                  {space.name}
                </option>
              ))}
            </select>

            <input
              type="text"
              name="title"
              placeholder="Event title"
              value={form.title}
              onChange={handleChange}
              className="w-full p-2 border rounded text-black"
              required
            />
            <input
              type="date"
              name="date"
              value={form.date}
              onChange={handleChange}
              className="w-full p-2 border rounded text-black"
              required
            />
            <input
              type="time"
              name="time"
              value={form.time}
              onChange={handleChange}
              className="w-full p-2 border rounded text-black"
            />
            <textarea
              name="description"
              placeholder="Description"
              value={form.description}
              onChange={handleChange}
              className="w-full p-2 border rounded text-black"
              rows="3"
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
    </div>
  );
};

export default EventsPage;
