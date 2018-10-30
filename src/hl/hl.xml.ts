function operator(base: TemplateStringsArray, char: string) {
    return `<span class="operator">${char}</span>`;
}

function xtag(base: TemplateStringsArray, char: string) {
    return `<span class="xml-tag">${char}</span>`;
}
function xattr(base: TemplateStringsArray, char: string) {
    return `<span class="xml-attr">${char}</span>`;
}

export default function xmlParser(text: string) {
    let result = '';
    let tag_buffer = '';
    let none = 0;
    let tag = 1;
    let attr = 2;
    let state = none;
    for (let i = 0; i < text.length; i++) {
        let char = text[i];
        const bchar = text[i];
        if (char == '&') char = '&amp;';
        if (char == '<') char = '&lt;';

        if (state == none) {
            if (bchar == '<') {
                result += operator`${char}`;
                state = tag;
            } else result += char;
        } else if (state == tag) {
            if (char != ' ' && char != '>' && char != '/') {
                result += xtag`${char}`;
            } else if (char == '>') {
                result += operator`${char}`;
                state = none;
            } else if (char == '/') {
                result += operator`${char}`;
            } else {
                state = attr;
                result += char;
            }
        } else if (state == attr) {
            if (char != '>') result += xattr`${char}`;
            else {
                result += operator`${char}`;
                state = none;
            }
        }
    }
    return result;
}
