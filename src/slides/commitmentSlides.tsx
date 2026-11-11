import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { sessionOutcome } from '@/content/agenda'
import { copyText } from '@/lib/copyText'
import { usePersistentState } from '@/lib/usePersistentState'
import { Panel, SlideHeading, Takeaway } from './primitives'
import type { SlideDefinition } from './types'

function CommitmentSlide() {
  const [asAuthor, setAsAuthor] = usePersistentState('commitment:author', '')
  const [asReviewer, setAsReviewer] = usePersistentState('commitment:reviewer', '')
  const ready = asAuthor.trim() && asReviewer.trim()

  return (
    <div>
      <SlideHeading
        kicker="Commitments"
        title="One change as an author. One as a reviewer."
        lead="Be specific enough that someone could check next month whether you did it."
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Panel>
          <label htmlFor="commit-author" className="text-lg font-semibold">
            As an author, I will…
          </label>
          <Textarea
            id="commit-author"
            value={asAuthor}
            onChange={(event) => setAsAuthor(event.target.value)}
            placeholder="e.g. fill in the Rollback line honestly on every PR that touches the database"
            className="mt-3 min-h-28"
          />
        </Panel>
        <Panel>
          <label htmlFor="commit-reviewer" className="text-lg font-semibold">
            As a reviewer, I will…
          </label>
          <Textarea
            id="commit-reviewer"
            value={asReviewer}
            onChange={(event) => setAsReviewer(event.target.value)}
            placeholder="e.g. read the deleted lines first and label every comment"
            className="mt-3 min-h-28"
          />
        </Panel>
      </div>
      <Button
        className="mt-4"
        disabled={!ready}
        onClick={() => copyText(`As an author, I will ${asAuthor.trim()}\nAs a reviewer, I will ${asReviewer.trim()}`, 'Commitments copied — paste them into chat')}
      >
        <Copy /> Copy for the chat
      </Button>
    </div>
  )
}

const nextSteps = [
  { title: 'Agree the template', detail: 'Walk through the Handouts page: keep, change or drop. That becomes our team standard.' },
  { title: 'Add it to our repos', detail: 'As .github/pull_request_template.md, plus the reviewer checklist on the wiki.' },
  { title: 'Share the Codex prompts', detail: 'Everyone runs the self-review prompt before asking for review.' },
  { title: 'Check back', detail: 'Revisit commitments in a few weeks: PR size, time to first review, rework.' },
]

function NextStepsSlide() {
  return (
    <div>
      <SlideHeading kicker="Next steps" title="From session to team standard" />
      <ol className="grid gap-3 md:grid-cols-2">
        {nextSteps.map((step, index) => (
          <li key={step.title}>
            <Panel className="h-full">
              <p className="font-mono text-sm text-zinc-400">0{index + 1}</p>
              <p className="mt-1 text-xl font-semibold">{step.title}</p>
              <p className="mt-1 text-zinc-600">{step.detail}</p>
            </Panel>
          </li>
        ))}
      </ol>
      <Takeaway>{sessionOutcome}</Takeaway>
      <a href="#/handouts" className="mt-4 inline-block text-sm font-medium underline underline-offset-2">
        Open the handouts: template, reviewer checklist, scale and prompts
      </a>
    </div>
  )
}

export const commitmentSlides: SlideDefinition[] = [
  {
    id: 'commitments',
    segmentId: 'commitments',
    title: 'Commitments',
    Component: CommitmentSlide,
    notes: {
      say: [
        'Give two silent minutes. Everyone writes both commitments and pastes them in chat.',
        'Ask two or three people to read theirs out. Push gently for specifics: “better descriptions” → “a risk line on every PR”.',
      ],
      ifLate: 'Ask people to post commitments in chat after the session.',
    },
  },
  {
    id: 'next-steps',
    segmentId: 'commitments',
    title: 'Next steps',
    Component: NextStepsSlide,
    notes: {
      say: [
        'Open the Handouts page and go through the template section by section: keep, change, drop. Capture changes live.',
        'Architect run: their changes become the version used with mixed-seniority groups.',
        'Close by reading the outcome one more time.',
      ],
      takeaway: 'Easy to review, safe to merge, ready to release.',
    },
  },
]
