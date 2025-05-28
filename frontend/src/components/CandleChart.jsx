import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

function CandleChart({ data, ticker, signals, indicators = [] }) {
  const chartContainerRef = useRef();
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
    console.log("chart:", chart);
    const candleSeries = chart.addCandlestickSeries();

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

    if (indicators.length > 0) {
      const lines = chart.addLineSeries({
        color: "#2962FF",
        lineWidth: 2,
        priceLineVisible: false,
      });
      const formattedLine = indicators.map((row) => ({
        time: row.date.slice(0, 10),
        value: row.value,
      }));
      lines.setData(formattedLine);
    }

    const markers = signals.map((s) => ({
      time: s.date.slice(0, 10),
      position: s.type.toLowerCase() === "buy" ? "belowBar" : "aboveBar",
      color: s.type.toLowerCase() === "buy" ? "#0f0" : "#f00",
      text: s.type.toLowerCase() === "buy" ? "▲" : "▼",
      size: 2,
    }));
    candleSeries.setMarkers(markers);
    return () => chart.remove();
  }, [data, ticker]);
  return <div ref={chartContainerRef} className="w-full" />;
}
export default CandleChart;
