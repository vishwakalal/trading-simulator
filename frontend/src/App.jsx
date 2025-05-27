import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import "./App.css";
import StrategyForm from "./components/StrategyForm";
import BackTestResults from "./components/BackTestResults";
import axios from "axios";
function App() {
  const [results, setResults] = useState(null);
  const navigate = useNavigate();

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
        <Route path="/" element={<StrategyForm onSubmit={handleRun} />} />
        <Route path="/results" element={<BackTestResults data={results} />} />
      </Routes>
    </div>
  );
}

export default App;
