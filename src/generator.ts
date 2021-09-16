import { randomInt } from "crypto";
import { readFileSync } from "fs";
import { GlobSync } from "glob";
import { GeneratorOptions } from "./abstractions";

export function generate(options: GeneratorOptions): string[] {
    let customParagraphs: string[] = [];

    if (options.customDataRoot) {
        const glob = new GlobSync("./**/*.json", { cwd: options.customDataRoot, absolute: true });
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

    return customParagraphs.length
        ? customParagraphs
        : require(`./defaultThemes/${options.defaultTheme}.json`);
}

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