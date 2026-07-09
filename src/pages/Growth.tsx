import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer } from 'recharts'
import { Sparkles } from 'lucide-react'
import { useGrowthStore, computeLevel, GROWTH_AXIS_LABELS } from '@/store/growthStore'
import type { GrowthAxis } from '@/types'

export default function Growth() {
  const { stats, setStat } = useGrowthStore()
  const { level, totalXp, nextLevelXp } = computeLevel(stats)

  const radarData = (Object.keys(stats) as GrowthAxis[]).map((axis) => ({
    axis: GROWTH_AXIS_LABELS[axis],
    value: stats[axis],
  }))

  return (
    <div className="space-y-5">
      <h2 className="font-display font-bold text-xl">Growth profile</h2>

      <div className="card p-5 flex items-center gap-5 flex-wrap">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center font-display font-bold text-xl shrink-0"
          style={{ backgroundColor: 'rgb(var(--accent) / 0.15)', color: 'rgb(var(--accent))' }}
        >
          Lv {level}
        </div>
        <div className="flex-1 min-w-[180px]">
          <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
            <span>{totalXp} XP</span>
            <span>{nextLevelXp} XP to next level</span>
          </div>
          <div className="h-2.5 rounded-full overflow-hidden" style={{ backgroundColor: 'rgb(var(--surface-2))' }}>
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${Math.min(100, (totalXp % 100))}%`, backgroundColor: 'rgb(var(--accent))' }}
            />
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="card p-4">
          <h3 className="font-display font-semibold text-sm mb-3 flex items-center gap-1.5">
            <Sparkles size={15} style={{ color: 'rgb(var(--accent))' }} /> Balance radar
          </h3>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgb(var(--border))" />
              <PolarAngleAxis dataKey="axis" tick={{ fontSize: 11, fill: 'rgb(var(--text-secondary))' }} />
              <PolarRadiusAxis domain={[0, 100]} tick={false} axisLine={false} />
              <Radar dataKey="value" stroke="rgb(var(--accent))" fill="rgb(var(--accent))" fillOpacity={0.25} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="font-display font-semibold text-sm">Skill meters</h3>
          {(Object.keys(stats) as GrowthAxis[]).map((axis) => (
            <div key={axis}>
              <div className="flex items-center justify-between text-xs mb-1" style={{ color: 'rgb(var(--text-secondary))' }}>
                <span>{GROWTH_AXIS_LABELS[axis]}</span>
                <span>{stats[axis]}</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={stats[axis]}
                onChange={(e) => setStat(axis, Number(e.target.value))}
                className="w-full"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
