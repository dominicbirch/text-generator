import type { TextEditor, TextEditorEdit } from "vscode";
import type { DefaultTheme } from "./defaultThemes";


/**This essentially identifies a `class` as a typed, constructable object. */
export type Class<T = any> = {
    new(...args: any[]): T;
}

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
