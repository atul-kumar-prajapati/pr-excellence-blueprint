import type { StakeholderId } from './types'

export interface Stakeholder {
  id: StakeholderId
  name: string
  fear: string
  answeredBy: string
}

export interface StakeholderCluster {
  name: string
  stakeholders: Stakeholder[]
}

export const stakeholderClusters: StakeholderCluster[] = [
  {
    name: 'Business',
    stakeholders: [
      {
        id: 'user',
        name: 'User',
        fear: 'I get charged wrong, lose my seat, or my data leaks.',
        answeredBy: 'Test evidence: acceptance criteria and failure cases',
      },
      {
        id: 'product-owner',
        name: 'Product owner',
        fear: 'It ships, but it isn’t what we agreed.',
        answeredBy: 'Why? and acceptance criteria verified',
      },
      {
        id: 'ceo',
        name: 'CEO',
        fear: 'A security or privacy incident with our name on it.',
        answeredBy: 'Checklist: secrets, authorization, personal data',
      },
    ],
  },
  {
    name: 'Engineering',
    stakeholders: [
      {
        id: 'senior-engineer',
        name: 'Senior engineer',
        fear: 'I’m asked to approve something I can’t actually verify.',
        answeredBy: 'Verification evidence and "start reviewing at"',
      },
      {
        id: 'architect',
        name: 'Architect',
        fear: 'Boundaries, contracts and transactions quietly eroded.',
        answeredBy: 'What changed? plus risks and trade-offs',
      },
      {
        id: 'future-developer',
        name: 'Future developer',
        fear: 'Two years on, nobody knows why this was done.',
        answeredBy: 'Why? and the linked ticket or ADR',
      },
      {
        id: 'frontend-engineer',
        name: 'Frontend engineer',
        fear: 'The API changed under me and I found out in production.',
        answeredBy: 'Linked PRs and merge order; API examples',
      },
    ],
  },
  {
    name: 'Quality and operations',
    stakeholders: [
      {
        id: 'tester',
        name: 'Tester',
        fear: 'Only the happy path was tested.',
        answeredBy: 'Regression, negative and edge cases; "Not tested, and why"',
      },
      {
        id: 'support-engineer',
        name: 'Support engineer',
        fear: 'It breaks and I can’t tell why from the logs.',
        answeredBy: 'Impact: observability and error handling',
      },
      {
        id: 'sre',
        name: 'SRE / on-call',
        fear: 'Paged at 3 a.m. with no rollback plan.',
        answeredBy: 'Rollout / rollback considerations',
      },
      {
        id: 'release-manager',
        name: 'Release manager',
        fear: 'Hidden dependencies and a deploy order nobody wrote down.',
        answeredBy: 'Linked PRs and merge order; configuration and flags',
      },
    ],
  },
  {
    name: 'Data',
    stakeholders: [
      {
        id: 'dba',
        name: 'DBA / data and analytics',
        fear: 'A migration locks a table, or a schema change breaks reports.',
        answeredBy: 'Risks: data integrity, migration and compatibility',
      },
    ],
  },
  {
    name: 'Consumers and agents',
    stakeholders: [
      {
        id: 'external-clients',
        name: 'Other teams / external clients',
        fear: 'Our integration breaks and we have no notice.',
        answeredBy: 'Affected components / consumers; compatibility',
      },
      {
        id: 'ai-agent',
        name: 'AI agent',
        fear: 'Docs and .md files are stale, so I confidently repeat old patterns.',
        answeredBy: 'Checklist: API contracts, docs, ADRs, AGENTS.md updated',
      },
    ],
  },
]

export const stakeholderNames: Record<StakeholderId, string> = Object.fromEntries(
  stakeholderClusters.flatMap((cluster) => cluster.stakeholders.map((s) => [s.id, s.name])),
) as Record<StakeholderId, string>
