"use client";

import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import { useEffect, useState } from "react";
import { Invoice } from "@/types";

type ChartData = {
  name: string;
  total: number;
};

export function Overview({ invoices }: { invoices: Invoice[] }) {
  const [chartData, setChartData] = useState<ChartData[]>([]);

  useEffect(() => {
    try {
      // Aggregate data by month
      const monthlyTotals = Array(12).fill(0); // Initialize with 12 months

      invoices.forEach((invoice) => {
        if (!invoice.created_at?.$date.$numberLong || !invoice.totalPaid)
          return;

        const date = new Date(Number(invoice.created_at.$date.$numberLong));
        const month = date.getMonth(); // 0 (Jan) to 11 (Dec)
        monthlyTotals[month] += invoice.totalPaid; // Sum totals for the month
      });

      // Format data for Recharts
      const formattedData = monthlyTotals.map((total, index) => ({
        name: new Date(0, index).toLocaleString("default", { month: "short" }),
        total,
      }));

      setChartData(formattedData);
    } catch (error) {
      console.error("Error processing invoices:", error);
    }
  }, [invoices]);

  if (chartData.length === 0) {
    return <div>No data available to display</div>;
  }

  return (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={chartData}>
        <XAxis
          dataKey="name"
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#888888"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(value) => `$${value}`}
        />
        <Bar
          dataKey="total"
          fill="currentColor"
          radius={[4, 4, 0, 0]}
          className="fill-primary"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}
