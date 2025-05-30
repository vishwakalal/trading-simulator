import { useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabaseClient";
import { useState } from "react";
import CandleChart from "./CandleChart";
import SaveModal from "./SaveModal";

function formatDate(dateStr) {
  return `${dateStr.slice(5, 7)}/${dateStr.slice(8, 10)}/${dateStr.slice(0, 4)}`;
}

function BackTestResults({ data }) {
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);

  if (!data) return null;
  const {
    ticker = "",
    start_date = "",
    end_date = "",
    strategy = "",
    metrics = {},
    signals = [],
    preview = [],
    price_data = [],
    indicators = [],
  } = data;
  return (
    <div className="mt-8 p-6 bg-gray-900 text-white rounded shadow-md w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Backtest Results</h2>
        <p className="text-purple-300">
          {strategy.toUpperCase()} Strategy on{" "}
          <strong className="text-white">{ticker.toUpperCase()}</strong> from{" "}
          {formatDate(start_date)} to {formatDate(end_date)}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2 text-purple-400">
          Candlestick Chart
        </h3>
        <div className="bg-gray-800 border border-gray-700 rounded p-4 shadow">
          <CandleChart
            data={price_data}
            ticker={ticker}
            signals={signals}
            indicators={data.indicators}
          />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={() => setShowModal(true)}
          className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700"
        >
          Save Strategy
        </button>
      </div>

      {showModal && (
        <SaveModal
          saving={saving}
          onClose={() => setShowModal(false)}
          onSave={async (strategyTitle) => {
            setSaving(true);
            const user = (await supabase.auth.getUser()).data.user;
            const name = strategyTitle;
            let params = {};

            if (indicators?.[0]?.fast !== undefined) {
              params = { fast: indicators[0].fast, slow: indicators[0].slow };
            } else if (indicators?.[0]?.rsi !== undefined) {
              params = { period: indicators.length };
            }

            const { error } = await supabase.from("strategies").insert([
              {
                user_id: user.id,
                name,
                strategy,
                ticker,
                start_date,
                end_date,
                params,
                price_data,
                signals,
                indicators,
                metrics,
              },
            ]);

            setSaving(false);
            setShowModal(false);
            if (error) {
              console.error("Save failed:", error.message);
              alert("Error saving strategy.");
            } else {
              alert("Strategy saved!");
            }
          }}
        />
      )}

      <div>
        <h3 className="text-lg font-medium mb-2 text-purple-400">
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-800 rounded p-4 shadow text-center border border-gray-700"
            >
              <h4 className="text-sm text-purple-300 capitalize">
                {key.replaceAll("_", " ")}
              </h4>
              <p className="text-xl font-semibold mt-1 text-white">
                {typeof value === "number" ? value.toFixed(2) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-lg font-medium mb-2 text-purple-400">
          Trade Signals
        </h3>
        {signals.length === 0 ? (
          <p className="text-sm text-purple-300">No signals generated.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto border border-gray-700 rounded">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-800 sticky top-0 z-10 text-purple-300">
                <tr>
                  <th className="p-2 border-b border-gray-700">Type</th>
                  <th className="p-2 border-b border-gray-700">Date</th>
                  <th className="p-2 border-b border-gray-700">Price</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, i) => (
                  <tr key={i} className="border-t border-gray-700">
                    <td className="p-2 font-semibold text-indigo-400">
                      {s.type.toUpperCase()}
                    </td>
                    <td className="p-2 text-white">{s.date}</td>
                    <td className="p-2 text-white">${s.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <button
        onClick={() => navigate("/")}
        className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded mb-4"
      >
        ← Back to Form
      </button>
    </div>
  );
}
export default BackTestResults;
