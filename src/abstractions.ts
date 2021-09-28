import type { TextEditor, TextEditorEdit } from "vscode";
import type { DefaultTheme } from "./defaultThemes";

export type Class<T = any> = {
    new(...args: any[]): T;
}

export type EditorCallback = (editor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void;

export type GeneratorOptions = {
    customDataRoot?: string;
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
