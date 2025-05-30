import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { Link } from "react-router-dom";

function SavedStrategies() {
  const [strategies, setStrategies] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStrategies = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("strategies")
        .select("id, name, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Fetch failed:", error.message);
      } else {
        setStrategies(data);
      }
      setLoading(false);
    };

    fetchStrategies();
  }, []);

  const handleDelete = async (id) => {
    const { error } = await supabase.from("strategies").delete().eq("id", id);
    if (error) {
      console.error("Failed to delete:", error.message);
    } else {
      setStrategies(strategies.filter((s) => s.id !== id));
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-8 p-6 bg-gray-900 text-white rounded shadow space-y-4">
      <h2 className="text-2xl font-semibold text-purple-400">
        Saved Strategies
      </h2>

      {loading ? (
        <p className="text-gray-400">Loading...</p>
      ) : strategies.length === 0 ? (
        <p className="text-sm text-gray-500">No saved strategies found.</p>
      ) : (
        <ul className="divide-y divide-gray-700">
          {strategies.map((strat) => (
            <div
              key={strat.id}
              className="flex justify-between items-center px-4 py-3 border-b border-gray-700"
            >
              <div>
                <Link
                  to={`/strategy/${strat.id}`}
                  className="text-purple-300 font-medium hover:underline"
                >
                  {strat.name}
                </Link>
                <p className="text-sm text-gray-400">
                  Saved on {new Date(strat.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => handleDelete(strat.id)}
                className="text-red-500 text-sm hover:underline"
              >
                🗑️
              </button>
            </div>
          ))}
        </ul>
      )}
    </div>
  );
}

export default SavedStrategies;
