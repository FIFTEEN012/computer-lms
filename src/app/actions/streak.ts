'use server'

import { createClient } from '@/lib/supabase/server'
import { getStreakData, getActivityHeatmap, getTodayActivity } from '@/lib/streak'

export async function getStreakDataAction() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  return getStreakData(user.id)
}

export async function getActivityHeatmapAction() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  return getActivityHeatmap(user.id)
}

export async function getTodayActivityAction() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { hasActivity: false, activityType: null, xpEarned: 0 }

  return getTodayActivity(user.id)
}
