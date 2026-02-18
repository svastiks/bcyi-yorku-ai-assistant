'use client'

import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import {
  PROMPT_OUTPUT_OPTIONS,
  WRITING_TONE_OPTIONS,
  SOCIAL_MEDIA_TYPE_OPTIONS,
  LENGTH_OPTIONS,
  STRUCTURE_OPTIONS,
  INCLUDE_OPTIONS,
  AVOID_OPTIONS,
  STRATEGIC_GOAL_OPTIONS,
  OUTPUT_VARIATION_OPTIONS,
  buildPromptFromSelections,
} from '@/lib/prompt-variables'

type SummaryItem = { id: string; name: string }

type Props = {
  open: boolean
  onClose: () => void
  selectedSummary: SummaryItem | null
  contentType: string
  onGeneratePrompt: (promptText: string) => void
}

export function PromptVariablesModal({
  open,
  onClose,
  selectedSummary,
  contentType,
  onGeneratePrompt,
}: Props) {
  const [promptOutput, setPromptOutput] = useState('')
  const [tone, setTone] = useState('')
  const [socialType, setSocialType] = useState('')
  const [length, setLength] = useState('')
  const [structure, setStructure] = useState('')
  const [include, setInclude] = useState<Set<string>>(new Set())
  const [avoid, setAvoid] = useState<Set<string>>(new Set())
  const [avoidTopic, setAvoidTopic] = useState('')
  const [goal, setGoal] = useState('')
  const [variations, setVariations] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (!open) return
    setPromptOutput('')
    setTone('')
    setSocialType('')
    setLength('')
    setStructure('')
    setInclude(new Set())
    setAvoid(new Set())
    setAvoidTopic('')
    setGoal('')
    setVariations(new Set())
  }, [open])

  const toggleInclude = (id: string, promptText: string) => {
    setInclude((prev) => {
      const next = new Set(prev)
      if (next.has(promptText)) next.delete(promptText)
      else next.add(promptText)
      return next
    })
  }
  const toggleAvoid = (id: string, promptText: string) => {
    setAvoid((prev) => {
      const next = new Set(prev)
      if (next.has(promptText)) next.delete(promptText)
      else next.add(promptText)
      return next
    })
  }
  const toggleVariation = (id: string, promptText: string) => {
    setVariations((prev) => {
      const next = new Set(prev)
      if (next.has(promptText)) next.delete(promptText)
      else next.add(promptText)
      return next
    })
  }

  const handleGenerate = () => {
    const promptText = buildPromptFromSelections({
      eventName: selectedSummary?.name,
      promptOutput: promptOutput || undefined,
      tone: tone || undefined,
      socialType: contentType === 'social-media' ? socialType || undefined : undefined,
      length: length || undefined,
      structure: structure || undefined,
      include: Array.from(include),
      avoid: Array.from(avoid),
      avoidTopic: avoidTopic.trim() || undefined,
      goal: goal || undefined,
      variations: Array.from(variations),
    })
    onGeneratePrompt(promptText)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent
        className="max-h-[90vh] overflow-y-auto sm:max-w-xl"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Prompt variable options</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {selectedSummary && (
            <div className="rounded-md bg-muted/50 px-3 py-2 text-sm">
              <span className="text-muted-foreground">Recent event: </span>
              <strong>{selectedSummary.name}</strong>
            </div>
          )}

          <Section label="Select Prompt Output">
            {PROMPT_OUTPUT_OPTIONS.map((o) => (
              <RadioRow
                key={o.id}
                label={o.label}
                checked={promptOutput === o.promptText}
                onSelect={() => setPromptOutput(o.promptText)}
              />
            ))}
          </Section>

          <Section label="Select Writing Tone">
            {WRITING_TONE_OPTIONS.map((o) => (
              <RadioRow
                key={o.id}
                label={o.label}
                checked={tone === o.promptText}
                onSelect={() => setTone(o.promptText)}
              />
            ))}
          </Section>

          {contentType === 'social-media' && (
            <Section label="Select Social Media Type">
              {SOCIAL_MEDIA_TYPE_OPTIONS.map((o) => (
                <RadioRow
                  key={o.id}
                  label={o.label}
                  checked={socialType === o.promptText}
                  onSelect={() => setSocialType(o.promptText)}
                />
              ))}
            </Section>
          )}

          <Section label="Select Length Constraints">
            {LENGTH_OPTIONS.map((o) => (
              <RadioRow
                key={o.id}
                label={o.label}
                checked={length === o.promptText}
                onSelect={() => setLength(o.promptText)}
              />
            ))}
          </Section>

          <Section label="Structure Rules">
            {STRUCTURE_OPTIONS.map((o) => (
              <RadioRow
                key={o.id}
                label={o.label}
                checked={structure === o.promptText}
                onSelect={() => setStructure(o.promptText)}
              />
            ))}
          </Section>

          <Section label="Include">
            {INCLUDE_OPTIONS.map((o) => (
              <CheckRow
                key={o.id}
                label={o.label}
                checked={include.has(o.promptText)}
                onToggle={() => toggleInclude(o.id, o.promptText)}
              />
            ))}
          </Section>

          <Section label="Avoid">
            {AVOID_OPTIONS.map((o) => (
              <CheckRow
                key={o.id}
                label={o.label}
                checked={avoid.has(o.promptText)}
                onToggle={() => toggleAvoid(o.id, o.promptText)}
              />
            ))}
            <div className="flex items-center gap-2 pt-1">
              <Label className="text-xs text-muted-foreground">Avoid specific topic:</Label>
              <Input
                placeholder="e.g. politics"
                value={avoidTopic}
                onChange={(e) => setAvoidTopic(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
          </Section>

          <Section label="Strategic Goal">
            {STRATEGIC_GOAL_OPTIONS.map((o) => (
              <RadioRow
                key={o.id}
                label={o.label}
                checked={goal === o.promptText}
                onSelect={() => setGoal(o.promptText)}
              />
            ))}
          </Section>

          <Section label="Output variations">
            {OUTPUT_VARIATION_OPTIONS.map((o) => (
              <CheckRow
                key={o.id}
                label={o.label}
                checked={variations.has(o.promptText)}
                onToggle={() => toggleVariation(o.id, o.promptText)}
              />
            ))}
          </Section>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleGenerate}>Generate prompt</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <Label className="text-xs font-semibold uppercase text-muted-foreground">{label}</Label>
      <div className="space-y-1.5 pl-0">{children}</div>
    </div>
  )
}

function RadioRow({
  label,
  checked,
  onSelect,
}: { label: string; checked: boolean; onSelect: () => void }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full text-left rounded-md border px-3 py-2 text-sm transition-colors',
        checked ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
      )}
    >
      {label}
    </button>
  )
}

function CheckRow({
  label,
  checked,
  onToggle,
}: { label: string; checked: boolean; onToggle: () => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer rounded-md px-2 py-1.5 hover:bg-muted/50">
      <input type="checkbox" checked={checked} onChange={onToggle} className="rounded" />
      <span className="text-sm">{label}</span>
    </label>
  )
}
