export interface Segment {
  id: string
  title: string
  startMinute: number
  endMinute: number
}

export const sessionTitle = 'Raising Great PRs'

export const sessionOutcome =
  "By the end of the session, every engineer can raise an AI-assisted PR that's easy to review, safe to merge, and ready to release with confidence."

export const segments: Segment[] = [
  { id: 'why', title: 'The cost of a bad PR', startMinute: 0, endMinute: 5 },
  { id: 'great', title: 'What a great PR looks like', startMinute: 5, endMinute: 12 },
  { id: 'stakeholders', title: 'Who cares about your PR?', startMinute: 12, endMinute: 20 },
  { id: 'anatomy', title: 'Anatomy of a great PR', startMinute: 20, endMinute: 35 },
  { id: 'lab', title: 'Live PR review lab', startMinute: 35, endMinute: 57 },
  { id: 'principles', title: 'From findings to principles', startMinute: 57, endMinute: 65 },
  { id: 'ai', title: 'Using AI to raise great PRs', startMinute: 65, endMinute: 80 },
  { id: 'commitments', title: 'Commitments and next steps', startMinute: 80, endMinute: 90 },
]

export const themes = {
  intent: {
    name: 'Intent clarity',
    question: 'What changed, and why?',
    sections: ['Title', 'Ticket', 'What changed?', 'Why?'],
  },
  merge: {
    name: 'Merge confidence',
    question: 'Is it correct, tested and safe?',
    sections: ['Verification evidence', 'Test evidence', 'Checklist'],
  },
  release: {
    name: 'Release certainty',
    question: 'Will it go out safely?',
    sections: ['Impact, risks and reviewer notes', 'Linked PRs and merge order'],
  },
} as const
