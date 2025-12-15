import React from "react";
import { useInView } from "react-intersection-observer";

export default function LazyChart({ children, overflow, height = 600 }) {
  const { ref, inView } = useInView({
    triggerOnce: false,
    threshold: 0.2, // 20% visible => charge
  });

  return (
    overflow === "x" ? (
    <div className="customGraphScroll" ref={ref} style={{ flex: "1 auto", overflowX: "scroll", height: "100%", width: "100%" }}>
      <div class="chart-container" style={{ height: "100%", position: "relative", width: height }}>
        <div style={{ height: "100%", width: height }}>
          {inView ? children : null}
        </div> 
      </div>
    </div>
    ) : (
    <div className="scrollContainer" ref={ref} style={{ flex: "1 auto", height: "600px", overflowY: "auto" }}>
      <div style={{ height: height, width: "100%", position: "relative" }}>
        <div style={{ height: height }}>
          {inView ? children : null}
        </div> 
      </div>
    </div>
    ) 
  );
}
