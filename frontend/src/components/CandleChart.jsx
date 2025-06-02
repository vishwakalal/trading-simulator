import { createChart } from "lightweight-charts";
import { useEffect, useRef, useState } from "react";

function CandleChart({ data, ticker, signals, indicators = [], strategy }) {
  const chartContainerRef = useRef();
  const [showFast, setShowFast] = useState(true);
  const [showSlow, setShowSlow] = useState(true);
  const [showRSI, setShowRSI] = useState(true);
  const [showBands, setShowBands] = useState(true);
  const [showLines, setShowLines] = useState(true);
  const [showMACD, setShowMACD] = useState(true);

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
    const isValidISODate = (str) =>
      typeof str === "string" && /^\d{4}-\d{2}-\d{2}/.test(str);
    const markers = signals
      .filter(
        (s) => s?.date && typeof s.date === "string" && s.date.includes("-")
      )
      .map((s) => {
        try {
          const [year, month, day] = s.date
            .split("T")[0]
            .split("-")
            .map(Number);
          return {
            time: { year, month, day },
            position: s.type.toLowerCase() === "buy" ? "belowBar" : "aboveBar",
            color: s.type.toLowerCase() === "buy" ? "#16a34a" : "#dc2626",
            text: s.type.toLowerCase() === "buy" ? "▲" : "▼",
          };
        } catch (err) {
          console.warn("Skipping invalid signal:", s);
          return null;
        }
      })
      .filter((m) => m !== null);

    candleSeries.setMarkers(markers);

    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);
    const bollingerData = indicators
      .filter((item) => item.SMA !== undefined && isValidDate(item.date))
      .map((item) => {
        const [year, month, day] = item.date.split("-").map(Number);
        return { time: { year, month, day }, value: item.SMA };
      });

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

      const bollingerIndicators = indicators.filter(
        (item) =>
          item.SMA !== undefined &&
          item.Upper !== undefined &&
          item.Lower !== undefined
      );

      if (bollingerIndicators.length > 0) {
        const formatLine = (key) =>
          bollingerIndicators.map((item) => ({
            time: item.date,
            value: item[key],
          }));

        if (showBands) {
          const smaSeries = chart.addLineSeries({
            color: "#ffffff",
            lineWidth: 1,
          });
          smaSeries.setData(formatLine("SMA"));

          const upperSeries = chart.addLineSeries({
            color: "#facc15",
            lineWidth: 1,
          });
          upperSeries.setData(formatLine("Upper"));

          const lowerSeries = chart.addLineSeries({
            color: "#facc15",
            lineWidth: 1,
          });
          lowerSeries.setData(formatLine("Lower"));
        }
        if (showLines) {
          const drawDashedLine = (value) => {
            const series = chart.addLineSeries({
              color: "#facc15",
              lineStyle: 2,
              lineWidth: 1,
            });
            series.setData(
              bollingerIndicators.map((item) => ({
                time: item.date,
                value,
              }))
            );
          };

          const latest = bollingerIndicators[bollingerIndicators.length - 1];
          drawDashedLine(latest.Upper);
          drawDashedLine(latest.SMA);
          drawDashedLine(latest.Lower);
        }
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

      if (indicators.length > 0 && indicators[0].upper_band !== undefined) {
        const upperData = indicators.map((item) => {
          const [year, month, day] = item.date
            .split(" ")[0]
            .split("-")
            .map(Number);
          return { time: { year, month, day }, value: item.upper_band };
        });

        const lowerData = indicators.map((item) => {
          const [year, month, day] = item.date
            .split(" ")[0]
            .split("-")
            .map(Number);
          return { time: { year, month, day }, value: item.lower_band };
        });

        const upperSeries = chart.addLineSeries({
          color: "#6366f1",
          lineWidth: 1,
        });
        upperSeries.setData(upperData);

        const lowerSeries = chart.addLineSeries({
          color: "#6366f1",
          lineWidth: 1,
        });
        lowerSeries.setData(lowerData);
      }
    }

    if (strategy === "macd" && showMACD) {
      const macdData = indicators.map((item) => ({
        time: item.date,
        value: item.macd_line,
      }));
      const signalData = indicators.map((item) => ({
        time: item.date,
        value: item.signal_line,
      }));

      const macdSeries = chart.addLineSeries({
        color: "#10b981",
        lineWidth: 2,
        priceScaleId: "macd-scale",
      });
      macdSeries.setData(macdData);

      const signalSeries = chart.addLineSeries({
        color: "#f97316",
        lineWidth: 2,
        priceScaleId: "macd-scale",
      });
      signalSeries.setData(signalData);
      chart.priceScale("macd-scale").applyOptions({
        position: "right",
        scaleMargins: { top: 0.75, bottom: 0.1 },
        borderVisible: false,
      });
      const histogramData = indicators.map((item) => ({
        time: item.date,
        value: item.histogram,
        color: item.histogram >= 0 ? "#10b981" : "#ef4444",
      }));

      const histogramSeries = chart.addHistogramSeries({
        priceScaleId: "macd-scale",
        base: 0,
      });

      histogramSeries.setData(histogramData);
    }

    return () => chart.remove();
  }, [
    data,
    ticker,
    signals,
    indicators,
    strategy,
    showFast,
    showSlow,
    showRSI,
    showBands,
    showLines,
    showMACD,
  ]);

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

      {strategy === "bollinger" &&
        (() => {
          return (
            <div className="flex gap-6 items-center text-sm">
              <label className="flex items-center gap-3">
                <span className="text-sm text-white">Show Bands</span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={showBands}
                    onChange={() => setShowBands(!showBands)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600"></span>
                </div>
              </label>
              <label className="flex items-center gap-3">
                <span className="text-sm text-white">
                  Show Horizontal Lines
                </span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    checked={showLines}
                    onChange={() => setShowLines(!showLines)}
                    className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer"
                  />
                  <span className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-600"></span>
                </div>
              </label>
            </div>
          );
        })()}
      {strategy === "macd" && (
        <div className="flex gap-6 items-center text-sm">
          <label className="flex items-center gap-2">
            <span>Show MACD</span>
            <div className="relative inline-block w-10 h-6">
              <input
                type="checkbox"
                checked={showMACD}
                onChange={() => setShowMACD(!showMACD)}
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
