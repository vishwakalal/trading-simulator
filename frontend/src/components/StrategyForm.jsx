import { useState } from "react";

function StrategyForm({ onSubmit }) {
  const [ticker, setTicker] = useState("");
  const [strategy, setStrategy] = useState("sma");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fast, setFast] = useState("");
  const [slow, setSlow] = useState("");
  const [period, setPeriod] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const inputs = {
      ticker: ticker,
      strategy: strategy,
      start_date: startDate,
      end_date: endDate,
      fast: fast != "" ? Number(fast) : null,
      slow: slow != "" ? Number(slow) : null,
      period: period !== "" ? Number(period) : null,
    };
    onSubmit(inputs);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white p-6 rounded shadow-md space-y-4"
    >
      <h2 className="text-2xl font-semibold">Trading Strategy Inputs</h2>
      {/*entry for ticker*/}
      <div>
        <label className="block font-medium">Ticker</label>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          className="border p-2 w-full"
        />
      </div>
      {/*drop down for strats */}
      <div>
        <label className="block font-medium">Strategy</label>
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          className="border p-2 w-full"
        >
          <option value="sma">SMA</option>
          <option value="ema">EMA</option>
          <option value="rsi">RSI</option>
        </select>
      </div>

      {/*date entry */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Start Date</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium">End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="border p-2 w-full"
          />
        </div>
      </div>

      {/*fast/slow entry */}
      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block font-medium">Fast</label>
          <input
            type="number"
            value={fast}
            onChange={(e) => setFast(Number(e.target.value))}
            className="border p-2 w-full"
          />
        </div>
        <div className="flex-1">
          <label className="block font-medium">Slow</label>
          <input
            type="number"
            value={slow}
            onChange={(e) => setSlow(Number(e.target.value))}
            className="border p-2 w-full"
          />
        </div>
      </div>

      {/*period shows up only if rsi is selected*/}
      {strategy === "rsi" && (
        <div>
          <label className="block font-medium">RSI Period</label>
          <input
            type="number"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value ? Number(e.target.value) : null)
            }
            className="border p-2 w-full"
          />
        </div>
      )}

      <button
        type="submit"
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Run
      </button>
    </form>
  );
}

export default StrategyForm;
