import type { TextEditor, TextEditorEdit } from "vscode";

export type Class<T = any> = {
    new(...args: any[]): T;
}

export interface TextStore {
    getSentence(): string;
    getParagraph(): string;
}

export type EditorCallback = (editor: TextEditor, edit: TextEditorEdit, ...args: any[]) => void;

export type DefaultTheme = "Alice in wonderland" | "Lorem ipsum";


export type WorkspaceOptions = {
    customDataRoot?: string;
    defaultTheme?: DefaultTheme;
};