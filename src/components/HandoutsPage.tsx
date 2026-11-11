import type { ReactNode } from 'react'
import { Copy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { sessionOutcome, themes } from '@/content/agenda'
import { aiPrompts, commentLabels, confidenceGates, confidenceScale, principles, prTemplate, reviewerChecklist } from '@/content/handouts'
import type { Route } from '@/lib/hashRoute'
import { copyText } from '@/lib/copyText'
import { TopNav } from './TopNav'

function checklistAsMarkdown() {
  return reviewerChecklist.map((group) => `### ${group.name}\n${group.items.map((item) => `- [ ] ${item}`).join('\n')}`).join('\n\n')
}

function scaleAsMarkdown() {
  return [
    ...confidenceScale.map((level) => `- **${level.score} — ${level.label}:** ${level.meaning}`),
    '',
    ...confidenceGates.map((gate) => `- ${gate}`),
  ].join('\n')
}

function principlesAsMarkdown() {
  return principles.map((principle) => `- **${principle.title}** (${principle.role}): ${principle.detail}`).join('\n')
}

function handoutPack() {
  return [
    '# Raising Great PRs — handout pack',
    '',
    sessionOutcome,
    '',
    '## Principles',
    principlesAsMarkdown(),
    '',
    '## Merge confidence scale',
    scaleAsMarkdown(),
    '',
    '## Reviewer checklist',
    checklistAsMarkdown(),
    '',
    '## PR template',
    '```markdown',
    prTemplate,
    '```',
    '',
    '## Codex prompts',
    ...aiPrompts.map((prompt) => `### ${prompt.title}\n\n\`\`\`text\n${prompt.prompt}\n\`\`\``),
  ].join('\n')
}

const sections = [
  { id: 'template', title: 'PR template' },
  { id: 'checklist', title: 'Reviewer checklist' },
  { id: 'scale', title: 'Merge confidence scale' },
  { id: 'principles', title: 'Principles' },
  { id: 'prompts', title: 'Codex prompts' },
]

export function HandoutsPage({ route }: { route: Route }) {
  return (
    <div className="min-h-svh bg-stone-50">
      <TopNav route={route} />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-8 md:px-6 lg:grid-cols-[200px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-20 lg:self-start">
          <nav className="flex gap-2 overflow-x-auto lg:flex-col lg:gap-1">
            {sections.map((section) => (
              <a key={section.id} href={`#/handouts`} onClick={(event) => {
                event.preventDefault()
                document.getElementById(section.id)?.scrollIntoView({ behavior: 'smooth' })
              }} className="rounded-md px-2.5 py-1.5 text-sm whitespace-nowrap text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900">
                {section.title}
              </a>
            ))}
          </nav>
          <Button className="mt-4 w-full" onClick={() => copyText(handoutPack(), 'Handout pack copied as Markdown')}>
            <Copy /> Copy whole pack
          </Button>
        </aside>

        <main className="space-y-10">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight">Handouts</h1>
            <p className="mt-2 text-zinc-600">Everything from the session, ready to copy into a repo, wiki or chat.</p>
          </div>

          <HandoutSection id="template" title="PR template" onCopy={() => copyText(prTemplate, 'PR template copied')}>
            <p className="mb-3 text-sm text-zinc-600">
              Save as <code className="rounded bg-zinc-100 px-1">.github/pull_request_template.md</code>. Sections map to{' '}
              {Object.values(themes).map((theme) => theme.name).join(', ')}.
            </p>
            <pre className="max-h-[70vh] overflow-auto rounded-xl border border-zinc-200 bg-white p-4 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-800">
              {prTemplate}
            </pre>
          </HandoutSection>

          <HandoutSection id="checklist" title="Reviewer checklist" onCopy={() => copyText(checklistAsMarkdown(), 'Checklist copied')}>
            <div className="grid gap-3 md:grid-cols-2">
              {reviewerChecklist.map((group) => (
                <div key={group.name} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <h3 className="font-semibold">{group.name}</h3>
                  <ul className="mt-2 space-y-1.5 text-sm text-zinc-700">
                    {group.items.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-zinc-400" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </HandoutSection>

          <HandoutSection id="scale" title="Merge confidence scale" onCopy={() => copyText(scaleAsMarkdown(), 'Scale copied')}>
            <div className="grid gap-4 md:grid-cols-2">
              <ol className="space-y-2">
                {confidenceScale.map((level) => (
                  <li key={level.score} className="flex gap-3 rounded-xl border border-zinc-200 bg-white p-3">
                    <span className="font-mono text-lg font-semibold">{level.score}</span>
                    <div>
                      <p className="font-semibold">{level.label}</p>
                      <p className="text-sm text-zinc-600">{level.meaning}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <div className="space-y-4">
                <div className="rounded-xl bg-zinc-950 p-4 text-white">
                  <h3 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase">Gating rules</h3>
                  <ul className="mt-2 space-y-2">
                    {confidenceGates.map((gate) => (
                      <li key={gate}>{gate}</li>
                    ))}
                  </ul>
                </div>
                <div className="rounded-xl border border-zinc-200 bg-white p-4">
                  <h3 className="font-semibold">Comment labels</h3>
                  <ul className="mt-2 space-y-1 text-sm">
                    {commentLabels.map(({ label, meaning }) => (
                      <li key={label}>
                        <span className="font-mono font-semibold">{label}:</span> <span className="text-zinc-600">{meaning}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </HandoutSection>

          <HandoutSection id="principles" title="Principles" onCopy={() => copyText(principlesAsMarkdown(), 'Principles copied')}>
            <ol className="grid gap-3 md:grid-cols-2">
              {principles.map((principle) => (
                <li key={principle.title} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">As {principle.role === 'author' ? 'an author' : 'a reviewer'}</p>
                  <p className="mt-1 font-semibold">{principle.title}</p>
                  <p className="mt-1 text-sm text-zinc-600">{principle.detail}</p>
                </li>
              ))}
            </ol>
          </HandoutSection>

          <section id="prompts" className="scroll-mt-20">
            <h2 className="mb-4 text-xl font-semibold">Codex prompts</h2>
            <div className="space-y-4">
              {aiPrompts.map((prompt) => (
                <div key={prompt.theme} className="rounded-xl border border-zinc-200 bg-white p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">{themes[prompt.theme].name}</p>
                      <p className="font-semibold">{prompt.title}</p>
                      <p className="text-sm text-zinc-500">{prompt.whenToUse}</p>
                    </div>
                    <Button variant="outline" size="sm" onClick={() => copyText(prompt.prompt, 'Prompt copied')}>
                      <Copy /> Copy
                    </Button>
                  </div>
                  <pre className="mt-3 overflow-auto rounded-lg bg-zinc-50 p-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap text-zinc-800">
                    {prompt.prompt}
                  </pre>
                </div>
              ))}
            </div>
          </section>
        </main>
      </div>
    </div>
  )
}

function HandoutSection({ id, title, onCopy, children }: { id: string; title: string; onCopy: () => void; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-20">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Button variant="outline" size="sm" onClick={onCopy}>
          <Copy /> Copy
        </Button>
      </div>
      {children}
    </section>
  )
}
