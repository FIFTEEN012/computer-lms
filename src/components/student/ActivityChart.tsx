"use client"
import { BarChart, Bar, Tooltip, ResponsiveContainer, Cell, XAxis, YAxis } from 'recharts'

const data = [
  { name: 'MON', value: 4.2, color: '#00fbfb' },
  { name: 'TUE', value: 6.8, color: '#00fbfb' },
  { name: 'WED', value: 3.1, color: '#ffabf3' }, // Intense Pink
  { name: 'THU', value: 9.4, color: '#00fbfb' },
  { name: 'FRI', value: 5.9, color: '#00fbfb' },
  { name: 'SAT', value: 10.2, color: '#79ff5b' }, // Intense Green
  { name: 'SUN', value: 7.5, color: '#00fbfb' },
];

export default function StudentActivityChart() {
  return (
    <div className="h-full w-full relative flex flex-col pt-4">
      {/* Background Grid Lines */}
      <div className="absolute inset-x-0 inset-y-8 flex flex-col justify-between opacity-[0.03] pointer-events-none z-0">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="w-full border-t border-accent-primary"></div>
        ))}
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 20, right: 0, left: -20, bottom: 20 }}
          barGap={0}
        >
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#839493', fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-mono)' }} 
            dy={15}
          />
          <YAxis 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#839493', fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-mono)' }}
            dx={-10}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#131313', 
              border: '2px solid rgba(0, 251, 251, 0.4)', 
              borderRadius: '0px',
              fontFamily: 'var(--font-mono)', 
              fontSize: '10px',
              fontWeight: '900',
              textTransform: 'uppercase',
              color: '#00fbfb'
            }}
            cursor={{ fill: 'rgba(0, 251, 251, 0.05)' }}
            formatter={(value: any) => [`${value} UNIT_HOURS`, 'UPLINK_DURATION']}
            labelStyle={{ color: '#839493', marginBottom: '8px' }}
          />
          <Bar dataKey="value" radius={[0, 0, 0, 0]} barSize={45}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                fillOpacity={0.6}
                className="hover:fill-opacity-100 transition-all duration-300 cursor-crosshair stroke-transparent hover:stroke-white" 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
