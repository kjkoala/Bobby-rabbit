<script>
  import { carrots_levels, getCarrotsLevelsLocalStorage } from "src/common/constants";

  const carrotsLevels =  getCarrotsLevelsLocalStorage()
</script>

<ul>
    {#each carrotsLevels as carrot}
        <li>Уровень{carrot.level + 1}<br />
            Время: {carrot.time}<br/>
            Шаги: {carrot.steps}
        </li>
    {/each}
</ul>