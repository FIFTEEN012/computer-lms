"use client"
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

const data = [
  { name: 'CYCLE_01', uv: 20 },
  { name: 'CYCLE_05', uv: 50 },
  { name: 'CYCLE_10', uv: 40 },
  { name: 'CYCLE_15', uv: 80 },
  { name: 'CYCLE_20', uv: 60 },
  { name: 'CYCLE_25', uv: 90 },
  { name: 'CYCLE_30', uv: 100 },
];

export default function ActivityChart() {
  return (
    <div className="h-48 relative w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 0, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <Tooltip 
            contentStyle={{ backgroundColor: 'hsl(var(--background))', borderColor: 'hsl(var(--border))', color: 'hsl(var(--primary))', fontFamily: 'monospace', fontSize: '10px' }}
            itemStyle={{ color: 'hsl(var(--primary))' }}
            cursor={{ stroke: 'hsl(var(--primary))', strokeWidth: 1, strokeDasharray: "3 3" }}
          />
          <Area type="monotone" dataKey="uv" stroke="hsl(var(--primary))" strokeWidth={2} fillOpacity={1} fill="url(#colorUv)" />
        </AreaChart>
      </ResponsiveContainer>
      <div className="absolute -bottom-6 left-6 right-6 flex justify-between font-mono text-[8px] text-slate-500 uppercase tracking-widest pointer-events-none">
        <span>CYCLE_01</span>
        <span>CYCLE_15</span>
        <span>CYCLE_30</span>
      </div>
    </div>
  )
}
