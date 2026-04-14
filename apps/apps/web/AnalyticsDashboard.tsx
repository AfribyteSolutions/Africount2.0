import React, { useState, useEffect } from "react";
import { useParams } from "wouter";
import { Calendar, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { KPICard } from "@/components/charts/KPICard";
import { RevenueExpenseChart } from "@/components/charts/RevenueExpenseChart";
import { BudgetVarianceChart } from "@/components/charts/BudgetVarianceChart";
import { CashFlowForecastChart } from "@/components/charts/CashFlowForecastChart";
import { TopCategoriesChart } from "@/components/charts/TopCategoriesChart";
import { trpc } from "@/lib/trpc";

export function AnalyticsDashboard() {
  const { projectId } = useParams();
  const [refreshing, setRefreshing] = useState(false);
  const [dateRange, setDateRange] = useState({ start: "", end: "" });

  const projectIdNum = projectId ? parseInt(projectId) : 0;

  // Fetch all analytics data
  const metricsQuery = trpc.analytics.getProjectMetrics.useQuery(
    { projectId: projectIdNum },
    { enabled: projectIdNum > 0 }
  );

  const trendQuery = trpc.analytics.getRevenueExpenseTrend.useQuery(
    { projectId: projectIdNum, months: 12 },
    { enabled: projectIdNum > 0 }
  );

  const varianceQuery = trpc.analytics.getBudgetVariance.useQuery(
    { projectId: projectIdNum },
    { enabled: projectIdNum > 0 }
  );

  const forecastQuery = trpc.analytics.getCashFlowForecast.useQuery(
    { projectId: projectIdNum, forecastMonths: 6 },
    { enabled: projectIdNum > 0 }
  );

  const categoriesQuery = trpc.analytics.getTopCategories.useQuery(
    { projectId: projectIdNum, limit: 5 },
    { enabled: projectIdNum > 0 }
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.all([
      metricsQuery.refetch(),
      trendQuery.refetch(),
      varianceQuery.refetch(),
      forecastQuery.refetch(),
      categoriesQuery.refetch(),
    ]);
    setRefreshing(false);
  };

  const isLoading =
    metricsQuery.isLoading ||
    trendQuery.isLoading ||
    varianceQuery.isLoading ||
    forecastQuery.isLoading ||
    categoriesQuery.isLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading analytics...</p>
        </div>
      </div>
    );
  }

  const metrics = metricsQuery.data;
  const trendData = trendQuery.data || [];
  const varianceData = varianceQuery.data || [];
  const forecastData = forecastQuery.data || [];
  const categoriesData = categoriesQuery.data || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-1">Real-time financial insights and forecasting</p>
        </div>
        <Button
          onClick={handleRefresh}
          disabled={refreshing}
          variant="outline"
          className="gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Date Range Filter */}
      <Card className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <div className="flex items-center gap-4">
          <Calendar className="h-5 w-5 text-blue-600" />
          <div className="flex gap-4 flex-1">
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="Start date"
            />
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
              placeholder="End date"
            />
            <Button variant="secondary" size="sm">
              Apply Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Income"
          value={metrics?.totalIncome || 0}
          unit="$"
          color="green"
          icon="📈"
        />
        <KPICard
          title="Total Expenses"
          value={metrics?.totalExpense || 0}
          unit="$"
          color="red"
          icon="📉"
        />
        <KPICard
          title="Net Profit"
          value={metrics?.netProfit || 0}
          unit="$"
          color="blue"
          icon="💰"
          trend={metrics?.netProfit && metrics.netProfit > 0 ? 5 : -3}
          trendLabel="vs last month"
        />
        <KPICard
          title="Transactions"
          value={metrics?.transactionCount || 0}
          color="purple"
          icon="📊"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue vs Expense Trend */}
        <RevenueExpenseChart data={trendData} type="line" />

        {/* Top Categories */}
        <TopCategoriesChart data={categoriesData} />
      </div>

      {/* Budget Variance */}
      <BudgetVarianceChart data={varianceData as any} />

      {/* Cash Flow Forecast */}
      <CashFlowForecastChart data={forecastData as any} />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <h3 className="font-semibold text-green-900 mb-2">Average Transaction</h3>
          <p className="text-2xl font-bold text-green-700">
            ${(metrics?.averageTransaction || 0).toLocaleString()}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Profit Margin</h3>
          <p className="text-2xl font-bold text-blue-700">
            {metrics?.totalIncome && metrics.totalIncome > 0
              ? (((metrics.netProfit || 0) / metrics.totalIncome) * 100).toFixed(1)
              : 0}
            %
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <h3 className="font-semibold text-purple-900 mb-2">Expense Ratio</h3>
          <p className="text-2xl font-bold text-purple-700">
            {metrics?.totalIncome && metrics.totalIncome > 0
              ? (((metrics.totalExpense || 0) / metrics.totalIncome) * 100).toFixed(1)
              : 0}
            %
          </p>
        </Card>
      </div>
    </div>
  );
}
