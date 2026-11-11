import { useState } from 'react'
import { RotateCcw } from 'lucide-react'
import { stakeholderClusters, type Stakeholder } from '@/content/stakeholders'
import { cn } from '@/lib/utils'
import { Code, Panel, SlideHeading, Takeaway } from './primitives'
import type { SlideDefinition } from './types'

function StakeholderCard({ stakeholder }: { stakeholder: Stakeholder }) {
  const [flipped, setFlipped] = useState(false)
  return (
    <button
      type="button"
      onClick={() => setFlipped((value) => !value)}
      aria-pressed={flipped}
      className={cn(
        'group flex min-h-28 w-full flex-col justify-between rounded-xl border p-3 text-left transition-colors focus-visible:ring-3 focus-visible:ring-zinc-400 focus-visible:outline-none',
        flipped ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 bg-white hover:border-zinc-400',
      )}
    >
      <span className="text-sm font-semibold">{stakeholder.name}</span>
      {flipped ? (
        <span className="mt-2 space-y-1.5 text-xs leading-snug">
          <span className="block text-zinc-100">“{stakeholder.fear}”</span>
          <span className="block text-zinc-400">→ {stakeholder.answeredBy}</span>
        </span>
      ) : (
        <span className="mt-2 flex items-center gap-1 text-xs text-zinc-400 group-hover:text-zinc-600">
          <RotateCcw className="size-3" /> What do they fear?
        </span>
      )}
    </button>
  )
}

function StakeholderMapSlide() {
  return (
    <div>
      <SlideHeading
        kicker="Who cares about your PR?"
        title="Your reviewer is one reader out of fourteen"
        lead="Click a card to reveal what that person fears from your PR — and which part of the template answers it."
      />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {stakeholderClusters.map((cluster) => (
          <section key={cluster.name}>
            <h2 className="mb-2 text-xs font-semibold tracking-widest text-zinc-500 uppercase">{cluster.name}</h2>
            <div className="grid gap-2">
              {cluster.stakeholders.map((stakeholder) => (
                <StakeholderCard key={stakeholder.id} stakeholder={stakeholder} />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  )
}

function DeepDiveSlide() {
  return (
    <div>
      <SlideHeading kicker="Three readers people forget" title="Same backend PR, three very different questions" />
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel>
          <h2 className="text-xl font-semibold">Frontend engineer</h2>
          <p className="mt-2 text-zinc-600">“Did the contract change under me?”</p>
          <div className="mt-4">
            <Code tone="bad" label="Backend PR: “tidied naming”">{`- List<String> seatNumbers,
+ List<String> seats,`}</Code>
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            Web breaks on deploy. Installed mobile apps break until users update. Needs a linked PR and merge order.
          </p>
        </Panel>
        <Panel>
          <h2 className="text-xl font-semibold">SRE / on-call</h2>
          <p className="mt-2 text-zinc-600">“If this pages me at 3 a.m., what do I do?”</p>
          <div className="mt-4">
            <Code tone="good" label="Rollback note that helps">{`Rollback: disable flag booking.v2
(code revert not needed). Column
payment_reference stays nullable;
no data rollback required.`}</Code>
          </div>
          <p className="mt-3 text-sm text-zinc-600">“Revert the PR” is not a rollback plan once a migration has run.</p>
        </Panel>
        <Panel>
          <h2 className="text-xl font-semibold">AI agent</h2>
          <p className="mt-2 text-zinc-600">“What are the rules here?”</p>
          <div className="mt-4">
            <Code label="AGENTS.md">{`- Money: BigDecimal, HALF_EVEN, 2dp
- Errors: ProblemDetail only
- Migrations: expand, then contract`}</Code>
          </div>
          <p className="mt-3 text-sm text-zinc-600">
            Stale docs make agents confidently repeat old patterns in the next 50 PRs.
          </p>
        </Panel>
      </div>
      <Takeaway>Your PR description is written for all of these people, not just the person who approves it.</Takeaway>
    </div>
  )
}

export const stakeholderSlides: SlideDefinition[] = [
  {
    id: 'stakeholder-map',
    segmentId: 'stakeholders',
    title: 'Stakeholder map',
    Component: StakeholderMapSlide,
    notes: {
      say: [
        'Fourteen roles in five groups. Don’t flip them all — ask the room which card to flip, and flip four or five.',
        'Wear each hat briefly: “I’m support. It broke. What do I need from this PR?”',
      ],
      ask: [
        'Which of these people have you never thought about when writing a PR description?',
        'Architects: which of these do you represent when you review?',
      ],
      listenFor: ['DBA, release manager and external clients are the usual blind spots.'],
      ifLate: 'Flip three cards (frontend engineer, SRE, CEO) and move on.',
    },
  },
  {
    id: 'deep-dive',
    segmentId: 'stakeholders',
    title: 'Three readers people forget',
    Component: DeepDiveSlide,
    notes: {
      say: [
        'The field rename is from PR B in the lab — don’t reveal that yet; it pays off later.',
        'The AI agent point: AGENTS.md and READMEs are now read by machines that generate the next PRs. A stale doc multiplies.',
      ],
      takeaway: 'Your PR description is written for all of these people.',
    },
  },
]
