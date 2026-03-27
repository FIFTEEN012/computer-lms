// Grade weights (%)
export const GRADE_WEIGHTS = {
  Quizzes: 40,
  Assignments: 20,
  Midterm: 20,
  Final: 20,
}

// Grade letter conversion
export function getGradeLetter(score: number): string {
  if (score >= 80) return 'A'
  if (score >= 75) return 'B+'
  if (score >= 70) return 'B'
  if (score >= 65) return 'C+'
  if (score >= 60) return 'C'
  if (score >= 50) return 'D'
  return 'F'
}

export function getGradeColor(score: number): string {
  if (score >= 70) return 'text-emerald-400'
  if (score >= 50) return 'text-amber-400'
  return 'text-red-400'
}

// Calculate weighted final score for a student
export function calculateWeightedScore(
  gradesByCategory: Record<string, { score: number; maxScore: number }[]>
): { weighted: number; breakdown: Record<string, number> } {
  const breakdown: Record<string, number> = {}
  let totalWeighted = 0

  for (const [category, weight] of Object.entries(GRADE_WEIGHTS)) {
    const entries = gradesByCategory[category] || []
    if (entries.length === 0) {
      breakdown[category] = 0
      continue
    }
    const totalScore = entries.reduce((s, e) => s + e.score, 0)
    const totalMax = entries.reduce((s, e) => s + e.maxScore, 0)
    const pct = totalMax > 0 ? (totalScore / totalMax) * 100 : 0
    breakdown[category] = Math.round(pct)
    totalWeighted += (pct * weight) / 100
  }

  return { weighted: Math.round(totalWeighted), breakdown }
}
