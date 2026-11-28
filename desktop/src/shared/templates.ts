// What each template needs from the user, and which lengths it offers.
// Both sides use this: the screens (what to ask for) and the main process (to check the request).
// Plain values only, so the renderer and main can both import this file.

export type TemplateLength = '15' | '30' | '60'

// screens: at least one screenshot or recording
// logo: a logo file (screenshots are optional)
// words: the user's own lines in the "about" box (no files needed)
export type TemplateNeeds = 'screens' | 'logo' | 'words'

export type TemplateRules = {
  needs: TemplateNeeds
  lengths: TemplateLength[]
}

export const TEMPLATE_RULES: Record<string, TemplateRules> = {
  'feature-walkthrough': { needs: 'screens', lengths: ['15', '30', '60'] },
  'logo-reveal': { needs: 'logo', lengths: ['15'] },
  'kinetic-typography': { needs: 'words', lengths: ['15', '30'] },
  'product-launch': { needs: 'screens', lengths: ['15', '30'] },
  'product-explainer': { needs: 'screens', lengths: ['30', '60'] },
  showreel: { needs: 'screens', lengths: ['15', '30'] }
}

// Templates not in the list (older ones, and the user's own prompt templates) work like the
// feature walkthrough: screenshots needed, every length
export function rulesFor(templateId: string): TemplateRules {
  return TEMPLATE_RULES[templateId] ?? TEMPLATE_RULES['feature-walkthrough']
}

// "My own prompt" templates: the user's saved prompt runs on top of this built-in template,
// which brings the engine rules (seek(time), sizes, fonts, safe area, sound.json, done.json).
export const CUSTOM_BASE = 'feature-walkthrough'

// Saved templates have ids like "custom-1a2b3c4d5e6f"
export function isCustomTemplateId(templateId: string): boolean {
  return /^custom-[0-9a-f]{12}$/.test(templateId)
}
