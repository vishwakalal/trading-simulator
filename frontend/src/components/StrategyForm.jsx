import { useState } from "react";

function StrategyForm({ onSubmit }) {
  const [ticker, setTicker] = useState("");
  const [strategy, setStrategy] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [fast, setFast] = useState("");
  const [slow, setSlow] = useState("");
  const [period, setPeriod] = useState("");
  const [errors, setErrors] = useState({});
  const [multiplier, setMultiplier] = useState("");
  const [formData, setFormData] = useState({
    ticker: "",
    strategy: "",
    start_date: "",
    end_date: "",
    fast: "",
    slow: "",
    period: "",
    multiplier: "",
    stop_loss: "",
    take_profit: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!ticker.trim()) {
      newErrors.ticker = "Valid ticker is required";
    }
    if (!startDate || !endDate) {
      newErrors.date = "Valid date range is required";
    } else if (startDate > endDate) {
      newErrors.date = "Start date must be before end date";
    }
    if (strategy === "sma" || strategy === "ema") {
      if (!fast || !slow) {
        newErrors.speed = "Fast and slow values are required";
      } else if (Number(fast) > Number(slow)) {
        newErrors.speed = "Slow must be greater than fast";
      }
    }

    if (strategy === "bollinger") {
      if (!period || !multiplier) {
        newErrors.bollinger = "Both period and multiplier are required";
      }
    }
    if (strategy === "custom") {
      if (!fast || !slow || !formData.stop_loss || !formData.take_profit) {
        newErrors.custom =
          "Fast, Slow, Stop Loss, and Take Profit are required";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setErrors({});
    const inputs = {
      ticker,
      strategy,
      start_date: startDate,
      end_date: endDate,
      fast: fast !== "" ? Number(fast) : null,
      slow: slow !== "" ? Number(slow) : null,
      period: period !== "" ? Number(period) : null,
      multiplier: multiplier !== "" ? Number(multiplier) : null,
      stop_loss: formData.stop_loss !== "" ? Number(formData.stop_loss) : null,
      take_profit:
        formData.take_profit !== "" ? Number(formData.take_profit) : null,
    };

    try {
      await onSubmit(inputs);
    } catch (err) {
      setErrors((prev) => ({
        ...prev,
        ticker: err.message || "Invalid ticker",
      }));
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-gray-900 text-purple-400 p-6 rounded shadow-md space-y-6 w-full max-w-3xl mx-auto"
    >
      <h2 className="text-2xl font-semibold">Trading Strategy Inputs</h2>

      <div>
        <label className="block font-medium text-purple-300">Ticker</label>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value)}
          placeholder="Enter ticker"
          className="border border-gray-700 bg-gray-800 p-2 w-full rounded text-white placeholder-gray-600"
        />

        {errors.ticker && (
          <p className="text-red-400 text-sm mt-1">{errors.ticker}</p>
        )}
      </div>

      <div>
        <label className="block font-medium text-purple-300">Strategy</label>
        <select
          value={strategy}
          onChange={(e) => setStrategy(e.target.value)}
          placeholder="Select strategy"
          className="border border-gray-700 bg-gray-800 p-2 w-full rounded text-white placeholder-gray-600"
        >
          <option value=""></option>
          <option value="sma">SMA</option>
          <option value="ema">EMA</option>
          <option value="rsi">RSI</option>
          <option value="bollinger">Bollinger Bands</option>
          <option value="macd">MACD</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div className="w-full">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium text-purple-300">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className={`border border-gray-700 bg-gray-800 p-2 w-full rounded ${
                startDate ? "text-white" : "text-gray-600"
              } placeholder-purple-300`}
            />
          </div>
          <div className="flex-1">
            <label className="block font-medium text-purple-300">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className={`border border-gray-700 bg-gray-800 p-2 w-full rounded ${
                endDate ? "text-white" : "text-gray-600"
              } placeholder-purple-300`}
            />
          </div>
        </div>
        {errors.date && (
          <p className="text-red-400 text-sm mt-1 text-center">{errors.date}</p>
        )}
      </div>

      {(strategy === "sma" || strategy === "ema") && (
        <div className="w-full">
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block font-medium text-purple-300">Fast</label>
              <input
                type="number"
                value={fast}
                onChange={(e) => setFast(Number(e.target.value))}
                placeholder="Enter fast value"
                className="border border-gray-700 bg-gray-800 p-2 w-full rounded text-white placeholder-gray-600"
              />
            </div>
            <div className="flex-1">
              <label className="block font-medium text-purple-300">Slow</label>
              <input
                type="number"
                value={slow}
                onChange={(e) => setSlow(Number(e.target.value))}
                placeholder="Enter slow value"
                className="border border-gray-700 bg-gray-800 p-2 w-full rounded text-white placeholder-gray-600"
              />
            </div>
          </div>
          {errors.speed && (
            <p className="text-red-400 text-sm mt-1">{errors.speed}</p>
          )}
        </div>
      )}

      {strategy === "rsi" && (
        <div>
          <label className="block font-medium text-purple-300">
            RSI Period
          </label>
          <input
            type="number"
            value={period}
            onChange={(e) =>
              setPeriod(e.target.value ? Number(e.target.value) : null)
            }
            placeholder="Enter period value"
            className="border border-gray-700 bg-gray-800 p-2 w-full rounded text-white placeholder-gray-600"
          />
        </div>
      )}

      {strategy === "bollinger" && (
        <div className="w-full space-y-4">
          <div>
            <label className="block font-medium text-purple-300">Period</label>
            <input
              type="number"
              value={period}
              onChange={(e) => setPeriod(Number(e.target.value))}
              placeholder="Enter period value"
              className="border border-gray-700 bg-gray-800 p-2 w-full rounded text-white placeholder-gray-600"
            />
          </div>
          <div>
            <label className="block font-medium text-purple-300">
              Multiplier
            </label>
            <input
              type="number"
              step="0.1"
              value={multiplier}
              onChange={(e) => setMultiplier(Number(e.target.value))}
              placeholder="Enter multiplier value"
              className="border border-gray-700 bg-gray-800 p-2 w-full rounded text-white placeholder-gray-600"
            />
          </div>
          {errors.bollinger && (
            <p className="text-red-400 text-sm mt-1">{errors.bollinger}</p>
          )}
        </div>
      )}

      {strategy === "custom" && (
        <>
          <div className="flex gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300">
                Fast
              </label>
              <input
                type="number"
                value={fast}
                onChange={(e) => setFast(Number(e.target.value))}
                placeholder="Enter fast value"
                className="w-full bg-gray-800 p-2 rounded border border-gray-700 text-white placeholder-gray-600"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300">
                Slow
              </label>
              <input
                type="number"
                value={slow}
                onChange={(e) => setSlow(Number(e.target.value))}
                placeholder="Enter slow value"
                className="w-full bg-gray-800 p-2 rounded border border-gray-700 text-white placeholder-gray-600"
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Stop Loss %
            </label>
            <input
              type="number"
              step="0.001"
              name="stop_loss"
              value={formData.stop_loss || ""}
              onChange={handleChange}
              placeholder="Enter stop loss value (e.g., 0.005 for 0.5%)"
              className="w-full bg-gray-800 p-2 rounded border border-gray-700 text-white placeholder-gray-600"
            />
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300">
              Take Profit %
            </label>
            <input
              type="number"
              step="0.001"
              name="take_profit"
              value={formData.take_profit || ""}
              onChange={handleChange}
              placeholder="Enter take profit value (e.g., 0.003 for 0.3%)"
              className="w-full bg-gray-800 p-2 rounded border border-gray-700 text-white placeholder-gray-600"
            />
          </div>
        </>
      )}

      <button
        type="submit"
        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded disabled:opacity-50"
        disabled={strategy === ""}
      >
        Run
      </button>
    </form>
  );
}

export default StrategyForm;
