import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import { themes } from '@/content/agenda'
import { aiPitfalls, aiPrompts, confidenceScale } from '@/content/handouts'
import { prB } from '@/content/lab/prB'
import type { Theme } from '@/content/types'
import { copyText, pullRequestAsPatch } from '@/lib/copyText'
import { usePersistentState } from '@/lib/usePersistentState'
import { cn } from '@/lib/utils'
import { themeStyles } from '@/lib/themeStyles'
import { Panel, SlideHeading, Takeaway } from './primitives'
import type { SlideDefinition } from './types'

const aiHelps: Record<Theme, string[]> = {
  intent: ['Drafts What changed? and Why? from the diff and ticket', 'Flags diff changes the ticket never asked for'],
  merge: ['Self-reviews against our checklist', 'Finds missing edge cases and weak assertions', 'Proposes a merge confidence score with reasons'],
  release: ['Checks migrations, API changes, config and logging', 'Drafts rollout, rollback and merge order'],
}

function AiFramingSlide() {
  return (
    <div>
      <SlideHeading
        kicker="Using AI to raise great PRs"
        title="We use AI to raise great PRs, but we own everything that goes in."
        lead="AI raises the floor. Knowing what great looks like comes first — AI works on top of it."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(aiHelps) as Theme[]).map((theme) => (
          <div key={theme} className={cn('rounded-2xl border p-5', themeStyles[theme].panel)}>
            <h2 className={cn('text-xl font-semibold', themeStyles[theme].accent)}>{themes[theme].name}</h2>
            <ul className="mt-3 space-y-2 text-zinc-800">
              {aiHelps[theme].map((help) => (
                <li key={help}>• {help}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  )
}

function PromptsSlide() {
  return (
    <div>
      <SlideHeading kicker="Codex prompts" title="One prompt per theme" lead="Written for Codex; they work in any coding assistant." />
      <Tabs defaultValue="intent">
        <TabsList>
          {aiPrompts.map((prompt) => (
            <TabsTrigger key={prompt.theme} value={prompt.theme}>
              {themes[prompt.theme].name}
            </TabsTrigger>
          ))}
        </TabsList>
        {aiPrompts.map((prompt) => (
          <TabsContent key={prompt.theme} value={prompt.theme} className="mt-4">
            <Panel>
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-lg font-semibold">{prompt.title}</p>
                  <p className="text-sm text-zinc-500">{prompt.whenToUse}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => copyText(prompt.prompt, 'Prompt copied')}>
                  <Copy /> Copy prompt
                </Button>
              </div>
              <pre className="max-h-[45vh] overflow-auto rounded-lg bg-zinc-50 p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-800">
                {prompt.prompt}
              </pre>
            </Panel>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}

function PitfallsSlide() {
  return (
    <div>
      <SlideHeading kicker="Where AI goes wrong" title="Plausible is not the same as correct" />
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {aiPitfalls.map((pitfall) => (
          <Panel key={pitfall.title}>
            <p className="text-lg font-semibold">{pitfall.title}</p>
            <p className="mt-1 text-zinc-600">{pitfall.detail}</p>
          </Panel>
        ))}
      </div>
      <Takeaway>The author owns every line — whoever, or whatever, typed it.</Takeaway>
    </div>
  )
}

function LiveDemoSlide() {
  const [aiScore, setAiScore] = usePersistentState<number | null>('demo:ai-score', null)
  const [aiOutput, setAiOutput] = usePersistentState('demo:ai-output', '')

  return (
    <div>
      <SlideHeading kicker="Live" title="Codex vs the expert, on PR B" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          <Panel>
            <ol className="list-decimal space-y-2 pl-5 text-zinc-800">
              <li>Copy PR B as a patch and paste it into Codex.</li>
              <li>Run the “Self-review and score” prompt.</li>
              <li>Record the score Codex gives, and compare.</li>
            </ol>
            <Button className="mt-4" variant="outline" onClick={() => copyText(pullRequestAsPatch(prB), 'PR B patch copied')}>
              <Copy /> Copy PR B patch
            </Button>
          </Panel>
          <Panel>
            <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">Scores</p>
            <div className="mt-3 flex items-center gap-6">
              <div>
                <p className="text-sm text-zinc-500">Expert</p>
                <p className="font-mono text-4xl font-semibold">{prB.expertScore}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-500">Codex</p>
                <div className="mt-1 flex gap-1">
                  {confidenceScale
                    .map((level) => level.score)
                    .sort()
                    .map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setAiScore(aiScore === score ? null : score)}
                        className={cn(
                          'size-9 rounded-lg border font-mono font-semibold transition-colors',
                          aiScore === score ? 'border-zinc-900 bg-zinc-900 text-white' : 'border-zinc-200 hover:border-zinc-400',
                        )}
                        aria-pressed={aiScore === score}
                      >
                        {score}
                      </button>
                    ))}
                </div>
              </div>
            </div>
            {aiScore !== null && (
              <p className="mt-3 text-sm text-zinc-600">
                {aiScore === prB.expertScore
                  ? 'Same score. Now check the reasons — did it find the deleted safeguards?'
                  : aiScore > prB.expertScore
                    ? 'Codex is more confident than the expert. What did it miss?'
                    : 'Codex is stricter than the expert. Are its blockers real?'}
              </p>
            )}
          </Panel>
        </div>
        <Panel>
          <p className="text-sm font-semibold tracking-widest text-zinc-500 uppercase">Fallback output</p>
          <p className="mt-1 text-sm text-zinc-500">
            Paste the output from your dry run here. If the live run is slow or fails, present this instead. It stays saved in this browser.
          </p>
          <Textarea
            value={aiOutput}
            onChange={(event) => setAiOutput(event.target.value)}
            placeholder="Paste Codex output from the dry run…"
            className="mt-3 min-h-[40vh] font-mono text-xs"
          />
        </Panel>
      </div>
    </div>
  )
}

export const aiSlides: SlideDefinition[] = [
  {
    id: 'ai-framing',
    segmentId: 'ai',
    title: 'AI framing',
    Component: AiFramingSlide,
    notes: {
      say: [
        'Read the headline. It is the team’s stance on AI in one sentence.',
        'Map AI help onto the same three themes. Nothing new to learn — AI just checks the bar faster.',
      ],
      takeaway: 'AI raises the floor; you still own every line.',
    },
  },
  {
    id: 'ai-prompts',
    segmentId: 'ai',
    title: 'Codex prompts',
    Component: PromptsSlide,
    notes: {
      say: [
        'Walk through one tab in detail (merge confidence), skim the other two.',
        'Highlight the line “pay special attention to the deleted lines” — that came straight from PR B.',
        'The scoring rules in the prompt are the same as our scale; AI is held to the same bar as humans.',
      ],
      ifLate: 'Show only the merge-confidence tab.',
    },
  },
  {
    id: 'ai-pitfalls',
    segmentId: 'ai',
    title: 'Where AI goes wrong',
    Component: PitfallsSlide,
    notes: {
      say: [
        'Point at PR B’s third test: it asserts two charge calls succeed. A tool generating tests from code will happily lock in a bug like that.',
        'Disclosure is about focusing review, not blame.',
      ],
      ask: ['Where has AI fooled you in a review or a PR?'],
      ifLate: 'Skip the question.',
    },
  },
  {
    id: 'ai-demo',
    segmentId: 'ai',
    title: 'Live demo',
    Component: LiveDemoSlide,
    notes: {
      say: [
        'Before the session: run the demo once and paste the output into the fallback box.',
        'Live: copy PR B, paste into Codex with the self-review prompt, record the score.',
        'Whatever the gap between Codex and the expert, that gap is the lesson.',
      ],
      listenFor: ['Did Codex notice the removed `findAllByIdForUpdate` and idempotency key? Those are what separate a careful review from a summary.'],
      ifLate: 'Present the fallback output instead of running live.',
    },
  },
]
