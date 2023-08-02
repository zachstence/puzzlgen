<script lang="ts">
  import '../app.css';
</script>

<div class="w-screen h-screen overflow-hidden flex flex-col">
  <header class="shrink-0">
    <nav class="navbar bg-base-300">
      <!-- TODO better name -->
      <a class="btn btn-ghost text-xl mx-auto" href="/">Crossword Generator</a>
    </nav>
  </header>

  <main class="flex-1 overflow-x-hidden overflow-y-auto">
    <slot />
  </main>
</div>
