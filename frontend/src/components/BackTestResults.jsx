function BackTestResults({ data }) {
  if (!data) return null;
  const {
    ticker = "",
    start_date = "",
    end_date = "",
    strategy = "",
    metrics = {},
    signals = [],
    preview = [],
  } = data;
  return (
    <div className="mt-8 p-6 bg-white rounded shadow-md w-full max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold mb-1">Backtest Results</h2>
        <p className="text-gray-600">
          {strategy.toUpperCase()} Strategy on <strong>{ticker}</strong> from{" "}
          {start_date} to {end_date}
        </p>
      </div>

      {/*metrics */}
      <div>
        <h3 className="text-lg font-medium mb-2">Performance Metrics</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
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
        <ul className="text-sm space-y-1">
          {signals.length === 0 ? (
            <p>No signals generated.</p>
          ) : (
            signals.map((s, i) => (
              <li key={i}>
                {s.type.toUpperCase()} on <strong>{s.date}</strong> at $
                {s.price.toFixed(2)}
              </li>
            ))
          )}
        </ul>
      </div>

      {/*preview*/}
      <div>
        <h3 className="text-lg font-medium mb-2">Sample of Input Data</h3>
        <pre className="bg-gray-100 p-2 text-xs rounded overflow-x-auto">
          {JSON.stringify(preview.slice(0, 5), null, 2)}
        </pre>
      </div>
    </div>
  );
}
export default BackTestResults;
