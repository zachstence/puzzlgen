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

interface WordLocation extends CharLocation {
  direction: Direction;
}

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

const BLOCKED_CELL_CHAR = '#';

export class CrosswordGenerator {
  constructor(readonly args: CrosswordGeneratorArgs) {
    this._words = args.words.map((word) => `${BLOCKED_CELL_CHAR}${word}${BLOCKED_CELL_CHAR}`);

    if (args.randomizeWords) {
      this._words.sort(() => Math.round(Math.random() * 2 - 1));
    }
  }

  private _words: string[];

  private _grid: Grid = {};

  private _cantPlace: string[] = [];

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
        if (char /*&& char !== BLOCKED_CELL_CHAR*/) {
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
    this._words.forEach((word) => {
      if (word === `${BLOCKED_CELL_CHAR}input${BLOCKED_CELL_CHAR}`)
        console.group(`Placing ${word}`);
      else console.groupCollapsed(`Placing ${word}`);
      this.placeWord(word);
      console.groupEnd();
    });
  };

  private placeWord = (word: string, grid = this._grid): void => {
    // If word has no characters, nothing to place
    if (word.length === 0) return;

    // Empty grid, this is the first word
    if (!grid[0] || !grid[0][0]) {
      this.placeWordAt(word, { row: 0, col: 0, direction: 'right' }, grid);
      return;
    }

    const allPossibleLocations: WordLocation[] = this.findAllPossibleWordLocations(word, grid);

    if (allPossibleLocations.length === 0) {
      this._cantPlace.push(word);
      return;
    }

    const best = allPossibleLocations.reduce(
      (acc, location) => {
        const tempGrid = this.copyGrid(this._grid);
        this.placeWordAt(word, location, tempGrid);
        const score = this.getScore(tempGrid);
        console.log({ score, location });
        if (score < acc.score) return { score, location };
        else return acc;
      },
      { score: Infinity, location: allPossibleLocations[0] },
    );

    console.log('best', word, best.location);

    // For now, place at first location
    this.placeWordAt(word, best.location, grid);
  };

  private canPlaceWordAt = (word: string, location: WordLocation, grid = this._grid): boolean => {
    const { row, col, direction } = location;
    const chars = word.split('');
    const canPlace = chars.every((char, i) =>
      this.canPlaceCharAt(
        char,
        {
          row: direction === 'down' ? row + i : row,
          col: direction === 'right' ? col + i : col,
        },
        grid,
      ),
    );

    if (location.row === -9 && location.col === -2 && location.direction === 'right') {
      console.log('canPlaceWordAt', { word, location, canPlace, grid });
    }

    return canPlace;
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
          this.charAt({ row: row + rowOffset, col: col + colOffset }, grid),
        )
        .filter((char) => char !== BLOCKED_CELL_CHAR)
        .filter(Boolean) as string[];
      // If the group has 3 characters, adding a char would make a 2x2 group
      return charsInGroup.length === 3;
    });
    if (formsA2x2) {
      return false;
    }

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

    allLocations.forEach((location) => {
      if (location.row === -9 && location.col === -2 && location.direction === 'right') {
        console.log(location, this.canPlaceWordAt(word, location, grid));
      }
    });

    const allPossibleLocations = allLocations.filter((location) =>
      this.canPlaceWordAt(word, location, grid),
    );

    console.log({ allPossibleLocations });

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

  private copyGrid = (grid: Grid): Grid => {
    const out: Grid = {};
    Object.entries(grid).forEach(([key, value]) => (out[parseInt(key)] = { ...value }));
    return out;
  };
}

class InvalidCharacterError extends Error {
  constructor(invalidCharacter: unknown) {
    super(`Invalid character ${invalidCharacter}`);
  }
}
