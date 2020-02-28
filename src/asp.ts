import { TextDocument, WorkspaceEdit, TextLine } from "vscode";

export default class AspFactory {
    indenters: Array<string> = [
        'if',
        'do while',
        'select case',
        'while',
        'for',
        'function'
    ];

    outdenters: Array<string> = [
        'end if',
        'loop',
        'end select',
        'wend',
        'next',
        'end function'
    ];

    skips: Array<string> = [
        'else',
        'elseif',
        'case',
        'case else'
    ];

    currentIndex: number = -1;
    line: any;

    constructor(public document: TextDocument, public edit: WorkspaceEdit) {
    }

    private getLine() {
        if(!this.isLastLine() && this.currentIndex >= 0) {
            return this.document.lineAt(this.currentIndex);
        }    
        null;    
    }

    private isLastLine() {
        return this.currentIndex < this.document.lineCount ? false : true;
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

    next() {
        this.currentIndex++;
        this.line = this.getLine();
        return this.isLastLine();
    }

    isStartSymbol() {
        return this.line !== null ? this.line.text.indexOf('<%') !== -1  : false;
    }

    isEndSymbol() {
        return this.line !== null ? this.line.text.indexOf('%>') !== -1 : false;
    }

    isComment() {
        return this.line !== null ? this.line.text.match(/^\s*[']|\s*<%\s*[']/gi) : false;
    }

    isOutdenter() {
        if(this.line === null) {
            return false;
        }

        for (const outdenter of this.outdenters) {
            const re = new RegExp(`^\\s*<%\\s*${outdenter}|^\\s*${outdenter}`, 'gi');
            if (this.line.text.match(re)) {
                return true;
            }
        }
        return false;
    }

    isSkip() {
        let doSkip: boolean = false;
        if(this.line === null) {
            return false;
        }

        for (const skip of this.skips) {
            const re = new RegExp(`^\\s*<%\\s*${skip}|^\\s*${skip}`, 'gi');
            if (this.line.text.match(re)) {
                doSkip = true;
                break;
            }
        }
        return doSkip;
    }

    isIndenter() {
        if(this.line === null) {
            return false;
        }

        for (const indenter of this.indenters) {
            const re = new RegExp(`^\\s*<%\\s*${indenter}|^\\s*${indenter}`, 'gi');
            if (this.line.text.match(re)) {
                if (indenter === 'if') {
                    if(!this.line.text.match(/end if/gi)) {
                        return true;
                    }
                } else {
                    return true;
                }
                break;
            }
        }
        return false;
    }

}