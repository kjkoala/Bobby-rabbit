<script lang="ts">
  import { Level } from "src/scenes/level";
  import { resources } from "src/app/resources";
  import { onMount } from "svelte";
  import { Directon } from "src/actors/types";
  import { isMobile } from "src/common/constants";
  import { getInputType } from "src/common/getInputType";
  import ResizeWidthHUD from "src/common/ResizeWidthHUD.svelte";
  import { computedTimeUTC } from "src/common/computedTimeUTC";
  import { InputTypes } from "src/common/types";
  export let scene: Level;
  let carrotNode: HTMLDivElement;
  let eyeNode: HTMLButtonElement;
  let keyGoldNode: HTMLDivElement;
  let keySilverNode: HTMLDivElement;
  let keyCopperNode: HTMLDivElement;
  let count = scene.carrots || scene.nests || 0;
  let arrowUp: HTMLButtonElement | undefined;
  let arrowDown: HTMLButtonElement | undefined;
  let arrowLeft: HTMLButtonElement | undefined;
  let arrowRight: HTMLButtonElement | undefined;
  let restartButton: HTMLButtonElement | undefined;
  let menuButton: HTMLButtonElement | undefined;
  let showLevelText: boolean = true;
  let lockCamera = scene.lockCamera;
  let showResult: boolean = false;
  let timeFinishLevel: string = "";
  let showRestartMessage = false;
  const currentInputType = getInputType();

  onMount(() => {
    setTimeout(() => {
      showLevelText = false;
    }, 1200);

    const arrowClone1 = resources.Arrows.data.cloneNode();
    const arrowClone2 = resources.Arrows.data.cloneNode();
    const arrowClone3 = resources.Arrows.data.cloneNode();
    const arrowClone4 = resources.Arrows.data.cloneNode();
    const menuButtonColne = resources.Menu.data.cloneNode();
    const restartButtonClone = resources.Restart.data.cloneNode();
    restartButton?.append(restartButtonClone);
    arrowUp?.append(arrowClone1);
    arrowLeft?.append(arrowClone2);
    arrowRight?.append(arrowClone3);
    arrowDown?.append(arrowClone4);
    menuButton?.append(menuButtonColne);
    const hud = document.querySelector<HTMLDivElement>(".hud");
    if (hud) {
      scene.on("levelComplete", () => {
        setTimeout(() => {
          const date = new Date(scene.computedTime());
          timeFinishLevel = computedTimeUTC(date);
          showResult = true;
        }, 500);
      });
      scene.on("showRestartMessage", () => {
        showRestartMessage = true;
      });
      scene.on("hideRestartMessage", () => {
        showRestartMessage = false;
      });
      scene.on("nestEgg", () => {
        count -= 1;
      });
      scene.on("takeCarrot", () => {
        count -= 1;
      });
      const HUD = resources.HUD.data;
      carrotNode.append(HUD.cloneNode());
      if (isMobile) {
        eyeNode.append(HUD.cloneNode());
      }
      scene.on("takeKey", (key) => {
        if (key === "Key_Yellow") {
          keyGoldNode.append(HUD.cloneNode());
        } else if (key === "Key_Red") {
          keyCopperNode.append(HUD.cloneNode());
        } else if (key === "Key_Silver") {
          keySilverNode.append(HUD.cloneNode());
        }
      });
      scene.on("openLock", (key: unknown) => {
        if (key === "Lock_Yellow") {
          keyGoldNode.remove();
        } else if (key === "Lock_Red") {
          keyCopperNode.remove();
        } else if (key === "Lock_Silver") {
          keySilverNode.remove();
        }
      });
    }
  });

  const handleTouchStart = (e: any) => {
    scene.emit("mobileButtonPressed", e.target.dataset.direction);
  };

  const handleTouchMapVisor = () => {
    const toggle = !scene.lockCamera;
    scene.lockCameraOnActor(toggle);
    lockCamera = toggle;
  };
</script>

<div class="hud">
  <ResizeWidthHUD nameSelector=".hud" />
  <div class="header_hud">
    <button
      class="scale_button"
      type="button"
      bind:this={menuButton}
      on:click={() => scene.goToMenu()}
    />
    {#if isMobile}
      <button
        on:pointerdown={handleTouchStart}
        class="scale_button margin_button"
        type="button"
        bind:this={restartButton}
        data-direction={11}
      />
      <button
        class="hud_eye_button margin_button"
        class:active_eye={!lockCamera}
        type="button"
        bind:this={eyeNode}
        on:pointerdown={handleTouchMapVisor}
      />
    {/if}
    <div class="hud_carrot">
      <div class="carrot_score">{count}</div>
      <div
        class:carrot={Boolean(scene.carrots)}
        class:egg={Boolean(scene.nests)}
        bind:this={carrotNode}
      />
    </div>
  </div>
  <div class="hud_keys">
    <div class="hud_copper" bind:this={keyCopperNode} />
    <div class="hud_silver" bind:this={keySilverNode} />
    <div class="hud_gold" bind:this={keyGoldNode} />
  </div>
  {#if showLevelText}
    <div class="center_text">Уровень {scene.currentLevel + 1}</div>
  {/if}
  {#if showResult}
    <div class="center_text">
      Время: {timeFinishLevel}
      <br />
      Шагов: {scene.player.steps}
    </div>
  {/if}
  {#if showRestartMessage}
    <div class="center_text">R = Рестарт</div>
  {/if}
  {#if isMobile && currentInputType !== InputTypes.swipe}
    <div
      class={`controls ${currentInputType}`}
      on:pointerup={() => scene.emit("mobileButtonWasReleased")}
      on:pointerdown={handleTouchStart}
    >
      <button
        type="button"
        class="button_up"
        data-direction={Directon.UP}
        bind:this={arrowUp}
      />
      <div class="lr_buttons">
        <button
          type="button"
          class="button_left lr_button"
          data-direction={Directon.LEFT}
          bind:this={arrowLeft}
        />
        <button
          type="button"
          class="button_right lr_button"
          data-direction={Directon.RIGHT}
          bind:this={arrowRight}
        />
      </div>
      <button
        type="button"
        class="button_down"
        data-direction={Directon.DOWN}
        bind:this={arrowDown}
      />
    </div>
  {/if}
</div>

<style>
  .hud {
    --size: 1px;
    width: 100%;
    height: 100%;
    color: white;
    position: absolute;
    top: 0;
    display: flex;
    flex-direction: column;
    gap: 10px;
    image-rendering: pixelated;
    touch-action: none;
    text-shadow: 0 var(--size) black, 0 calc(var(--size) * -1) black,
      var(--size) 0px black, calc(var(--size) * -1) 0 black;
  }

  button {
    border: none;
    background: none;
    outline: none;
    cursor: pointer;
  }

  .scale_button {
    transform: scale(2);
  }

  .margin_button {
    margin-left: 25px;
  }

  :global(.scale_button img) {
    pointer-events: none;
  }

  .header_hud {
    display: flex;
    padding: 10px 20px;
  }

  .hud_eye_button {
    transform: scale(2);
    filter: brightness(0.4);
    transition: all ease 100ms;
  }

  .active_eye {
    transform: scale(2.5);
    filter: brightness(1);
  }

  :global(.hud_eye_button img) {
    width: 16px;
    height: 14px;
    object-fit: cover;
    object-position: -25px 0;
  }
  .center_text {
    margin: auto;
    text-align: center;
    font-size: 25px;
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

  :global(.egg img) {
    width: 9px;
    height: 13px;
    transform: scale(2);
    object-fit: cover;
    object-position: -14px 0;
  }
  :global(.carrot img) {
    width: 14px;
    height: 13px;
    transform: scale(2);
    object-fit: cover;
    object-position: 0 0;
  }
  .hud_keys {
    display: flex;
    overflow: hidden;
    width: 24px;
    height: 15px;
    transform: scale(2);
    object-fit: cover;
    margin-right: 20px;
    margin-left: auto;
  }
  .hud_copper,
  .hud_silver,
  .hud_gold {
    width: 8px;
    overflow: hidden;
  }
  .controls {
    display: flex;
    flex-wrap: wrap;
    margin-top: auto;
    flex-direction: column;
  }
  .controls button {
    height: 45px;
    touch-action: none;
  }

  .lr_buttons {
    display: flex;
  }
  .lr_button {
    flex: 1;
  }

  .controls.classic button {
    background-color: rgba(255, 255, 255, 0.5);
    border: 1px solid black;
  }

  .controls:not(.classic) {
    width: 50%;
  }
  .controls:not(.classic) button {
    width: 45px;
  }

  .controls:not(.classic) > button {
    margin-left: auto;
    margin-right: auto;
  }

  .controls.right {
    margin-left: auto;
  }

  .controls.center {
    margin-left: auto;
    margin-right: auto;
  }

  :global(.controls button img) {
    pointer-events: none;
    width: 32px;
    height: 32px;
    object-fit: cover;
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

  :global(.button_up img) {
    object-position: 0 0;
  }

  :global(.button_right img) {
    object-position: -32px 0;
  }
  :global(.button_left img) {
    object-position: -64px 0;
  }
  :global(.button_down img) {
    object-position: -96px 0;
  }
</style>
