import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const Home = ({ isLoggedin }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [spaceName, setSpaceName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const navigate = useNavigate();

  const handleCreateSpace = () => {
    console.log("Creating space:", spaceName);
    // TODO: Call backend API here
    setShowCreateModal(false);
  };

  const handleJoinSpace = () => {
    console.log("Joining space with code:", joinCode);
    // TODO: Call backend API here
    setShowJoinModal(false);
  };

  return (
    <div className="flex h-screen bg-[rgb(28,37,65)]">
      {isLoggedin && (
        <aside
          className={`fixed inset-y-0 left-0 z-30 w-64 overflow-y-auto bg-[rgb(28,37,50)] p-6 text-white
            transform transition-transform duration-300 ease-in-out
            lg:static lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <h2 className="text-xl font-semibold mb-4">Sidebar</h2>
          Calendar
        </aside>
      )}

      {isLoggedin && sidebarOpen && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <div className={`flex flex-col flex-grow ${isLoggedin ? 'lg:ml-64' : ''}`}>
        {isLoggedin && (
          <header className="flex items-center justify-between p-4 bg-[rgb(28,37,65)] text-white lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="focus:outline-none"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                ></path>
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Home</h1>
            <div></div>
          </header>
        )}

        {/* Main Content */}
        <main className="flex-grow flex flex-col items-center justify-center text-white text-xl font-medium bg-[rgb(28,37,65)]">
          {!isLoggedin ? (
            'Log in to see spaces'
          ) : (
            <div className="flex flex-col items-center gap-6">
              <p>No spaces yet!!!</p>
              <div className="flex gap-4">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-6 py-2 bg-green-600 hover:bg-green-500 rounded-xl"
                >
                  Create Space
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl"
                >
                  Join Space
                </button>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Create Space Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-black">Create a New Space</h3>
            <input
              type="text"
              placeholder="Enter space name"
              className="w-full p-2 border rounded mb-4"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={handleCreateSpace} className="px-4 py-2 bg-green-600 text-white rounded">Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Join Space Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-40">
          <div className="bg-white p-6 rounded-lg w-96">
            <h3 className="text-xl font-semibold mb-4 text-black">Join a Space</h3>
            <input
              type="text"
              placeholder="Enter space code"
              className="w-full p-2 border rounded mb-4"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowJoinModal(false)} className="px-4 py-2 text-gray-600">Cancel</button>
              <button onClick={handleJoinSpace} className="px-4 py-2 bg-blue-600 text-white rounded">Join</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
