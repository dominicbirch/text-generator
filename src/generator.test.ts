import assert = require("assert");
import { readFileSync } from "fs";
import { GlobSync } from "glob";
import { mocked } from 'ts-jest/utils';
import { generate, pickRandom, pickRandomSentence } from "./generator";

jest.mock("glob");
jest.mock("fs");

describe(generate, () => {
    it("provides the correct default theme based on options", () => {
        const
            ghost = generate({
                defaultTheme: "Ghost in the Shell"
            }),
            alice = generate({
                defaultTheme: "Alice in Wonderland"
            });

        expect(ghost).toBe(require("./defaultThemes/Ghost in the Shell.json"));
        expect(alice).toBe(require("./defaultThemes/Alice in Wonderland.json"));
    });

    it("provides custom themes from configured directories", async () => {
        const
            globMock = mocked(GlobSync),
            readFileSyncMock = mocked(readFileSync),
            matches = ["test1.json", "test2.json", "test3.json", "empty.json"];

        globMock.prototype.found = matches;
        readFileSyncMock.mockImplementation((p, o) => p === "empty.json" ? "" : `[\"${p}\"]`)


        const result = generate({
            customDataRoot: "/some/custom/path/"
        });


        expect(result?.length).toBe(matches.length - 1);
        expect(new Set(result).size).toEqual(result.length);
        expect(readFileSyncMock).toBeCalledTimes(matches.length);
    });
});

describe(pickRandom, () => {
    it("returns randomly picked items unchanged", async () => {
        const source = ["Smack-dab in the middle of a situation overlooked by fools."];


        const result = pickRandom(source);


        expect(result).toBe(source[0]);
    });

    it("picks items from the source sequence at random", async () => {
        const source = await import("./defaultThemes/Alice in Wonderland.json");
        let results: string[] = [];


        for (let i = 0; i < 3; i++) {
            results.push(pickRandom(source));
        }


        expect(results).toHaveLength(3);
        expect(new Set(results).size).toEqual(results.length); // only unique items
    });
});

describe(pickRandomSentence, () => {
    it("throws if source string contains no sentences to match", () =>
        assert.throws(() => pickRandomSentence("")));

    it("handles picking from a single sentence", () => {
        const source = "Time is a human construct.";


        const result = pickRandomSentence(source);


        expect(result).toEqual(source);
    });

    it("picks sentences from the source string at random", () => {
        const source = "Our people stay out of this, got it? Did you check up on the enemy's parallel circuitry? The on board Als of 20 million vehicles in this city are in enemy control. Including my car. The system is so overpowered we can hardly manage to move one chopper. But there is a way to turn the tables, if only temporarily.";
        let results: string[] = [];


        for (let i = 0; i < 3; i++) {
            results.push(pickRandomSentence(source));
        }

        expect(results?.length).toEqual(3);
        expect(new Set(results).size).toEqual(results?.length);
    });
});