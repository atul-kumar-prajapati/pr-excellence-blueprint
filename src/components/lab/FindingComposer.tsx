import type { ReactNode } from 'react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { themes } from '@/content/agenda'
import { stakeholderClusters } from '@/content/stakeholders'
import type { Severity, StakeholderId, Theme } from '@/content/types'
import { cn } from '@/lib/utils'
import { severityStyles, themeStyles } from '@/lib/themeStyles'
import type { Finding } from './labState'

const severities: Severity[] = ['blocker', 'major', 'nit']

export function FindingComposer({
  location,
  onSave,
  onCancel,
}: {
  location: string
  onSave: (finding: Omit<Finding, 'id' | 'file' | 'lineIndex' | 'lineLabel' | 'starred'>) => void
  onCancel: () => void
}) {
  const [text, setText] = useState('')
  const [theme, setTheme] = useState<Theme>('merge')
  const [severity, setSeverity] = useState<Severity>('major')
  const [stakeholder, setStakeholder] = useState<StakeholderId | ''>('')

  const save = () => {
    if (!text.trim()) return
    onSave({ text: text.trim(), theme, severity, stakeholder: stakeholder || undefined })
  }

  return (
    <div className="space-y-3 rounded-lg border border-zinc-300 bg-white p-3 font-sans shadow-sm">
      <p className="text-xs font-medium text-zinc-500">New finding · {location}</p>
      <Textarea
        autoFocus
        value={text}
        onChange={(event) => setText(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && (event.metaKey || event.ctrlKey)) save()
          if (event.key === 'Escape') onCancel()
        }}
        placeholder="What's wrong, and why does it matter?"
        className="min-h-20 text-sm"
      />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <ChoiceGroup label="Theme">
          {(Object.keys(themes) as Theme[]).map((option) => (
            <Choice key={option} selected={theme === option} onClick={() => setTheme(option)} className={themeStyles[option].pill}>
              {themes[option].name}
            </Choice>
          ))}
        </ChoiceGroup>
        <ChoiceGroup label="Severity">
          {severities.map((option) => (
            <Choice key={option} selected={severity === option} onClick={() => setSeverity(option)} className={severityStyles[option]}>
              {option}
            </Choice>
          ))}
        </ChoiceGroup>
        <label className="flex items-center gap-2 text-xs text-zinc-500">
          Hurts
          <select
            value={stakeholder}
            onChange={(event) => setStakeholder(event.target.value as StakeholderId | '')}
            className="h-7 rounded-md border border-zinc-300 bg-white px-2 text-xs text-zinc-900"
          >
            <option value="">Choose a stakeholder</option>
            {stakeholderClusters.map((cluster) => (
              <optgroup key={cluster.name} label={cluster.name}>
                {cluster.stakeholders.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.name}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
      </div>
      <div className="flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button size="sm" onClick={save} disabled={!text.trim()}>
          Add finding
        </Button>
      </div>
    </div>
  )
}

function ChoiceGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-1.5" role="group" aria-label={label}>
      <span className="text-xs text-zinc-500">{label}</span>
      {children}
    </div>
  )
}

function Choice({
  selected,
  onClick,
  className,
  children,
}: {
  selected: boolean
  onClick: () => void
  className: string
  children: ReactNode
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        'rounded-full px-2 py-0.5 text-xs font-medium capitalize ring-1 ring-inset transition-opacity',
        className,
        selected ? 'opacity-100 ring-2' : 'opacity-45 hover:opacity-80',
      )}
    >
      {children}
    </button>
  )
}
