import type { Severity, Theme } from '@/content/types'

export const themeStyles: Record<Theme, { pill: string; panel: string; accent: string; dot: string }> = {
  intent: {
    pill: 'bg-sky-100 text-sky-900 ring-sky-300',
    panel: 'bg-sky-50 border-sky-200',
    accent: 'text-sky-700',
    dot: 'bg-sky-500',
  },
  merge: {
    pill: 'bg-violet-100 text-violet-900 ring-violet-300',
    panel: 'bg-violet-50 border-violet-200',
    accent: 'text-violet-700',
    dot: 'bg-violet-500',
  },
  release: {
    pill: 'bg-amber-100 text-amber-900 ring-amber-300',
    panel: 'bg-amber-50 border-amber-200',
    accent: 'text-amber-700',
    dot: 'bg-amber-500',
  },
}

export const severityStyles: Record<Severity, string> = {
  blocker: 'bg-red-100 text-red-800 ring-red-300',
  major: 'bg-orange-100 text-orange-800 ring-orange-300',
  nit: 'bg-zinc-100 text-zinc-700 ring-zinc-300',
}

export const severityRank: Record<Severity, number> = { blocker: 0, major: 1, nit: 2 }
