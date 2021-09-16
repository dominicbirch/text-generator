import { commands, env, ExtensionContext, window } from 'vscode';
import { generate, pickRandom, pickRandomSentence } from './generator';
import { getGeneratorOptions, getSourceParagraphs, insertAtCursor, parseAndSaveSourceParagraphs, setDefaultTheme, setSourceParagraphs } from './utils';


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

	context.subscriptions.push(
		commands.registerTextEditorCommand(`${extensionName}.InsertParagraph`, insertAtCursor(() => pickRandom(getSourceParagraphs(context)))),
		commands.registerTextEditorCommand(`${extensionName}.InsertSentence`, insertAtCursor(() => pickRandomSentence(pickRandom(getSourceParagraphs(context))))),

		commands.registerCommand(`${extensionName}.CopyParagraph`, () => env.clipboard.writeText(pickRandom(getSourceParagraphs(context)))),
		commands.registerCommand(`${extensionName}.CopySentence`, () => env.clipboard.writeText(pickRandomSentence(pickRandom(getSourceParagraphs(context))))),

		commands.registerCommand(`${extensionName}.ParseParagraphs`, parseAndSaveSourceParagraphs),
		commands.registerCommand(`${extensionName}.ChangeTheme`, () => setDefaultTheme(context)),
	);
}

export function deactivate() { }