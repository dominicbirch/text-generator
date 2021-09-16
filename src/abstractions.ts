import type { TextEditor, TextEditorEdit } from "vscode";
import { DefaultTheme } from "./defaultThemes";

export type Class<T = any> = {
    new(...args: any[]): T;
}

export type EditorCallback = (editor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void;

export type GeneratorOptions = {
    customDataRoot?: string;
    defaultTheme?: DefaultTheme;
};

export interface Picker<T> {
    (options: T[]): T;
}