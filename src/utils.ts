import { readFileSync, writeFile } from "fs";
import { EOL } from "os";
import { ExtensionContext, ProgressLocation, window, workspace } from "vscode";
import type { EditorCallback, GeneratorOptions } from "./abstractions";
import DefaultGeneratorOptions from "./defaultOptions";
import { generate } from "./generator";


export function getGeneratorOptions({ extension }: Pick<ExtensionContext, "extension">) {
    return workspace.getConfiguration().get<GeneratorOptions>(extension.packageJSON.name, DefaultGeneratorOptions);
}


export function setSourceParagraphs({ extension, globalState }: Pick<ExtensionContext, "extension" | "globalState">, value: string[]) {
    try {
        return globalState.update(`${extension.packageJSON.name}.sourceText`, value);
    } catch (error) {
        console.warn("Failed to set source paragraphs", error);
        return Promise.reject(error);
    }
}

export function getSourceParagraphs({ extension, globalState }: Pick<ExtensionContext, "extension" | "globalState">) {
    const key = `${extension.packageJSON.name}.sourceText`;
    let text = globalState.get<string[]>(key);
    if (!text) {
        text = generate(workspace.getConfiguration().get<GeneratorOptions>(extension.packageJSON.name, DefaultGeneratorOptions));
        setSourceParagraphs({ extension, globalState }, text);
    }

    return text;
}

export async function parseAndSaveSourceParagraphs(): Promise<void> {
    const paths = await window.showOpenDialog({
        canSelectFiles: true,
        canSelectFolders: false,
        canSelectMany: true,
        title: "Select one or more source texts",
        filters: {
            "Plain Text": ["txt"]
        }
    });
    if (!paths?.length) { return; }

    const outputPath = await window.showSaveDialog({
        title: "Save output",
        filters: {
            "JSON": ["json"]
        }
    });
    if (!outputPath) { return; }
    
    await window.withProgress({
        title: "Parsing and saving new generator text",
        cancellable: true,
        location: ProgressLocation.Notification
    }, async ({ report }, { isCancellationRequested }) => {
        const
            blocksOfNonWhitespaceLines = /(?:^|(?:\n|\r\n){2,})(.*?)(?=(?:\n|\r\n){2,}|$)/gis,
            lineEndings = /(?:\r\n|\n|\r|\f)+/gmi;

        let result = <string[]>[];
        paths.forEach((uri, i) => {
            if (isCancellationRequested) { return; }

            report({ message: `Processing ${uri.path}`, increment: i / paths.length });
            debugger;
            const
                content = readFileSync(uri.fsPath).toString("utf-8"),
                paragraphs = Array.from(content.matchAll(blocksOfNonWhitespaceLines))
                    .map(p => p[1].replace(lineEndings, EOL).trim());

            result.push(...paragraphs);
        });

        if (isCancellationRequested) { return; }

        report({ message: `Writing JSON to ${outputPath.path}`, increment: paths.length - 1 / paths.length });
        writeFile(outputPath.fsPath, JSON.stringify(result), () => window.showInformationMessage("File saved to:", outputPath.fsPath));
        report({ message: `Complete`, increment: 1 });
    });

    await window.showInformationMessage("Result saved", outputPath.fsPath);
}


export function insertAtCursor(getValue: () => string): EditorCallback {
    return (editor, edit) => {
        const position = editor.selection.active;
        if (position) {
            edit.insert(position, getValue());
        }
    };
}