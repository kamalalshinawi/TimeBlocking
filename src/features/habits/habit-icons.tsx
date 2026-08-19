import {
  Activity,
  Apple,
  Bed,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  Brush,
  Carrot,
  Code2,
  Coffee,
  Crown,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  Heart,
  Leaf,
  Microscope,
  Moon,
  Music,
  Palette,
  Pencil,
  Pill,
  Salad,
  Smile,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Utensils,
  Watch,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import type { CSSProperties } from 'react'
import { createElement } from 'react'

export const HABIT_ICONS: Record<string, LucideIcon> = {
  Activity,
  Apple,
  Bed,
  Bike,
  BookOpen,
  Brain,
  Briefcase,
  Brush,
  Carrot,
  Code2,
  Coffee,
  Crown,
  Droplet,
  Dumbbell,
  Flame,
  Footprints,
  GlassWater,
  Heart,
  Leaf,
  Microscope,
  Moon,
  Music,
  Palette,
  Pencil,
  Pill,
  Salad,
  Smile,
  Sparkles,
  Star,
  Sun,
  Trophy,
  Utensils,
  Watch,
  Zap,
}

export const HABIT_ICON_KEYS = Object.keys(HABIT_ICONS)

export function getHabitIcon(key: string): LucideIcon {
  return HABIT_ICONS[key] ?? Sparkles
}

export function HabitIcon({
  name,
  className,
  style,
}: {
  name: string
  className?: string
  style?: CSSProperties
}) {
  const Icon = getHabitIcon(name)
  return createElement(Icon, { 'aria-hidden': true, className, style })
}