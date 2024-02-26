/// <reference types="vite/client" />

declare module "*.tmx" {
    import type { ComponentType } from "svelte";
    const component: any;
    export default component;
}
declare module "*.svelte" {
    import type { SvelteComponent } from "svelte";
    const component: SvelteComponent;
    export default component;
}