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

  if (!space) {
    return <div className="p-4 text-center text-white bg-[#1c2541] min-h-screen">Loading space...</div>;
  }

  return (
    <div className="min-h-screen bg-[#1c2541] text-white p-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          {space.name} 
        </h1>

        {/* Post Form */}
        <form
          onSubmit={handlePostSubmit}
          className="bg-[#3a506b] p-4 rounded-2xl shadow-lg mb-6"
        >
          <textarea
            value={newPost}
            onChange={(e) => setNewPost(e.target.value)}
            placeholder="Write a notice or event..."
            className="w-full p-3 rounded-lg text-black resize-none h-28 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <div className="flex items-center justify-between mt-4">
            
            <button
              type="submit"
              className="bg-green-600 hover:bg-green-500 text-white px-5 py-2 rounded-xl transition"
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
                className={`p-4 rounded-xl shadow-lg ${
                  post.type === 'event'
                    ? 'bg-yellow-100 border-l-4 border-yellow-500 text-black'
                    : 'bg-gray-100 text-black'
                }`}
              >
                <div className="text-sm font-semibold">
                  {post.authorName && post.authorName !== 'Unknown'
                    ? post.authorName
                    : 'Unknown User'}
                </div>
                <div className="mt-1">{post.content}</div>
                <div className="text-xs text-gray-500 mt-2">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default SpacePage;
