<script lang="ts">
  import { Main } from "src/scenes";
  import { onMount } from "svelte";
  import { fetchUsers } from "./api/fetchUser";
  import UserList from "./components/UsetList.svelte";
  import Board from "./components/Board.svelte";
  import type { User } from "./types";
  import GameOver from "./components/GameOver.svelte";
  export let scene: Main;
  let score = 0;
  let playing = false;
  let dead = false;
  let me: User | undefined;

  onMount(() => {
    scene.on("initialize", () => {
      fetchUsers().then((users) => {
        me = users.find((user) => user.me);
      });
    });
    scene.on("restart", () => {
      playing = scene.state.playing;
      dead = scene.state.dead;
      score = scene.state.score;
    });
    scene.on("start", () => {
      playing = scene.state.playing;
      dead = scene.state.dead;
    });
    scene.on("died", () => {
      playing = scene.state.playing;
      dead = scene.state.dead;
    });
    scene.on("score", () => {
      score = scene.state.score;
    });
  });

  const restart = () => {
    scene.emit("restart", undefined);
  };
</script>

<div class="root" class:playing={!dead}>
  {#if playing}
    <span class="score">{score}</span>
  {/if}
  {#if dead}
    <span class:died={dead} />
    <GameOver />
    <Board {score} {me}>
      <UserList {me} slot="score" />
      <div class="board__buttons" slot="buttons">
        <button type="button" on:click={TelegramGameProxy.shareScore}
          >share</button
        >
        <button type="button" on:click={restart}>restart</button>
      </div>
    </Board>
  {/if}
</div>

<style>
  @keyframes deadAnim {
    0% {
      opacity: 1;
    }
    100% {
      opacity: 0;
    }
  }
  .root.playing {
    pointer-events: none;
  }
  .died {
    pointer-events: none;
    position: absolute;
    inset: 0;
    opacity: 1;
    background: white;
    z-index: 9;
    animation: 200ms ease-out 0s 1 deadAnim forwards;
  }
  .board__buttons {
    display: flex;
    justify-content: center;
    align-items: flex-start;
    gap: 10px;
  }
  .score {
    display: flex;
    justify-content: center;
    padding: 1rem;
    font-size: 1.5rem;
    color: white;
    text-shadow: 0 1px black, 3px 0 black, -1px 0 black, 0 -1px black;
  }
</style>
