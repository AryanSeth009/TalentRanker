"use client"

import {
  Radar,
  RadarChart as RechartsRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  Tooltip
} from "recharts"

interface RadarChartProps {
  data: {
    subject: string
    A: number
    fullMark: number
  }[]
}

export function RadarChart({ data }: RadarChartProps) {
  return (
    <div className="w-full h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <RechartsRadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
          <PolarGrid stroke="rgba(255,255,255,0.1)" />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: "rgba(255,255,255,0.7)", fontSize: 10 }} 
          />
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 100]} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: "rgba(10, 10, 15, 0.9)", 
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "8px",
              color: "#fff"
            }} 
          />
          <Radar 
            name="Culture Fit" 
            dataKey="A" 
            stroke="#6c63ff" 
            fill="#6c63ff" 
            fillOpacity={0.4} 
          />
        </RechartsRadarChart>
      </ResponsiveContainer>
    </div>
  )
}
