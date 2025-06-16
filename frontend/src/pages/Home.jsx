import React, { useState } from 'react';
import { useNavigate } from "react-router-dom";

const navigate= useNavigate;

const Home = ({ isLoggedin }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  const [spaceName, setSpaceName] = useState('');
  const [joinCode, setJoinCode] = useState('');

  const [spaces, setSpaces] = useState([]); // Mock space

  //const navigate = useNavigate();

  const handleCreateSpace = () => {
    if (spaceName.trim() === "") return;
    const newSpace = {
      id: Date.now(),
      name: spaceName,
      code: Math.random().toString(36).substring(2, 8).toUpperCase()
    };
    setSpaces(prev => [...prev, newSpace]);
    setShowCreateModal(false);
    setSpaceName('');
  };

  const handleJoinSpace = () => {
    if (joinCode.trim() === "") return;
    const joinedSpace = {
      id: Date.now(),
      name: `Joined ${joinCode}`,
      code: joinCode.toUpperCase()
    };
    setSpaces(prev => [...prev, joinedSpace]);
    setShowJoinModal(false);
    setJoinCode('');
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

      <div className={`flex flex-col flex-grow ${isLoggedin ? 'lg:ml-7' : ''}`}>
        {isLoggedin && (
          <header className="flex items-center justify-between p-4 bg-[rgb(28,37,65)] text-white lg:hidden">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open sidebar"
              className="focus:outline-none"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
            <h1 className="text-lg font-semibold">Home</h1>
            <div></div>
          </header>
        )}

        <main className="flex-grow flex flex-col items-center text-white bg-[rgb(28,37,65)] p-4">
          {!isLoggedin ? (
            <div className="flex-grow flex items-center justify-center text-xl font-medium">
              Log in to see spaces
            </div>
          ) : (
            <div className="w-full ">
              {/* Top action buttons */}
              <div className="flex justify-end gap-2 mb-6">
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="px-4 py-1 text-sm bg-green-600 hover:bg-green-500 rounded"
                >
                  Create Space
                </button>
                <button
                  onClick={() => setShowJoinModal(true)}
                  className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-500 rounded"
                >
                  Join Space
                </button>
              </div>

              {/* Space cards grid */}
              {spaces.length === 0 ? (
                <p className="text-center text-lg text-gray-300">No spaces yet!</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {spaces.map(space => (
                    <div
                      key={space.id}
                      className="bg-[rgb(58,80,107)] rounded-xl p-4 shadow-lg cursor-pointer hover:bg-[rgb(68,90,117)] transition"
                      onClick={() => navigate(`/space/${space.id}`)} // You can change route
                    >
                      <h3 className="text-lg font-semibold mb-2">{space.name}</h3>
                      <p className="text-sm text-gray-300 mb-2">Code: {space.code}</p>
                      <button className="mt-auto px-3 py-1 text-sm bg-green-600 hover:bg-green-500 rounded">
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
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
