import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import CandleChart from "./CandleChart";

function formatDate(dateStr) {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleString(undefined, {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });
}

function FullStratView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [strategy, setStrategy] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStrategy = async () => {
      const user = (await supabase.auth.getUser()).data.user;
      if (!user) return;

      const { data, error } = await supabase
        .from("strategies")
        .select("*")
        .eq("id", id)
        .eq("user_id", user.id)
        .single();

      if (!error) setStrategy(data);
      setLoading(false);
    };

    fetchStrategy();
  }, [id]);

  if (loading)
    return (
      <div className="min-h-screen flex justify-center items-center bg-[#0f172a]">
        <img
          src="/Logo.png"
          alt="Loading"
          className="w-20 h-20 animate-spin-slow animate-pulse-glow"
        />
      </div>
    );

  if (!strategy) return <p className="p-4 text-red-400">Strategy not found.</p>;

  const {
    name,
    strategy: stratType,
    ticker,
    start_date,
    end_date,
    metrics,
    price_data,
    signals,
    indicators,
  } = strategy;

  return (
    <div className="mt-8 p-6 bg-gray-900 text-white rounded shadow-md w-full max-w-7xl mx-auto space-y-6">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold text-purple-400">{name}</h2>
        <p className="text-gray-400">
          {stratType?.toUpperCase()} Strategy on{" "}
          <strong className="text-white">{ticker?.toUpperCase()}</strong> from{" "}
          {formatDate(start_date)} to {formatDate(end_date)}
        </p>
      </div>

      {/* Chart */}
      {price_data?.length > 0 && (
        <div>
          <h3 className="text-lg font-medium mb-2 text-purple-300">
            Candlestick Chart
          </h3>
          <div className="bg-gray-800 border border-gray-700 rounded p-4 shadow">
            <CandleChart
              data={price_data}
              ticker={ticker}
              signals={signals}
              indicators={indicators}
              strategy={stratType}
              spyOverlay={strategy.spy_overlay}
            />
          </div>
        </div>
      )}

      {/* Metrics */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-purple-300">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {metrics &&
            Object.entries(metrics).map(([key, value]) => (
              <div
                key={key}
                className="bg-gray-800 rounded p-4 shadow text-center border border-gray-700"
              >
                <h4 className="text-sm text-gray-400 capitalize">
                  {key.replaceAll("_", " ")}
                </h4>
                <p className="text-xl font-semibold mt-1 text-white">
                  {typeof value === "number"
                    ? `${value.toFixed(2)}${
                        [
                          "total_return",
                          "capital_return",
                          "win_rate",
                          "max_drawdown",
                        ].includes(key.toLowerCase().replaceAll(" ", "_"))
                          ? "%"
                          : ""
                      }`
                    : value}
                </p>
              </div>
            ))}
          {strategy.spy_delta_return !== undefined && (
            <div className="bg-gray-800 rounded p-4 shadow text-center border border-gray-700">
              <h4 className="text-sm text-gray-400">vs. SPY</h4>
              <p
                className={`text-xl font-semibold mt-1 ${
                  Number(strategy.spy_delta_return) > 0
                    ? "text-green-400"
                    : "text-red-400"
                }`}
              >
                {Number(strategy.spy_delta_return).toFixed(2)}%
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Trade Signals */}
      <div>
        <h3 className="text-lg font-medium mb-2 text-purple-300">
          Trade Signals
        </h3>
        {signals?.length === 0 ? (
          <p className="text-sm text-gray-400">No signals generated.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-gray-700 rounded">
            <table className="w-full text-sm text-left border-collapse text-white">
              <thead className="bg-gray-800 sticky top-0 z-10 text-purple-200">
                <tr>
                  <th className="p-2 border-b border-gray-700">Type</th>
                  <th className="p-2 border-b border-gray-700">Date</th>
                  <th className="p-2 border-b border-gray-700">Price</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(signals) ? (
                  signals.map((s, i) => (
                    <tr key={i} className="border-t border-gray-700">
                      <td className="p-2 font-semibold text-purple-400">
                        {s.type?.toUpperCase()}
                      </td>
                      <td className="p-2">{s.date}</td>
                      <td className="p-2">${s.price?.toFixed(2)}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="p-2 text-gray-500">
                      Invalid signal data format.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button
        onClick={() => navigate("/saved")}
        className="flex items-center gap-2 px-4 py-2 bg-gray-800 border-purple-600 rounded hover:bg-purple-600 hover:text-white transition"
      >
        ←
      </button>
    </div>
  );
}

export default FullStratView;
