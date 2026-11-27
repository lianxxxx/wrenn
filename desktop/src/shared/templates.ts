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

// Templates not in the list (older ones) work like the feature walkthrough
export function rulesFor(templateId: string): TemplateRules {
  return TEMPLATE_RULES[templateId] ?? TEMPLATE_RULES['feature-walkthrough']
}
