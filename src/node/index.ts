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
      await app.writeTemp('foo.js', 'export const foo = \'bar\'')
    },
  }
}
