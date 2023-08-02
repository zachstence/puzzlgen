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

      <ThemeToggle class="navbar-end" />
    </nav>
  </header>

  <main class="flex-1 overflow-x-hidden overflow-y-auto">
    <slot />
  </main>
</div>
