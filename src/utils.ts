import { readFileSync, writeFile } from "fs";
import { EOL } from "os";
import { ConfigurationTarget, ExtensionContext, window, workspace } from "vscode";
import type { EditorCallback, GeneratorOptions } from "./abstractions";
import DefaultGeneratorOptions from "./defaultOptions";
import { DefaultThemes } from "./defaultThemes";
import { generate } from "./generator";


/**Gets the currently configured options, or the default.
 * @param context The current vscode extension context.
 */
export function getGeneratorOptions({ extension }: Pick<ExtensionContext, "extension">) {
    return workspace.getConfiguration().get<GeneratorOptions>(extension.packageJSON.name, DefaultGeneratorOptions);
}

/**Asynchronously sets the source paragraphs cached in the global state.
 * @param context The current vscode extension context.
 * @param value The value to be set in the cache.
 */
export function setSourceParagraphs({ extension, globalState }: Pick<ExtensionContext, "extension" | "globalState">, value: string[]) {
    try {
        return globalState.update(`${extension.packageJSON.name}.sourceText`, value);
    } catch (error) {
        console.warn("Failed to set source paragraphs", error);
        return Promise.reject(error);
    }
}

/**Gets the source paragraphs from the cache in the global state;
 * if no source paragraphs are cached, they are generated based on the current configuration, added and returned.
 * @param context The current vscode extension context.
 * @returns All source paragraph strings cached or configured.
 */
export function getSourceParagraphs({ extension, globalState }: Pick<ExtensionContext, "extension" | "globalState">) {
    const key = `${extension.packageJSON.name}.sourceText`;
    let text = globalState.get<string[]>(key);
    if (!text) {
        text = generate(workspace.getConfiguration().get<GeneratorOptions>(extension.packageJSON.name, DefaultGeneratorOptions));
        setSourceParagraphs({ extension, globalState }, text);
    }

    return text;
}

/**Asynchronously converts one or more plain text files selected by the user into paragraph arrays, combines them and saves the resulting JSON to a single file also selected by the user.*/
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

    const
        blocksOfNonWhitespaceLines = /(?:^|(?:\n|\r\n){2,})(.*?)(?=(?:\n|\r\n){2,}|$)/gis,
        lineEndings = /(?:\r\n|\n|\r|\f)+/gmi;

    let result = <string[]>[];
    paths.forEach((uri, i) => {
        const
            content = readFileSync(uri.fsPath).toString("utf-8"),
            paragraphs = Array.from(content.matchAll(blocksOfNonWhitespaceLines))
                .map(p => p[1].replace(lineEndings, EOL).trim());

        result.push(...paragraphs);
    });

    writeFile(outputPath.fsPath, JSON.stringify(result), () => window.showInformationMessage("File saved", outputPath.fsPath));
}

/**Asynchronously sets the preferred default theme and pre-loads the relevant source paragraphs into the global state.
 * @param context The current vscode extension context.
 * @param target The configuration target scope which should be updated; by default the global configuration is used.
 */
export async function setDefaultTheme(context: Pick<ExtensionContext, "extension" | "globalState">, target = ConfigurationTarget.Global) {
    const theme = await window.showQuickPick(DefaultThemes);
    if (theme) {
        await workspace.getConfiguration().update(`${context.extension.packageJSON.name}.defaultTheme`, theme, target);
        await setSourceParagraphs(context, generate(getGeneratorOptions(context)));
        console.info("Default theme updated to %s", theme);
    }
}

/**Creates an editor callback which may be used to insert a string at the current cursor position.
 * @param getValue A factory implementation which when invoked provides the string to insert.
 */
export function insertAtCursor(getValue: () => string): EditorCallback {
    return (editor, edit) => {
        const position = editor.selection?.active;
        if (position) {
            edit.insert(position, getValue());
        }
    };
}