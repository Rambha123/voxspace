import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import logoo from '../assets/logoo.png';
import axios from "axios";

export default function Navbar({ isLoggedin, setIsLoggedIn }) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token'); 
    setIsLoggedIn(false); 
    navigate('/login'); 
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await axios.get("http://localhost:6969/api/me", {
          headers: { Authorization: `Bearer ${token}` }
        });

        setUser(res.data);
      } catch (err) {
        console.error("Failed to fetch user", err);
      }
    };

    if (isLoggedin) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isLoggedin]);

  return (
    <nav style={{ backgroundColor: "rgb(28, 37, 50)" }} className="shadow-lg px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <img src={logoo} className="h-14" alt="Logo" />
          <span className="text-2xl font-semibold text-white">Voxspace</span>
        </div>

        <ul className="hidden md:flex space-x-6 text-white font-medium items-center">
          {isLoggedin ? (
            <>
              <li><button onClick={() => navigate("/")} className="hover:text-green-500">Home</button></li>
              <li><button onClick={() => navigate("/events")} className="hover:text-green-500">Events</button></li>
              <li><button onClick={() => navigate("/calender")} className="hover:text-green-500">Calender</button></li>
              <li><button onClick={handleLogout} className="hover:text-red-500">Logout</button></li>
              <li>
                {user && (
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full cursor-pointer"
                    onClick={() => navigate("/profile")}
                  />
                )}
              </li>
              
            </>
          ) : (
            <>
              <li><button onClick={() => navigate("/login")} className="hover:text-green-500">Login</button></li>
              <li><button onClick={() => navigate("/signup")} className="hover:text-green-500">Sign Up</button></li>
            </>
          )}
        </ul>

        <button className="md:hidden text-white" onClick={() => setIsOpen(!isOpen)}>
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {isOpen && (
        <ul className="md:hidden mt-4 space-y-3 text-white font-medium">
          {isLoggedin ? (
            <>
              <li><button onClick={() => navigate("/")} className="block hover:text-green-500">Home</button></li>
              <li><button onClick={() => navigate("/events")} className="block hover:text-green-500">Events</button></li>
              <li><button onClick={() => navigate("/profile")} className="block hover:text-green-500">Profile</button></li>
              {user && (
                <li>
                  <img
                    src={
                      user.avatar ||
                      `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}`
                    }
                    alt="avatar"
                    className="w-8 h-8 rounded-full mx-auto"
                    onClick={() => navigate("/profile")}
                  />
                </li>
              )}
              <li><button onClick={handleLogout} className="block hover:text-red-500">Logout</button></li>
            </>
          ) : (
            <>
              <li><button onClick={() => navigate("/login")} className="block hover:text-green-500">Login</button></li>
              <li><button onClick={() => navigate("/signup")} className="block hover:text-green-500">Sign Up</button></li>
            </>
          )}
        </ul>
      )}
    </nav>
  );
}
