export type Theme = 'intent' | 'merge' | 'release'

export type Severity = 'blocker' | 'major' | 'nit'

export type StakeholderId =
  | 'user'
  | 'product-owner'
  | 'ceo'
  | 'senior-engineer'
  | 'architect'
  | 'future-developer'
  | 'frontend-engineer'
  | 'tester'
  | 'support-engineer'
  | 'sre'
  | 'release-manager'
  | 'dba'
  | 'external-clients'
  | 'ai-agent'

export interface DiffFile {
  path: string
  status: 'added' | 'modified'
  /** Unified-diff body: hunk headers start with "@@", other lines start with "+", "-" or " ". */
  diff: string
}

export interface PlantedIssue {
  id: string
  title: string
  /** Omitted for PR-level issues such as the description. */
  file?: string
  /** Text that appears on exactly one added or context line of the file; anchors the issue to that line. */
  anchor?: string
  severity: Severity
  theme: Theme
  stakeholders: StakeholderId[]
  whyItMatters: string
  betterApproach: string
}

export interface LabHint {
  afterMinutes: number
  text: string
}

export interface LabPullRequest {
  id: 'a' | 'b'
  number: number
  title: string
  author: string
  branch: string
  label: string
  summary: string
  description: string
  files: DiffFile[]
  issues: PlantedIssue[]
  expertTopThree: string[]
  expertScore: number
  expertVerdict: string
  hints: LabHint[]
}
