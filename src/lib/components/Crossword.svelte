<script lang="ts">
  import type { CrosswordStyleStore } from '$lib/crossword-style.store';

  let clazz: string = '';
  export { clazz as class };

  export let grid: string[][];
  export let style: CrosswordStyleStore;

  export const download = (): void => {
    if (!svgElm) return;
    const blob = new Blob([svgElm.outerHTML.toString()]);

    const aElm = document.createElement('a');
    aElm.download = 'crossword.svg';
    aElm.href = URL.createObjectURL(blob);
    aElm.click();
    aElm.remove();
  };

  $: rows = grid.length;
  $: cols = grid[0]?.length ?? 0;

  $: svgWidth = $style.cellSize * cols;
  $: svgHeight = $style.cellSize * rows;

  let svgElm: SVGSVGElement;
</script>

<div class="{clazz} w-full h-full">
  <svg
    bind:this={svgElm}
    width="100%"
    height="100%"
    preserveAspectRatio="meet"
    viewBox="0 0 {svgWidth} {svgHeight}"
    xmlns="http://www.w3.org/2000/svg"
  >
    <style>
      text {
        text-anchor: middle;
        dominant-baseline: middle;
        font-family: monospace;
      }
    </style>

    <rect width="100%" height="100%" fill={$style.gridBackgroundColor} />

    {#each grid as row, r}
      {#each row as char, c}
        <g>
          <rect
            x={c * $style.cellSize}
            y={r * $style.cellSize}
            width={$style.cellSize}
            height={$style.cellSize}
            fill={$style.cellBackgroundColor}
            stroke={char && $style.cellBorderColor}
            stroke-width={$style.cellBorderWidth}
          />
          <text
            x={c * $style.cellSize + $style.cellSize / 2}
            y={r * $style.cellSize + $style.cellSize / 2}
            fill={$style.textColor}
            font-size={$style.cellSize * $style.textScale}>{char}</text
          >
        </g>
      {/each}
    {/each}
  </svg>
</div>
