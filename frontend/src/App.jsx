import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import "./App.css";
import StrategyForm from "./components/StrategyForm";
import BackTestResults from "./components/BackTestResults";
import AuthForm from "./components/AuthForm";
import { supabase } from "./lib/supabaseClient";
import axios from "axios";

function App() {
  const [user, setUser] = useState(null);
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data?.user || null));
    supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
  }, []);

  const handleRun = async (inputs) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/backtest",
        inputs
      );
      setResults(response.data);
      navigate("/results");
    } catch (err) {
      if (err.response?.status === 400) {
        throw new Error(err.response.data.detail);
      } else {
        console.error("Backtest request failed:", err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <Routes>
        <Route
          path="/"
          element={
            user ? (
              <StrategyForm onSubmit={handleRun} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/results"
          element={
            user ? (
              <BackTestResults data={results} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />
        <Route
          path="/login"
          element={
            user ? <Navigate to="/" replace /> : <AuthForm onLogin={setUser} />
          }
        />
      </Routes>
    </div>
  );
}

export default App;
