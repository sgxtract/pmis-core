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

const MODE_COLORS: Record<string, string> = {
  "Small Value Procurement": "#361d4d",
  "Competitive Bidding": "#00403c",
  "Negotiated Procurement": "#54412a",
  "Not Yet Assigned": "#5a5061",
};

export default function ModeDistributionChart({
  data,
}: ModeDistributionChartProps) {
  return (
    <div className="mx-auto h-85 w-full max-w-2xl sm:h-100">
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
              <Cell
                key={`${entry.mode_name}-${index}`}
                fill={MODE_COLORS[entry.mode_name] ?? "#9ca3af"}
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
