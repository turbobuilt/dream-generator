// .d.ts file so that yu can import components from *.vue

declare module '*.vue' {
    import { ComponentOptions } from 'vue'
    const component: ComponentOptions
    export default component
}