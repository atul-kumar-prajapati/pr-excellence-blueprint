import { ExternalLink } from 'lucide-react'
import { prA } from '@/content/lab/prA'
import { prB } from '@/content/lab/prB'
import type { LabPullRequest } from '@/content/types'
import { countChanges } from '@/lib/diff'
import { Panel, SlideHeading, Takeaway } from './primitives'
import type { SlideDefinition } from './types'

function PrLinkCard({ pr, group }: { pr: LabPullRequest; group: string }) {
  const { additions, deletions } = countChanges(pr.files)
  return (
    <a
      href={`#/lab/${pr.id}`}
      className="group block rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs transition-colors hover:border-zinc-900"
    >
      <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">{group}</p>
      <h2 className="mt-2 flex items-center gap-2 text-2xl font-semibold">
        {pr.label}
        <ExternalLink className="size-4 text-zinc-400 group-hover:text-zinc-900" />
      </h2>
      <p className="mt-1 font-mono text-sm text-zinc-500">
        #{pr.number} · <span className="text-emerald-600">+{additions}</span>{' '}
        <span className="text-red-600">−{deletions}</span> · {pr.files.length} files
      </p>
      <p className="mt-3 text-zinc-700">{pr.summary}</p>
    </a>
  )
}

const steps = [
  { time: '3 min', title: 'Get set', detail: 'Join your breakout room. Open your PR from the link. Pick one person to share their screen and type.' },
  { time: '10 min', title: 'Review', detail: 'Click any line to log a finding: theme, severity, who it hurts. Use “PR-level finding” for the description.' },
  { time: '', title: 'Decide', detail: 'Star your top 3. Give a merge confidence score (1–5) with one sentence of reasoning.' },
  { time: '9 min', title: 'Compare', detail: 'Back in the main room: each group shares top 3 and score. Then we reveal the expert review.' },
]

function LabBriefSlide() {
  return (
    <div>
      <SlideHeading kicker="Live PR review lab · 22 minutes" title="Review a real-looking PR. Rank. Decide." />
      <div className="grid gap-4 md:grid-cols-2">
        <PrLinkCard pr={prA} group="Group A" />
        <PrLinkCard pr={prB} group="Group B" />
      </div>
      <ol className="mt-6 grid gap-3 md:grid-cols-4">
        {steps.map((step, index) => (
          <li key={step.title}>
            <Panel className="h-full">
              <p className="font-mono text-sm text-zinc-400">
                {index + 1}
                {step.time && ` · ${step.time}`}
              </p>
              <p className="mt-1 font-semibold">{step.title}</p>
              <p className="mt-1 text-sm text-zinc-600">{step.detail}</p>
            </Panel>
          </li>
        ))}
      </ol>
      <p className="mt-4 text-sm text-zinc-500">
        Hints appear on the PR page if you start its timer. Findings stay in your browser — use “Copy findings” to paste them into chat.
      </p>
    </div>
  )
}

function CompareSlide() {
  return (
    <div>
      <SlideHeading kicker="Compare" title="Top 3, score, then the expert review" />
      <div className="grid gap-4 md:grid-cols-3">
        {['What did you miss?', 'What did you over-rate?', 'Did the tidy PR fool you?'].map((question) => (
          <Panel key={question} className="bg-zinc-950 text-xl font-medium text-white">
            {question}
          </Panel>
        ))}
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <Panel>
          <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">Group A · {prA.label}</p>
          <p className="mt-2 text-zinc-700">
            Expert score <span className="font-mono font-semibold">{prA.expertScore}/5</span> ·{' '}
            {prA.issues.length} planted issues
          </p>
          <a className="mt-3 inline-block text-sm font-medium underline underline-offset-2" href="#/lab/a">
            Open PR A and reveal the expert review
          </a>
        </Panel>
        <Panel>
          <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">Group B · {prB.label}</p>
          <p className="mt-2 text-zinc-700">
            Expert score <span className="font-mono font-semibold">{prB.expertScore}/5</span> ·{' '}
            {prB.issues.length} planted issues
          </p>
          <a className="mt-3 inline-block text-sm font-medium underline underline-offset-2" href="#/lab/b">
            Open PR B and reveal the expert review
          </a>
        </Panel>
      </div>
      <Takeaway>A polished PR isn’t the same as a safe PR. Judge it by the evidence.</Takeaway>
    </div>
  )
}

export const labSlides: SlideDefinition[] = [
  {
    id: 'lab-brief',
    segmentId: 'lab',
    title: 'Lab brief',
    Component: LabBriefSlide,
    notes: {
      say: [
        'Split into two groups; inside each, trios if you have 20+ people (several trios can share the same PR).',
        'Group A gets PR A (messy), Group B gets PR B (tidy but broken). With an all-architect room, give PR B to both groups and compare rankings instead.',
        'Show how to log a finding on one line before sending people to breakout rooms.',
        'Solo facilitation: hop between rooms at minutes 4 and 8. Timed hints cover the gaps.',
      ],
      listenFor: ['Groups spending all their time on PR A’s nits — nudge them to rank and score.'],
      ifLate: 'Never cut the lab. Cut the principles discussion to 5 minutes instead.',
    },
  },
  {
    id: 'lab-compare',
    segmentId: 'lab',
    title: 'Compare',
    Component: CompareSlide,
    notes: {
      say: [
        'Each group: top 3 and score, one minute each. Then open the PR page and click “Reveal expert review” while sharing your screen.',
        'PR A expert top 3: committed secret, money in double, vague mixed-scope PR. Score 1.',
        'PR B expert top 3: NOT NULL migration, double charge on retry, IDOR. Score 2. The deleted lines held the seat lock and the idempotency key.',
      ],
      ask: ['What did you miss?', 'What did you over-rate?', 'Did the tidy PR fool you — did its template push your score up?'],
      listenFor: [
        'Group B scoring 3 or 4 before the reveal — the best teaching moment of the session.',
        'Architects debating severity (e.g. lock vs transaction) — good; that is calibration.',
      ],
      takeaway: 'A polished PR isn’t a safe PR.',
    },
  },
]
