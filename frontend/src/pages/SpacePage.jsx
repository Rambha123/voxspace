import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

const API_URL = 'http://localhost:6969';

const SpacePage = () => {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isEvent, setIsEvent] = useState(false);

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

  // Fetch notices/posts
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
  }, [id]);

  // Handle new post
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const token = localStorage.getItem('token');
    try {
      const res = await axios.post(`${API_URL}/api/spaces/${id}/posts`, {
        content: newPost,
        type: isEvent ? 'event' : 'normal',
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setPosts([res.data, ...posts]);
      setNewPost('');
      setIsEvent(false);
    } catch (err) {
      console.error("Failed to create post", err);
    }
  };

  if (space==null) {
    return <div className="p-4 text-center text-white">Loading space...</div>;
  }

  return (
    <div className="max-w-3xl mx-auto p-4 text-white">
      <h1 className="text-3xl font-bold mb-4">{space.name} - Notice Board</h1>

      {/* Post Form */}
      <form onSubmit={handlePostSubmit} className="bg-white text-black p-4 rounded-xl shadow mb-6">
        <textarea
          value={newPost}
          onChange={(e) => setNewPost(e.target.value)}
          placeholder="Write a notice..."
          className="w-full border p-2 rounded resize-none"
          rows={3}
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

      {/* Posts Feed */}
      <div className="space-y-4">
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
              <div className="text-sm font-semibold">{post.authorName || 'Unknown'}</div>
              <div className="mt-1">{post.content}</div>
              <div className="text-xs text-gray-500 mt-2">{new Date(post.createdAt).toLocaleString()}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SpacePage;
