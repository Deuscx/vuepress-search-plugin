import { defineClientConfig } from '@vuepress/client'
import SearchBox from './SearchBox.vue'

export default defineClientConfig({
  enhance({ app }) {
    // wrap the `<SearchBox />` component with plugin options
    app.component('SearchBox', SearchBox)
  },
})
