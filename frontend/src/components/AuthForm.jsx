import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import "../App.css";

export default function AuthForm({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState("login");
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
      ({ data, error } = await supabase.auth.signUp({ email, password }));
    }

    if (error) {
      setError(error.message);
    } else {
      onLogin(data?.user);
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0f172a] px-4 space-y-6">
      <img
        src="/Logo.png"
        alt="VK Logo"
        className="w-32 h-32 animate-pulse-glow"
      />

      <div className="max-w-md w-full p-6 bg-gray-900 rounded shadow-md space-y-4 text-white">
        <h2 className="text-2xl font-semibold text-purple-400 text-center">
          {mode === "login" ? "Log In" : "Sign Up"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded placeholder-gray-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full border border-gray-600 bg-gray-800 text-white p-2 rounded placeholder-gray-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            className="w-full bg-purple-600 text-white py-2 rounded hover:bg-purple-700 transition"
          >
            {mode === "login" ? "Log In" : "Sign Up"}
          </button>
        </form>

        <p className="text-sm text-center text-gray-300">
          {mode === "login"
            ? "Don’t have an account?"
            : "Already have an account?"}{" "}
          <button
            className="text-purple-400 underline"
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
          >
            {mode === "login" ? "Sign Up" : "Log In"}
          </button>
        </p>
      </div>
    </div>
  );
}
