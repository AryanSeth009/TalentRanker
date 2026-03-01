// @ts-nocheck
"use client"

import dynamic from "next/dynamic"

export const AreaChart: any = dynamic(() => import("recharts").then(recharts => recharts.AreaChart), { ssr: false })
export const Area: any = dynamic(() => import("recharts").then(recharts => recharts.Area), { ssr: false })
export const BarChart: any = dynamic(() => import("recharts").then(recharts => recharts.BarChart), { ssr: false })
export const Bar: any = dynamic(() => import("recharts").then(recharts => recharts.Bar), { ssr: false })
export const PieChart: any = dynamic(() => import("recharts").then(recharts => recharts.PieChart), { ssr: false })
export const Pie: any = dynamic(() => import("recharts").then(recharts => recharts.Pie), { ssr: false })
export const Cell: any = dynamic(() => import("recharts").then(recharts => recharts.Cell), { ssr: false })
export const XAxis: any = dynamic(() => import("recharts").then(recharts => recharts.XAxis), { ssr: false })
export const YAxis: any = dynamic(() => import("recharts").then(recharts => recharts.YAxis), { ssr: false })
export const CartesianGrid: any = dynamic(() => import("recharts").then(recharts => recharts.CartesianGrid), { ssr: false })
export const Tooltip: any = dynamic(() => import("recharts").then(recharts => recharts.Tooltip as any), { ssr: false })
export const ResponsiveContainer: any = dynamic(() => import("recharts").then(recharts => recharts.ResponsiveContainer), { ssr: false })
