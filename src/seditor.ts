import { $, ExtJsObject } from "./extjs";
import "./scss/simonloir.scode.hl.scss";
import h from "./hl";
export default class {
    private e: ExtJsObject;
    private editor: ExtJsObject;
    private lines: ExtJsObject;
    private type: string;
    private hl: (element: ExtJsObject, code: string, isInput?: boolean) => void;
    constructor(e: any) {
        this.e = $(e);
        if (this.e.attr("data-type") != "")
            this.type = this.e.attr("data-type");
        if (this.type == undefined) this.type = "js";
        this.init();
    }

    public getTarget(e: KeyboardEvent) {
        let target: any = e.target;
        if (!target.classList.contains("scode-editor-line")) {
            target = $(target)
                .parent(".scode-editor-line")
                .get(0);
        }
        return target;
    }

    public init(default_text: string = "") {
        this.hl = h.chooseHighlighter(this.type);
        this.e.html("");

        if (window.getComputedStyle(this.e.get(0)).position == "static")
            this.e.css("position", "relative");

        let textarea: ExtJsObject = this.e.child("div");
        textarea.addClass("code-editor-colors");
        textarea.css("overflow", "auto");
        textarea.attr("contenteditable", "false");
        textarea.get(0).focus();

        this.editor = textarea;

        let lines: ExtJsObject = this.e.child("div").html("<div>1</div>");
        lines.addClass("line-numbers");
        lines.css("overflow", "hidden");

        textarea.get(0).onscroll = function() {
            lines.get(0).scrollTop = this.scrollTop;
        };

        let spl = default_text.split(/\r?\n/);
        spl.forEach(e => {
            this.line(textarea.child("div"));
        });

        textarea
            .children("div")
            .only(0)
            .get(0)
            .focus();

        textarea.input((e: KeyboardEvent) => {
            let target = this.getTarget(e);
            let pos = toolkit.getCursorPosition(target);
            this.hl($(target), $(target).text());
            toolkit.setCaretPos(target, pos);
        });

        textarea.keydown((e: KeyboardEvent) => {
            if (e.keyCode == 13) {
                e.preventDefault();
                let target: HTMLDListElement = this.getTarget(e);
                let nextSibling = target.nextSibling;
                let new_line;
                if (nextSibling != undefined) {
                    new_line = textarea
                        .get(0)
                        .insertBefore(
                            document.createElement("div"),
                            nextSibling
                        );
                } else {
                    new_line = textarea.child("div").get(0);
                }

                this.line($(new_line));
                new_line.focus();
            }
        });

        let select = this.e.child("select");
        [this.type, "js", "html"].forEach(e => {
            select
                .child("option")
                .text(e)
                .value(e);
        });
        select.change(() => {
            this.type = select.value();
            this.init();
            this.e.attr("data-type", this.type);
        });
    }

    private line(e: ExtJsObject) {
        e.addClass("scode-editor-line")
            .attr("contenteditable", "true")
            .css("white-space", "pre");
    }

    public getContent() {
        return this.editor.text();
    }
}

class toolkit {
    public static getCursorPosition(target: any) {
        let childNodes: Array<any> = target.childNodes;
        let selection = document.getSelection().getRangeAt(0);
        let length_before = 0;

        for (const node of childNodes) {
            if (
                node == selection.startContainer ||
                node.contains(selection.startContainer)
            )
                return length_before + selection.startOffset;

            if (node.nodeType == 1) {
                length_before += node.innerText.length;
            } else if (node.nodeType == 3) {
                length_before += node.data.length;
            }
        }
    }

    public static getRangeLength(target: any) {
        let childNodes: Array<any> = target.childNodes;
        let selection = document.getSelection().getRangeAt(0);
        let start = this.getCursorPosition(target);
        let length_before = 0;

        for (const node of childNodes) {
            if (
                node == selection.endContainer ||
                node.contains(selection.endContainer)
            )
                return length_before + selection.endOffset - start;

            if (node.nodeType == 1) {
                length_before += node.innerText.length;
            } else if (node.nodeType == 3) {
                length_before += node.data.length;
            }
        }
    }

    // from (en) https://social.msdn.microsoft.com/Forums/fr-FR/f91341cb-48b3-424b-9504-f2f569f4860f/getset-caretcursor-position-in-a-contenteditable-div?forum=winappswithhtml5
    public static setCaretPos(el: any, sPos: number) {
        var charIndex = 0,
            range = document.createRange();
        range.setStart(el, 0);
        range.collapse(true);
        var nodeStack = [el],
            node,
            foundStart = false,
            stop = false;

        while (!stop && (node = nodeStack.pop())) {
            if (node.nodeType == 3) {
                var nextCharIndex = charIndex + node.length;
                if (!foundStart && sPos >= charIndex && sPos <= nextCharIndex) {
                    range.setStart(node, sPos - charIndex);
                    foundStart = true;
                }
                if (foundStart && sPos >= charIndex && sPos <= nextCharIndex) {
                    range.setEnd(node, sPos - charIndex);
                    stop = true;
                }
                charIndex = nextCharIndex;
            } else {
                var i = node.childNodes.length;
                while (i--) {
                    nodeStack.push(node.childNodes[i]);
                }
            }
        }
        let selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);
    }
}
