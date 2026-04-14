import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface ForecastData {
  month: string;
  forecastedBalance: number;
  trend: "positive" | "negative";
}

interface CashFlowForecastChartProps {
  data: ForecastData[];
  title?: string;
}

export function CashFlowForecastChart({
  data,
  title = "6-Month Cash Flow Forecast",
}: CashFlowForecastChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">{title}</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
          />
          <Legend />
          <Area
            type="monotone"
            dataKey="forecastedBalance"
            stroke="#3b82f6"
            fillOpacity={1}
            fill="url(#colorBalance)"
            name="Forecasted Balance"
          />
        </AreaChart>
      </ResponsiveContainer>

      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-gray-700">
          <strong>Forecast Summary:</strong> Based on historical cash flow patterns, your
          projected balance will{" "}
          {data[data.length - 1]?.trend === "positive" ? "increase" : "decrease"} over the
          next 6 months. Current trend:{" "}
          <span
            className={
              data[data.length - 1]?.trend === "positive"
                ? "text-green-600 font-semibold"
                : "text-red-600 font-semibold"
            }
          >
            {data[data.length - 1]?.trend === "positive" ? "Positive ↑" : "Negative ↓"}
          </span>
        </p>
      </div>
    </Card>
  );
}
