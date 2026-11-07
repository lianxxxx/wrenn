import { useState } from 'react'
import { Button } from '../components/Button'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { ScreenTitle } from '../components/ScreenTitle'
import { TextField } from '../components/TextField'

type Props = {
  voiceoverKey: string
  // Saves the key to the settings file. Resolves when it's saved.
  onSaveKey: (key: string) => Promise<void>
  // Where videos go, e.g. C:\Users\Lian\Videos\Wrenn
  outputFolder: string
  onBack: () => void
}

type Theme = 'light' | 'dark'

// Light is the default. The choice is saved so it sticks next time (see theme.ts).
function applyTheme(theme: Theme) {
  document.documentElement.classList.toggle('dark', theme === 'dark')
  try {
    localStorage.setItem('theme', theme)
  } catch {
    // Storage can be blocked; the switch still works until Wrenn closes
  }
}

export function Settings({ voiceoverKey, onSaveKey, outputFolder, onBack }: Props) {
  const [theme, setTheme] = useState<Theme>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )
  // The key being typed. It saves when you click away from the box.
  const [key, setKey] = useState(voiceoverKey)
  const [saveState, setSaveState] = useState<'idle' | 'saved' | 'error'>('idle')

  async function saveKey() {
    if (key === voiceoverKey) return
    try {
      await onSaveKey(key)
      setSaveState('saved')
    } catch {
      setSaveState('error')
    }
  }

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <ScreenTitle title="Settings" onBack={onBack} />

      <div className="flex flex-col gap-xl">
        <div>
          <TextField
            label="Voiceover key (optional)"
            hint="Adds voiceovers. It stays on this computer and saves when you click away."
            type="password"
            autoComplete="off"
            spellCheck={false}
            placeholder="Paste your key here"
            value={key}
            onChange={(e) => {
              setKey(e.target.value)
              setSaveState('idle')
            }}
            onBlur={saveKey}
          />
          <p className="mt-xs min-h-[1.25rem] text-[0.8125rem] font-semibold text-navy-body" aria-live="polite">
            {saveState === 'saved' ? 'Saved' : saveState === 'error' ? "Couldn't save. Try again." : ''}
          </p>
        </div>

        <div>
          <div className="text-[0.9375rem] font-semibold text-navy">Save videos to</div>
          <div className="mt-sm flex items-center gap-md">
            <p className="min-w-0 flex-1 truncate rounded-sm border-2 border-line bg-card px-md py-[10px] text-navy">
              {outputFolder}
            </p>
            {/* A folder picker comes later */}
            <Button variant="ghost" disabled aria-describedby="change-folder-hint">
              Change
            </Button>
          </div>
          <p id="change-folder-hint" className="mt-xs text-[0.8125rem] font-medium text-navy-body">
            Picking another folder is coming soon.
          </p>
        </div>

        <ChoiceGroup
          legend="Look"
          name="theme"
          columns="grid-cols-2"
          value={theme}
          onChange={(next) => {
            setTheme(next)
            applyTheme(next)
          }}
          options={[
            { id: 'light', name: 'Light' },
            { id: 'dark', name: 'Dark' }
          ]}
        />
      </div>
    </div>
  )
}
