import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';

const API_URL = 'http://localhost:6969';

const CalendarPage = () => {
  const [calendarEvents, setCalendarEvents] = useState([]);
  const [events, setEvents] = useState([]);
  const [sidebarWidth, setSidebarWidth] = useState(350);
  const isResizingRef = useRef(false);
  const calendarRef = useRef(null);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();

  const fetchEvents = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const res = await axios.get(`${API_URL}/api/events`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const mapped = res.data.map((evt) => ({
        title: evt.title,
        date: evt.date,
        time: evt.time,
        description: evt.description,
        _id: evt._id,
        space: evt.space,
      }));

      setEvents(mapped);
      setCalendarEvents(
        mapped.map((evt) => ({
          title: evt.title,
          date: evt.date,
        }))
      );
    } catch (err) {
      console.error('Error fetching events', err);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleMouseDown = () => {
    isResizingRef.current = true;
  };

  const handleMouseUp = () => {
    isResizingRef.current = false;
  };

  const handleMouseMove = (e) => {
    if (isResizingRef.current) {
      const newWidth = Math.max(240, e.clientX);
      setSidebarWidth(newWidth);
      if (calendarRef.current) {
        calendarRef.current.getApi().updateSize();
      }
    }
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  return (
    <div className="flex h-screen bg-[rgb(28,37,65)] text-white">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        style={{ width: `${sidebarWidth}px` }}
        className="z-30 overflow-y-auto bg-[rgb(28,37,50)] p-4  flex-col relative"
      >
        <h2 className="text-xl font-semibold mb-4">Available Events</h2>
        <ul className="space-y-3 mb-10">
          {events.map((event) => (
            <li
              key={event._id}
              className="bg-[rgb(58,80,107)] rounded-xl p-4 shadow-lg cursor-pointer hover:bg-[rgb(68,90,117)] text transition"
            >
              <div className="font-semibold">{event.title}</div>
              <div className="text-sm text-gray-300">
                {event.date} at {event.time}
              </div>
              {event.description && (
                <div className="mt-1 text-sm text-gray-400">{event.description}</div>
              )}
              {event.space && (
                <div className="mt-1 text-sm text-gray-500 italic">
                  Space: {event.space.name || event.space}
                </div>
              )}
            </li>
          ))}
        </ul>

        {/* Buttons */}
        <div className="flex justify-between gap-4 mt-auto">
          <button
            onClick={() => navigate('/events')}
            className=" mx-2 px-18 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-500 rounded-xl shadow transition duration-200"
          >
            Create Event
          </button>
          
        </div>

        {/* Resizer */}
        <div
          onMouseDown={handleMouseDown}
          className="absolute right-0 top-0 h-full w-2 cursor-col-resize bg-transparent z-50"
        />
      </aside>

      {/* Calendar */}
      <main className="flex-grow p-6">
        <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
        <div className="bg-white text-black rounded-lg p-4">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin]}
            initialView="dayGridMonth"
            height="500px"
            events={calendarEvents}
            handleWindowResize={true}
          />
        </div>
      </main>
    </div>
  );
};

export default CalendarPage;
