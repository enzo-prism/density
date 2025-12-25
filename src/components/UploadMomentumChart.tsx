"use client";

import { useId, useMemo } from "react";
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
} from "recharts";
import { listDatesInRange } from "@/lib/dates";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

type UploadMomentumChartProps = {
  days: Record<string, number>;
  startDate: string;
  endDate: string;
  timezone: string;
};

const monthLabels = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

function formatShortDate(date: string) {
  if (typeof date !== "string") {
    return "";
  }
  const [year, month, day] = date.split("-");
  if (!year || !month || !day) {
    return date;
  }
  const monthIndex = Number(month) - 1;
  const dayNumber = Number(day);
  if (!Number.isFinite(monthIndex) || monthIndex < 0 || monthIndex > 11) {
    return date;
  }
  const dayLabel = Number.isFinite(dayNumber) ? String(dayNumber) : day;
  return `${monthLabels[monthIndex]} ${dayLabel}`;
}

export default function UploadMomentumChart({
  days,
  startDate,
  endDate,
  timezone,
}: UploadMomentumChartProps) {
  const gradientId = useId().replace(/:/g, "");
  const chartConfig = {
    uploads: { label: "Uploads", color: "hsl(var(--chart-1))" },
    avg7: { label: "7-day avg", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const chartData = useMemo(() => {
    const dates = listDatesInRange(startDate, endDate);
    const uploadsSeries = dates.map((date) => days[date] ?? 0);
    const prefixSum: number[] = [0];
    for (let i = 0; i < uploadsSeries.length; i += 1) {
      prefixSum.push(prefixSum[i] + uploadsSeries[i]);
    }
    return dates.map((date, index) => {
      const start = Math.max(0, index - 6);
      const total = prefixSum[index + 1] - prefixSum[start];
      const avg = total / (index - start + 1);
      return {
        date,
        uploads: uploadsSeries[index] ?? 0,
        avg7: Number(avg.toFixed(1)),
      };
    });
  }, [days, startDate, endDate]);

  const integerFormatter = useMemo(
    () => new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }),
    []
  );
  const avgFormatter = useMemo(
    () =>
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 1,
        maximumFractionDigits: 1,
      }),
    []
  );
  const disableAnimations = useMemo(() => chartData.length > 400, [chartData.length]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Upload momentum</CardTitle>
        <CardDescription>
          Daily uploads with a 7-day rolling average. Timezone: {timezone}.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="min-h-[220px] h-[260px] w-full aspect-auto sm:h-[240px]"
        >
          <ComposedChart data={chartData} accessibilityLayer>
            <defs>
              <linearGradient id={`uploads-gradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-uploads)"
                  stopOpacity={0.6}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-uploads)"
                  stopOpacity={0.05}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              minTickGap={24}
              tickMargin={8}
              tickFormatter={formatShortDate}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <ChartTooltip
              cursor={{ strokeDasharray: "3 3" }}
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) {
                  return null;
                }
                const uploadsItem = payload.find(
                  (item) => item.dataKey === "uploads"
                );
                const avgItem = payload.find((item) => item.dataKey === "avg7");
                const uploads =
                  typeof uploadsItem?.value === "number"
                    ? uploadsItem.value
                    : 0;
                const avg7 =
                  typeof avgItem?.value === "number" ? avgItem.value : 0;
                return (
                  <ChartTooltipContent
                    active={active}
                    payload={payload.length > 0 ? [payload[0]] : payload}
                    hideLabel
                    hideIndicator
                    formatter={() => (
                      <div className="space-y-1">
                        <div className="text-xs font-medium text-foreground">
                          {typeof label === "string" ? label : ""}
                        </div>
                        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                          <span>Uploads</span>
                          <span className="text-foreground">
                            {integerFormatter.format(uploads)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-4 text-xs text-muted-foreground">
                          <span>7-day avg</span>
                          <span className="text-foreground">
                            {avgFormatter.format(avg7)}
                          </span>
                        </div>
                      </div>
                    )}
                  />
                );
              }}
            />
            <Area
              dataKey="uploads"
              type="monotone"
              stroke="var(--color-uploads)"
              fill={`url(#uploads-gradient-${gradientId})`}
              fillOpacity={1}
              isAnimationActive={!disableAnimations}
            />
            <Line
              dataKey="avg7"
              type="monotone"
              stroke="var(--color-avg7)"
              strokeWidth={2}
              dot={false}
              isAnimationActive={!disableAnimations}
            />
            <ChartLegend content={<ChartLegendContent />} />
          </ComposedChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
