import type { TextStore } from "./abstractions";
import { randomInt } from "crypto";
import { GlobSync } from "glob";
import { readFileSync } from "fs";

import defaultFirstNames from "./defaultFirstNames";
import defaultLastNames from "./defaultLastNames";
import defaultParas from "./defaultParagraphs";

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
    private readonly _firstNames: string[];
    private readonly _lastNames: string[];
    private readonly _paragraphs: string[];

    constructor(private readonly _customDataRoot?: string, private readonly _lastNamesFirst?: boolean) {
        let
            customFirstNames: string[] = [],
            customLastNames: string[] = [],
            customParagraphs: string[] = [];

        if (this._customDataRoot) {
            const glob = new GlobSync("./**/*.json", { cwd: this._customDataRoot, absolute: true });

            glob.found
                .forEach(path => {
                    const
                        file = readFileSync(path, ""),
                        { firstNames, lastNames, paragraphs } = JSON.parse(file) || {};

                    if (firstNames?.length) {
                        customFirstNames = [
                            ...customFirstNames,
                            ...firstNames
                        ];
                    }

                    if (lastNames?.length) {
                        customLastNames = [
                            ...customLastNames,
                            ...lastNames
                        ];
                    }

                    if (paragraphs?.length) {
                        customParagraphs = [
                            ...customParagraphs,
                            ...paragraphs
                        ];
                    }
                });
        }

        this._firstNames = customFirstNames.length ? customFirstNames : defaultFirstNames;
        this._lastNames = customLastNames.length ? customLastNames : defaultLastNames;
        this._paragraphs = customParagraphs.length ? customParagraphs : defaultParas;
    }


    getFullName = () => this._lastNamesFirst ? `${pickRandom(this._lastNames)} ${pickRandom(this._firstNames)}` : `${pickRandom(this._firstNames)} ${pickRandom(this._lastNames)}`;
    getFirstName = () => pickRandom(this._firstNames);
    getLastName = () => pickRandom(this._lastNames);

    getSentence = () => pickRandomSentence(pickRandom(this._paragraphs));
    getParagraph = () => pickRandom(this._paragraphs);
}