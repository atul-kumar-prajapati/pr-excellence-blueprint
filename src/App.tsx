import { useEffect } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { Deck } from '@/components/Deck'
import { HandoutsPage } from '@/components/HandoutsPage'
import { LabPage } from '@/components/lab/LabPage'
import { slides } from '@/slides'
import { useHashRoute } from '@/lib/hashRoute'

export default function App() {
  const route = useHashRoute()

  useEffect(() => {
    const pageTitle =
      route.page === 'deck'
        ? slides[Math.min(route.slide, slides.length) - 1].title
        : route.page === 'lab'
          ? `Lab · PR ${route.pr.toUpperCase()}`
          : 'Handouts'
    document.title = `${pageTitle} · Raising Great PRs`
  }, [route])

  return (
    <>
      {route.page === 'deck' && <Deck route={route} />}
      {route.page === 'lab' && <LabPage route={route} />}
      {route.page === 'handouts' && <HandoutsPage route={route} />}
      <Toaster position="bottom-center" />
    </>
  )
}
