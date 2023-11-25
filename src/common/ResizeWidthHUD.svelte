<script lang="ts">
  import { onMount } from "svelte";
  export let nameSelector: string;

  onMount(() => {
    const hud = document.querySelector<HTMLDivElement>(nameSelector);
    const onSetWidth = () => {
      if (hud) {
        hud.style.width =
          document.querySelector<HTMLDivElement>("#game")?.style.width!;
      }
    };

    onSetWidth();

    window.addEventListener("resize", onSetWidth);
    return () => {
      window.removeEventListener("resize", onSetWidth);
    };
  });
</script>
