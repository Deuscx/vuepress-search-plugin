import type { App } from 'vuepress'
import { path } from '@vuepress/utils'

export default function SearchPlugin() {
  return {
    name: 'vuepress-plugin-search',
    alias: {
      '@SearchBox': path.resolve(__dirname, 'SearchBox.vue'),
    },
    clientConfigFile: path.resolve(__dirname, '../client/index.js'),
    async onPrepared(app: App) {
      const documentsByLocale: Record<string, PageSection[]> = {}
      app.pages.forEach((page) => {
        const documents = documentsByLocale[page.pathLocale] ?? []
        const sections = splitPageIntoSections(page.contentRendered)
        const withKeySections = sections.map(section => ({ id: page.key + section.anchor, path: `${page.path}#${section.anchor}`, ...section }))
        documents.push(...withKeySections)
        documentsByLocale[page.pathLocale] = documents
      })
      // console.log(documentsByLocale)
      // await app.writeTemp('foo.js', 'export const index = \'bar\'')
      await app.writeTemp('foo.js', `export const index = ${JSON.stringify(documentsByLocale)}`)
    },
  }
}

const headingRegex = /<h(\d*).*?>(<a.*? href="#.*?".*?>.*?<\/a>.*?)<\/h\1>/gi
const headingContentRegex = /<a.*? href="#(.*?)".*?>.*?<\/a>(.*)/i

interface PageSection {
  anchor: string
  titles: string[]
  text: string
}

/**
 * Splits HTML into sections based on headings
 * @param html
 */
function splitPageIntoSections(html: string) {
  const originResult = html.split(headingRegex)
  const result = originResult
  result.shift()
  let parentTitles: string[] = []
  const sections: PageSection[] = []
  for (let i = 0; i < result.length; i += 3) {
    const level = Number.parseInt(result[i]) - 1
    const heading = result[i + 1]
    const headingResult = headingContentRegex.exec(heading)
    const title = clearHtmlTags(headingResult?.[2] ?? '').trim()
    const anchor = headingResult?.[1] ?? ''
    const content = result[i + 2]
    if (!title || !content)
      continue
    const titles = parentTitles.slice(0, level)
    titles[level] = title
    sections.push({ anchor, titles, text: getSearchableText(content) })
    if (level === 0)
      parentTitles = [title]

    else
      parentTitles[level] = title
  }
  return sections
}

function getSearchableText(content: string) {
  content = clearHtmlTags(content)
  return content
}

function clearHtmlTags(str: string) {
  return str.replace(/<[^>]*>/g, '')
}
