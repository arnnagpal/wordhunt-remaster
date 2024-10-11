export type ScoreEvent = {
	selectionStatus: WordSelectionState;
	word: string;
	points: number;
};

export type SelectionEvent = {
	letter: string;
	letterRow: number;
	letterColumn: number;
	letterIndex: number;

	selectionStatus: WordSelectionState;
	wholeWord: string;
	points: number;
};

export type TimeOverEvent = {
	words: number;
	score: number;
};

export enum Direction {
	Up,
	Down,
	Left,
	Right
}

export enum WordSelectionState {
	NewWord,
	OldWord,
	NoWord
}
