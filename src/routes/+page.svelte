<script lang="ts">
  import { CrosswordGenerator } from '$lib/CrosswordGenerator';
  import { words } from '$lib/words';

  const gen = new CrosswordGenerator({ words });

  gen.generate();
</script>

<table>
  <tbody>
    {#each gen.grid as row}
      <tr>
        {#each row as char}
          <td><div>{char}</div></td>
        {/each}
      </tr>
    {/each}
  </tbody>
</table>

<div class="cantPlace">
  {#each gen.cantPlace as word}
    <span>{word}</span>
  {/each}
</div>

<style>
  table {
    border-collapse: collapse;
    border: 1px solid black;

    font-family: monospace;
    font-size: 24px;
    font-weight: 700;
  }

  td {
    border: 1px solid black;
    width: 30px;
    height: 30px;
  }

  td div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .cantPlace {
    display: flex;
    flex-direction: column;
  }
</style>
