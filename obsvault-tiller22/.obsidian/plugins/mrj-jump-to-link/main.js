'use strict';

var obsidian = require('obsidian');
var view = require('@codemirror/view');
var state = require('@codemirror/state');

/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */

function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

class Settings {
    constructor() {
        // Defaults as in Vimium extension for browsers
        this.letters = 'sadfjklewcmpgh';
        this.jumpToAnywhereRegex = '\\b\\w{3,}\\b';
    }
}

/**
 * Get only visible content
 * @param cmEditor
 * @returns Letter offset and visible content as a string
 */
function getVisibleLineText(cmEditor) {
    const scrollInfo = cmEditor.getScrollInfo();
    const { line: from } = cmEditor.coordsChar({ left: 0, top: 0 }, 'page');
    const { line: to } = cmEditor.coordsChar({ left: scrollInfo.left, top: scrollInfo.top + scrollInfo.height });
    const indOffset = cmEditor.indexFromPos({ ch: 0, line: from });
    const strs = cmEditor.getRange({ ch: 0, line: from }, { ch: 0, line: to + 1 });
    return { indOffset, strs };
}
/**
 *
 * @param alphabet - Letters which used to produce hints
 * @param numLinkHints - Count of needed links
 */
function getLinkHintLetters(alphabet, numLinkHints) {
    const alphabetUppercase = alphabet.toUpperCase();
    let prefixCount = Math.ceil((numLinkHints - alphabetUppercase.length) / (alphabetUppercase.length - 1));
    // ensure 0 <= prefixCount <= alphabet.length
    prefixCount = Math.max(prefixCount, 0);
    prefixCount = Math.min(prefixCount, alphabetUppercase.length);
    const prefixes = ['', ...Array.from(alphabetUppercase.slice(0, prefixCount))];
    const linkHintLetters = [];
    for (let i = 0; i < prefixes.length; i++) {
        const prefix = prefixes[i];
        for (let j = 0; j < alphabetUppercase.length; j++) {
            if (linkHintLetters.length < numLinkHints) {
                const letter = alphabetUppercase[j];
                if (prefix === '') {
                    if (!prefixes.contains(letter)) {
                        linkHintLetters.push(letter);
                    }
                }
                else {
                    linkHintLetters.push(prefix + letter);
                }
            }
            else {
                break;
            }
        }
    }
    return linkHintLetters;
}
function getMDHintLinks(content, offset, letters) {
    // expecting either [[Link]] or [[Link|Title]]
    const regExInternal = /\[\[(.+?)(\|.+?)?]]/g;
    // expecting [Title](../example.md)
    const regExMdInternal = /\[.+?]\(((\.\.|\w|\d).+?)\)/g;
    // expecting [Title](file://link) or [Title](https://link)
    const regExExternal = /\[.+?]\(((https?:|file:).+?)\)/g;
    // expecting http://hogehoge or https://hogehoge
    const regExUrl = /( |\n|^)(https?:\/\/[^ \n]+)/g;
    let linksWithIndex = [];
    let regExResult;
    while (regExResult = regExInternal.exec(content)) {
        const linkText = regExResult[1];
        linksWithIndex.push({ index: regExResult.index + offset, type: 'internal', linkText });
    }
    while (regExResult = regExMdInternal.exec(content)) {
        const linkText = regExResult[1];
        linksWithIndex.push({ index: regExResult.index + offset, type: 'internal', linkText });
    }
    while (regExResult = regExExternal.exec(content)) {
        const linkText = regExResult[1];
        linksWithIndex.push({ index: regExResult.index + offset, type: 'external', linkText });
    }
    while (regExResult = regExUrl.exec(content)) {
        const linkText = regExResult[2];
        linksWithIndex.push({ index: regExResult.index + offset + 1, type: 'external', linkText });
    }
    const linkHintLetters = getLinkHintLetters(letters, linksWithIndex.length);
    const linksWithLetter = [];
    linksWithIndex
        .sort((x, y) => x.index - y.index)
        .forEach((linkHint, i) => {
        linksWithLetter.push(Object.assign({ letter: linkHintLetters[i] }, linkHint));
    });
    return linksWithLetter.filter(link => link.letter);
}
function createWidgetElement(content) {
    const linkHintEl = document.createElement('div');
    linkHintEl.classList.add('jl');
    linkHintEl.classList.add('popover');
    linkHintEl.innerHTML = content;
    return linkHintEl;
}
function displaySourcePopovers(cmEditor, linkKeyMap) {
    const drawWidget = (cmEditor, linkHint) => {
        const pos = cmEditor.posFromIndex(linkHint.index);
        // the fourth parameter is undocumented. it specifies where the widget should be place
        return cmEditor.addWidget(pos, createWidgetElement(linkHint.letter), false, 'over');
    };
    linkKeyMap.forEach(x => drawWidget(cmEditor, x));
}

function extractRegexpBlocks(content, offset, regexp, letters) {
    const regExUrl = new RegExp(regexp, 'g');
    let linksWithIndex = [];
    let regExResult;
    while ((regExResult = regExUrl.exec(content))) {
        const linkText = regExResult[1];
        linksWithIndex.push({
            index: regExResult.index + offset,
            type: "regex",
            linkText,
        });
    }
    const linkHintLetters = getLinkHintLetters(letters, linksWithIndex.length);
    const linksWithLetter = [];
    linksWithIndex
        .sort((x, y) => x.index - y.index)
        .forEach((linkHint, i) => {
        linksWithLetter.push(Object.assign({ letter: linkHintLetters[i] }, linkHint));
    });
    return linksWithLetter.filter(link => link.letter);
}

class RegexpProcessor {
    constructor(cmEditor, regexp, alphabet) {
        this.cmEditor = cmEditor;
        this.regexp = regexp;
        this.letters = alphabet;
    }
    init() {
        const [content, offset] = this.getVisibleContent();
        const links = this.getLinks(content, offset);
        this.display(links);
        return links;
    }
    getVisibleContent() {
        const { cmEditor } = this;
        const { indOffset, strs } = getVisibleLineText(cmEditor);
        return [strs, indOffset];
    }
    getLinks(content, offset) {
        const { regexp, letters } = this;
        return extractRegexpBlocks(content, offset, regexp, letters);
    }
    display(links) {
        const { cmEditor } = this;
        displaySourcePopovers(cmEditor, links);
    }
}

function getPreviewLinkHints(previewViewEl, letters) {
    const anchorEls = previewViewEl.querySelectorAll('a');
    const embedEls = previewViewEl.querySelectorAll('.internal-embed');
    const linkHints = [];
    anchorEls.forEach((anchorEl, _i) => {
        if (checkIsPreviewElOnScreen(previewViewEl, anchorEl)) {
            return;
        }
        const linkType = anchorEl.classList.contains('internal-link')
            ? 'internal'
            : 'external';
        const linkText = linkType === 'internal'
            ? anchorEl.dataset['href']
            : anchorEl.href;
        let offsetParent = anchorEl.offsetParent;
        let top = anchorEl.offsetTop;
        let left = anchorEl.offsetLeft;
        while (offsetParent) {
            if (offsetParent == previewViewEl) {
                offsetParent = undefined;
            }
            else {
                top += offsetParent.offsetTop;
                left += offsetParent.offsetLeft;
                offsetParent = offsetParent.offsetParent;
            }
        }
        linkHints.push({
            letter: '',
            linkText: linkText,
            type: linkType,
            top: top,
            left: left,
        });
    });
    embedEls.forEach((embedEl, _i) => {
        const linkText = embedEl.getAttribute('src');
        const linkEl = embedEl.querySelector('.markdown-embed-link');
        if (linkText && linkEl) {
            if (checkIsPreviewElOnScreen(previewViewEl, linkEl)) {
                return;
            }
            let offsetParent = linkEl.offsetParent;
            let top = linkEl.offsetTop;
            let left = linkEl.offsetLeft;
            while (offsetParent) {
                if (offsetParent == previewViewEl) {
                    offsetParent = undefined;
                }
                else {
                    top += offsetParent.offsetTop;
                    left += offsetParent.offsetLeft;
                    offsetParent = offsetParent.offsetParent;
                }
            }
            linkHints.push({
                letter: '',
                linkText: linkText,
                type: 'internal',
                top: top,
                left: left,
            });
        }
    });
    const sortedLinkHints = linkHints.sort((a, b) => {
        if (a.top > b.top) {
            return 1;
        }
        else if (a.top === b.top) {
            if (a.left > b.left) {
                return 1;
            }
            else if (a.left === b.left) {
                return 0;
            }
            else {
                return -1;
            }
        }
        else {
            return -1;
        }
    });
    const linkHintLetters = getLinkHintLetters(letters, sortedLinkHints.length);
    sortedLinkHints.forEach((linkHint, i) => {
        linkHint.letter = linkHintLetters[i];
    });
    return sortedLinkHints;
}
function checkIsPreviewElOnScreen(parent, el) {
    return el.offsetTop < parent.scrollTop || el.offsetTop > parent.scrollTop + parent.offsetHeight;
}
function displayPreviewPopovers(markdownPreviewViewEl, linkHints) {
    for (let linkHint of linkHints) {
        const linkHintEl = markdownPreviewViewEl.createEl('div');
        linkHintEl.style.top = linkHint.top + 'px';
        linkHintEl.style.left = linkHint.left + 'px';
        linkHintEl.textContent = linkHint.letter;
        linkHintEl.classList.add('jl');
        linkHintEl.classList.add('popover');
    }
}

class PreviewLinkProcessor {
    constructor(view, alphabet) {
        this.view = view;
        this.alphabet = alphabet;
    }
    init() {
        const { view, alphabet } = this;
        const links = getPreviewLinkHints(view, alphabet);
        displayPreviewPopovers(view, links);
        return links;
    }
}

class SourceLinkProcessor {
    constructor(editor, alphabet) {
        this.getSourceLinkHints = (cmEditor) => {
            const { letters } = this;
            const { indOffset, strs } = getVisibleLineText(cmEditor);
            return getMDHintLinks(strs, indOffset, letters);
        };
        this.cmEditor = editor;
        this.letters = alphabet;
    }
    init() {
        const { cmEditor } = this;
        const linkHints = this.getSourceLinkHints(cmEditor);
        displaySourcePopovers(cmEditor, linkHints);
        return linkHints;
    }
}

class LivePreviewLinkProcessor {
    constructor(editor, alphabet) {
        this.getSourceLinkHints = () => {
            const { letters } = this;
            const { index, content } = this.getVisibleLines();
            return getMDHintLinks(content, index, letters);
        };
        this.cmEditor = editor;
        this.letters = alphabet;
    }
    init() {
        return this.getSourceLinkHints();
    }
    getVisibleLines() {
        const { cmEditor } = this;
        const { from, to } = cmEditor.viewport;
        const content = cmEditor.state.sliceDoc(from, to);
        return { index: from, content };
    }
}

class MarkWidget extends view.WidgetType {
    constructor(mark) {
        super();
        this.mark = mark;
    }
    eq(other) {
        return other.mark === this.mark;
    }
    toDOM() {
        const mark = document.createElement("span");
        mark.innerText = this.mark;
        const wrapper = document.createElement("div");
        wrapper.style.display = "inline-block";
        wrapper.style.position = "absolute";
        wrapper.classList.add('jl');
        wrapper.classList.add('popover');
        wrapper.append(mark);
        return wrapper;
    }
    ignoreEvent() {
        return false;
    }
}

class MarkPlugin {
    constructor(links) {
        this.links = [];
        this.links = links;
    }
    setLinks(links) {
        this.links = links;
    }
    clean() {
        this.links = [];
    }
    get visible() {
        return this.links.length > 0;
    }
    createMarks() {
        const widgets = this.links.map((x) => view.Decoration.widget({
            widget: new MarkWidget(x.letter),
            side: 1,
        }).range(x.index));
        return view.Decoration.set(widgets);
    }
}
function createViewPluginClass(markPlugin) {
    return class {
        constructor(_view) {
            this.decorations = markPlugin.createMarks();
        }
        update(_update) {
            this.decorations = markPlugin.createMarks();
        }
    };
}

class LivePreviewRegexProcessor extends LivePreviewLinkProcessor {
    constructor(editor, alphabet, regexp) {
        super(editor, alphabet);
        this.regexp = regexp;
    }
    init() {
        const { letters, regexp } = this;
        const { index, content } = this.getVisibleLines();
        return extractRegexpBlocks(content, index, regexp, letters);
    }
}

var VIEW_MODE;
(function (VIEW_MODE) {
    VIEW_MODE[VIEW_MODE["SOURCE"] = 0] = "SOURCE";
    VIEW_MODE[VIEW_MODE["PREVIEW"] = 1] = "PREVIEW";
    VIEW_MODE[VIEW_MODE["LIVE_PREVIEW"] = 2] = "LIVE_PREVIEW";
})(VIEW_MODE || (VIEW_MODE = {}));
class JumpToLink extends obsidian.Plugin {
    constructor() {
        super(...arguments);
        this.isLinkHintActive = false;
        this.prefixInfo = undefined;
        this.handleJumpToLink = () => {
            const { settings: { letters }, app } = this;
            const currentView = app.workspace.activeLeaf.view;
            const mode = this.getMode(currentView);
            switch (mode) {
                case VIEW_MODE.SOURCE:
                    const cmEditor = currentView.sourceMode.cmEditor;
                    const sourceLinkHints = new SourceLinkProcessor(cmEditor, letters).init();
                    this.handleActions(sourceLinkHints, cmEditor);
                    break;
                case VIEW_MODE.PREVIEW:
                    const previewViewEl = currentView.previewMode.containerEl.querySelector('div.markdown-preview-view');
                    const previewLinkHints = new PreviewLinkProcessor(previewViewEl, letters).init();
                    this.handleActions(previewLinkHints);
                    break;
                case VIEW_MODE.LIVE_PREVIEW:
                    const cm6Editor = currentView.editor.cm;
                    const livePreviewLinks = new LivePreviewLinkProcessor(cm6Editor, letters).init();
                    this.markPlugin.setLinks(livePreviewLinks);
                    this.app.workspace.updateOptions();
                    this.handleActions(livePreviewLinks);
                    break;
            }
        };
        this.handleJumpToRegex = () => {
            const { app, settings: { letters, jumpToAnywhereRegex } } = this;
            const currentView = app.workspace.activeLeaf.view;
            const mode = this.getMode(currentView);
            switch (mode) {
                case VIEW_MODE.LIVE_PREVIEW:
                    const cm6Editor = currentView.editor.cm;
                    const livePreviewLinks = new LivePreviewRegexProcessor(cm6Editor, letters, jumpToAnywhereRegex).init();
                    this.markPlugin.setLinks(livePreviewLinks);
                    this.app.workspace.updateOptions();
                    this.handleActions(livePreviewLinks, cm6Editor);
                    break;
                case VIEW_MODE.PREVIEW:
                    break;
                case VIEW_MODE.SOURCE:
                    const cmEditor = currentView.sourceMode.cmEditor;
                    const links = new RegexpProcessor(cmEditor, jumpToAnywhereRegex, letters).init();
                    this.handleActions(links, cmEditor);
                    break;
            }
        };
        this.handleActions = (linkHints, cmEditor) => {
            if (!linkHints.length) {
                return;
            }
            const linkHintMap = {};
            linkHints.forEach(x => linkHintMap[x.letter] = x);
            const handleHotkey = (newLeaf, link) => {
                if (link.type === 'internal') {
                    // not sure why the second argument in openLinkText is necessary.
                    this.app.workspace.openLinkText(decodeURI(link.linkText), '', newLeaf, { active: true });
                }
                else if (link.type === 'external') {
                    window.open(link.linkText);
                }
                else {
                    const editor = cmEditor;
                    if (editor instanceof view.EditorView) {
                        const index = link.index;
                        editor.dispatch({ selection: state.EditorSelection.cursor(index) });
                    }
                    else {
                        editor.setCursor(editor.posFromIndex(link.index));
                    }
                }
            };
            const removePopovers = () => {
                document.removeEventListener('click', removePopovers);
                document.querySelectorAll('.jl.popover').forEach(e => e.remove());
                document.querySelectorAll('#jl-modal').forEach(e => e.remove());
                this.prefixInfo = undefined;
                this.markPlugin.clean();
                this.app.workspace.updateOptions();
                this.isLinkHintActive = false;
            };
            const handleKeyDown = (event) => {
                var _a;
                if (event.key === 'Shift') {
                    return;
                }
                const eventKey = event.key.toUpperCase();
                const prefixes = new Set(Object.keys(linkHintMap).filter(x => x.length > 1).map(x => x[0]));
                let linkHint;
                if (this.prefixInfo) {
                    linkHint = linkHintMap[this.prefixInfo.prefix + eventKey];
                }
                else {
                    linkHint = linkHintMap[eventKey];
                    if (!linkHint && prefixes && prefixes.has(eventKey)) {
                        this.prefixInfo = { prefix: eventKey, shiftKey: event.shiftKey };
                        event.preventDefault();
                        event.stopPropagation();
                        event.stopImmediatePropagation();
                        return;
                    }
                }
                event.preventDefault();
                event.stopPropagation();
                event.stopImmediatePropagation();
                const newLeaf = ((_a = this.prefixInfo) === null || _a === void 0 ? void 0 : _a.shiftKey) || event.shiftKey;
                linkHint && handleHotkey(newLeaf, linkHint);
                document.removeEventListener('keydown', handleKeyDown, { capture: true });
                removePopovers();
            };
            document.addEventListener('click', removePopovers);
            document.addEventListener('keydown', handleKeyDown, { capture: true });
            this.isLinkHintActive = true;
        };
    }
    onload() {
        return __awaiter(this, void 0, void 0, function* () {
            this.settings = (yield this.loadData()) || new Settings();
            this.addSettingTab(new SettingTab(this.app, this));
            const markPlugin = this.markPlugin = new MarkPlugin([]);
            const markViewPlugin = this.markViewPlugin = view.ViewPlugin.fromClass(createViewPluginClass(markPlugin), {
                decorations: v => v.decorations
            });
            this.registerEditorExtension([markViewPlugin]);
            this.addCommand({
                id: 'activate-jump-to-link',
                name: 'Jump to Link',
                callback: this.action.bind(this, 'link'),
                hotkeys: [{ modifiers: ['Ctrl'], key: `'` }],
            });
            this.addCommand({
                id: "activate-jump-to-anywhere",
                name: "Jump to Anywhere Regex",
                callback: this.action.bind(this, 'regexp'),
                hotkeys: [{ modifiers: ["Ctrl"], key: ";" }],
            });
        });
    }
    onunload() {
        console.log('unloading jump to links plugin');
    }
    action(type) {
        if (this.isLinkHintActive) {
            return;
        }
        switch (type) {
            case "link":
                this.handleJumpToLink();
                return;
            case "regexp":
                this.handleJumpToRegex();
                return;
        }
    }
    getMode(currentView) {
        var _a;
        if (currentView.getState().mode === 'preview') {
            return VIEW_MODE.PREVIEW;
        }
        else if (Array.isArray((_a = currentView === null || currentView === void 0 ? void 0 : currentView.editMode) === null || _a === void 0 ? void 0 : _a.livePreviewPlugin)) {
            return VIEW_MODE.LIVE_PREVIEW;
        }
        else if (currentView.getState().mode === 'source') {
            return VIEW_MODE.SOURCE;
        }
        return VIEW_MODE.SOURCE;
    }
}
class SettingTab extends obsidian.PluginSettingTab {
    constructor(app, plugin) {
        super(app, plugin);
        this.plugin = plugin;
    }
    display() {
        let { containerEl } = this;
        containerEl.empty();
        containerEl.createEl('h2', { text: 'Settings for Jump To Link.' });
        /* Modal mode deprecated */
        // new Setting(containerEl)
        //     .setName('Presentation')
        //     .setDesc('How to show links')
        //     .addDropdown(cb => { cb
        //         .addOptions({
        //             "popovers": 'Popovers',
        //             "modal": 'Modal'
        //         })
        //         .setValue(this.plugin.settings.mode)
        //         .onChange((value: LinkHintMode) => {
        //             this.plugin.settings.mode = value;
        //             this.plugin.saveData(this.plugin.settings);
        //         })
        //     });
        new obsidian.Setting(containerEl)
            .setName('Characters used for link hints')
            .setDesc('The characters placed next to each link after enter link-hint mode.')
            .addText(cb => {
            cb.setValue(this.plugin.settings.letters)
                .onChange((value) => {
                this.plugin.settings.letters = value;
                this.plugin.saveData(this.plugin.settings);
            });
        });
        new obsidian.Setting(containerEl)
            .setName('Jump To Anywhere')
            .setDesc("Regex based navigating in editor mode")
            .addText((text) => text
            .setPlaceholder('Custom Regex')
            .setValue(this.plugin.settings.jumpToAnywhereRegex)
            .onChange((value) => __awaiter(this, void 0, void 0, function* () {
            this.plugin.settings.jumpToAnywhereRegex = value;
            yield this.plugin.saveData(this.plugin.settings);
        })));
    }
}

module.exports = JumpToLink;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZXMiOlsibm9kZV9tb2R1bGVzL3RzbGliL3RzbGliLmVzNi5qcyIsInR5cGVzLnRzIiwic3JjL3V0aWxzL2NvbW1vbi50cyIsInNyYy91dGlscy9yZWdleHAudHMiLCJzcmMvcHJvY2Vzc29ycy9SZWdleHBQcm9jZXNzb3IudHMiLCJzcmMvdXRpbHMvcHJldmlldy50cyIsInNyYy9wcm9jZXNzb3JzL1ByZXZpZXdMaW5rUHJvY2Vzc29yLnRzIiwic3JjL3Byb2Nlc3NvcnMvU291cmNlTGlua1Byb2Nlc3Nvci50cyIsInNyYy9wcm9jZXNzb3JzL0xpdmVQcmV2aWV3TGlua1Byb2Nlc3Nvci50cyIsInNyYy9jbTYtd2lkZ2V0L01hcmtXaWRnZXQudHMiLCJzcmMvY202LXdpZGdldC9NYXJrUGx1Z2luLnRzIiwic3JjL3Byb2Nlc3NvcnMvTGl2ZVByZXZpZXdSZWdleFByb2Nlc3Nvci50cyIsInNyYy9tYWluLnRzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qISAqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKlxyXG5Db3B5cmlnaHQgKGMpIE1pY3Jvc29mdCBDb3Jwb3JhdGlvbi5cclxuXHJcblBlcm1pc3Npb24gdG8gdXNlLCBjb3B5LCBtb2RpZnksIGFuZC9vciBkaXN0cmlidXRlIHRoaXMgc29mdHdhcmUgZm9yIGFueVxyXG5wdXJwb3NlIHdpdGggb3Igd2l0aG91dCBmZWUgaXMgaGVyZWJ5IGdyYW50ZWQuXHJcblxyXG5USEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiIEFORCBUSEUgQVVUSE9SIERJU0NMQUlNUyBBTEwgV0FSUkFOVElFUyBXSVRIXHJcblJFR0FSRCBUTyBUSElTIFNPRlRXQVJFIElOQ0xVRElORyBBTEwgSU1QTElFRCBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWVxyXG5BTkQgRklUTkVTUy4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUiBCRSBMSUFCTEUgRk9SIEFOWSBTUEVDSUFMLCBESVJFQ1QsXHJcbklORElSRUNULCBPUiBDT05TRVFVRU5USUFMIERBTUFHRVMgT1IgQU5ZIERBTUFHRVMgV0hBVFNPRVZFUiBSRVNVTFRJTkcgRlJPTVxyXG5MT1NTIE9GIFVTRSwgREFUQSBPUiBQUk9GSVRTLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgTkVHTElHRU5DRSBPUlxyXG5PVEhFUiBUT1JUSU9VUyBBQ1RJT04sIEFSSVNJTkcgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgVVNFIE9SXHJcblBFUkZPUk1BTkNFIE9GIFRISVMgU09GVFdBUkUuXHJcbioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqICovXHJcbi8qIGdsb2JhbCBSZWZsZWN0LCBQcm9taXNlICovXHJcblxyXG52YXIgZXh0ZW5kU3RhdGljcyA9IGZ1bmN0aW9uKGQsIGIpIHtcclxuICAgIGV4dGVuZFN0YXRpY3MgPSBPYmplY3Quc2V0UHJvdG90eXBlT2YgfHxcclxuICAgICAgICAoeyBfX3Byb3RvX186IFtdIH0gaW5zdGFuY2VvZiBBcnJheSAmJiBmdW5jdGlvbiAoZCwgYikgeyBkLl9fcHJvdG9fXyA9IGI7IH0pIHx8XHJcbiAgICAgICAgZnVuY3Rpb24gKGQsIGIpIHsgZm9yICh2YXIgcCBpbiBiKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKGIsIHApKSBkW3BdID0gYltwXTsgfTtcclxuICAgIHJldHVybiBleHRlbmRTdGF0aWNzKGQsIGIpO1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZXh0ZW5kcyhkLCBiKSB7XHJcbiAgICBpZiAodHlwZW9mIGIgIT09IFwiZnVuY3Rpb25cIiAmJiBiICE9PSBudWxsKVxyXG4gICAgICAgIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDbGFzcyBleHRlbmRzIHZhbHVlIFwiICsgU3RyaW5nKGIpICsgXCIgaXMgbm90IGEgY29uc3RydWN0b3Igb3IgbnVsbFwiKTtcclxuICAgIGV4dGVuZFN0YXRpY3MoZCwgYik7XHJcbiAgICBmdW5jdGlvbiBfXygpIHsgdGhpcy5jb25zdHJ1Y3RvciA9IGQ7IH1cclxuICAgIGQucHJvdG90eXBlID0gYiA9PT0gbnVsbCA/IE9iamVjdC5jcmVhdGUoYikgOiAoX18ucHJvdG90eXBlID0gYi5wcm90b3R5cGUsIG5ldyBfXygpKTtcclxufVxyXG5cclxuZXhwb3J0IHZhciBfX2Fzc2lnbiA9IGZ1bmN0aW9uKCkge1xyXG4gICAgX19hc3NpZ24gPSBPYmplY3QuYXNzaWduIHx8IGZ1bmN0aW9uIF9fYXNzaWduKHQpIHtcclxuICAgICAgICBmb3IgKHZhciBzLCBpID0gMSwgbiA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBuOyBpKyspIHtcclxuICAgICAgICAgICAgcyA9IGFyZ3VtZW50c1tpXTtcclxuICAgICAgICAgICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApKSB0W3BdID0gc1twXTtcclxuICAgICAgICB9XHJcbiAgICAgICAgcmV0dXJuIHQ7XHJcbiAgICB9XHJcbiAgICByZXR1cm4gX19hc3NpZ24uYXBwbHkodGhpcywgYXJndW1lbnRzKTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fcmVzdChzLCBlKSB7XHJcbiAgICB2YXIgdCA9IHt9O1xyXG4gICAgZm9yICh2YXIgcCBpbiBzKSBpZiAoT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKHMsIHApICYmIGUuaW5kZXhPZihwKSA8IDApXHJcbiAgICAgICAgdFtwXSA9IHNbcF07XHJcbiAgICBpZiAocyAhPSBudWxsICYmIHR5cGVvZiBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzID09PSBcImZ1bmN0aW9uXCIpXHJcbiAgICAgICAgZm9yICh2YXIgaSA9IDAsIHAgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzKHMpOyBpIDwgcC5sZW5ndGg7IGkrKykge1xyXG4gICAgICAgICAgICBpZiAoZS5pbmRleE9mKHBbaV0pIDwgMCAmJiBPYmplY3QucHJvdG90eXBlLnByb3BlcnR5SXNFbnVtZXJhYmxlLmNhbGwocywgcFtpXSkpXHJcbiAgICAgICAgICAgICAgICB0W3BbaV1dID0gc1twW2ldXTtcclxuICAgICAgICB9XHJcbiAgICByZXR1cm4gdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpIHtcclxuICAgIHZhciBjID0gYXJndW1lbnRzLmxlbmd0aCwgciA9IGMgPCAzID8gdGFyZ2V0IDogZGVzYyA9PT0gbnVsbCA/IGRlc2MgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKHRhcmdldCwga2V5KSA6IGRlc2MsIGQ7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QuZGVjb3JhdGUgPT09IFwiZnVuY3Rpb25cIikgciA9IFJlZmxlY3QuZGVjb3JhdGUoZGVjb3JhdG9ycywgdGFyZ2V0LCBrZXksIGRlc2MpO1xyXG4gICAgZWxzZSBmb3IgKHZhciBpID0gZGVjb3JhdG9ycy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkgaWYgKGQgPSBkZWNvcmF0b3JzW2ldKSByID0gKGMgPCAzID8gZChyKSA6IGMgPiAzID8gZCh0YXJnZXQsIGtleSwgcikgOiBkKHRhcmdldCwga2V5KSkgfHwgcjtcclxuICAgIHJldHVybiBjID4gMyAmJiByICYmIE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0YXJnZXQsIGtleSwgciksIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3BhcmFtKHBhcmFtSW5kZXgsIGRlY29yYXRvcikge1xyXG4gICAgcmV0dXJuIGZ1bmN0aW9uICh0YXJnZXQsIGtleSkgeyBkZWNvcmF0b3IodGFyZ2V0LCBrZXksIHBhcmFtSW5kZXgpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ldGFkYXRhKG1ldGFkYXRhS2V5LCBtZXRhZGF0YVZhbHVlKSB7XHJcbiAgICBpZiAodHlwZW9mIFJlZmxlY3QgPT09IFwib2JqZWN0XCIgJiYgdHlwZW9mIFJlZmxlY3QubWV0YWRhdGEgPT09IFwiZnVuY3Rpb25cIikgcmV0dXJuIFJlZmxlY3QubWV0YWRhdGEobWV0YWRhdGFLZXksIG1ldGFkYXRhVmFsdWUpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdGVyKHRoaXNBcmcsIF9hcmd1bWVudHMsIFAsIGdlbmVyYXRvcikge1xyXG4gICAgZnVuY3Rpb24gYWRvcHQodmFsdWUpIHsgcmV0dXJuIHZhbHVlIGluc3RhbmNlb2YgUCA/IHZhbHVlIDogbmV3IFAoZnVuY3Rpb24gKHJlc29sdmUpIHsgcmVzb2x2ZSh2YWx1ZSk7IH0pOyB9XHJcbiAgICByZXR1cm4gbmV3IChQIHx8IChQID0gUHJvbWlzZSkpKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHtcclxuICAgICAgICBmdW5jdGlvbiBmdWxmaWxsZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3IubmV4dCh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gcmVqZWN0ZWQodmFsdWUpIHsgdHJ5IHsgc3RlcChnZW5lcmF0b3JbXCJ0aHJvd1wiXSh2YWx1ZSkpOyB9IGNhdGNoIChlKSB7IHJlamVjdChlKTsgfSB9XHJcbiAgICAgICAgZnVuY3Rpb24gc3RlcChyZXN1bHQpIHsgcmVzdWx0LmRvbmUgPyByZXNvbHZlKHJlc3VsdC52YWx1ZSkgOiBhZG9wdChyZXN1bHQudmFsdWUpLnRoZW4oZnVsZmlsbGVkLCByZWplY3RlZCk7IH1cclxuICAgICAgICBzdGVwKChnZW5lcmF0b3IgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSkpLm5leHQoKSk7XHJcbiAgICB9KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fZ2VuZXJhdG9yKHRoaXNBcmcsIGJvZHkpIHtcclxuICAgIHZhciBfID0geyBsYWJlbDogMCwgc2VudDogZnVuY3Rpb24oKSB7IGlmICh0WzBdICYgMSkgdGhyb3cgdFsxXTsgcmV0dXJuIHRbMV07IH0sIHRyeXM6IFtdLCBvcHM6IFtdIH0sIGYsIHksIHQsIGc7XHJcbiAgICByZXR1cm4gZyA9IHsgbmV4dDogdmVyYigwKSwgXCJ0aHJvd1wiOiB2ZXJiKDEpLCBcInJldHVyblwiOiB2ZXJiKDIpIH0sIHR5cGVvZiBTeW1ib2wgPT09IFwiZnVuY3Rpb25cIiAmJiAoZ1tTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24oKSB7IHJldHVybiB0aGlzOyB9KSwgZztcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyByZXR1cm4gZnVuY3Rpb24gKHYpIHsgcmV0dXJuIHN0ZXAoW24sIHZdKTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gc3RlcChvcCkge1xyXG4gICAgICAgIGlmIChmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiR2VuZXJhdG9yIGlzIGFscmVhZHkgZXhlY3V0aW5nLlwiKTtcclxuICAgICAgICB3aGlsZSAoXykgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKGYgPSAxLCB5ICYmICh0ID0gb3BbMF0gJiAyID8geVtcInJldHVyblwiXSA6IG9wWzBdID8geVtcInRocm93XCJdIHx8ICgodCA9IHlbXCJyZXR1cm5cIl0pICYmIHQuY2FsbCh5KSwgMCkgOiB5Lm5leHQpICYmICEodCA9IHQuY2FsbCh5LCBvcFsxXSkpLmRvbmUpIHJldHVybiB0O1xyXG4gICAgICAgICAgICBpZiAoeSA9IDAsIHQpIG9wID0gW29wWzBdICYgMiwgdC52YWx1ZV07XHJcbiAgICAgICAgICAgIHN3aXRjaCAob3BbMF0pIHtcclxuICAgICAgICAgICAgICAgIGNhc2UgMDogY2FzZSAxOiB0ID0gb3A7IGJyZWFrO1xyXG4gICAgICAgICAgICAgICAgY2FzZSA0OiBfLmxhYmVsKys7IHJldHVybiB7IHZhbHVlOiBvcFsxXSwgZG9uZTogZmFsc2UgfTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNTogXy5sYWJlbCsrOyB5ID0gb3BbMV07IG9wID0gWzBdOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGNhc2UgNzogb3AgPSBfLm9wcy5wb3AoKTsgXy50cnlzLnBvcCgpOyBjb250aW51ZTtcclxuICAgICAgICAgICAgICAgIGRlZmF1bHQ6XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKCEodCA9IF8udHJ5cywgdCA9IHQubGVuZ3RoID4gMCAmJiB0W3QubGVuZ3RoIC0gMV0pICYmIChvcFswXSA9PT0gNiB8fCBvcFswXSA9PT0gMikpIHsgXyA9IDA7IGNvbnRpbnVlOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKG9wWzBdID09PSAzICYmICghdCB8fCAob3BbMV0gPiB0WzBdICYmIG9wWzFdIDwgdFszXSkpKSB7IF8ubGFiZWwgPSBvcFsxXTsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAob3BbMF0gPT09IDYgJiYgXy5sYWJlbCA8IHRbMV0pIHsgXy5sYWJlbCA9IHRbMV07IHQgPSBvcDsgYnJlYWs7IH1cclxuICAgICAgICAgICAgICAgICAgICBpZiAodCAmJiBfLmxhYmVsIDwgdFsyXSkgeyBfLmxhYmVsID0gdFsyXTsgXy5vcHMucHVzaChvcCk7IGJyZWFrOyB9XHJcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRbMl0pIF8ub3BzLnBvcCgpO1xyXG4gICAgICAgICAgICAgICAgICAgIF8udHJ5cy5wb3AoKTsgY29udGludWU7XHJcbiAgICAgICAgICAgIH1cclxuICAgICAgICAgICAgb3AgPSBib2R5LmNhbGwodGhpc0FyZywgXyk7XHJcbiAgICAgICAgfSBjYXRjaCAoZSkgeyBvcCA9IFs2LCBlXTsgeSA9IDA7IH0gZmluYWxseSB7IGYgPSB0ID0gMDsgfVxyXG4gICAgICAgIGlmIChvcFswXSAmIDUpIHRocm93IG9wWzFdOyByZXR1cm4geyB2YWx1ZTogb3BbMF0gPyBvcFsxXSA6IHZvaWQgMCwgZG9uZTogdHJ1ZSB9O1xyXG4gICAgfVxyXG59XHJcblxyXG5leHBvcnQgdmFyIF9fY3JlYXRlQmluZGluZyA9IE9iamVjdC5jcmVhdGUgPyAoZnVuY3Rpb24obywgbSwgaywgazIpIHtcclxuICAgIGlmIChrMiA9PT0gdW5kZWZpbmVkKSBrMiA9IGs7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgazIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgZ2V0OiBmdW5jdGlvbigpIHsgcmV0dXJuIG1ba107IH0gfSk7XHJcbn0pIDogKGZ1bmN0aW9uKG8sIG0sIGssIGsyKSB7XHJcbiAgICBpZiAoazIgPT09IHVuZGVmaW5lZCkgazIgPSBrO1xyXG4gICAgb1trMl0gPSBtW2tdO1xyXG59KTtcclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2V4cG9ydFN0YXIobSwgbykge1xyXG4gICAgZm9yICh2YXIgcCBpbiBtKSBpZiAocCAhPT0gXCJkZWZhdWx0XCIgJiYgIU9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHkuY2FsbChvLCBwKSkgX19jcmVhdGVCaW5kaW5nKG8sIG0sIHApO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX192YWx1ZXMobykge1xyXG4gICAgdmFyIHMgPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgU3ltYm9sLml0ZXJhdG9yLCBtID0gcyAmJiBvW3NdLCBpID0gMDtcclxuICAgIGlmIChtKSByZXR1cm4gbS5jYWxsKG8pO1xyXG4gICAgaWYgKG8gJiYgdHlwZW9mIG8ubGVuZ3RoID09PSBcIm51bWJlclwiKSByZXR1cm4ge1xyXG4gICAgICAgIG5leHQ6IGZ1bmN0aW9uICgpIHtcclxuICAgICAgICAgICAgaWYgKG8gJiYgaSA+PSBvLmxlbmd0aCkgbyA9IHZvaWQgMDtcclxuICAgICAgICAgICAgcmV0dXJuIHsgdmFsdWU6IG8gJiYgb1tpKytdLCBkb25lOiAhbyB9O1xyXG4gICAgICAgIH1cclxuICAgIH07XHJcbiAgICB0aHJvdyBuZXcgVHlwZUVycm9yKHMgPyBcIk9iamVjdCBpcyBub3QgaXRlcmFibGUuXCIgOiBcIlN5bWJvbC5pdGVyYXRvciBpcyBub3QgZGVmaW5lZC5cIik7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3JlYWQobywgbikge1xyXG4gICAgdmFyIG0gPSB0eXBlb2YgU3ltYm9sID09PSBcImZ1bmN0aW9uXCIgJiYgb1tTeW1ib2wuaXRlcmF0b3JdO1xyXG4gICAgaWYgKCFtKSByZXR1cm4gbztcclxuICAgIHZhciBpID0gbS5jYWxsKG8pLCByLCBhciA9IFtdLCBlO1xyXG4gICAgdHJ5IHtcclxuICAgICAgICB3aGlsZSAoKG4gPT09IHZvaWQgMCB8fCBuLS0gPiAwKSAmJiAhKHIgPSBpLm5leHQoKSkuZG9uZSkgYXIucHVzaChyLnZhbHVlKTtcclxuICAgIH1cclxuICAgIGNhdGNoIChlcnJvcikgeyBlID0geyBlcnJvcjogZXJyb3IgfTsgfVxyXG4gICAgZmluYWxseSB7XHJcbiAgICAgICAgdHJ5IHtcclxuICAgICAgICAgICAgaWYgKHIgJiYgIXIuZG9uZSAmJiAobSA9IGlbXCJyZXR1cm5cIl0pKSBtLmNhbGwoaSk7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGZpbmFsbHkgeyBpZiAoZSkgdGhyb3cgZS5lcnJvcjsgfVxyXG4gICAgfVxyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkKCkge1xyXG4gICAgZm9yICh2YXIgYXIgPSBbXSwgaSA9IDA7IGkgPCBhcmd1bWVudHMubGVuZ3RoOyBpKyspXHJcbiAgICAgICAgYXIgPSBhci5jb25jYXQoX19yZWFkKGFyZ3VtZW50c1tpXSkpO1xyXG4gICAgcmV0dXJuIGFyO1xyXG59XHJcblxyXG4vKiogQGRlcHJlY2F0ZWQgKi9cclxuZXhwb3J0IGZ1bmN0aW9uIF9fc3ByZWFkQXJyYXlzKCkge1xyXG4gICAgZm9yICh2YXIgcyA9IDAsIGkgPSAwLCBpbCA9IGFyZ3VtZW50cy5sZW5ndGg7IGkgPCBpbDsgaSsrKSBzICs9IGFyZ3VtZW50c1tpXS5sZW5ndGg7XHJcbiAgICBmb3IgKHZhciByID0gQXJyYXkocyksIGsgPSAwLCBpID0gMDsgaSA8IGlsOyBpKyspXHJcbiAgICAgICAgZm9yICh2YXIgYSA9IGFyZ3VtZW50c1tpXSwgaiA9IDAsIGpsID0gYS5sZW5ndGg7IGogPCBqbDsgaisrLCBrKyspXHJcbiAgICAgICAgICAgIHJba10gPSBhW2pdO1xyXG4gICAgcmV0dXJuIHI7XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX3NwcmVhZEFycmF5KHRvLCBmcm9tLCBwYWNrKSB7XHJcbiAgICBpZiAocGFjayB8fCBhcmd1bWVudHMubGVuZ3RoID09PSAyKSBmb3IgKHZhciBpID0gMCwgbCA9IGZyb20ubGVuZ3RoLCBhcjsgaSA8IGw7IGkrKykge1xyXG4gICAgICAgIGlmIChhciB8fCAhKGkgaW4gZnJvbSkpIHtcclxuICAgICAgICAgICAgaWYgKCFhcikgYXIgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChmcm9tLCAwLCBpKTtcclxuICAgICAgICAgICAgYXJbaV0gPSBmcm9tW2ldO1xyXG4gICAgICAgIH1cclxuICAgIH1cclxuICAgIHJldHVybiB0by5jb25jYXQoYXIgfHwgQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZnJvbSkpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19hd2FpdCh2KSB7XHJcbiAgICByZXR1cm4gdGhpcyBpbnN0YW5jZW9mIF9fYXdhaXQgPyAodGhpcy52ID0gdiwgdGhpcykgOiBuZXcgX19hd2FpdCh2KTtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNHZW5lcmF0b3IodGhpc0FyZywgX2FyZ3VtZW50cywgZ2VuZXJhdG9yKSB7XHJcbiAgICBpZiAoIVN5bWJvbC5hc3luY0l0ZXJhdG9yKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiU3ltYm9sLmFzeW5jSXRlcmF0b3IgaXMgbm90IGRlZmluZWQuXCIpO1xyXG4gICAgdmFyIGcgPSBnZW5lcmF0b3IuYXBwbHkodGhpc0FyZywgX2FyZ3VtZW50cyB8fCBbXSksIGksIHEgPSBbXTtcclxuICAgIHJldHVybiBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobikgeyBpZiAoZ1tuXSkgaVtuXSA9IGZ1bmN0aW9uICh2KSB7IHJldHVybiBuZXcgUHJvbWlzZShmdW5jdGlvbiAoYSwgYikgeyBxLnB1c2goW24sIHYsIGEsIGJdKSA+IDEgfHwgcmVzdW1lKG4sIHYpOyB9KTsgfTsgfVxyXG4gICAgZnVuY3Rpb24gcmVzdW1lKG4sIHYpIHsgdHJ5IHsgc3RlcChnW25dKHYpKTsgfSBjYXRjaCAoZSkgeyBzZXR0bGUocVswXVszXSwgZSk7IH0gfVxyXG4gICAgZnVuY3Rpb24gc3RlcChyKSB7IHIudmFsdWUgaW5zdGFuY2VvZiBfX2F3YWl0ID8gUHJvbWlzZS5yZXNvbHZlKHIudmFsdWUudikudGhlbihmdWxmaWxsLCByZWplY3QpIDogc2V0dGxlKHFbMF1bMl0sIHIpOyB9XHJcbiAgICBmdW5jdGlvbiBmdWxmaWxsKHZhbHVlKSB7IHJlc3VtZShcIm5leHRcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiByZWplY3QodmFsdWUpIHsgcmVzdW1lKFwidGhyb3dcIiwgdmFsdWUpOyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUoZiwgdikgeyBpZiAoZih2KSwgcS5zaGlmdCgpLCBxLmxlbmd0aCkgcmVzdW1lKHFbMF1bMF0sIHFbMF1bMV0pOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2FzeW5jRGVsZWdhdG9yKG8pIHtcclxuICAgIHZhciBpLCBwO1xyXG4gICAgcmV0dXJuIGkgPSB7fSwgdmVyYihcIm5leHRcIiksIHZlcmIoXCJ0aHJvd1wiLCBmdW5jdGlvbiAoZSkgeyB0aHJvdyBlOyB9KSwgdmVyYihcInJldHVyblwiKSwgaVtTeW1ib2wuaXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaTtcclxuICAgIGZ1bmN0aW9uIHZlcmIobiwgZikgeyBpW25dID0gb1tuXSA/IGZ1bmN0aW9uICh2KSB7IHJldHVybiAocCA9ICFwKSA/IHsgdmFsdWU6IF9fYXdhaXQob1tuXSh2KSksIGRvbmU6IG4gPT09IFwicmV0dXJuXCIgfSA6IGYgPyBmKHYpIDogdjsgfSA6IGY7IH1cclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9fYXN5bmNWYWx1ZXMobykge1xyXG4gICAgaWYgKCFTeW1ib2wuYXN5bmNJdGVyYXRvcikgdGhyb3cgbmV3IFR5cGVFcnJvcihcIlN5bWJvbC5hc3luY0l0ZXJhdG9yIGlzIG5vdCBkZWZpbmVkLlwiKTtcclxuICAgIHZhciBtID0gb1tTeW1ib2wuYXN5bmNJdGVyYXRvcl0sIGk7XHJcbiAgICByZXR1cm4gbSA/IG0uY2FsbChvKSA6IChvID0gdHlwZW9mIF9fdmFsdWVzID09PSBcImZ1bmN0aW9uXCIgPyBfX3ZhbHVlcyhvKSA6IG9bU3ltYm9sLml0ZXJhdG9yXSgpLCBpID0ge30sIHZlcmIoXCJuZXh0XCIpLCB2ZXJiKFwidGhyb3dcIiksIHZlcmIoXCJyZXR1cm5cIiksIGlbU3ltYm9sLmFzeW5jSXRlcmF0b3JdID0gZnVuY3Rpb24gKCkgeyByZXR1cm4gdGhpczsgfSwgaSk7XHJcbiAgICBmdW5jdGlvbiB2ZXJiKG4pIHsgaVtuXSA9IG9bbl0gJiYgZnVuY3Rpb24gKHYpIHsgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlLCByZWplY3QpIHsgdiA9IG9bbl0odiksIHNldHRsZShyZXNvbHZlLCByZWplY3QsIHYuZG9uZSwgdi52YWx1ZSk7IH0pOyB9OyB9XHJcbiAgICBmdW5jdGlvbiBzZXR0bGUocmVzb2x2ZSwgcmVqZWN0LCBkLCB2KSB7IFByb21pc2UucmVzb2x2ZSh2KS50aGVuKGZ1bmN0aW9uKHYpIHsgcmVzb2x2ZSh7IHZhbHVlOiB2LCBkb25lOiBkIH0pOyB9LCByZWplY3QpOyB9XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX21ha2VUZW1wbGF0ZU9iamVjdChjb29rZWQsIHJhdykge1xyXG4gICAgaWYgKE9iamVjdC5kZWZpbmVQcm9wZXJ0eSkgeyBPYmplY3QuZGVmaW5lUHJvcGVydHkoY29va2VkLCBcInJhd1wiLCB7IHZhbHVlOiByYXcgfSk7IH0gZWxzZSB7IGNvb2tlZC5yYXcgPSByYXc7IH1cclxuICAgIHJldHVybiBjb29rZWQ7XHJcbn07XHJcblxyXG52YXIgX19zZXRNb2R1bGVEZWZhdWx0ID0gT2JqZWN0LmNyZWF0ZSA/IChmdW5jdGlvbihvLCB2KSB7XHJcbiAgICBPYmplY3QuZGVmaW5lUHJvcGVydHkobywgXCJkZWZhdWx0XCIsIHsgZW51bWVyYWJsZTogdHJ1ZSwgdmFsdWU6IHYgfSk7XHJcbn0pIDogZnVuY3Rpb24obywgdikge1xyXG4gICAgb1tcImRlZmF1bHRcIl0gPSB2O1xyXG59O1xyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0U3Rhcihtb2QpIHtcclxuICAgIGlmIChtb2QgJiYgbW9kLl9fZXNNb2R1bGUpIHJldHVybiBtb2Q7XHJcbiAgICB2YXIgcmVzdWx0ID0ge307XHJcbiAgICBpZiAobW9kICE9IG51bGwpIGZvciAodmFyIGsgaW4gbW9kKSBpZiAoayAhPT0gXCJkZWZhdWx0XCIgJiYgT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eS5jYWxsKG1vZCwgaykpIF9fY3JlYXRlQmluZGluZyhyZXN1bHQsIG1vZCwgayk7XHJcbiAgICBfX3NldE1vZHVsZURlZmF1bHQocmVzdWx0LCBtb2QpO1xyXG4gICAgcmV0dXJuIHJlc3VsdDtcclxufVxyXG5cclxuZXhwb3J0IGZ1bmN0aW9uIF9faW1wb3J0RGVmYXVsdChtb2QpIHtcclxuICAgIHJldHVybiAobW9kICYmIG1vZC5fX2VzTW9kdWxlKSA/IG1vZCA6IHsgZGVmYXVsdDogbW9kIH07XHJcbn1cclxuXHJcbmV4cG9ydCBmdW5jdGlvbiBfX2NsYXNzUHJpdmF0ZUZpZWxkR2V0KHJlY2VpdmVyLCBzdGF0ZSwga2luZCwgZikge1xyXG4gICAgaWYgKGtpbmQgPT09IFwiYVwiICYmICFmKSB0aHJvdyBuZXcgVHlwZUVycm9yKFwiUHJpdmF0ZSBhY2Nlc3NvciB3YXMgZGVmaW5lZCB3aXRob3V0IGEgZ2V0dGVyXCIpO1xyXG4gICAgaWYgKHR5cGVvZiBzdGF0ZSA9PT0gXCJmdW5jdGlvblwiID8gcmVjZWl2ZXIgIT09IHN0YXRlIHx8ICFmIDogIXN0YXRlLmhhcyhyZWNlaXZlcikpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJDYW5ub3QgcmVhZCBwcml2YXRlIG1lbWJlciBmcm9tIGFuIG9iamVjdCB3aG9zZSBjbGFzcyBkaWQgbm90IGRlY2xhcmUgaXRcIik7XHJcbiAgICByZXR1cm4ga2luZCA9PT0gXCJtXCIgPyBmIDoga2luZCA9PT0gXCJhXCIgPyBmLmNhbGwocmVjZWl2ZXIpIDogZiA/IGYudmFsdWUgOiBzdGF0ZS5nZXQocmVjZWl2ZXIpO1xyXG59XHJcblxyXG5leHBvcnQgZnVuY3Rpb24gX19jbGFzc1ByaXZhdGVGaWVsZFNldChyZWNlaXZlciwgc3RhdGUsIHZhbHVlLCBraW5kLCBmKSB7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJtXCIpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIG1ldGhvZCBpcyBub3Qgd3JpdGFibGVcIik7XHJcbiAgICBpZiAoa2luZCA9PT0gXCJhXCIgJiYgIWYpIHRocm93IG5ldyBUeXBlRXJyb3IoXCJQcml2YXRlIGFjY2Vzc29yIHdhcyBkZWZpbmVkIHdpdGhvdXQgYSBzZXR0ZXJcIik7XHJcbiAgICBpZiAodHlwZW9mIHN0YXRlID09PSBcImZ1bmN0aW9uXCIgPyByZWNlaXZlciAhPT0gc3RhdGUgfHwgIWYgOiAhc3RhdGUuaGFzKHJlY2VpdmVyKSkgdGhyb3cgbmV3IFR5cGVFcnJvcihcIkNhbm5vdCB3cml0ZSBwcml2YXRlIG1lbWJlciB0byBhbiBvYmplY3Qgd2hvc2UgY2xhc3MgZGlkIG5vdCBkZWNsYXJlIGl0XCIpO1xyXG4gICAgcmV0dXJuIChraW5kID09PSBcImFcIiA/IGYuY2FsbChyZWNlaXZlciwgdmFsdWUpIDogZiA/IGYudmFsdWUgPSB2YWx1ZSA6IHN0YXRlLnNldChyZWNlaXZlciwgdmFsdWUpKSwgdmFsdWU7XHJcbn1cclxuIiwiZXhwb3J0IHR5cGUgTGlua0hpbnRUeXBlID0gJ2ludGVybmFsJyB8ICdleHRlcm5hbCcgfCAncmVnZXgnO1xuXG5leHBvcnQgaW50ZXJmYWNlIExpbmtIaW50QmFzZSB7XG5cdGxldHRlcjogc3RyaW5nO1xuXHR0eXBlOiBMaW5rSGludFR5cGU7XG5cdGxpbmtUZXh0OiBzdHJpbmc7XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUHJldmlld0xpbmtIaW50IGV4dGVuZHMgTGlua0hpbnRCYXNlIHtcblx0bGVmdDogbnVtYmVyO1xuXHR0b3A6IG51bWJlcjtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBTb3VyY2VMaW5rSGludCBleHRlbmRzIExpbmtIaW50QmFzZSB7XG5cdGluZGV4OiBudW1iZXJcbn1cblxuZXhwb3J0IGNsYXNzIFNldHRpbmdzIHtcblx0Ly8gRGVmYXVsdHMgYXMgaW4gVmltaXVtIGV4dGVuc2lvbiBmb3IgYnJvd3NlcnNcblx0bGV0dGVyczogc3RyaW5nID0gJ3NhZGZqa2xld2NtcGdoJztcblx0anVtcFRvQW55d2hlcmVSZWdleDogc3RyaW5nID0gJ1xcXFxiXFxcXHd7Myx9XFxcXGInO1xufVxuXG5leHBvcnQgY2xhc3MgUHJvY2Vzc29yIHtcblx0bGV0dGVyczogc3RyaW5nO1xuXG5cdHB1YmxpYyBpbml0OiAoKSA9PiBMaW5rSGludEJhc2VbXTtcbn1cbiIsImltcG9ydCB7RWRpdG9yfSBmcm9tIFwiY29kZW1pcnJvclwiO1xuaW1wb3J0IHtTb3VyY2VMaW5rSGludH0gZnJvbSBcIi4uLy4uL3R5cGVzXCI7XG5cbi8qKlxuICogR2V0IG9ubHkgdmlzaWJsZSBjb250ZW50XG4gKiBAcGFyYW0gY21FZGl0b3JcbiAqIEByZXR1cm5zIExldHRlciBvZmZzZXQgYW5kIHZpc2libGUgY29udGVudCBhcyBhIHN0cmluZ1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0VmlzaWJsZUxpbmVUZXh0KGNtRWRpdG9yOiBFZGl0b3IpOiB7IGluZE9mZnNldDogbnVtYmVyLCBzdHJzOiBzdHJpbmcgfSB7XG4gICAgY29uc3Qgc2Nyb2xsSW5mbyA9IGNtRWRpdG9yLmdldFNjcm9sbEluZm8oKTtcbiAgICBjb25zdCB7IGxpbmU6IGZyb20gfSA9IGNtRWRpdG9yLmNvb3Jkc0NoYXIoeyBsZWZ0OiAwLCB0b3A6IDAgfSwgJ3BhZ2UnKTtcbiAgICBjb25zdCB7IGxpbmU6IHRvIH0gPSBjbUVkaXRvci5jb29yZHNDaGFyKHsgbGVmdDogc2Nyb2xsSW5mby5sZWZ0LCB0b3A6IHNjcm9sbEluZm8udG9wICsgc2Nyb2xsSW5mby5oZWlnaHR9KVxuICAgIGNvbnN0IGluZE9mZnNldCA9IGNtRWRpdG9yLmluZGV4RnJvbVBvcyh7Y2g6MCwgbGluZTogZnJvbX0pXG4gICAgY29uc3Qgc3RycyA9IGNtRWRpdG9yLmdldFJhbmdlKHtjaDogMCwgbGluZTogZnJvbX0sIHtjaDogMCwgbGluZTogdG8gKyAxfSlcblxuICAgIHJldHVybiB7IGluZE9mZnNldCwgc3RycyB9O1xufVxuXG4vKipcbiAqXG4gKiBAcGFyYW0gYWxwaGFiZXQgLSBMZXR0ZXJzIHdoaWNoIHVzZWQgdG8gcHJvZHVjZSBoaW50c1xuICogQHBhcmFtIG51bUxpbmtIaW50cyAtIENvdW50IG9mIG5lZWRlZCBsaW5rc1xuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0TGlua0hpbnRMZXR0ZXJzKGFscGhhYmV0OiBzdHJpbmcsIG51bUxpbmtIaW50czogbnVtYmVyKTogc3RyaW5nW10ge1xuICAgIGNvbnN0IGFscGhhYmV0VXBwZXJjYXNlID0gYWxwaGFiZXQudG9VcHBlckNhc2UoKVxuXG4gICAgbGV0IHByZWZpeENvdW50ID0gTWF0aC5jZWlsKChudW1MaW5rSGludHMgLSBhbHBoYWJldFVwcGVyY2FzZS5sZW5ndGgpIC8gKGFscGhhYmV0VXBwZXJjYXNlLmxlbmd0aCAtIDEpKVxuXG4gICAgLy8gZW5zdXJlIDAgPD0gcHJlZml4Q291bnQgPD0gYWxwaGFiZXQubGVuZ3RoXG4gICAgcHJlZml4Q291bnQgPSBNYXRoLm1heChwcmVmaXhDb3VudCwgMCk7XG4gICAgcHJlZml4Q291bnQgPSBNYXRoLm1pbihwcmVmaXhDb3VudCwgYWxwaGFiZXRVcHBlcmNhc2UubGVuZ3RoKTtcblxuICAgIGNvbnN0IHByZWZpeGVzID0gWycnLCAuLi5BcnJheS5mcm9tKGFscGhhYmV0VXBwZXJjYXNlLnNsaWNlKDAsIHByZWZpeENvdW50KSldO1xuXG4gICAgY29uc3QgbGlua0hpbnRMZXR0ZXJzID0gW11cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHByZWZpeGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHByZWZpeCA9IHByZWZpeGVzW2ldXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYWxwaGFiZXRVcHBlcmNhc2UubGVuZ3RoOyBqKyspIHtcbiAgICAgICAgICAgIGlmIChsaW5rSGludExldHRlcnMubGVuZ3RoIDwgbnVtTGlua0hpbnRzKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgbGV0dGVyID0gYWxwaGFiZXRVcHBlcmNhc2Vbal07XG4gICAgICAgICAgICAgICAgaWYgKHByZWZpeCA9PT0gJycpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKCFwcmVmaXhlcy5jb250YWlucyhsZXR0ZXIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsaW5rSGludExldHRlcnMucHVzaChsZXR0ZXIpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGlua0hpbnRMZXR0ZXJzLnB1c2gocHJlZml4ICsgbGV0dGVyKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gbGlua0hpbnRMZXR0ZXJzO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2V0TURIaW50TGlua3MoY29udGVudDogc3RyaW5nLCBvZmZzZXQ6IG51bWJlciwgbGV0dGVyczogc3RyaW5nKTogU291cmNlTGlua0hpbnRbXSB7XG4gICAgLy8gZXhwZWN0aW5nIGVpdGhlciBbW0xpbmtdXSBvciBbW0xpbmt8VGl0bGVdXVxuICAgIGNvbnN0IHJlZ0V4SW50ZXJuYWwgPSAvXFxbXFxbKC4rPykoXFx8Lis/KT9dXS9nO1xuICAgIC8vIGV4cGVjdGluZyBbVGl0bGVdKC4uL2V4YW1wbGUubWQpXG4gICAgY29uc3QgcmVnRXhNZEludGVybmFsID0gL1xcWy4rP11cXCgoKFxcLlxcLnxcXHd8XFxkKS4rPylcXCkvZztcbiAgICAvLyBleHBlY3RpbmcgW1RpdGxlXShmaWxlOi8vbGluaykgb3IgW1RpdGxlXShodHRwczovL2xpbmspXG4gICAgY29uc3QgcmVnRXhFeHRlcm5hbCA9IC9cXFsuKz9dXFwoKChodHRwcz86fGZpbGU6KS4rPylcXCkvZztcbiAgICAvLyBleHBlY3RpbmcgaHR0cDovL2hvZ2Vob2dlIG9yIGh0dHBzOi8vaG9nZWhvZ2VcbiAgICBjb25zdCByZWdFeFVybCA9IC8oIHxcXG58XikoaHR0cHM/OlxcL1xcL1teIFxcbl0rKS9nO1xuXG4gICAgbGV0IGxpbmtzV2l0aEluZGV4OiB7IGluZGV4OiBudW1iZXIsIHR5cGU6ICdpbnRlcm5hbCcgfCAnZXh0ZXJuYWwnLCBsaW5rVGV4dDogc3RyaW5nIH1bXSA9IFtdO1xuICAgIGxldCByZWdFeFJlc3VsdDtcblxuICAgIHdoaWxlKHJlZ0V4UmVzdWx0ID0gcmVnRXhJbnRlcm5hbC5leGVjKGNvbnRlbnQpKSB7XG4gICAgICAgIGNvbnN0IGxpbmtUZXh0ID0gcmVnRXhSZXN1bHRbMV07XG4gICAgICAgIGxpbmtzV2l0aEluZGV4LnB1c2goeyBpbmRleDogcmVnRXhSZXN1bHQuaW5kZXggKyBvZmZzZXQsIHR5cGU6ICdpbnRlcm5hbCcsIGxpbmtUZXh0IH0pO1xuICAgIH1cblxuICAgIHdoaWxlKHJlZ0V4UmVzdWx0ID0gcmVnRXhNZEludGVybmFsLmV4ZWMoY29udGVudCkpIHtcbiAgICAgICAgY29uc3QgbGlua1RleHQgPSByZWdFeFJlc3VsdFsxXTtcbiAgICAgICAgbGlua3NXaXRoSW5kZXgucHVzaCh7IGluZGV4OiByZWdFeFJlc3VsdC5pbmRleCArIG9mZnNldCwgdHlwZTogJ2ludGVybmFsJywgbGlua1RleHQgfSk7XG4gICAgfVxuXG4gICAgd2hpbGUocmVnRXhSZXN1bHQgPSByZWdFeEV4dGVybmFsLmV4ZWMoY29udGVudCkpIHtcbiAgICAgICAgY29uc3QgbGlua1RleHQgPSByZWdFeFJlc3VsdFsxXTtcbiAgICAgICAgbGlua3NXaXRoSW5kZXgucHVzaCh7IGluZGV4OiByZWdFeFJlc3VsdC5pbmRleCArIG9mZnNldCwgdHlwZTogJ2V4dGVybmFsJywgbGlua1RleHQgfSlcbiAgICB9XG5cbiAgICB3aGlsZShyZWdFeFJlc3VsdCA9IHJlZ0V4VXJsLmV4ZWMoY29udGVudCkpIHtcbiAgICAgICAgY29uc3QgbGlua1RleHQgPSByZWdFeFJlc3VsdFsyXTtcbiAgICAgICAgbGlua3NXaXRoSW5kZXgucHVzaCh7IGluZGV4OiByZWdFeFJlc3VsdC5pbmRleCArIG9mZnNldCArIDEsIHR5cGU6ICdleHRlcm5hbCcsIGxpbmtUZXh0IH0pXG4gICAgfVxuXG4gICAgY29uc3QgbGlua0hpbnRMZXR0ZXJzID0gZ2V0TGlua0hpbnRMZXR0ZXJzKGxldHRlcnMsIGxpbmtzV2l0aEluZGV4Lmxlbmd0aCk7XG5cbiAgICBjb25zdCBsaW5rc1dpdGhMZXR0ZXI6IFNvdXJjZUxpbmtIaW50W10gPSBbXTtcbiAgICBsaW5rc1dpdGhJbmRleFxuICAgICAgICAuc29ydCgoeCx5KSA9PiB4LmluZGV4IC0geS5pbmRleClcbiAgICAgICAgLmZvckVhY2goKGxpbmtIaW50LCBpKSA9PiB7XG4gICAgICAgICAgICBsaW5rc1dpdGhMZXR0ZXIucHVzaCh7IGxldHRlcjogbGlua0hpbnRMZXR0ZXJzW2ldLCAuLi5saW5rSGludH0pO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiBsaW5rc1dpdGhMZXR0ZXIuZmlsdGVyKGxpbmsgPT4gbGluay5sZXR0ZXIpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlV2lkZ2V0RWxlbWVudChjb250ZW50OiBzdHJpbmcpIHtcbiAgICBjb25zdCBsaW5rSGludEVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnZGl2Jyk7XG4gICAgbGlua0hpbnRFbC5jbGFzc0xpc3QuYWRkKCdqbCcpO1xuICAgIGxpbmtIaW50RWwuY2xhc3NMaXN0LmFkZCgncG9wb3ZlcicpO1xuICAgIGxpbmtIaW50RWwuaW5uZXJIVE1MID0gY29udGVudDtcbiAgICByZXR1cm4gbGlua0hpbnRFbDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlTb3VyY2VQb3BvdmVycyhjbUVkaXRvcjogRWRpdG9yLCBsaW5rS2V5TWFwOiBTb3VyY2VMaW5rSGludFtdKTogdm9pZCB7XG4gICAgY29uc3QgZHJhd1dpZGdldCA9IChjbUVkaXRvcjogRWRpdG9yLCBsaW5rSGludDogU291cmNlTGlua0hpbnQpID0+IHtcbiAgICAgICAgY29uc3QgcG9zID0gY21FZGl0b3IucG9zRnJvbUluZGV4KGxpbmtIaW50LmluZGV4KTtcbiAgICAgICAgLy8gdGhlIGZvdXJ0aCBwYXJhbWV0ZXIgaXMgdW5kb2N1bWVudGVkLiBpdCBzcGVjaWZpZXMgd2hlcmUgdGhlIHdpZGdldCBzaG91bGQgYmUgcGxhY2VcbiAgICAgICAgcmV0dXJuIChjbUVkaXRvciBhcyBhbnkpLmFkZFdpZGdldChwb3MsIGNyZWF0ZVdpZGdldEVsZW1lbnQobGlua0hpbnQubGV0dGVyKSwgZmFsc2UsICdvdmVyJyk7XG4gICAgfVxuXG4gICAgbGlua0tleU1hcC5mb3JFYWNoKHggPT4gZHJhd1dpZGdldChjbUVkaXRvciwgeCkpO1xufVxuXG4iLCJpbXBvcnQge2dldExpbmtIaW50TGV0dGVyc30gZnJvbSBcIi4vY29tbW9uXCI7XG5pbXBvcnQge1NvdXJjZUxpbmtIaW50fSBmcm9tIFwiLi4vLi4vdHlwZXNcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIGV4dHJhY3RSZWdleHBCbG9ja3MoY29udGVudDogc3RyaW5nLCBvZmZzZXQ6IG51bWJlciwgcmVnZXhwOiBzdHJpbmcsIGxldHRlcnM6IHN0cmluZykge1xuICAgIGNvbnN0IHJlZ0V4VXJsID0gbmV3IFJlZ0V4cChyZWdleHAsICdnJyk7XG5cbiAgICBsZXQgbGlua3NXaXRoSW5kZXg6IHtcbiAgICAgICAgaW5kZXg6IG51bWJlcjtcbiAgICAgICAgdHlwZTogXCJyZWdleFwiO1xuICAgICAgICBsaW5rVGV4dDogc3RyaW5nO1xuICAgIH1bXSA9IFtdO1xuXG4gICAgbGV0IHJlZ0V4UmVzdWx0O1xuXG4gICAgd2hpbGUgKChyZWdFeFJlc3VsdCA9IHJlZ0V4VXJsLmV4ZWMoY29udGVudCkpKSB7XG4gICAgICAgIGNvbnN0IGxpbmtUZXh0ID0gcmVnRXhSZXN1bHRbMV07XG4gICAgICAgIGxpbmtzV2l0aEluZGV4LnB1c2goe1xuICAgICAgICAgICAgaW5kZXg6IHJlZ0V4UmVzdWx0LmluZGV4ICsgb2Zmc2V0LFxuICAgICAgICAgICAgdHlwZTogXCJyZWdleFwiLFxuICAgICAgICAgICAgbGlua1RleHQsXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIGNvbnN0IGxpbmtIaW50TGV0dGVycyA9IGdldExpbmtIaW50TGV0dGVycyhsZXR0ZXJzLCBsaW5rc1dpdGhJbmRleC5sZW5ndGgpO1xuXG4gICAgY29uc3QgbGlua3NXaXRoTGV0dGVyOiBTb3VyY2VMaW5rSGludFtdID0gW107XG4gICAgbGlua3NXaXRoSW5kZXhcbiAgICAgICAgLnNvcnQoKHgsIHkpID0+IHguaW5kZXggLSB5LmluZGV4KVxuICAgICAgICAuZm9yRWFjaCgobGlua0hpbnQsIGkpID0+IHtcbiAgICAgICAgICAgIGxpbmtzV2l0aExldHRlci5wdXNoKHtcbiAgICAgICAgICAgICAgICBsZXR0ZXI6IGxpbmtIaW50TGV0dGVyc1tpXSxcbiAgICAgICAgICAgICAgICAuLi5saW5rSGludCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcblxuICAgIHJldHVybiBsaW5rc1dpdGhMZXR0ZXIuZmlsdGVyKGxpbmsgPT4gbGluay5sZXR0ZXIpO1xufVxuIiwiaW1wb3J0IHtFZGl0b3J9IGZyb20gXCJjb2RlbWlycm9yXCI7XG5pbXBvcnQge1Byb2Nlc3NvciwgU291cmNlTGlua0hpbnR9IGZyb20gXCIuLi8uLi90eXBlc1wiO1xuaW1wb3J0IHtkaXNwbGF5U291cmNlUG9wb3ZlcnMsIGdldFZpc2libGVMaW5lVGV4dH0gZnJvbSBcIi4uL3V0aWxzL2NvbW1vblwiO1xuaW1wb3J0IHtleHRyYWN0UmVnZXhwQmxvY2tzfSBmcm9tIFwiLi4vdXRpbHMvcmVnZXhwXCI7XG5cbmV4cG9ydCBkZWZhdWx0IGNsYXNzIFJlZ2V4cFByb2Nlc3NvciBpbXBsZW1lbnRzIFByb2Nlc3NvciB7XG4gICAgY21FZGl0b3I6IEVkaXRvcjtcbiAgICByZWdleHA6IHN0cmluZztcbiAgICBsZXR0ZXJzOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihjbUVkaXRvcjogRWRpdG9yLCByZWdleHA6IHN0cmluZywgYWxwaGFiZXQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNtRWRpdG9yID0gY21FZGl0b3I7XG4gICAgICAgIHRoaXMucmVnZXhwID0gcmVnZXhwO1xuICAgICAgICB0aGlzLmxldHRlcnMgPSBhbHBoYWJldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgpOiBTb3VyY2VMaW5rSGludFtdIHtcbiAgICAgICAgY29uc3QgW2NvbnRlbnQsIG9mZnNldF0gPSB0aGlzLmdldFZpc2libGVDb250ZW50KCk7XG4gICAgICAgIGNvbnN0IGxpbmtzID0gdGhpcy5nZXRMaW5rcyhjb250ZW50LCBvZmZzZXQpO1xuXG4gICAgICAgIHRoaXMuZGlzcGxheShsaW5rcyk7XG4gICAgICAgIHJldHVybiBsaW5rcztcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFZpc2libGVDb250ZW50KCk6IFtzdHJpbmcsIG51bWJlcl0ge1xuICAgICAgICBjb25zdCB7IGNtRWRpdG9yIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7IGluZE9mZnNldCwgc3RycyB9ID0gZ2V0VmlzaWJsZUxpbmVUZXh0KGNtRWRpdG9yKTtcblxuICAgICAgICByZXR1cm4gW3N0cnMsIGluZE9mZnNldF07XG4gICAgfVxuXG4gICAgcHJpdmF0ZSBnZXRMaW5rcyhjb250ZW50OiBzdHJpbmcsIG9mZnNldDogbnVtYmVyKTogU291cmNlTGlua0hpbnRbXSB7XG4gICAgICAgIGNvbnN0IHsgcmVnZXhwLCBsZXR0ZXJzIH0gPSB0aGlzXG4gICAgICAgIHJldHVybiBleHRyYWN0UmVnZXhwQmxvY2tzKGNvbnRlbnQsIG9mZnNldCwgcmVnZXhwLCBsZXR0ZXJzKTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGRpc3BsYXkobGlua3M6IFNvdXJjZUxpbmtIaW50W10pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgeyBjbUVkaXRvciB9ID0gdGhpc1xuICAgICAgICBkaXNwbGF5U291cmNlUG9wb3ZlcnMoY21FZGl0b3IsIGxpbmtzKTtcbiAgICB9XG59IiwiaW1wb3J0IHtMaW5rSGludFR5cGUsIFByZXZpZXdMaW5rSGludH0gZnJvbSBcIi4uLy4uL3R5cGVzXCI7XG5pbXBvcnQge2dldExpbmtIaW50TGV0dGVyc30gZnJvbSBcIi4vY29tbW9uXCI7XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRQcmV2aWV3TGlua0hpbnRzKHByZXZpZXdWaWV3RWw6IEhUTUxFbGVtZW50LCBsZXR0ZXJzOiBzdHJpbmcgKTogUHJldmlld0xpbmtIaW50W10ge1xuICAgIGNvbnN0IGFuY2hvckVscyA9IHByZXZpZXdWaWV3RWwucXVlcnlTZWxlY3RvckFsbCgnYScpO1xuICAgIGNvbnN0IGVtYmVkRWxzID0gcHJldmlld1ZpZXdFbC5xdWVyeVNlbGVjdG9yQWxsKCcuaW50ZXJuYWwtZW1iZWQnKTtcblxuICAgIGNvbnN0IGxpbmtIaW50czogUHJldmlld0xpbmtIaW50W10gPSBbXTtcbiAgICBhbmNob3JFbHMuZm9yRWFjaCgoYW5jaG9yRWwsIF9pKSA9PiB7XG4gICAgICAgIGlmIChjaGVja0lzUHJldmlld0VsT25TY3JlZW4ocHJldmlld1ZpZXdFbCwgYW5jaG9yRWwpKSB7XG4gICAgICAgICAgICByZXR1cm5cbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGxpbmtUeXBlOiBMaW5rSGludFR5cGUgPSBhbmNob3JFbC5jbGFzc0xpc3QuY29udGFpbnMoJ2ludGVybmFsLWxpbmsnKVxuICAgICAgICAgICAgPyAnaW50ZXJuYWwnXG4gICAgICAgICAgICA6ICdleHRlcm5hbCc7XG5cbiAgICAgICAgY29uc3QgbGlua1RleHQgPSBsaW5rVHlwZSA9PT0gJ2ludGVybmFsJ1xuICAgICAgICAgICAgPyBhbmNob3JFbC5kYXRhc2V0WydocmVmJ11cbiAgICAgICAgICAgIDogYW5jaG9yRWwuaHJlZjtcblxuICAgICAgICBsZXQgb2Zmc2V0UGFyZW50ID0gYW5jaG9yRWwub2Zmc2V0UGFyZW50IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICBsZXQgdG9wID0gYW5jaG9yRWwub2Zmc2V0VG9wO1xuICAgICAgICBsZXQgbGVmdCA9IGFuY2hvckVsLm9mZnNldExlZnQ7XG5cbiAgICAgICAgd2hpbGUgKG9mZnNldFBhcmVudCkge1xuICAgICAgICAgICAgaWYgKG9mZnNldFBhcmVudCA9PSBwcmV2aWV3Vmlld0VsKSB7XG4gICAgICAgICAgICAgICAgb2Zmc2V0UGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0b3AgKz0gb2Zmc2V0UGFyZW50Lm9mZnNldFRvcDtcbiAgICAgICAgICAgICAgICBsZWZ0ICs9IG9mZnNldFBhcmVudC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgIG9mZnNldFBhcmVudCA9IG9mZnNldFBhcmVudC5vZmZzZXRQYXJlbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBsaW5rSGludHMucHVzaCh7XG4gICAgICAgICAgICBsZXR0ZXI6ICcnLFxuICAgICAgICAgICAgbGlua1RleHQ6IGxpbmtUZXh0LFxuICAgICAgICAgICAgdHlwZTogbGlua1R5cGUsXG4gICAgICAgICAgICB0b3A6IHRvcCxcbiAgICAgICAgICAgIGxlZnQ6IGxlZnQsXG4gICAgICAgIH0pO1xuICAgIH0pO1xuXG4gICAgZW1iZWRFbHMuZm9yRWFjaCgoZW1iZWRFbCwgX2kpID0+IHtcbiAgICAgICAgY29uc3QgbGlua1RleHQgPSBlbWJlZEVsLmdldEF0dHJpYnV0ZSgnc3JjJyk7XG4gICAgICAgIGNvbnN0IGxpbmtFbCA9IGVtYmVkRWwucXVlcnlTZWxlY3RvcignLm1hcmtkb3duLWVtYmVkLWxpbmsnKSBhcyBIVE1MRWxlbWVudDtcblxuICAgICAgICBpZiAobGlua1RleHQgJiYgbGlua0VsKSB7XG4gICAgICAgICAgICBpZiAoY2hlY2tJc1ByZXZpZXdFbE9uU2NyZWVuKHByZXZpZXdWaWV3RWwsIGxpbmtFbCkpIHtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGV0IG9mZnNldFBhcmVudCA9IGxpbmtFbC5vZmZzZXRQYXJlbnQgYXMgSFRNTEVsZW1lbnQ7XG4gICAgICAgICAgICBsZXQgdG9wID0gbGlua0VsLm9mZnNldFRvcDtcbiAgICAgICAgICAgIGxldCBsZWZ0ID0gbGlua0VsLm9mZnNldExlZnQ7XG5cbiAgICAgICAgICAgIHdoaWxlIChvZmZzZXRQYXJlbnQpIHtcbiAgICAgICAgICAgICAgICBpZiAob2Zmc2V0UGFyZW50ID09IHByZXZpZXdWaWV3RWwpIHtcbiAgICAgICAgICAgICAgICAgICAgb2Zmc2V0UGFyZW50ID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHRvcCArPSBvZmZzZXRQYXJlbnQub2Zmc2V0VG9wO1xuICAgICAgICAgICAgICAgICAgICBsZWZ0ICs9IG9mZnNldFBhcmVudC5vZmZzZXRMZWZ0O1xuICAgICAgICAgICAgICAgICAgICBvZmZzZXRQYXJlbnQgPSBvZmZzZXRQYXJlbnQub2Zmc2V0UGFyZW50IGFzIEhUTUxFbGVtZW50O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbGlua0hpbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGxldHRlcjogJycsXG4gICAgICAgICAgICAgICAgbGlua1RleHQ6IGxpbmtUZXh0LFxuICAgICAgICAgICAgICAgIHR5cGU6ICdpbnRlcm5hbCcsXG4gICAgICAgICAgICAgICAgdG9wOiB0b3AsXG4gICAgICAgICAgICAgICAgbGVmdDogbGVmdCxcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG5cbiAgICBjb25zdCBzb3J0ZWRMaW5rSGludHMgPSBsaW5rSGludHMuc29ydCgoYSwgYikgPT4ge1xuICAgICAgICBpZiAoYS50b3AgPiBiLnRvcCkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH0gZWxzZSBpZiAoYS50b3AgPT09IGIudG9wKSB7XG4gICAgICAgICAgICBpZiAoYS5sZWZ0ID4gYi5sZWZ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGEubGVmdCA9PT0gYi5sZWZ0KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiAtMTtcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgY29uc3QgbGlua0hpbnRMZXR0ZXJzID0gZ2V0TGlua0hpbnRMZXR0ZXJzKGxldHRlcnMsIHNvcnRlZExpbmtIaW50cy5sZW5ndGgpO1xuXG4gICAgc29ydGVkTGlua0hpbnRzLmZvckVhY2goKGxpbmtIaW50LCBpKSA9PiB7XG4gICAgICAgIGxpbmtIaW50LmxldHRlciA9IGxpbmtIaW50TGV0dGVyc1tpXTtcbiAgICB9KTtcblxuICAgIHJldHVybiBzb3J0ZWRMaW5rSGludHM7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjaGVja0lzUHJldmlld0VsT25TY3JlZW4ocGFyZW50OiBIVE1MRWxlbWVudCwgZWw6IEhUTUxFbGVtZW50KSB7XG4gICAgcmV0dXJuIGVsLm9mZnNldFRvcCA8IHBhcmVudC5zY3JvbGxUb3AgfHwgZWwub2Zmc2V0VG9wID4gcGFyZW50LnNjcm9sbFRvcCArIHBhcmVudC5vZmZzZXRIZWlnaHRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGRpc3BsYXlQcmV2aWV3UG9wb3ZlcnMobWFya2Rvd25QcmV2aWV3Vmlld0VsOiBIVE1MRWxlbWVudCwgbGlua0hpbnRzOiBQcmV2aWV3TGlua0hpbnRbXSk6IHZvaWQge1xuICAgIGZvciAobGV0IGxpbmtIaW50IG9mIGxpbmtIaW50cykge1xuICAgICAgICBjb25zdCBsaW5rSGludEVsID0gbWFya2Rvd25QcmV2aWV3Vmlld0VsLmNyZWF0ZUVsKCdkaXYnKTtcbiAgICAgICAgbGlua0hpbnRFbC5zdHlsZS50b3AgPSBsaW5rSGludC50b3AgKyAncHgnO1xuICAgICAgICBsaW5rSGludEVsLnN0eWxlLmxlZnQgPSBsaW5rSGludC5sZWZ0ICsgJ3B4JztcblxuICAgICAgICBsaW5rSGludEVsLnRleHRDb250ZW50ID0gbGlua0hpbnQubGV0dGVyO1xuICAgICAgICBsaW5rSGludEVsLmNsYXNzTGlzdC5hZGQoJ2psJyk7XG4gICAgICAgIGxpbmtIaW50RWwuY2xhc3NMaXN0LmFkZCgncG9wb3ZlcicpO1xuICAgIH1cbn1cblxuIiwiaW1wb3J0IHtQcmV2aWV3TGlua0hpbnR9IGZyb20gXCIuLi8uLi90eXBlc1wiO1xuaW1wb3J0IHtkaXNwbGF5UHJldmlld1BvcG92ZXJzLCBnZXRQcmV2aWV3TGlua0hpbnRzfSBmcm9tIFwiLi4vdXRpbHMvcHJldmlld1wiO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBQcmV2aWV3TGlua1Byb2Nlc3NvciB7XG4gICAgdmlldzogSFRNTEVsZW1lbnQ7XG4gICAgYWxwaGFiZXQ6IHN0cmluZztcblxuICAgIGNvbnN0cnVjdG9yKHZpZXc6IEhUTUxFbGVtZW50LCBhbHBoYWJldDogc3RyaW5nKSB7XG4gICAgICAgIHRoaXMudmlldyA9IHZpZXc7XG4gICAgICAgIHRoaXMuYWxwaGFiZXQgPSBhbHBoYWJldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgpOiBQcmV2aWV3TGlua0hpbnRbXSB7XG4gICAgICAgIGNvbnN0IHsgdmlldywgYWxwaGFiZXQgfSA9IHRoaXNcbiAgICAgICAgY29uc3QgbGlua3MgPSBnZXRQcmV2aWV3TGlua0hpbnRzKHZpZXcsIGFscGhhYmV0KTtcbiAgICAgICAgZGlzcGxheVByZXZpZXdQb3BvdmVycyh2aWV3LCBsaW5rcyk7XG4gICAgICAgIHJldHVybiBsaW5rcztcbiAgICB9XG59IiwiaW1wb3J0IHtQcm9jZXNzb3IsIFNvdXJjZUxpbmtIaW50fSBmcm9tIFwiLi4vLi4vdHlwZXNcIjtcbmltcG9ydCB7RWRpdG9yfSBmcm9tIFwiY29kZW1pcnJvclwiO1xuaW1wb3J0IHtkaXNwbGF5U291cmNlUG9wb3ZlcnMsIGdldE1ESGludExpbmtzLCBnZXRWaXNpYmxlTGluZVRleHR9IGZyb20gXCIuLi91dGlscy9jb21tb25cIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgU291cmNlTGlua1Byb2Nlc3NvciBpbXBsZW1lbnRzIFByb2Nlc3NvciB7XG4gICAgY21FZGl0b3I6IEVkaXRvcjtcbiAgICBsZXR0ZXJzOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihlZGl0b3I6IEVkaXRvciwgYWxwaGFiZXQ6IHN0cmluZykge1xuICAgICAgICB0aGlzLmNtRWRpdG9yID0gZWRpdG9yO1xuICAgICAgICB0aGlzLmxldHRlcnMgPSBhbHBoYWJldDtcbiAgICB9XG5cbiAgICBwdWJsaWMgaW5pdCgpIHtcbiAgICAgICAgY29uc3QgeyBjbUVkaXRvciB9ID0gdGhpcztcblxuICAgICAgICBjb25zdCBsaW5rSGludHMgPSB0aGlzLmdldFNvdXJjZUxpbmtIaW50cyhjbUVkaXRvcik7XG4gICAgICAgIGRpc3BsYXlTb3VyY2VQb3BvdmVycyhjbUVkaXRvciwgbGlua0hpbnRzKTtcblxuICAgICAgICByZXR1cm4gbGlua0hpbnRzO1xuICAgIH1cblxuICAgIHByaXZhdGUgZ2V0U291cmNlTGlua0hpbnRzID0gKGNtRWRpdG9yOiBFZGl0b3IpOiBTb3VyY2VMaW5rSGludFtdID0+IHtcbiAgICAgICAgY29uc3QgeyBsZXR0ZXJzIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7IGluZE9mZnNldCwgc3RycyB9ID0gZ2V0VmlzaWJsZUxpbmVUZXh0KGNtRWRpdG9yKTtcblxuICAgICAgICByZXR1cm4gZ2V0TURIaW50TGlua3Moc3RycywgaW5kT2Zmc2V0LCBsZXR0ZXJzKTtcbiAgICB9XG59IiwiaW1wb3J0IHtQcm9jZXNzb3IsIFNvdXJjZUxpbmtIaW50fSBmcm9tIFwiLi4vLi4vdHlwZXNcIjtcbmltcG9ydCB7RWRpdG9yVmlld30gZnJvbSBcIkBjb2RlbWlycm9yL3ZpZXdcIjtcbmltcG9ydCB7Z2V0TURIaW50TGlua3N9IGZyb20gXCIuLi91dGlscy9jb21tb25cIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGl2ZVByZXZpZXdMaW5rUHJvY2Vzc29yIGltcGxlbWVudHMgUHJvY2Vzc29yIHtcbiAgICBjbUVkaXRvcjogRWRpdG9yVmlldztcbiAgICBsZXR0ZXJzOiBzdHJpbmc7XG5cbiAgICBjb25zdHJ1Y3RvcihlZGl0b3I6IEVkaXRvclZpZXcsIGFscGhhYmV0OiBzdHJpbmcpIHtcbiAgICAgICAgdGhpcy5jbUVkaXRvciA9IGVkaXRvcjtcbiAgICAgICAgdGhpcy5sZXR0ZXJzID0gYWxwaGFiZXQ7XG4gICAgfVxuXG4gICAgcHVibGljIGluaXQoKTogU291cmNlTGlua0hpbnRbXSB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldFNvdXJjZUxpbmtIaW50cygpO1xuICAgIH1cblxuICAgIHB1YmxpYyBnZXRWaXNpYmxlTGluZXMoKSB7XG4gICAgICAgIGNvbnN0IHsgY21FZGl0b3IgfSA9IHRoaXM7XG5cbiAgICAgICAgY29uc3QgeyBmcm9tLCB0byB9ID0gY21FZGl0b3Iudmlld3BvcnQ7XG4gICAgICAgIGNvbnN0IGNvbnRlbnQgPSBjbUVkaXRvci5zdGF0ZS5zbGljZURvYyhmcm9tLCB0byk7XG5cbiAgICAgICAgcmV0dXJuIHsgaW5kZXg6IGZyb20sIGNvbnRlbnQgfTtcbiAgICB9XG5cbiAgICBwcml2YXRlIGdldFNvdXJjZUxpbmtIaW50cyA9ICgpOiBTb3VyY2VMaW5rSGludFtdID0+IHtcbiAgICAgICAgY29uc3QgeyBsZXR0ZXJzIH0gPSB0aGlzO1xuICAgICAgICBjb25zdCB7IGluZGV4LCBjb250ZW50IH0gPSB0aGlzLmdldFZpc2libGVMaW5lcygpO1xuXG4gICAgICAgIHJldHVybiBnZXRNREhpbnRMaW5rcyhjb250ZW50LCBpbmRleCwgbGV0dGVycyk7XG4gICAgfVxufSIsImltcG9ydCB7V2lkZ2V0VHlwZX0gZnJvbSBcIkBjb2RlbWlycm9yL3ZpZXdcIjtcblxuZXhwb3J0IGNsYXNzIE1hcmtXaWRnZXQgZXh0ZW5kcyBXaWRnZXRUeXBlIHtcbiAgICBjb25zdHJ1Y3RvcihyZWFkb25seSBtYXJrOiBzdHJpbmcpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICB9XG5cbiAgICBlcShvdGhlcjogTWFya1dpZGdldCkge1xuICAgICAgICByZXR1cm4gb3RoZXIubWFyayA9PT0gdGhpcy5tYXJrO1xuICAgIH1cblxuICAgIHRvRE9NKCkge1xuICAgICAgICBjb25zdCBtYXJrID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInNwYW5cIik7XG4gICAgICAgIG1hcmsuaW5uZXJUZXh0ID0gdGhpcy5tYXJrO1xuXG4gICAgICAgIGNvbnN0IHdyYXBwZXIgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO1xuICAgICAgICB3cmFwcGVyLnN0eWxlLmRpc3BsYXkgPSBcImlubGluZS1ibG9ja1wiO1xuICAgICAgICB3cmFwcGVyLnN0eWxlLnBvc2l0aW9uID0gXCJhYnNvbHV0ZVwiO1xuICAgICAgICB3cmFwcGVyLmNsYXNzTGlzdC5hZGQoJ2psJyk7XG4gICAgICAgIHdyYXBwZXIuY2xhc3NMaXN0LmFkZCgncG9wb3ZlcicpO1xuICAgICAgICB3cmFwcGVyLmFwcGVuZChtYXJrKTtcblxuICAgICAgICByZXR1cm4gd3JhcHBlcjtcbiAgICB9XG5cbiAgICBpZ25vcmVFdmVudCgpIHtcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbn1cbiIsImltcG9ydCB7XG4gICAgRGVjb3JhdGlvbixcbiAgICBEZWNvcmF0aW9uU2V0LFxuICAgIEVkaXRvclZpZXcsXG4gICAgVmlld1VwZGF0ZSxcbn0gZnJvbSBcIkBjb2RlbWlycm9yL3ZpZXdcIjtcbmltcG9ydCB7IE1hcmtXaWRnZXQgfSBmcm9tIFwiLi9NYXJrV2lkZ2V0XCI7XG5pbXBvcnQge1NvdXJjZUxpbmtIaW50fSBmcm9tIFwiLi4vLi4vdHlwZXNcIjtcblxuZXhwb3J0IGNsYXNzIE1hcmtQbHVnaW4ge1xuICAgIGxpbmtzOiBTb3VyY2VMaW5rSGludFtdID0gW107XG5cbiAgICBjb25zdHJ1Y3RvcihsaW5rczogU291cmNlTGlua0hpbnRbXSkge1xuICAgICAgICB0aGlzLmxpbmtzID0gbGlua3M7XG4gICAgfVxuXG4gICAgc2V0TGlua3MobGlua3M6IFNvdXJjZUxpbmtIaW50W10pIHtcbiAgICAgICAgdGhpcy5saW5rcyA9IGxpbmtzO1xuICAgIH1cblxuICAgIGNsZWFuKCkge1xuICAgICAgICB0aGlzLmxpbmtzID0gW107XG4gICAgfVxuXG4gICAgZ2V0IHZpc2libGUoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLmxpbmtzLmxlbmd0aCA+IDA7XG4gICAgfVxuXG4gICAgY3JlYXRlTWFya3MoKTogRGVjb3JhdGlvblNldCB7XG4gICAgICAgIGNvbnN0IHdpZGdldHMgPSB0aGlzLmxpbmtzLm1hcCgoeCkgPT5cbiAgICAgICAgICAgIERlY29yYXRpb24ud2lkZ2V0KHtcbiAgICAgICAgICAgICAgICB3aWRnZXQ6IG5ldyBNYXJrV2lkZ2V0KHgubGV0dGVyKSxcbiAgICAgICAgICAgICAgICBzaWRlOiAxLFxuICAgICAgICAgICAgfSkucmFuZ2UoeC5pbmRleClcbiAgICAgICAgKTtcblxuICAgICAgICByZXR1cm4gRGVjb3JhdGlvbi5zZXQod2lkZ2V0cyk7XG4gICAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlVmlld1BsdWdpbkNsYXNzKG1hcmtQbHVnaW46IE1hcmtQbHVnaW4pIHtcbiAgICByZXR1cm4gY2xhc3Mge1xuICAgICAgICBkZWNvcmF0aW9uczogRGVjb3JhdGlvblNldDtcblxuICAgICAgICBjb25zdHJ1Y3RvcihfdmlldzogRWRpdG9yVmlldykge1xuICAgICAgICAgICAgdGhpcy5kZWNvcmF0aW9ucyA9IG1hcmtQbHVnaW4uY3JlYXRlTWFya3MoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHVwZGF0ZShfdXBkYXRlOiBWaWV3VXBkYXRlKSB7XG4gICAgICAgICAgICB0aGlzLmRlY29yYXRpb25zID0gbWFya1BsdWdpbi5jcmVhdGVNYXJrcygpO1xuICAgICAgICB9XG4gICAgfTtcbn1cbiIsImltcG9ydCBMaXZlUHJldmlld0xpbmtQcm9jZXNzb3IgZnJvbSBcIi4vTGl2ZVByZXZpZXdMaW5rUHJvY2Vzc29yXCI7XG5pbXBvcnQge1Byb2Nlc3Nvcn0gZnJvbSBcIi4uLy4uL3R5cGVzXCI7XG5pbXBvcnQge0VkaXRvclZpZXd9IGZyb20gXCJAY29kZW1pcnJvci92aWV3XCI7XG5pbXBvcnQge2V4dHJhY3RSZWdleHBCbG9ja3N9IGZyb20gXCIuLi91dGlscy9yZWdleHBcIjtcblxuZXhwb3J0IGRlZmF1bHQgY2xhc3MgTGl2ZVByZXZpZXdSZWdleFByb2Nlc3NvciBleHRlbmRzIExpdmVQcmV2aWV3TGlua1Byb2Nlc3NvciBpbXBsZW1lbnRzIFByb2Nlc3NvciB7XG4gICAgcmVnZXhwOiBzdHJpbmc7XG4gICAgY29uc3RydWN0b3IoZWRpdG9yOiBFZGl0b3JWaWV3LCBhbHBoYWJldDogc3RyaW5nLCByZWdleHA6IHN0cmluZykge1xuICAgICAgICBzdXBlcihlZGl0b3IsIGFscGhhYmV0KTtcbiAgICAgICAgdGhpcy5yZWdleHAgPSByZWdleHA7XG4gICAgfVxuXG4gICAgaW5pdCgpIHtcbiAgICAgICAgY29uc3QgeyBsZXR0ZXJzLCByZWdleHAgfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHsgaW5kZXgsIGNvbnRlbnQgfSA9IHRoaXMuZ2V0VmlzaWJsZUxpbmVzKCk7XG4gICAgICAgIHJldHVybiBleHRyYWN0UmVnZXhwQmxvY2tzKGNvbnRlbnQsIGluZGV4LCByZWdleHAsIGxldHRlcnMpO1xuICAgIH1cbn0iLCJpbXBvcnQge0FwcCwgUGx1Z2luLCBQbHVnaW5TZXR0aW5nVGFiLCBTZXR0aW5nLCBWaWV3fSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge0VkaXRvcn0gZnJvbSAnY29kZW1pcnJvcic7XG5pbXBvcnQge0xpbmtIaW50QmFzZSwgU2V0dGluZ3MsIFNvdXJjZUxpbmtIaW50fSBmcm9tICd0eXBlcyc7XG5pbXBvcnQgUmVnZXhwUHJvY2Vzc29yIGZyb20gXCIuL3Byb2Nlc3NvcnMvUmVnZXhwUHJvY2Vzc29yXCI7XG5pbXBvcnQgUHJldmlld0xpbmtQcm9jZXNzb3IgZnJvbSBcIi4vcHJvY2Vzc29ycy9QcmV2aWV3TGlua1Byb2Nlc3NvclwiO1xuaW1wb3J0IFNvdXJjZUxpbmtQcm9jZXNzb3IgZnJvbSBcIi4vcHJvY2Vzc29ycy9Tb3VyY2VMaW5rUHJvY2Vzc29yXCI7XG5pbXBvcnQgTGl2ZVByZXZpZXdMaW5rUHJvY2Vzc29yIGZyb20gXCIuL3Byb2Nlc3NvcnMvTGl2ZVByZXZpZXdMaW5rUHJvY2Vzc29yXCI7XG5pbXBvcnQge0VkaXRvclZpZXcsIFZpZXdQbHVnaW59IGZyb20gXCJAY29kZW1pcnJvci92aWV3XCI7XG5pbXBvcnQge2NyZWF0ZVZpZXdQbHVnaW5DbGFzcywgTWFya1BsdWdpbn0gZnJvbSBcIi4vY202LXdpZGdldC9NYXJrUGx1Z2luXCI7XG5pbXBvcnQge0VkaXRvclNlbGVjdGlvbn0gZnJvbSBcIkBjb2RlbWlycm9yL3N0YXRlXCI7XG5pbXBvcnQgTGl2ZVByZXZpZXdSZWdleFByb2Nlc3NvciBmcm9tIFwiLi9wcm9jZXNzb3JzL0xpdmVQcmV2aWV3UmVnZXhQcm9jZXNzb3JcIjtcblxuZW51bSBWSUVXX01PREUge1xuICAgIFNPVVJDRSxcbiAgICBQUkVWSUVXLFxuICAgIExJVkVfUFJFVklFV1xufVxuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBKdW1wVG9MaW5rIGV4dGVuZHMgUGx1Z2luIHtcbiAgICBpc0xpbmtIaW50QWN0aXZlOiBib29sZWFuID0gZmFsc2U7XG4gICAgc2V0dGluZ3M6IFNldHRpbmdzO1xuICAgIHByZWZpeEluZm86IHsgcHJlZml4OiBzdHJpbmcsIHNoaWZ0S2V5OiBib29sZWFuIH0gfCB1bmRlZmluZWQgPSB1bmRlZmluZWQ7XG4gICAgbWFya1BsdWdpbjogTWFya1BsdWdpblxuICAgIG1hcmtWaWV3UGx1Z2luOiBWaWV3UGx1Z2luPGFueT5cblxuICAgIGFzeW5jIG9ubG9hZCgpIHtcbiAgICAgICAgdGhpcy5zZXR0aW5ncyA9IGF3YWl0IHRoaXMubG9hZERhdGEoKSB8fCBuZXcgU2V0dGluZ3MoKTtcblxuICAgICAgICB0aGlzLmFkZFNldHRpbmdUYWIobmV3IFNldHRpbmdUYWIodGhpcy5hcHAsIHRoaXMpKTtcblxuICAgICAgICBjb25zdCBtYXJrUGx1Z2luID0gdGhpcy5tYXJrUGx1Z2luID0gbmV3IE1hcmtQbHVnaW4oW10pO1xuXG4gICAgICAgIGNvbnN0IG1hcmtWaWV3UGx1Z2luID0gdGhpcy5tYXJrVmlld1BsdWdpbiA9IFZpZXdQbHVnaW4uZnJvbUNsYXNzKGNyZWF0ZVZpZXdQbHVnaW5DbGFzcyhtYXJrUGx1Z2luKSwge1xuICAgICAgICAgICAgZGVjb3JhdGlvbnM6IHYgPT4gdi5kZWNvcmF0aW9uc1xuICAgICAgICB9KTtcbiAgICAgICAgdGhpcy5yZWdpc3RlckVkaXRvckV4dGVuc2lvbihbbWFya1ZpZXdQbHVnaW5dKVxuXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICAgICAgICBpZDogJ2FjdGl2YXRlLWp1bXAtdG8tbGluaycsXG4gICAgICAgICAgICBuYW1lOiAnSnVtcCB0byBMaW5rJyxcbiAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLmFjdGlvbi5iaW5kKHRoaXMsICdsaW5rJyksXG4gICAgICAgICAgICBob3RrZXlzOiBbe21vZGlmaWVyczogWydDdHJsJ10sIGtleTogYCdgfV0sXG4gICAgICAgIH0pO1xuXG4gICAgICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICAgICAgICBpZDogXCJhY3RpdmF0ZS1qdW1wLXRvLWFueXdoZXJlXCIsXG4gICAgICAgICAgICBuYW1lOiBcIkp1bXAgdG8gQW55d2hlcmUgUmVnZXhcIixcbiAgICAgICAgICAgIGNhbGxiYWNrOiB0aGlzLmFjdGlvbi5iaW5kKHRoaXMsICdyZWdleHAnKSxcbiAgICAgICAgICAgIGhvdGtleXM6IFt7bW9kaWZpZXJzOiBbXCJDdHJsXCJdLCBrZXk6IFwiO1wifV0sXG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIG9udW5sb2FkKCkge1xuICAgICAgICBjb25zb2xlLmxvZygndW5sb2FkaW5nIGp1bXAgdG8gbGlua3MgcGx1Z2luJyk7XG4gICAgfVxuXG4gICAgYWN0aW9uKHR5cGU6ICdsaW5rJyB8ICdyZWdleHAnKSB7XG4gICAgICAgIGlmICh0aGlzLmlzTGlua0hpbnRBY3RpdmUpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIHN3aXRjaCAodHlwZSkge1xuICAgICAgICAgICAgY2FzZSBcImxpbmtcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUp1bXBUb0xpbmsoKTtcbiAgICAgICAgICAgICAgICByZXR1cm5cbiAgICAgICAgICAgIGNhc2UgXCJyZWdleHBcIjpcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUp1bXBUb1JlZ2V4KCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuXG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBnZXRNb2RlKGN1cnJlbnRWaWV3OiBWaWV3KTogVklFV19NT0RFIHtcbiAgICAgICAgaWYgKGN1cnJlbnRWaWV3LmdldFN0YXRlKCkubW9kZSA9PT0gJ3ByZXZpZXcnKSB7XG4gICAgICAgICAgICByZXR1cm4gVklFV19NT0RFLlBSRVZJRVc7XG4gICAgICAgIH0gZWxzZSBpZiAoQXJyYXkuaXNBcnJheSgoPHsgZWRpdE1vZGU/OiB7IGxpdmVQcmV2aWV3UGx1Z2luOiBhbnlbXSB9IH0+Y3VycmVudFZpZXcpPy5lZGl0TW9kZT8ubGl2ZVByZXZpZXdQbHVnaW4pKSB7XG4gICAgICAgICAgICByZXR1cm4gVklFV19NT0RFLkxJVkVfUFJFVklFVztcbiAgICAgICAgfSBlbHNlIGlmIChjdXJyZW50Vmlldy5nZXRTdGF0ZSgpLm1vZGUgPT09ICdzb3VyY2UnKSB7XG4gICAgICAgICAgICByZXR1cm4gVklFV19NT0RFLlNPVVJDRTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBWSUVXX01PREUuU09VUkNFO1xuICAgIH1cblxuICAgIGhhbmRsZUp1bXBUb0xpbmsgPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHtzZXR0aW5nczoge2xldHRlcnN9LCBhcHB9ID0gdGhpc1xuXG4gICAgICAgIGNvbnN0IGN1cnJlbnRWaWV3ID0gYXBwLndvcmtzcGFjZS5hY3RpdmVMZWFmLnZpZXc7XG4gICAgICAgIGNvbnN0IG1vZGUgPSB0aGlzLmdldE1vZGUoY3VycmVudFZpZXcpO1xuXG4gICAgICAgIHN3aXRjaCAobW9kZSkge1xuICAgICAgICAgICAgY2FzZSBWSUVXX01PREUuU09VUkNFOlxuICAgICAgICAgICAgICAgIGNvbnN0IGNtRWRpdG9yOiBFZGl0b3IgPSAoY3VycmVudFZpZXcgYXMgYW55KS5zb3VyY2VNb2RlLmNtRWRpdG9yO1xuICAgICAgICAgICAgICAgIGNvbnN0IHNvdXJjZUxpbmtIaW50cyA9IG5ldyBTb3VyY2VMaW5rUHJvY2Vzc29yKGNtRWRpdG9yLCBsZXR0ZXJzKS5pbml0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3Rpb25zKHNvdXJjZUxpbmtIaW50cywgY21FZGl0b3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBWSUVXX01PREUuUFJFVklFVzpcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aWV3Vmlld0VsOiBIVE1MRWxlbWVudCA9IChjdXJyZW50VmlldyBhcyBhbnkpLnByZXZpZXdNb2RlLmNvbnRhaW5lckVsLnF1ZXJ5U2VsZWN0b3IoJ2Rpdi5tYXJrZG93bi1wcmV2aWV3LXZpZXcnKTtcbiAgICAgICAgICAgICAgICBjb25zdCBwcmV2aWV3TGlua0hpbnRzID0gbmV3IFByZXZpZXdMaW5rUHJvY2Vzc29yKHByZXZpZXdWaWV3RWwsIGxldHRlcnMpLmluaXQoKTtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUFjdGlvbnMocHJldmlld0xpbmtIaW50cyk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFZJRVdfTU9ERS5MSVZFX1BSRVZJRVc6XG4gICAgICAgICAgICAgICAgY29uc3QgY202RWRpdG9yOiBFZGl0b3JWaWV3ID0gKDx7IGVkaXRvcj86IHsgY206IEVkaXRvclZpZXcgfSB9PmN1cnJlbnRWaWV3KS5lZGl0b3IuY207XG4gICAgICAgICAgICAgICAgY29uc3QgbGl2ZVByZXZpZXdMaW5rcyA9IG5ldyBMaXZlUHJldmlld0xpbmtQcm9jZXNzb3IoY202RWRpdG9yLCBsZXR0ZXJzKS5pbml0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXJrUGx1Z2luLnNldExpbmtzKGxpdmVQcmV2aWV3TGlua3MpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS51cGRhdGVPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3Rpb25zKGxpdmVQcmV2aWV3TGlua3MpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgaGFuZGxlSnVtcFRvUmVnZXggPSAoKSA9PiB7XG4gICAgICAgIGNvbnN0IHthcHAsIHNldHRpbmdzOiB7bGV0dGVycywganVtcFRvQW55d2hlcmVSZWdleH19ID0gdGhpc1xuICAgICAgICBjb25zdCBjdXJyZW50VmlldyA9IGFwcC53b3Jrc3BhY2UuYWN0aXZlTGVhZi52aWV3O1xuICAgICAgICBjb25zdCBtb2RlID0gdGhpcy5nZXRNb2RlKGN1cnJlbnRWaWV3KTtcblxuICAgICAgICBzd2l0Y2ggKG1vZGUpIHtcbiAgICAgICAgICAgIGNhc2UgVklFV19NT0RFLkxJVkVfUFJFVklFVzpcbiAgICAgICAgICAgICAgICBjb25zdCBjbTZFZGl0b3I6IEVkaXRvclZpZXcgPSAoPHsgZWRpdG9yPzogeyBjbTogRWRpdG9yVmlldyB9IH0+Y3VycmVudFZpZXcpLmVkaXRvci5jbTtcbiAgICAgICAgICAgICAgICBjb25zdCBsaXZlUHJldmlld0xpbmtzID0gbmV3IExpdmVQcmV2aWV3UmVnZXhQcm9jZXNzb3IoY202RWRpdG9yLCBsZXR0ZXJzLCBqdW1wVG9Bbnl3aGVyZVJlZ2V4KS5pbml0KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5tYXJrUGx1Z2luLnNldExpbmtzKGxpdmVQcmV2aWV3TGlua3MpO1xuICAgICAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS51cGRhdGVPcHRpb25zKCk7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVBY3Rpb25zKGxpdmVQcmV2aWV3TGlua3MsIGNtNkVkaXRvcik7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICBjYXNlIFZJRVdfTU9ERS5QUkVWSUVXOlxuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgY2FzZSBWSUVXX01PREUuU09VUkNFOlxuICAgICAgICAgICAgICAgIGNvbnN0IGNtRWRpdG9yOiBFZGl0b3IgPSAoY3VycmVudFZpZXcgYXMgYW55KS5zb3VyY2VNb2RlLmNtRWRpdG9yO1xuICAgICAgICAgICAgICAgIGNvbnN0IGxpbmtzID0gbmV3IFJlZ2V4cFByb2Nlc3NvcihjbUVkaXRvciwganVtcFRvQW55d2hlcmVSZWdleCwgbGV0dGVycykuaW5pdCgpO1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQWN0aW9ucyhsaW5rcywgY21FZGl0b3IpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgZGVmYXVsdDpcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuXG4gICAgfVxuXG4gICAgaGFuZGxlQWN0aW9ucyA9IChsaW5rSGludHM6IExpbmtIaW50QmFzZVtdLCBjbUVkaXRvcj86IEVkaXRvciB8IEVkaXRvclZpZXcpOiB2b2lkID0+IHtcbiAgICAgICAgaWYgKCFsaW5rSGludHMubGVuZ3RoKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBsaW5rSGludE1hcDogeyBbbGV0dGVyOiBzdHJpbmddOiBMaW5rSGludEJhc2UgfSA9IHt9O1xuICAgICAgICBsaW5rSGludHMuZm9yRWFjaCh4ID0+IGxpbmtIaW50TWFwW3gubGV0dGVyXSA9IHgpO1xuXG4gICAgICAgIGNvbnN0IGhhbmRsZUhvdGtleSA9IChuZXdMZWFmOiBib29sZWFuLCBsaW5rOiBTb3VyY2VMaW5rSGludCB8IExpbmtIaW50QmFzZSkgPT4ge1xuICAgICAgICAgICAgaWYgKGxpbmsudHlwZSA9PT0gJ2ludGVybmFsJykge1xuICAgICAgICAgICAgICAgIC8vIG5vdCBzdXJlIHdoeSB0aGUgc2Vjb25kIGFyZ3VtZW50IGluIG9wZW5MaW5rVGV4dCBpcyBuZWNlc3NhcnkuXG4gICAgICAgICAgICAgICAgdGhpcy5hcHAud29ya3NwYWNlLm9wZW5MaW5rVGV4dChkZWNvZGVVUkkobGluay5saW5rVGV4dCksICcnLCBuZXdMZWFmLCB7YWN0aXZlOiB0cnVlfSk7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKGxpbmsudHlwZSA9PT0gJ2V4dGVybmFsJykge1xuICAgICAgICAgICAgICAgIHdpbmRvdy5vcGVuKGxpbmsubGlua1RleHQpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBlZGl0b3IgPSBjbUVkaXRvcjtcbiAgICAgICAgICAgICAgICBpZiAoZWRpdG9yIGluc3RhbmNlb2YgRWRpdG9yVmlldykge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBpbmRleCA9IChsaW5rIGFzIFNvdXJjZUxpbmtIaW50KS5pbmRleDtcbiAgICAgICAgICAgICAgICAgICAgZWRpdG9yLmRpc3BhdGNoKHsgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24uY3Vyc29yKGluZGV4KSB9KVxuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGVkaXRvci5zZXRDdXJzb3IoZWRpdG9yLnBvc0Zyb21JbmRleCgoPFNvdXJjZUxpbmtIaW50PmxpbmspLmluZGV4KSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVtb3ZlUG9wb3ZlcnMgPSAoKSA9PiB7XG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdjbGljaycsIHJlbW92ZVBvcG92ZXJzKVxuICAgICAgICAgICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLmpsLnBvcG92ZXInKS5mb3JFYWNoKGUgPT4gZS5yZW1vdmUoKSk7XG4gICAgICAgICAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcjamwtbW9kYWwnKS5mb3JFYWNoKGUgPT4gZS5yZW1vdmUoKSk7XG4gICAgICAgICAgICB0aGlzLnByZWZpeEluZm8gPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICB0aGlzLm1hcmtQbHVnaW4uY2xlYW4oKTtcbiAgICAgICAgICAgIHRoaXMuYXBwLndvcmtzcGFjZS51cGRhdGVPcHRpb25zKCk7XG4gICAgICAgICAgICB0aGlzLmlzTGlua0hpbnRBY3RpdmUgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGhhbmRsZUtleURvd24gPSAoZXZlbnQ6IEtleWJvYXJkRXZlbnQpOiB2b2lkID0+IHtcbiAgICAgICAgICAgIGlmIChldmVudC5rZXkgPT09ICdTaGlmdCcpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNvbnN0IGV2ZW50S2V5ID0gZXZlbnQua2V5LnRvVXBwZXJDYXNlKCk7XG4gICAgICAgICAgICBjb25zdCBwcmVmaXhlcyA9IG5ldyBTZXQoT2JqZWN0LmtleXMobGlua0hpbnRNYXApLmZpbHRlcih4ID0+IHgubGVuZ3RoID4gMSkubWFwKHggPT4geFswXSkpO1xuXG4gICAgICAgICAgICBsZXQgbGlua0hpbnQ6IExpbmtIaW50QmFzZTtcbiAgICAgICAgICAgIGlmICh0aGlzLnByZWZpeEluZm8pIHtcbiAgICAgICAgICAgICAgICBsaW5rSGludCA9IGxpbmtIaW50TWFwW3RoaXMucHJlZml4SW5mby5wcmVmaXggKyBldmVudEtleV07XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIGxpbmtIaW50ID0gbGlua0hpbnRNYXBbZXZlbnRLZXldO1xuICAgICAgICAgICAgICAgIGlmICghbGlua0hpbnQgJiYgcHJlZml4ZXMgJiYgcHJlZml4ZXMuaGFzKGV2ZW50S2V5KSkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnByZWZpeEluZm8gPSB7cHJlZml4OiBldmVudEtleSwgc2hpZnRLZXk6IGV2ZW50LnNoaWZ0S2V5fTtcblxuICAgICAgICAgICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgICAgICBldmVudC5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQuc3RvcEltbWVkaWF0ZVByb3BhZ2F0aW9uKCk7XG5cbiAgICAgICAgICAgIGNvbnN0IG5ld0xlYWYgPSB0aGlzLnByZWZpeEluZm8/LnNoaWZ0S2V5IHx8IGV2ZW50LnNoaWZ0S2V5O1xuXG4gICAgICAgICAgICBsaW5rSGludCAmJiBoYW5kbGVIb3RrZXkobmV3TGVhZiwgbGlua0hpbnQpO1xuXG4gICAgICAgICAgICBkb2N1bWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5RG93biwgeyBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICAgICAgcmVtb3ZlUG9wb3ZlcnMoKTtcbiAgICAgICAgfTtcblxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHJlbW92ZVBvcG92ZXJzKVxuICAgICAgICBkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdrZXlkb3duJywgaGFuZGxlS2V5RG93biwgeyBjYXB0dXJlOiB0cnVlIH0pO1xuICAgICAgICB0aGlzLmlzTGlua0hpbnRBY3RpdmUgPSB0cnVlO1xuICAgIH1cbn1cblxuY2xhc3MgU2V0dGluZ1RhYiBleHRlbmRzIFBsdWdpblNldHRpbmdUYWIge1xuICAgIHBsdWdpbjogSnVtcFRvTGlua1xuXG4gICAgY29uc3RydWN0b3IoYXBwOiBBcHAsIHBsdWdpbjogSnVtcFRvTGluaykge1xuICAgICAgICBzdXBlcihhcHAsIHBsdWdpbilcblxuICAgICAgICB0aGlzLnBsdWdpbiA9IHBsdWdpblxuICAgIH1cblxuICAgIGRpc3BsYXkoKTogdm9pZCB7XG4gICAgICAgIGxldCB7Y29udGFpbmVyRWx9ID0gdGhpcztcblxuICAgICAgICBjb250YWluZXJFbC5lbXB0eSgpO1xuXG4gICAgICAgIGNvbnRhaW5lckVsLmNyZWF0ZUVsKCdoMicsIHt0ZXh0OiAnU2V0dGluZ3MgZm9yIEp1bXAgVG8gTGluay4nfSk7XG5cbiAgICAgICAgLyogTW9kYWwgbW9kZSBkZXByZWNhdGVkICovXG4gICAgICAgIC8vIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAvLyAgICAgLnNldE5hbWUoJ1ByZXNlbnRhdGlvbicpXG4gICAgICAgIC8vICAgICAuc2V0RGVzYygnSG93IHRvIHNob3cgbGlua3MnKVxuICAgICAgICAvLyAgICAgLmFkZERyb3Bkb3duKGNiID0+IHsgY2JcbiAgICAgICAgLy8gICAgICAgICAuYWRkT3B0aW9ucyh7XG4gICAgICAgIC8vICAgICAgICAgICAgIFwicG9wb3ZlcnNcIjogJ1BvcG92ZXJzJyxcbiAgICAgICAgLy8gICAgICAgICAgICAgXCJtb2RhbFwiOiAnTW9kYWwnXG4gICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgLy8gICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubW9kZSlcbiAgICAgICAgLy8gICAgICAgICAub25DaGFuZ2UoKHZhbHVlOiBMaW5rSGludE1vZGUpID0+IHtcbiAgICAgICAgLy8gICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MubW9kZSA9IHZhbHVlO1xuICAgICAgICAvLyAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zYXZlRGF0YSh0aGlzLnBsdWdpbi5zZXR0aW5ncyk7XG4gICAgICAgIC8vICAgICAgICAgfSlcbiAgICAgICAgLy8gICAgIH0pO1xuXG4gICAgICAgIG5ldyBTZXR0aW5nKGNvbnRhaW5lckVsKVxuICAgICAgICAgICAgLnNldE5hbWUoJ0NoYXJhY3RlcnMgdXNlZCBmb3IgbGluayBoaW50cycpXG4gICAgICAgICAgICAuc2V0RGVzYygnVGhlIGNoYXJhY3RlcnMgcGxhY2VkIG5leHQgdG8gZWFjaCBsaW5rIGFmdGVyIGVudGVyIGxpbmstaGludCBtb2RlLicpXG4gICAgICAgICAgICAuYWRkVGV4dChjYiA9PiB7XG4gICAgICAgICAgICAgICAgY2Iuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MubGV0dGVycylcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKCh2YWx1ZTogc3RyaW5nKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnBsdWdpbi5zZXR0aW5ncy5sZXR0ZXJzID0gdmFsdWVcbiAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMucGx1Z2luLnNhdmVEYXRhKHRoaXMucGx1Z2luLnNldHRpbmdzKVxuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgbmV3IFNldHRpbmcoY29udGFpbmVyRWwpXG4gICAgICAgICAgICAuc2V0TmFtZSgnSnVtcCBUbyBBbnl3aGVyZScpXG4gICAgICAgICAgICAuc2V0RGVzYyhcIlJlZ2V4IGJhc2VkIG5hdmlnYXRpbmcgaW4gZWRpdG9yIG1vZGVcIilcbiAgICAgICAgICAgIC5hZGRUZXh0KCh0ZXh0KSA9PlxuICAgICAgICAgICAgICAgIHRleHRcbiAgICAgICAgICAgICAgICAgICAgLnNldFBsYWNlaG9sZGVyKCdDdXN0b20gUmVnZXgnKVxuICAgICAgICAgICAgICAgICAgICAuc2V0VmFsdWUodGhpcy5wbHVnaW4uc2V0dGluZ3MuanVtcFRvQW55d2hlcmVSZWdleClcbiAgICAgICAgICAgICAgICAgICAgLm9uQ2hhbmdlKGFzeW5jICh2YWx1ZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wbHVnaW4uc2V0dGluZ3MuanVtcFRvQW55d2hlcmVSZWdleCA9IHZhbHVlO1xuICAgICAgICAgICAgICAgICAgICAgICAgYXdhaXQgdGhpcy5wbHVnaW4uc2F2ZURhdGEodGhpcy5wbHVnaW4uc2V0dGluZ3MpO1xuICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgKTtcbiAgICB9XG59XG4iXSwibmFtZXMiOlsiV2lkZ2V0VHlwZSIsIkRlY29yYXRpb24iLCJQbHVnaW4iLCJFZGl0b3JWaWV3IiwiRWRpdG9yU2VsZWN0aW9uIiwiVmlld1BsdWdpbiIsIlBsdWdpblNldHRpbmdUYWIiLCJTZXR0aW5nIl0sIm1hcHBpbmdzIjoiOzs7Ozs7QUFBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBdURBO0FBQ08sU0FBUyxTQUFTLENBQUMsT0FBTyxFQUFFLFVBQVUsRUFBRSxDQUFDLEVBQUUsU0FBUyxFQUFFO0FBQzdELElBQUksU0FBUyxLQUFLLENBQUMsS0FBSyxFQUFFLEVBQUUsT0FBTyxLQUFLLFlBQVksQ0FBQyxHQUFHLEtBQUssR0FBRyxJQUFJLENBQUMsQ0FBQyxVQUFVLE9BQU8sRUFBRSxFQUFFLE9BQU8sQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFO0FBQ2hILElBQUksT0FBTyxLQUFLLENBQUMsS0FBSyxDQUFDLEdBQUcsT0FBTyxDQUFDLEVBQUUsVUFBVSxPQUFPLEVBQUUsTUFBTSxFQUFFO0FBQy9ELFFBQVEsU0FB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
