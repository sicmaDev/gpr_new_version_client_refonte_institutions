import html2canvas from "html2canvas";
import React, { useEffect, useImperativeHandle, useRef, useState } from "react";
import GaugeChart from "react-gauge-chart";

// Créez un composant fonctionnel avec React.forwardRef
export const MyGaugeChart = React.forwardRef((props, ref) => {
    const chartRef = useRef(null);
    const [isChartRendered, setIsChartRendered] = useState(false);

    // Utilisez useImperativeHandle pour exposer des fonctions ou des propriétés personnalisées via la ref
    useImperativeHandle(ref, () => ({
        captureAsImage: () => {
            return new Promise((resolve, reject) => {
              if (isChartRendered) {
                if (chartRef.current) {
                  html2canvas(chartRef.current).then((canvas) => {
                    const dataURL = canvas.toDataURL('image/png');
                    resolve(dataURL);
                  }).catch((error) => {
                    reject(error);
                  });
                } else {
                  reject('Chart ref is null.');
                }
              } else {
                reject('Chart is not yet rendered.');
              }
            });
        }
    }));

    useEffect(() => {
        setIsChartRendered(true);
    }, []); // Effect runs only once after initial render
    // console.log(props);
    return (
        <div ref={chartRef}>
            <GaugeChart
                id="gauge-chart5"
                ref={chartRef}
                nrOfLevels={420}
                arcsLength={[0.3, 0.5, 0.2]}
                arcWidth="0.2"
                colors={['#5BE12C', '#F5CD19', '#EA4228']}
                textColor="#000000"
                percent={props.global_trend}
                arcPadding={0.02}
            />
        </div>
      
    );
  });