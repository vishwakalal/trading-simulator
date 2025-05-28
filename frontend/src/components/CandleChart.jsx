import { createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

function CandleChart({ data, ticker, signals, indicators = [] }) {
  const chartContainerRef = useRef();
  const [showFast, setShowFast] = useState(true);
  const [showSlow, setShowSlow] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }
    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#ffffff" },
        textColor: "#333",
      },
      grid: {
        vertLines: { color: "#eee" },
        horzLines: { color: "#eee" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });
    const candleSeries = chart.addCandlestickSeries();

    let fastLine = null;
    let slowLine = null;

    const formattedData = data.map((row) => {
      const [year, month, day] = row.Date.split("-").map(Number);
      return {
        time: { year, month, day },
        open: parseFloat(row[`Open_${ticker.toUpperCase()}`]),
        high: parseFloat(row[`High_${ticker.toUpperCase()}`]),
        low: parseFloat(row[`Low_${ticker.toUpperCase()}`]),
        close: parseFloat(row[`Close_${ticker.toUpperCase()}`]),
      };
    });
    candleSeries.setData(formattedData);

    const markers = signals.map((s) => {
      const [year, month, day] = s.date.split(" ")[0].split("-").map(Number);
      return {
        time: { year, month, day },
        position: s.type.toLowerCase() === "buy" ? "belowBar" : "aboveBar",
        color: s.type.toLowerCase() === "buy" ? "#0f0" : "#f00",
        text: s.type.toLowerCase() === "buy" ? "▲" : "▼",
      };
    });

    candleSeries.setMarkers(markers);

    if (indicators.length > 0) {
      const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

      const fastData = indicators
        .filter(
          (item) =>
            isValidDate(item.date.split(" ")[0]) &&
            typeof item.fast === "number" &&
            !isNaN(item.fast)
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((item) => {
          const [year, month, day] = item.date
            .split(" ")[0]
            .split("-")
            .map(Number);
          return { time: { year, month, day }, value: item.fast };
        });

      const slowData = indicators
        .filter(
          (item) =>
            isValidDate(item.date.split(" ")[0]) &&
            typeof item.slow === "number" &&
            !isNaN(item.slow)
        )
        .sort((a, b) => new Date(a.date) - new Date(b.date))
        .map((item) => {
          const [year, month, day] = item.date
            .split(" ")[0]
            .split("-")
            .map(Number);
          return { time: { year, month, day }, value: item.slow };
        });

      if (showFast && fastData.length > 0) {
        fastLine = chart.addLineSeries({
          color: "#0000ff",
          lineWidth: 2,
          overlay: true,
          priceScaleId: "right",
        });
        fastLine.setData(fastData);
      }

      if (showSlow && slowData.length > 0) {
        slowLine = chart.addLineSeries({
          color: "#ffa500",
          lineWidth: 2,
          overlay: true,
          priceScaleId: "right",
        });
        slowLine.setData(slowData);
      }
    }

    return () => chart.remove();
  }, [data, ticker, signals, indicators, showFast, showSlow]);
  return (
    <div className="w-full space-y-2">
      <div className="flex gap-4 mb-2">
        <label className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Show Fast</span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={showFast}
              onChange={() => setShowFast(!showFast)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300"></span>
          </div>
        </label>

        <label className="flex items-center gap-3">
          <span className="text-sm text-gray-700">Show Slow</span>
          <div className="relative inline-block w-10 mr-2 align-middle select-none transition duration-200 ease-in">
            <input
              type="checkbox"
              checked={showSlow}
              onChange={() => setShowSlow(!showSlow)}
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
            />
            <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300"></span>
          </div>
        </label>
      </div>

      <div ref={chartContainerRef} className="w-full" />
    </div>
  );
}
export default CandleChart;
