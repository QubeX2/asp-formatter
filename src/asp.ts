import { TextDocument, WorkspaceEdit, TextLine } from "vscode";

export default class AspFactory {
    indenters: Array<string> = [
        'if',
        'do while',
        'select case',
        'while',
        'for'
    ];

    outdenters: Array<string> = [
        'end if',
        'loop',
        'end select',
        'wend',
        'next'
    ];

    skips: Array<string> = [
        'else',
        'elseif',
        'case',
        'case else'
    ];

    currentIndex: number = 0;
    line: any;

    constructor(public document: TextDocument, public edit: WorkspaceEdit) {
        this.line = this.getLine();
    }

    private getLine() {
        if(!this.isLastLine()) {
            return this.document.lineAt(this.currentIndex);
        }    
        null;    
    }

    trimLine() {
        if(this.line !== null) {
            this.edit.replace(this.document.uri, this.line.range, this.line.text.trim());
        }
    }

    indent(indent: number) {
        if(this.line !== null) {            
            this.edit.insert(this.document.uri, this.line.range.start, ' '.repeat(4 * (indent < 0 ? 0 : indent)));
        }
    }

    isLastLine() {
        return this.currentIndex < this.document.lineCount ? false : true;
    }

    next() {
        this.currentIndex++;
        this.line = this.getLine();
    }

    isStartSymbol() {
        return this.line !== null ? this.line.text.indexOf('<%') != -1  : false;
    }

    isEndSymbol() {
        return this.line !== null ? this.line.text.indexOf('%>') != -1 : false;
    }

    isComment() {
        return this.line !== null ? this.line.text.match(/^\s*[']|\s*<%\s*[']/gi) : false;
    }

    isOutdenter() {
        let canOutdent: boolean = false;
        if(this.line === null) return false;

        for (const outdenter of this.outdenters) {
            const re = new RegExp(`^\\s*<%\\s+${outdenter}|^\\s*${outdenter}`, 'gi');
            if (this.line.text.match(re)) {
                canOutdent = true;
                break;
            }
        }
        return canOutdent;
    }

    isSkip() {
        let doSkip: boolean = false;
        if(this.line === null) return false;

        for (const skip of this.skips) {
            const re = new RegExp(`^\\s*<%\\s+${skip}|^\\s*${skip}`, 'gi');
            if (this.line.text.match(re)) {
                doSkip = true;
                break;
            }
        }
        return doSkip;
    }

    isIndenter() {
        let canIndent: boolean = false;
        if(this.line === null) return false;

        for (const indenter of this.indenters) {
            const re = new RegExp(`^\\s*<%\\s+${indenter}|^\\s*${indenter}`, 'gi');
            if (this.line.text.match(re)) {
                if (indenter == 'if') {
                    if (this.line.text.toLocaleLowerCase().indexOf('end if') == -1) {
                        if (this.line.text.match(/then\s*$|then\s*%>$/gi)) {
                            canIndent = true;
                        } else {
                            // special case comment after eg: Then 'comment
                            if (this.line.text.match(/then\s*['].*/gi)) {
                                canIndent = true;
                            } else {
                                // special case thingy, fix
                            }
                        }
                    }
                } else {
                    canIndent = true;
                }
                break;
            }
        }
        return canIndent;
    }

}