import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    avatar: '',
    password: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {

        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:6969/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          name: res.data.name,
          avatar: res.data.avatar || '',
          password: '',
        });
      
    };
    fetchProfile();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const updatePayload = {
        name: form.name,
        avatar: form.avatar,
      };
      if (form.password) updatePayload.password = form.password;

      const res = await axios.put(
        'http://localhost:6969/api/me',
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setForm({ ...form, password: '' });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) return <div className="p-4">Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-4 text-center">Your Profile</h2>
      <div className="mt-6 text-center">
        <img
          src={
            user.avatar ||
            `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
          }
          alt="Avatar"
          className="mx-auto rounded-full w-24 h-24"
        />
        <p className="mt-2 text-sm">
          <strong>Role:</strong> {user.role} <br />
          <strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}
        </p>
      </div>
      {message.text && (
        <div
          className={`mb-4 p-3 rounded ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            value={user.email}
            disabled
            className="w-full p-2 border rounded bg-gray-100"
          />
        </div>

        <div>
          <label className="block font-medium">Name</label>
          <input
            name="name"
            type="text"
            value={form.name}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            required
          />
        </div>

        <div>
          <label className="block font-medium">Avatar URL</label>
          <input
            name="avatar"
            type="text"
            value={form.avatar}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block font-medium">New Password</label>
          <input
            name="password"
            type="password"
            value={form.password}
            onChange={handleChange}
            className="w-full p-2 border rounded"
            placeholder="Leave blank to keep current"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-500 transition"
        >
          {loading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>

      
    </div>
  );
};

export default Profile;
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Profile = ({ isLoggedin }) => {
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    avatar: '',
    password: '',
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoggedin) return; // If not logged in, skip API call

    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:6969/api/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUser(res.data);
        setForm({
          name: res.data.name,
          avatar: res.data.avatar || '',
          password: '',
        });
      } catch (err) {
        setMessage({ text: 'Failed to load profile.', type: 'error' });
      }
    };

    fetchProfile();
  }, [isLoggedin]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const updatePayload = {
        name: form.name,
        avatar: form.avatar,
      };
      if (form.password) updatePayload.password = form.password;

      const res = await axios.put(
        'http://localhost:6969/api/me',
        updatePayload,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setUser(res.data);
      setForm({ ...form, password: '' });
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err) {
      setMessage({
        text: err.response?.data?.message || 'Failed to update profile.',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  // If not logged in
  if (!isLoggedin) {
    return (
      <div className="min-h-screen bg-[rgb(28,37,65)] text-white flex items-center justify-center p-4">
        <div className="bg-[rgb(58,80,107)] p-6 rounded-xl shadow text-center">
          <p className="text-lg">Please log in to view your profile.</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 bg-green-600 hover:bg-green-500 text-white py-2 px-4 rounded"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  if (!user) return (
    <div className="min-h-screen bg-[rgb(28,37,65)] text-white flex items-center justify-center p-4">
      Loading profile...
    </div>
  );

  return (
    <div className="min-h-screen bg-[rgb(28,37,65)] flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-[rgb(58,80,107)] text-white rounded-xl shadow-md p-6">
        <h2 className="text-3xl font-bold mb-4 text-center">Profile</h2>

        <div className="mt-6 text-center">
          <img
            src={
              user.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
            }
            alt="Avatar"
            className="mx-auto rounded-full w-24 h-24 border-2 border-white"
          />
          <p className="mt-2 text-sm">
            <strong>Role:</strong> {user.role} <br />
            <strong>Verified:</strong> {user.isVerified ? 'Yes' : 'No'}<br/>
            <strong>email:</strong> {user.email}<br/>
            <strong>email:</strong> <br/>
          </p>
        </div>
        <div className="mt-10">
  <h3 className="text-xl font-semibold mb-4">Your Experiences</h3>

  {user.experiences?.length > 0 ? (
    <div className="space-y-4">
      {user.experiences.map((exp, index) => (
        <div
          key={index}
          className="bg-white border border-gray-200 rounded-xl shadow p-4"
        >
          <h4 className="text-lg font-bold text-gray-800 capitalize">{exp.title}</h4>
          <p className="text-gray-600">{exp.company}</p>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-gray-500">No experiences added yet.</p>
  )}
</div>

        {message.text && (
          <div
            className={`mb-4 p-3 rounded ${
              message.type === 'success'
                ? 'bg-green-200 text-green-900'
                : 'bg-red-200 text-red-900'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block font-medium mb-1">Email</label>
            <input
              type="email"
              value={user.email}
              disabled
              className="w-full p-2 rounded bg-gray-300 text-black"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
              required
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Avatar URL</label>
            <input
              name="avatar"
              type="text"
              value={form.avatar}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">New Password</label>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              className="w-full p-2 rounded bg-white text-black"
              placeholder="Leave blank to keep current"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-xl transition"
          >
            {loading ? 'Updating...' : 'Update Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
