import { $, ExtJsObject } from "./extjs";
import "./scss/simonloir.scode.hl.scss";
import h from "./hl";
export default class {
    private e: ExtJsObject;
    private editor: ExtJsObject;
    private lines: ExtJsObject;
    constructor(e: any) {
        this.e = $(e);

        if (window.getComputedStyle(this.e.get(0)).position == "static")
            this.e.css("position", "relative");

        let textarea: ExtJsObject = this.e.child("div");
        textarea.addClass("code-editor-colors");
        textarea.css("overflow", "auto");
        textarea.attr("contenteditable", "true");
        textarea.get(0).focus();
        document.execCommand("formatBlock", false, "<div>");

        this.editor = textarea;

        let lines: ExtJsObject = this.e.child("div").html("<div>1</div>");
        lines.addClass("line-numbers");
        lines.css("overflow", "hidden");

        textarea.get(0).onscroll = function() {
            lines.get(0).scrollTop = this.scrollTop;
        };

        textarea.keyup((e: KeyboardEvent) => {
            let div = $(
                document.getSelection().getRangeAt(0).startContainer
                    .parentElement
            );

            if (div.get(0).tagName.toLowerCase() != "div") {
                div = div.parent("div");
            }

            if (div.hasClass("code-editor-colors") == true) return;
            if (e.keyCode == 13 || e.keyCode == 38 || e.keyCode == 40) return;
            let pos = toolkit.getCursorPosition(div.get(0));
            h.chooseHighlighter("js")(div, div.text());
            toolkit.setCaretPos(div.get(0), pos);
        });

        textarea.keyup((e: KeyboardEvent) => {
            if (e.keyCode == 13 || e.keyCode == 8 || e.keyCode == 46) {
                let numbers = lines.children("div");
                let nbr_of_lines = textarea.children("div").count();
                if (numbers.count() > nbr_of_lines) numbers.remove(-2);
                else if (numbers.count() < nbr_of_lines)
                    lines.child("div").text(nbr_of_lines.toString());
                /*textarea.children('div').forEach(function() {
                    if ($(this).html() == '') $(this).html('<br />');
                });*/
            }
        });
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
