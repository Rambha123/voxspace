import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';


const API_URL = 'http://localhost:6969';

const SpacePage = () => {
  const [events, setEvents] = useState([]);
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isEvent, setIsEvent] = useState(false);
  const [image, setImage] = useState(null);
  //const userId = localStorage.getItem('userId');

  const navigate = useNavigate();

  // Fetch space info
  const fetchSpace = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/spaces/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSpace(res.data);
    } catch (err) {
      console.error("Failed to fetch space", err);
    }
  };
  const fetchEvents = async () => {
  try {
    const res = await axios.get(`${API_URL}/api/events`);
    const filtered = res.data.filter(event => event.spaceId === id);
    setEvents(filtered);
  } catch (err) {
    console.error("Failed to fetch events", err);
  }
};

  // Fetch posts
  const fetchPosts = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`${API_URL}/api/spaces/${id}/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(res.data);
    } catch (err) {
      console.error("Failed to fetch posts", err);
    }
  };

  useEffect(() => {
    fetchSpace();
    fetchPosts();
    fetchEvents();
  }, []);

  // Handle new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim() && !image) return;

    const token = localStorage.getItem('token');
    const formData = new FormData();
    formData.append('content', newPost);
    formData.append('type', isEvent ? 'event' : 'normal');
    if (image) formData.append('image', image);

    try {
      const res = await axios.post(`${API_URL}/api/spaces/${id}/posts`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      const authorName = localStorage.getItem('userName') || 'You';
      setPosts([{ ...res.data, authorName }, ...posts]);
      setNewPost('');
      setIsEvent(false);
      setImage(null);
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  const handleDelete = async (postId) => {
  const confirmDelete = window.confirm("Are you sure you want to delete this post?");
  if (!confirmDelete) return;

  const token = localStorage.getItem('token');
  try {
    await axios.delete(`${API_URL}/api/spaces/posts/${postId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    setPosts(posts.filter((p) => p._id !== postId));
  } catch (err) {
    console.error("Failed to delete post", err);
  }
};


  if (space == null) {
    return <div className="p-4 text-center text-white">Loading space...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto p-4 text-white grid grid-cols-1 md:grid-cols-3 gap-4">
    
      

      {/* Feed */}
      <div className="md:col-span-2 space-y-4">
        <h1 className="text-3xl font-bold mb-4 text-black">{space.name} - Notice Board </h1>
        {posts.length === 0 ? (
          <p className="text-center text-gray-300">No notices yet.</p>
        ) : (
          posts.map((post) => (
            <div
              key={post._id}
              className={`p-4 rounded-xl shadow ${
                post.type === 'event'
                  ? 'bg-yellow-100 border-l-4 border-yellow-500 text-black'
                  : 'bg-gray-100 text-black'
              }`}
            >
              <div className="flex justify-between items-center">
                <div className="text-sm font-semibold">{post.authorName || 'Unknown'}</div>
                
              <button
                onClick={() => handleDelete(post._id)}
                  className="text-red-600 text-xs"
              >
              Delete
              </button>
              

              </div>
              <div className="mt-1">{post.content}</div>
              {post.imageUrl && (
                <img
                  src={`${API_URL}/${post.imageUrl}`}
                  alt="post"
                  className="mt-2 rounded max-h-64"
                />
              )}
              <div className="text-xs text-gray-500 mt-2">
                {new Date(post.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>
      <div className="md:col-span-1">
        <form onSubmit={handlePostSubmit} className="bg-white text-black p-4 my-13 rounded-xl shadow">
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write a notice..."
            className="w-full border p-2 rounded resize-none"
            rows={3}
          />
          <input className="text-12px text-blue-500 my-2"
            type="file"
            accept="image/*"
            onChange={(e) => setImage(e.target.files[0])}
            
          />
          <div className="flex items-center justify-between mt-2">
            <label className="text-sm">
              <input
                type="checkbox"
                checked={isEvent}
                onChange={() => setIsEvent(!isEvent)}
                className="mr-2"
              />
              Mark as event
            </label>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
              Post
            </button>
          </div>
        </form>
      
      {/* Events Specific to This Space */}
      <div className="mt-6 bg-white text-black p-4 rounded-xl shadow">
           <div className="flex items-center justify-between mt-2"><h2 className="text-lg font-semibold mb-2">Events for {space.name}</h2>
           <button
              onClick={() => navigate(`/events`)}
              className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
            >
             Create
            </button></div>
            {events.length === 0 ? (
           <p className="text-sm text-gray-500">No events available for this space.</p>
          ) : (
         <ul className="space-y-3">
         {events.map((event) => (
        <li key={event._id} className="border p-3 rounded-lg hover:bg-gray-100 transition">
          <div className="font-bold">{event.title}</div>
          <div className="text-sm">{event.date} at {event.time}</div>
          {event.description && <div className="text-sm text-gray-700">{event.description}</div>}
        </li>
      ))}
    </ul>
  )}
</div>

    </div>
    </div>
  );
};

export default SpacePage;
