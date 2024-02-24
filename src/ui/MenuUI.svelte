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
    tilemap,
  } from "src/common/constants";
  import { InputTypes } from "../common/types";
  import { getInputType } from "src/common/getInputType";
  import { carrotsMaps, eggsMaps } from "src/app/main";
  import { computedTimeUTC } from "src/common/computedTimeUTC";
  import ResizeWidthHUD from "src/common/ResizeWidthHUD.svelte";
  import VKBridge from "src/common/VKBridge";

  export let menu: Menu;
  const storageLevelsCarrots = getLevelsLocalStorage(carrots_levels);
  const storageLevelsEggs = getLevelsLocalStorage(eggs_levels);
  let newGame = false;
  let continueGame = false;
  let records: false | "both" | "carrots" | "eggs" = false;
  let musicEnable = getMusicStatus();
  let currentInputType = getInputType();
  let rules: boolean | string = false;
  let ready: boolean = false;
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

    setTimeout(() => {
      ready = true;
    }, 100);
  });

  onDestroy(() => {
    window.localStorage.setItem("inputType", currentInputType);
  });

  let onChangeMusicStatus = () => {
    musicEnable = !musicEnable;
    menu.toggleMusic(musicEnable);
  };

  const changeInputType = () => {
    let nextInputType = currentInputType;
    if (currentInputType === InputTypes.stick) {
      nextInputType = InputTypes.classic;
    } else if (currentInputType === InputTypes.classic) {
      nextInputType = InputTypes.right;
    } else if (currentInputType === InputTypes.right) {
      nextInputType = InputTypes.left;
    } else if (currentInputType === InputTypes.left) {
      nextInputType = InputTypes.center;
    } else if (currentInputType === InputTypes.center) {
      nextInputType = InputTypes.stick;
    }
    currentInputType = nextInputType;
  };
</script>

<div class="wrapper">
  <ResizeWidthHUD nameSelector=".wrapper" />
  <div class="background" bind:this={backgroundUI} />
  {#if !newGame && !continueGame && !records && !rules && ready}
    {#if !levelsDontStart[0] || !levelsDontStart[1]}
      <button type="button" on:click={() => (continueGame = true)}
        >Продолжить</button
      >
    {/if}
    <button type="button" on:click={() => (newGame = true)}>Новая игра</button>
    <button type="button" on:click={VKBridge.inviteFriend}
      >Пригласить друга</button
    >
    <button type="button" on:click={() => (records = "both")}>Рекорды</button>
    <button type="button" on:click={onChangeMusicStatus}
      >Музыка {musicEnable ? "выкл." : "вкл."}</button
    >
    {#if isMobile}
      <button type="button" on:click={changeInputType}
        >Управление ({currentInputType === InputTypes.stick
          ? "стиком"
          : currentInputType === InputTypes.classic
          ? "стрелки стандартное"
          : currentInputType === InputTypes.center
          ? "стрелки центр"
          : currentInputType === InputTypes.left
          ? "стрелки слева"
          : "стрелки справа"})</button
      >
    {/if}
    <button type="button" on:click={() => (rules = "1")}>Правила</button>
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
      >{CARROT_LEVEL_TITLE}
      {#if levelsFinished[0]}(пройдено){/if}</button
    >
    <button
      type="button"
      disabled={levelsDontStart[1] || levelsFinished[1]}
      on:click={() => menu.continueGame(eggs_levels)}
      >{EGG_LEVEL_TITLE}
      {#if levelsFinished[1]}(пройдено){/if}</button
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
  {#if rules === "1"}
    <div class="records rules" class:rules_mobile={isMobile}>
      Кролик идёт по направлению нажатой кнопки.
      <div class="arrow_keys">
        <span class="arrow"
          ><div>←</div>
          <div>A</div>
        </span><span class="arrow top"
          ><div>W</div>
          <div>↑</div></span
        ><span class="arrow"
          ><div>S</div>
          <div>↓</div></span
        ><span class="arrow"
          ><div>D</div>
          <div>→</div></span
        >
      </div>
      <button type="button" on:click={() => (rules = "2")}>Далее (1 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "2"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img carrots_img" src={tilemap} alt="" />
      </div>
      Морковка:
      <div>
        Встань на морковку - кролик подберёт её. <br />
        Собери всю морковку на уровне для активации выхода.
      </div>
      <button type="button" on:click={() => (rules = "3")}>Далее (2 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "3"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img eggs_img" src={tilemap} alt="" />
      </div>
      Пасхальные яйца:
      <div>
        Проходи через пустые кувшинки - кролик будет оставлять в них пасхальное
        яйцо.<br />
        Пасхальное яйцо заблокирует дорогу, обратного пути не будет, продумывай ходы.
        <br />
        Нужно заполнить все кувшинки для активации выхода.
      </div>
      <button type="button" on:click={() => (rules = "4")}>Далее (3 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "4"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img locks_img_wrap">
        <img class="rules_img lock_img" src={tilemap} alt="" />
      </div>
      Замок и ключ:
      <div>
        На карте есть места закрытые замком. <br />
        Кролику надо найти подходящий по цвету ключ.<br />
        После того, как кролик подберёт ключ, он может идти смело к замку.
        <br />
      </div>
      <button type="button" on:click={() => (rules = "5")}>Далее (4 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "5"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img traps_img" src={tilemap} alt="" />
      </div>
      Ловушки:
      <div>
        Если так случилось, <br />что кролик пробежал по ловушке,<br />
        ловушка активируется. <br /> после чего второй раз на неё наступать нельзя.
      </div>
      <button type="button" on:click={() => (rules = "6")}>Далее (5 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "6"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img travolator_img_wrap">
        <img class="rules_img travolator_img" src={tilemap} alt="" />
      </div>
      Траволатор:
      <div>
        Кролик на платформе двигается только в одном направлении. <br />
        Кролик не может уйти с платформы или двигаться в другом направлении до конца
        платформы.
      </div>
      <button type="button" on:click={() => (rules = "7")}>Далее (6 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "7"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img travolator_switch_img" src={tilemap} alt="" />
      </div>
      Переключатели направления:
      <div>
        Вставая на эти кнопки, <br /> траволатор будет двигаться в противоположном
        направлении.
      </div>
      <button type="button" on:click={() => (rules = "8")}>Далее (7 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "8"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img locks_img_wrap">
        <img class="rules_img rotate_block_img" src={tilemap} alt="" />
      </div>
      Вращающийся камень:
      <div>
        Через этот камень можно пройти только в определенном направлении. <br />
        Когда кролик уходит с платформы, она двигается на 90 градусов по часовой
        стрелке.
      </div>
      <button type="button" on:click={() => (rules = "9")}>Далее (8 / 9)</button
      >
    </div>
  {/if}
  {#if rules === "9"}
    <div class="records rules" class:rules_mobile={isMobile}>
      <div class="rules_wrap_img carrots_img_wrap">
        <img class="rules_img rotate_switch_img" src={tilemap} alt="" />
      </div>
      Переключатель вращения:
      <div>
        Эти красные переключатели поворачивают все вращающиеся камни на 90
        градусов.
      </div>
      <button type="button" on:click={() => (rules = false)}
        >Меню (9 / 9)</button
      >
    </div>
  {/if}
</div>

<style>
  .rotate_switch_img {
    object-position: -96px -32px;
  }
  .rotate_block_img {
    object-position: 0px -47px;
  }
  .travolator_switch_img {
    object-position: -95px -63px;
  }
  .travolator_img {
    object-position: 0px -79px;
  }
  .travolator_img_wrap {
    width: 64px !important;
  }
  .traps_img {
    object-position: -96px -47px;
  }
  .locks_img_wrap {
    width: 96px !important;
    height: 16px;
  }
  .lock_img {
    object-position: 0px -64px;
  }
  .eggs_img {
    object-position: -80px -79px;
  }
  .carrots_img {
    object-position: -47px -32px;
  }
  .carrots_img_wrap {
    width: 32px !important;
    height: 16px;
  }
  .rules_wrap_img {
    width: 16px;
    height: 16px;
    overflow: hidden;
    transform: scale(3);
    margin-bottom: 16px;
    border-radius: 5px;
  }
  .rules_img {
    object-fit: cover;
  }
  .rules {
    background-color: black;
    height: 100%;
    box-shadow: inset 0 0 12px white;
    border: 2px solid #f4890b;
    justify-content: center;
    font-size: 20px;
    text-align: center;
  }

  .rules_mobile {
    font-size: 16px;
  }
  .arrow {
    border: 1px solid white;
    width: 45px;
    height: 45px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .arrow.top {
    position: absolute;
    margin-top: -44px;
  }

  .arrow_keys {
    margin-top: 45px;
  }
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
    width: 100%;
    aspect-ratio: 1 / 1;
    left: 50%;
    transform: translateX(-50%);
  }

  :global(.background img) {
    width: 100%;
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
    background-color: rgba(0, 0, 0, 0.15);
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
