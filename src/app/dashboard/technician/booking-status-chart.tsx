"use client";

import { Cell, Pie, PieChart } from "recharts";

import { Card, CardContent } from "@/components/ui/card";
import {
    ChartContainer,
    ChartTooltip,
    ChartTooltipContent,
    type ChartConfig,
} from "@/components/ui/chart";

export type BookingStatusCounts = {
    pending: number;
    confirmed: number;
    inProgress: number;
    completed: number;
    cancelled: number;
};

// Same order and colors are used by the donut and the status list.
const statusColors = {
    pending: "#eab308", // yellow-500
    confirmed: "#2563eb", // blue-600
    inProgress: "#a855f7", // purple-500
    completed: "#16a34a", // green-600
    cancelled: "#dc2626", // red-600
};

const chartConfig = {
    pending: { label: "Pending", color: statusColors.pending },
    confirmed: { label: "Confirmed", color: statusColors.confirmed },
    inProgress: { label: "In progress", color: statusColors.inProgress },
    completed: { label: "Completed", color: statusColors.completed },
    cancelled: { label: "Cancelled", color: statusColors.cancelled },
} satisfies ChartConfig;

export default function BookingStatusChart({
    counts,
}: {
    counts: BookingStatusCounts;
}) {
    const chartData = [
        { key: "pending", label: "Pending", count: counts.pending },
        { key: "confirmed", label: "Confirmed", count: counts.confirmed },
        { key: "inProgress", label: "In progress", count: counts.inProgress },
        { key: "completed", label: "Completed", count: counts.completed },
        { key: "cancelled", label: "Cancelled", count: counts.cancelled },
    ];

    const total = chartData.reduce((sum, item) => sum + item.count, 0);

    return (
        <Card className="rounded-2xl border-blue-100 shadow-lg shadow-blue-900/5">
            <CardContent className="p-5 sm:p-6">
                <div>
                    <h2 className="text-lg font-bold text-slate-900">
                        Booking Status Overview
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        A quick look at how your repair requests are progressing.
                    </p>
                </div>

                <div className="mt-6 grid items-center gap-8 lg:grid-cols-[minmax(0,320px)_1fr]">
                    {/* Donut chart */}
                    <div className="relative mx-auto w-full max-w-[280px]">
                        <ChartContainer
                            config={chartConfig}
                            className="mx-auto aspect-square h-[220px] w-full sm:h-[240px]"
                        >
                            <PieChart>
                                <ChartTooltip
                                    cursor={false}
                                    content={
                                        <ChartTooltipContent
                                            nameKey="label"
                                            hideLabel
                                        />
                                    }
                                />
                                <Pie
                                    data={chartData}
                                    dataKey="count"
                                    nameKey="label"
                                    innerRadius={58}
                                    outerRadius={88}
                                    paddingAngle={3}
                                    strokeWidth={0}
                                >
                                    {chartData.map((item) => (
                                        <Cell
                                            key={item.key}
                                            fill={statusColors[item.key as keyof typeof statusColors]}
                                        />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ChartContainer>

                        {/* Center total */}
                        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-slate-900">
                                {total}
                            </span>
                            <span className="text-xs text-slate-400">Bookings</span>
                        </div>
                    </div>

                    {/* Status list - uses the same counts as the chart */}
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                        {chartData.map((item) => (
                            <div
                                key={item.key}
                                className="flex items-center justify-between gap-4 rounded-xl border border-blue-100 bg-white px-4 py-3 transition hover:border-blue-200 hover:shadow-sm"
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <span
                                        className="size-2.5 shrink-0 rounded-full"
                                        style={{ backgroundColor: statusColors[item.key as keyof typeof statusColors] }}
                                    />
                                    <span className="truncate text-sm font-medium text-slate-700">
                                        {item.label}
                                    </span>
                                </div>
                                <span className="text-sm font-bold text-slate-900">
                                    {item.count}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
