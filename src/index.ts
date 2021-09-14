import { commands, ExtensionContext, env, window, workspace } from 'vscode';
import { DirectoryTextStore } from './store';
import type { EditorCallback, TextStore } from "./store/abstractions";


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
		const { customDataRoot, lastNamesFirst } = workspace.getConfiguration(extensionName) || {};

		store = new DirectoryTextStore(customDataRoot, lastNamesFirst);
	} catch (err) {
		window.showErrorMessage("Failed to initialize store", String(err));

		return;
	}

	context.subscriptions.push(
		commands.registerTextEditorCommand(`${extensionName}.InsertFullName`, insertTextAtCursor(store.getFullName)),
		commands.registerTextEditorCommand(`${extensionName}.InsertFirstName`, insertTextAtCursor(store.getFirstName)),
		commands.registerTextEditorCommand(`${extensionName}.InsertLastName`, insertTextAtCursor(store.getLastName)),

		commands.registerTextEditorCommand(`${extensionName}.InsertSentence`, insertTextAtCursor(store.getSentence)),
		commands.registerTextEditorCommand(`${extensionName}.InsertParagraph`, insertTextAtCursor(store.getParagraph)),

		commands.registerCommand(`${extensionName}.CopyFullName`, copyToClipboard(store.getFullName)),
		commands.registerCommand(`${extensionName}.CopyFirstName`, copyToClipboard(store.getFirstName)),
		commands.registerCommand(`${extensionName}.CopyLastName`, copyToClipboard(store.getLastName)),

		commands.registerCommand(`${extensionName}.CopySentence`, copyToClipboard(store.getSentence)),
		commands.registerCommand(`${extensionName}.CopyParagraph`, copyToClipboard(store.getParagraph)),
	);
}

export function deactivate() { }
