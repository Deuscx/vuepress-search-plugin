<script setup lang="ts">
import { index } from '@temp/foo'
import { Document } from 'flexsearch'
import { useRouteLocale } from '@vuepress/client'
import { computed, ref } from 'vue'
import { debouncedWatch } from '@vueuse/core'
import Modal from './Modal.vue'

console.log(index)
const locale = useRouteLocale()
const query = ref('')
const localeIndex = new Map()
const currentIndex = computed(() => localeIndex.get(locale.value))
setupLocalIndex()
function setupLocalIndex() {
  for (const locale in index) {
    const doc = new Document({
      tokenize: 'full',
      id: 'id',
      index: ['text', 'anchor'],
    })

    // Consider the case locale defined but no pages created.
    const indexPageSections = index[locale]
    if (!indexPageSections)
      continue

    indexPageSections.forEach((page) => {
      doc.add(page)
    })

    localeIndex.set(locale, doc)
  }
}
const searchResults = ref()
function search() {
  const results = currentIndex.value.search(query.value)
  console.log(results)
  const uniqueResults = new Set(results.flatMap(item => item.result) || [])
  searchResults.value = [...uniqueResults].map((key) => {
    const page = index[locale.value].find(page => page.id === key)
    if (!page)
      return null
    return {
      title: createHighlight(page.anchor, query.value, { full: true }),
      path: page.path,
      excerpt: createHighlight(page.text, query.value),
    }
  }).filter(Boolean)
}

interface CreateHighlightOptions {
  full?: boolean
}
function createHighlight(text: string, query: string, options: CreateHighlightOptions = {}) {
  const { full } = options
  const regex = new RegExp(query.split(/\s+/).filter(i => i?.length).join('|'), 'gi')

  const showedText = full ? text : partialText(text, query.split(/\s+/))
  const result = showedText.replace(regex, match => `<mark>${match}</mark>`)

  return result
}
const MAX_LENGTH = 150
const MIN_LENGTH = 50
function partialText(text: string, terms: string[]) {
  const regex = new RegExp(terms.join('|'), 'ig')
  const matches = text.matchAll(regex)
  if (!matches)
    return text.slice(0, MAX_LENGTH)
  // FIXME: length is not correct
  const groups: string[] = []
  for (const match of Array.from(matches)) {
    const index = match.index || 0
    const start = Math.max(index - MIN_LENGTH, 0)
    const end = Math.min(index + MIN_LENGTH, text.length)
    groups.push(text.slice(start, end))
  }
  return groups.join('...')
}
debouncedWatch(query, search, { debounce: 200 })

const searchModal = ref(false)
</script>

<template>
  <div>
    <button @click="searchModal = true">
      Search
    </button>
    <Modal v-model="searchModal">
      <input v-model="query">
      <div v-if="searchResults">
        <div v-for="result in searchResults" :key="result.id">
          <a :href="result.path">
            <div v-html="result.title" />
          </a>
          <p v-html="result.excerpt" />
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
</style>
