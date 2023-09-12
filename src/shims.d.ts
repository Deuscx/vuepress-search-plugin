declare module '*.vue' {
    import type {DefineComponent} from 'src/shims'
    const component: DefineComponent<{}, {}, any>
    export default component
}
