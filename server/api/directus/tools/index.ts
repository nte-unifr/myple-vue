import { readItems, readTranslations } from "@directus/sdk"
import type { Tool } from "@/types/tool"
import type { Translation } from "@/server/utils/directus"

export default defineEventHandler(async (event) => {
  const query = getQuery(event)
  const lang = query.lang as string || 'fr-FR'
  const family = query.family as string
  const translations = await useDirectus().request(readTranslations({ limit: -1 })) as Translation[]

  const filters = family ? { families: { tool_families_id: { slug: { _eq: family } } } } : {}

  const res = await useDirectus().request(
    readItems("tools", {
      limit: -1,
      fields: [
        "*", "translations.*", 
        "families.tool_families_id.*", "families.tool_families_id.translations.title", "families.tool_families_id.steps.steps_id"
      ],
      deep: { 
        translations: { _filter: { languages_code: { _eq: lang } } },
        families: {
          tool_families_id: {
            translations: { _filter: { languages_code: { _eq: lang } } }
          }
        }
      },
      filter: filters,
      sort: ["title"]
    })
  )

  const tools = res.map(e => transform(e, translations, lang))
  return tools as Tool[]
})

const transform = (response: any, translations: Translation[], lang: string): Tool => {
  const steps: number[] = response.families
    .flatMap((family: any) => family.tool_families_id.steps.map((step: any) => step.steps_id as number))
    .filter((value: number, index: number, self: number[]) => self.indexOf(value) === index) // Remove duplicates

  return {
    id: response.id,
    title: response.title || "Missing title",
    image: `https://eddb.unifr.ch/didanum-admin/assets/${response.image}/?width=160&height=160`,
    description: response.translations[0]?.description || "",
    families: response.families.map((family: any) => ({
      id: 1, 
      title: family.tool_families_id.translations[0]?.title, 
      slug: family.tool_families_id.slug 
    })),
    tags: response.tags.map((tag: string) => dTranslate(translations, tag, lang)),
    urlOfficial: response.url_official,
    urlAlternativeto: response.url_alternativeto,
    urlUnifr: response.url_unifr,
    urlUsi: response.url_usi,
    activityStepsCount: steps.length
  }
}