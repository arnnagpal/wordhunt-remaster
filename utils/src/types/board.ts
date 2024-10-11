export interface Position {
    x: number;
    y: number;
}

export interface BoardSolution {
    word: string;
    points: number;
}

export class Board {
    size: number;
    board: string[][];

    possible_solutions: BoardSolution[] = [];
    total_possible_score: number = 0;

    constructor(size: number) {
        this.size = size;

        this.board = [];
        for (let i = 0; i < size; i++) {
            this.board[i] = [];
            for (let j = 0; j < size; j++) {
                this.board[i][j] = "";
            }
        }
    }

    get_from_pos = (pos: Position): string => {
        return this.get_from_coords(pos.x, pos.y);
    };

    get_from_coords = (x: number, y: number): string => {
        return this.board[x][y];
    };

    set_from_pos = (pos: Position, value: string): void => {
        this.set_from_coords(pos.x, pos.y, value);
    };

    set_from_coords = (y: number, x: number, value: string): void => {
        this.board[x][y] = value;
    };

    get_adjacent_positions = (pos: Position): Position[] => {
        const positions: Position[] = [];
        for (let x = pos.x - 1; x <= pos.x + 1; x++) {
            for (let y = pos.y - 1; y <= pos.y + 1; y++) {
                if (
                    x >= 0 &&
                    x < this.size &&
                    y >= 0 &&
                    y < this.size &&
                    (x !== pos.x || y !== pos.y)
                ) {
                    positions.push({ x, y });
                }
            }
        }
        return positions;
    };

    get_adjacent_values = (pos: Position): string[] => {
        return this.get_adjacent_positions(pos).map((pos) =>
            this.get_from_pos(pos)
        );
    };

    get_possible_solutions = (): BoardSolution[] => {
        return this.possible_solutions;
    };

    is_solution = (word: string): boolean => {
        return this.possible_solutions.some(
            (solution) => solution.word.toUpperCase() === word.toUpperCase()
        );
    };

    get_total_possible_score = (): number => {
        return this.total_possible_score;
    };

    toJSON = (): string => {
        return JSON.stringify({
            size: this.size,
            board: this.board,
            possible_solutions: this.possible_solutions,
            total_possible_score: this.total_possible_score,
        });
    };

    static fromJSON = (json: string): Board => {
        const obj = JSON.parse(json);
        const board = new Board(obj.size);
        board.board = obj.board;
        board.possible_solutions = obj.possible_solutions;
        board.total_possible_score = obj.total_possible_score;
        return board;
    };
}
