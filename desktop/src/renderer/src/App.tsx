import { useCallback, useEffect, useRef, useState } from 'react'
import { MarkerFilters } from './components/BlobWord'
import { Header } from './components/Header'
import {
  defaultSettings,
  emptyEditDraft,
  emptyTemplateDraft,
  makeVideo,
  sampleVideos,
  type EditDraft,
  type Job,
  type Settings as SettingsData,
  type TemplateDraft,
  type Video
} from './data'
import { Done } from './screens/Done'
import { EditUpload } from './screens/EditUpload'
import { Generating } from './screens/Generating'
import { Home } from './screens/Home'
import { Settings } from './screens/Settings'
import { Setup } from './screens/Setup'
import { TemplateOptions } from './screens/TemplateOptions'
import { TemplatePick } from './screens/TemplatePick'
import { TemplateUpload } from './screens/TemplateUpload'

// Every screen in the app. A plain state value picks which one shows (no router package).
type Screen =
  | 'setup'
  | 'home'
  | 'template-pick'
  | 'template-options'
  | 'template-upload'
  | 'edit-upload'
  | 'generating'
  | 'done'
  | 'settings'

function App() {
  // Setup shows on every launch for now. Later we save "setup done" in the settings file.
  const [screen, setScreen] = useState<Screen>('setup')
  // Where Settings' Back button returns to
  const [beforeSettings, setBeforeSettings] = useState<Screen>('home')

  const [settings, setSettings] = useState<SettingsData>(defaultSettings)
  const [templateDraft, setTemplateDraft] = useState<TemplateDraft>(emptyTemplateDraft)
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyEditDraft)
  const [job, setJob] = useState<Job>({ kind: 'template', size: 'reels' })
  // "Your videos" on Home, newest first. Fake list in memory for now.
  const [videos, setVideos] = useState<Video[]>(sampleVideos)
  // The video the Done screen shows, and whether it was just made
  const [openVideo, setOpenVideo] = useState<{ video: Video; isNew: boolean }>({
    video: sampleVideos[0],
    isNew: false
  })

  const updateSettings = (changes: Partial<SettingsData>) => setSettings((s) => ({ ...s, ...changes }))
  const updateTemplate = (changes: Partial<TemplateDraft>) => setTemplateDraft((d) => ({ ...d, ...changes }))
  const updateEdit = (changes: Partial<EditDraft>) => setEditDraft((d) => ({ ...d, ...changes }))

  function openSettings() {
    setBeforeSettings(screen)
    setScreen('settings')
  }

  function startOver() {
    setTemplateDraft(emptyTemplateDraft)
    setEditDraft(emptyEditDraft)
    setScreen('home')
  }

  // Stable function, so the Generating timer doesn't restart on every render
  // Each finished video gets its own file name and goes to the top of "Your videos".
  const finishGenerating = useCallback(() => {
    const video = makeVideo(job)
    setVideos((list) => [video, ...list])
    setOpenVideo({ video, isNew: true })
    setScreen('done')
  }, [job])

  // Move keyboard focus to the new screen, so keyboard and screen reader users know it changed
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.focus()
  }, [screen])

  // No header buttons during setup or while a video is being made
  const busy = screen === 'setup' || screen === 'generating'

  return (
    <div className="flex min-h-screen flex-col">
      <MarkerFilters />
      <Header
        onLogo={busy ? undefined : () => setScreen('home')}
        onSettings={busy || screen === 'settings' ? undefined : openSettings}
      />
      {/* The key makes each new screen play its small entrance */}
      <main
        key={screen}
        ref={mainRef}
        tabIndex={-1}
        // Short "moment" screens sit in the middle. Step and form screens start at the top,
        // so the title and Back link stay in the same spot from step to step.
        className={`screen-in flex flex-1 flex-col px-xl pb-2xl outline-none ${
          screen === 'setup' || screen === 'generating' || screen === 'done' ? 'justify-center pt-md' : 'pt-xl'
        }`}
      >
        {screen === 'setup' && (
          <Setup
            elevenLabsKey={settings.elevenLabsKey}
            onKeyChange={(elevenLabsKey) => updateSettings({ elevenLabsKey })}
            onContinue={() => setScreen('home')}
          />
        )}

        {screen === 'home' && (
          <Home
            videos={videos}
            onOpenVideo={(video) => {
              setOpenVideo({ video, isNew: false })
              setScreen('done')
            }}
            onTemplate={() => setScreen('template-pick')}
            onEdit={() => setScreen('edit-upload')}
          />
        )}

        {screen === 'template-pick' && (
          <TemplatePick
            onBack={() => setScreen('home')}
            onPick={(templateId) => {
              updateTemplate({ templateId })
              setScreen('template-options')
            }}
          />
        )}

        {screen === 'template-options' && (
          <TemplateOptions
            draft={templateDraft}
            onChange={updateTemplate}
            onBack={() => setScreen('template-pick')}
            onNext={() => setScreen('template-upload')}
          />
        )}

        {screen === 'template-upload' && (
          <TemplateUpload
            draft={templateDraft}
            onChange={updateTemplate}
            onBack={() => setScreen('template-options')}
            onGenerate={() => {
              setJob({ kind: 'template', size: templateDraft.size })
              setScreen('generating')
            }}
          />
        )}

        {screen === 'edit-upload' && (
          <EditUpload
            draft={editDraft}
            onChange={updateEdit}
            onBack={() => setScreen('home')}
            onMake={() => {
              setJob({ kind: 'edit', size: editDraft.size })
              setScreen('generating')
            }}
          />
        )}

        {screen === 'generating' && (
          <Generating
            job={job}
            onDone={finishGenerating}
            onCancel={() => setScreen(job.kind === 'template' ? 'template-upload' : 'edit-upload')}
          />
        )}

        {screen === 'done' && (
          <Done
            video={openVideo.video}
            isNew={openVideo.isNew}
            outputFolder={settings.outputFolder}
            onAnother={startOver}
            onHome={() => setScreen('home')}
          />
        )}

        {screen === 'settings' && (
          <Settings settings={settings} onChange={updateSettings} onBack={() => setScreen(beforeSettings)} />
        )}
      </main>
    </div>
  )
}

export default App
