"use client"
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell } from 'recharts'

const data = [
  { name: 'MON', uv: 4.2, color: '#22d3ee' }, // cyan-400 
  { name: 'TUE', uv: 6.8, color: '#22d3ee' },
  { name: 'WED', uv: 3.1, color: '#e879f9' }, // fuchsia-400
  { name: 'THU', uv: 9.4, color: '#22d3ee' },
  { name: 'FRI', uv: 5.9, color: '#22d3ee' },
  { name: 'SAT', uv: 10.2, color: '#a3e635' }, // lime-400
  { name: 'SUN', uv: 7.5, color: '#22d3ee' },
];

export default function StudentActivityChart() {
  return (
    <div className="h-64 relative w-full mb-6">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 0, left: 0, bottom: 0 }}
        >
          <Tooltip 
            contentStyle={{ backgroundColor: '#131313', borderColor: '#334155', color: '#22d3ee', fontFamily: 'monospace', fontSize: '10px' }}
            itemStyle={{ color: '#22d3ee' }}
            cursor={{ fill: 'rgba(34, 211, 238, 0.1)' }}
            formatter={(value: any) => [`${value} HOURS`, 'ACTIVE']}
          />
          <Bar dataKey="uv" radius={[0, 0, 0, 0]}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} fillOpacity={0.6} className="hover:opacity-100 transition-opacity cursor-crosshair stroke-transparent hover:stroke-white" strokeWidth={1} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="mt-4 flex justify-between font-mono text-[10px] text-slate-500 uppercase tracking-widest pointer-events-none px-2 mx-auto">
        {data.map(d => <span key={d.name} className={d.color === '#e879f9' ? 'text-fuchsia-400' : d.color === '#a3e635' ? 'text-lime-400' : ''}>{d.name}</span>)}
      </div>
    </div>
  )
}
