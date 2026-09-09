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

export default function StatusDistributionChart({
  data,
}: StatusDistributionChartProps) {
  return (
    <div className="mx-auto h-[340px] w-full max-w-2xl sm:h-[400px]">
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
              <Cell key={`${entry.status_name}-${index}`} />
            ))}
          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
