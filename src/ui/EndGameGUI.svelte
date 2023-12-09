<script lang="ts">
  import { resources } from "src/app/resources";
  import { onMount } from "svelte";
  import ResizeWidthHUD from "src/common/ResizeWidthHUD.svelte";
  import { EndGameScene } from "src/scenes/endGame";
  export let scene: EndGameScene;

  let menuButton: HTMLButtonElement | undefined;

  onMount(() => {
    const menuButtonColne = resources.Menu.data.cloneNode();
    menuButton?.append(menuButtonColne);
  });
</script>

<div class="wrapperEnd">
  <ResizeWidthHUD nameSelector=".wrapperEnd" />
  <button
    class="scale_button"
    type="button"
    bind:this={menuButton}
    on:click={() => scene.goToMenu()}
  />
</div>

<style>
  .wrapperEnd {
    position: absolute;
    height: 100%;
    padding: 20px;
  }
  .scale_button {
    padding: 0;
    margin: 0;
    background: none;
    border: none;
    cursor: pointer;
    image-rendering: pixelated;
  }
  :global(.scale_button img) {
    pointer-events: none;
  }
  .scale_button {
    transform: scale(2);
  }
</style>
