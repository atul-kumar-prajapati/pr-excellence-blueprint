import type { ReactNode } from 'react'
import { GitPullRequest } from 'lucide-react'
import type { Route } from '@/lib/hashRoute'
import { cn } from '@/lib/utils'

const links: { href: string; label: string; isActive: (route: Route) => boolean }[] = [
  { href: '#/slide/1', label: 'Slides', isActive: (route) => route.page === 'deck' },
  { href: '#/lab/a', label: 'Lab · PR A', isActive: (route) => route.page === 'lab' && route.pr === 'a' },
  { href: '#/lab/b', label: 'Lab · PR B', isActive: (route) => route.page === 'lab' && route.pr === 'b' },
  { href: '#/handouts', label: 'Handouts', isActive: (route) => route.page === 'handouts' },
]

export function TopNav({ route, children }: { route: Route; children?: ReactNode }) {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="flex h-14 items-center gap-4 px-4 md:px-6">
        <a href="#/slide/1" className="flex items-center gap-2 font-semibold whitespace-nowrap">
          <GitPullRequest className="size-5" />
          <span className="hidden sm:inline">Raising Great PRs</span>
        </a>
        <nav className="flex gap-1 overflow-x-auto">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={cn(
                'rounded-md px-2.5 py-1.5 text-sm font-medium whitespace-nowrap transition-colors',
                link.isActive(route) ? 'bg-zinc-900 text-white' : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900',
              )}
            >
              {link.label}
            </a>
          ))}
        </nav>
        <div className="ml-auto">{children}</div>
      </div>
    </header>
  )
}
