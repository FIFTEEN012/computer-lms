import { LucideIcon } from 'lucide-react'

interface StatCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
}

export function StatCard({ title, value, icon: Icon, change, changeType = 'neutral' }: StatCardProps) {
  return (
    <div className="glass rounded-xl p-6 flex flex-col justify-between space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</h3>
        <div className="p-2 bg-primary/10 rounded-lg text-primary">
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold">{value}</p>
        {change && (
          <p className={`text-sm mt-1 font-medium ${
            changeType === 'positive' ? 'text-emerald-500' : 
            changeType === 'negative' ? 'text-red-500' : 
            'text-slate-500'
          }`}>
            {change}
          </p>
        )}
      </div>
    </div>
  )
}
