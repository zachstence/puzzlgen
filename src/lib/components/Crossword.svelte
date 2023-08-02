<script lang="ts">
  export let grid: string[][];
</script>

<table class="grid">
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

<style>
  table {
    border-collapse: collapse;
    font-family: monospace;
  }

  table.grid {
    font-size: 24px;
  }

  table.grid td:has(div) {
    border: 1px solid black;
    width: 30px;
    height: 30px;
  }

  table.grid td div {
    display: flex;
    align-items: center;
    justify-content: center;

    font-weight: 700;
  }
</style>
