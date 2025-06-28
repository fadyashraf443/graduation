'use client'

import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts"
import { ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"

const chartData = [
  { date: "2024-07-15", malware: 23, phishing: 11, ddos: 5 },
  { date: "2024-07-16", malware: 25, phishing: 15, ddos: 3 },
  { date: "2024-07-17", malware: 22, phishing: 18, ddos: 8 },
  { date: "2024-07-18", malware: 30, phishing: 25, ddos: 7 },
  { date: "2024-07-19", malware: 28, phishing: 22, ddos: 10 },
  { date: "2024-07-20", malware: 35, phishing: 28, ddos: 12 },
  { date: "2024-07-21", malware: 32, phishing: 26, ddos: 9 },
]

const chartConfig = {
  malware: {
    label: "Malware",
    color: "hsl(var(--chart-1))",
  },
  phishing: {
    label: "Phishing",
    color: "hsl(var(--chart-2))",
  },
  ddos: {
    label: "DDoS",
    color: "hsl(var(--chart-3))",
  },
} satisfies ChartConfig

export function ThreatChart() {
  return (
    <ChartContainer config={chartConfig} className="min-h-[300px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={chartData}
          margin={{
            top: 10,
            right: 30,
            left: 0,
            bottom: 0,
          }}
        >
          <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis
            dataKey="date"
            tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            tickLine={false}
            axisLine={false}
            stroke="hsl(var(--muted-foreground))"
            fontSize={12}
          />
          <ChartTooltip cursor={false} content={<ChartTooltipContent indicator="dot" />} />
          <defs>
            <linearGradient id="colorMalware" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorPhishing" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--chart-2))" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="hsl(var(--chart-2))" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorDdos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(var(--chart-3))" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="hsl(var(--chart-3))" stopOpacity={0}/>
              </linearGradient>
          </defs>
          <Area type="monotone" dataKey="malware" stroke="hsl(var(--chart-1))" fillOpacity={1} fill="url(#colorMalware)" />
          <Area type="monotone" dataKey="phishing" stroke="hsl(var(--chart-2))" fillOpacity={1} fill="url(#colorPhishing)" />
          <Area type="monotone" dataKey="ddos" stroke="hsl(var(--chart-3))" fillOpacity={1} fill="url(#colorDdos)" />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  )
}
