import React from "react";
import Skeleton from "react-loading-skeleton";
import "react-loading-skeleton/dist/skeleton.css";

/**
 * LazyChartSkeleton
 * 
 * Affiche un skeleton animé pendant que les données du chart ne sont pas encore chargées.
 * type: "pie" | "line" | "bar"
 * height: hauteur du skeleton
 * width: largeur du skeleton
 */
const LazyChartSkeleton = ({ type = "bar", height = 400, width = "100%" }) => {
  switch (type) {
    case "pie":
      return (
        <Skeleton
          height={height}
          width={width}
          style={{ borderRadius: "50%" }}
          baseColor="#e0e0e0"
          highlightColor="#f5f5f5"
        />
      );

    case "line":
      return (
        <div style={{ position: "relative", height, width }}>
          {/* simulate line chart as thin bars along width */}
          <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: "2px" }}>
            {Array.from({ length: 20 }).map((_, i) => (
              <Skeleton
                key={i}
                height={Math.random() * height * 0.8 + height * 0.1}
                width={`${100 / 20}%`}
                baseColor="#e0e0e0"
                highlightColor="#f5f5f5"
              />
            ))}
          </div>
        </div>
      );

    case "bar":
    default:
      return (
        <div style={{ display: "flex", alignItems: "flex-end", height, gap: "4px" }}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton
              key={i}
              height={Math.random() * height * 0.8 + height * 0.1}
              width={`${100 / 5 - 2}%`}
              baseColor="#e0e0e0"
              highlightColor="#f5f5f5"
            />
          ))}
        </div>
      );
  }
};

export default LazyChartSkeleton;
