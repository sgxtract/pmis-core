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

type ABCChartItem = {
  mode_name: string;
  total_abc: number;
};

type ABCByModeChartProps = {
  data: ABCChartItem[];
};

export default function ABCByModeChart({ data }: ABCByModeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-87.5 items-center justify-center">
        <div className="text-center">
          <p className="font-medium text-gray-700">No ABC data available</p>

          <p className="mt-1 text-sm text-gray-500">
            There are no procurement requests with ABC values in the selected
            period.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto h-90 w-full max-w-5xl sm:h-100">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{
            top: 10,
            right: 100,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis dataKey="mode_name" interval={0} tickMargin={8} height={50} />

          <YAxis
            tickFormatter={(value) =>
              `₱${Number(value).toLocaleString("en-PH", {
                notation: "compact",
                maximumFractionDigits: 1,
              })}`
            }
          />

          <Tooltip
            formatter={(value) =>
              `₱${Number(value).toLocaleString("en-PH", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}`
            }
          />

          <Bar
            dataKey="total_abc"
            name="Total ABC"
            fill="#3f73d4"
            radius={[4, 4, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
