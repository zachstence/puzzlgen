interface CrosswordGeneratorArgs {
  words: string[];
}

type Direction = 'right' | 'down';

interface CharLocation {
  row: number;
  col: number;
}

interface WordLocation extends CharLocation {
  direction: Direction;
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
      this.placeWordAt(word, { row: 0, col: 0, direction: 'right' });
      return;
    }

    const [firstChar, ...restChars] = word;

    // Gather all possible locations for the first character
    const firstCharLocations = this.findCharLocations(firstChar);
    console.log({ firstCharLocations });

    if (firstCharLocations.length === 0) {
      this._cantPlace.push(word);
      return;
    }

    // Place word at first possible location, trying both down and right directions
    // TODO examine all locations/directions and use the best based on a heuristic
    const { row, col } = firstCharLocations[0]!;
    try {
      this.placeWordAt(word, { row, col, direction: 'down' });
      return;
    } catch {
      // Continue
    }

    try {
      this.placeWordAt(word, { row, col, direction: 'right' });
      return;
    } catch {
      // Continue
    }

    this._cantPlace.push(word);
  };

  private placeWordAt = (word: string, location: WordLocation): void => {
    const { row, col, direction } = location;
    const chars = word.split('');
    chars.forEach((char, i) =>
      this.placeCharAt(char, {
        row: direction === 'down' ? row + i : row,
        col: direction === 'right' ? col + i : col
      })
    );
  };

  private placeCharAt = (char: string, location: CharLocation): void => {
    if (char.length !== 1) throw new InvalidCharacterError(char);

    const { row, col } = location;
    const existing = this.charAt({ row, col });
    if (existing && existing !== char) {
      throw new Error(
        `Cannot place character '${char}' at (${row},${col}), it is already filled by ${existing}.`
      );
    }

    if (!this._grid[row]) this._grid[row] = {};
    this._grid[row][col] = char;
  };

  private charAt = (location: CharLocation): string | undefined => {
    const { row, col } = location;
    return this._grid[row]?.[col];
  };

  private findCharLocations = (char: string): CharLocation[] => {
    if (char.length !== 1) throw new InvalidCharacterError(char);

    const filledCells: CharLocation[] = Object.keys(this._grid).flatMap((row) =>
      Object.keys(this._grid[parseInt(row)]).map((col) => ({
        row: parseInt(row),
        col: parseInt(col)
      }))
    );

    const cellsWithChar = filledCells.filter(({ row, col }) => this._grid[row][col] === char);
    return cellsWithChar;
  };
}

class InvalidCharacterError extends Error {
  constructor(invalidCharacter: unknown) {
    super(`Invalid character ${invalidCharacter}`);
  }
}
