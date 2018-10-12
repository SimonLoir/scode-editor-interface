//@ts-nocheck
import { ExtJsObject } from './extjs';
import Parser from './parser';
import { hl as hljs } from './hl/hl.js';
import { hl as hlpy } from './hl/hl.py';
import { hl as hljava } from './hl/hl.java';
let jsParser = new Parser(hljs);
let pyParser = new Parser(hlpy);
let javaParser = new Parser(hljava);
export default class Highlighter {
    public static hl: any;

    public static js(
        element: ExtJsObject,
        code: string,
        isInputEvent?: boolean
    ) {
        element.html(jsParser.highlight(code));
        return true;
    }

    public static py(
        element: ExtJsObject,
        code: string,
        isInputEvent?: boolean
    ) {
        element.html(pyParser.highlight(code));
        return true;
    }

    public static java(
        element: ExtJsObject,
        code: string,
        isInputEvent?: boolean
    ) {
        element.html(javaParser.highlight(code));
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
        } else if (['java'].indexOf(type) >= 0) {
            return this.java;
        } else {
            alert(
                "Pas de système de coloration syntaxique pour l'extension ." +
                    type
            );
        }
    }
}
