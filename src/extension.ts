// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import AspFactory from './asp';
import { exists } from 'fs';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.asp-format', () => {
        // The code you place here will be executed every time your command is executed

        const { activeTextEditor } = vscode.window;

        if (activeTextEditor && activeTextEditor.document.languageId == 'asp') {
            const { document } = activeTextEditor;
            const edit = new vscode.WorkspaceEdit();
            let indent: number = 0, isAsp: boolean = false;
            let af = new AspFactory(document, edit);

            while(!af.next()) {

                if(af.isStartSymbol()) {
                    isAsp = true;
                }

                if(!isAsp) {
                    af.trimLine();
                    af.indent(indent);
                    continue;
                }

                if(isAsp) {
                    // trim string to begin with
                    af.trimLine();

                    if(af.isComment()) {
                        if(af.isEndSymbol()) {
                            isAsp = false;
                        }
                        af.indent(indent);
                        continue;
                    }

                    // indenters
                    if(af.isIndenter()) {
                        af.indent(indent);
                        indent++;
                        continue;
                    }

                    // skips
                    if(af.isSkip()) {
                        af.indent(indent - 1);
                        continue;
                    }

                    // outdenters
                    if(af.isOutdenter()) {
                        indent--;
                        // ugly fix
                        if(indent < 0) {
                            indent = 0;
                        }
                    }

                    af.indent(indent);
                }

                // check if end asp
                if(af.isEndSymbol()) {
                    isAsp = false;
                }
            }
            vscode.workspace.applyEdit(edit);
        }
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
