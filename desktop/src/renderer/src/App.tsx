import { useCallback, useEffect, useRef, useState } from 'react'
import { MarkerFilters } from './components/BlobWord'
import { Header } from './components/Header'
import { UpdateBanner } from './components/UpdateBanner'
import {
  cleanError,
  draftFiles,
  draftMusic,
  emptyEditDraft,
  emptyTemplateDraft,
  fakeEditVideo,
  folderOf,
  type EditDraft,
  type JobEvent,
  type JobRequest,
  type Settings as SettingsData,
  type TemplateDraft,
  type VideoInfo
} from './data'
import { Done } from './screens/Done'
import { EditGenerating } from './screens/EditGenerating'
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
  | 'edit-generating'
  | 'done'
  | 'settings'

// Shown when no video exists yet, so we can't read the real folder from a video's path
const DEFAULT_FOLDER = 'Videos\\Wrenn'

function App() {
  // Null until the settings file is read, so the wrong first screen never flashes
  const [settings, setSettings] = useState<SettingsData | null>(null)
  const [screen, setScreen] = useState<Screen>('setup')
  // Where Settings' Back button returns to
  const [beforeSettings, setBeforeSettings] = useState<Screen>('home')

  const [templateDraft, setTemplateDraft] = useState<TemplateDraft>(emptyTemplateDraft)
  const [editDraft, setEditDraft] = useState<EditDraft>(emptyEditDraft)
  // "Your videos" on Home, newest first, from the Videos\Wrenn folder
  const [videos, setVideos] = useState<VideoInfo[]>([])
  // The video the Done screen shows, and whether it was just made
  // note: a short message about the sound, if it didn't go as picked
  const [openVideo, setOpenVideo] = useState<{ video: VideoInfo; isNew: boolean; note?: string } | null>(null)

  // The template job being made right now
  const [jobEvent, setJobEvent] = useState<JobEvent | null>(null)
  const [starting, setStarting] = useState(false)
  const [startError, setStartError] = useState('')
  // Refs, so the event listener always sees the current job without re-subscribing
  const jobIdRef = useRef<string | null>(null)
  const startingRef = useRef(false)
  // Events that arrive before startJob answers with the job id
  const earlyEvents = useRef(new Map<string, JobEvent>())

  // A newer Wrenn is downloaded and ready (installed app only). Null until then.
  const [updateVersion, setUpdateVersion] = useState<string | null>(null)
  const [updateDismissed, setUpdateDismissed] = useState(false)
  useEffect(() => window.api.onUpdateReady(setUpdateVersion), [])

  const updateTemplate = (changes: Partial<TemplateDraft>) => setTemplateDraft((d) => ({ ...d, ...changes }))
  const updateEdit = (changes: Partial<EditDraft>) => setEditDraft((d) => ({ ...d, ...changes }))

  // Read the settings file once, then pick the first screen
  useEffect(() => {
    let alive = true
    window.api
      .getSettings()
      .catch((): SettingsData => ({ setupDone: false, voiceoverKey: '' }))
      .then((loaded) => {
        if (!alive) return
        setSettings(loaded)
        setScreen(loaded.setupDone ? 'home' : 'setup')
      })
    return () => {
      alive = false
    }
  }, [])

  const refreshVideos = useCallback(async () => {
    try {
      setVideos(await window.api.listVideos())
    } catch {
      // Keep the old list if the folder can't be read
    }
  }, [])

  useEffect(() => {
    refreshVideos()
  }, [refreshVideos])

  // React to one event for the current job
  const applyJobEvent = useCallback(
    (event: JobEvent) => {
      if (event.stage === 'done' && event.video) {
        jobIdRef.current = null
        setOpenVideo({ video: event.video, isNew: true, note: event.message })
        setScreen('done')
        refreshVideos()
      } else if (event.stage === 'done') {
        // Shouldn't happen: finished, but no video came with it
        setJobEvent({ ...event, stage: 'failed', message: "Your video was made, but Wrenn couldn't find it. Look in your Videos\\Wrenn folder." })
      } else if (event.stage === 'cancelled') {
        jobIdRef.current = null
        setScreen('template-upload')
      } else {
        setJobEvent(event)
      }
    },
    [refreshVideos]
  )

  // Listen for job progress for as long as the app is open. Events for other jobs are ignored.
  useEffect(() => {
    return window.api.onJobEvent((event) => {
      if (event.jobId === jobIdRef.current) applyJobEvent(event)
      else if (startingRef.current) earlyEvents.current.set(event.jobId, event)
    })
  }, [applyJobEvent])

  // "Make my video" on the template path. Runs from the click, not an effect,
  // so React's double run in development can't start two jobs.
  async function startTemplateJob() {
    setStartError('')
    setStarting(true)
    startingRef.current = true
    earlyEvents.current.clear()
    try {
      const request: JobRequest = {
        templateId: templateDraft.templateId,
        size: templateDraft.size,
        length: templateDraft.length,
        vibe: templateDraft.vibe,
        brandName: templateDraft.brandName.trim(),
        endingText: templateDraft.cta.trim(),
        about: templateDraft.about.trim(),
        files: draftFiles(templateDraft),
        ...draftMusic(templateDraft)
      }
      const { jobId } = await window.api.startJob(request)
      jobIdRef.current = jobId
      setJobEvent({ jobId, stage: 'waiting-for-claude' })
      setScreen('generating')
      // Catch up on anything that came in while we waited for the id
      const early = earlyEvents.current.get(jobId)
      if (early) applyJobEvent(early)
    } catch (error) {
      setStartError(cleanError(error))
    } finally {
      setStarting(false)
      startingRef.current = false
      earlyEvents.current.clear()
    }
  }

  // Stop listening to this job and go back to the upload step. Answers and files stay.
  function leaveJob() {
    jobIdRef.current = null
    setScreen('template-upload')
  }

  function cancelJob() {
    const id = jobIdRef.current
    if (id) window.api.cancelJob(id).catch(() => {})
    leaveJob()
  }

  // FAKE: the edit path isn't built yet. Stable function, so the fake timer doesn't restart.
  const finishFakeEdit = useCallback(() => {
    setOpenVideo({ video: fakeEditVideo(editDraft.size), isNew: true })
    setScreen('done')
  }, [editDraft.size])

  async function saveSettings(changes: Partial<SettingsData>) {
    setSettings(await window.api.saveSettings(changes))
  }

  function openSettings() {
    setBeforeSettings(screen)
    setScreen('settings')
  }

  function startOver() {
    setTemplateDraft(emptyTemplateDraft)
    setEditDraft(emptyEditDraft)
    setStartError('')
    setScreen('home')
  }

  // Move keyboard focus to the new screen, so keyboard and screen reader users know it changed
  const mainRef = useRef<HTMLElement>(null)
  useEffect(() => {
    mainRef.current?.focus()
  }, [screen])

  // Tiny blank moment while the settings file loads
  if (!settings) return <div className="min-h-screen" aria-busy="true" />

  // No header buttons during setup or while a video is being made
  const busy = screen === 'setup' || screen === 'generating' || screen === 'edit-generating'
  const centered = busy || screen === 'done'
  const outputFolder = videos[0] ? folderOf(videos[0].filePath) : DEFAULT_FOLDER

  return (
    <div className="flex min-h-screen flex-col">
      <MarkerFilters />
      <Header
        onLogo={busy ? undefined : () => setScreen('home')}
        onSettings={busy || screen === 'settings' ? undefined : openSettings}
      />
      {/* Hidden while a video is being made, so a restart can't cut a job short.
          If they never click Restart, the update installs when Wrenn closes. */}
      {updateVersion && !updateDismissed && !busy && !starting && (
        <UpdateBanner onDismiss={() => setUpdateDismissed(true)} />
      )}
      {/* The key makes each new screen play its small entrance */}
      <main
        key={screen}
        ref={mainRef}
        tabIndex={-1}
        // Short "moment" screens sit in the middle. Step and form screens start at the top,
        // so the title and Back link stay in the same spot from step to step.
        className={`screen-in flex flex-1 flex-col px-xl pb-2xl outline-none ${centered ? 'justify-center pt-md' : 'pt-xl'}`}
      >
        {screen === 'setup' && (
          <Setup
            voiceoverKey={settings.voiceoverKey}
            onKeyChange={(voiceoverKey) => setSettings({ ...settings, voiceoverKey })}
            onContinue={async () => {
              await saveSettings({ setupDone: true, voiceoverKey: settings.voiceoverKey })
              setScreen('home')
            }}
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
            hasElevenLabsKey={settings.voiceoverKey.trim() !== ''}
            onOpenSettings={openSettings}
            onBack={() => setScreen('template-pick')}
            onNext={() => setScreen('template-upload')}
          />
        )}

        {screen === 'template-upload' && (
          <TemplateUpload
            draft={templateDraft}
            onChange={updateTemplate}
            onBack={() => setScreen('template-options')}
            onGenerate={startTemplateJob}
            starting={starting}
            error={startError}
          />
        )}

        {screen === 'edit-upload' && (
          <EditUpload
            draft={editDraft}
            onChange={updateEdit}
            onBack={() => setScreen('home')}
            onMake={() => setScreen('edit-generating')}
          />
        )}

        {screen === 'generating' && jobEvent && (
          <Generating
            event={jobEvent}
            onCancel={cancelJob}
            onTryAgain={leaveJob}
          />
        )}

        {screen === 'edit-generating' && (
          <EditGenerating onDone={finishFakeEdit} onCancel={() => setScreen('edit-upload')} />
        )}

        {screen === 'done' && openVideo && (
          <Done
            video={openVideo.video}
            isNew={openVideo.isNew}
            note={openVideo.note}
            onAnother={startOver}
            onHome={() => setScreen('home')}
          />
        )}

        {screen === 'settings' && (
          <Settings
            voiceoverKey={settings.voiceoverKey}
            onSaveKey={(voiceoverKey) => saveSettings({ voiceoverKey })}
            outputFolder={outputFolder}
            onBack={() => setScreen(beforeSettings)}
          />
        )}
      </main>
    </div>
  )
}

export default App
