<script lang="ts">
    import { Menu } from "src/scenes/mainMenu";
    import { resources } from 'src/app/resources'
    import { onDestroy, onMount } from 'svelte';
  import { getMusicStatus } from "src/common/getMusicStatus";
  import { getLevelsLocalStorage, isMobile } from "src/common/constants";
  import { InputTypes } from '../common/types'
  import { getInputType } from "src/common/getInputType";
    // import Records from "./Records.svelte";

    export let menu: Menu;

    let newGame = false;
    let continueGame = false;
    let musicEnable = getMusicStatus()
    let currentInputType = getInputType()
    let levelsDisabled = [getLevelsLocalStorage('carrots_levels').length === 0, getLevelsLocalStorage('eggs_levels').length === 0]
    
    let backgroundUI: HTMLDivElement;
      onMount(() => {
          const background = resources.Title.data.cloneNode()
          backgroundUI.append(background)
      })

      onDestroy(() => {
        localStorage.setItem('inputType', currentInputType);
      })

      let onChangeMusicStatus = () => {
        musicEnable = !musicEnable
        menu.toggleMusic(musicEnable)
      }

      const changeInputType = () => {
        let nextInputType = currentInputType;
        if (currentInputType === InputTypes.right) {
           nextInputType = InputTypes.left
        } else if (currentInputType === InputTypes.left) {
            nextInputType = InputTypes.center
        } else if (currentInputType === InputTypes.center) {
            nextInputType = InputTypes.classic
        } else if (currentInputType === InputTypes.classic) {
            nextInputType = InputTypes.right
        }
        currentInputType = nextInputType;
      }

</script>

<div class="wrapper">
    <div class="background" bind:this={backgroundUI} />
    {#if !newGame && !continueGame}
    {#if !levelsDisabled[0] || !levelsDisabled[1]}
        <button type="button" on:click={() => continueGame = true}>Продолжить</button>
    {/if}
    <button type="button" on:click={() => newGame = true}>Новая игра</button>
    <!-- <button type="button">Рекорды</button> -->
    <!-- <Records /> -->
    <button type="button" on:click={onChangeMusicStatus}>Музыка {musicEnable ? 'выкл.' : 'вкл.'}</button>
    {#if isMobile}
    <button type="button" on:click={changeInputType}>Управление ({ currentInputType === InputTypes.classic ? 'классика' : currentInputType === InputTypes.center ? 'центр' : currentInputType === InputTypes.left ? 'слева' : 'справа'  })</button>
    {/if}
    <!--<button type="button">Руководство</button>
    <button type="button">Создатели</button> -->
    {/if}
    {#if newGame}
        <button type="button" on:click={() => menu.startCarrotsNewGame()}>Сбор урожая морковки</button>
        <button type="button" on:click={() => menu.startEggsNewGame()}>Пасхальный кролик</button>
        <button type="button" on:click={() => newGame = false}>Назад</button>
        {/if}
    {#if continueGame}
        <button type="button" disabled={levelsDisabled[0]} on:click={() => menu.continueGame('carrots_levels')}>Сбор урожая морковки</button>
        <button type="button" disabled={levelsDisabled[1]} on:click={() => menu.continueGame('eggs_levels')}>Пасхальный кролик</button>
        <button type="button" on:click={() => continueGame = false}>Назад</button>
    {/if}
</div>
<style>
    .wrapper {
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