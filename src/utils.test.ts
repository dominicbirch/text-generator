import { readFileSync, writeFile } from "fs";
import { mocked } from "ts-jest/utils";
import { ExtensionContext, Uri, window, workspace } from "vscode";
import DefaultGeneratorOptions from "./defaultOptions";
import { DefaultThemes } from "./defaultThemes";
import { generate } from "./generator";
import { getGeneratorOptions, getSourceParagraphs, insertAtCursor, parseAndSaveSourceParagraphs, setDefaultTheme, setSourceParagraphs } from "./utils";


jest
    .mock("vscode", () => ({
        workspace: {
            getConfiguration: jest.fn()
        },
        window: {
            showOpenDialog: jest.fn(),
            showSaveDialog: jest.fn(),
            showInformationMessage: jest.fn(),
            showQuickPick: jest.fn()
        },
        Uri: {
            parse: jest.fn()
        },
        ConfigurationTarget: {
            Global: 1
        }
    }))
    .mock("fs")
    .mock("./generator.ts");

function createFileUri(fsPath: string): Uri {
    return {
        fsPath
    } as any;
}

const
    mockExtension = {
        id: "",
        extensionPath: "",
        extensionKind: 1,
        extensionUri: Uri.parse("https://localhost"),
        isActive: true,
        exports: [],
        activate: jest.fn(),
        packageJSON: { name: "test-extension" },
    },
    mockGlobalState = {
        keys: jest.fn(),
        get: jest.fn(),
        update: jest.fn(),
        setKeysForSync: jest.fn()
    };

describe(getGeneratorOptions, () => {
    it("provides the generator options or DefaultGeneratorOptions from the current workspace", () => {
        const
            context: Pick<ExtensionContext, "extension"> = { extension: mockExtension },
            getConfigurationMock = mocked(workspace.getConfiguration),
            getSectionMock = jest.fn(() => DefaultGeneratorOptions);

        getConfigurationMock.mockReturnValue({
            get: getSectionMock
        } as any);


        const result = getGeneratorOptions(context);


        expect(result).toBe(DefaultGeneratorOptions);
        expect(getConfigurationMock).toBeCalled();
        expect(getSectionMock).toBeCalledWith(context.extension.packageJSON.name, DefaultGeneratorOptions);
    });
});

describe(setSourceParagraphs, () => {
    it("updates the global state with the sources provided", async () => {
        const
            context: Pick<ExtensionContext, "extension" | "globalState"> = {
                extension: mockExtension,
                globalState: mockGlobalState
            },
            value = ["one", "two", "three"];


        await setSourceParagraphs(context, value);


        expect(mockGlobalState.update).toBeCalledWith(`${mockExtension.packageJSON.name}.sourceText`, value);
    });
    it("re-throws errors while updating", async () => {
        const
            context: Pick<ExtensionContext, "extension" | "globalState"> = {
                extension: mockExtension,
                globalState: {
                    ...mockGlobalState,
                    update: jest.fn(() => {
                        throw new Error("this is a test");
                    })
                }
            },
            value = ["test"];

        expect(setSourceParagraphs(context, value)).rejects.toEqual(new Error("this is a test"));
    });
});

describe(getSourceParagraphs, () => {
    it("returns sources from the global state when they are available", async () => {
        const
            context: Pick<ExtensionContext, "extension" | "globalState"> = {
                extension: mockExtension,
                globalState: mockGlobalState
            },
            value = ["Perhaps it's time I introduced you. This is the most unique hacker in the history of cyber-brain crime. The Puppet Master. I believe you in Section 9 ran into him in that case involving the ghost-hack on the Foreign Minister's translatior. We in Section 6 have been pursuing the Puppet Master with the utmost urgency since he first appeared."];

        mocked(context.globalState.get).mockReturnValue(value);


        const result = getSourceParagraphs(context);


        expect(result).toBe(value);
    });
    it("generates and sends sources to the global state when unavailable", async () => {
        const
            context: Pick<ExtensionContext, "extension" | "globalState"> = {
                extension: mockExtension,
                globalState: mockGlobalState
            },
            value = ["jumping merrily along hand in hand, in couples: they were all ornamented with hearts."];

        mocked(context.globalState.get).mockReturnValue(null);
        mocked(generate).mockReturnValue(value);


        const result = getSourceParagraphs(context);


        expect(result).toBe(value);
    });
});

describe(parseAndSaveSourceParagraphs, () => {
    it("handles cancelling out of open dialog", async () => {
        const
            openMock = mocked(window.showOpenDialog),
            saveMock = mocked(window.showSaveDialog),
            readMock = mocked(readFileSync),
            writeMock = mocked(writeFile);


        await parseAndSaveSourceParagraphs();


        expect(openMock).toHaveBeenCalled();

        expect(saveMock).toBeCalledTimes(0);
        expect(readMock).toHaveBeenCalledTimes(0);
        expect(writeMock).toHaveBeenCalledTimes(0);
    });
    it("handles cancelling out of save dialog", async () => {
        const
            openMock = mocked(window.showOpenDialog)
                .mockReturnValue(Promise.resolve([Uri.parse("one.json"), Uri.parse("two.json"), Uri.parse("three.json")])),
            saveMock = mocked(window.showSaveDialog),
            readMock = mocked(readFileSync),
            writeMock = mocked(writeFile);


        await parseAndSaveSourceParagraphs();


        expect(openMock).toHaveBeenCalled();
        expect(saveMock).toHaveBeenCalled();

        expect(readMock).toHaveBeenCalledTimes(0);
        expect(writeMock).toHaveBeenCalledTimes(0);
    });
    it("combines text from all input files into a single custom source file", async () => {
        const
            openMock = mocked(window.showOpenDialog)
                .mockReturnValue(Promise.resolve([
                    createFileUri("one.json"),
                    createFileUri("two.json"),
                    createFileUri("three.json")
                ])),
            saveMock = mocked(window.showSaveDialog)
                .mockReturnValue(Promise.resolve(createFileUri("result.json"))),
            readMock = mocked(readFileSync)
                .mockReturnValueOnce("one")
                .mockReturnValueOnce("two")
                .mockReturnValueOnce("three"),
            writeMock = mocked(writeFile);


        await parseAndSaveSourceParagraphs();


        expect(openMock)
            .toHaveBeenCalled();
        expect(saveMock)
            .toHaveBeenCalled();
        expect(readMock)
            .toHaveBeenCalled();


        expect(readMock)
            .toHaveBeenNthCalledWith(1, "one.json");
        expect(readMock)
            .toHaveBeenNthCalledWith(2, "two.json");
        expect(readMock)
            .toHaveBeenNthCalledWith(3, "three.json");

        expect(writeMock)
            .toHaveBeenCalledWith("result.json", JSON.stringify(["one", "two", "three"]), expect.anything());
    });
});

describe(setDefaultTheme, () => {
    it("offers a selection from the available defaults which may be cancelled", async () => {
        const
            context: Pick<ExtensionContext, "extension" | "globalState"> = {
                extension: mockExtension,
                globalState: mockGlobalState
            },
            quickPickMock = mocked(window.showQuickPick);


        await setDefaultTheme(context);


        expect(quickPickMock).toHaveBeenCalledWith(DefaultThemes);
        expect(mocked(workspace.getConfiguration)).toHaveBeenCalledTimes(0);
    });

    it("updates the global settings source text to match the chosen theme", async () => {
        const
            context: Pick<ExtensionContext, "extension" | "globalState"> = {
                extension: mockExtension,
                globalState: mockGlobalState
            },
            quickPickMock = mocked(window.showQuickPick)
                .mockReturnValue(Promise.resolve(DefaultThemes[1] as any)),
            configUpdateMock = jest.fn(),
            getConfigMock = mocked(workspace.getConfiguration)
                .mockReturnValue({
                    update: configUpdateMock,
                    get: jest.fn(),
                    has: jest.fn(),
                    inspect: jest.fn()
                });


        await setDefaultTheme(context);


        expect(quickPickMock).toHaveBeenCalledWith(DefaultThemes);
        expect(getConfigMock).toHaveBeenCalled();
        expect(configUpdateMock).toHaveBeenCalledWith(`${context.extension.packageJSON.name}.defaultTheme`, DefaultThemes[1], 1);
        expect(mocked(context.globalState.update)).toHaveBeenCalledWith(`${context.extension.packageJSON.name}.sourceText`, expect.any(Array));
    });
});

describe(insertAtCursor, () => {
    it("creates a callback which inserts the value at the current cursor position", () => {
        const
            editor = {
                selection: {
                    active: {
                        line: 1337,
                        character: 7
                    }
                }
            },
            edit = {
                insert: jest.fn()
            },
            value = "Batou, you and the others go on ahead and gather information on how extensively the refugees are armed. Ishikawa and I will dive the refugees' net and rendezvous with you after we've pinpointed Kuze's location.",
            subject = insertAtCursor(() => value);


        subject(editor as any, edit as any);


        expect(edit.insert).toBeCalledWith(editor.selection.active, value);
    });

    it("does not attempt insert when there is no active selection", () => {
        const
            editor = {},
            edit = {
                insert: jest.fn()
            },
            value = "Batou, you and the others go on ahead and gather information on how extensively the refugees are armed. Ishikawa and I will dive the refugees' net and rendezvous with you after we've pinpointed Kuze's location.",
            subject = insertAtCursor(() => value);


        subject(editor as any, edit as any);


        expect(edit.insert).toBeCalledTimes(0);
    });
});