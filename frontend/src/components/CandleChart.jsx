import { createChart } from "lightweight-charts";
import { useEffect, useRef } from "react";

function CandleChart({ data, ticker, signals, indicators = [] }) {
  const chartContainerRef = useRef();
  useEffect(() => {
    if (!data || data.length === 0) {
      return;
    }
    console.log("✅ indicators (raw):", indicators);
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

      console.log("📈 fastData sample:", fastData.slice(0, 5));
      console.log("📉 slowData sample:", slowData.slice(0, 5));

      if (fastData.length > 0)
        chart
          .addLineSeries({
            color: "#0000ff",
            lineWidth: 2,
            overlay: true,
            priceScaleId: "right",
          })
          .setData(fastData);

      if (slowData.length > 0)
        chart
          .addLineSeries({
            color: "#ffa500",
            lineWidth: 2,
            overlay: true,
            priceScaleId: "right",
          })
          .setData(slowData);
    }

    return () => chart.remove();
  }, [data, ticker, signals, indicators]);
  return <div ref={chartContainerRef} className="w-full" />;
}
export default CandleChart;
