import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";

const API_URL = "http://localhost:6969";
const socket = io(API_URL);

const MessagesPage = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [searchEmail, setSearchEmail] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const chatEndRef = useRef(null);




  useEffect(() => {
    const id = localStorage.getItem("userId");
    const name = localStorage.getItem("userName");

    if (id) {
      setCurrentUser({ _id: id, name: name || "You" });
    }
  }, []);

  useEffect(() => {
    if (!currentUser) return;

    socket.on("receiveMessage", (msg) => {
      if (selectedUser && msg.sender._id === selectedUser._id) {
        setMessages((prev) => [...prev, msg]);
      }

      setContacts((prevContacts) => {
        const updated = {
          _id: msg.sender._id,
          name: msg.sender.name,
          email: msg.sender.email,
          lastMessage: msg.content,
          timestamp: msg.timestamp,
        };

        const filtered = prevContacts.filter((c) => c._id !== msg.sender._id);
        return [updated, ...filtered];
      });
    });

    return () => {
      socket.off("receiveMessage");
    };
  }, [currentUser, selectedUser]);

 useEffect(() => {
  const fetchMyContacts = async () => {
    const token = localStorage.getItem("token");
    if (!currentUser || !token) return;

    try {
      const res = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setContacts(res.data.contacts || []);
    } catch (err) {
      console.error("Failed to load contacts:", err.response?.data || err.message);
    }
  };

  fetchMyContacts();
}, [currentUser]);


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

    await axios.post(`${API_URL}/api/user/add-contact/${user._id}`, null, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const res = await axios.get(`${API_URL}/api/messages/${user._id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessages(res.data || []);
    const refreshContacts = async () => {
      const res = await axios.get(`${API_URL}/api/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setContacts(res.data.contacts || []);
    };
    await refreshContacts();

    if (currentUser) {
      socket.emit("joinRoom", getRoomId(currentUser._id, user._id));
    }
  } catch (err) {
    console.error("Failed to open chat or refresh contacts", err);
  }
};

  const sendMessage = () => {
    if (!messageInput.trim() || !selectedUser || !currentUser) return;

    const msg = {
      sender: currentUser,
      recipient: selectedUser._id,
      content: messageInput,
      timestamp: new Date().toISOString(),
      room: getRoomId(currentUser._id, selectedUser._id),
      isFile: false,
    };

    socket.emit("sendMessage", msg);
    setMessages((prev) => [...prev, msg]);
    setMessageInput("");
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !selectedUser || !currentUser) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(`${API_URL}/api/messages/upload`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      const fileMsg = {
        sender: currentUser,
        recipient: selectedUser._id,
        content: res.data.fileUrl,
        isFile: true,
        timestamp: new Date().toISOString(),
        room: getRoomId(currentUser._id, selectedUser._id),
      };

      socket.emit("sendMessage", fileMsg);
      setMessages((prev) => [...prev, fileMsg]);
    } catch (err) {
      console.error("File upload failed", err);
    }
  };

  const getRoomId = (id1, id2) => {
    return [id1, id2].sort().join("_");
  };

  // Show loading screen until currentUser is ready
  if (!currentUser) {
    return (
      <div className="h-screen flex items-center justify-center text-white bg-[rgb(28,37,65)]">
        Loading...
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[rgb(28,37,65)] text-white">
      {/* Sidebar */}
      <aside className="w-72 bg-[rgb(28,37,50)] p-4 border-r border-gray-600">
        <h2 className="text-lg font-semibold mb-4">Messages</h2>
        <div className="mb-4">
          <input
            type="text"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            placeholder="Search by email"
            className="w-full px-2 py-1 text-white bg-gray-700 rounded"
          />
          <button
            onClick={handleSearch}
            className="mt-2 w-full bg-blue-600 hover:bg-blue-500 px-3 py-1 rounded"
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
                selectedUser && selectedUser._id === user._id
                  ? "bg-green-600"
                  : "hover:bg-gray-600"
              }`}
            >
              <div className="font-semibold">{user.name}</div>
              <div className="text-xs text-gray-400 truncate">
                {user.lastMessage}
              </div>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Area */}
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
                    msg.sender._id === currentUser._id
                      ? "ml-auto text-right"
                      : "text-left"
                  }`}
                >
                  <div className="font-semibold text-sm">{msg.sender.name}</div>
                  {msg.isFile ? (
                    <a
                      href={msg.content}
                      download
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[rgb(58,80,107)] text-blue-300 underline px-3 py-2 inline-block rounded-lg"
                    >
                      Download File
                    </a>
                  ) : (
                    <div className="bg-[rgb(58,80,107)] rounded-lg px-3 py-2 inline-block break-all">
                      {msg.content.startsWith("http") &&
                      msg.content.includes("/uploads/messages/") ? (
                        <a
                          href={msg.content}
                          download
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-300 underline"
                        >
                          Download File
                        </a>
                      ) : (
                        msg.content
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-400">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>

            {/* Input area */}
            <div className="mt-4 flex gap-2 items-center">
              <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 p-2 rounded text-black"
              />
              <input type="file" onChange={handleFileUpload} className="text-sm" />
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
