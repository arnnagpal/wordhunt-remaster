class TrieNode {
    parent: TrieNode | null;
    children: { [key: string]: TrieNode };
    letter: string;
    hasChildren: boolean;
    isTerminal: boolean;

    constructor(parent: TrieNode | null, letter: string) {
        this.parent = parent;
        this.children = {};
        this.letter = letter;
        this.hasChildren = false;
        this.isTerminal = false;
    }

    /**
     * Does this node have a child with letter
     *
     * @param {string} letter
     * @returns boolean
     * @memberof TrieNode
     */
    hasChild(letter: string | number) {
        return !!this.children[letter];
    }

    /**
     * Get the child or undefined
     *
     * @param {string} letter
     * @returns TrieNode
     * @memberof TrieNode
     */
    getChild(letter: string | number) {
        return this.children[letter];
    }

    /**
     * Inserts the child into this nodes children
     *
     * @param {string} letter
     * @param {TrieNode} node
     * @returns TrieNode
     * @memberof TrieNode
     */
    setChild(letter: string | number, node: TrieNode) {
        this.hasChildren = true;
        return (this.children[letter] = node);
    }

    /**
     * Useful for printing. Returns an array of all children indexes.
     *
     * @returns string[]
     * @memberof TrieNode
     */
    getChildrenList() {
        return Object.keys(this.children).map((l) => l);
    }
}

export class Trie {
    root: TrieNode;
    length: number = 0;

    /**
     *Creates an instance of Trie.
     * @param {string[]} words
     * @memberof Trie
     */
    constructor(words: string[] = []) {
        this.root = new TrieNode(null, "root");

        words.forEach((w) => this.addWord(w));
    }

    /**
     * Adds a word to the Trie
     *
     * @param {string} word
     * @memberof Trie
     */
    addWord(word: string) {
        word = word.toLowerCase();
        let current = this.root;
        const letters = word.split("");
        for (const letter of letters) {
            if (!current.hasChild(letter)) {
                current.setChild(letter, new TrieNode(current, letter));
            }
            current = current.getChild(letter);
        }
        current.isTerminal = true;
        this.length++;
    }

    /**
     * Checks if the substring exist in the trie
     *
     * @param {string} word
     * @param {boolean} isTerminal
     * @returns boolean
     * @memberof Trie
     */
    hasSubString(word: string, isTerminal: boolean = false) {
        word = word.toLowerCase();
        let current = this.root;
        const letters = word.split("");
        for (const letter of letters) {
            if (!current.hasChild(letter)) {
                return false;
            }
            current = current.getChild(letter);
        }
        // ensure current is terminal;
        if (isTerminal) return current.isTerminal;
        return true;
    }

    toJSON() {
        const serialize = (node: TrieNode): any => {
            const children: { [key: string]: any } = {};
            for (const [letter, childNode] of Object.entries(node.children)) {
                children[letter] = serialize(childNode);
            }
            return {
                letter: node.letter,
                isTerminal: node.isTerminal,
                children: children,
            };
        };

        return JSON.stringify(serialize(this.root));
    }

    static fromJSON(data: string) {
        const deserialize = (
            nodeData: any,
            parent: TrieNode | null
        ): TrieNode => {
            const node = new TrieNode(parent, nodeData.letter);
            node.isTerminal = nodeData.isTerminal;
            for (const [letter, childData] of Object.entries(
                nodeData.children
            )) {
                node.setChild(letter, deserialize(childData, node));
            }
            return node;
        };

        const rootData = JSON.parse(data);
        const trie = new Trie();
        trie.root = deserialize(rootData, null);
        return trie;
    }
}

export const dictionary = new Trie();

export const letterFrequency: {
    [key: string]: number;
} = {};
