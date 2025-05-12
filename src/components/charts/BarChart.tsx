"use client";

import { useEffect, useRef } from 'react';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, TooltipProps } from 'recharts';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';

interface BarChartProps {
    data: any[];
    index: string;
    categories: string[];
    colors?: string[];
    valueFormatter?: (value: number) => string;
    className?: string;
}

export function BarChart({
    data,
    index,
    categories,
    colors,
    valueFormatter = (value: number) => `${value}`,
    className,
}: BarChartProps) {
    const { theme, systemTheme } = useTheme();
    const chartRef = useRef<HTMLDivElement>(null);

    // Determine current theme
    const currentTheme = theme === 'system' ? systemTheme : theme;
    const isDark = currentTheme === 'dark';

    // Default colors if none provided
    const defaultColors = ['#38bdf8', '#818cf8', '#fb7185', '#34d399', '#fbbf24', '#f472b6'];
    const chartColors = colors || defaultColors;

    // Format tooltip
    const CustomTooltip = ({ active, payload, label }: TooltipProps<number, string>) => {
        if (active && payload && payload.length) {
            return (
                <div className={cn(
                    "px-3 py-2 rounded shadow-md border",
                    isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"
                )}>
                    <p className="text-sm font-medium">{label}</p>
                    {payload.map((entry, index) => (
                        <p
                            key={`item-${index}`}
                            className="text-xs"
                            style={{ color: entry.color }}
                        >
                            {entry.name}: {valueFormatter(entry.value as number)}
                        </p>
                    ))}
                </div>
            );
        }

        return null;
    };

    return (
        <div ref={chartRef} className={cn("w-full h-full", className)}>
            <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart
                    data={data}
                    margin={{
                        top: 10,
                        right: 10,
                        left: 10,
                        bottom: 20,
                    }}
                >
                    <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                    />
                    <XAxis
                        dataKey={index}
                        tick={{ fontSize: 12 }}
                        tickLine={false}
                        axisLine={{ stroke: isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)" }}
                        style={{
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            fill: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                        }}
                    />
                    <YAxis
                        tickFormatter={valueFormatter}
                        tickLine={false}
                        axisLine={false}
                        style={{
                            fontSize: '12px',
                            fontFamily: 'inherit',
                            fill: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                        }}
                    />
                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)' }}
                    />
                    <Legend
                        wrapperStyle={{
                            fontSize: '12px',
                            paddingTop: '10px',
                            color: isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"
                        }}
                    />
                    {categories.map((category, index) => (
                        <Bar
                            key={category}
                            dataKey={category}
                            fill={chartColors[index % chartColors.length]}
                            radius={[4, 4, 0, 0]}
                            barSize={30}
                        />
                    ))}
                </RechartsBarChart>
            </ResponsiveContainer>
        </div>
    );
}