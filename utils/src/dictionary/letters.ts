import { readFile } from "fs/promises";
import { dictionary, letterFrequency } from "./dictionary";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

export async function loadDictionary() {
    const dictionaryFile = await readFile(
        __dirname + "/../../dictionary/csw21.json",
        {
            encoding: "utf8",
        }
    );

    const text = JSON.parse(dictionaryFile); // json array

    text.forEach((word: string) => {
        dictionary.addWord(word);
    });

    console.log("dictionary loaded");
    console.log("imported dictionary length: ", text.length);
    console.log("loaded dictionary length: ", dictionary.length);

    console.log("loading letter frequency file");
    const letterFrequencyFile = await readFile(
        __dirname + "/../../dictionary/letter_distribution.json",
        {
            encoding: "utf8",
        }
    );
    const letterFrequencyJson = JSON.parse(letterFrequencyFile);

    Object.keys(letterFrequencyJson).forEach((key) => {
        letterFrequency[key] = letterFrequencyJson[key];
    });

    console.log("letter frequency loaded");
    console.log("letter frequency: ", letterFrequency);
}
