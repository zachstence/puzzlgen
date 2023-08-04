<script lang="ts">
  import { createCrosswordConfig, createCrosswordStyle, CrosswordGenerator } from '$lib';
  import { Actions, Controls, Crossword } from '$lib/components';

  const config = createCrosswordConfig();

  const style = createCrosswordStyle();

  $: gen = new CrosswordGenerator($config);

  let crossword: Crossword | undefined;
</script>

<div class="w-full h-full flex flex-row items-center space-between gap-8 p-4">
  <aside class="shrink-0 h-full flex flex-col gap-4">
    <section>
      <Actions onGenerate={gen.generate} onDownload={crossword?.download} />
    </section>
    <section class="overflow-auto scroll">
      <Controls {config} {style} />
    </section>
  </aside>

  <section class="flex-1 h-full flex items-center justify-center overflow-hidden">
    {#if $gen.generated}
      <Crossword
        class="flex items-center justify-center"
        bind:this={crossword}
        grid={$gen.grid}
        {style}
      />
    {/if}
  </section>
</div>

<style>
  section {
    @apply bg-base-300 p-4 rounded-2xl shadow-xl;
  }
</style>
