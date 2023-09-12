import { defineUserConfig } from 'vuepress'
import SearchPlugin from '../../dist/node/index'
export default defineUserConfig({
  lang: 'zh-CN',
  title: '你好， VuePress ！',
  description: '这是我的第一个 VuePress 站点',
  plugins: [
    SearchPlugin()
  ]
})
