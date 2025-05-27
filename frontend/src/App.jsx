import { useState } from "react";
import "./App.css";
import StrategyForm from "./components/StrategyForm";
import BackTestResults from "./components/BackTestResults";
import axios from "axios";
function App() {
  const [results, setResults] = useState(null);
  const handleRun = async (inputs) => {
    try {
      const response = await axios.post(
        "http://localhost:8000/backtest",
        inputs
      );

      setResults(response.data);
      console.log("Backtest Results:", response.data);
    } catch (err) {
      console.error("Backtest request failed:", err);
    }
  };
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <StrategyForm onSubmit={handleRun} />
      {results && <BackTestResults data={results} />}
    </div>
  );
}

export default App;
