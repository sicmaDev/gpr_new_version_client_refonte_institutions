import { Pie, Bar, Line, Doughnut } from "react-chartjs-2";
import { useEffect } from "react";

const chartTypes = {
  pie: Pie,
  bar: Bar,
  line: Line,
  doughnut: Doughnut,
};

export function LazyChartWrapper({ type, data, options, chartRef, visible }) {
    const ChartComponent = chartTypes[type];

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
            data={data}
            options={options}
        />
    );
}