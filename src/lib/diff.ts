import type { DiffFile, PlantedIssue } from '@/content/types'

export interface DiffLine {
  index: number
  kind: 'hunk' | 'add' | 'del' | 'context'
  text: string
  oldNumber?: number
  newNumber?: number
}

const hunkHeader = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@/

export function parseDiff(diff: string): DiffLine[] {
  let oldNumber = 0
  let newNumber = 0

  return diff.split('\n').map((raw, index) => {
    const header = raw.match(hunkHeader)
    if (header) {
      oldNumber = Number(header[1])
      newNumber = Number(header[2])
      if (oldNumber === 0) oldNumber = 1
      if (newNumber === 0) newNumber = 1
      return { index, kind: 'hunk', text: raw }
    }
    const marker = raw[0]
    const text = raw.slice(1)
    if (marker === '+') {
      return { index, kind: 'add', text, newNumber: newNumber++ }
    }
    if (marker === '-') {
      return { index, kind: 'del', text, oldNumber: oldNumber++ }
    }
    return { index, kind: 'context', text, oldNumber: oldNumber++, newNumber: newNumber++ }
  })
}

export function countChanges(files: DiffFile[]) {
  let additions = 0
  let deletions = 0
  for (const file of files) {
    for (const line of parseDiff(file.diff)) {
      if (line.kind === 'add') additions++
      if (line.kind === 'del') deletions++
    }
  }
  return { additions, deletions }
}

export function anchorLineIndex(file: DiffFile, issue: PlantedIssue): number | undefined {
  if (!issue.anchor) return undefined
  const lines = parseDiff(file.diff)
  const match =
    lines.find((line) => line.kind !== 'del' && line.kind !== 'hunk' && line.text.includes(issue.anchor!)) ??
    lines.find((line) => line.text.includes(issue.anchor!))
  return match?.index
}
