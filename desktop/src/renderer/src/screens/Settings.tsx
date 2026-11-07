import { useState } from 'react'
import { Button } from '../components/Button'
import { ChoiceGroup } from '../components/ChoiceGroup'
import { ScreenTitle } from '../components/ScreenTitle'
import { TextField } from '../components/TextField'
import type { Settings as SettingsData } from '../data'

type Props = {
  settings: SettingsData
  onChange: (changes: Partial<SettingsData>) => void
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

export function Settings({ settings, onChange, onBack }: Props) {
  const [theme, setTheme] = useState<Theme>(
    document.documentElement.classList.contains('dark') ? 'dark' : 'light'
  )

  return (
    <div className="mx-auto w-full max-w-[672px]">
      <ScreenTitle title="Settings" onBack={onBack} />

      <div className="flex flex-col gap-xl">
        <TextField
          label="Voiceover key (optional)"
          hint="Adds voiceovers. It stays on this computer."
          type="password"
          autoComplete="off"
          spellCheck={false}
          placeholder="Paste your key here"
          value={settings.elevenLabsKey}
          onChange={(e) => onChange({ elevenLabsKey: e.target.value })}
        />

        <div>
          <div className="text-[0.9375rem] font-semibold text-navy">Save videos to</div>
          <div className="mt-sm flex items-center gap-md">
            <p className="min-w-0 flex-1 truncate rounded-sm border-2 border-line bg-card px-md py-[10px] text-navy">
              {settings.outputFolder}
            </p>
            {/* Does nothing yet. Later it opens a folder picker. */}
            <Button variant="ghost" onClick={() => {}}>
              Change
            </Button>
          </div>
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
