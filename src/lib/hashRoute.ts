import { useEffect, useState } from 'react'

export type Route =
  | { page: 'deck'; slide: number }
  | { page: 'lab'; pr: 'a' | 'b' }
  | { page: 'handouts' }

export function parseRoute(hash: string): Route {
  const parts = hash.replace(/^#\/?/, '').split('/')
  if (parts[0] === 'lab' && (parts[1] === 'a' || parts[1] === 'b')) {
    return { page: 'lab', pr: parts[1] }
  }
  if (parts[0] === 'handouts') {
    return { page: 'handouts' }
  }
  const slide = parts[0] === 'slide' ? Number.parseInt(parts[1] ?? '1', 10) : 1
  return { page: 'deck', slide: Number.isFinite(slide) && slide > 0 ? slide : 1 }
}

export function routeHref(route: Route): string {
  switch (route.page) {
    case 'lab':
      return `#/lab/${route.pr}`
    case 'handouts':
      return '#/handouts'
    case 'deck':
      return `#/slide/${route.slide}`
  }
}

export function useHashRoute(): Route {
  const [route, setRoute] = useState(() => parseRoute(window.location.hash))

  useEffect(() => {
    const onHashChange = () => setRoute(parseRoute(window.location.hash))
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return route
}
