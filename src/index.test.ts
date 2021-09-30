import { mocked } from "ts-jest/utils";
import { Uri } from "vscode";
import { activate, deactivate } from ".";
import { setSourceParagraphs } from "./utils";


jest
    .mock("vscode", () => ({
        workspace: {
            getConfiguration: jest.fn()
        },
        window: {
            showOpenDialog: jest.fn(),
            showSaveDialog: jest.fn(),
            showQuickPick: jest.fn(),
            showInformationMessage: jest.fn(),
            showErrorMessage: jest.fn(),
        },
        commands: {
            registerCommand: jest.fn(),
            registerTextEditorCommand: jest.fn()
        },
        Uri: {
            parse: jest.fn()
        },
        ConfigurationTarget: {
            Global: 1
        }
    }))
    .mock("./utils.ts", () => ({
        generate: jest.fn(),
        getGeneratorOptions: jest.fn().mockReturnValue(jest.requireActual("./defaultOptions.ts").default),
        setSourceParagraphs: jest.fn(),
        insertAtCursor: jest.fn().mockReturnValue(jest.fn())
    }));

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


describe(activate, () => {
    it("configures settings sync and pre-loads source text", async () => {
        const context = { extension: mockExtension, globalState: mockGlobalState, subscriptions: [] };


        await activate(context as any);


        expect(context.globalState.setKeysForSync).toBeCalled();
        expect(mocked(setSourceParagraphs)).toBeCalled();
    });
});

describe(deactivate, () => it("performs no clean-up (nothing to be done)", () => {
    deactivate();
    
    expect(deactivate.toString()).toMatch(/^function.*?\(.*?\)\s*{\s*\}/m);
}));