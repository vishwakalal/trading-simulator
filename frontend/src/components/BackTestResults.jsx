import { useNavigate } from "react-router-dom";
import CandleChart from "./CandleChart";

function formatDate(dateStr) {
  return `${dateStr.slice(5, 7)}/${dateStr.slice(8, 10)}/${dateStr.slice(0, 4)}`;
}

function BackTestResults({ data }) {
  const navigate = useNavigate();

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
  } = data;
  return (
    <div className="mt-8 p-6 bg-white rounded shadow-md w-full max-w-7xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Backtest Results</h2>
        <p className="text-gray-600">
          {strategy.toUpperCase()} Strategy on{" "}
          <strong>{ticker.toUpperCase()}</strong> from {formatDate(start_date)}{" "}
          to {formatDate(end_date)}
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-lg font-medium mb-2">Candlestick Chart</h3>
        <div className="bg-white border rounded p-4 shadow">
          <CandleChart
            data={price_data}
            ticker={ticker}
            signals={signals}
            indicators={data.indicators}
          />
        </div>
      </div>

      {/*metrics */}
      <div>
        <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics).map(([key, value]) => (
            <div
              key={key}
              className="bg-gray-100 rounded p-4 shadow text-center border border-gray-200"
            >
              <h4 className="text-sm text-gray-500 capitalize">
                {key.replaceAll("_", " ")}
              </h4>
              <p className="text-xl font-semibold mt-1">
                {typeof value === "number" ? value.toFixed(2) : value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/*signals */}
      <div>
        <h3 className="text-lg font-medium mb-2">Trade Signals</h3>
        {signals.length === 0 ? (
          <p className="text-sm text-gray-500">No signals generated.</p>
        ) : (
          <div className="max-h-64 overflow-y-auto border rounded">
            <table className="w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border-b">Type</th>
                  <th className="p-2 border-b">Date</th>
                  <th className="p-2 border-b">Price</th>
                </tr>
              </thead>
              <tbody>
                {signals.map((s, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-2 font-semibold text-blue-700">
                      {s.type.toUpperCase()}
                    </td>
                    <td className="p-2">{s.date}</td>
                    <td className="p-2">${s.price.toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/*preview*/}
      <div>
        <h3 className="text-lg font-medium mb-2">Sample of Input Data</h3>
        {preview.length === 0 ? (
          <p className="text-sm text-gray-500">No preview data available.</p>
        ) : (
          <div className="overflow-x-auto border rounded">
            <table className="min-w-full text-sm text-left border-collapse">
              <thead className="bg-gray-100 sticky top-0">
                <tr>
                  {Object.keys(preview[0]).map((col) => (
                    <th key={col} className="p-2 border-b capitalize">
                      {col.replace(/_/g, " ")}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.slice(0, 5).map((row, i) => (
                  <tr key={i} className="border-t">
                    {Object.values(row).map((val, j) => (
                      <td key={j} className="p-2">
                        {!isNaN(val) && typeof val === "number"
                          ? val.toFixed(2)
                          : !isNaN(Number(val)) && val !== ""
                            ? Number(val).toFixed(2)
                            : val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      <button
        onClick={() => navigate("/")}
        className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded mb-4"
      >
        ← Back to Form
      </button>
    </div>
  );
}
export default BackTestResults;
