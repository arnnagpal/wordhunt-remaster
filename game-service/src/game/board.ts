import { Board, BoardSolution } from "wordhunt-utils";
import { getPoints } from "wordhunt-utils/src/utils";
import { letterFrequency, dictionary } from "./dictionary";
import { type Position } from "wordhunt-utils";

const minimumPossibleScore = 100000;

export const createBoard = async (size: number) => {
    console.time("createValidBoard");

    console.time("generateBoard");
    let board = generateBoard(size);
    console.timeEnd("generateBoard");

    console.time("solveBoard");
    let solutions = solveBoard(board);
    console.timeEnd("solveBoard");

    let score = solutions.reduce((acc, solution) => acc + solution.points, 0);
    while (score < minimumPossibleScore) {
        console.time("generateBoard");
        board = generateBoard(size);
        console.timeEnd("generateBoard");

        console.time("solveBoard");
        solutions = solveBoard(board);
        console.timeEnd("solveBoard");

        score = solutions.reduce((acc, solution) => acc + solution.points, 0);
    }

    console.timeEnd("createValidBoard");

    board.possible_solutions = solutions;
    board.total_possible_score = score;

    return board;
};

const binarySearch = (arr: number[], target: number): number => {
    let left = 0;
    let right = arr.length - 1;

    while (left < right) {
        const mid = Math.floor((left + right) / 2);
        if (arr[mid] < target) {
            left = mid + 1;
        } else {
            right = mid;
        }
    }

    return left;
};

export const generateBoard = (size: number): Board => {
    const board = new Board(size);
    const letters = Object.keys(letterFrequency);
    const frequencySum = Object.values(letterFrequency).reduce(
        (a, b) => a + b,
        0
    );

    const cumulativeFrequency: number[] = [];
    let sum = 0;

    for (let i = 0; i < letters.length; i++) {
        sum += letterFrequency[letters[i]];
        cumulativeFrequency[i] = sum;
    }

    for (let i = 0; i < size; i++) {
        for (let j = 0; j < size; j++) {
            const rand = Math.floor(Math.random() * frequencySum);
            const k = binarySearch(cumulativeFrequency, rand);
            board.set_from_coords(i, j, letters[k]);
        }
    }

    return board;
};

function backTrack(
    board: Board,
    currentWord: string,
    currentCell: Position,
    visited: Set<string>,
    depth: number,
    foundWord: (arg0: string) => void
) {
    // Check if current word is in dictionary
    if (currentWord.length >= 3 && dictionary.hasSubString(currentWord, true)) {
        // console.log(`backtrack: ${currentWord}, ${currentCell}, ${depth}, ${this.board.length}`)
        foundWord(currentWord);
    }
    depth += 1;
    const adjacent = board.get_adjacent_positions(currentCell);
    for (const nextCell of adjacent) {
        // check if we've visited this cell
        if (visited.has(`${nextCell.x},${nextCell.y}`)) continue;
        const nextLetter = board.get_from_pos(nextCell);
        const nextWord = currentWord + nextLetter;
        // checkc that the next word is a substring in the dictionary
        if (!dictionary.hasSubString(nextWord)) continue;

        visited.add(`${nextCell.x},${nextCell.y}`);
        backTrack(board, nextWord, nextCell, visited, depth, foundWord);
        visited.delete(`${nextCell.x},${nextCell.y}`);
    }
}

export function solveBoard(board: Board): BoardSolution[] {
    const solutions: BoardSolution[] = [];
    const words: string[] = [];
    const foundWord = (word: string) => {
        if (words.indexOf(word) !== -1) return;

        words.push(word);
        solutions.push({ word, points: getPoints(word) });
    };
    // solve using the backtracking algorithm
    for (let x = 0; x < board.size; x++) {
        for (let y = 0; y < board.size; y++) {
            const letter = board.get_from_coords(x, y);
            const visited = new Set<string>();
            visited.add(`${x},${y}`);
            backTrack(board, letter, { x, y }, visited, 0, foundWord);
        }
    }
    return solutions;
}
