import type { ReactNode } from 'react'
import { Clock, GitPullRequest, MessageSquare, Users } from 'lucide-react'
import { sessionOutcome, themes } from '@/content/agenda'
import { Panel, SlideHeading, Takeaway, ThemePill } from './primitives'
import type { SlideDefinition } from './types'

function TitleSlide() {
  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      <p className="mb-4 text-sm font-semibold tracking-widest text-zinc-500 uppercase">90-minute session</p>
      <h1 className="font-heading text-5xl font-semibold tracking-tight text-zinc-950 md:text-7xl">Raising Great PRs</h1>
      <p className="mt-6 max-w-3xl text-xl text-pretty text-zinc-600 md:text-2xl">{sessionOutcome}</p>
      <div className="mt-10 flex flex-wrap gap-2">
        {(Object.keys(themes) as (keyof typeof themes)[]).map((theme) => (
          <ThemePill key={theme} theme={theme} className="px-3 py-1 text-sm" />
        ))}
      </div>
    </div>
  )
}

const timeline = [
  { day: 'Mon', event: 'PR #4127 opened: "Booking v2 + promo + misc fixes". 63 files.' },
  { day: 'Tue–Thu', event: 'Three reviewers open it, scroll, close the tab. 41 comments — 38 are formatting nits.' },
  { day: 'Next Wed', event: 'Release pressure. One approval: "LGTM". Merged at 6:40 p.m.' },
  { day: 'Fri 7:15 p.m.', event: 'Migration locks the bookings table for 14 minutes during the evening rush.' },
  { day: 'Fri 7:22 p.m.', event: 'Support finds out from customers on social media. On-call finds out from support.' },
]

function FiveThousandLineSlide() {
  return (
    <div>
      <SlideHeading kicker="The why" title="Meet PR #4127" />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <Panel className="space-y-4">
          <div className="flex items-center gap-2 text-zinc-500">
            <GitPullRequest className="size-5" />
            <span className="font-mono text-sm">feature/booking-v2 → main</span>
          </div>
          <p className="font-mono text-4xl font-semibold">
            <span className="text-emerald-600">+4,812</span> <span className="text-red-600">−1,206</span>
          </p>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <Stat icon={<Clock className="size-4" />} label="Open for" value="9 days" />
            <Stat icon={<Users className="size-4" />} label="Reviewers" value="3 (1 approval)" />
            <Stat icon={<MessageSquare className="size-4" />} label="Comments" value="41 (38 nits)" />
            <Stat icon={<GitPullRequest className="size-4" />} label="Files" value="63" />
          </dl>
        </Panel>
        <ol className="space-y-3">
          {timeline.map((item) => (
            <li key={item.day} className="flex gap-4">
              <span className="w-28 shrink-0 font-mono text-sm font-semibold text-zinc-500">{item.day}</span>
              <span className="text-base text-zinc-800 md:text-lg">{item.event}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {[
          'How long would it take you to review this properly?',
          'Which parts would you actually read?',
          'Would you put your name on that approval?',
        ].map((question) => (
          <Panel key={question} className="bg-zinc-950 text-lg font-medium text-white">
            {question}
          </Panel>
        ))}
      </div>
    </div>
  )
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string }) {
  return (
    <div>
      <dt className="flex items-center gap-1.5 text-zinc-500">
        {icon}
        {label}
      </dt>
      <dd className="font-semibold text-zinc-900">{value}</dd>
    </div>
  )
}

const costs = [
  {
    name: 'Review friction',
    detail: 'Big PRs wait. Reviewers postpone them, skim them, then approve under release pressure.',
    evidence: 'Defect detection drops sharply once a review goes past a few hundred lines in one sitting.',
  },
  {
    name: 'Hidden risk',
    detail: 'The dangerous five lines hide among five thousand. Nobody can see the migration for the formatting.',
    evidence: '38 of 41 comments on #4127 were about formatting. Zero were about the migration.',
  },
  {
    name: 'Cognitive load',
    detail: 'Nobody can hold 63 files in their head. Reviewers fall back to style comments because that’s all they can process.',
    evidence: 'An unclear PR moves the work from the author to every reviewer, tester and on-call engineer.',
  },
]

function ThreeCostsSlide() {
  return (
    <div>
      <SlideHeading kicker="The why" title="A big, unclear PR doesn’t save time. It moves the risk." />
      <div className="grid gap-4 md:grid-cols-3">
        {costs.map((cost, index) => (
          <Panel key={cost.name}>
            <p className="font-mono text-sm text-zinc-400">0{index + 1}</p>
            <h2 className="mt-1 text-2xl font-semibold">{cost.name}</h2>
            <p className="mt-3 text-zinc-700">{cost.detail}</p>
            <p className="mt-4 border-t border-zinc-100 pt-3 text-sm text-zinc-500">{cost.evidence}</p>
          </Panel>
        ))}
      </div>
      <Takeaway>The cost of a bad PR is paid by everyone except the person who raised it.</Takeaway>
    </div>
  )
}

export const whySlides: SlideDefinition[] = [
  {
    id: 'title',
    segmentId: 'why',
    title: 'Raising Great PRs',
    Component: TitleSlide,
    notes: {
      say: [
        'Welcome. Read the outcome out loud — it is the promise for the next 90 minutes.',
        'Point at the three coloured themes: we will use them all session — in the anatomy, the lab, the AI demo and the template.',
        'Remote: ask everyone to open the session link now; they will need it for the lab.',
      ],
      takeaway: 'Easy to review, safe to merge, ready to release.',
    },
  },
  {
    id: 'pr-4127',
    segmentId: 'why',
    title: 'Meet PR #4127',
    Component: FiveThousandLineSlide,
    notes: {
      say: [
        'Tell it as a story, not a list. Pause on "LGTM" and on "found out from customers".',
        'With architects: they have all approved a PR like this. Let that land rather than blaming the author.',
      ],
      ask: [
        'How long would it take you to review this properly? (Collect numbers in chat.)',
        'Which parts would you actually read?',
        'Would you put your name on that approval?',
      ],
      listenFor: ['"Half a day" or "I wouldn’t" — both prove the point.', 'Honest answers: "the files I know", "the tests, if any".'],
      ifLate: 'Ask only the last question.',
    },
  },
  {
    id: 'three-costs',
    segmentId: 'why',
    title: 'Three costs',
    Component: ThreeCostsSlide,
    notes: {
      say: [
        'Name the three costs: review friction, hidden risk, cognitive load.',
        'The research point (defects found drop after a few hundred lines) comes from the Cisco/SmartBear code review study — mention it, don’t dwell on it.',
      ],
      takeaway: 'A big, unclear PR moves the risk onto reviewers, testers and users.',
    },
  },
]
