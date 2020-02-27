// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
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

            let indenters = [
                'if',
                'do while',
                'select case',
                'while',
                'for'
            ]

            let outdenters = [
               'end if',
               'loop',
               'end select',
               'wend',
               'next'
            ]

            let skips = [
                'else', 
                'elseif'
            ]



            for (let i = 0; i < document.lineCount; i++) {

                if(i == 384) {
                    let n = 0;
                }

                let line = document.lineAt(i);
                const n: string = line.text;

                if (n.indexOf('<%') != -1) {
                    isAsp = true;
                }

                if(isAsp) {
                    let canIndent: boolean = false;

                    // trim string to begin with
                    edit.replace(document.uri, line.range, n.trim());


                    if(n.match(/^\s*[']|\s*<%\s*[']/gi)) {
                        if(n.indexOf('%>') != -1) {
                            isAsp = false;
                        }
                        continue;
                    }

                    // indenters
                    for(const indenter of indenters) {
                        const re = new RegExp(`^\\s*<%\\s+${indenter}|^\\s*${indenter}`, 'gi');
                        if(n.match(re)) {
                            if(indenter == 'if') {
                                if(n.toLocaleLowerCase().indexOf('end if') == -1) {
                                    if(n.match(/then\s*$|then\s*%>$/gi)) {
                                        canIndent = true;
                                    } else {
                                        // special case comment after eg: Then 'comment
                                        if(n.match(/then\s*['].*/gi)) {
                                            canIndent = true;
                                        } else {
                                            // special case thingy, fix
                                        }
                                    }
                                }
                            } else {
                                canIndent = true;
                            }
                            if(canIndent) {
                                indent++;
                            }
                            break;
                        }
                    }

                    if(canIndent) {
                        continue;
                    }

                    // skips
                    let doSkip: boolean = false;
                    for(const skip of skips) {
                        const re = new RegExp(`^\\s*<%\\s+${skip}|^\\s*${skip}`, 'gi');
                        if(n.match(re)) {
                            edit.insert(document.uri, line.range.start, ' '.repeat(4 * (indent-1)));
                            doSkip = true;
                            break;
                        }
                    }

                    if(doSkip) {
                        continue;
                    }

                    // outdenters
                    for(const outdenter of outdenters) {
                        const re = new RegExp(`^\\s*<%\\s+${outdenter}|^\\s*${outdenter}`, 'gi');
                        if(n.match(re)) {
                            indent--;
                            break;
                        }
                    }

                    edit.insert(document.uri, line.range.start, ' '.repeat(4 * indent));
                    vscode.workspace.applyEdit(edit);
                }

                // check if end asp
                if(n.indexOf('%>') != -1) {
                    isAsp = false;
                }
            }
        }


        // Display a message box to the user
        //vscode.window.showInformationMessage('Running asp-format!');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
