interface CrosswordGeneratorArgs {
  words: string[];
}

export class CrosswordGenerator {
  constructor(readonly args: CrosswordGeneratorArgs) {}

  private _grid: Record<number, Record<number, string>> = {};

  private _cantPlace: string[] = [];

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

  get cantPlace(): string[] {
    return this._cantPlace;
  }

  generate = (): void => {
    console.clear();
    this.args.words.forEach(this.placeWord);
  };

  private placeWord = (word: string): void => {
    console.log(`\nPlacing ${word}`);
    // If word has no characters, nothing to place
    if (word.length === 0) return;

    // Empty grid, this is the first word
    if (!this._grid[0] || !this._grid[0][0]) {
      this.placeWordAt(word, 0, 0, 'right');
      return;
    }

    const [firstChar, ...restChars] = word;

    // Gather possible locations for the first character
    const firstCharLocations = this.findCharLocations(firstChar);
    console.log({ firstCharLocations });

    if (firstCharLocations.length === 0) {
      this._cantPlace.push(word);
      return;
    }

    // Place word at first possible location, trying both down and right directions
    // TODO examine all locations/directions and use the best based on a heuristic
    const [row, col] = firstCharLocations[0]!;
    try {
      this.placeWordAt(word, row, col, 'down');
      return;
    } catch {
      // Continue
    }

    try {
      this.placeWordAt(word, row, col, 'right');
      return;
    } catch {
      // Continue
    }

    this._cantPlace.push(word);
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
    if (char.length !== 1) throw new InvalidCharacterError(char);

    const existing = this.charAt(row, col);
    if (existing && existing !== char) {
      throw new Error(
        `Cannot place character '${char}' at (${row},${col}), it is already filled by ${existing}.`
      );
    }

    if (!this._grid[row]) this._grid[row] = {};
    this._grid[row][col] = char;
  };

  private charAt = (row: number, col: number): string | undefined => {
    return this._grid[row]?.[col];
  };

  private findCharLocations = (char: string): [number, number][] => {
    if (char.length !== 1) throw new InvalidCharacterError(char);

    const filledCells: [number, number][] = Object.keys(this._grid).flatMap((row) =>
      Object.keys(this._grid[parseInt(row)]).map(
        (col) => [parseInt(row), parseInt(col)] as [number, number]
      )
    );

    const cellsWithChar = filledCells.filter(([row, col]) => this._grid[row][col] === char);
    return cellsWithChar;
  };
}

class InvalidCharacterError extends Error {
  constructor(invalidCharacter: unknown) {
    super(`Invalid character ${invalidCharacter}`);
  }
}
