<script lang="ts">
  export let grid: string[][];
  export let cellSize: number;

  export let textColor: string | undefined = 'white';
  export let textScale: number = 0.6;
  export let cellBorderColor: string | undefined = 'white';
  export let cellBorderThickness: number | undefined = 2;
  export let cellBackgroundColor: string | undefined = 'transparent';
  export let gridBackgroundColor: string | undefined = 'transparent';

  export const download = (): void => {
    if (!svgElm) return;
    const blob = new Blob([svgElm.outerHTML.toString()]);

    const aElm = document.createElement('a');
    aElm.download = 'crossword.svg';
    aElm.href = URL.createObjectURL(blob);
    aElm.click();
    aElm.remove();
  };

  const rows = grid.length;
  const cols = grid[0]?.length ?? 0;

  const svgWidth = cellSize * cols;
  const svgHeight = cellSize * rows;

  let svgElm: SVGSVGElement;
</script>

<svg
  bind:this={svgElm}
  width="100%"
  viewBox="0 0 {svgWidth} {svgHeight}"
  xmlns="http://www.w3.org/2000/svg"
  shape-rendering="crispEdges"
>
  <style>
    text {
      text-anchor: middle;
      dominant-baseline: middle;
      font-family: monospace;
    }
  </style>

  <rect width={svgWidth} height={svgHeight} fill={gridBackgroundColor} />

  {#each grid as row, r}
    {#each row as char, c}
      <g>
        <rect
          x={c * cellSize}
          y={r * cellSize}
          width={cellSize}
          height={cellSize}
          fill={cellBackgroundColor}
          stroke={char && cellBorderColor}
          stroke-width={cellBorderThickness}
        />
        <text
          x={c * cellSize + cellSize / 2}
          y={r * cellSize + cellSize / 2}
          fill={textColor}
          font-size={cellSize * textScale}>{char}</text
        >
      </g>
    {/each}
  {/each}
</svg>
