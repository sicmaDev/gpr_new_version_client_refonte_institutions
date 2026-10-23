import React, { useEffect, useMemo } from "react";
import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";

const chartTypes = {
  pie: Pie,
  bar: Bar,
  line: Line,
  doughnut: Doughnut,
};

// Chart.js calcule la couleur de survol à partir de borderColor/backgroundColor : une valeur
// null (et non absente) fait planter l'écran au survol ("can't access property "a", v is null").
// On retire donc les champs null des jeux de données pour qu'il reprenne ses couleurs par défaut.
const withoutNullFields = (data) => {
  if (!data || !Array.isArray(data.datasets)) return data;
  return {
    ...data,
    datasets: data.datasets.map((dataset) =>
      dataset && typeof dataset === "object" && !Array.isArray(dataset)
        ? Object.fromEntries(Object.entries(dataset).filter(([, value]) => value !== null))
        : dataset
    ),
  };
};

export function LazyChartWrapper({ type, data, options, chartRef, visible }) {
    const ChartComponent = chartTypes[type];
    const safeData = useMemo(() => withoutNullFields(data), [data]);

    useEffect(() => {
        return () => {
        if (chartRef?.current) {
            chartRef.current.destroy();
        }
        };
    }, []);

    if (!ChartComponent) {
        console.error("Chart type not supported:", type);
        return null;
    }

    return (
        <ChartComponent
            ref={chartRef}
            data={safeData}
            options={options}
        />
    );
}
