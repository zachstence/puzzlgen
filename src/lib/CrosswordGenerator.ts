interface CrosswordGeneratorArgs {
  words: string[];
}

export class CrosswordGenerator {
  constructor(readonly args: CrosswordGeneratorArgs) {}

  private _grid: Record<number, Record<number, string>> = {};

  get grid(): string[][] {
    const out: string[][] = [];

    const rowLimits = Object.keys(this._grid)
      .map((s) => parseInt(s))
      .reduce(
        ({ min, max }, curr) => ({
          min: Math.min(min, curr),
          max: Math.max(max, curr)
        }),
        { min: Infinity, max: -Infinity }
      );

    const colLimits = Object.values(this._grid)
      .flatMap((cols) => Object.keys(cols))
      .map((s) => parseInt(s))
      .reduce(
        ({ min, max }, curr) => ({
          min: Math.min(min, curr),
          max: Math.max(max, curr)
        }),
        { min: Infinity, max: -Infinity }
      );

    for (let r = rowLimits.min; r <= rowLimits.max; r++) {
      const row: string[] = [];
      for (let c = colLimits.min; c <= colLimits.max; c++) {
        const char = this._grid[r][c];
        if (char) row.push(char);
        else row.push('');
      }
      out.push(row);
    }

    return out;
  }

  generate = (): void => {
    this.args.words.forEach(this.placeWord);
  };

  private placeWord = (word: string): void => {
    // Empty grid, this is the first word
    if (!this._grid[0] || !this._grid[0][0]) {
      this.placeWordAt(word, 0, 0, 'right');
    }
  };

  private placeWordAt = (
    word: string,
    row: number,
    col: number,
    direction: 'down' | 'right'
  ): void => {
    const chars = word.split('');
    chars.forEach((char, i) =>
      this.placeCharAt(
        char,
        direction === 'down' ? row + i : row,
        direction === 'right' ? col + i : col
      )
    );
  };

  private placeCharAt = (char: string, row: number, col: number): void => {
    if (char.length !== 1) {
      throw new Error(`Cannot place character of invalid length: '${char}'. Length must be 1.`);
    }

    const existing = this._grid[row]?.[col];
    if (existing && existing !== char) {
      throw new Error(
        `Cannot place character '${char}' at (${row},${col}), it is already filled by ${existing}.`
      );
    }

    if (!this._grid[row]) this._grid[row] = {};
    this._grid[row][col] = char;
  };
}
