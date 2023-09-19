<script setup lang="ts">
import { index } from '@temp/foo'
import { Document } from 'flexsearch'
import { useRouteLocale } from '@vuepress/client'
import { computed, ref } from 'vue'
import { debouncedWatch } from '@vueuse/core'
import Modal from './Modal.vue'

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

  const showedText = text
  const result = showedText.replace(regex, match => `<mark>${match}</mark>`)

  return result
}

debouncedWatch(query, search, { debounce: 200 })

const searchModal = ref(false)
</script>

<template>
  <div>
    <button class="search-btn" @click="searchModal = true">
      Search
    </button>
    <Modal v-model="searchModal">
      <div class="card">
        <input v-model="query" class="search-input">
        <div v-if="searchResults && searchResults.length" class="search-result">
          <div v-for="result in searchResults" :key="result.id">
            <a :href="result.path">
              <div v-html="result.title" />
            </a>
            <p v-html="result.excerpt" />
          </div>
        </div>
        <div v-else-if="query" class="search-result-notfound">
          No results found.
        </div>
      </div>
    </Modal>
  </div>
</template>

<style scoped>
div, input{
  box-sizing: border-box;
}

.search-btn {
  border: 1px solid #ccc;
  border-radius: 4px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-size: 14px;
  background: transparent;
}

.card {
  width: min(90vw,900px);
  max-height: 90vh;
  margin: 0 auto;
  background: var(--search-card-bg);
  border-radius: 4px;
}

.search-input {
  width: 100%;
  border: 0;
  outline: 0;
  padding: 0.5rem 1rem;
  font-size: 14px;
}

.search-result {
  max-height: calc(90vh - 40px);
  overflow: auto;
  padding: 0 8px;
}

.search-result-notfound{
  padding: 0 8px;
  min-height: 10vh;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>

<style>
:root {
  --search-card-bg: #fff;
}
</style>
