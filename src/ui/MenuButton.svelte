<script lang="ts">
  import { resources } from "src/app/resources";
  import { onMount } from "svelte";

    let menuButton: HTMLButtonElement | undefined;

    onMount(() => {
        const menuButtonColne = resources.Menu.data.cloneNode()
        menuButton?.append(menuButtonColne)
    })


</script>

<button class="scale_button" type="button" bind:this={menuButton} on:click={console.log} />

<style>
    .scale_button {
        top: 0;
        position: absolute;
        left: 0;
    }
:global(.scale_button img) {
    pointer-events: none;
  }
  .scale_button {
    scale: 2;
  }
</style>