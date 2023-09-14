<script lang="ts">
  import { Level } from "src/scenes/level";
  import { resources } from 'src/app/resources'
  import { onMount } from "svelte";
  export let scene: Level;
  let carrotNode: HTMLDivElement;
  let keyGoldNode: HTMLDivElement;
  let keySilverNode: HTMLDivElement;
  let keyCopperNode: HTMLDivElement;
  let carrots = scene.carrots;

  
  onMount(() => {
    const hud = document.querySelector<HTMLDivElement>('.hud')
      if (hud) {
        scene.on('takeCarrot', () => {
          carrots -= 1
        })
        const onSetWidth = () => {
          hud.style.width = document.querySelector<HTMLDivElement>('#game')?.style.width!
        }
        const HUD = resources.HUD.data
        carrotNode.append(HUD.cloneNode())
        scene.on<'takeKey'>('takeKey', (key: string) => {
          if (key === 'Key_Yellow') {
            keyGoldNode.append(HUD.cloneNode())
          } else if (key === 'Key_Red') {
            keyCopperNode.append(HUD.cloneNode())
          } else if (key === 'Key_Silver') {
            keySilverNode.append(HUD.cloneNode())
          }
        })
        scene.on<'openLock'>('openLock', (key: string) => {
          if (key === 'Lock_Yellow') {
            keyGoldNode.remove()
          } else if (key === 'Lock_Red') {
            keyCopperNode.remove()
          } else if (key === 'Lock_Silver') {
            keySilverNode.remove()
          }
        })
        onSetWidth()
        window.removeEventListener('resize', onSetWidth)
        window.addEventListener('resize', onSetWidth)
      }
  })
</script>

<div class="hud">
  <div class="hud_carrot">
    <div class="carrot_score">{carrots}</div>
    <div class="carrot" bind:this={carrotNode} />
  </div>
  <div class="hud_keys">
    <div class="hud_copper" bind:this={keyCopperNode} />
    <div class="hud_silver" bind:this={keySilverNode} />
    <div class="hud_gold" bind:this={keyGoldNode} />
  </div>
</div>

<style>
  .hud {
    margin-right: 40px;
    --size: 1px;
    color: white;
    position: absolute;
    top: 0;
    display: flex;
    justify-content: flex-end;
    flex-direction: column;
    gap: 10px;
    image-rendering: pixelated;
    text-shadow: 0 var(--size) black, 0 calc(var(--size) * -1) black, var(--size) 0px black, calc(var(--size) * -1) 0 black;
  }
  .hud_carrot {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
  }
  .carrot_score {
    font-size: 23px;
  }
  .carrot {
    overflow: hidden;
    width: 13px;
    height: 13px;
    scale: 2;
    object-fit: cover;
    object-position: 0 0;
  }
  .hud_keys {
    display: flex;
    overflow: hidden;
    width: 24px;
    height: 15px;
    scale: 2;
    object-fit: cover;
    margin-left: auto;
  }
  .hud_copper, .hud_silver, .hud_gold {
    width: 8px;
    overflow: hidden;
  }
  :global(.hud_silver img) {
    object-position: -38px 0;
  }
  :global(.hud_gold img) {
    object-position: -46px 0;
  }
  :global(.hud_copper img) {
    object-position: -54px 0;
  }
</style>
