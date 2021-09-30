import { EOL } from "os";
import { ExtensionContext, env, window } from "vscode";
import type { Command, CommandCallback, CommandConstructor, CommandId, EditorCallback } from "./abstractions";
import { pickRandom, pickRandomSentence } from "./generator";
import { insertAtCursor, getSourceParagraphs, setDefaultTheme, parseAndSaveSourceParagraphs } from "./utils";


/*****************************************************************************************************************************************/
/* »»» ☼♣ NOTE: It is important that this module exports ONLY CommandConstructors as they are dynamically imported and registered ♣☼ ««« */
/*****************************************************************************************************************************************/

class BaseCommand<T extends Function = CommandCallback> implements Command<T> {
    constructor(readonly context: ExtensionContext, readonly id: CommandId, readonly execute: T) { }
}


const
    paragraphCountInputOptions = {
        title: "Insert paragraphs",
        prompt: "How many paragraphs?",
        placeHolder: "3"
    };


export class ChangeThemeCommand extends BaseCommand {
    constructor(context: ExtensionContext) {
        super(context, "ChangeTheme", () => setDefaultTheme(this.context));
    }
};

export class ParseParagraphsCommand extends BaseCommand {
    constructor(context: ExtensionContext) {
        super(context, "ParseParagraphs", parseAndSaveSourceParagraphs);
    }
}


export class InsertParagraphCommand extends BaseCommand<EditorCallback> {
    constructor(context: ExtensionContext) {
        super(context, "InsertParagraph", insertAtCursor(() => pickRandom(getSourceParagraphs(this.context))));
    }
}

export class InsertParagraphsCommand extends BaseCommand<EditorCallback> {
    constructor(context: ExtensionContext) {
        super(context, "InsertParagraphs", ((editor, edit) =>
            window.showInputBox(paragraphCountInputOptions).then(n => {
                const input = parseInt(n || ""), selection = window.activeTextEditor?.selection.active;
                if (!input || !selection) { return; }

                let paras: string[] = [];
                for (let x = 0; x < input; x++) {
                    paras.push(pickRandom(getSourceParagraphs(this.context)));
                }

                window.activeTextEditor?.edit(b => b.insert(selection, paras.join(EOL + EOL)));
            })));
    }
}

export class InsertSentenceCommand extends BaseCommand<EditorCallback> {
    constructor(context: ExtensionContext) {
        super(context, "InsertSentence", insertAtCursor(() => pickRandomSentence(pickRandom(getSourceParagraphs(this.context)))));
    }
}


export class CopyParagraphCommand extends BaseCommand {
    constructor(context: ExtensionContext) {
        super(context, "CopyParagraph", () => env.clipboard.writeText(pickRandom(getSourceParagraphs(this.context))));
    }
}

export class CopyParagraphsCommand extends BaseCommand {
    constructor(context: ExtensionContext) {
        super(context, "CopyParagraphs", () => window.showInputBox(paragraphCountInputOptions).then(n => {
            const input = parseInt(n || "");
            if (!input) { return; }

            let paras: string[] = [];
            for (let x = 0; x < input; x++) {
                paras.push(pickRandom(getSourceParagraphs(this.context)));
            }

            env.clipboard.writeText(paras.join(EOL + EOL));
        }));
    }
}

export class CopySentenceCommand extends BaseCommand {
    constructor(context: ExtensionContext) {
        super(context, "CopySentence", () => env.clipboard.writeText(pickRandomSentence(pickRandom(getSourceParagraphs(this.context)))));
    }
}


export default {
    editor: <CommandConstructor<EditorCallback>[]>[
        InsertParagraphCommand,
        InsertParagraphsCommand,
        InsertSentenceCommand
    ],
    default: <CommandConstructor[]>[
        ChangeThemeCommand,
        ParseParagraphsCommand,
        CopyParagraphCommand,
        CopyParagraphsCommand,
        CopySentenceCommand
    ]
}