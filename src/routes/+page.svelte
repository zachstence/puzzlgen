<script lang="ts">
  import { CrosswordGenerator } from '$lib/CrosswordGenerator';
  import { words } from '$lib/words';

  const gen = new CrosswordGenerator({
    words,
    weights: {
      minimizeHeight: 0.45,
      minimizeWidth: 0.45,
      maximizeIntersections: 0.1,
    },
    // randomizeWords: true,
  });

  let generating = false;
  let generated = false;
  let grid: string[][] = [];
  let allWords: string[] = [];
  let notPlaced: string[] = [];

  const generate = (): void => {
    generating = true;
    generated = false;
    gen.generate();
    generated = true;
    generating = false;

    grid = gen.grid;
    allWords = gen.words;
    notPlaced = gen.cantPlace;
  };
</script>

<button on:click={generate}>Generate</button>

<pre>generating: {generating}</pre>
<pre>generated: {generated}</pre>

{#if generating}
  Generating...
{/if}

{#if generated}
  <table>
    <tbody>
      {#each grid as row}
        <tr>
          {#each row as char}
            {#if char}
              <td><div>{char}</div></td>
            {:else}
              <td />
            {/if}
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
{/if}

<div class="words">
  <div>
    <b>Words</b>
    {#each allWords as word}
      <span>{word}</span>
    {/each}
  </div>
  <div>
    <b>Not Placed</b>
    {#each notPlaced as word}
      <span>{word}</span>
    {/each}
  </div>
</div>

<style>
  table {
    border-collapse: collapse;

    font-family: monospace;
    font-size: 24px;
    font-weight: 700;
  }

  td:has(div) {
    border: 1px solid black;
    width: 30px;
    height: 30px;
  }

  td div {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .words {
    display: flex;
    flex-direction: row;
  }
  .words > div {
    display: flex;
    flex-direction: column;
  }
</style>
