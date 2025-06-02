import { useState, useRef, useEffect } from "react";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function NavBar({ user }) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const menuRef = useRef();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    window.addEventListener("mousedown", handler);
    return () => window.removeEventListener("mousedown", handler);
  }, []);

  return (
    <nav className="bg-gray-800 text-white shadow-md px-4 py-2 flex justify-between items-center mb-4 rounded">
      <Link to="/" className="flex items-center space-x-2">
        <img
          src="/Logo.png"
          alt="App Logo"
          className="h-10 w-auto transform scale-150 animate-pulse-glow"
        />
      </Link>

      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setDropdownOpen((prev) => !prev)}
          className="text-white hover:text-purple-400 focus:outline-none"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
          >
            <circle cx="12" cy="6" r="1.5" fill="currentColor" />
            <circle cx="12" cy="12" r="1.5" fill="currentColor" />
            <circle cx="12" cy="18" r="1.5" fill="currentColor" />
          </svg>
        </button>

        {dropdownOpen && (
          <div className="absolute right-0 mt-2 bg-gray-700 border border-gray-600 rounded shadow-lg z-50 px-2 py-1 min-w-max">
            <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-600">
              {user?.email}
            </div>
            <button
              onClick={() => navigate("/saved")}
              className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-600"
            >
              View Saved
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-600"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default NavBar;
