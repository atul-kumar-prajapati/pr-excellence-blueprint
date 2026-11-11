import { useEffect, useState } from 'react'
import { Copy, Eye, Lightbulb, MessageSquarePlus, Play, RotateCcw, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { confidenceScale } from '@/content/handouts'
import { stakeholderNames } from '@/content/stakeholders'
import type { LabPullRequest } from '@/content/types'
import { copyText } from '@/lib/copyText'
import { cn } from '@/lib/utils'
import { severityRank } from '@/lib/themeStyles'
import { formatDuration } from '../SessionClock'
import { FindingCard, IssueCard } from './FindingCard'
import { findingsAsMarkdown, type LabState } from './labState'

const reviewMinutes = 10

export function Worksheet({
  pr,
  state,
  setState,
  foundIssueIds,
  onAddPrLevelFinding,
  onJumpToIssue,
  onToggleStar,
  onDeleteFinding,
  onReset,
}: {
  pr: LabPullRequest
  state: LabState
  setState: (update: (current: LabState) => LabState) => void
  foundIssueIds: Set<string>
  onAddPrLevelFinding: () => void
  onJumpToIssue: (issueId: string) => void
  onToggleStar: (id: string) => void
  onDeleteFinding: (id: string) => void
  onReset: () => void
}) {
  const starred = state.findings.filter((finding) => finding.starred)
  const others = state.findings.filter((finding) => !finding.starred)

  return (
    <div className="space-y-4">
      <ReviewTimer pr={pr} startedAt={state.timerStartedAt} onStart={(startedAt) => setState((current) => ({ ...current, timerStartedAt: startedAt }))} />

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="font-semibold">Findings ({state.findings.length})</h2>
          <Button variant="outline" size="sm" onClick={onAddPrLevelFinding}>
            <MessageSquarePlus /> PR-level finding
          </Button>
        </div>
        <p className="mt-1 text-xs text-zinc-500">Click any diff line to add a finding there. Star up to three for your top 3.</p>
        {state.findings.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-zinc-300 p-4 text-center text-sm text-zinc-500">
            No findings yet. Start with the description, then the files.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {starred.length > 0 && <p className="text-xs font-semibold tracking-wide text-amber-700 uppercase">Top 3</p>}
            {[...starred, ...others].map((finding) => (
              <FindingCard
                key={finding.id}
                finding={finding}
                showLocation
                starDisabled={starred.length >= 3}
                onToggleStar={() => onToggleStar(finding.id)}
                onDelete={() => onDeleteFinding(finding.id)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-4">
        <h2 className="font-semibold">Merge confidence</h2>
        <div className="mt-3 grid grid-cols-5 gap-1.5">
          {[...confidenceScale].reverse().map((level) => (
            <button
              key={level.score}
              type="button"
              title={level.label}
              aria-pressed={state.score === level.score}
              onClick={() => setState((current) => ({ ...current, score: current.score === level.score ? null : level.score }))}
              className={cn(
                'rounded-lg border py-2 font-mono text-lg font-semibold transition-colors',
                state.score === level.score ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400',
              )}
            >
              {level.score}
            </button>
          ))}
        </div>
        <p className="mt-2 min-h-5 text-sm text-zinc-600">
          {state.score ? confidenceScale.find((level) => level.score === state.score)?.label : 'Pick a score from 1 (rethink) to 5 (merge now).'}
        </p>
        <Textarea
          value={state.reason}
          onChange={(event) => setState((current) => ({ ...current, reason: event.target.value }))}
          placeholder="One sentence: why this score?"
          className="mt-2 min-h-16 text-sm"
        />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => copyText(findingsAsMarkdown(pr, state, stakeholderNames), 'Findings copied — paste them into chat')}
            disabled={state.findings.length === 0 && state.score === null}
          >
            <Copy /> Copy findings
          </Button>
          <ResetButton onReset={onReset} />
        </div>
      </section>

      <ExpertReview
        pr={pr}
        state={state}
        foundIssueIds={foundIssueIds}
        onReveal={() => setState((current) => ({ ...current, revealed: true }))}
        onHide={() => setState((current) => ({ ...current, revealed: false }))}
        onJumpToIssue={onJumpToIssue}
      />
    </div>
  )
}

function ResetButton({ onReset }: { onReset: () => void }) {
  const [confirming, setConfirming] = useState(false)
  useEffect(() => {
    if (!confirming) return
    const timeout = window.setTimeout(() => setConfirming(false), 3000)
    return () => window.clearTimeout(timeout)
  }, [confirming])
  return (
    <Button
      variant={confirming ? 'destructive' : 'ghost'}
      size="sm"
      onClick={() => {
        if (confirming) {
          onReset()
          setConfirming(false)
        } else {
          setConfirming(true)
        }
      }}
    >
      <RotateCcw /> {confirming ? 'Click again to clear everything' : 'Reset'}
    </Button>
  )
}

function ReviewTimer({ pr, startedAt, onStart }: { pr: LabPullRequest; startedAt: number | null; onStart: (startedAt: number | null) => void }) {
  const [now, setNow] = useState(() => Date.now())
  const [revealedHints, setRevealedHints] = useState(0)

  useEffect(() => {
    if (startedAt === null) return
    const timer = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(timer)
  }, [startedAt])

  const elapsedMs = startedAt === null ? 0 : now - startedAt
  const remainingMs = reviewMinutes * 60000 - elapsedMs
  const unlockedByTime = pr.hints.filter((hint) => elapsedMs >= hint.afterMinutes * 60000).length
  const visibleHints = pr.hints.slice(0, Math.max(unlockedByTime, revealedHints))
  const nextHint = pr.hints[visibleHints.length]

  return (
    <section className="rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-semibold">
          <Timer className="size-4" /> Review time
        </h2>
        {startedAt === null ? (
          <Button size="sm" onClick={() => onStart(Date.now())}>
            <Play /> Start {reviewMinutes} min
          </Button>
        ) : (
          <div className="flex items-center gap-2">
            <span className={cn('font-mono text-lg font-semibold tabular-nums', remainingMs <= 0 ? 'text-red-600' : remainingMs < 120000 && 'text-amber-600')}>
              {remainingMs <= 0 ? 'Time — rank & score' : formatDuration(remainingMs)}
            </span>
            <Button variant="ghost" size="icon-sm" onClick={() => onStart(null)} aria-label="Reset timer">
              <RotateCcw />
            </Button>
          </div>
        )}
      </div>
      {visibleHints.map((hint) => (
        <p key={hint.text} className="mt-3 flex gap-2 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
          <Lightbulb className="mt-0.5 size-4 shrink-0" />
          {hint.text}
        </p>
      ))}
      {nextHint && (
        <button
          type="button"
          onClick={() => setRevealedHints(visibleHints.length + 1)}
          className="mt-3 text-xs text-zinc-500 underline underline-offset-2 hover:text-zinc-800"
        >
          {startedAt === null ? 'Show a hint' : `Hint ${visibleHints.length + 1} unlocks at ${nextHint.afterMinutes}:00 — show now`}
        </button>
      )}
    </section>
  )
}

function ExpertReview({
  pr,
  state,
  foundIssueIds,
  onReveal,
  onHide,
  onJumpToIssue,
}: {
  pr: LabPullRequest
  state: LabState
  foundIssueIds: Set<string>
  onReveal: () => void
  onHide: () => void
  onJumpToIssue: (issueId: string) => void
}) {
  const [confirming, setConfirming] = useState(false)

  if (!state.revealed) {
    return (
      <section className="rounded-xl border border-dashed border-zinc-300 bg-white p-4">
        <h2 className="font-semibold">Expert review</h2>
        <p className="mt-1 text-sm text-zinc-500">Reveal only after your group has shared its top 3 and score.</p>
        <Button className="mt-3" variant={confirming ? 'default' : 'outline'} size="sm" onClick={() => (confirming ? onReveal() : setConfirming(true))}>
          <Eye /> {confirming ? 'Sure? Click again to reveal' : 'Reveal expert review'}
        </Button>
      </section>
    )
  }

  const sortedIssues = [...pr.issues].sort((a, b) => severityRank[a.severity] - severityRank[b.severity])
  const scoreGap = state.score === null ? null : state.score - pr.expertScore

  return (
    <section className="rounded-xl border border-emerald-300 bg-white p-4">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold">Expert review</h2>
        <Button variant="ghost" size="sm" onClick={onHide}>
          Hide
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <Metric label="Found" value={`${foundIssueIds.size}/${pr.issues.length}`} />
        <Metric label="Your score" value={state.score === null ? '–' : String(state.score)} />
        <Metric label="Expert" value={String(pr.expertScore)} />
      </div>
      {scoreGap !== null && scoreGap > 0 && (
        <p className="mt-3 rounded-lg bg-red-50 p-2 text-sm text-red-800">You scored {scoreGap} higher than the expert. What made it look safer than it is?</p>
      )}
      <p className="mt-3 text-sm text-zinc-700">{pr.expertVerdict}</p>
      <h3 className="mt-4 text-xs font-semibold tracking-wide text-zinc-500 uppercase">Expert top 3</h3>
      <ol className="mt-2 list-decimal space-y-1 pl-5 text-sm">
        {pr.expertTopThree.map((id) => {
          const issue = pr.issues.find((candidate) => candidate.id === id)
          return issue ? <li key={id}>{issue.title}</li> : null
        })}
      </ol>
      <h3 className="mt-4 text-xs font-semibold tracking-wide text-zinc-500 uppercase">All planted issues</h3>
      <div className="mt-2 space-y-2">
        {sortedIssues.map((issue) => (
          <button key={issue.id} type="button" className="block w-full text-left" onClick={() => onJumpToIssue(issue.id)}>
            <IssueCard
              issue={issue}
              found={foundIssueIds.has(issue.id)}
              rank={pr.expertTopThree.indexOf(issue.id) + 1 || undefined}
            />
          </button>
        ))}
      </div>
    </section>
  )
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-zinc-50 p-2">
      <p className="text-xs text-zinc-500">{label}</p>
      <p className="font-mono text-xl font-semibold">{value}</p>
    </div>
  )
}
