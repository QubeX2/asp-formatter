// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

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

            for (let i = 0; i < 100; i++) {
                let line = document.lineAt(i);

                if (line.text.indexOf('<%') != -1) {
                    isAsp = true;
                }

                if(isAsp) {
                    edit.replace(document.uri, line.range, line.text.trim());

                    if(line.text.toLocaleLowerCase().indexOf('if ') != -1 && line.text.toLocaleLowerCase().indexOf(' then') != -1) {
                        indent++;
                        continue;
                    }

                    if(line.text.toLocaleLowerCase().indexOf('else') != -1) {
                        edit.insert(document.uri, line.range.start, ' '.repeat(4 * (indent-1)));
                        continue;
                    }

                    if(line.text.toLocaleLowerCase().indexOf('end if') != -1) {
                        indent--;
                    }

                    edit.insert(document.uri, line.range.start, ' '.repeat(4 * indent));

                }

                /*
                */

                if(line.text.indexOf('%>') != -1) {
                    isAsp = false;
                }
            }
            vscode.workspace.applyEdit(edit);
        }


        // Display a message box to the user
        //vscode.window.showInformationMessage('Running asp-format!');
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
