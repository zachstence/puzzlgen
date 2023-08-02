<script lang="ts">
  import { CrosswordGenerator, words as toPlace } from '$lib';
  import Crossword from '$lib/components/Crossword.svelte';

  const gen = new CrosswordGenerator({
    words: toPlace,
    numPlacementIterations: 2,
    randomizeWords: true,
    weights: {
      minimizeHeight: 0.45,
      minimizeWidth: 0.45,
      maximizeIntersections: 0.1,
    },
  });
</script>

<button on:click={gen.generate}>Generate</button>

<pre>generating: {$gen.generating}</pre>
<pre>generated: {$gen.generated}</pre>

{#if $gen.generated}
  <div class="generated">
    <Crossword grid={$gen.grid} />

    <table class="words">
      <thead>
        <tr>
          <th>Word</th>
          <th>Placed?</th>
          <th>Location</th>
          <th>Direction</th>
        </tr>
      </thead>
      <tbody>
        {#each $gen.words as word}
          <tr>
            <td>{word.word}</td>
            <td>{word.placed}</td>
            {#if word.placed}
              <td>{word.location.row}, {word.location.col}</td>
              <td>{word.location.direction}</td>
            {:else}
              <td />
              <td />
            {/if}
          </tr>
        {/each}
      </tbody>
    </table>
  </div>
{/if}

<style>
  .generated {
    display: flex;
    flex-direction: row;
    justify-content: space-around;
  }

  table.words {
    font-size: 16px;
  }

  table.words td,
  table.words th {
    padding: 8px;
    border: 1px solid black;
  }
</style>
