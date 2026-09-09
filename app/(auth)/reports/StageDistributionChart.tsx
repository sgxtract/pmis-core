"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StageChartItem = {
  stage_name: string;
  request_count: number;
};

type StageDistributionChartProps = {
  data: StageChartItem[];
};

export default function StageDistributionChart({
  data,
}: StageDistributionChartProps) {
  return (
    <div className="mx-auto h-[360px] w-full max-w-5xl sm:h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{
            top: 10,
            right: 20,
            left: 20,
            bottom: 10,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis type="number" allowDecimals={false} />

          <YAxis type="category" dataKey="stage_name" width={110} />

          <Tooltip />

          <Bar
            dataKey="request_count"
            name="Procurement Requests"
            radius={[0, 4, 4, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
