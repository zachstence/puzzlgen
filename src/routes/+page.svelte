<script lang="ts">
  import { CrosswordGenerator, words as toPlace } from '$lib';
  import { Crossword } from '$lib/components';

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

  let crossword: Crossword;
</script>

<button class="btn btn-primary" on:click={gen.generate}>Generate</button>

<button class="btn btn-primary" on:click={crossword.download}>Download</button>

{#if $gen.generated}
  <Crossword bind:this={crossword} grid={$gen.grid} cellSize={30} />
{/if}
