import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Card } from "@/components/ui/card";

interface VarianceData {
  category: string;
  budgeted: number;
  spent: number;
  variance: number;
  variancePercent: number;
  status: "under" | "over";
}

interface BudgetVarianceChartProps {
  data: VarianceData[];
  title?: string;
}

export function BudgetVarianceChart({
  data,
  title = "Budget vs Actual",
}: BudgetVarianceChartProps) {
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
        <BarChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="category" />
          <YAxis />
          <Tooltip
            formatter={(value: number) => `$${value.toLocaleString()}`}
            contentStyle={{ backgroundColor: "#f9fafb", border: "1px solid #e5e7eb" }}
          />
          <Legend />
          <Bar dataKey="budgeted" fill="#3b82f6" name="Budgeted" />
          <Bar dataKey="spent" fill="#8b5cf6" name="Spent">
            {data.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.status === "under" ? "#10b981" : "#ef4444"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.map((item) => (
          <div
            key={item.category}
            className={`p-4 rounded-lg border-2 ${
              item.status === "under"
                ? "bg-green-50 border-green-200"
                : "bg-red-50 border-red-200"
            }`}
          >
            <p className="font-semibold text-sm">{item.category}</p>
            <div className="mt-2 flex justify-between text-sm">
              <span>Budget: ${item.budgeted.toLocaleString()}</span>
              <span>Spent: ${item.spent.toLocaleString()}</span>
            </div>
            <div className="mt-1 text-sm font-semibold">
              {item.status === "under" ? (
                <span className="text-green-700">
                  Under by ${Math.abs(item.variance).toLocaleString()} ({item.variancePercent.toFixed(1)}%)
                </span>
              ) : (
                <span className="text-red-700">
                  Over by ${Math.abs(item.variance).toLocaleString()} ({item.variancePercent.toFixed(1)}%)
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
