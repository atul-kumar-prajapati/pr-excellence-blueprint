import { useCallback, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Maximize, NotebookPen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { segments } from '@/content/agenda'
import { slides } from '@/slides'
import type { PresenterNotes } from '@/slides/types'
import type { Route } from '@/lib/hashRoute'
import { usePersistentState } from '@/lib/usePersistentState'
import { cn } from '@/lib/utils'
import { SessionClock } from './SessionClock'
import { TopNav } from './TopNav'

function goToSlide(slideNumber: number) {
  const clamped = Math.min(Math.max(slideNumber, 1), slides.length)
  window.location.hash = `#/slide/${clamped}`
}

function isTypingTarget(target: EventTarget | null) {
  return target instanceof HTMLElement && (target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName))
}

export function Deck({ route }: { route: Extract<Route, { page: 'deck' }> }) {
  const slideNumber = Math.min(route.slide, slides.length)
  const slide = slides[slideNumber - 1]
  const segment = segments.find((candidate) => candidate.id === slide.segmentId) ?? segments[0]
  const [showNotes, setShowNotes] = usePersistentState('deck:notes', false)

  const next = useCallback(() => goToSlide(slideNumber + 1), [slideNumber])
  const previous = useCallback(() => goToSlide(slideNumber - 1), [slideNumber])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isTypingTarget(event.target) || event.metaKey || event.ctrlKey || event.altKey) return
      if (['ArrowRight', 'PageDown', ' '].includes(event.key)) {
        event.preventDefault()
        next()
      } else if (['ArrowLeft', 'PageUp'].includes(event.key)) {
        event.preventDefault()
        previous()
      } else if (event.key === 'Home') {
        goToSlide(1)
      } else if (event.key === 'End') {
        goToSlide(slides.length)
      } else if (event.key.toLowerCase() === 'n') {
        setShowNotes((value) => !value)
      } else if (event.key.toLowerCase() === 'f') {
        if (document.fullscreenElement) void document.exitFullscreen()
        else void document.documentElement.requestFullscreen()
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [next, previous, setShowNotes])

  const SlideComponent = slide.Component

  return (
    <div className="flex min-h-svh flex-col bg-stone-50">
      <TopNav route={route}>
        <SessionClock segment={segment} />
      </TopNav>
      <AgendaBar currentSegmentId={segment.id} />
      <div className="flex flex-1 flex-col lg:flex-row">
        <main className="flex flex-1 flex-col">
          <div key={slide.id} className="mx-auto w-full max-w-7xl flex-1 animate-in px-5 py-8 duration-300 fade-in md:px-10 md:py-12">
            <SlideComponent />
          </div>
          <footer className="sticky bottom-0 flex items-center justify-between gap-2 border-t border-zinc-200 bg-white/90 px-4 py-2 backdrop-blur md:px-6">
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" onClick={previous} disabled={slideNumber === 1} aria-label="Previous slide">
                <ChevronLeft />
              </Button>
              <Button variant="outline" size="icon" onClick={next} disabled={slideNumber === slides.length} aria-label="Next slide">
                <ChevronRight />
              </Button>
              <span className="ml-2 font-mono text-sm text-zinc-500 tabular-nums">
                {slideNumber} / {slides.length}
              </span>
            </div>
            <p className="hidden text-xs text-zinc-400 md:block">← → to move · N notes · F fullscreen</p>
            <div className="flex items-center gap-1">
              <Button variant={showNotes ? 'default' : 'outline'} size="sm" onClick={() => setShowNotes((value) => !value)}>
                <NotebookPen /> Notes
              </Button>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Toggle fullscreen"
                onClick={() => (document.fullscreenElement ? void document.exitFullscreen() : void document.documentElement.requestFullscreen())}
              >
                <Maximize />
              </Button>
            </div>
          </footer>
        </main>
        {showNotes && <NotesPanel notes={slide.notes} segmentTitle={segment.title} />}
      </div>
    </div>
  )
}

function AgendaBar({ currentSegmentId }: { currentSegmentId: string }) {
  return (
    <nav aria-label="Agenda" className="flex overflow-x-auto border-b border-zinc-200 bg-white">
      {segments.map((segment) => {
        const firstSlide = slides.findIndex((slide) => slide.segmentId === segment.id) + 1
        const isCurrent = segment.id === currentSegmentId
        return (
          <a
            key={segment.id}
            href={`#/slide/${firstSlide}`}
            style={{ flexGrow: segment.endMinute - segment.startMinute }}
            className={cn(
              'min-w-28 basis-0 border-r border-zinc-100 px-3 py-1.5 transition-colors last:border-r-0',
              isCurrent ? 'bg-zinc-900 text-white' : 'text-zinc-500 hover:bg-zinc-50',
            )}
          >
            <span className="block font-mono text-[11px] tabular-nums opacity-70">
              {segment.startMinute}–{segment.endMinute}
            </span>
            <span className="block truncate text-xs font-medium">{segment.title}</span>
          </a>
        )
      })}
    </nav>
  )
}

function NotesPanel({ notes, segmentTitle }: { notes: PresenterNotes; segmentTitle: string }) {
  return (
    <aside className="border-t border-zinc-200 bg-white px-5 py-6 lg:sticky lg:top-14 lg:h-[calc(100svh-3.5rem)] lg:w-96 lg:overflow-y-auto lg:border-t-0 lg:border-l">
      <p className="text-xs font-semibold tracking-widest text-zinc-400 uppercase">Presenter notes · {segmentTitle}</p>
      <NotesList title="Say" items={notes.say} />
      {notes.ask && <NotesList title="Ask" items={notes.ask} />}
      {notes.listenFor && <NotesList title="Listen for" items={notes.listenFor} />}
      {notes.takeaway && (
        <div className="mt-5 rounded-lg bg-zinc-900 p-3 text-sm text-white">
          <span className="font-semibold">Takeaway:</span> {notes.takeaway}
        </div>
      )}
      {notes.ifLate && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <span className="font-semibold">If running late:</span> {notes.ifLate}
        </div>
      )}
    </aside>
  )
}

function NotesList({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="mt-5">
      <h3 className="text-sm font-semibold text-zinc-900">{title}</h3>
      <ul className="mt-2 space-y-2 text-sm text-zinc-700">
        {items.map((item) => (
          <li key={item} className="border-l-2 border-zinc-200 pl-3">
            {item}
          </li>
        ))}
      </ul>
    </section>
  )
}
