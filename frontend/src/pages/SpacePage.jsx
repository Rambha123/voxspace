import { useParams } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
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
  const chatEndRef = useRef(null);

  const currentUser = {
    _id: localStorage.getItem("userId"),
    name: localStorage.getItem("userName") || "You",
  };



  useEffect(() => {
    fetchSpace();
    fetchPosts();

    socket.emit('joinRoom', id);
    socket.on('loadMessages', (msgs) => setChatMessages(msgs));
    socket.on('receiveMessage', (msg) => {
      setChatMessages(prev => {
        const isDuplicate = prev.some(m =>
          m.timestamp === msg.timestamp &&
          m.sender?._id === msg.sender?._id &&
          m.content === msg.content
        );
        return isDuplicate ? prev : [...prev, msg];
      });
    });

    return () => {
      socket.emit('leaveRoom', id);
      socket.off('loadMessages');
      socket.off('receiveMessage');
    };
  }, [id]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

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

  const handlePostSubmit = async e => {
    e.preventDefault();
    if (!newPost.trim() && !image) return;

    const token = localStorage.getItem('token');
    const fd = new FormData();
    fd.append('content', newPost);
    fd.append('type', isEvent ? 'event' : 'normal');
    if (image) fd.append('image', image);

    try {
      const res = await axios.post(`${API_URL}/api/spaces/${id}/posts`, fd, {
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

  const handleDelete = async postId => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${API_URL}/api/spaces/posts/${postId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPosts(posts.filter(p => p._id !== postId));
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;
    socket.emit('sendMessage', {
      sender: currentUser,
      content: messageInput,
      timestamp: new Date().toISOString(),
      room: id
    });
    setMessageInput('');
  };

  if (!space) {
    return <div className="p-4 text-center text-white">Loading space...</div>;
  }

  return (
    <div className="min-h-screen px-4 py-8 bg-[rgb(28,37,65)] text-white">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Posts */}
        <div className="md:col-span-2 space-y-4">
          <h1 className="text-3xl font-bold mb-6 text-center">{space.name}</h1>
          {posts.length === 0 
            ? <p className="text-center text-gray-300">No notices yet.</p>
            : posts.map(post => (
              <div
                key={post._id}
                className={`p-4 rounded-xl shadow-lg ${
                  post.type === 'event' 
                    ? 'bg-yellow-300 text-black border-l-4 border-yellow-600'
                    : 'bg-[rgb(58,80,107)] hover:bg-[rgb(68,90,117)]'
                }`}
              >
                <div className="flex justify-between items-center">
                  <div className="text-sm font-semibold">
                    {post.authorName || 'Unknown'}
                  </div>
                  <button
                    onClick={() => handleDelete(post._id)}
                    className="text-red-500 text-xs hover:underline"
                  >
                    Delete
                  </button>
                </div>
                <div className="mt-2">{post.content}</div>
                {post.imageUrl && (
                  <a href={`${API_URL}/${post.imageUrl}`} target="_blank" rel="noopener noreferrer">
                    <img
                      src={`${API_URL}/${post.imageUrl}`}
                      alt="post"
                      className="mt-3 rounded max-h-64 w-full object-cover hover:opacity-90"
                    />
                  </a>
                )}
                <div className="text-xs text-gray-300 mt-2">
                  {new Date(post.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          }
        </div>

        {/* Post Form & Chat */}
        <div className="md:col-span-1 space-y-6">
          <form onSubmit={handlePostSubmit} className="bg-[rgb(58,80,107)] p-6 rounded-lg shadow-lg space-y-4">
            <h2 className="text-2xl font-semibold text-white text-center">Create Post</h2>
            <textarea
              value={newPost}
              onChange={e => setNewPost(e.target.value)}
              placeholder="Write a notice..."
              className="w-full p-2 rounded text-black border"
              rows={3}
            />
            <input
              type="file"
              accept="image/*"
              onChange={e => setImage(e.target.files[0])}
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

          <button
            onClick={() => setShowChat(!showChat)}
            className="w-full bg-blue-500 hover:bg-blue-400 text-white py-2 rounded text-center"
          >
            {showChat ? 'Close Messenger' : 'Open Messenger'}
          </button>

          {showChat && (
            <div className="bg-[rgb(58,80,107)] p-4 rounded shadow-lg text-white space-y-3">
              <h3 className="font-semibold">Space Chat</h3>
              <div className="h-40 overflow-y-auto bg-gray-800 p-2 rounded">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`text-sm mb-1 ${
                      msg.sender._id === currentUser._id ? 'text-right' : 'text-left'
                    }`}
                  >
                    <span className="font-semibold">{msg.sender.name || 'Unknown'}: </span>
                    {msg.content}
                    <div className="text-xs text-gray-400">
                      {new Date(msg.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <input
                type="text"
                placeholder="Type a message..."
                value={messageInput}
                onChange={e => setMessageInput(e.target.value)}
                className="w-full p-2 rounded text-black"
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
