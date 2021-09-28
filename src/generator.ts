import { randomInt } from "crypto";
import { readFileSync } from "fs";
import { GlobSync } from "glob";
import type { GeneratorOptions } from "./abstractions";

/**Returns source strings matching the options provided
 * @param {GeneratorOptions} options The options to be used when sourcing the strings
 * @returns {string[]} All possible strings for the provided options
 */
export function generate(options: GeneratorOptions): string[] {
    let customParagraphs: string[] = [];

    if (options.customDataRoot) {
        const glob = new GlobSync("./**/*.json", { cwd: options.customDataRoot, absolute: true });
        glob.found
            .forEach(path => {
                const
                    file = readFileSync(path, ""),
                    paragraphs = (file && JSON.parse(file)) || [];

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

/**Pick one item from an array at random
 * @param {T[]} options The set of items to pick from
 * @returns {T} A random item from the array provided
 */
export function pickRandom<T = string>(options: T[]): T {
    return options[randomInt(0, options.length)];
}

const matchSentences = /\b.+?(?:[\.!?]|(?=[\r\n\f]))/gi;
/**Returns a single sentence at random from the source text
 * @param {string} sourceText The text to pick from
 * @returns {string} A single sentence picked at random
 */
export function pickRandomSentence(sourceText: string): string {
    const matches = matchSentences.exec(sourceText);
    if (!matches) {
        throw new Error("Unable to match sentences in source text:\r\n" + sourceText);
    }

    return pickRandom(matches);
}