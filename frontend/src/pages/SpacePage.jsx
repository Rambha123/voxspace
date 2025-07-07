
import { useParams } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";
import { io } from "socket.io-client";

const API_URL = 'http://localhost:6969';
const socket = io(API_URL);

const SpacePage = () => {
  const { id } = useParams();
  const [space, setSpace] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newPost, setNewPost] = useState('');
  const [isEvent, setIsEvent] = useState(false);
  const [image, setImage] = useState(null);
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');

  const currentUser = {
    _id: localStorage.getItem("userId"),
    name: localStorage.getItem("userName") || "You",
  };

  useEffect(() => {
    fetchSpace();
    fetchPosts();

    socket.emit('joinRoom', id);
    socket.on('receiveMessage', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.emit('leaveRoom', id);
      socket.off('receiveMessage');
    };
  }, [id]);

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

      const authorName = currentUser.name;
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

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    const message = {
      sender: currentUser,
      content: messageInput,
      timestamp: new Date(),
      room: id,
    };
    socket.emit('sendMessage', message);
    setChatMessages(prev => [...prev, message]);
    setMessageInput('');
  };

  if (space == null) {
    return <div className="p-4 text-center text-white">Loading space...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: 'rgb(28, 37, 65)' }}>
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 text-white">

        {/* Feed */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold mb-6 text-center">{space.name}</h1>

          {posts.length === 0 ? (
            <p className="text-center text-gray-300">No notices yet.</p>
          ) : (
            posts.map((post) => (
              <div
                key={post._id}
                className={`p-4 rounded-xl shadow-lg transition ${
                  post.type === 'event'
                    ? 'bg-yellow-300 text-black border-l-4 border-yellow-600'
                    : 'bg-[rgb(58,80,107)] hover:bg-[rgb(68,90,117)]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold">{post.authorName || 'Unknown'}</div>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2">{post.content}</div>
                {post.imageUrl && (
                  <img
                    src={`${API_URL}/${post.imageUrl}`}
                    alt="post"
                    className="mt-3 rounded max-h-64 w-full object-cover"
                  />
                )}
                <div className="text-xs text-gray-300 mt-2">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Post Form */}
        <div className="md:col-span-1">
          <form onSubmit={handlePostSubmit} className="bg-[rgb(58,80,107)] p-6 rounded-lg shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-white text-center mb-2">Create Post</h2>

            <textarea
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              placeholder="Write a notice..."
              className="w-full p-2 rounded text-black border"
              rows={3}
            />

            <input
              type="file"
              accept="image/*"
              onChange={(e) => setImage(e.target.files[0])}
              className="w-full text-sm text-white"
            />

            <div className="flex items-center justify-between">
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
                className="px-4 py-1 bg-green-600 hover:bg-green-500 text-white rounded"
              >
                Post
              </button>
            </div>
          </form>

          {/* Group Chat Box */}
          <div className="mt-6 text-center">
            <button
              onClick={() => setShowChat(!showChat)}
              className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded"
            >
              {showChat ? 'Close Messenger' : 'Open Messenger'}
            </button>
          </div>

          {showChat && (
            <div className="bg-[rgb(58,80,107)] mt-4 p-4 rounded shadow-lg text-white">
              <h3 className="font-semibold mb-2">Space Chat</h3>
              <div className="h-40 overflow-y-auto bg-gray-800 p-2 mb-2 rounded">
                {chatMessages.map((msg, i) => (
                  <div key={i} className={`text-sm mb-1 ${msg.sender._id === currentUser._id ? 'text-right' : 'text-left'}`}>
                    <span className="font-semibold">{msg.sender.name}: </span>
                    {msg.content}
                  </div>
                ))}
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                className="w-full p-2 rounded text-black mb-2"
              />
              <button
                onClick={handleSendMessage}
                className="w-full bg-green-600 hover:bg-green-500 text-white py-1 rounded"
              >
                Send
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SpacePage;