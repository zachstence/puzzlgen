import { writable, type Writable } from 'svelte/store';

export interface CrosswordStyle {
  /** Hex */
  gridBackgroundColor: string;

  /** Size in pixels */
  cellSize: number;

  /** Width in pixels */
  cellBorderWidth: number;

  /** Hex */
  cellBorderColor: string;

  /** Hex */
  cellBackgroundColor: string;

  /** [0,1] */
  textScale: number;

  /** Hex */
  textColor: string;
}

export interface CrosswordStyleStore extends Writable<CrosswordStyle> {
  reset: () => void;
}

const DEFAULT_CROSSWORD_STYLE: CrosswordStyle = {
  gridBackgroundColor: 'transparent',
  textScale: 0.6,
  textColor: '#000000',
  cellSize: 30,
  cellBorderWidth: 2,
  cellBorderColor: '#000000',
  cellBackgroundColor: 'transparent',
};

export const createCrosswordStyle = (): CrosswordStyleStore => {
  const { subscribe, set, update } = writable<CrosswordStyle>(DEFAULT_CROSSWORD_STYLE);

  const reset = () => set(DEFAULT_CROSSWORD_STYLE);

  return {
    subscribe,
    set,
    update,
    reset,
  };
};
