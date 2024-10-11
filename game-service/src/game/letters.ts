import { dictionary, letterFrequency } from "./dictionary";

export async function loadDictionary() {
    const dictionaryFile = Bun.file("dictionary/csw21.json");

    const text = await dictionaryFile.json(); // json array

    text.forEach((word: string) => {
        dictionary.addWord(word);
    });

    console.log("dictionary loaded");
    console.log("imported dictionary length: ", text.length);
    console.log("loaded dictionary length: ", dictionary.length);

    console.log("loading letter frequency file");
    const letterFrequencyFile = Bun.file("dictionary/letter_distribution.json");
    const letterFrequencyJson = await letterFrequencyFile.json();

    Object.keys(letterFrequencyJson).forEach((key) => {
        letterFrequency[key] = letterFrequencyJson[key];
    });

    console.log("letter frequency loaded");
    console.log("letter frequency: ", letterFrequency);
}
