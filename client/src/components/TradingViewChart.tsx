"use client";

import React, { useEffect, useRef } from "react";
import { ClientOnly } from "@/components/ClientOnly";

interface TradingViewChartProps {
  symbol: string;
  timeRange: string;
  currency: string;
}

const mapTimeRangeToInterval = (timeRange: string): string => {
  switch (timeRange) {
    case "1h":
      return "60";
    case "1d":
      return "D";
    case "1w":
      return "W";
    default:
      return "D";
  }
};

const TradingViewChartContent: React.FC<TradingViewChartProps> = ({ symbol, timeRange, currency }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Clean up previous chart
    container.innerHTML = "";

    const script = document.createElement("script");
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;

    const config = {
      width: "100%",
      height: "100%",
      symbol: symbol,
      interval: mapTimeRangeToInterval(timeRange),
      timezone: "exchange",
      theme: "light",
      style: "1",
      locale: "en",
      enable_publishing: false,
      backgroundColor: "rgba(255, 255, 255, 1)",
      gridColor: "rgba(242, 242, 242, 0.06)",
      allow_symbol_change: true,
      calendar: false,
      hide_top_toolbar: false,
      hide_legend: true,
      save_image: false,
      
      // studies: currency === "AED" ? [
      //   {
      //     id: "MAExp@tv-basicstudies",
      //     inputs: {
      //       length: 1
      //     },
      //     outputs: {
      //       "MAExp": {
      //         "styles": {
      //           "plot.color": "#000000",
      //           "plot.linewidth": 1
      //         }
      //       }
      //     }
      //   }
      // ] : [],
      // overrides: currency === "AED" ? {
      //   "script.plot_0.multiplier": 3.67
      // } : {},
    };

    script.innerHTML = JSON.stringify(config);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [symbol, timeRange, currency]);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

const TradingViewChart: React.FC<TradingViewChartProps> = (props) => {
  return (
    <ClientOnly fallback={<div className="h-full w-full min-h-[400px] bg-gray-100 animate-pulse"></div>}>
      <TradingViewChartContent {...props} />
    </ClientOnly>
  );
};

export default TradingViewChart; 