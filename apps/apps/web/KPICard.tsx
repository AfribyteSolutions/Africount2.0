import React from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { Card } from "@/components/ui/card";

interface KPICardProps {
  title: string;
  value: number | string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
  icon?: React.ReactNode;
  color?: "blue" | "green" | "red" | "amber" | "purple";
}

export function KPICard({
  title,
  value,
  unit = "",
  trend,
  trendLabel,
  icon,
  color = "blue",
}: KPICardProps) {
  const colorClasses = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    red: "bg-red-50 text-red-700 border-red-200",
    amber: "bg-amber-50 text-amber-700 border-amber-200",
    purple: "bg-purple-50 text-purple-700 border-purple-200",
  };

  const trendColor = trend && trend > 0 ? "text-green-600" : "text-red-600";
  const TrendIcon = trend && trend > 0 ? TrendingUp : TrendingDown;

  return (
    <Card className={`p-6 border-2 ${colorClasses[color]}`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium opacity-75">{title}</p>
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-3xl font-bold">
              {typeof value === "number" ? value.toLocaleString() : value}
            </p>
            {unit && <span className="text-lg opacity-75">{unit}</span>}
          </div>
          {trend !== undefined && (
            <div className={`mt-2 flex items-center gap-1 ${trendColor}`}>
              <TrendIcon className="h-4 w-4" />
              <span className="text-sm font-semibold">
                {Math.abs(trend)}% {trendLabel || "change"}
              </span>
            </div>
          )}
        </div>
        {icon && <div className="text-3xl opacity-50">{icon}</div>}
      </div>
    </Card>
  );
}
