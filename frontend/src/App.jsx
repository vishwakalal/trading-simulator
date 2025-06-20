import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { supabase } from "./lib/supabaseClient";
import "./App.css";
import StrategyForm from "./components/StrategyForm";
import BackTestResults from "./components/BackTestResults";
import AuthForm from "./components/AuthForm";
import NavBar from "./components/NavBar";
import SavedStrategies from "./components/SavedStrategies.jsx";
import FullStratView from "./components/FullStratView";
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
        `${import.meta.env.VITE_API_URL}/backtest`,
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
    <div className="min-h-screen bg-gray-900 text-white p-4">
      {user && <NavBar user={user} />}

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
        <Route path="/saved" element={<SavedStrategies />} />
        <Route path="/strategy/:id" element={<FullStratView />} />
      </Routes>
    </div>
  );
}

export default App;
