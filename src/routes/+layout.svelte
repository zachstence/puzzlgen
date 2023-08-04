<script lang="ts">
  import { ThemeToggle } from '$lib/components';

  import '../app.css';
</script>

<div class="w-screen h-screen overflow-hidden flex flex-col">
  <header class="shrink-0">
    <nav class="navbar bg-base-300">
      <div class="navbar-start" />

      <!-- TODO better name -->
      <a class="navbar-center btn btn-ghost text-xl mx-auto" href="/">Crossword Generator</a>

      <div class="navbar-end flex flex-row gap-2">
        <ThemeToggle />
        <a
          class="btn btn-ghost"
          href="https://github.com/zachstence/crossword-generator"
          target="_blank">GitHub</a
        >
      </div>
    </nav>
  </header>

  <main class="flex-1 overflow-x-hidden overflow-y-auto">
    <slot />
  </main>
</div>
