import { createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

function CandleChart({ data, ticker, signals, indicators = [] }) {
  const chartContainerRef = useRef();
  const [showFast, setShowFast] = useState(true);
  const [showSlow, setShowSlow] = useState(true);
  const [showRSI, setShowRSI] = useState(true);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const chart = createChart(chartContainerRef.current, {
      width: chartContainerRef.current.clientWidth,
      height: 400,
      layout: {
        background: { color: "#111827" },
        textColor: "#e5e7eb",
      },
      grid: {
        vertLines: { color: "#1f2937" },
        horzLines: { color: "#1f2937" },
      },
      timeScale: {
        timeVisible: true,
        secondsVisible: false,
      },
    });

    const candleSeries = chart.addCandlestickSeries({
      upColor: "#16a34a",
      downColor: "#dc2626",
      borderUpColor: "#16a34a",
      borderDownColor: "#dc2626",
      wickUpColor: "#16a34a",
      wickDownColor: "#dc2626",
    });

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
        color: s.type.toLowerCase() === "buy" ? "#16a34a" : "#dc2626",
        text: s.type.toLowerCase() === "buy" ? "▲" : "▼",
      };
    });

    candleSeries.setMarkers(markers);

    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

    if (indicators.length > 0) {
      const fastData = indicators
        .filter(
          (item) =>
            isValidDate(item.date.split(" ")[0]) &&
            typeof item.fast === "number" &&
            !isNaN(item.fast)
        )
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
        .map((item) => {
          const [year, month, day] = item.date
            .split(" ")[0]
            .split("-")
            .map(Number);
          return { time: { year, month, day }, value: item.slow };
        });

      if (showFast && fastData.length > 0) {
        const fastLine = chart.addLineSeries({
          color: "#6366f1",
          lineWidth: 2,
        });
        fastLine.setData(fastData);
      }

      if (showSlow && slowData.length > 0) {
        const slowLine = chart.addLineSeries({
          color: "#8b5cf6",
          lineWidth: 2,
        });
        slowLine.setData(slowData);
      }
    }

    if (showRSI && indicators.some((item) => item.rsi !== undefined)) {
      const rsiData = indicators
        .filter((item) => item.rsi !== undefined && !isNaN(item.rsi))
        .map((item) => {
          const [year, month, day] = item.date
            .split(" ")[0]
            .split("-")
            .map(Number);
          return { time: { year, month, day }, value: item.rsi };
        });

      if (rsiData.length > 0) {
        const rsiSeries = chart.addLineSeries({
          color: "#ec4899",
          lineWidth: 2,
          priceScaleId: "rsi-scale",
        });
        rsiSeries.setData(rsiData);

        const drawThresholdLine = (value) => {
          const threshold = chart.addLineSeries({
            color: "#facc15",
            lineWidth: 1,
            lineStyle: 2,
            priceScaleId: "rsi-scale",
          });
          threshold.setData(rsiData.map((d) => ({ time: d.time, value })));
        };

        drawThresholdLine(70);
        drawThresholdLine(30);

        chart.priceScale("rsi-scale").applyOptions({
          position: "right",
          scaleMargins: { top: 0.7, bottom: 0 },
          borderVisible: false,
        });
      }
    }

    return () => chart.remove();
  }, [data, ticker, signals, indicators, showFast, showSlow, showRSI]);

  return (
    <div className="w-full space-y-3 text-white">
      {indicators.length > 0 && indicators[0].fast !== undefined && (
        <div className="flex gap-6 items-center text-sm">
          <label className="flex items-center gap-2">
            <span>Show Fast</span>
            <div className="relative inline-block w-10 h-6">
              <input
                type="checkbox"
                checked={showFast}
                onChange={() => setShowFast(!showFast)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-700 peer-checked:bg-purple-600 rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform peer-checked:translate-x-4" />
            </div>
          </label>
          <label className="flex items-center gap-2">
            <span>Show Slow</span>
            <div className="relative inline-block w-10 h-6">
              <input
                type="checkbox"
                checked={showSlow}
                onChange={() => setShowSlow(!showSlow)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-700 peer-checked:bg-purple-600 rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      )}
      {indicators.length > 0 && indicators[0].rsi !== undefined && (
        <div className="flex gap-6 items-center text-sm">
          <label className="flex items-center gap-2">
            <span>Show RSI</span>
            <div className="relative inline-block w-10 h-6">
              <input
                type="checkbox"
                checked={showRSI}
                onChange={() => setShowRSI(!showRSI)}
                className="sr-only peer"
              />
              <div className="w-10 h-6 bg-gray-700 peer-checked:bg-purple-600 rounded-full transition-colors" />
              <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform duration-200 transform peer-checked:translate-x-4" />
            </div>
          </label>
        </div>
      )}
      <div
        ref={chartContainerRef}
        className="w-full rounded overflow-hidden border border-gray-700"
      />
    </div>
  );
}
export default CandleChart;
