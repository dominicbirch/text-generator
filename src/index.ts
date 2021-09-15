import { readFileSync, writeFile } from 'fs';
import { EOL } from 'os';
import { commands, env, ExtensionContext, window, workspace } from 'vscode';
import { DirectoryTextStore } from './store';
import type { EditorCallback, TextStore, WorkspaceOptions } from "./store/abstractions";

const extensionName = "text-generator";
let store: TextStore;

export function insertTextAtCursor(getValue: () => string): EditorCallback {
	return function (editor, edit) {
		const position = editor.selection.active;

		if (position) {
			edit.insert(position, getValue());
		} else {
			window.showInformationMessage("Unable to determine cursor position, check the position in the text editor");
		}
	};
}

export function copyToClipboard(getValue: () => string) {
	return function () {
		env.clipboard.writeText(getValue());
	};
}


export function activate(context: ExtensionContext) {
	try {
		const
			config = workspace.getConfiguration(),
			{ customDataRoot, defaultTheme } = config.get<WorkspaceOptions>(extensionName, {});

		store = new DirectoryTextStore(customDataRoot, defaultTheme);
	} catch (err) {
		window.showErrorMessage("Failed to initialize store", String(err));

		return;
	}

	context.subscriptions.push(
		commands.registerTextEditorCommand(`${extensionName}.InsertSentence`, insertTextAtCursor(store.getSentence)),
		commands.registerTextEditorCommand(`${extensionName}.InsertParagraph`, insertTextAtCursor(store.getParagraph)),

		commands.registerCommand(`${extensionName}.CopySentence`, copyToClipboard(store.getSentence)),
		commands.registerCommand(`${extensionName}.CopyParagraph`, copyToClipboard(store.getParagraph)),

		commands.registerCommand(`${extensionName}.ChangeTheme`, () => {
			window.showQuickPick([
				"Alice in wonderland",
				"Lorem ipsum"
			]);
		}),

		commands.registerCommand(`${extensionName}.ParseParagraphs`, () => window.showOpenDialog({
			canSelectFiles: true,
			canSelectFolders: false,
			canSelectMany: true,
			title: "Select one or more source texts",
			filters: {
				"Plain Text": ["txt"]
			}
		}).then(paths => {
			if (!paths) { return; }

			window.showSaveDialog({
				title: "Save output",
				filters: {
					"JSON": ["json"]
				}
			}).then(outputPath => {
				if (!outputPath) { return; }

				let result = <string[]>[];
				const
					blocksOfNonWhitespaceLines = /(?:^|(?:\n|\r\n){2,})(.*?)(?=(?:\n|\r\n){2,}|$)/gis,
					lineEndings = /(?:\r\n|\n|\r|\f)+/gmi;

				paths.forEach(uri => {
					const
						content = readFileSync(uri.fsPath).toString("utf-8"),
						paragraphs = Array.from(content.matchAll(blocksOfNonWhitespaceLines)).map(p => p[1].replace(lineEndings, EOL).trim());

					result.push(...paragraphs);
				});

				writeFile(outputPath.fsPath, JSON.stringify(result), () => window.showInformationMessage("File saved to:", outputPath.fsPath));
			})
		}, error => window.showErrorMessage(String(error)))),
	);
}

export function deactivate() { }
