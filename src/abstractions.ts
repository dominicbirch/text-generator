import type { ExtensionContext, TextEditor, TextEditorEdit } from "vscode";
import type { DefaultTheme } from "./defaultThemes";


/**This essentially identifies a `class` as a typed, constructable object. */
export type Class<T = any> = {
    new(...args: any[]): T;
}

/**Provides the call signature of vscode's command callbacks. */
export type CommandCallback = (...args: any[]) => any;

/**Provides the call signature of vscode's editor callbacks.
 * @param editor The current vscode editor api instance.
 * @param edit VSCode's text editor edit API.
*/
export type EditorCallback = (editor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void;

/**Represents the configuration root for the extension. */
export type GeneratorOptions = {
    /**Optionally set this to a directory path containing one or more paragraph JSON files to override the extension's source text. */
    customDataRoot?: string;
    /**When no custom data directory is configured, this setting determines which default theme should be applied. */
    defaultTheme?: DefaultTheme;
};

/**Provides the call signature of a function which wraps another function */
export type WrapperFunction = <T extends (...args: any[]) => any>(target: T, ...args: any[]) => ReturnType<T>;

/**Provides call signatures for decorator functions which may be applied to a class
 * @see {ClassDecorator}
 */
export interface TypedClassDecorator {
    /**Modifies a class type.
     * @param {T} target The unmodified class type/constructor
     * @returns {T} The modified class type/constructor
     */
    <T extends Class<any>>(target: T): T;
}


export const CommandIds = [
    "InsertSentence",
    "InsertParagraph",
    "InsertParagraphs",
    "CopySentence",
    "CopyParagraph",
    "CopyParagraphs",
    "ParseParagraphs",
    "ChangeTheme"
] as const;

export type CommandId = typeof CommandIds[number];

export interface Command<T extends Function = CommandCallback> {
    readonly id: CommandId;
    execute: T;
}

export interface CommandConstructor<T extends Function = CommandCallback> {
    new(context: ExtensionContext): Command<T>;
}