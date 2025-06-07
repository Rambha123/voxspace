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
        const res = await axios.get('http://localhost:6969/api/users/me', {
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
        'http://localhost:6969/api/users/me',
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
          <strong>Verified:</strong> {user.verified ? 'Yes' : 'No'}
        </p>
      </div>
    </div>
  );
};

export default Profile;