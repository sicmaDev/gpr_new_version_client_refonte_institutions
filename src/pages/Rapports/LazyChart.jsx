import React from "react";
import { useInView } from "react-intersection-observer";
import LazyChartSkeleton from "./LazyChartSkeleton";

export default function LazyChart({ children, overflow, height = 600, forceRender = false }) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1,
  });

  if (forceRender) {
    return <div style={{ height }}>{children}</div>;
  }

  return overflow === "x" ? (
    <div className="customGraphScroll" ref={ref} style={{ flex: "1 auto", overflowX: "scroll", height: "100%", width: "100%" }}>
      <div className="chart-container" style={{ height: "100%", position: "relative", width: height }}>
        <div style={{ height: "100%", width: height }}>
          {inView ? children : <LazyChartSkeleton height={height} />}
        </div> 
      </div>
    </div>
  ) : (
    <div className="scrollContainer" ref={ref} style={{ flex: "1 auto", height: Math.min(height, 640), overflowY: "auto" }}>
      <div style={{ height: height, width: "100%", position: "relative" }}>
        <div style={{ height: height }}>
          {inView ? children : <LazyChartSkeleton height={height} />}
        </div> 
      </div>
    </div>
  );
}
