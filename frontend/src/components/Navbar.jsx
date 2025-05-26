import { useState } from "react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav
      style={{ backgroundColor: "rgb(28, 37, 65)" }}
      className="shadow-lg px-6 py-4"
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white">VoxSpace</div>

        {/* Desktop Links */}
        <ul className="hidden md:flex space-x-6 text-white font-medium">
          <li><a href="#" className="hover:text-green-500">Home</a></li>
          <li><a href="#" className="hover:text-green-500">Events</a></li>
          <li><a href="#" className="hover:text-green-500">Messages</a></li>
          <li><a href="#" className="hover:text-green-500">Calendar</a></li>
        </ul>

        {/* Mobile Toggle */}
        <button
          className="md:hidden text-white focus:outline-none"
          onClick={() => setIsOpen(!isOpen)}
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {isOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Links */}
      {isOpen && (
        <ul className="md:hidden mt-4 space-y-3 text-white font-medium">
          <li><a href="#" className="block hover:text-green-500">Home</a></li>
          <li><a href="#" className="block hover:text-green-500">Events</a></li>
          <li><a href="#" className="block hover:text-green-500">Messages</a></li>
          <li><a href="#" className="block hover:text-green-500">Calendar</a></li>
        </ul>
      )}
    </nav>
  );
}