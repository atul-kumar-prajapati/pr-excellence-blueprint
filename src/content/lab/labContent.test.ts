import { describe, expect, it } from 'vitest'
import { isIssueFound, type Finding } from '@/components/lab/labState'
import { countChanges, parseDiff } from '@/lib/diff'
import { prA } from './prA'
import { prB } from './prB'

describe.each([prA, prB])('lab PR $label', (pr) => {
  it('givenEachFileAnchoredIssue_whenAnchorIsSearched_thenItMatchesExactlyOneVisibleLine', () => {
    // Arrange
    const anchoredIssues = pr.issues.filter((issue) => issue.file)

    for (const issue of anchoredIssues) {
      const file = pr.files.find((candidate) => candidate.path === issue.file)

      // Act
      const matches = file
        ? parseDiff(file.diff).filter((line) => line.kind !== 'hunk' && line.kind !== 'del' && line.text.includes(issue.anchor!))
        : []

      // Assert
      expect(matches, `${issue.id} anchor "${issue.anchor}"`).toHaveLength(1)
    }
  })

  it('givenExpertTopThree_whenLookedUp_thenEveryIdIsAPlantedIssue', () => {
    // Arrange
    const issueIds = new Set(pr.issues.map((issue) => issue.id))

    // Act
    const unknownIds = pr.expertTopThree.filter((id) => !issueIds.has(id))

    // Assert
    expect(pr.expertTopThree).toHaveLength(3)
    expect(unknownIds).toEqual([])
  })

  it('givenTheDiff_whenChangesAreCounted_thenThePrIsBetween150And250ChangedLines', () => {
    // Act
    const { additions, deletions } = countChanges(pr.files)

    // Assert
    expect(additions + deletions).toBeGreaterThanOrEqual(150)
    expect(additions + deletions).toBeLessThanOrEqual(250)
  })
})

describe('isIssueFound', () => {
  const issue = prB.issues.find((candidate) => candidate.id === 'b-idor')!
  const file = prB.files.find((candidate) => candidate.path === issue.file)!
  const anchorIndex = parseDiff(file.diff).findIndex((line) => line.text.includes(issue.anchor!))
  const findingAt = (lineIndex: number): Finding => ({
    id: 'f1',
    file: file.path,
    lineIndex,
    text: 'missing ownership check',
    theme: 'merge',
    severity: 'blocker',
    starred: false,
  })

  it('givenFindingWithinThreeLinesOfAnchor_whenChecked_thenIssueCountsAsFound', () => {
    // Act
    const found = isIssueFound(prB, issue, [findingAt(anchorIndex - 2)])

    // Assert
    expect(found).toBe(true)
  })

  it('givenFindingFarFromAnchor_whenChecked_thenIssueCountsAsMissed', () => {
    // Act
    const found = isIssueFound(prB, issue, [findingAt(anchorIndex - 10)])

    // Assert
    expect(found).toBe(false)
  })
})
