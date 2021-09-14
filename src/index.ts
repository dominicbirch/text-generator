import { commands, ExtensionContext, env, window, workspace } from 'vscode';
import { DirectoryTextStore } from './store';
import type { TextStore } from "./store/abstractions";


const extensionName = "text-generator";
let store: TextStore;

export function activate(context: ExtensionContext) {
	try {
		const { customDataRoot, lastNamesFirst } = workspace.getConfiguration(extensionName) || {};

		store = new DirectoryTextStore(customDataRoot, lastNamesFirst);
	} catch (err) {
		window.showErrorMessage("Failed to initialize store", String(err));

		return;
	}

	//TODO: prompt for HTML/JSON/string escape
	context.subscriptions.push(
		commands.registerTextEditorCommand(`${extensionName}.InsertName`, (editor, edit) => {
			const position = editor.selection.active;

			if (position) {
				edit.insert(position, store.getFullName());
			} else {
				window.showInformationMessage("Unable to determine cursor position, check the position in the text editor");
			}
		}),

		commands.registerTextEditorCommand(`${extensionName}.InsertSentence`, (editor, edit) => {
			const position = editor.selection.active;

			if (position) {
				edit.insert(position, store.getSentence());
			} else {
				window.showInformationMessage("Unable to determine cursor position, check the position in the text editor");
			}
		}),
		commands.registerTextEditorCommand(`${extensionName}.InsertParagraph`, (editor, edit) => {
			const position = editor.selection.active;

			if (position) {
				edit.insert(position, store.getParagraph());
			} else {
				window.showInformationMessage("Unable to determine cursor position, check the position in the text editor");
			}
		}),


		commands.registerCommand(`${extensionName}.CopyName`, () => env.clipboard.writeText(store.getFullName())),
		commands.registerCommand(`${extensionName}.FirstName`, () => env.clipboard.writeText(store.getFirstName())),
		commands.registerCommand(`${extensionName}.LastName`, () => env.clipboard.writeText(store.getLastName())),

		commands.registerCommand(`${extensionName}.CopySentence`, () => env.clipboard.writeText(store.getSentence())),
		commands.registerCommand(`${extensionName}.CopyParagraph`, () => env.clipboard.writeText(store.getParagraph())),
	);
}

export function deactivate() { }
