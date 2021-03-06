import { $, ExtJsObject } from './extjs';
import './scss/simonloir.scode.hl.scss';
import h from './hl';
export default class {
    private e: ExtJsObject;
    private editor: ExtJsObject;
    private lines: ExtJsObject;
    private type: string;
    private hl: (element: ExtJsObject, code: string, isInput?: boolean) => void;
    private lineUpdate: () => void;
    constructor(e: any, update: () => void = undefined) {
        this.lineUpdate = update;
        this.e = $(e);

        if (this.e.attr('data-type') != '')
            this.type = this.e.attr('data-type');
        if (this.type == undefined) this.type = 'js';
        this.init();
    }

    public getTarget(e: KeyboardEvent) {
        let target: any = e.target;
        if (!target.classList.contains('scode-editor-line')) {
            target = $(target)
                .parent('.scode-editor-line')
                .get(0);
        }
        return target;
    }

    public init(default_text: string = '') {
        this.hl = h.chooseHighlighter(this.type);

        if (window.getComputedStyle(this.e.get(0)).position == 'static')
            this.e.css('position', 'relative');

        if (
            this.e.children('.code-editor-colors').exists(0) &&
            default_text == ''
        ) {
            let text = '';
            let divs = this.e
                .children('.code-editor-colors')
                .children('.scode-editor-line');
            divs.forEach(function(i) {
                text += $(this).text() + (i + 1 != divs.count() ? '\n' : '');
            });
            default_text = text;
        }

        this.e.html('');

        let textarea: ExtJsObject = this.e.child('div');
        textarea.addClass('code-editor-colors');
        textarea.css('overflow', 'auto');
        textarea.attr('contenteditable', 'false');
        textarea.attr('spellcheck', 'false');
        textarea.get(0).focus();

        this.editor = textarea;

        let lines: ExtJsObject = this.e.child('div').html('<div>1</div>');
        lines.addClass('line-numbers');
        lines.css('overflow', 'hidden');

        const updateLN = () => {
            let numbers = lines.children('div');
            let nbr_of_lines = textarea.children('div').count();
            if (numbers.count() > nbr_of_lines) numbers.remove(-2);
            else if (numbers.count() < nbr_of_lines)
                lines.child('div').text(nbr_of_lines.toString());
            if (this.lineUpdate) this.lineUpdate();
        };

        textarea.get(0).onscroll = function() {
            lines.get(0).scrollTop = this.scrollTop;
        };

        let spl = default_text.split(/\r\n|\r|\n/g);
        spl.forEach(e => {
            let x = this.line(textarea.child('div'));
            this.hl(x, e);
            updateLN();
        });

        textarea
            .children('div')
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
                e.stopPropagation();
                let target: HTMLDListElement = this.getTarget(e);
                let nextSibling = target.nextSibling;
                let new_line;
                let pos = toolkit.getCursorPosition(target);
                if (nextSibling != undefined) {
                    new_line = textarea
                        .get(0)
                        .insertBefore(
                            document.createElement('div'),
                            nextSibling
                        );
                } else {
                    new_line = textarea.child('div').get(0);
                }

                let spaces =
                    target.innerText.length - trimLeft(target.innerText).length;

                let nl_text = target.innerText.substring(
                    pos,
                    target.innerText.length
                );
                target.innerText = target.innerText.substring(0, pos);

                console.log('dealing with ' + spaces + ' spaces ');

                //@ts-ignore
                console.log(' '.repeat(spaces) + nl_text);

                new_line.innerText =
                    //@ts-ignore
                    ' '.repeat(spaces) + nl_text;

                this.line($(new_line));
                new_line.focus();
                this.hl($(target), target.innerText);
                this.hl($(new_line), new_line.innerText);
                toolkit.setCaretPos(new_line, spaces);
                updateLN();
            } else if (e.keyCode == 8) {
                let target: HTMLDivElement = this.getTarget(e);
                let tpos = toolkit.getCursorPosition(target);
                e.stopPropagation();
                console.log(tpos);
                if (tpos == 0 || tpos == undefined)
                    if (target != textarea.children('div').get(0)) {
                        e.preventDefault();

                        let prev = target.previousSibling;
                        console.log(target, target.innerText);
                        if (target.innerText.replace(/\r\n|\r|\n/g, '') == '') {
                            console.log('d');
                            $(target).remove();
                            updateLN();

                            //@ts-ignore
                            prev.focus();
                            //@ts-ignore
                            toolkit.setCaretPos(prev, prev.innerText.length);
                        } else {
                            //@ts-ignore
                            let pos: number = prev.innerText.length;
                            //@ts-ignore
                            prev.focus();
                            toolkit.setCaretPos(prev, pos);
                            document.execCommand(
                                'insertText',
                                null,
                                target.innerText
                            );
                            toolkit.setCaretPos(prev, pos);
                            $(target).remove();
                            updateLN();
                        }
                        let pos = toolkit.getCursorPosition(prev);
                        //@ts-ignore
                        this.hl($(prev), prev.innerText);
                        toolkit.setCaretPos(prev, pos);
                    }
            } else if (e.keyCode == 9) {
                e.preventDefault();
                e.stopPropagation();
                document.execCommand('insertText', true, '    ');
                let target: HTMLDListElement = this.getTarget(e);
                let pos = toolkit.getCursorPosition(target);
                //@ts-ignore
                this.hl($(target), target.innerText);
                toolkit.setCaretPos(target, pos);
            }
        });

        let select = this.e.child('select');
        [this.type, 'js', 'html', 'py', 'java'].forEach(e => {
            select
                .child('option')
                .text(e)
                .value(e);
        });
        select.change(() => {
            this.type = select.value();
            this.init();
            this.e.attr('data-type', this.type);
        });
        if (this.lineUpdate)
            requestAnimationFrame(() => {
                this.lineUpdate();
            });
    }

    private line(e: ExtJsObject): ExtJsObject {
        return e
            .addClass('scode-editor-line')
            .attr('contenteditable', 'true')
            .css('white-space', 'pre');
    }

    public getContent() {
        return this.editor.text();
    }

    public set lineUpdated(update: () => void) {
        this.lineUpdate = update;
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

    public static setSelectionRange(el: any, start: number, end: number) {
        if (document.createRange && window.getSelection) {
            var range = document.createRange();
            range.selectNodeContents(el);
            var textNodes = getTextNodesIn(el);
            var foundStart = false;
            var charCount = 0,
                endCharCount;

            for (var i = 0, textNode; (textNode = textNodes[i++]); ) {
                endCharCount = charCount + textNode.length;
                if (
                    !foundStart &&
                    start >= charCount &&
                    (start < endCharCount ||
                        (start == endCharCount && i <= textNodes.length))
                ) {
                    range.setStart(textNode, start - charCount);
                    foundStart = true;
                }
                if (foundStart && end <= endCharCount) {
                    range.setEnd(textNode, end - charCount);
                    break;
                }
                charCount = endCharCount;
            }

            var sel = window.getSelection();
            sel.removeAllRanges();
            sel.addRange(range);
        }
    }
}

function getTextNodesIn(node: any) {
    var textNodes: any = [];
    if (node.nodeType == 3) {
        textNodes.push(node);
    } else {
        var children = node.childNodes;
        for (var i = 0, len = children.length; i < len; ++i) {
            textNodes.push.apply(textNodes, getTextNodesIn(children[i]));
        }
    }
    return textNodes;
}

function trimLeft(str: string) {
    const r = /^\s+/;
    return str.replace(r, '');
}
