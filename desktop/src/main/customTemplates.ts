// "My own prompt" templates: prompts the user saved to reuse, kept in one small JSON file.
// File: <userData>\custom-templates.json (on Windows: %APPDATA%\Wrenn\custom-templates.json).
// No database, no server. When a video is made, jobs.ts puts the prompt on top of a
// built-in template (CUSTOM_BASE), so the render rules stay the same.

import { app } from 'electron'
import { randomBytes } from 'crypto'
import { promises as fs } from 'fs'
import { join } from 'path'

import type { CustomTemplate } from '../preload'
import { MAX_CREDIT, MAX_CUSTOM_PROMPT, MAX_CUSTOM_TEMPLATES, MAX_TEMPLATE_NAME } from '../shared/limits'
import { isCustomTemplateId } from '../shared/templates'

// Saves run one after another, so two quick saves can't trip over each other
let saveQueue: Promise<unknown> = Promise.resolve()

function filePath(): string {
  return join(app.getPath('userData'), 'custom-templates.json')
}

// Keeps an entry from the file only if every field looks right
function readEntry(value: unknown): CustomTemplate | null {
  if (!value || typeof value !== 'object') return null
  const e = value as Record<string, unknown>
  if (typeof e.id !== 'string' || !isCustomTemplateId(e.id)) return null
  if (typeof e.name !== 'string' || !e.name.trim() || e.name.length > MAX_TEMPLATE_NAME) return null
  if (typeof e.prompt !== 'string' || !e.prompt.trim() || e.prompt.length > MAX_CUSTOM_PROMPT) return null
  if (typeof e.createdAt !== 'string' || isNaN(Date.parse(e.createdAt))) return null
  const credit = typeof e.credit === 'string' && e.credit.trim() ? e.credit.trim().slice(0, MAX_CREDIT) : undefined
  return { id: e.id, name: e.name, prompt: e.prompt, credit, createdAt: e.createdAt }
}

// Every saved template, oldest first (the order they were made). A missing or broken file is an empty list.
export async function listCustomTemplates(): Promise<CustomTemplate[]> {
  try {
    const parsed = JSON.parse(await fs.readFile(filePath(), 'utf8'))
    const list = Array.isArray(parsed?.templates) ? parsed.templates : []
    return list.map(readEntry).filter((t: CustomTemplate | null): t is CustomTemplate => t !== null)
  } catch {
    return []
  }
}

export async function getCustomTemplate(id: string): Promise<CustomTemplate | undefined> {
  return (await listCustomTemplates()).find((t) => t.id === id)
}

// Writes the file safely: first to a temp file, then swaps it in
async function writeList(templates: CustomTemplate[]): Promise<void> {
  const target = filePath()
  const temp = `${target}.tmp`
  await fs.mkdir(app.getPath('userData'), { recursive: true })
  await fs.writeFile(temp, JSON.stringify({ templates }, null, 2), 'utf8')
  await fs.rename(temp, target)
}

function queue<T>(run: () => Promise<T>): Promise<T> {
  const result = saveQueue.then(run, run)
  // Keep the queue going even if this save fails
  saveQueue = result.catch(() => undefined)
  return result
}

// The input comes from the page, so every field is checked first.
// Throws an Error with a plain message the screen can show.
export function saveCustomTemplate(input: unknown): Promise<CustomTemplate> {
  const r = (input ?? {}) as Record<string, unknown>
  const name = typeof r.name === 'string' ? r.name.trim() : ''
  const prompt = typeof r.prompt === 'string' ? r.prompt.trim() : ''
  const credit = typeof r.credit === 'string' ? r.credit.trim() : ''
  if (!name) return Promise.reject(new Error('Give your template a name.'))
  if (name.length > MAX_TEMPLATE_NAME) return Promise.reject(new Error(`Keep the name under ${MAX_TEMPLATE_NAME} letters.`))
  if (!prompt) return Promise.reject(new Error('Add your prompt.'))
  if (prompt.length > MAX_CUSTOM_PROMPT) {
    return Promise.reject(new Error(`Keep the prompt under ${MAX_CUSTOM_PROMPT} letters.`))
  }
  if (credit.length > MAX_CREDIT) return Promise.reject(new Error(`Keep "Where it's from" under ${MAX_CREDIT} letters.`))

  return queue(async () => {
    const list = await listCustomTemplates()
    if (list.length >= MAX_CUSTOM_TEMPLATES) {
      throw new Error(`You have ${MAX_CUSTOM_TEMPLATES} saved templates. Delete one to save a new one.`)
    }
    const template: CustomTemplate = {
      id: `custom-${randomBytes(6).toString('hex')}`,
      name,
      prompt,
      credit: credit || undefined,
      createdAt: new Date().toISOString()
    }
    await writeList([...list, template])
    return template
  })
}

// Deleting one that's already gone is fine: the list just stays the same
export function deleteCustomTemplate(id: unknown): Promise<void> {
  if (typeof id !== 'string' || !isCustomTemplateId(id)) return Promise.reject(new Error("Wrenn can't find that template."))
  return queue(async () => {
    const list = await listCustomTemplates()
    const left = list.filter((t) => t.id !== id)
    if (left.length !== list.length) await writeList(left)
  })
}
