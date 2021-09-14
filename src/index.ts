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
			try {
				const position = editor.selection.active;

				if (position) {
					edit.insert(position, store.getSentence());
				} else {
					window.showInformationMessage("Unable to determine cursor position, check the position in the text editor");
				}
			} catch (err) {
				window.showErrorMessage("Failed to insert sentence", String(err));
			}
		}),
		commands.registerTextEditorCommand(`${extensionName}.InsertParagraph`, (editor, edit) => {
			try {
				const position = editor.selection.active;

				if (position) {
					edit.insert(position, store.getParagraph());
				} else {
					window.showInformationMessage("Unable to determine cursor position, check the position in the text editor");
				}
			} catch (err) {
				window.showErrorMessage("Failed to insert paragraph", String(err));
			}
		}),

		commands.registerCommand(`${extensionName}.CopyName`, () => {
			try {
				env.clipboard.writeText(store.getFullName());
			} catch (err) {
				window.showErrorMessage("Failed to copy name", String(err));
			}
		}),
		commands.registerCommand(`${extensionName}.CopySentence`, () => {
			try {
				env.clipboard.writeText(store.getSentence());
			} catch (err) {
				window.showErrorMessage("Failed to copy sentence", String(err));
			}
		}),
		commands.registerCommand(`${extensionName}.CopyParagraph`, () => {
			try {
				env.clipboard.writeText(store.getParagraph());
			} catch (err) {
				window.showErrorMessage("Failed to copy paragraph", String(err));
			}
		}),

		commands.registerCommand(`${extensionName}.ExtractText`, () => window.showOpenDialog({}).then(uri => {
			// if (uri) {
			// 	store
			// 		.addText(uri[0].fsPath)//TODO: allow multiple files
			// 		.then(() => window
			// 			.showInformationMessage("Source text replaced"));
			// }
		})),
		commands.registerCommand(`${extensionName}.ExtractNames`, () => window.showOpenDialog({}).then(uri => {
			// if (uri) {
			// 	store
			// 		.addNames(uri[0].fsPath)//TODO: allow multiple files
			// 		.then(() => window
			// 			.showInformationMessage("Name source replaced"));
			// }
		}))
	);
}

export function deactivate() {
}
