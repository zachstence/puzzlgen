<script lang="ts">
  export let onGenerate: (() => void) | undefined = undefined;
  export let onDownload: (() => void) | undefined = undefined;
</script>

<div class="flex flex-row items-center justify-center gap-8">
  {#if onGenerate}
    <button class="btn btn-primary flex-1" on:click={onGenerate}>Generate</button>
  {/if}
  {#if onDownload}
    <button class="btn btn-primary flex-1" on:click={onDownload}>Download</button>
  {/if}
</div>
