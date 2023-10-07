<script lang="ts">
  import { Level } from "src/scenes/level";
  import { resources } from 'src/app/resources'
  import { onMount } from "svelte";
  import { Directon } from "src/actors/types";
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
        scene.on('takeKey', (key) => {
          if (key === 'Key_Yellow') {
            keyGoldNode.append(HUD.cloneNode())
          } else if (key === 'Key_Red') {
            keyCopperNode.append(HUD.cloneNode())
          } else if (key === 'Key_Silver') {
            keySilverNode.append(HUD.cloneNode())
          }
        })
        scene.on('openLock', (key: unknown) => {
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


  const handleTouchStart = (e: any) => {scene.emit('mobileButtonPressed', e.target.dataset.direction)}

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
  {#if scene.isMobile}
  <div class="controls" on:pointerup={() => scene.emit('mobileButtonWasReleased')} on:pointerdown={handleTouchStart} >
    <button type="button" class="full" data-direction={Directon.UP}>Вверх</button>
    <button type="button" class="half" data-direction={Directon.LEFT}>Влево</button>
    <button type="button" class="half" data-direction={11}>Рестарт</button>
    <button type="button" class="half"data-direction={Directon.RIGHT}>Вправо</button>
    <button type="button" class="full"data-direction={Directon.DOWN}>Вниз</button>
  </div>
  {/if}
</div>

<style>
  .hud {
    --size: 1px;
    height: 100%;
    color: white;
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    image-rendering: pixelated;
    touch-action: none;
    text-shadow: 0 var(--size) black, 0 calc(var(--size) * -1) black, var(--size) 0px black, calc(var(--size) * -1) 0 black;
  }
  .hud_carrot {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: auto;
    margin-right: 20px;
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
    margin-right: 20px;
  }
  .hud_copper, .hud_silver, .hud_gold {
    width: 8px;
    overflow: hidden;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    margin-top: auto;
  }
  .controls button {
    height: 50px;
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid black;
    outline: none;
    touch-action: none;
  }
  .full {
    width: 100%;
  }

  .half {
    flex: 1;
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
