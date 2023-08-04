import { writable, type Writable } from 'svelte/store';

import type { CrosswordGeneratorArgs } from './CrosswordGenerator';

export interface CrosswordConfigStore extends Writable<CrosswordGeneratorArgs> {
  reset: () => void;
}

const DEFAULT_CROSSWORD_CONFIG: CrosswordGeneratorArgs = {
  // TODO separate words from rest of config
  words: [],
  numPlacementIterations: 2,
  randomizeWords: true,
  weights: {
    minimizeHeight: 0.45,
    minimizeWidth: 0.45,
    maximizeIntersections: 0.1,
  },
};

export const createCrosswordConfig = (): CrosswordConfigStore => {
  const { subscribe, set, update } = writable<CrosswordGeneratorArgs>(DEFAULT_CROSSWORD_CONFIG);

  const reset = () => set(DEFAULT_CROSSWORD_CONFIG);

  return {
    subscribe,
    set,
    update,
    reset,
  };
};
