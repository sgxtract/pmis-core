"use client";

import {
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

type ModeChartItem = {
  mode_name: string;
  request_count: number;
};

type ModeDistributionChartProps = {
  data: ModeChartItem[];
};

export default function ModeDistributionChart({
  data,
}: ModeDistributionChartProps) {
  return (
    <div className="mx-auto h-[340px] w-full max-w-2xl sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="request_count"
            nameKey="mode_name"
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            label
          >
            {data.map((entry, index) => (
              <Cell key={`${entry.mode_name}-${index}`} />
            ))}
          </Pie>

          <Tooltip />

          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
