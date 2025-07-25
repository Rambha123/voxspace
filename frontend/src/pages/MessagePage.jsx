import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const API_URL = "http://localhost:6969";
const socket = io(API_URL);

const MessagesPage = () => {
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  

  const chatEndRef = useRef(null);

  const currentUser = {
    _id: localStorage.getItem("userId"),
    name: localStorage.getItem("userName") || "You",
  };

  useEffect(() => {
  socket.on("receiveMessage", (msg) => {
  // If currently chatting with sender, show message in real-time
  if (selectedUser && msg.sender._id === selectedUser._id) {
    setMessages((prev) => [...prev, msg]);
  }

  // Add to contacts if not already in list
  setContacts((prevContacts) => {
    const exists = prevContacts.some((c) => c._id === msg.sender._id);
    return exists ? prevContacts : [msg.sender, ...prevContacts];
  });
});


    return () => {
      socket.off("receiveMessage");
    };
  }, [selectedUser]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSearch = async () => {
    if (!searchEmail.trim()) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/search?email=${searchEmail}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setSearchResults(res.data ? [res.data] : []);
    } catch (err) {
      console.error("Search failed", err);
    }
  };

  const openChat = async (user) => {
    setSelectedUser(user);
    setSearchResults([]);
    setSearchEmail("");

    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/api/messages/${user._id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessages(res.data || []);

      // Save room
      setContacts((prev) => {
        const exists = prev.find((c) => c._id === user._id);
        return exists ? prev : [user, ...prev];
      
      });

      socket.emit("joinRoom", getRoomId(currentUser._id, user._id));
    } catch (err) {
      console.error("Failed to load messages", err);
    }
  };

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedUser) return;
    const msg = {
      sender: currentUser,
      recipient: selectedUser._id       ,
      content: messageInput,
      timestamp: new Date().toISOString(),
      room: getRoomId(currentUser._id, selectedUser._id),
    };
    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setMessageInput("");
  };

  const getRoomId = (id1, id2) => {
    return [id1, id2].sort().join("_"); // Unique and consistent room ID
  };

  return (
    <div className="flex h-screen bg-[rgb(28,37,65)] text-white">
      {/* Left Sidebar */}
      <aside className="w-72 bg-[rgb(28,37,50)] p-4 border-r border-gray-600">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by email"
            className="w-full px-2 py-1 text-white rounded"
          />
          <button
            onClick={handleSearch}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 text-white px-3 py-1 rounded"
          >
            Search
          </button>
        </div>
        {searchResults.length > 0 && (
          <div className="mb-4">
            <h3 className="text-sm mb-1">Search Result:</h3>
            {searchResults.map((user) => (
              <div
                key={user._id}
                onClick={() => openChat(user)}
                className="cursor-pointer p-2 rounded hover:bg-blue-500"
              >
                {user.name} ({user.email})
              </div>
            ))}
          </div>
        )}

        <hr className="border-gray-500 my-4" />
        <h3 className="text-sm mb-2">Contacts</h3>
        <div className="space-y-2">
          {contacts.map((user) => (
            <div
              key={user._id}
              onClick={() => openChat(user)}
              className={`cursor-pointer p-2 rounded ${
                selectedUser && selectedUser._id === user._id ? "bg-green-600" : "hover:bg-gray-600"
              }`}
            >
              {user.name} ({user.email})
            </div>
          ))}
        </div>
      </aside>

      {/* Right Chatbox */}
      <div className="flex-1 flex flex-col p-4">
        {selectedUser ? (
          <>
            <div className="text-xl font-semibold mb-4 border-b border-gray-500 pb-2">
              Chat with {selectedUser.name}
            </div>
            <div className="flex-1 overflow-y-auto bg-gray-800 rounded p-3">
              {messages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`mb-2 max-w-[80%] ${
                    msg.sender._id === currentUser._id ? "ml-auto text-right" : "text-left"
                  }`}
                >
                  <div className="font-semibold text-sm">{msg.sender.name}</div>
                  <div className="bg-[rgb(58,80,107)] rounded-lg px-3 py-2 inline-block">
                    {msg.content}
                  </div>
                  <div className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 flex gap-2">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded text-black"
              />
              <button
                onClick={sendMessage}
                className="bg-green-600 hover:bg-green-500 px-4 py-2 rounded"
              >
                Send
              </button>
            </div>
          </>
        ) : (
          <div className="text-gray-400 text-lg self-center mt-20">
            Select a user to start chatting
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
