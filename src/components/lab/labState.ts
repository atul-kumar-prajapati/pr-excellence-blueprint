import type { LabPullRequest, PlantedIssue, Severity, StakeholderId, Theme } from '@/content/types'
import { anchorLineIndex } from '@/lib/diff'
import { usePersistentState } from '@/lib/usePersistentState'

export interface Finding {
  id: string
  file?: string
  lineIndex?: number
  lineLabel?: string
  text: string
  theme: Theme
  severity: Severity
  stakeholder?: StakeholderId
  starred: boolean
}

export interface LabState {
  findings: Finding[]
  score: number | null
  reason: string
  revealed: boolean
  timerStartedAt: number | null
}

const emptyLabState: LabState = { findings: [], score: null, reason: '', revealed: false, timerStartedAt: null }

export function useLabState(pr: LabPullRequest) {
  return usePersistentState<LabState>(`lab:${pr.id}`, emptyLabState)
}

export const resetLabState = (): LabState => emptyLabState

const lineTolerance = 3

export function isIssueFound(pr: LabPullRequest, issue: PlantedIssue, findings: Finding[]): boolean {
  if (!issue.file) {
    return findings.some((finding) => !finding.file && finding.theme === issue.theme)
  }
  const file = pr.files.find((candidate) => candidate.path === issue.file)
  const anchor = file ? anchorLineIndex(file, issue) : undefined
  if (anchor === undefined) return false
  return findings.some(
    (finding) =>
      finding.file === issue.file && finding.lineIndex !== undefined && Math.abs(finding.lineIndex - anchor) <= lineTolerance,
  )
}

export function findingsAsMarkdown(pr: LabPullRequest, state: LabState, stakeholderNames: Record<string, string>): string {
  const lines = [`## ${pr.label} — PR #${pr.number}`, '']
  const sorted = [...state.findings].sort((a, b) => Number(b.starred) - Number(a.starred))
  for (const finding of sorted) {
    const where = finding.file ? `${finding.file.split('/').pop()}:${finding.lineLabel ?? ''}` : 'PR-level'
    const who = finding.stakeholder ? ` · hurts ${stakeholderNames[finding.stakeholder]}` : ''
    lines.push(`- ${finding.starred ? '⭐ ' : ''}[${finding.severity}] [${finding.theme}] ${where} — ${finding.text}${who}`)
  }
  lines.push('', `Merge confidence: ${state.score ?? '?'}/5 — ${state.reason || 'no reason given'}`)
  return lines.join('\n')
}
