import { AR } from './extjs';

export default class Parser {
    private extensions: string[] = [];
    private operators: string[] = [];
    private keywords: string[] = [];
    private commands: string[] = [];
    private inlineStrings: string[] = [];
    private strings: string[] = [];
    private inlineComments: string[] = [];
    private commentsCloseReverse: string[] = [];
    private comments: string[] = [];
    private objects: string[] = [];
    constructor(data: string = '') {
        this.parse(data);
    }
    private parse(text: string) {
        let x = text.split(/\r\n|\r|\n/g);
        x.forEach(line => {
            line = line.trim();
            if (line.indexOf('define extension ') == 0) {
                this.extensions.push(
                    JSON.parse(line.replace('define extension ', ''))
                );
            } else if (line.indexOf('set keyword ') == 0) {
                this.keywords.push(
                    JSON.parse(line.replace('set keyword ', ''))
                );
            } else if (line.indexOf('set command ') == 0) {
                this.commands.push(
                    JSON.parse(line.replace('set command ', ''))
                );
            } else if (line.indexOf('set object ') == 0) {
                this.objects.push(JSON.parse(line.replace('set object ', '')));
            } else if (line.indexOf('set string.inline ') == 0) {
                this.inlineStrings.push(
                    JSON.parse(line.replace('set string.inline ', ''))
                );
            } else if (line.indexOf('set comment.inline ') == 0) {
                this.inlineComments.push(
                    JSON.parse(line.replace('set comment.inline ', ''))
                );
            } else if (line.indexOf('set comment.reverseOnClose ') == 0) {
                this.commentsCloseReverse.push(
                    JSON.parse(line.replace('set comment.reverseOnClose ', ''))
                );
            } else if (line.indexOf('set string ') == 0) {
                this.strings.push(JSON.parse(line.replace('set string ', '')));
            } else if (line.indexOf('set operator ') == 0) {
                this.operators.push(
                    JSON.parse(line.replace('set operator ', ''))
                );
            } else if (line == '') {
            } else {
                console.log(line + ' undefined');
            }
        });
        console.log('done');
    }

    public checkInlineComment(text: string, istart: number) {
        let isFound: any = undefined;
        this.inlineComments.forEach(type => {
            if (isFound) return;
            isFound = true;
            for (let i = 0; i < type.length; i++) {
                if (type[i] != text[i + istart]) isFound = undefined;
            }
        });
        return isFound;
    }

    public highlight(text: string) {
        const def = 'd';
        const str = 's';
        const comment = 'c';
        let buffer: string = '';
        let c: string = '';
        let type: string = def;
        let str_type: string;
        const clearBuffer = (
            char: string,
            t: string,
            xchar: string = undefined
        ) => {
            //console.log(char, buffer, t);
            if (this.keywords.indexOf(buffer) >= 0)
                buffer = `<span class="keyword1">${buffer}</span>`;
            else if (this.commands.indexOf(buffer) >= 0)
                buffer = `<span class="keyword2">${buffer}</span>`;
            else if (this.objects.indexOf(buffer) >= 0)
                buffer = `<span class="object">${buffer}</span>`;
            else if (xchar == '(' && t == def)
                (buffer = `<span class="function">${buffer}</span>`),
                    (char = '');
            if (type == def) c += buffer;
            else if (type == str) c += `<span class="string">${buffer}</span>`;
            else if (type == comment)
                c += `<span class="comment">${buffer}</span>`;
            buffer = char;
            type = t;
        };
        for (let i = 0; i < text.length; i++) {
            let char = text[i];
            if (char == '&') char = '&amp;';
            if (type == def) {
                if (this.strings.indexOf(char) >= 0) {
                    str_type = char;
                    clearBuffer(char, str);
                } else if (this.inlineStrings.indexOf(char) >= 0) {
                    str_type = char;
                    clearBuffer(char, str);
                } else if (this.checkInlineComment(text, i)) {
                    clearBuffer(char, def);
                    type = comment;
                    buffer = char;
                } else if (this.operators.indexOf(char) >= 0) {
                    clearBuffer('', def, char);
                    c += `<span class="operator">${char}</span>`;
                } else {
                    buffer += char;
                }
            } else if (type == str) {
                buffer += char;
                if (char == str_type) clearBuffer('', def);
            } else if (type == comment) {
                buffer += char;
            }
        }
        clearBuffer('', type);
        return c;
    }
}
