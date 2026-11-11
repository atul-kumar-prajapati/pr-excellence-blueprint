import type { ReactNode } from 'react'
import type { Theme } from '@/content/types'
import { themes } from '@/content/agenda'
import { cn } from '@/lib/utils'
import { themeStyles } from '@/lib/themeStyles'

export function SlideHeading({ kicker, title, lead }: { kicker?: string; title: ReactNode; lead?: ReactNode }) {
  return (
    <header className="mb-8 max-w-4xl">
      {kicker && <p className="mb-3 text-sm font-semibold tracking-widest text-zinc-500 uppercase">{kicker}</p>}
      <h1 className="font-heading text-3xl leading-tight font-semibold tracking-tight text-balance text-zinc-950 md:text-5xl">
        {title}
      </h1>
      {lead && <p className="mt-4 text-lg text-pretty text-zinc-600 md:text-xl">{lead}</p>}
    </header>
  )
}

export function ThemePill({ theme, className }: { theme: Theme; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset',
        themeStyles[theme].pill,
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full', themeStyles[theme].dot)} />
      {themes[theme].name}
    </span>
  )
}

export function Code({ children, tone = 'neutral', label }: { children: string; tone?: 'bad' | 'good' | 'neutral'; label?: string }) {
  return (
    <figure
      className={cn(
        'overflow-hidden rounded-xl border',
        tone === 'bad' && 'border-red-200 bg-red-50/60',
        tone === 'good' && 'border-emerald-200 bg-emerald-50/60',
        tone === 'neutral' && 'border-zinc-200 bg-zinc-50',
      )}
    >
      {label && (
        <figcaption
          className={cn(
            'border-b px-4 py-1.5 text-xs font-semibold tracking-wide uppercase',
            tone === 'bad' && 'border-red-200 text-red-700',
            tone === 'good' && 'border-emerald-200 text-emerald-700',
            tone === 'neutral' && 'border-zinc-200 text-zinc-500',
          )}
        >
          {label}
        </figcaption>
      )}
      <pre className="overflow-x-auto px-4 py-3 font-mono text-[13px] leading-relaxed text-zinc-800 md:text-sm">
        {children}
      </pre>
    </figure>
  )
}

export function Panel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs', className)}>{children}</div>
}

export function Takeaway({ children }: { children: ReactNode }) {
  return (
    <p className="mt-8 border-l-4 border-zinc-900 pl-4 text-lg font-medium text-pretty text-zinc-900 md:text-xl">
      {children}
    </p>
  )
}
