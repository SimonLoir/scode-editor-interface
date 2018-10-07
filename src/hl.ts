//@ts-nocheck
import { ExtJsObject } from "./extjs";
import Parser from "./parser";
import { hl } from "./hl/hl.js";
let jsParser = new Parser(hl);
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

    public static xml(
        element: ExtJsObject,
        code: string,
        isInputEvent?: boolean
    ) {}

    public static chooseHighlighter(type: string) {
        if (["js", "json", "ts"].indexOf(type) >= 0) {
            return this.js;
        } else if (["htm", "html5", "html", "xml"].indexOf(type) >= 0) {
            return this.xml;
        } else {
            alert(
                "Pas de système de coloration syntaxique pour l'extension ." +
                    type
            );
        }
    }
}
