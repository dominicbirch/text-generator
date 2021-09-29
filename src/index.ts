import { EOL } from 'os';
import { commands, env, ExtensionContext, window } from 'vscode';
import { generate, pickRandom, pickRandomSentence } from './generator';
import { getGeneratorOptions, getSourceParagraphs, insertAtCursor, parseAndSaveSourceParagraphs, setDefaultTheme, setSourceParagraphs } from './utils';


/**Activates the vscode extension, registering its features. */
export async function activate(context: ExtensionContext) {
	const extensionName = context.extension.packageJSON.name;

	try {
		context.globalState.setKeysForSync([`${extensionName}.defaultTheme`]);
		await setSourceParagraphs(context, generate(getGeneratorOptions(context)));
	} catch (error) {
		console.error("Failed to initialize store", error)
		await window.showErrorMessage("Failed to initialize store", String(error));

		return;
	}

	const paragraphCountInputOptions = {
		title: "Insert paragraphs",
		prompt: "How many paragraphs?",
		placeHolder: "3"
	};
	context.subscriptions.push(
		commands.registerTextEditorCommand(`${extensionName}.InsertParagraph`, insertAtCursor(() => pickRandom(getSourceParagraphs(context)))),
		commands.registerTextEditorCommand(`${extensionName}.InsertParagraphs`, (editor, edit) => window.showInputBox(paragraphCountInputOptions).then(n => {
			const input = parseInt(n || ""), selection = window.activeTextEditor?.selection.active;
			if (!input || !selection) { return; }

			let paras: string[] = [];
			for (let x = 0; x < input; x++) {
				paras.push(pickRandom(getSourceParagraphs(context)));
			}

			window.activeTextEditor?.edit(b => b.insert(selection, paras.join(EOL + EOL)));
		})),
		commands.registerTextEditorCommand(`${extensionName}.InsertSentence`, insertAtCursor(() => pickRandomSentence(pickRandom(getSourceParagraphs(context))))),

		commands.registerCommand(`${extensionName}.CopyParagraph`, () => env.clipboard.writeText(pickRandom(getSourceParagraphs(context)))),
		commands.registerCommand(`${extensionName}.CopyParagraphs`, () => window.showInputBox(paragraphCountInputOptions).then(n => {
			const input = parseInt(n || "");
			if (!input) { return; }

			let paras: string[] = [];
			for (let x = 0; x < input; x++) {
				paras.push(pickRandom(getSourceParagraphs(context)));
			}

			env.clipboard.writeText(paras.join(EOL + EOL));
		})),
		commands.registerCommand(`${extensionName}.CopySentence`, () => env.clipboard.writeText(pickRandomSentence(pickRandom(getSourceParagraphs(context))))),

		commands.registerCommand(`${extensionName}.ParseParagraphs`, parseAndSaveSourceParagraphs),
		commands.registerCommand(`${extensionName}.ChangeTheme`, () => setDefaultTheme(context)),
	);
}

/**Deactivates the vscode extension; this may be used for clean-up.*/
export function deactivate() { }