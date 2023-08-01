import type { reset } from '__sveltekit/paths';

interface CrosswordGeneratorArgs {
  words: string[];
  randomizeWords?: boolean;
  weights: {
    minimizeWidth: number;
    minimizeHeight: number;
    maximizeIntersections: number;
  };
}

const DIRECTIONS = ['right', 'down'] as const;
type Direction = (typeof DIRECTIONS)[number];

interface CharLocation {
  row: number;
  col: number;
}

interface PlacedChar {
  char: string;
  location: CharLocation;
}

interface WordLocation {
  row: number;
  col: number;
  direction: Direction;
}

interface NotPlacedWord {
  readonly word: string;
  placed: false;
  location: undefined;
  chars: undefined;
}

interface PlacedWord {
  readonly word: string;
  placed: true;
  location: WordLocation;
  chars: PlacedChar[];
}

export type Word = NotPlacedWord | PlacedWord;

type Grid = Record<number, Record<number, string>>;

interface GridDimensions {
  rows: {
    min: number;
    max: number;
    count: number;
  };
  cols: {
    min: number;
    max: number;
    count: number;
  };
}

// eslint-disable-next-line no-irregular-whitespace
// const BLOCKED_CELL_CHAR = '​';
const BLOCKED_CELL_CHAR = '#';

export class CrosswordGenerator {
  constructor(readonly args: CrosswordGeneratorArgs) {}

  private _words: Word[] = [];

  private _grid: Grid = {};

  get words(): Word[] {
    return this._words;
  }

  get grid(): string[][] {
    const out: string[][] = [];

    const {
      rows: { min: rowsMin, max: rowsMax },
      cols: { min: colsMin, max: colsMax },
    } = this.getDimensions();

    for (let r = rowsMin; r <= rowsMax; r++) {
      const row: string[] = [];
      for (let c = colsMin; c <= colsMax; c++) {
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

  get placed(): PlacedWord[] {
    return this._words.filter(CrosswordGenerator.isPlacedWord);
  }

  get notPlaced(): NotPlacedWord[] {
    return this._words.filter(CrosswordGenerator.isNotPlacedWord);
  }

  generate = (): void => {
    this.setup();
    this._words.forEach((word) => {
      if (!word.placed) {
        this.placeWord(word);
      }
    });
  };

  private setup = (): void => {
    this.reset();

    this._words = this.args.words.map((raw) => ({
      word: `${BLOCKED_CELL_CHAR}${raw}${BLOCKED_CELL_CHAR}`,
      placed: false,
      location: undefined,
      chars: undefined,
    }));

    if (this.args.randomizeWords) {
      this._words.sort(() => Math.round(Math.random() * 2 - 1));
    }
  };

  private reset = (): void => {
    this._words = [];
    this._grid = {};
  };

  private placeWord = (toPlace: Word, grid = this._grid): void => {
    const { word } = toPlace;

    // If word has no characters, nothing to place
    if (word.length === 0) return;

    // Empty grid, this is the first word
    if (!grid[0] || !grid[0][0]) {
      this.placeWordAt(toPlace, { row: 0, col: 0, direction: 'right' }, grid);
      return;
    }

    const allPossibleLocations: WordLocation[] = this.findAllPossibleWordLocations(word, grid);

    if (allPossibleLocations.length === 0) {
      toPlace.placed = false;
      return;
    }

    const best = allPossibleLocations.reduce(
      (acc, location) => {
        // Place word, get score, then un-place
        const newChars = this.placeWordAt(toPlace, location, grid);
        const score = this.getScore(grid);
        newChars.forEach(({ location }) => this.clearCharAt(location, grid));

        if (score < acc.score) return { score, location };
        else return acc;
      },
      { score: Infinity, location: allPossibleLocations[0] },
    );

    this.placeWordAt(toPlace, best.location, grid);
  };

  private canPlaceWordAt = (word: string, location: WordLocation, grid = this._grid): boolean => {
    const { row, col, direction } = location;
    const chars = word.split('');

    const charPlacements: { char: string; location: CharLocation }[] = chars.map((char, i) => ({
      char,
      location: {
        row: direction === 'down' ? row + i : row,
        col: direction === 'right' ? col + i : col,
      },
    }));

    // Make sure all characters can be placed individually
    const someCharCantBePlaced = charPlacements.some(
      ({ char, location }) => !this.canPlaceCharAt(char, location, grid),
    );
    if (someCharCantBePlaced) return false;

    // Make sure that the word as a whole doesn't conflict with any neighbors
    const nonBlockCharPlacements = charPlacements.slice(1, -1);
    const nonBlockNeighborLocations: CharLocation[] = nonBlockCharPlacements.flatMap(
      ({ location: { row, col } }) => {
        if (direction === 'down') {
          const left = { row, col: col - 1 };
          const right = { row, col: col + 1 };
          return [left, right];
        } else {
          const up = { col, row: row - 1 };
          const down = { col, row: row + 1 };
          return [up, down];
        }
      },
    );

    // Each neighbor location should either be empty, or part of a word that goes in the opposite direction
    const allNeighborsValid = nonBlockNeighborLocations.every((neighborLocation) => {
      const existing = this.charAt(neighborLocation, grid);
      if (typeof existing === 'undefined') return true;

      const neighborWord = this._words.find(({ placed, chars }) => {
        return (
          placed &&
          chars.find(
            ({ location: { row, col } }) =>
              row === neighborLocation.row && col === neighborLocation.col,
          )
        );
      }) as PlacedWord;

      if (!neighborWord) {
        throw new Error(
          `Unable to find placed word containing character '${existing}' at ${JSON.stringify(
            neighborLocation,
          )}`,
        );
      }

      return neighborWord.location.direction !== direction;
    });

    return allNeighborsValid;
  };

  /** @returns locations of characters */
  private placeWordAt = (
    toPlace: Word,
    location: WordLocation,
    grid = this._grid,
  ): PlacedChar[] => {
    const { word } = toPlace;
    const { row, col, direction } = location;
    const chars = word.split('');

    const charPlacements: PlacedChar[] = chars.map((char, i) => ({
      char,
      location: {
        row: direction === 'down' ? row + i : row,
        col: direction === 'right' ? col + i : col,
      },
    }));

    const newCharPlacements = charPlacements.filter(
      (placement) => this.charAt(placement.location, grid) !== placement.char,
    );

    newCharPlacements.forEach(({ char, location }) => this.placeCharAt(char, location, grid));

    toPlace.placed = true;
    toPlace.location = location;
    toPlace.chars = newCharPlacements;

    return newCharPlacements;
  };

  private canPlaceCharAt = (char: string, location: CharLocation, grid = this._grid): boolean => {
    const { row, col } = location;

    const existing = this.charAt({ row, col }, grid);

    // A blocked character should not exist at this location
    // TODO technically this is allowed for a char placement, but we don't want to allow it to be
    // the only overlap between two words. We can modify findAllPossibleWordLocations to prevent this
    if (existing === BLOCKED_CELL_CHAR) return false;

    // A different character should not already exist at this location
    if (existing && existing !== char) return false;

    return true;
  };

  private placeCharAt = (char: string, location: CharLocation, grid = this._grid): void => {
    if (char.length !== 1) throw new InvalidCharacterError(char);

    if (!this.canPlaceCharAt(char, location, grid)) {
      throw new Error(`Cannot place character '${char}' at ${JSON.stringify(location)}`);
    }

    const { row, col } = location;
    if (!grid[row]) grid[row] = {};
    grid[row][col] = char;
  };

  private clearCharAt = (location: CharLocation, grid = this._grid): void => {
    const { row, col } = location;

    if (row in grid && col in grid[row]) {
      // Delete char in row
      delete grid[row][col];

      // Delete row if empty
      const charsInRow = Object.keys(grid[row]).length;
      if (charsInRow === 0) {
        delete grid[row];
      }
    }
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
      this.canPlaceWordAt(word, location, grid),
    );

    return allPossibleLocations;
  };

  private getDimensions = (grid = this._grid): GridDimensions => {
    const rowLimits = Object.keys(grid)
      .map((s) => parseInt(s))
      .reduce(
        ({ min, max }, curr) => ({
          min: Math.min(min, curr),
          max: Math.max(max, curr),
        }),
        { min: Infinity, max: -Infinity },
      );

    const colLimits = Object.values(grid)
      .flatMap((cols) => Object.keys(cols))
      .map((s) => parseInt(s))
      .reduce(
        ({ min, max }, curr) => ({
          min: Math.min(min, curr),
          max: Math.max(max, curr),
        }),
        { min: Infinity, max: -Infinity },
      );

    return {
      rows: {
        min: rowLimits.min,
        max: rowLimits.max,
        count: rowLimits.max - rowLimits.min,
      },
      cols: {
        min: colLimits.min,
        max: colLimits.max,
        count: colLimits.max - colLimits.min,
      },
    };
  };

  /** Higher is worse */
  private getScore = (grid = this._grid): number => {
    const {
      rows: { count: numRows },
      cols: { count: numCols },
    } = this.getDimensions(grid);

    const { minimizeWidth, minimizeHeight, maximizeIntersections } = this.args.weights;
    const widthScore = numCols * minimizeWidth;
    const heightScore = numRows * minimizeHeight;

    // incentivize less total characters (more overlap)
    const totalCharacters = Object.values(grid)
      .flatMap((row) => Object.values(row))
      .filter((char) => char !== BLOCKED_CELL_CHAR)
      .filter(Boolean).length;
    const charactersScore = totalCharacters * maximizeIntersections;

    return widthScore + heightScore + charactersScore;
  };

  private static isPlacedWord = (word: Word): word is PlacedWord => {
    return word.placed;
  };

  private static isNotPlacedWord = (word: Word): word is NotPlacedWord => {
    return !word.placed;
  };
}

class InvalidCharacterError extends Error {
  constructor(invalidCharacter: unknown) {
    super(`Invalid character ${invalidCharacter}`);
  }
}
