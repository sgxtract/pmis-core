"use client";

import {
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

type StatusChartItem = {
  status_name: string;
  request_count: number;
};

type StatusDistributionChartProps = {
  data: StatusChartItem[];
};

const STATUS_COLORS: Record<string, string> = {
  Active: "#5790fa",
  Completed: "#019a53",
  Cancelled: "#c55658",
};

export default function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  return (
    <div className="mx-auto h-85 w-full max-w-2xl sm:h-100 print:h-85">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="request_count"
            nameKey="status_name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            label
          >
            {data.map((entry, index) => (
              <Cell
                key={`${entry.status_name}-${index}`}
                fill={STATUS_COLORS[entry.status_name] ?? "#9ca3af"}
              />
            ))}
          </Pie>

          <Tooltip />

          <Legend position="left" layout="vertical" />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
