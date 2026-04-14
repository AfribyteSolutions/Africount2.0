import React from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card } from "@/components/ui/card";

interface ChartData {
  month: string;
  income: number;
  expense: number;
  net: number;
}

interface RevenueExpenseChartProps {
  data: ChartData[];
  title?: string;
  type?: "line" | "bar";
}

export function RevenueExpenseChart({
  data,
  title = "Revenue vs Expense",
  type = "line",
}: RevenueExpenseChartProps) {
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

  const ChartComponent = type === "line" ? LineChart : BarChart;

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <ChartComponent data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
          />
          <Legend />
          {type === "line" ? (
            <>
              <Line
                type="monotone"
                dataKey="income"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: "#10b981" }}
                name="Income"
              />
              <Line
                type="monotone"
                dataKey="expense"
                stroke="#ef4444"
                strokeWidth={2}
                dot={{ fill: "#ef4444" }}
                name="Expense"
              />
              <Line
                type="monotone"
                dataKey="net"
                stroke="#3b82f6"
                strokeWidth={2}
                dot={{ fill: "#3b82f6" }}
                name="Net"
              />
            </>
          ) : (
            <>
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expense" fill="#ef4444" name="Expense" />
            </>
          )}
        </ChartComponent>
      </ResponsiveContainer>
    </Card>
  );
}
