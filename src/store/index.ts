import { randomInt } from "crypto";
import { readFileSync } from "fs";
import { GlobSync } from "glob";
import type { DefaultTheme, TextStore } from "./abstractions";
import { notifyAllErrors } from "./decorators";



export function pickRandom<T = string>(options: T[]): T {
    return options[randomInt(0, options.length)];
}

const matchSentences = /\b.+?(?:[\.!?]|(?=[\r\n\f]))/gi;
export function pickRandomSentence(sourceText: string): string {
    const matches = matchSentences.exec(sourceText);
    if (!matches) {
        throw new Error("Unable to match sentences in source text:\r\n" + sourceText);
    }

    return pickRandom(matches);
}



@notifyAllErrors
export class DirectoryTextStore implements TextStore {
    private readonly _paragraphs: string[];

    constructor(private readonly _customDataRoot?: string, private readonly _defaultTheme?: DefaultTheme) {
        let customParagraphs: string[] = [];

        if (this._customDataRoot) {
            const glob = new GlobSync("./**/*.json", { cwd: this._customDataRoot, absolute: true });
            glob.found
                .forEach(path => {
                    const
                        file = readFileSync(path, ""),
                        paragraphs = JSON.parse(file) || {};

                    if (paragraphs?.length) {
                        customParagraphs = [
                            ...customParagraphs,
                            ...paragraphs
                        ];
                    }
                });
        }

        this._paragraphs = customParagraphs.length
            ? customParagraphs
            : require(`./defaultThemes/${_defaultTheme}`);
    }

    getSentence = () => pickRandomSentence(pickRandom(this._paragraphs));
    getParagraph = () => pickRandom(this._paragraphs);
}