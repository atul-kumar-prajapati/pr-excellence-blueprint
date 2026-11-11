import { Star, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { themes } from '@/content/agenda'
import { stakeholderNames } from '@/content/stakeholders'
import type { PlantedIssue } from '@/content/types'
import { cn } from '@/lib/utils'
import { severityStyles, themeStyles } from '@/lib/themeStyles'
import { InlineCode } from './InlineCode'
import type { Finding } from './labState'

export function FindingCard({
  finding,
  onToggleStar,
  onDelete,
  starDisabled,
  showLocation = false,
}: {
  finding: Finding
  onToggleStar: () => void
  onDelete: () => void
  starDisabled: boolean
  showLocation?: boolean
}) {
  return (
    <div className="rounded-lg border border-zinc-200 bg-white p-3 font-sans text-sm shadow-xs">
      <div className="flex items-start gap-2">
        <div className="min-w-0 flex-1">
          <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
            <Tag className={severityStyles[finding.severity]}>{finding.severity}</Tag>
            <Tag className={themeStyles[finding.theme].pill}>{themes[finding.theme].name}</Tag>
            {finding.stakeholder && <span className="text-xs text-zinc-500">hurts {stakeholderNames[finding.stakeholder]}</span>}
          </div>
          {showLocation && (
            <p className="mb-1 font-mono text-xs text-zinc-400">
              {finding.file ? `${finding.file.split('/').pop()} · ${finding.lineLabel}` : 'PR-level'}
            </p>
          )}
          <p className="text-pretty whitespace-pre-wrap text-zinc-800">{finding.text}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-0.5">
          <Button
            variant="ghost"
            size="icon-xs"
            onClick={onToggleStar}
            disabled={!finding.starred && starDisabled}
            aria-label={finding.starred ? 'Remove from top 3' : 'Add to top 3'}
            title={finding.starred ? 'Remove from top 3' : starDisabled ? 'Top 3 is full' : 'Add to top 3'}
          >
            <Star className={cn(finding.starred && 'fill-amber-400 text-amber-500')} />
          </Button>
          <Button variant="ghost" size="icon-xs" onClick={onDelete} aria-label="Delete finding">
            <Trash2 />
          </Button>
        </div>
      </div>
    </div>
  )
}

export function IssueCard({ issue, found, rank }: { issue: PlantedIssue; found?: boolean; rank?: number }) {
  return (
    <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-3 font-sans text-sm">
      <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
        <span className="text-xs font-semibold text-emerald-800">Expert{rank ? ` · top ${rank}` : ''}</span>
        <Tag className={severityStyles[issue.severity]}>{issue.severity}</Tag>
        <Tag className={themeStyles[issue.theme].pill}>{themes[issue.theme].name}</Tag>
        {found !== undefined && (
          <span className={cn('text-xs font-medium', found ? 'text-emerald-700' : 'text-red-600')}>
            {found ? 'You found this' : 'Missed'}
          </span>
        )}
      </div>
      <p className="font-semibold text-zinc-900">{issue.title}</p>
      <p className="mt-1 text-zinc-700">
        <InlineCode text={issue.whyItMatters} />
      </p>
      <p className="mt-2 text-zinc-600">
        <span className="font-medium text-zinc-800">Better: </span>
        <InlineCode text={issue.betterApproach} />
      </p>
      <p className="mt-2 text-xs text-zinc-500">Hurts: {issue.stakeholders.map((id) => stakeholderNames[id]).join(', ')}</p>
    </div>
  )
}

function Tag({ className, children }: { className: string; children: string }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ring-1 ring-inset', className)}>{children}</span>
}
