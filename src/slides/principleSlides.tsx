import { commentLabels, principles } from '@/content/handouts'
import { cn } from '@/lib/utils'
import { SlideHeading } from './primitives'
import type { SlideDefinition } from './types'

function PrinciplesSlide() {
  return (
    <div>
      <SlideHeading kicker="From findings to principles" title="Five things we don’t compromise on" />
      <div className="grid gap-6 lg:grid-cols-2">
        {(['author', 'reviewer'] as const).map((role) => (
          <section key={role}>
            <h2 className="mb-3 text-sm font-semibold tracking-widest text-zinc-500 uppercase">As {role === 'author' ? 'an author' : 'a reviewer'}</h2>
            <ol className="space-y-3">
              {principles
                .filter((principle) => principle.role === role)
                .map((principle) => (
                  <li
                    key={principle.title}
                    className={cn(
                      'rounded-2xl border p-4',
                      role === 'author' ? 'border-zinc-200 bg-white' : 'border-zinc-900 bg-zinc-950 text-white',
                    )}
                  >
                    <p className="text-xl font-semibold">{principle.title}</p>
                    <p className={cn('mt-1', role === 'author' ? 'text-zinc-700' : 'text-zinc-200')}>{principle.detail}</p>
                    <p className={cn('mt-2 text-xs', role === 'author' ? 'text-zinc-500' : 'text-zinc-400')}>
                      From the lab: {principle.fromLab}
                    </p>
                  </li>
                ))}
            </ol>
            {role === 'reviewer' && (
              <ul className="mt-4 grid grid-cols-2 gap-2">
                {commentLabels.map(({ label, meaning }) => (
                  <li key={label} className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm">
                    <span className="font-mono font-semibold">{label}:</span> <span className="text-zinc-600">{meaning}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  )
}

export const principleSlides: SlideDefinition[] = [
  {
    id: 'principles',
    segmentId: 'principles',
    title: 'Principles',
    Component: PrinciplesSlide,
    notes: {
      say: [
        'Build these from the lab, not from the slide: ask the room first, then reveal and map their words onto the five.',
        'Each principle carries a “from the lab” line — point back to the specific issue.',
        'Reviewer principle 4: “Read the deleted lines too” is the PR B lesson.',
      ],
      ask: ['Looking at what you found: what is the one rule that would have prevented most of it?'],
      listenFor: ['“Smaller PRs”, “evidence”, “honest description”, “don’t trust the template”.'],
      takeaway: 'Principles explain why the issues matter; checklists only list them.',
      ifLate: 'Reveal the slide directly and ask for one objection.',
    },
  },
]
