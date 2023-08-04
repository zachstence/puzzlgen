<script lang="ts">
  import type { CrosswordConfigStore, CrosswordStyleStore } from '$lib';
  import { words } from '$lib/words';

  let clazz: string = '';
  export { clazz as class };

  export let config: CrosswordConfigStore;
  export let style: CrosswordStyleStore;

  let rawWords: string = words.join('\n');
  $: $config.words = rawWords.split('\n');
</script>

<form class={clazz}>
  <fieldset>
    <legend>Words</legend>
    <textarea
      class="textarea textarea-sm h-48 leading-snug font-mono"
      bind:value={rawWords}
      aria-label="Words"
    />
  </fieldset>

  <fieldset>
    <legend>Style</legend>

    <label>
      <span>Grid Background Color</span>
      <input
        class="input input-sm input-bordered"
        type="color"
        bind:value={$style.gridBackgroundColor}
      />
    </label>

    <label>
      <span>Cell Size (px)</span>
      <input class="input input-sm input-bordered" type="number" bind:value={$style.cellSize} />
    </label>

    <label>
      <span>Cell Border Width (px)</span>
      <input
        class="input input-sm input-bordered"
        type="number"
        bind:value={$style.cellBorderWidth}
      />
    </label>

    <label>
      <span>Cell Border Color (px)</span>
      <input
        class="input input-sm input-bordered"
        type="color"
        bind:value={$style.cellBorderColor}
      />
    </label>

    <label>
      <span>Text Scale (%)</span>
      <input
        class="range flex-1"
        type="range"
        min={0}
        step={0.01}
        max={1}
        bind:value={$style.textScale}
      />
      <span class="w-10 text-right">{($style.textScale * 100).toFixed(0)}%</span>
    </label>

    <label>
      <span>Text Color</span>
      <input class="input input-sm input-bordered" type="color" bind:value={$style.textColor} />
    </label>

    <button class="btn btn-sm btn-error btn-outline mt-2" on:click={style.reset}>Reset</button>
  </fieldset>

  <fieldset>
    <legend>Config</legend>

    <label>
      <span>Optimization Iterations</span>
      <input
        class="input input-sm input-bordered"
        type="number"
        min={1}
        bind:value={$config.numPlacementIterations}
      />
    </label>

    <label>
      <span>Randomize Word Order</span>
      <input class="checkbox" type="checkbox" bind:checked={$config.randomizeWords} />
    </label>

    <button class="btn btn-sm btn-error btn-outline mt-2" on:click={config.reset}>Reset</button>
  </fieldset>
</form>

<style lang="postcss">
  form {
    @apply w-full flex flex-col gap-8 items-center px-2 pb-2;
  }

  fieldset {
    @apply w-full flex flex-col gap-4 border border-base-content rounded-md px-4 pb-4;
  }

  legend {
    @apply text-lg font-bold uppercase tracking-widest p-2;
  }

  label {
    @apply flex flex-row gap-4 items-center;

    :nth-child(1) {
      @apply w-52;
    }

    :nth-child(2):not(.checkbox) {
      @apply flex-1;
    }
  }
</style>
