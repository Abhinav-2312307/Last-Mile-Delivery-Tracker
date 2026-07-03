import React from "react";

type ChartDataPoint = {
  label: string;
  value: number;
};

interface RevenueChartProps {
  data: ChartDataPoint[];
  title?: string;
}

export function RevenueChart({ data, title }: RevenueChartProps) {
  const maxValue = Math.max(...data.map((d) => d.value), 1);

  return (
    <div className="revenue-chart-card">
      {title && <h3>{title}</h3>}
      <div className="chart-bars-container">
        {data.map((point) => {
          const percentage = (point.value / maxValue) * 100;
          return (
            <div key={point.label} className="chart-bar-column">
              <div className="chart-bar-value-label">₹{point.value.toFixed(0)}</div>
              <div className="chart-bar-track">
                <div
                  className="chart-bar-fill"
                  style={{ height: `${Math.max(percentage, 5)}%` }}
                  title={`₹${point.value.toFixed(2)}`}
                ></div>
              </div>
              <div className="chart-bar-axis-label">{point.label}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
