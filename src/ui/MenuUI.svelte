<script lang="ts">
  import { Menu } from "src/scenes/mainMenu";
  import { resources } from "src/app/resources";
  import { onDestroy, onMount } from "svelte";
  import { getMusicStatus } from "src/common/getMusicStatus";
  import {
  CARROT_LEVEL_TITLE,
    EGG_LEVEL_TITLE,
    carrots_levels,
    eggs_levels,
    getLevelsLocalStorage,
    isMobile,
  } from "src/common/constants";
  import { InputTypes } from "../common/types";
  import { getInputType } from "src/common/getInputType";
  import { carrotsMaps, eggsMaps } from "src/app/main";
  import { computedTimeUTC } from "src/common/computedTimeUTC";
  import ResizeWidthHUD from "src/common/ResizeWidthHUD.svelte";

  export let menu: Menu;
  const storageLevelsCarrots = getLevelsLocalStorage(carrots_levels);
  const storageLevelsEggs = getLevelsLocalStorage(eggs_levels);
  let newGame = false;
  let continueGame = false;
  let records: false | "both" | "carrots" | "eggs" = false;
  let musicEnable = getMusicStatus();
  let currentInputType = getInputType();
  let levelsDontStart = [
    storageLevelsCarrots.length === 0,
    storageLevelsEggs.length === 0,
  ];
  let levelsFinished = [
    storageLevelsCarrots.length > 0 &&
      storageLevelsCarrots.at(-1)!.level + 1 === carrotsMaps.length,
    storageLevelsEggs.length > 0 &&
      storageLevelsEggs.at(-1)!.level + 1 === eggsMaps.length,
  ];

  let backgroundUI: HTMLDivElement;
  onMount(() => {
    const background = resources.Title.data.cloneNode();
    backgroundUI.append(background);
  });

  onDestroy(() => {
    localStorage.setItem("inputType", currentInputType);
  });

  let onChangeMusicStatus = () => {
    musicEnable = !musicEnable;
    menu.toggleMusic(musicEnable);
  };

  const changeInputType = () => {
    let nextInputType = currentInputType;
    if (currentInputType === InputTypes.right) {
      nextInputType = InputTypes.left;
    } else if (currentInputType === InputTypes.left) {
      nextInputType = InputTypes.center;
    } else if (currentInputType === InputTypes.center) {
      nextInputType = InputTypes.classic;
    } else if (currentInputType === InputTypes.classic) {
      nextInputType = InputTypes.right;
    }
    currentInputType = nextInputType;
  };
</script>

<div class="wrapper">
  <ResizeWidthHUD nameSelector=".wrapper" />
  <div class="background" bind:this={backgroundUI} />
  {#if !newGame && !continueGame && !records}
    {#if !levelsDontStart[0] || !levelsDontStart[1]}
      <button type="button" on:click={() => (continueGame = true)}
        >Продолжить</button
      >
    {/if}
    <button type="button" on:click={() => (newGame = true)}>Новая игра</button>
    <button type="button" on:click={() => (records = "both")}>Рекорды</button>
    <button type="button" on:click={onChangeMusicStatus}
      >Музыка {musicEnable ? "выкл." : "вкл."}</button
    >
    {#if isMobile}
      <button type="button" on:click={changeInputType}
        >Управление ({currentInputType === InputTypes.classic
          ? "стандартное"
          : currentInputType === InputTypes.center
          ? "центр"
          : currentInputType === InputTypes.left
          ? "слева"
          : "справа"})</button
      >
    {/if}
  {/if}
  {#if newGame}
    <button type="button" on:click={() => menu.startCarrotsNewGame()}
      >{CARROT_LEVEL_TITLE}</button
    >
    <button type="button" on:click={() => menu.startEggsNewGame()}
      >{EGG_LEVEL_TITLE}</button
    >
    <button type="button" on:click={() => (newGame = false)}>Назад</button>
  {/if}
  {#if continueGame}
    <button
      type="button"
      disabled={levelsDontStart[0] || levelsFinished[0]}
      on:click={() => menu.continueGame(carrots_levels)}
      >{CARROT_LEVEL_TITLE} {#if levelsFinished[0]}(пройдено){/if}</button
    >
    <button
      type="button"
      disabled={levelsDontStart[1] || levelsFinished[1]}
      on:click={() => menu.continueGame(eggs_levels)}
      >{EGG_LEVEL_TITLE} {#if levelsFinished[1]}(пройдено){/if}</button
    >
    <button type="button" on:click={() => (continueGame = false)}>Назад</button>
  {/if}
  {#if records === "both"}
    <button type="button" on:click={() => (records = "carrots")}
      >{CARROT_LEVEL_TITLE}</button
    >
    <button type="button" on:click={() => (records = "eggs")}
      >{EGG_LEVEL_TITLE}</button
    >
    <button type="button" on:click={() => (records = false)}>Назад</button>
  {/if}
  {#if records === "eggs"}
    <div class="records">
      <div class="title">{EGG_LEVEL_TITLE}</div>
      <div class="levels" class:mobile={isMobile}>
        {#each storageLevelsEggs as eggs}
          <button
            class="level"
            on:click={() => {
              menu.handleNextLevel(eggs_levels, eggs.level);
            }}
            >Уровень {eggs.level + 1}<br />
            Время: {computedTimeUTC(new Date(eggs.time))}<br />
            Шаги: {eggs.steps}
          </button>
        {/each}
      </div>
      <button type="button" on:click={() => (records = "both")}>Назад</button>
    </div>
  {/if}
  {#if records === "carrots"}
    <div class="records">
      <div class="title">{CARROT_LEVEL_TITLE}</div>
      <div class="levels" class:mobile={isMobile}>
        {#each storageLevelsCarrots as carrot}
          <button
            class="level"
            on:click={() => {
              menu.handleNextLevel(carrots_levels, carrot.level);
            }}
            >Уровень {carrot.level + 1}<br />
            Время: {computedTimeUTC(new Date(carrot.time))}<br />
            Шаги: {carrot.steps}
          </button>
        {/each}
      </div>
      <button type="button" on:click={() => (records = "both")}>Назад</button>
    </div>
  {/if}
</div>

<style>
  .records {
    color: white;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
  }

  .title {
    padding: 5px;
    text-shadow: 1px 1px 0 black;
    font-size: 20px;
  }

  .levels {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    width: 100%;
    justify-content: center;
    align-items: center;
    max-height: min(80vw, 80vh);
    overflow: auto;
  }

  .levels.mobile {
    max-height: min(100vw, 100vh);
  }

  .level {
    color: white;
    background-color: black;
    padding: 5px;
    cursor: pointer;
    border: 1px solid white;
    font-size: 14px;
    min-width: 128px;
    flex: 1;
  }
  .wrapper {
    margin: auto;
    touch-action: none;
    position: absolute;
    inset: 0;
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 5px;
    image-rendering: pixelated;
  }

  .background {
    pointer-events: none;
    position: absolute;
    z-index: 0;
    width: min(100%, 700px);
    aspect-ratio: 1 / 1;
    left: 50%;
    transform: translateX(-50%);
  }

  :global(.background img) {
    width: min(100%, 700px);
    aspect-ratio: 1 / 1;
  }

  button {
    cursor: pointer;
    color: white;
    border: none;
    background: none;
    padding: 5px;
    text-shadow: 1px 1px 0 black;
    z-index: 1;
    font-size: 20px;
    width: 100%;
  }

  button[disabled] {
    opacity: 0.5;
    cursor: default;
  }

  button:hover {
    box-shadow: inset 0 1px 1px 0 white;
    background-color: #f4890b;
    color: black;
    text-shadow: none;
  }
</style>
