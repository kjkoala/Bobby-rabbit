<script lang="ts">
    import { Menu } from "src/scenes/mainMenu";
    import { resources } from 'src/app/resources'
    import { onMount } from 'svelte';

    export let menu: Menu;

    let newGame = false;
    
    let backgroundUI: HTMLDivElement;
      onMount(() => {
          const background = resources.Title.data.cloneNode()
          backgroundUI.append(background)
      })

</script>

<div class="wrapper">
    <div class="background" bind:this={backgroundUI} />
    {#if !newGame}
    {#if Boolean(menu.getLocalStorageCarrotsLevel())}
        <button type="button" on:click={() => menu.continueGame()}>Продолжить</button>
    {/if}
    <button type="button" on:click={() => newGame = true}>Новая игра</button>
    <!-- <button type="button">Время на уровнях</button>
    <button type="button">Музыка включена</button>
    <button type="button">Руководство</button>
    <button type="button">Создатели</button> -->
    {/if}
    {#if newGame}
        <button type="button" on:click={() => menu.startCarrotsNewGame()}>Сбор урожая морковки</button>
        <button type="button" disabled>Пасхальный кролик</button>
        <button type="button" on:click={() => newGame = false}>Назад</button>
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