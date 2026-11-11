import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { Panel, SlideHeading, Takeaway } from './primitives'
import type { SlideDefinition } from './types'

const mustHaves = [
  { item: 'One clear purpose', section: 'What changed? / Why?' },
  { item: 'Small enough to review properly', section: 'Checklist: scoped to the ticket' },
  { item: 'Evidence for every claim', section: 'Verification evidence' },
  { item: 'Tests that check behaviour, including failures', section: 'Test evidence' },
  { item: 'No security or data-integrity red flags', section: 'Checklist' },
  { item: 'A way to roll back — including data', section: 'Impact: rollout / rollback' },
]

const niceToHaves = [
  'Diagrams for complex flows',
  'Performance numbers when the path isn’t hot',
  'A polished commit history',
  'Screenshots or a short video for UI changes',
]

function QualityBarSlide() {
  return (
    <div>
      <SlideHeading
        kicker="The quality bar"
        title="A great PR makes the reviewer’s job easy and the release boring."
      />
      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel>
          <h2 className="mb-4 text-sm font-semibold tracking-widest text-zinc-500 uppercase">Must-haves</h2>
          <ul className="space-y-3">
            {mustHaves.map(({ item, section }) => (
              <li key={item} className="flex items-start gap-3">
                <Check className="mt-1 size-5 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-lg font-medium text-zinc-900">{item}</p>
                  <p className="text-sm text-zinc-500">Template: {section}</p>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel className="bg-zinc-50">
          <h2 className="mb-4 text-sm font-semibold tracking-widest text-zinc-500 uppercase">Nice-to-haves</h2>
          <ul className="space-y-3">
            {niceToHaves.map((item) => (
              <li key={item} className="flex items-start gap-3 text-zinc-700">
                <Sparkles className="mt-0.5 size-4 shrink-0 text-zinc-400" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-6 text-sm text-zinc-500">Nice-to-haves never compensate for a missing must-have.</p>
        </Panel>
      </div>
    </div>
  )
}

const slices = [
  { title: 'Refactor', lines: '~300', detail: 'Extract services. No behaviour change, proved by existing tests.' },
  { title: 'Additive migration', lines: '~40', detail: 'New nullable columns. Old and new code both work.' },
  { title: 'Feature behind a flag', lines: '~350', detail: 'Booking v2 and promos, off by default. Tests and evidence.' },
  { title: 'Clean-up', lines: '~120', detail: 'Remove the flag and old paths; tighten constraints.' },
]

function SliceSlide() {
  return (
    <div>
      <SlideHeading
        kicker="Size is the first quality bar"
        title="#4127 should have been four PRs"
        lead="Each one reviewable in one sitting, each one safe to deploy on its own."
      />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-stretch">
        {slices.map((slice, index) => (
          <div key={slice.title} className="flex flex-1 items-center gap-3">
            <Panel className="h-full flex-1">
              <p className="font-mono text-sm text-zinc-400">PR {index + 1}</p>
              <h2 className="mt-1 text-xl font-semibold">{slice.title}</h2>
              <p className="mt-1 font-mono text-sm text-emerald-700">{slice.lines} lines</p>
              <p className="mt-3 text-zinc-700">{slice.detail}</p>
            </Panel>
            {index < slices.length - 1 && <ArrowRight className="hidden size-5 shrink-0 text-zinc-400 lg:block" />}
          </div>
        ))}
      </div>
      <Takeaway>If you can’t explain your PR in one sentence, it’s more than one PR.</Takeaway>
    </div>
  )
}

export const greatSlides: SlideDefinition[] = [
  {
    id: 'quality-bar',
    segmentId: 'great',
    title: 'The quality bar',
    Component: QualityBarSlide,
    notes: {
      say: [
        'Read the headline line slowly. It is the one line to remember.',
        'Each must-have maps to a section of the template we’ll walk through later — the template is just these must-haves written down.',
      ],
      ask: ['Architects: which must-have would you add or drop? (Capture answers for the team standard at the end.)'],
      listenFor: ['Observability, backward compatibility — both live under "Impact" in the template.'],
      takeaway: 'Nice-to-haves never compensate for a missing must-have.',
    },
  },
  {
    id: 'slice',
    segmentId: 'great',
    title: 'Slicing #4127',
    Component: SliceSlide,
    notes: {
      say: [
        'Walk through the four PRs. Stress that PR 2 (expand) and PR 4 (contract) are what make the migration safe.',
        'Feature flags let incomplete work merge without being switched on — that is what keeps PRs small.',
      ],
      ask: ['What stops your team from splitting PRs like this today?'],
      listenFor: ['"Review takes too long so we batch" — the loop that small PRs break.', '"CI is slow" — a real blocker worth noting.'],
      ifLate: 'Skip the question.',
    },
  },
]
