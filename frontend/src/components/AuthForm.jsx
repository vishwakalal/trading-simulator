import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login"); // or "signup"
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    let data, error;
    if (mode === "login") {
      ({ data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      }));
    } else {
      ({ data, error } = await supabase.auth.signUp({
        email,
        password,
      }));
    }

    if (error) {
      setError(error.message);
    } else {
      onLogin(data?.user);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded shadow-md mt-10 space-y-4">
      <h2 className="text-2xl font-semibold">
        {mode === "login" ? "Log In" : "Sign Up"}
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          className="w-full border p-2 rounded"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
        >
          {mode === "login" ? "Log In" : "Sign Up"}
        </button>
      </form>
      <p className="text-sm text-center">
        {mode === "login"
          ? "Don’t have an account?"
          : "Already have an account?"}{" "}
        <button
          className="text-blue-600 underline"
          onClick={() => setMode(mode === "login" ? "signup" : "login")}
        >
          {mode === "login" ? "Sign Up" : "Log In"}
        </button>
      </p>
    </div>
  );
}
