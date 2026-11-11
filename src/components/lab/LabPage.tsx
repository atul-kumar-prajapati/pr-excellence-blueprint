import { useMemo, useState } from 'react'
import Markdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { GitPullRequest } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { prA } from '@/content/lab/prA'
import { prB } from '@/content/lab/prB'
import type { Route } from '@/lib/hashRoute'
import { countChanges } from '@/lib/diff'
import { TopNav } from '../TopNav'
import { DiffView, lineAnchorId, type ComposerTarget } from './DiffView'
import { FindingCard, IssueCard } from './FindingCard'
import { FindingComposer } from './FindingComposer'
import { isIssueFound, resetLabState, useLabState, type Finding } from './labState'
import { Worksheet } from './Worksheet'
import { anchorLineIndex } from '@/lib/diff'

const pullRequests = { a: prA, b: prB }

export function LabPage({ route }: { route: Extract<Route, { page: 'lab' }> }) {
  const pr = pullRequests[route.pr]
  return <LabPullRequestView key={pr.id} pr={pr} route={route} />
}

function LabPullRequestView({ pr, route }: { pr: typeof prA; route: Extract<Route, { page: 'lab' }> }) {
  const [state, setState] = useLabState(pr)
  const [tab, setTab] = useState<'conversation' | 'files'>('conversation')
  const [composerTarget, setComposerTarget] = useState<ComposerTarget | null>(null)
  const { additions, deletions } = useMemo(() => countChanges(pr.files), [pr.files])

  const foundIssueIds = useMemo(
    () => new Set(pr.issues.filter((issue) => isIssueFound(pr, issue, state.findings)).map((issue) => issue.id)),
    [pr, state.findings],
  )
  const topThreeFull = state.findings.filter((finding) => finding.starred).length >= 3
  const prLevelFindings = state.findings.filter((finding) => !finding.file)
  const prLevelIssues = state.revealed ? pr.issues.filter((issue) => !issue.file) : []

  const addFinding = (finding: Omit<Finding, 'id' | 'starred'>) => {
    setState((current) => ({ ...current, findings: [...current.findings, { ...finding, id: crypto.randomUUID(), starred: false }] }))
    setComposerTarget(null)
  }
  const toggleStar = (id: string) =>
    setState((current) => {
      const starredCount = current.findings.filter((finding) => finding.starred).length
      return {
        ...current,
        findings: current.findings.map((finding) =>
          finding.id === id && (finding.starred || starredCount < 3) ? { ...finding, starred: !finding.starred } : finding,
        ),
      }
    })
  const deleteFinding = (id: string) => setState((current) => ({ ...current, findings: current.findings.filter((finding) => finding.id !== id) }))

  const jumpToIssue = (issueId: string) => {
    const issue = pr.issues.find((candidate) => candidate.id === issueId)
    if (!issue?.file) {
      setTab('conversation')
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    const file = pr.files.find((candidate) => candidate.path === issue.file)
    const index = file ? anchorLineIndex(file, issue) : undefined
    setTab('files')
    if (index !== undefined) {
      window.setTimeout(() => document.getElementById(lineAnchorId(issue.file!, index))?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 50)
    }
  }

  return (
    <div className="min-h-svh bg-stone-50">
      <TopNav route={route} />
      <div className="mx-auto max-w-[1500px] px-4 py-6 md:px-6">
        <header className="mb-5">
          <h1 className="text-xl font-semibold text-pretty text-zinc-950 md:text-2xl">
            {pr.title} <span className="font-normal text-zinc-400">#{pr.number}</span>
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-sm text-zinc-600">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-600 px-2.5 py-0.5 text-xs font-semibold text-white">
              <GitPullRequest className="size-3.5" /> Open
            </span>
            <span>
              <span className="font-semibold text-zinc-900">{pr.author}</span> wants to merge into <code className="rounded bg-sky-50 px-1 text-sky-800">main</code> from{' '}
              <code className="rounded bg-sky-50 px-1 text-sky-800">{pr.branch}</code>
            </span>
            <span className="font-mono text-xs">
              <span className="text-emerald-600">+{additions}</span> <span className="text-red-600">−{deletions}</span>
            </span>
            <span className="text-xs text-zinc-400">· CineBook booking service (fictional)</span>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
          <Tabs value={tab} onValueChange={(value) => setTab(value as typeof tab)}>
            <TabsList>
              <TabsTrigger value="conversation">Conversation</TabsTrigger>
              <TabsTrigger value="files">Files changed ({pr.files.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="conversation" className="mt-4 space-y-3">
              <article className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
                <p className="border-b border-zinc-200 bg-zinc-50 px-4 py-2 text-sm text-zinc-600">
                  <span className="font-semibold text-zinc-900">{pr.author}</span> opened this pull request
                </p>
                <div className="prose prose-sm prose-zinc max-w-none px-5 py-4 prose-headings:mt-5 prose-headings:mb-2 prose-h2:text-base prose-code:before:content-none prose-code:after:content-none">
                  <Markdown remarkPlugins={[remarkGfm]}>{pr.description}</Markdown>
                </div>
              </article>
              {prLevelFindings.map((finding) => (
                <FindingCard
                  key={finding.id}
                  finding={finding}
                  starDisabled={topThreeFull}
                  onToggleStar={() => toggleStar(finding.id)}
                  onDelete={() => deleteFinding(finding.id)}
                />
              ))}
              {prLevelIssues.map((issue) => (
                <IssueCard key={issue.id} issue={issue} found={foundIssueIds.has(issue.id)} />
              ))}
              {composerTarget && !composerTarget.file && (
                <FindingComposer location="PR-level" onCancel={() => setComposerTarget(null)} onSave={addFinding} />
              )}
              <p className="text-sm text-zinc-500">
                Next: open <button type="button" className="font-medium text-zinc-900 underline underline-offset-2" onClick={() => setTab('files')}>Files changed</button> and click any line to log a finding.
              </p>
            </TabsContent>

            <TabsContent value="files" className="mt-4 space-y-4">
              {pr.files.map((file) => (
                <DiffView
                  key={file.path}
                  file={file}
                  findings={state.findings.filter((finding) => finding.file === file.path)}
                  issues={pr.issues}
                  revealed={state.revealed}
                  foundIssueIds={foundIssueIds}
                  composerTarget={composerTarget}
                  onOpenComposer={setComposerTarget}
                  onCloseComposer={() => setComposerTarget(null)}
                  onAddFinding={addFinding}
                  onToggleStar={toggleStar}
                  onDeleteFinding={deleteFinding}
                  topThreeFull={topThreeFull}
                />
              ))}
            </TabsContent>
          </Tabs>

          <aside className="lg:sticky lg:top-20 lg:max-h-[calc(100svh-6rem)] lg:overflow-y-auto lg:pb-6">
            <Worksheet
              pr={pr}
              state={state}
              setState={setState}
              foundIssueIds={foundIssueIds}
              onAddPrLevelFinding={() => {
                setTab('conversation')
                setComposerTarget({})
              }}
              onJumpToIssue={jumpToIssue}
              onToggleStar={toggleStar}
              onDeleteFinding={deleteFinding}
              onReset={() => {
                setState(resetLabState())
                setComposerTarget(null)
              }}
            />
          </aside>
        </div>
      </div>
    </div>
  )
}
