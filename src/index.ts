import { commands, ExtensionContext, window } from 'vscode';
import Commands from "./commands";
import { generate } from './generator';
import { getGeneratorOptions, setSourceParagraphs } from './utils';


/**Activates the vscode extension, registering its features. */
export async function activate(context: ExtensionContext) {
	const extensionName = context.extension.packageJSON.name;

	try {
		context.globalState.setKeysForSync([`${extensionName}.defaultTheme`]);
		await setSourceParagraphs(context, generate(getGeneratorOptions(context)));
	} catch (error) {
		console.warn("Failed to initialize store", error);
		await window.showErrorMessage("Failed to initialize store", String(error));

		return;
	}

	context.subscriptions.push(
		...Commands.default
			.map(cmd => new cmd(context))
			.map(({ id, execute }) => commands.registerCommand(`${extensionName}.${id}`, execute)),

		...Commands.editor
			.map(cmd => new cmd(context))
			.map(({ id, execute }) => commands.registerTextEditorCommand(`${extensionName}.${id}`, execute))
	);
}

/**Deactivates the vscode extension; this may be used for clean-up.*/
export function deactivate() { }