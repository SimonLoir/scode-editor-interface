//@ts-nocheck
import { ExtJsObject } from './extjs';
import Parser from './parser';
import { hl as hljs } from './hl/hl.js';
import { hl as hlpy } from './hl/hl.py';
let jsParser = new Parser(hljs);
let pyParser = new Parser(hlpy);
export default class Highlighter {
    public static hl: any;

    public static js(
        element: ExtJsObject,
        code: string,
        isInputEvent?: boolean
    ) {
        element.html(jsParser.buildHighlighter(code));
        return true;
    }

    public static py(
        element: ExtJsObject,
        code: string,
        isInputEvent?: boolean
    ) {
        element.html(pyParser.buildHighlighter(code));
        return true;
    }

    public static xml(
        element: ExtJsObject,
        code: string,
        isInputEvent?: boolean
    ) {}

    public static chooseHighlighter(type: string) {
        if (['js', 'json', 'ts'].indexOf(type) >= 0) {
            return this.js;
        } else if (['htm', 'html5', 'html', 'xml'].indexOf(type) >= 0) {
            return this.xml;
        } else if (['py'].indexOf(type) >= 0) {
            return this.py;
        } else {
            alert(
                "Pas de système de coloration syntaxique pour l'extension ." +
                    type
            );
        }
    }
}
