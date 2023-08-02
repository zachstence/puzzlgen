<script lang="ts">
  import { onMount } from 'svelte';
  import { themeChange } from 'theme-change';

  onMount(() => {
    themeChange(false);
  });
</script>

<div class={$$props.class}>
  <button
    class="btn btn-ghost swap swap-rotate"
    data-toggle-theme="dark,light"
    data-act-class="swap-active"
  >
    <div class="swap-on">Dark</div>
    <div class="swap-off">Light</div>
  </button>
</div>
