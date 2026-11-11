import type { ReactNode } from 'react'
import { useMemo } from 'react'
import { FilePlus2, FilePen, Plus } from 'lucide-react'
import type { DiffFile, PlantedIssue } from '@/content/types'
import { anchorLineIndex, parseDiff, type DiffLine } from '@/lib/diff'
import { cn } from '@/lib/utils'
import { FindingCard, IssueCard } from './FindingCard'
import { FindingComposer } from './FindingComposer'
import type { Finding } from './labState'

export interface ComposerTarget {
  file?: string
  lineIndex?: number
  lineLabel?: string
}

export function lineAnchorId(filePath: string, lineIndex: number) {
  return `line-${filePath.replace(/[^a-zA-Z0-9]/g, '-')}-${lineIndex}`
}

function lineLabel(line: DiffLine) {
  return line.newNumber !== undefined ? `L${line.newNumber}` : `old L${line.oldNumber}`
}

export function DiffView({
  file,
  findings,
  issues,
  revealed,
  foundIssueIds,
  composerTarget,
  onOpenComposer,
  onCloseComposer,
  onAddFinding,
  onToggleStar,
  onDeleteFinding,
  topThreeFull,
}: {
  file: DiffFile
  findings: Finding[]
  issues: PlantedIssue[]
  revealed: boolean
  foundIssueIds: Set<string>
  composerTarget: ComposerTarget | null
  onOpenComposer: (target: ComposerTarget) => void
  onCloseComposer: () => void
  onAddFinding: (finding: Omit<Finding, 'id' | 'starred'>) => void
  onToggleStar: (id: string) => void
  onDeleteFinding: (id: string) => void
  topThreeFull: boolean
}) {
  const lines = useMemo(() => parseDiff(file.diff), [file.diff])
  const additions = lines.filter((line) => line.kind === 'add').length
  const deletions = lines.filter((line) => line.kind === 'del').length
  const issuesByLine = useMemo(() => {
    const map = new Map<number, PlantedIssue[]>()
    for (const issue of issues) {
      if (issue.file !== file.path) continue
      const index = anchorLineIndex(file, issue)
      if (index === undefined) continue
      map.set(index, [...(map.get(index) ?? []), issue])
    }
    return map
  }, [file, issues])

  return (
    <section className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <header className="flex items-center gap-2 border-b border-zinc-200 bg-zinc-50 px-3 py-2">
        {file.status === 'added' ? <FilePlus2 className="size-4 text-emerald-600" /> : <FilePen className="size-4 text-amber-600" />}
        <span className="min-w-0 flex-1 truncate font-mono text-xs font-medium text-zinc-800 md:text-sm" title={file.path}>
          {file.path}
        </span>
        <span className="font-mono text-xs whitespace-nowrap">
          <span className="text-emerald-600">+{additions}</span> <span className="text-red-600">−{deletions}</span>
        </span>
      </header>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse font-mono text-[12.5px] leading-5">
          <tbody>
            {lines.map((line) => {
              if (line.kind === 'hunk') {
                return (
                  <tr key={line.index} className="bg-sky-50 text-sky-800">
                    <td colSpan={3} className="px-3 py-1 text-xs">
                      {line.text}
                    </td>
                  </tr>
                )
              }
              const lineFindings = findings.filter((finding) => finding.lineIndex === line.index)
              const lineIssues = revealed ? (issuesByLine.get(line.index) ?? []) : []
              const composerOpen = composerTarget?.file === file.path && composerTarget.lineIndex === line.index
              const label = lineLabel(line)
              return (
                <LineRows
                  key={line.index}
                  id={lineAnchorId(file.path, line.index)}
                  line={line}
                  onClick={() => onOpenComposer({ file: file.path, lineIndex: line.index, lineLabel: label })}
                  hasIssue={lineIssues.length > 0}
                >
                  {(lineFindings.length > 0 || lineIssues.length > 0 || composerOpen) && (
                    <tr>
                      <td colSpan={3} className="space-y-2 border-y border-zinc-200 bg-zinc-50 px-3 py-2 md:pl-24">
                        {lineFindings.map((finding) => (
                          <FindingCard
                            key={finding.id}
                            finding={finding}
                            onToggleStar={() => onToggleStar(finding.id)}
                            onDelete={() => onDeleteFinding(finding.id)}
                            starDisabled={topThreeFull}
                          />
                        ))}
                        {lineIssues.map((issue) => (
                          <IssueCard key={issue.id} issue={issue} found={foundIssueIds.has(issue.id)} />
                        ))}
                        {composerOpen && (
                          <FindingComposer
                            location={`${file.path.split('/').pop()} · ${label}`}
                            onCancel={onCloseComposer}
                            onSave={(draft) => onAddFinding({ ...draft, file: file.path, lineIndex: line.index, lineLabel: label })}
                          />
                        )}
                      </td>
                    </tr>
                  )}
                </LineRows>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function LineRows({
  id,
  line,
  onClick,
  hasIssue,
  children,
}: {
  id: string
  line: DiffLine
  onClick: () => void
  hasIssue: boolean
  children: ReactNode
}) {
  return (
    <>
      <tr
        id={id}
        onClick={onClick}
        className={cn(
          'group cursor-pointer scroll-mt-40',
          line.kind === 'add' && 'bg-emerald-50/70 hover:bg-emerald-100/70',
          line.kind === 'del' && 'bg-red-50/70 hover:bg-red-100/70',
          line.kind === 'context' && 'hover:bg-zinc-50',
          hasIssue && 'outline-2 -outline-offset-2 outline-emerald-400',
        )}
      >
        <td className="w-10 px-2 text-right text-zinc-400 select-none">{line.oldNumber ?? ''}</td>
        <td className="relative w-10 px-2 text-right text-zinc-400 select-none">
          <span className="group-hover:invisible">{line.newNumber ?? ''}</span>
          <Plus className="absolute top-0.5 right-2 hidden size-4 rounded bg-zinc-900 p-0.5 text-white group-hover:block" aria-hidden />
        </td>
        <td className="pr-4 whitespace-pre text-zinc-800">
          <span className={cn('mr-2 select-none', line.kind === 'add' && 'text-emerald-600', line.kind === 'del' && 'text-red-600')}>
            {line.kind === 'add' ? '+' : line.kind === 'del' ? '−' : ' '}
          </span>
          {line.text}
        </td>
      </tr>
      {children}
    </>
  )
}
