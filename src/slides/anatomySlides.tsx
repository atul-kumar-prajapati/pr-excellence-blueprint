import { themes } from '@/content/agenda'
import { confidenceGates, confidenceScale } from '@/content/handouts'
import type { Theme } from '@/content/types'
import { cn } from '@/lib/utils'
import { themeStyles } from '@/lib/themeStyles'
import { Code, Panel, SlideHeading, Takeaway, ThemePill } from './primitives'
import type { SlideDefinition } from './types'

const themeFocus: Record<Theme, string> = {
  intent: 'Title, ticket, scope, risk level',
  merge: 'Correctness · testing · maintainability · security',
  release: 'Data integrity · compatibility · operability',
}

function DefinitionSlide() {
  return (
    <div>
      <SlideHeading
        kicker="Anatomy of a great PR"
        title="Meets the functional, technical and non-functional expectations — and shows the evidence that proves it."
      />
      <div className="grid gap-4 md:grid-cols-3">
        {(Object.keys(themes) as Theme[]).map((theme, index) => (
          <div key={theme} className={cn('rounded-2xl border p-5', themeStyles[theme].panel)}>
            <p className="font-mono text-sm text-zinc-500">{index + 1}</p>
            <h2 className={cn('mt-1 text-2xl font-semibold', themeStyles[theme].accent)}>{themes[theme].name}</h2>
            <p className="mt-1 text-lg font-medium text-zinc-900">{themes[theme].question}</p>
            <p className="mt-4 text-sm text-zinc-600">{themeFocus[theme]}</p>
            <ul className="mt-4 flex flex-wrap gap-1.5">
              {themes[theme].sections.map((section) => (
                <li key={section} className="rounded-md bg-white/80 px-2 py-0.5 text-xs font-medium text-zinc-700 ring-1 ring-zinc-200">
                  {section}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <Takeaway>Every claim in the PR has evidence attached — or says honestly why it doesn’t.</Takeaway>
    </div>
  )
}

function IntentSlide() {
  return (
    <div>
      <SlideHeading kicker={themes.intent.name} title="What changed, and why — in one read" />
      <div className="mb-4">
        <ThemePill theme="intent" />
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <Code tone="bad" label="Before">{`fix discount bug

Fixed the discount issue. Tested locally.`}</Code>
        <Code tone="good" label="After">{`fix(pricing): round promo discounts to 2dp
using HALF_EVEN (#231)

Why: finance reconciliation flagged totals like
212.0749999. Rule agreed with finance (FIN-12).

Risk: Medium — affects checkout totals and
invoices. No schema or API change.`}</Code>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-3">
        <Panel>
          <p className="font-semibold">A title a stranger understands</p>
          <p className="mt-1 text-sm text-zinc-600">type(scope): what — not “changes” or “fixes”.</p>
        </Panel>
        <Panel>
          <p className="font-semibold">The why, linked</p>
          <p className="mt-1 text-sm text-zinc-600">Ticket, spec or ADR. Business rule stated, not implied.</p>
        </Panel>
        <Panel>
          <p className="font-semibold">Risk up front</p>
          <p className="mt-1 text-sm text-zinc-600">Low / Medium / High and the blast radius, before the reviewer opens a file.</p>
        </Panel>
      </div>
    </div>
  )
}

function MergeConfidenceSlide() {
  return (
    <div>
      <SlideHeading kicker={themes.merge.name} title="Is it correct, tested and safe?" />
      <div className="mb-4">
        <ThemePill theme="merge" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="font-semibold">Tests that prove behaviour</p>
          <Code tone="bad" label="Runs the code">{`assertNotNull(result);`}</Code>
          <Code tone="good" label="Proves the rule">{`assertThat(result)
  .isEqualByComparingTo("212.08");`}</Code>
        </div>
        <div className="space-y-3">
          <p className="font-semibold">Security at the boundary</p>
          <Code tone="bad" label="Any user, any booking">{`@GetMapping("/{id}")
get(@PathVariable Long id) {
  return service.findById(id);
}`}</Code>
          <Code tone="good" label="Ownership checked">{`return service.findForUser(
    id, user.id());`}</Code>
        </div>
        <div className="space-y-3">
          <p className="font-semibold">Nothing sensitive in logs</p>
          <Code tone="bad" label="Personal data in INFO logs">{`log.info("Booking for {} <{}>",
    name, email);`}</Code>
          <Code tone="good" label="Identifiers only">{`log.info("Booking {} for user {}",
    bookingId, userId);`}</Code>
        </div>
      </div>
      <Takeaway>“Not run, and why” and “Not tested, and why” are features, not confessions.</Takeaway>
    </div>
  )
}

function ReleaseCertaintySlide() {
  return (
    <div>
      <SlideHeading kicker={themes.release.name} title="Will it go out safely — and come back safely?" />
      <div className="mb-4">
        <ThemePill theme="release" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3">
          <p className="font-semibold">Data integrity</p>
          <Code tone="bad" label="Fails on existing rows">{`ALTER TABLE booking
  ADD COLUMN payment_reference
  VARCHAR(64) NOT NULL;`}</Code>
          <Code tone="good" label="Expand, then contract">{`-- PR 1: add nullable, backfill
-- PR 2: NOT NULL once all
--       writers set it`}</Code>
        </div>
        <div className="space-y-3">
          <p className="font-semibold">Compatibility</p>
          <Code tone="bad" label="Breaks web and mobile">{`- List<String> seatNumbers,
+ List<String> seats,`}</Code>
          <Code tone="good" label="Additive, then deprecate">{`  List<String> seatNumbers, // deprecated
+ List<String> seats,`}</Code>
        </div>
        <div className="space-y-3">
          <p className="font-semibold">Operability</p>
          <Code tone="bad" label="Retry without idempotency">{`for (attempt...) {
  paymentClient.charge(user, total);
}`}</Code>
          <Code tone="good" label="Same key on every attempt">{`paymentClient.charge(user, total,
    booking.idempotencyKey());`}</Code>
        </div>
      </div>
      <Takeaway>Reverting code doesn’t revert a migration, a renamed field or a double charge.</Takeaway>
    </div>
  )
}

const templateSections: { name: string; theme: Theme; highlight: string }[] = [
  { name: 'Title · Ticket · Risk', theme: 'intent', highlight: 'type(scope): what — plus Low / Medium / High' },
  { name: 'What changed?', theme: 'intent', highlight: 'The actual changes, not the commit log' },
  { name: 'Why?', theme: 'intent', highlight: 'Problem, expected outcome, linked spec or ADR' },
  { name: 'Verification evidence', theme: 'merge', highlight: 'Build, CI, quality gate, AI-assisted · “Not run, and why”' },
  { name: 'Test evidence', theme: 'merge', highlight: 'Acceptance criteria, edge cases, API examples · “Not tested, and why”' },
  { name: 'Checklist', theme: 'merge', highlight: 'Only what needs judgment — CI handles the rest' },
  { name: 'Impact, risks and reviewer notes', theme: 'release', highlight: 'Consumers, config, rollout, rollback, observability, start here' },
  { name: 'Linked PRs and merge order', theme: 'release', highlight: 'Frontend/backend pairs and deploy order — or “None — standalone”' },
]

function TemplateSlide() {
  return (
    <div>
      <SlideHeading
        kicker="Our PR template"
        title="The template is the three themes, written down"
        lead={<>One rule holds it together: if a section doesn’t apply, write <em>“Not applicable — reason”</em>. Never leave it blank.</>}
      />
      <ol className="grid gap-2 md:grid-cols-2">
        {templateSections.map((section) => (
          <li key={section.name} className={cn('flex items-start gap-3 rounded-xl border p-3', themeStyles[section.theme].panel)}>
            <span className={cn('mt-1.5 size-2.5 shrink-0 rounded-full', themeStyles[section.theme].dot)} />
            <div>
              <p className="font-semibold text-zinc-900">{section.name}</p>
              <p className="text-sm text-zinc-600">{section.highlight}</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm text-zinc-500">
        Full template: <a className="font-medium text-zinc-900 underline underline-offset-2" href="#/handouts">Handouts</a>
      </p>
    </div>
  )
}

function ConfidenceScaleSlide() {
  return (
    <div>
      <SlideHeading
        kicker="One yardstick for authors, reviewers and AI"
        title="Merge confidence score"
        lead="We’ll use this exact scale in the lab, in the AI demo and in the template."
      />
      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <ol className="space-y-2">
          {confidenceScale.map((level) => (
            <li key={level.score} className="flex items-center gap-4 rounded-xl border border-zinc-200 bg-white p-3">
              <span
                className={cn(
                  'flex size-10 shrink-0 items-center justify-center rounded-lg font-mono text-lg font-semibold',
                  level.score >= 4 && 'bg-emerald-100 text-emerald-800',
                  level.score === 3 && 'bg-amber-100 text-amber-800',
                  level.score <= 2 && 'bg-red-100 text-red-800',
                )}
              >
                {level.score}
              </span>
              <div>
                <p className="font-semibold">{level.label}</p>
                <p className="text-sm text-zinc-600">{level.meaning}</p>
              </div>
            </li>
          ))}
        </ol>
        <Panel className="bg-zinc-950 text-white">
          <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">Gating rules</h2>
          <ul className="mt-4 space-y-4">
            {confidenceGates.map((gate) => (
              <li key={gate} className="text-lg leading-snug">
                {gate}
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  )
}

export const anatomySlides: SlideDefinition[] = [
  {
    id: 'definition',
    segmentId: 'anatomy',
    title: 'Three themes',
    Component: DefinitionSlide,
    notes: {
      say: [
        'Read the definition. Then: three questions every reader asks — what and why, is it safe to merge, is it safe to release.',
        'Each theme owns specific template sections. That is the map for the next 12 minutes.',
      ],
      takeaway: 'Every claim has evidence attached — or says honestly why it doesn’t.',
    },
  },
  {
    id: 'intent',
    segmentId: 'anatomy',
    title: 'Intent clarity',
    Component: IntentSlide,
    notes: {
      say: [
        'Contrast the two descriptions. The second one lets a reviewer decide how hard to look before opening a file.',
        'The risk line is new for most teams. It’s the single cheapest improvement.',
      ],
      ask: ['Who reads the title? (Release notes, git log, on-call at 3 a.m., AI agents searching history.)'],
      ifLate: 'Skip the question.',
    },
  },
  {
    id: 'merge',
    segmentId: 'anatomy',
    title: 'Merge confidence',
    Component: MergeConfidenceSlide,
    notes: {
      say: [
        'Three pairs: a test that runs the code vs one that proves the rule; an endpoint without vs with an ownership check; a log line with vs without personal data.',
        'Spend time on “Not run, and why” and “Not tested, and why”. Honest gaps let reviewers focus; hidden gaps become incidents.',
      ],
      ask: ['Architects: what’s the most common merge-confidence gap you see in review today?'],
      takeaway: 'Being honest about gaps beats pretending there aren’t any.',
    },
  },
  {
    id: 'release',
    segmentId: 'anatomy',
    title: 'Release certainty',
    Component: ReleaseCertaintySlide,
    notes: {
      say: [
        'Data integrity, compatibility, operability — each with a bad/good pair.',
        'Expand-then-contract: old and new code must both work during a rolling deploy.',
        'Retries without idempotency turn a timeout into a double charge.',
      ],
      takeaway: 'Reverting code doesn’t revert a migration, a renamed field or a double charge.',
      ifLate: 'Cover data integrity and compatibility only.',
    },
  },
  {
    id: 'template',
    segmentId: 'anatomy',
    title: 'The template',
    Component: TemplateSlide,
    notes: {
      say: [
        'Colours match the themes: blue intent, violet merge confidence, amber release certainty.',
        'The checklist only contains judgment items — build, formatting, Sonar, secret scanning belong to CI, not to a tick box.',
        'Mention that the full template is on the Handouts page and will be our team standard draft at the end.',
      ],
    },
  },
  {
    id: 'confidence-scale',
    segmentId: 'anatomy',
    title: 'Merge confidence score',
    Component: ConfidenceScaleSlide,
    notes: {
      say: [
        'This scale is what the lab groups will use in two minutes, so make sure everyone understands the gates.',
        'Gate 1: one security, data or rollback blocker caps the score at 2 no matter how good the rest is.',
        'Gate 3: AI can propose a score; a human owns it.',
      ],
      takeaway: 'Same scale everywhere — lab, AI, template.',
    },
  },
]
