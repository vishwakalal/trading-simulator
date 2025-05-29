import { supabase } from "../lib/supabaseClient";

function NavBar({ user }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };
  return (
    <nav className="bg-white shadow-md px-4 py-2 flex justify-between items-center mb-4 rounded">
      <div className="text-lg font-semibold">📊 Trading Strategy Simulator</div>
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-700">{user?.email}</span>
        <button
          onClick={handleLogout}
          className="text-sm text-red-600 hover:underline"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}

export default NavBar;
