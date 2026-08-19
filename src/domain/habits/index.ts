export { dateKey, isHabitScheduledOn, parseDateKey, scheduledDaysInRange } from '@/domain/habits/schedule'
export { getBestStreak, getCurrentStreak, getLongestStreak } from '@/domain/habits/streaks'
export {
  getCompletionRate,
  getHeatmap,
  getTodayStatus,
  getWeekTargetProgress,
  habitCompletedOn,
  type HabitDayStatus,
  type HeatmapCell,
} from '@/domain/habits/stats'