import html2canvas from "html2canvas";
import React, { useImperativeHandle, useRef } from "react";
import GaugeChart from "react-gauge-chart";

export const MyGaugeChart = React.forwardRef((props, ref) => {
    const chartRef = useRef(null);

    useImperativeHandle(ref, () => ({
        captureAsImage: () => {
            return new Promise((resolve, reject) => {
                if (chartRef.current) {
                    html2canvas(chartRef.current).then((canvas) => {
                        resolve(canvas.toDataURL('image/png'));
                    }).catch(reject);
                } else {
                    reject('Chart ref is null.');
                }
            });
        }
    }));
    return (
        <div ref={chartRef} style={{ maxWidth: 260, margin: "0 auto" }}>
            <GaugeChart
                id="gauge-chart5"
                nrOfLevels={420}
                arcsLength={[0.3, 0.5, 0.2]}
                arcWidth="0.2"
                colors={['#5BE12C', '#F5CD19', '#EA4228']}
                textColor="#374151"
                percent={props.global_trend}
                arcPadding={0.02}
                style={{ width: "100%" }}
            />
        </div>
      
    );
  });