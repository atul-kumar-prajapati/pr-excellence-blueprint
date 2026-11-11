import { toast } from 'sonner'
import type { LabPullRequest } from '@/content/types'

export async function copyText(text: string, successMessage = 'Copied to clipboard') {
  try {
    await navigator.clipboard.writeText(text)
    toast.success(successMessage)
  } catch {
    toast.error('Copy failed — select the text and copy it manually.')
  }
}

export function pullRequestAsPatch(pr: LabPullRequest): string {
  const header = `PR #${pr.number}: ${pr.title}\nBranch: ${pr.branch} → main\n\n${pr.description}\n`
  const files = pr.files
    .map((file) => `diff --git a/${file.path} b/${file.path}\n--- ${file.status === 'added' ? '/dev/null' : `a/${file.path}`}\n+++ b/${file.path}\n${file.diff}`)
    .join('\n')
  return `${header}\n${files}\n`
}
