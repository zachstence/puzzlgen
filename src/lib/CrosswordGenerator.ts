interface CrosswordGeneratorArgs {
  words: string[];
}

const DIRECTIONS = ['right', 'down'] as const;
type Direction = (typeof DIRECTIONS)[number];

interface CharLocation {
  row: number;
  col: number;
}

interface WordLocation extends CharLocation {
  direction: Direction;
}

const BLOCKED_CELL_CHAR = '​';

export class CrosswordGenerator {
  constructor(readonly args: CrosswordGeneratorArgs) {
    this._words = args.words.map((word) => `${BLOCKED_CELL_CHAR}${word}${BLOCKED_CELL_CHAR}`);
  }

  private _words: string[];

  private _grid: Record<number, Record<number, string>> = {};

  private _cantPlace: string[] = [];

  get grid(): string[][] {
    const out: string[][] = [];

    const rowLimits = Object.keys(this._grid)
      .map((s) => parseInt(s))
      .reduce(
        ({ min, max }, curr) => ({
          min: Math.min(min, curr),
          max: Math.max(max, curr),
        }),
        { min: Infinity, max: -Infinity },
      );

    const colLimits = Object.values(this._grid)
      .flatMap((cols) => Object.keys(cols))
      .map((s) => parseInt(s))
      .reduce(
        ({ min, max }, curr) => ({
          min: Math.min(min, curr),
          max: Math.max(max, curr),
        }),
        { min: Infinity, max: -Infinity },
      );

    for (let r = rowLimits.min; r <= rowLimits.max; r++) {
      const row: string[] = [];
      for (let c = colLimits.min; c <= colLimits.max; c++) {
        const char = this._grid[r][c];
        if (char && char !== BLOCKED_CELL_CHAR) {
          row.push(char);
        } else {
          row.push('');
        }
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
    this._words.forEach((word) => this.placeWord(word));
  };

  private placeWord = (word: string, grid = this._grid): void => {
    console.log(`\nPlacing ${word}`);
    // If word has no characters, nothing to place
    if (word.length === 0) return;

    // Empty grid, this is the first word
    if (!grid[0] || !grid[0][0]) {
      this.placeWordAt(word, { row: 0, col: 0, direction: 'right' });
      return;
    }

    const allPossibleLocations: WordLocation[] = this.findAllPossibleWordLocations(word);

    if (allPossibleLocations.length === 0) {
      this._cantPlace.push(word);
      return;
    }

    // For now, place at first location
    this.placeWordAt(word, allPossibleLocations[0]);
  };

  private canPlaceWordAt = (word: string, location: WordLocation, grid = this._grid): boolean => {
    const { row, col, direction } = location;
    const chars = word.split('');
    return chars.every((char, i) =>
      this.canPlaceCharAt(
        char,
        {
          row: direction === 'down' ? row + i : row,
          col: direction === 'right' ? col + i : col,
        },
        grid,
      ),
    );
  };

  private placeWordAt = (word: string, location: WordLocation, grid = this._grid): void => {
    const { row, col, direction } = location;
    const chars = word.split('');
    chars.forEach((char, i) =>
      this.placeCharAt(
        char,
        {
          row: direction === 'down' ? row + i : row,
          col: direction === 'right' ? col + i : col,
        },
        grid,
      ),
    );
  };

  private canPlaceCharAt = (char: string, location: CharLocation, grid = this._grid): boolean => {
    const { row, col } = location;

    const existing = this.charAt({ row, col }, grid);

    // A blocked character should not exist at this location
    if (existing === BLOCKED_CELL_CHAR) return false;

    // A different character should not already exist at this location
    if (existing && existing !== char) return false;

    // Placing this character cannot form a 2x2 group of characters in the grid
    const up: CharLocation = { row: -1, col: 0 };
    const down: CharLocation = { row: 1, col: 0 };
    const left: CharLocation = { row: 0, col: -1 };
    const right: CharLocation = { row: 0, col: 1 };
    const upAndLeft: CharLocation = { row: -1, col: -1 };
    const upAndRight: CharLocation = { row: -1, col: 1 };
    const downAndLeft: CharLocation = { row: 1, col: -1 };
    const downAndRight: CharLocation = { row: 1, col: 1 };

    type Group = [CharLocation, CharLocation, CharLocation];
    type Groups = [Group, Group, Group, Group];
    const groups: Groups = [
      [right, upAndRight, up],
      [up, upAndLeft, left],
      [left, downAndLeft, down],
      [down, downAndRight, right],
    ];

    const formsA2x2 = groups.some((group) => {
      const charsInGroup = group
        .map(({ row: rowOffset, col: colOffset }) =>
          this.charAt({ row: row + rowOffset, col: col + colOffset }),
        )
        .filter(Boolean) as string[];
      // If the group has 3 characters, adding a char would make a 2x2 group
      return charsInGroup.length === 3;
    });
    if (formsA2x2) return false;

    return true;
  };

  private placeCharAt = (char: string, location: CharLocation, grid = this._grid): void => {
    if (char.length !== 1) throw new InvalidCharacterError(char);

    if (!this.canPlaceCharAt(char, location)) {
      throw new Error(`Cannot place character '${char}' at ${location}`);
    }

    const { row, col } = location;
    if (!grid[row]) grid[row] = {};
    grid[row][col] = char;
  };

  private charAt = (location: CharLocation, grid = this._grid): string | undefined => {
    const { row, col } = location;
    return grid[row]?.[col];
  };

  private findCharLocations = (char: string, grid = this._grid): CharLocation[] => {
    if (char.length !== 1) throw new InvalidCharacterError(char);

    const filledCells: CharLocation[] = Object.keys(grid).flatMap((row) =>
      Object.keys(grid[parseInt(row)]).map((col) => ({
        row: parseInt(row),
        col: parseInt(col),
      })),
    );

    const cellsWithChar = filledCells.filter(({ row, col }) => grid[row][col] === char);
    return cellsWithChar;
  };

  private findAllPossibleWordLocations = (word: string, grid = this._grid): WordLocation[] => {
    const chars = word.split('');

    const allLocations = chars.flatMap((char, i) => {
      const charLocations = this.findCharLocations(char, grid);
      const wordLocations = charLocations.flatMap(({ row, col }) =>
        DIRECTIONS.flatMap((direction) => {
          return {
            row: direction === 'down' ? row - i : row,
            col: direction === 'right' ? col - i : col,
            direction,
          };
        }),
      );

      return wordLocations;
    });

    const allPossibleLocations = allLocations.filter((location) =>
      this.canPlaceWordAt(word, location),
    );

    return allPossibleLocations;
  };
}

class InvalidCharacterError extends Error {
  constructor(invalidCharacter: unknown) {
    super(`Invalid character ${invalidCharacter}`);
  }
}
