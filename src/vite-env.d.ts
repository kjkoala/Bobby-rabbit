/// <reference types="vite/client" />

declare module "*.tmx" {
    import type { ComponentType } from "svelte";
    const component: any;
    export default component;
}
declare module "*.svelte" {
    import type { ComponentType } from "svelte";
    const component: ComponentType;
    export default component;
}

declare const ym: Function