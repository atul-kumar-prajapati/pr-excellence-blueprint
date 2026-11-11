import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Segment } from '@/content/agenda'
import { usePersistentState } from '@/lib/usePersistentState'
import { cn } from '@/lib/utils'

interface ClockState {
  startedAt: number | null
  accumulatedMs: number
}

export function useSessionClock() {
  const [state, setState] = usePersistentState<ClockState>('session:clock', { startedAt: null, accumulatedMs: 0 })
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (state.startedAt === null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [state.startedAt])

  const elapsedMs = state.accumulatedMs + (state.startedAt === null ? 0 : now - state.startedAt)

  return {
    elapsedMs,
    running: state.startedAt !== null,
    toggle: () =>
      setState((current) =>
        current.startedAt === null
          ? { ...current, startedAt: Date.now() }
          : { startedAt: null, accumulatedMs: current.accumulatedMs + Date.now() - current.startedAt },
      ),
    reset: () => setState({ startedAt: null, accumulatedMs: 0 }),
  }
}

export function formatDuration(ms: number) {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000))
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

export function SessionClock({ segment }: { segment: Segment }) {
  const { elapsedMs, running, toggle, reset } = useSessionClock()
  const elapsedMinutes = elapsedMs / 60000
  const minutesBehind = Math.floor(elapsedMinutes - segment.endMinute)
  const status =
    elapsedMs === 0
      ? null
      : minutesBehind >= 1
        ? { text: `${minutesBehind} min behind`, tone: 'text-red-600' }
        : elapsedMinutes < segment.startMinute - 1
          ? { text: 'Ahead', tone: 'text-emerald-600' }
          : { text: 'On time', tone: 'text-emerald-600' }

  return (
    <div className="flex items-center gap-2">
      <div className="text-right leading-tight">
        <p className="font-mono text-sm font-semibold tabular-nums">{formatDuration(elapsedMs)} / 90:00</p>
        {status && <p className={cn('text-xs font-medium', status.tone)}>{status.text}</p>}
      </div>
      <Button variant="ghost" size="icon-sm" onClick={toggle} aria-label={running ? 'Pause session clock' : 'Start session clock'}>
        {running ? <Pause /> : <Play />}
      </Button>
      <Button variant="ghost" size="icon-sm" onClick={reset} aria-label="Reset session clock">
        <RotateCcw />
      </Button>
    </div>
  )
}
