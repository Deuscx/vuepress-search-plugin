declare module '*.vue' {
    import type {DefineComponent} from 'src/shims'
    const component: DefineComponent<{}, {}, any>
    export default component
}

declare module '@temp/foo' {
    interface PageSection{
        anchor: string
        titles: string[]
        text: string
        id: string
        path: string
    }
    export const index: Record<string, PageSection[]>
}
