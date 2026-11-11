import type { ComponentType } from 'react'

export interface PresenterNotes {
  say: string[]
  ask?: string[]
  listenFor?: string[]
  takeaway?: string
  ifLate?: string
}

export interface SlideDefinition {
  id: string
  segmentId: string
  title: string
  Component: ComponentType
  notes: PresenterNotes
}
