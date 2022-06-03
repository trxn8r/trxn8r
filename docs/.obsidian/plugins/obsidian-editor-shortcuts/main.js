var __create = Object.create;
var __defProp = Object.defineProperty;
var __defProps = Object.defineProperties;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
var __markAsModule = (target) => __defProp(target, "__esModule", { value: true });
var __export = (target, all) => {
  __markAsModule(target);
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __reExport = (target, module2, desc) => {
  if (module2 && typeof module2 === "object" || typeof module2 === "function") {
    for (let key of __getOwnPropNames(module2))
      if (!__hasOwnProp.call(target, key) && key !== "default")
        __defProp(target, key, { get: () => module2[key], enumerable: !(desc = __getOwnPropDesc(module2, key)) || desc.enumerable });
  }
  return target;
};
var __toModule = (module2) => {
  return __reExport(__markAsModule(__defProp(module2 != null ? __create(__getProtoOf(module2)) : {}, "default", module2 && module2.__esModule && "default" in module2 ? { get: () => module2.default, enumerable: true } : { value: module2, enumerable: true })), module2);
};

// src/main.ts
__export(exports, {
  default: () => CodeEditorShortcuts
});
var import_obsidian = __toModule(require("obsidian"));

// src/constants.ts
var CASE;
(function(CASE2) {
  CASE2["UPPER"] = "upper";
  CASE2["LOWER"] = "lower";
  CASE2["TITLE"] = "title";
})(CASE || (CASE = {}));
var LOWERCASE_ARTICLES = ["the", "a", "an"];
var DIRECTION;
(function(DIRECTION2) {
  DIRECTION2["FORWARD"] = "forward";
  DIRECTION2["BACKWARD"] = "backward";
})(DIRECTION || (DIRECTION = {}));
var MATCHING_BRACKETS = {
  "[": "]",
  "(": ")",
  "{": "}"
};
var MATCHING_QUOTES = {
  "'": "'",
  '"': '"',
  "`": "`"
};

// src/utils.ts
var defaultMultipleSelectionOptions = { repeatSameLineActions: true };
var withMultipleSelections = (editor, callback, options = defaultMultipleSelectionOptions) => {
  const { cm } = editor;
  let selections = editor.listSelections();
  let newSelections = [];
  if (!options.repeatSameLineActions) {
    const seenLines = [];
    selections = selections.filter((selection) => {
      const currentLine = selection.head.line;
      if (!seenLines.includes(currentLine)) {
        seenLines.push(currentLine);
        return true;
      }
      return false;
    });
  }
  const applyCallbackOnSelections = () => {
    for (let i = 0; i < selections.length; i++) {
      const selection = editor.listSelections()[i];
      if (selection) {
        const newSelection = callback(editor, selection, options.args);
        newSelections.push(newSelection);
      }
    }
    if (options.customSelectionHandler) {
      newSelections = options.customSelectionHandler(newSelections);
    }
    editor.setSelections(newSelections);
  };
  if (!cm) {
    cm.operation(applyCallbackOnSelections);
  } else {
    console.error("cm object not found, operations will not be buffered");
    applyCallbackOnSelections();
  }
};
var getLineStartPos = (line) => ({
  line,
  ch: 0
});
var getLineEndPos = (line, editor) => ({
  line,
  ch: editor.getLine(line).length
});
var getSelectionBoundaries = (selection) => {
  let { anchor: from, head: to } = selection;
  if (from.line > to.line) {
    [from, to] = [to, from];
  }
  return { from, to };
};
var getLeadingWhitespace = (lineContent) => {
  const indentation = lineContent.match(/^\s+/);
  return indentation ? indentation[0] : "";
};
var isWordCharacter = (char) => /\w/.test(char);
var wordRangeAtPos = (pos, lineContent) => {
  let start = pos.ch;
  let end = pos.ch;
  while (start > 0 && isWordCharacter(lineContent.charAt(start - 1))) {
    start--;
  }
  while (end < lineContent.length && isWordCharacter(lineContent.charAt(end))) {
    end++;
  }
  return {
    anchor: {
      line: pos.line,
      ch: start
    },
    head: {
      line: pos.line,
      ch: end
    }
  };
};
var findPosOfNextCharacter = ({
  editor,
  startPos,
  checkCharacter,
  searchDirection
}) => {
  let { line, ch } = startPos;
  let lineContent = editor.getLine(line);
  let matchFound = false;
  let matchedChar;
  if (searchDirection === DIRECTION.BACKWARD) {
    while (line >= 0) {
      const char = lineContent.charAt(Math.max(ch - 1, 0));
      matchFound = checkCharacter(char);
      if (matchFound) {
        matchedChar = char;
        break;
      }
      ch--;
      if (ch <= 0) {
        line--;
        if (line >= 0) {
          lineContent = editor.getLine(line);
          ch = lineContent.length;
        }
      }
    }
  } else {
    while (line < editor.lineCount()) {
      const char = lineContent.charAt(ch);
      matchFound = checkCharacter(char);
      if (matchFound) {
        matchedChar = char;
        break;
      }
      ch++;
      if (ch >= lineContent.length) {
        line++;
        lineContent = editor.getLine(line);
        ch = 0;
      }
    }
  }
  return matchFound ? {
    match: matchedChar,
    pos: {
      line,
      ch
    }
  } : null;
};

// src/actions.ts
var insertLineAbove = (editor, selection) => {
  const { line } = selection.head;
  const startOfCurrentLine = getLineStartPos(line);
  editor.replaceRange("\n", startOfCurrentLine);
  return { anchor: startOfCurrentLine };
};
var insertLineBelow = (editor, selection) => {
  const { line } = selection.head;
  const endOfCurrentLine = getLineEndPos(line, editor);
  const indentation = getLeadingWhitespace(editor.getLine(line));
  editor.replaceRange("\n" + indentation, endOfCurrentLine);
  return { anchor: { line: line + 1, ch: indentation.length } };
};
var deleteSelectedLines = (editor, selection) => {
  const { from, to } = getSelectionBoundaries(selection);
  if (to.line === editor.lastLine()) {
    editor.replaceRange("", getLineEndPos(from.line - 1, editor), getLineEndPos(to.line, editor));
  } else {
    editor.replaceRange("", getLineStartPos(from.line), getLineStartPos(to.line + 1));
  }
  return { anchor: { line: from.line, ch: selection.head.ch } };
};
var deleteToEndOfLine = (editor, selection) => {
  const pos = selection.head;
  const endPos = getLineEndPos(pos.line, editor);
  if (pos.line === endPos.line && pos.ch === endPos.ch) {
    endPos.line = endPos.line + 1;
    endPos.ch = 0;
  }
  editor.replaceRange("", pos, endPos);
  return selection;
};
var joinLines = (editor, selection) => {
  const { line } = selection.head;
  const contentsOfNextLine = editor.getLine(line + 1).trimStart();
  const endOfCurrentLine = getLineEndPos(line, editor);
  const endOfNextLine = getLineEndPos(line + 1, editor);
  editor.replaceRange(contentsOfNextLine.length > 0 ? " " + contentsOfNextLine : contentsOfNextLine, endOfCurrentLine, endOfNextLine);
  return { anchor: endOfCurrentLine };
};
var copyLine = (editor, selection, direction) => {
  const { from, to } = getSelectionBoundaries(selection);
  const fromLineStart = getLineStartPos(from.line);
  const toLineEnd = getLineEndPos(to.line, editor);
  const contentsOfSelectedLines = editor.getRange(fromLineStart, toLineEnd);
  if (direction === "up") {
    editor.replaceRange("\n" + contentsOfSelectedLines, toLineEnd);
    return selection;
  } else {
    editor.replaceRange(contentsOfSelectedLines + "\n", fromLineStart);
    const linesSelected = to.line - from.line + 1;
    return {
      anchor: { line: to.line + 1, ch: from.ch },
      head: { line: to.line + linesSelected, ch: to.ch }
    };
  }
};
var selectWord = (editor, selection) => {
  const { from, to } = getSelectionBoundaries(selection);
  const selectedText = editor.getRange(from, to);
  if (selectedText.length !== 0) {
    return selection;
  } else {
    return wordRangeAtPos(from, editor.getLine(from.line));
  }
};
var selectLine = (_editor, selection) => {
  const { from, to } = getSelectionBoundaries(selection);
  const startOfCurrentLine = getLineStartPos(from.line);
  const startOfNextLine = getLineStartPos(to.line + 1);
  return { anchor: startOfCurrentLine, head: startOfNextLine };
};
var goToLineBoundary = (editor, selection, boundary) => {
  const { from, to } = getSelectionBoundaries(selection);
  if (boundary === "start") {
    return { anchor: getLineStartPos(from.line) };
  } else {
    return { anchor: getLineEndPos(to.line, editor) };
  }
};
var navigateLine = (editor, selection, direction) => {
  const pos = selection.head;
  let line;
  if (direction === "up") {
    line = Math.max(pos.line - 1, 0);
  } else {
    line = Math.min(pos.line + 1, editor.lineCount() - 1);
  }
  const endOfLine = getLineEndPos(line, editor);
  const ch = Math.min(pos.ch, endOfLine.ch);
  return { anchor: { line, ch } };
};
var moveCursor = (editor, selection, direction) => {
  const { line, ch } = selection.head;
  const movement = direction === DIRECTION.BACKWARD ? -1 : 1;
  const lineLength = editor.getLine(line).length;
  const newPos = { line, ch: ch + movement };
  if (newPos.ch < 0 && newPos.line === 0) {
    newPos.ch = ch;
  } else if (newPos.ch < 0) {
    newPos.line = Math.max(newPos.line - 1, 0);
    newPos.ch = editor.getLine(newPos.line).length;
  } else if (newPos.ch > lineLength) {
    newPos.line += 1;
    newPos.ch = 0;
  }
  return { anchor: newPos };
};
var transformCase = (editor, selection, caseType) => {
  let { from, to } = getSelectionBoundaries(selection);
  let selectedText = editor.getRange(from, to);
  if (selectedText.length === 0) {
    const pos = selection.head;
    const { anchor, head } = wordRangeAtPos(pos, editor.getLine(pos.line));
    [from, to] = [anchor, head];
    selectedText = editor.getRange(anchor, head);
  }
  if (caseType === CASE.TITLE) {
    editor.replaceRange(selectedText.split(/(\s+)/).map((word, index, allWords) => {
      if (index > 0 && index < allWords.length - 1 && LOWERCASE_ARTICLES.includes(word.toLowerCase())) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.substring(1).toLowerCase();
    }).join(""), from, to);
  } else {
    editor.replaceRange(caseType === CASE.UPPER ? selectedText.toUpperCase() : selectedText.toLowerCase(), from, to);
  }
  return selection;
};
var expandSelection = ({
  editor,
  selection,
  openingCharacterCheck,
  matchingCharacterMap
}) => {
  let { anchor, head } = selection;
  if (anchor.line >= head.line && anchor.ch > anchor.ch) {
    [anchor, head] = [head, anchor];
  }
  const newAnchor = findPosOfNextCharacter({
    editor,
    startPos: anchor,
    checkCharacter: openingCharacterCheck,
    searchDirection: DIRECTION.BACKWARD
  });
  if (!newAnchor) {
    return selection;
  }
  const newHead = findPosOfNextCharacter({
    editor,
    startPos: head,
    checkCharacter: (char) => char === matchingCharacterMap[newAnchor.match],
    searchDirection: DIRECTION.FORWARD
  });
  if (!newHead) {
    return selection;
  }
  return { anchor: newAnchor.pos, head: newHead.pos };
};
var expandSelectionToBrackets = (editor, selection) => expandSelection({
  editor,
  selection,
  openingCharacterCheck: (char) => /[([{]/.test(char),
  matchingCharacterMap: MATCHING_BRACKETS
});
var expandSelectionToQuotes = (editor, selection) => expandSelection({
  editor,
  selection,
  openingCharacterCheck: (char) => /['"`]/.test(char),
  matchingCharacterMap: MATCHING_QUOTES
});
var goToHeading = (app, editor, boundary) => {
  const file = app.metadataCache.getFileCache(app.workspace.getActiveFile());
  if (!file.headings || file.headings.length === 0) {
    return;
  }
  const { line } = editor.getCursor("from");
  let prevHeadingLine = 0;
  let nextHeadingLine = editor.lastLine();
  file.headings.forEach(({ position }) => {
    const { end: headingPos } = position;
    if (line > headingPos.line && headingPos.line > prevHeadingLine) {
      prevHeadingLine = headingPos.line;
    }
    if (line < headingPos.line && headingPos.line < nextHeadingLine) {
      nextHeadingLine = headingPos.line;
    }
  });
  editor.setSelection(boundary === "prev" ? getLineEndPos(prevHeadingLine, editor) : getLineEndPos(nextHeadingLine, editor));
};

// src/custom-selection-handlers.ts
var insertLineBelowHandler = (selections) => {
  const seenLines = [];
  let lineIncrement = 0;
  let processedPos;
  return selections.reduce((processed, currentPos) => {
    const currentLine = currentPos.anchor.line;
    if (!seenLines.includes(currentLine)) {
      seenLines.push(currentLine);
      lineIncrement = 0;
      processedPos = currentPos;
    } else {
      lineIncrement++;
      processedPos = {
        anchor: {
          line: currentLine + lineIncrement,
          ch: currentPos.anchor.ch
        }
      };
    }
    processed.push(processedPos);
    return processed;
  }, []);
};

// src/main.ts
var CodeEditorShortcuts = class extends import_obsidian.Plugin {
  onload() {
    this.addCommand({
      id: "insertLineAbove",
      name: "Insert line above",
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "Enter"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, insertLineAbove)
    });
    this.addCommand({
      id: "insertLineBelow",
      name: "Insert line below",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "Enter"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, insertLineBelow, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        customSelectionHandler: insertLineBelowHandler
      }))
    });
    this.addCommand({
      id: "deleteLine",
      name: "Delete line",
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "K"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, deleteSelectedLines)
    });
    this.addCommand({
      id: "deleteToEndOfLine",
      name: "Delete to end of line",
      editorCallback: (editor) => withMultipleSelections(editor, deleteToEndOfLine)
    });
    this.addCommand({
      id: "joinLines",
      name: "Join lines",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "J"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, joinLines, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        repeatSameLineActions: false
      }))
    });
    this.addCommand({
      id: "duplicateLine",
      name: "Duplicate line",
      hotkeys: [
        {
          modifiers: ["Mod", "Shift"],
          key: "D"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, copyLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: "down"
      }))
    });
    this.addCommand({
      id: "copyLineUp",
      name: "Copy line up",
      hotkeys: [
        {
          modifiers: ["Alt", "Shift"],
          key: "ArrowUp"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, copyLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: "up"
      }))
    });
    this.addCommand({
      id: "copyLineDown",
      name: "Copy line down",
      hotkeys: [
        {
          modifiers: ["Alt", "Shift"],
          key: "ArrowDown"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, copyLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: "down"
      }))
    });
    this.addCommand({
      id: "selectWord",
      name: "Select word",
      editorCallback: (editor) => withMultipleSelections(editor, selectWord)
    });
    this.addCommand({
      id: "selectLine",
      name: "Select line",
      hotkeys: [
        {
          modifiers: ["Mod"],
          key: "L"
        }
      ],
      editorCallback: (editor) => withMultipleSelections(editor, selectLine)
    });
    this.addCommand({
      id: "goToLineStart",
      name: "Go to start of line",
      editorCallback: (editor) => withMultipleSelections(editor, goToLineBoundary, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: "start"
      }))
    });
    this.addCommand({
      id: "goToLineEnd",
      name: "Go to end of line",
      editorCallback: (editor) => withMultipleSelections(editor, goToLineBoundary, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: "end"
      }))
    });
    this.addCommand({
      id: "goToNextLine",
      name: "Go to next line",
      editorCallback: (editor) => withMultipleSelections(editor, navigateLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: "down"
      }))
    });
    this.addCommand({
      id: "goToPrevLine",
      name: "Go to previous line",
      editorCallback: (editor) => withMultipleSelections(editor, navigateLine, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: "up"
      }))
    });
    this.addCommand({
      id: "goToNextChar",
      name: "Move cursor forward",
      editorCallback: (editor) => withMultipleSelections(editor, moveCursor, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: DIRECTION.FORWARD
      }))
    });
    this.addCommand({
      id: "goToPrevChar",
      name: "Move cursor backward",
      editorCallback: (editor) => withMultipleSelections(editor, moveCursor, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: DIRECTION.BACKWARD
      }))
    });
    this.addCommand({
      id: "transformToUppercase",
      name: "Transform selection to uppercase",
      editorCallback: (editor) => withMultipleSelections(editor, transformCase, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: CASE.UPPER
      }))
    });
    this.addCommand({
      id: "transformToLowercase",
      name: "Transform selection to lowercase",
      editorCallback: (editor) => withMultipleSelections(editor, transformCase, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: CASE.LOWER
      }))
    });
    this.addCommand({
      id: "transformToTitlecase",
      name: "Transform selection to title case",
      editorCallback: (editor) => withMultipleSelections(editor, transformCase, __spreadProps(__spreadValues({}, defaultMultipleSelectionOptions), {
        args: CASE.TITLE
      }))
    });
    this.addCommand({
      id: "expandSelectionToBrackets",
      name: "Expand selection to brackets",
      editorCallback: (editor) => withMultipleSelections(editor, expandSelectionToBrackets)
    });
    this.addCommand({
      id: "expandSelectionToQuotes",
      name: "Expand selection to quotes",
      editorCallback: (editor) => withMultipleSelections(editor, expandSelectionToQuotes)
    });
    this.addCommand({
      id: "goToNextHeading",
      name: "Go to next heading",
      editorCallback: (editor) => goToHeading(this.app, editor, "next")
    });
    this.addCommand({
      id: "goToPrevHeading",
      name: "Go to previous heading",
      editorCallback: (editor) => goToHeading(this.app, editor, "prev")
    });
  }
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsic3JjL21haW4udHMiLCAic3JjL2NvbnN0YW50cy50cyIsICJzcmMvdXRpbHMudHMiLCAic3JjL2FjdGlvbnMudHMiLCAic3JjL2N1c3RvbS1zZWxlY3Rpb24taGFuZGxlcnMudHMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImltcG9ydCB7IFBsdWdpbiB9IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7XG4gIGNvcHlMaW5lLFxuICBkZWxldGVTZWxlY3RlZExpbmVzLFxuICBkZWxldGVUb0VuZE9mTGluZSxcbiAgZXhwYW5kU2VsZWN0aW9uVG9CcmFja2V0cyxcbiAgZXhwYW5kU2VsZWN0aW9uVG9RdW90ZXMsXG4gIGdvVG9IZWFkaW5nLFxuICBnb1RvTGluZUJvdW5kYXJ5LFxuICBpbnNlcnRMaW5lQWJvdmUsXG4gIGluc2VydExpbmVCZWxvdyxcbiAgam9pbkxpbmVzLFxuICBtb3ZlQ3Vyc29yLFxuICBuYXZpZ2F0ZUxpbmUsXG4gIHNlbGVjdExpbmUsXG4gIHNlbGVjdFdvcmQsXG4gIHRyYW5zZm9ybUNhc2UsXG59IGZyb20gJy4vYWN0aW9ucyc7XG5pbXBvcnQge1xuICBkZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zLFxufSBmcm9tICcuL3V0aWxzJztcbmltcG9ydCB7IENBU0UsIERJUkVDVElPTiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IGluc2VydExpbmVCZWxvd0hhbmRsZXIgfSBmcm9tICcuL2N1c3RvbS1zZWxlY3Rpb24taGFuZGxlcnMnO1xuXG5leHBvcnQgZGVmYXVsdCBjbGFzcyBDb2RlRWRpdG9yU2hvcnRjdXRzIGV4dGVuZHMgUGx1Z2luIHtcbiAgb25sb2FkKCkge1xuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2luc2VydExpbmVBYm92ZScsXG4gICAgICBuYW1lOiAnSW5zZXJ0IGxpbmUgYWJvdmUnLFxuICAgICAgaG90a2V5czogW1xuICAgICAgICB7XG4gICAgICAgICAgbW9kaWZpZXJzOiBbJ01vZCcsICdTaGlmdCddLFxuICAgICAgICAgIGtleTogJ0VudGVyJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIGluc2VydExpbmVBYm92ZSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdpbnNlcnRMaW5lQmVsb3cnLFxuICAgICAgbmFtZTogJ0luc2VydCBsaW5lIGJlbG93JyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydNb2QnXSxcbiAgICAgICAgICBrZXk6ICdFbnRlcicsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBpbnNlcnRMaW5lQmVsb3csIHtcbiAgICAgICAgICAuLi5kZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICAgICAgICAgIGN1c3RvbVNlbGVjdGlvbkhhbmRsZXI6IGluc2VydExpbmVCZWxvd0hhbmRsZXIsXG4gICAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnZGVsZXRlTGluZScsXG4gICAgICBuYW1lOiAnRGVsZXRlIGxpbmUnLFxuICAgICAgaG90a2V5czogW1xuICAgICAgICB7XG4gICAgICAgICAgbW9kaWZpZXJzOiBbJ01vZCcsICdTaGlmdCddLFxuICAgICAgICAgIGtleTogJ0snLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZGVsZXRlU2VsZWN0ZWRMaW5lcyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdkZWxldGVUb0VuZE9mTGluZScsXG4gICAgICBuYW1lOiAnRGVsZXRlIHRvIGVuZCBvZiBsaW5lJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZGVsZXRlVG9FbmRPZkxpbmUpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnam9pbkxpbmVzJyxcbiAgICAgIG5hbWU6ICdKb2luIGxpbmVzJyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydNb2QnXSxcbiAgICAgICAgICBrZXk6ICdKJyxcbiAgICAgICAgfSxcbiAgICAgIF0sXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIGpvaW5MaW5lcywge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgcmVwZWF0U2FtZUxpbmVBY3Rpb25zOiBmYWxzZSxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdkdXBsaWNhdGVMaW5lJyxcbiAgICAgIG5hbWU6ICdEdXBsaWNhdGUgbGluZScsXG4gICAgICBob3RrZXlzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb2RpZmllcnM6IFsnTW9kJywgJ1NoaWZ0J10sXG4gICAgICAgICAga2V5OiAnRCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBjb3B5TGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ2Rvd24nLFxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2NvcHlMaW5lVXAnLFxuICAgICAgbmFtZTogJ0NvcHkgbGluZSB1cCcsXG4gICAgICBob3RrZXlzOiBbXG4gICAgICAgIHtcbiAgICAgICAgICBtb2RpZmllcnM6IFsnQWx0JywgJ1NoaWZ0J10sXG4gICAgICAgICAga2V5OiAnQXJyb3dVcCcsXG4gICAgICAgIH0sXG4gICAgICBdLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBjb3B5TGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ3VwJyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdjb3B5TGluZURvd24nLFxuICAgICAgbmFtZTogJ0NvcHkgbGluZSBkb3duJyxcbiAgICAgIGhvdGtleXM6IFtcbiAgICAgICAge1xuICAgICAgICAgIG1vZGlmaWVyczogWydBbHQnLCAnU2hpZnQnXSxcbiAgICAgICAgICBrZXk6ICdBcnJvd0Rvd24nLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgY29weUxpbmUsIHtcbiAgICAgICAgICAuLi5kZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICAgICAgICAgIGFyZ3M6ICdkb3duJyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdzZWxlY3RXb3JkJyxcbiAgICAgIG5hbWU6ICdTZWxlY3Qgd29yZCcsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIHNlbGVjdFdvcmQpLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAnc2VsZWN0TGluZScsXG4gICAgICBuYW1lOiAnU2VsZWN0IGxpbmUnLFxuICAgICAgaG90a2V5czogW1xuICAgICAgICB7XG4gICAgICAgICAgbW9kaWZpZXJzOiBbJ01vZCddLFxuICAgICAgICAgIGtleTogJ0wnLFxuICAgICAgICB9LFxuICAgICAgXSxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PiB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgc2VsZWN0TGluZSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTGluZVN0YXJ0JyxcbiAgICAgIG5hbWU6ICdHbyB0byBzdGFydCBvZiBsaW5lJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZ29Ub0xpbmVCb3VuZGFyeSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ3N0YXJ0JyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTGluZUVuZCcsXG4gICAgICBuYW1lOiAnR28gdG8gZW5kIG9mIGxpbmUnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBnb1RvTGluZUJvdW5kYXJ5LCB7XG4gICAgICAgICAgLi4uZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyxcbiAgICAgICAgICBhcmdzOiAnZW5kJyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTmV4dExpbmUnLFxuICAgICAgbmFtZTogJ0dvIHRvIG5leHQgbGluZScsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIG5hdmlnYXRlTGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ2Rvd24nLFxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2dvVG9QcmV2TGluZScsXG4gICAgICBuYW1lOiAnR28gdG8gcHJldmlvdXMgbGluZScsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIG5hdmlnYXRlTGluZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogJ3VwJyxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTmV4dENoYXInLFxuICAgICAgbmFtZTogJ01vdmUgY3Vyc29yIGZvcndhcmQnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBtb3ZlQ3Vyc29yLCB7XG4gICAgICAgICAgLi4uZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyxcbiAgICAgICAgICBhcmdzOiBESVJFQ1RJT04uRk9SV0FSRCxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvUHJldkNoYXInLFxuICAgICAgbmFtZTogJ01vdmUgY3Vyc29yIGJhY2t3YXJkJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgbW92ZUN1cnNvciwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogRElSRUNUSU9OLkJBQ0tXQVJELFxuICAgICAgICB9KSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ3RyYW5zZm9ybVRvVXBwZXJjYXNlJyxcbiAgICAgIG5hbWU6ICdUcmFuc2Zvcm0gc2VsZWN0aW9uIHRvIHVwcGVyY2FzZScsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT5cbiAgICAgICAgd2l0aE11bHRpcGxlU2VsZWN0aW9ucyhlZGl0b3IsIHRyYW5zZm9ybUNhc2UsIHtcbiAgICAgICAgICAuLi5kZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuICAgICAgICAgIGFyZ3M6IENBU0UuVVBQRVIsXG4gICAgICAgIH0pLFxuICAgIH0pO1xuXG4gICAgdGhpcy5hZGRDb21tYW5kKHtcbiAgICAgIGlkOiAndHJhbnNmb3JtVG9Mb3dlcmNhc2UnLFxuICAgICAgbmFtZTogJ1RyYW5zZm9ybSBzZWxlY3Rpb24gdG8gbG93ZXJjYXNlJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgdHJhbnNmb3JtQ2FzZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogQ0FTRS5MT1dFUixcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICd0cmFuc2Zvcm1Ub1RpdGxlY2FzZScsXG4gICAgICBuYW1lOiAnVHJhbnNmb3JtIHNlbGVjdGlvbiB0byB0aXRsZSBjYXNlJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgdHJhbnNmb3JtQ2FzZSwge1xuICAgICAgICAgIC4uLmRlZmF1bHRNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMsXG4gICAgICAgICAgYXJnczogQ0FTRS5USVRMRSxcbiAgICAgICAgfSksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdleHBhbmRTZWxlY3Rpb25Ub0JyYWNrZXRzJyxcbiAgICAgIG5hbWU6ICdFeHBhbmQgc2VsZWN0aW9uIHRvIGJyYWNrZXRzJyxcbiAgICAgIGVkaXRvckNhbGxiYWNrOiAoZWRpdG9yKSA9PlxuICAgICAgICB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zKGVkaXRvciwgZXhwYW5kU2VsZWN0aW9uVG9CcmFja2V0cyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdleHBhbmRTZWxlY3Rpb25Ub1F1b3RlcycsXG4gICAgICBuYW1lOiAnRXhwYW5kIHNlbGVjdGlvbiB0byBxdW90ZXMnLFxuICAgICAgZWRpdG9yQ2FsbGJhY2s6IChlZGl0b3IpID0+XG4gICAgICAgIHdpdGhNdWx0aXBsZVNlbGVjdGlvbnMoZWRpdG9yLCBleHBhbmRTZWxlY3Rpb25Ub1F1b3RlcyksXG4gICAgfSk7XG5cbiAgICB0aGlzLmFkZENvbW1hbmQoe1xuICAgICAgaWQ6ICdnb1RvTmV4dEhlYWRpbmcnLFxuICAgICAgbmFtZTogJ0dvIHRvIG5leHQgaGVhZGluZycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gZ29Ub0hlYWRpbmcodGhpcy5hcHAsIGVkaXRvciwgJ25leHQnKSxcbiAgICB9KTtcblxuICAgIHRoaXMuYWRkQ29tbWFuZCh7XG4gICAgICBpZDogJ2dvVG9QcmV2SGVhZGluZycsXG4gICAgICBuYW1lOiAnR28gdG8gcHJldmlvdXMgaGVhZGluZycsXG4gICAgICBlZGl0b3JDYWxsYmFjazogKGVkaXRvcikgPT4gZ29Ub0hlYWRpbmcodGhpcy5hcHAsIGVkaXRvciwgJ3ByZXYnKSxcbiAgICB9KTtcbiAgfVxufVxuIiwgImV4cG9ydCBlbnVtIENBU0Uge1xuICBVUFBFUiA9ICd1cHBlcicsXG4gIExPV0VSID0gJ2xvd2VyJyxcbiAgVElUTEUgPSAndGl0bGUnLFxufVxuXG5leHBvcnQgY29uc3QgTE9XRVJDQVNFX0FSVElDTEVTID0gWyd0aGUnLCAnYScsICdhbiddO1xuXG5leHBvcnQgZW51bSBESVJFQ1RJT04ge1xuICBGT1JXQVJEID0gJ2ZvcndhcmQnLFxuICBCQUNLV0FSRCA9ICdiYWNrd2FyZCcsXG59XG5cbmV4cG9ydCB0eXBlIE1hdGNoaW5nQ2hhcmFjdGVyTWFwID0geyBba2V5OiBzdHJpbmddOiBzdHJpbmcgfTtcblxuZXhwb3J0IGNvbnN0IE1BVENISU5HX0JSQUNLRVRTOiBNYXRjaGluZ0NoYXJhY3Rlck1hcCA9IHtcbiAgJ1snOiAnXScsXG4gICcoJzogJyknLFxuICAneyc6ICd9Jyxcbn07XG5cbmV4cG9ydCBjb25zdCBNQVRDSElOR19RVU9URVM6IE1hdGNoaW5nQ2hhcmFjdGVyTWFwID0ge1xuICBcIidcIjogXCInXCIsXG4gICdcIic6ICdcIicsXG4gICdgJzogJ2AnLFxufTtcbiIsICJpbXBvcnQge1xuICBFZGl0b3IsXG4gIEVkaXRvclBvc2l0aW9uLFxuICBFZGl0b3JTZWxlY3Rpb24sXG4gIEVkaXRvclNlbGVjdGlvbk9yQ2FyZXQsXG59IGZyb20gJ29ic2lkaWFuJztcbmltcG9ydCB7IERJUkVDVElPTiB9IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7IEN1c3RvbVNlbGVjdGlvbkhhbmRsZXIgfSBmcm9tICcuL2N1c3RvbS1zZWxlY3Rpb24taGFuZGxlcnMnO1xuXG50eXBlIEVkaXRvckFjdGlvbkNhbGxiYWNrID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4gIGFyZ3M6IHN0cmluZyxcbikgPT4gRWRpdG9yU2VsZWN0aW9uT3JDYXJldDtcblxudHlwZSBNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMgPSB7XG4gIC8vIEFkZGl0aW9uYWwgaW5mb3JtYXRpb24gdG8gYmUgcGFzc2VkIHRvIHRoZSBFZGl0b3JBY3Rpb25DYWxsYmFja1xuICBhcmdzPzogc3RyaW5nO1xuXG4gIC8vIFBlcmZvcm0gZnVydGhlciBwcm9jZXNzaW5nIG9mIG5ldyBzZWxlY3Rpb25zIGJlZm9yZSB0aGV5IGFyZSBzZXRcbiAgY3VzdG9tU2VsZWN0aW9uSGFuZGxlcj86IEN1c3RvbVNlbGVjdGlvbkhhbmRsZXI7XG5cbiAgLy8gV2hldGhlciB0aGUgYWN0aW9uIHNob3VsZCBiZSByZXBlYXRlZCBmb3IgY3Vyc29ycyBvbiB0aGUgc2FtZSBsaW5lXG4gIHJlcGVhdFNhbWVMaW5lQWN0aW9ucz86IGJvb2xlYW47XG59O1xuXG5leHBvcnQgY29uc3QgZGVmYXVsdE11bHRpcGxlU2VsZWN0aW9uT3B0aW9ucyA9IHsgcmVwZWF0U2FtZUxpbmVBY3Rpb25zOiB0cnVlIH07XG5cbmV4cG9ydCBjb25zdCB3aXRoTXVsdGlwbGVTZWxlY3Rpb25zID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgY2FsbGJhY2s6IEVkaXRvckFjdGlvbkNhbGxiYWNrLFxuICBvcHRpb25zOiBNdWx0aXBsZVNlbGVjdGlvbk9wdGlvbnMgPSBkZWZhdWx0TXVsdGlwbGVTZWxlY3Rpb25PcHRpb25zLFxuKSA9PiB7XG4gIC8vIEB0cy1leHBlY3QtZXJyb3I6IE9ic2lkaWFuJ3MgRWRpdG9yIGludGVyZmFjZSBkb2VzIG5vdCBleHBsaWNpdGx5XG4gIC8vIGluY2x1ZGUgdGhlIENvZGVNaXJyb3IgY20gb2JqZWN0LCBidXQgaXQgaXMgdGhlcmUgd2hlbiBsb2dnZWQgb3V0XG4gIC8vICh0aGlzIG1heSBicmVhayBpbiBmdXR1cmUgdmVyc2lvbnMgb2YgdGhlIE9ic2lkaWFuIEFQSSlcbiAgY29uc3QgeyBjbSB9ID0gZWRpdG9yO1xuXG4gIGxldCBzZWxlY3Rpb25zID0gZWRpdG9yLmxpc3RTZWxlY3Rpb25zKCk7XG4gIGxldCBuZXdTZWxlY3Rpb25zOiBFZGl0b3JTZWxlY3Rpb25PckNhcmV0W10gPSBbXTtcblxuICBpZiAoIW9wdGlvbnMucmVwZWF0U2FtZUxpbmVBY3Rpb25zKSB7XG4gICAgY29uc3Qgc2VlbkxpbmVzOiBudW1iZXJbXSA9IFtdO1xuICAgIHNlbGVjdGlvbnMgPSBzZWxlY3Rpb25zLmZpbHRlcigoc2VsZWN0aW9uKSA9PiB7XG4gICAgICBjb25zdCBjdXJyZW50TGluZSA9IHNlbGVjdGlvbi5oZWFkLmxpbmU7XG4gICAgICBpZiAoIXNlZW5MaW5lcy5pbmNsdWRlcyhjdXJyZW50TGluZSkpIHtcbiAgICAgICAgc2VlbkxpbmVzLnB1c2goY3VycmVudExpbmUpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgIH1cbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9KTtcbiAgfVxuXG4gIGNvbnN0IGFwcGx5Q2FsbGJhY2tPblNlbGVjdGlvbnMgPSAoKSA9PiB7XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBzZWxlY3Rpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAvLyBDYW4ndCByZXVzZSBzZWxlY3Rpb25zIHZhcmlhYmxlIGFzIHBvc2l0aW9ucyBtYXkgY2hhbmdlIG9uIGVhY2ggaXRlcmF0aW9uXG4gICAgICBjb25zdCBzZWxlY3Rpb24gPSBlZGl0b3IubGlzdFNlbGVjdGlvbnMoKVtpXTtcblxuICAgICAgLy8gU2VsZWN0aW9ucyBtYXkgZGlzYXBwZWFyIChlLmcuIHJ1bm5pbmcgZGVsZXRlIGxpbmUgZm9yIHR3byBjdXJzb3JzIG9uIHRoZSBzYW1lIGxpbmUpXG4gICAgICBpZiAoc2VsZWN0aW9uKSB7XG4gICAgICAgIGNvbnN0IG5ld1NlbGVjdGlvbiA9IGNhbGxiYWNrKGVkaXRvciwgc2VsZWN0aW9uLCBvcHRpb25zLmFyZ3MpO1xuICAgICAgICBuZXdTZWxlY3Rpb25zLnB1c2gobmV3U2VsZWN0aW9uKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBpZiAob3B0aW9ucy5jdXN0b21TZWxlY3Rpb25IYW5kbGVyKSB7XG4gICAgICBuZXdTZWxlY3Rpb25zID0gb3B0aW9ucy5jdXN0b21TZWxlY3Rpb25IYW5kbGVyKG5ld1NlbGVjdGlvbnMpO1xuICAgIH1cbiAgICBlZGl0b3Iuc2V0U2VsZWN0aW9ucyhuZXdTZWxlY3Rpb25zKTtcbiAgfTtcblxuICBpZiAoIWNtKSB7XG4gICAgLy8gR3JvdXAgYWxsIHRoZSB1cGRhdGVzIGludG8gb25lIGF0b21pYyBvcGVyYXRpb24gKHNvIHVuZG8vcmVkbyB3b3JrIGFzIGV4cGVjdGVkKVxuICAgIGNtLm9wZXJhdGlvbihhcHBseUNhbGxiYWNrT25TZWxlY3Rpb25zKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBTYWZlIGZhbGxiYWNrIGlmIGNtIGRvZXNuJ3QgZXhpc3QgKHNvIHVuZG8vcmVkbyB3aWxsIHN0ZXAgdGhyb3VnaCBlYWNoIGNoYW5nZSlcbiAgICBjb25zb2xlLmVycm9yKCdjbSBvYmplY3Qgbm90IGZvdW5kLCBvcGVyYXRpb25zIHdpbGwgbm90IGJlIGJ1ZmZlcmVkJyk7XG4gICAgYXBwbHlDYWxsYmFja09uU2VsZWN0aW9ucygpO1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgZ2V0TGluZVN0YXJ0UG9zID0gKGxpbmU6IG51bWJlcik6IEVkaXRvclBvc2l0aW9uID0+ICh7XG4gIGxpbmUsXG4gIGNoOiAwLFxufSk7XG5cbmV4cG9ydCBjb25zdCBnZXRMaW5lRW5kUG9zID0gKFxuICBsaW5lOiBudW1iZXIsXG4gIGVkaXRvcjogRWRpdG9yLFxuKTogRWRpdG9yUG9zaXRpb24gPT4gKHtcbiAgbGluZSxcbiAgY2g6IGVkaXRvci5nZXRMaW5lKGxpbmUpLmxlbmd0aCxcbn0pO1xuXG5leHBvcnQgY29uc3QgZ2V0U2VsZWN0aW9uQm91bmRhcmllcyA9IChzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbikgPT4ge1xuICBsZXQgeyBhbmNob3I6IGZyb20sIGhlYWQ6IHRvIH0gPSBzZWxlY3Rpb247XG5cbiAgLy8gaW4gY2FzZSB1c2VyIHNlbGVjdHMgdXB3YXJkc1xuICBpZiAoZnJvbS5saW5lID4gdG8ubGluZSkge1xuICAgIFtmcm9tLCB0b10gPSBbdG8sIGZyb21dO1xuICB9XG5cbiAgcmV0dXJuIHsgZnJvbSwgdG8gfTtcbn07XG5cbmV4cG9ydCBjb25zdCBnZXRMZWFkaW5nV2hpdGVzcGFjZSA9IChsaW5lQ29udGVudDogc3RyaW5nKSA9PiB7XG4gIGNvbnN0IGluZGVudGF0aW9uID0gbGluZUNvbnRlbnQubWF0Y2goL15cXHMrLyk7XG4gIHJldHVybiBpbmRlbnRhdGlvbiA/IGluZGVudGF0aW9uWzBdIDogJyc7XG59O1xuXG5jb25zdCBpc1dvcmRDaGFyYWN0ZXIgPSAoY2hhcjogc3RyaW5nKSA9PiAvXFx3Ly50ZXN0KGNoYXIpO1xuXG5leHBvcnQgY29uc3Qgd29yZFJhbmdlQXRQb3MgPSAoXG4gIHBvczogRWRpdG9yUG9zaXRpb24sXG4gIGxpbmVDb250ZW50OiBzdHJpbmcsXG4pOiB7IGFuY2hvcjogRWRpdG9yUG9zaXRpb247IGhlYWQ6IEVkaXRvclBvc2l0aW9uIH0gPT4ge1xuICBsZXQgc3RhcnQgPSBwb3MuY2g7XG4gIGxldCBlbmQgPSBwb3MuY2g7XG4gIHdoaWxlIChzdGFydCA+IDAgJiYgaXNXb3JkQ2hhcmFjdGVyKGxpbmVDb250ZW50LmNoYXJBdChzdGFydCAtIDEpKSkge1xuICAgIHN0YXJ0LS07XG4gIH1cbiAgd2hpbGUgKGVuZCA8IGxpbmVDb250ZW50Lmxlbmd0aCAmJiBpc1dvcmRDaGFyYWN0ZXIobGluZUNvbnRlbnQuY2hhckF0KGVuZCkpKSB7XG4gICAgZW5kKys7XG4gIH1cbiAgcmV0dXJuIHtcbiAgICBhbmNob3I6IHtcbiAgICAgIGxpbmU6IHBvcy5saW5lLFxuICAgICAgY2g6IHN0YXJ0LFxuICAgIH0sXG4gICAgaGVhZDoge1xuICAgICAgbGluZTogcG9zLmxpbmUsXG4gICAgICBjaDogZW5kLFxuICAgIH0sXG4gIH07XG59O1xuXG5leHBvcnQgdHlwZSBDaGVja0NoYXJhY3RlciA9IChjaGFyOiBzdHJpbmcpID0+IGJvb2xlYW47XG5cbmV4cG9ydCBjb25zdCBmaW5kUG9zT2ZOZXh0Q2hhcmFjdGVyID0gKHtcbiAgZWRpdG9yLFxuICBzdGFydFBvcyxcbiAgY2hlY2tDaGFyYWN0ZXIsXG4gIHNlYXJjaERpcmVjdGlvbixcbn06IHtcbiAgZWRpdG9yOiBFZGl0b3I7XG4gIHN0YXJ0UG9zOiBFZGl0b3JQb3NpdGlvbjtcbiAgY2hlY2tDaGFyYWN0ZXI6IENoZWNrQ2hhcmFjdGVyO1xuICBzZWFyY2hEaXJlY3Rpb246IERJUkVDVElPTjtcbn0pID0+IHtcbiAgbGV0IHsgbGluZSwgY2ggfSA9IHN0YXJ0UG9zO1xuICBsZXQgbGluZUNvbnRlbnQgPSBlZGl0b3IuZ2V0TGluZShsaW5lKTtcbiAgbGV0IG1hdGNoRm91bmQgPSBmYWxzZTtcbiAgbGV0IG1hdGNoZWRDaGFyOiBzdHJpbmc7XG5cbiAgaWYgKHNlYXJjaERpcmVjdGlvbiA9PT0gRElSRUNUSU9OLkJBQ0tXQVJEKSB7XG4gICAgd2hpbGUgKGxpbmUgPj0gMCkge1xuICAgICAgLy8gY2ggd2lsbCBpbml0aWFsbHkgYmUgMCBpZiBzZWFyY2hpbmcgZnJvbSBzdGFydCBvZiBsaW5lXG4gICAgICBjb25zdCBjaGFyID0gbGluZUNvbnRlbnQuY2hhckF0KE1hdGgubWF4KGNoIC0gMSwgMCkpO1xuICAgICAgbWF0Y2hGb3VuZCA9IGNoZWNrQ2hhcmFjdGVyKGNoYXIpO1xuICAgICAgaWYgKG1hdGNoRm91bmQpIHtcbiAgICAgICAgbWF0Y2hlZENoYXIgPSBjaGFyO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNoLS07XG4gICAgICAvLyBpbmNsdXNpdmUgYmVjYXVzZSAoY2ggLSAxKSBtZWFucyB0aGUgZmlyc3QgY2hhcmFjdGVyIHdpbGwgYWxyZWFkeVxuICAgICAgLy8gaGF2ZSBiZWVuIGNoZWNrZWRcbiAgICAgIGlmIChjaCA8PSAwKSB7XG4gICAgICAgIGxpbmUtLTtcbiAgICAgICAgaWYgKGxpbmUgPj0gMCkge1xuICAgICAgICAgIGxpbmVDb250ZW50ID0gZWRpdG9yLmdldExpbmUobGluZSk7XG4gICAgICAgICAgY2ggPSBsaW5lQ29udGVudC5sZW5ndGg7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gIH0gZWxzZSB7XG4gICAgd2hpbGUgKGxpbmUgPCBlZGl0b3IubGluZUNvdW50KCkpIHtcbiAgICAgIGNvbnN0IGNoYXIgPSBsaW5lQ29udGVudC5jaGFyQXQoY2gpO1xuICAgICAgbWF0Y2hGb3VuZCA9IGNoZWNrQ2hhcmFjdGVyKGNoYXIpO1xuICAgICAgaWYgKG1hdGNoRm91bmQpIHtcbiAgICAgICAgbWF0Y2hlZENoYXIgPSBjaGFyO1xuICAgICAgICBicmVhaztcbiAgICAgIH1cbiAgICAgIGNoKys7XG4gICAgICBpZiAoY2ggPj0gbGluZUNvbnRlbnQubGVuZ3RoKSB7XG4gICAgICAgIGxpbmUrKztcbiAgICAgICAgbGluZUNvbnRlbnQgPSBlZGl0b3IuZ2V0TGluZShsaW5lKTtcbiAgICAgICAgY2ggPSAwO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBtYXRjaEZvdW5kXG4gICAgPyB7XG4gICAgICAgIG1hdGNoOiBtYXRjaGVkQ2hhcixcbiAgICAgICAgcG9zOiB7XG4gICAgICAgICAgbGluZSxcbiAgICAgICAgICBjaCxcbiAgICAgICAgfSxcbiAgICAgIH1cbiAgICA6IG51bGw7XG59O1xuIiwgImltcG9ydCB7IEFwcCwgRWRpdG9yLCBFZGl0b3JTZWxlY3Rpb24gfSBmcm9tICdvYnNpZGlhbic7XG5pbXBvcnQge1xuICBDQVNFLFxuICBESVJFQ1RJT04sXG4gIExPV0VSQ0FTRV9BUlRJQ0xFUyxcbiAgTUFUQ0hJTkdfQlJBQ0tFVFMsXG4gIE1BVENISU5HX1FVT1RFUyxcbiAgTWF0Y2hpbmdDaGFyYWN0ZXJNYXAsXG59IGZyb20gJy4vY29uc3RhbnRzJztcbmltcG9ydCB7XG4gIENoZWNrQ2hhcmFjdGVyLFxuICBmaW5kUG9zT2ZOZXh0Q2hhcmFjdGVyLFxuICBnZXRMZWFkaW5nV2hpdGVzcGFjZSxcbiAgZ2V0TGluZUVuZFBvcyxcbiAgZ2V0TGluZVN0YXJ0UG9zLFxuICBnZXRTZWxlY3Rpb25Cb3VuZGFyaWVzLFxuICB3b3JkUmFuZ2VBdFBvcyxcbn0gZnJvbSAnLi91dGlscyc7XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRMaW5lQWJvdmUgPSAoZWRpdG9yOiBFZGl0b3IsIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uKSA9PiB7XG4gIGNvbnN0IHsgbGluZSB9ID0gc2VsZWN0aW9uLmhlYWQ7XG4gIGNvbnN0IHN0YXJ0T2ZDdXJyZW50TGluZSA9IGdldExpbmVTdGFydFBvcyhsaW5lKTtcbiAgZWRpdG9yLnJlcGxhY2VSYW5nZSgnXFxuJywgc3RhcnRPZkN1cnJlbnRMaW5lKTtcbiAgcmV0dXJuIHsgYW5jaG9yOiBzdGFydE9mQ3VycmVudExpbmUgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBpbnNlcnRMaW5lQmVsb3cgPSAoZWRpdG9yOiBFZGl0b3IsIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uKSA9PiB7XG4gIGNvbnN0IHsgbGluZSB9ID0gc2VsZWN0aW9uLmhlYWQ7XG4gIGNvbnN0IGVuZE9mQ3VycmVudExpbmUgPSBnZXRMaW5lRW5kUG9zKGxpbmUsIGVkaXRvcik7XG4gIGNvbnN0IGluZGVudGF0aW9uID0gZ2V0TGVhZGluZ1doaXRlc3BhY2UoZWRpdG9yLmdldExpbmUobGluZSkpO1xuICBlZGl0b3IucmVwbGFjZVJhbmdlKCdcXG4nICsgaW5kZW50YXRpb24sIGVuZE9mQ3VycmVudExpbmUpO1xuICByZXR1cm4geyBhbmNob3I6IHsgbGluZTogbGluZSArIDEsIGNoOiBpbmRlbnRhdGlvbi5sZW5ndGggfSB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGRlbGV0ZVNlbGVjdGVkTGluZXMgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbikgPT4ge1xuICBjb25zdCB7IGZyb20sIHRvIH0gPSBnZXRTZWxlY3Rpb25Cb3VuZGFyaWVzKHNlbGVjdGlvbik7XG4gIGlmICh0by5saW5lID09PSBlZGl0b3IubGFzdExpbmUoKSkge1xuICAgIC8vIFRoZXJlIGlzIG5vICduZXh0IGxpbmUnIHdoZW4gY3Vyc29yIGlzIG9uIHRoZSBsYXN0IGxpbmVcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgICAgJycsXG4gICAgICBnZXRMaW5lRW5kUG9zKGZyb20ubGluZSAtIDEsIGVkaXRvciksXG4gICAgICBnZXRMaW5lRW5kUG9zKHRvLmxpbmUsIGVkaXRvciksXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgICAgJycsXG4gICAgICBnZXRMaW5lU3RhcnRQb3MoZnJvbS5saW5lKSxcbiAgICAgIGdldExpbmVTdGFydFBvcyh0by5saW5lICsgMSksXG4gICAgKTtcbiAgfVxuICByZXR1cm4geyBhbmNob3I6IHsgbGluZTogZnJvbS5saW5lLCBjaDogc2VsZWN0aW9uLmhlYWQuY2ggfSB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGRlbGV0ZVRvRW5kT2ZMaW5lID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4pID0+IHtcbiAgY29uc3QgcG9zID0gc2VsZWN0aW9uLmhlYWQ7XG4gIGNvbnN0IGVuZFBvcyA9IGdldExpbmVFbmRQb3MocG9zLmxpbmUsIGVkaXRvcik7XG5cbiAgaWYgKHBvcy5saW5lID09PSBlbmRQb3MubGluZSAmJiBwb3MuY2ggPT09IGVuZFBvcy5jaCkge1xuICAgIC8vIFdlJ3JlIGF0IHRoZSBlbmQgb2YgdGhlIGxpbmUgc28gZGVsZXRlIGp1c3QgdGhlIG5ld2xpbmVcbiAgICBlbmRQb3MubGluZSA9IGVuZFBvcy5saW5lICsgMTtcbiAgICBlbmRQb3MuY2ggPSAwO1xuICB9XG5cbiAgZWRpdG9yLnJlcGxhY2VSYW5nZSgnJywgcG9zLCBlbmRQb3MpO1xuICByZXR1cm4gc2VsZWN0aW9uO1xufTtcblxuZXhwb3J0IGNvbnN0IGpvaW5MaW5lcyA9IChlZGl0b3I6IEVkaXRvciwgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24pID0+IHtcbiAgY29uc3QgeyBsaW5lIH0gPSBzZWxlY3Rpb24uaGVhZDtcbiAgY29uc3QgY29udGVudHNPZk5leHRMaW5lID0gZWRpdG9yLmdldExpbmUobGluZSArIDEpLnRyaW1TdGFydCgpO1xuICBjb25zdCBlbmRPZkN1cnJlbnRMaW5lID0gZ2V0TGluZUVuZFBvcyhsaW5lLCBlZGl0b3IpO1xuICBjb25zdCBlbmRPZk5leHRMaW5lID0gZ2V0TGluZUVuZFBvcyhsaW5lICsgMSwgZWRpdG9yKTtcbiAgZWRpdG9yLnJlcGxhY2VSYW5nZShcbiAgICBjb250ZW50c09mTmV4dExpbmUubGVuZ3RoID4gMFxuICAgICAgPyAnICcgKyBjb250ZW50c09mTmV4dExpbmVcbiAgICAgIDogY29udGVudHNPZk5leHRMaW5lLFxuICAgIGVuZE9mQ3VycmVudExpbmUsXG4gICAgZW5kT2ZOZXh0TGluZSxcbiAgKTtcbiAgcmV0dXJuIHsgYW5jaG9yOiBlbmRPZkN1cnJlbnRMaW5lIH07XG59O1xuXG5leHBvcnQgY29uc3QgY29weUxpbmUgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbiAgZGlyZWN0aW9uOiAndXAnIHwgJ2Rvd24nLFxuKSA9PiB7XG4gIGNvbnN0IHsgZnJvbSwgdG8gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgY29uc3QgZnJvbUxpbmVTdGFydCA9IGdldExpbmVTdGFydFBvcyhmcm9tLmxpbmUpO1xuICBjb25zdCB0b0xpbmVFbmQgPSBnZXRMaW5lRW5kUG9zKHRvLmxpbmUsIGVkaXRvcik7XG4gIGNvbnN0IGNvbnRlbnRzT2ZTZWxlY3RlZExpbmVzID0gZWRpdG9yLmdldFJhbmdlKGZyb21MaW5lU3RhcnQsIHRvTGluZUVuZCk7XG4gIGlmIChkaXJlY3Rpb24gPT09ICd1cCcpIHtcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKCdcXG4nICsgY29udGVudHNPZlNlbGVjdGVkTGluZXMsIHRvTGluZUVuZCk7XG4gICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgfSBlbHNlIHtcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKGNvbnRlbnRzT2ZTZWxlY3RlZExpbmVzICsgJ1xcbicsIGZyb21MaW5lU3RhcnQpO1xuICAgIGNvbnN0IGxpbmVzU2VsZWN0ZWQgPSB0by5saW5lIC0gZnJvbS5saW5lICsgMTtcbiAgICByZXR1cm4ge1xuICAgICAgYW5jaG9yOiB7IGxpbmU6IHRvLmxpbmUgKyAxLCBjaDogZnJvbS5jaCB9LFxuICAgICAgaGVhZDogeyBsaW5lOiB0by5saW5lICsgbGluZXNTZWxlY3RlZCwgY2g6IHRvLmNoIH0sXG4gICAgfTtcbiAgfVxufTtcblxuZXhwb3J0IGNvbnN0IHNlbGVjdFdvcmQgPSAoZWRpdG9yOiBFZGl0b3IsIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uKSA9PiB7XG4gIGNvbnN0IHsgZnJvbSwgdG8gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgY29uc3Qgc2VsZWN0ZWRUZXh0ID0gZWRpdG9yLmdldFJhbmdlKGZyb20sIHRvKTtcbiAgLy8gRG8gbm90IG1vZGlmeSBzZWxlY3Rpb24gaWYgc29tZXRoaW5nIGlzIHNlbGVjdGVkXG4gIGlmIChzZWxlY3RlZFRleHQubGVuZ3RoICE9PSAwKSB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gd29yZFJhbmdlQXRQb3MoZnJvbSwgZWRpdG9yLmdldExpbmUoZnJvbS5saW5lKSk7XG4gIH1cbn07XG5cbmV4cG9ydCBjb25zdCBzZWxlY3RMaW5lID0gKF9lZGl0b3I6IEVkaXRvciwgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24pID0+IHtcbiAgY29uc3QgeyBmcm9tLCB0byB9ID0gZ2V0U2VsZWN0aW9uQm91bmRhcmllcyhzZWxlY3Rpb24pO1xuICBjb25zdCBzdGFydE9mQ3VycmVudExpbmUgPSBnZXRMaW5lU3RhcnRQb3MoZnJvbS5saW5lKTtcbiAgLy8gaWYgYSBsaW5lIGlzIGFscmVhZHkgc2VsZWN0ZWQsIGV4cGFuZCB0aGUgc2VsZWN0aW9uIHRvIHRoZSBuZXh0IGxpbmVcbiAgY29uc3Qgc3RhcnRPZk5leHRMaW5lID0gZ2V0TGluZVN0YXJ0UG9zKHRvLmxpbmUgKyAxKTtcbiAgcmV0dXJuIHsgYW5jaG9yOiBzdGFydE9mQ3VycmVudExpbmUsIGhlYWQ6IHN0YXJ0T2ZOZXh0TGluZSB9O1xufTtcblxuZXhwb3J0IGNvbnN0IGdvVG9MaW5lQm91bmRhcnkgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbiAgYm91bmRhcnk6ICdzdGFydCcgfCAnZW5kJyxcbikgPT4ge1xuICBjb25zdCB7IGZyb20sIHRvIH0gPSBnZXRTZWxlY3Rpb25Cb3VuZGFyaWVzKHNlbGVjdGlvbik7XG4gIGlmIChib3VuZGFyeSA9PT0gJ3N0YXJ0Jykge1xuICAgIHJldHVybiB7IGFuY2hvcjogZ2V0TGluZVN0YXJ0UG9zKGZyb20ubGluZSkgfTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4geyBhbmNob3I6IGdldExpbmVFbmRQb3ModG8ubGluZSwgZWRpdG9yKSB9O1xuICB9XG59O1xuXG5leHBvcnQgY29uc3QgbmF2aWdhdGVMaW5lID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4gIGRpcmVjdGlvbjogJ3VwJyB8ICdkb3duJyxcbikgPT4ge1xuICBjb25zdCBwb3MgPSBzZWxlY3Rpb24uaGVhZDtcbiAgbGV0IGxpbmU6IG51bWJlcjtcblxuICBpZiAoZGlyZWN0aW9uID09PSAndXAnKSB7XG4gICAgbGluZSA9IE1hdGgubWF4KHBvcy5saW5lIC0gMSwgMCk7XG4gIH0gZWxzZSB7XG4gICAgbGluZSA9IE1hdGgubWluKHBvcy5saW5lICsgMSwgZWRpdG9yLmxpbmVDb3VudCgpIC0gMSk7XG4gIH1cblxuICBjb25zdCBlbmRPZkxpbmUgPSBnZXRMaW5lRW5kUG9zKGxpbmUsIGVkaXRvcik7XG4gIGNvbnN0IGNoID0gTWF0aC5taW4ocG9zLmNoLCBlbmRPZkxpbmUuY2gpO1xuXG4gIHJldHVybiB7IGFuY2hvcjogeyBsaW5lLCBjaCB9IH07XG59O1xuXG5leHBvcnQgY29uc3QgbW92ZUN1cnNvciA9IChcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIHNlbGVjdGlvbjogRWRpdG9yU2VsZWN0aW9uLFxuICBkaXJlY3Rpb246IERJUkVDVElPTixcbikgPT4ge1xuICBjb25zdCB7IGxpbmUsIGNoIH0gPSBzZWxlY3Rpb24uaGVhZDtcblxuICBjb25zdCBtb3ZlbWVudCA9IGRpcmVjdGlvbiA9PT0gRElSRUNUSU9OLkJBQ0tXQVJEID8gLTEgOiAxO1xuICBjb25zdCBsaW5lTGVuZ3RoID0gZWRpdG9yLmdldExpbmUobGluZSkubGVuZ3RoO1xuICBjb25zdCBuZXdQb3MgPSB7IGxpbmUsIGNoOiBjaCArIG1vdmVtZW50IH07XG5cbiAgaWYgKG5ld1Bvcy5jaCA8IDAgJiYgbmV3UG9zLmxpbmUgPT09IDApIHtcbiAgICAvLyBNb3ZpbmcgYmFja3dhcmQgcGFzdCBzdGFydCBvZiBkb2MsIGRvIG5vdGhpbmdcbiAgICBuZXdQb3MuY2ggPSBjaDtcbiAgfSBlbHNlIGlmIChuZXdQb3MuY2ggPCAwKSB7XG4gICAgLy8gV3JhcCBiYWNrd2FyZCBvdmVyIHN0YXJ0IG9mIGxpbmVcbiAgICBuZXdQb3MubGluZSA9IE1hdGgubWF4KG5ld1Bvcy5saW5lIC0gMSwgMCk7XG4gICAgbmV3UG9zLmNoID0gZWRpdG9yLmdldExpbmUobmV3UG9zLmxpbmUpLmxlbmd0aDtcbiAgfSBlbHNlIGlmIChuZXdQb3MuY2ggPiBsaW5lTGVuZ3RoKSB7XG4gICAgLy8gV3JhcCBmb3J3YXJkIG92ZXIgZW5kIG9mIGxpbmVcbiAgICBuZXdQb3MubGluZSArPSAxO1xuICAgIG5ld1Bvcy5jaCA9IDA7XG4gIH1cblxuICByZXR1cm4geyBhbmNob3I6IG5ld1BvcyB9O1xufTtcblxuZXhwb3J0IGNvbnN0IHRyYW5zZm9ybUNhc2UgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbiAgY2FzZVR5cGU6IENBU0UsXG4pID0+IHtcbiAgbGV0IHsgZnJvbSwgdG8gfSA9IGdldFNlbGVjdGlvbkJvdW5kYXJpZXMoc2VsZWN0aW9uKTtcbiAgbGV0IHNlbGVjdGVkVGV4dCA9IGVkaXRvci5nZXRSYW5nZShmcm9tLCB0byk7XG5cbiAgLy8gYXBwbHkgdHJhbnNmb3JtIG9uIHdvcmQgYXQgY3Vyc29yIGlmIG5vdGhpbmcgaXMgc2VsZWN0ZWRcbiAgaWYgKHNlbGVjdGVkVGV4dC5sZW5ndGggPT09IDApIHtcbiAgICBjb25zdCBwb3MgPSBzZWxlY3Rpb24uaGVhZDtcbiAgICBjb25zdCB7IGFuY2hvciwgaGVhZCB9ID0gd29yZFJhbmdlQXRQb3MocG9zLCBlZGl0b3IuZ2V0TGluZShwb3MubGluZSkpO1xuICAgIFtmcm9tLCB0b10gPSBbYW5jaG9yLCBoZWFkXTtcbiAgICBzZWxlY3RlZFRleHQgPSBlZGl0b3IuZ2V0UmFuZ2UoYW5jaG9yLCBoZWFkKTtcbiAgfVxuXG4gIGlmIChjYXNlVHlwZSA9PT0gQ0FTRS5USVRMRSkge1xuICAgIGVkaXRvci5yZXBsYWNlUmFuZ2UoXG4gICAgICAvLyB1c2UgY2FwdHVyZSBncm91cCB0byBqb2luIHdpdGggdGhlIHNhbWUgc2VwYXJhdG9yIHVzZWQgdG8gc3BsaXRcbiAgICAgIHNlbGVjdGVkVGV4dFxuICAgICAgICAuc3BsaXQoLyhcXHMrKS8pXG4gICAgICAgIC5tYXAoKHdvcmQsIGluZGV4LCBhbGxXb3JkcykgPT4ge1xuICAgICAgICAgIGlmIChcbiAgICAgICAgICAgIGluZGV4ID4gMCAmJlxuICAgICAgICAgICAgaW5kZXggPCBhbGxXb3Jkcy5sZW5ndGggLSAxICYmXG4gICAgICAgICAgICBMT1dFUkNBU0VfQVJUSUNMRVMuaW5jbHVkZXMod29yZC50b0xvd2VyQ2FzZSgpKVxuICAgICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIHdvcmQudG9Mb3dlckNhc2UoKTtcbiAgICAgICAgICB9XG4gICAgICAgICAgcmV0dXJuIHdvcmQuY2hhckF0KDApLnRvVXBwZXJDYXNlKCkgKyB3b3JkLnN1YnN0cmluZygxKS50b0xvd2VyQ2FzZSgpO1xuICAgICAgICB9KVxuICAgICAgICAuam9pbignJyksXG4gICAgICBmcm9tLFxuICAgICAgdG8sXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICBlZGl0b3IucmVwbGFjZVJhbmdlKFxuICAgICAgY2FzZVR5cGUgPT09IENBU0UuVVBQRVJcbiAgICAgICAgPyBzZWxlY3RlZFRleHQudG9VcHBlckNhc2UoKVxuICAgICAgICA6IHNlbGVjdGVkVGV4dC50b0xvd2VyQ2FzZSgpLFxuICAgICAgZnJvbSxcbiAgICAgIHRvLFxuICAgICk7XG4gIH1cblxuICByZXR1cm4gc2VsZWN0aW9uO1xufTtcblxuY29uc3QgZXhwYW5kU2VsZWN0aW9uID0gKHtcbiAgZWRpdG9yLFxuICBzZWxlY3Rpb24sXG4gIG9wZW5pbmdDaGFyYWN0ZXJDaGVjayxcbiAgbWF0Y2hpbmdDaGFyYWN0ZXJNYXAsXG59OiB7XG4gIGVkaXRvcjogRWRpdG9yO1xuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbjtcbiAgb3BlbmluZ0NoYXJhY3RlckNoZWNrOiBDaGVja0NoYXJhY3RlcjtcbiAgbWF0Y2hpbmdDaGFyYWN0ZXJNYXA6IE1hdGNoaW5nQ2hhcmFjdGVyTWFwO1xufSkgPT4ge1xuICBsZXQgeyBhbmNob3IsIGhlYWQgfSA9IHNlbGVjdGlvbjtcblxuICAvLyBpbiBjYXNlIHVzZXIgc2VsZWN0cyB1cHdhcmRzXG4gIGlmIChhbmNob3IubGluZSA+PSBoZWFkLmxpbmUgJiYgYW5jaG9yLmNoID4gYW5jaG9yLmNoKSB7XG4gICAgW2FuY2hvciwgaGVhZF0gPSBbaGVhZCwgYW5jaG9yXTtcbiAgfVxuXG4gIGNvbnN0IG5ld0FuY2hvciA9IGZpbmRQb3NPZk5leHRDaGFyYWN0ZXIoe1xuICAgIGVkaXRvcixcbiAgICBzdGFydFBvczogYW5jaG9yLFxuICAgIGNoZWNrQ2hhcmFjdGVyOiBvcGVuaW5nQ2hhcmFjdGVyQ2hlY2ssXG4gICAgc2VhcmNoRGlyZWN0aW9uOiBESVJFQ1RJT04uQkFDS1dBUkQsXG4gIH0pO1xuICBpZiAoIW5ld0FuY2hvcikge1xuICAgIHJldHVybiBzZWxlY3Rpb247XG4gIH1cblxuICBjb25zdCBuZXdIZWFkID0gZmluZFBvc09mTmV4dENoYXJhY3Rlcih7XG4gICAgZWRpdG9yLFxuICAgIHN0YXJ0UG9zOiBoZWFkLFxuICAgIGNoZWNrQ2hhcmFjdGVyOiAoY2hhcjogc3RyaW5nKSA9PlxuICAgICAgY2hhciA9PT0gbWF0Y2hpbmdDaGFyYWN0ZXJNYXBbbmV3QW5jaG9yLm1hdGNoXSxcbiAgICBzZWFyY2hEaXJlY3Rpb246IERJUkVDVElPTi5GT1JXQVJELFxuICB9KTtcbiAgaWYgKCFuZXdIZWFkKSB7XG4gICAgcmV0dXJuIHNlbGVjdGlvbjtcbiAgfVxuXG4gIHJldHVybiB7IGFuY2hvcjogbmV3QW5jaG9yLnBvcywgaGVhZDogbmV3SGVhZC5wb3MgfTtcbn07XG5cbmV4cG9ydCBjb25zdCBleHBhbmRTZWxlY3Rpb25Ub0JyYWNrZXRzID0gKFxuICBlZGl0b3I6IEVkaXRvcixcbiAgc2VsZWN0aW9uOiBFZGl0b3JTZWxlY3Rpb24sXG4pID0+XG4gIGV4cGFuZFNlbGVjdGlvbih7XG4gICAgZWRpdG9yLFxuICAgIHNlbGVjdGlvbixcbiAgICBvcGVuaW5nQ2hhcmFjdGVyQ2hlY2s6IChjaGFyOiBzdHJpbmcpID0+IC9bKFt7XS8udGVzdChjaGFyKSxcbiAgICBtYXRjaGluZ0NoYXJhY3Rlck1hcDogTUFUQ0hJTkdfQlJBQ0tFVFMsXG4gIH0pO1xuXG5leHBvcnQgY29uc3QgZXhwYW5kU2VsZWN0aW9uVG9RdW90ZXMgPSAoXG4gIGVkaXRvcjogRWRpdG9yLFxuICBzZWxlY3Rpb246IEVkaXRvclNlbGVjdGlvbixcbikgPT5cbiAgZXhwYW5kU2VsZWN0aW9uKHtcbiAgICBlZGl0b3IsXG4gICAgc2VsZWN0aW9uLFxuICAgIG9wZW5pbmdDaGFyYWN0ZXJDaGVjazogKGNoYXI6IHN0cmluZykgPT4gL1snXCJgXS8udGVzdChjaGFyKSxcbiAgICBtYXRjaGluZ0NoYXJhY3Rlck1hcDogTUFUQ0hJTkdfUVVPVEVTLFxuICB9KTtcblxuZXhwb3J0IGNvbnN0IGdvVG9IZWFkaW5nID0gKFxuICBhcHA6IEFwcCxcbiAgZWRpdG9yOiBFZGl0b3IsXG4gIGJvdW5kYXJ5OiAncHJldicgfCAnbmV4dCcsXG4pID0+IHtcbiAgY29uc3QgZmlsZSA9IGFwcC5tZXRhZGF0YUNhY2hlLmdldEZpbGVDYWNoZShhcHAud29ya3NwYWNlLmdldEFjdGl2ZUZpbGUoKSk7XG4gIGlmICghZmlsZS5oZWFkaW5ncyB8fCBmaWxlLmhlYWRpbmdzLmxlbmd0aCA9PT0gMCkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNvbnN0IHsgbGluZSB9ID0gZWRpdG9yLmdldEN1cnNvcignZnJvbScpO1xuICBsZXQgcHJldkhlYWRpbmdMaW5lID0gMDtcbiAgbGV0IG5leHRIZWFkaW5nTGluZSA9IGVkaXRvci5sYXN0TGluZSgpO1xuXG4gIGZpbGUuaGVhZGluZ3MuZm9yRWFjaCgoeyBwb3NpdGlvbiB9KSA9PiB7XG4gICAgY29uc3QgeyBlbmQ6IGhlYWRpbmdQb3MgfSA9IHBvc2l0aW9uO1xuICAgIGlmIChsaW5lID4gaGVhZGluZ1Bvcy5saW5lICYmIGhlYWRpbmdQb3MubGluZSA+IHByZXZIZWFkaW5nTGluZSkge1xuICAgICAgcHJldkhlYWRpbmdMaW5lID0gaGVhZGluZ1Bvcy5saW5lO1xuICAgIH1cbiAgICBpZiAobGluZSA8IGhlYWRpbmdQb3MubGluZSAmJiBoZWFkaW5nUG9zLmxpbmUgPCBuZXh0SGVhZGluZ0xpbmUpIHtcbiAgICAgIG5leHRIZWFkaW5nTGluZSA9IGhlYWRpbmdQb3MubGluZTtcbiAgICB9XG4gIH0pO1xuXG4gIGVkaXRvci5zZXRTZWxlY3Rpb24oXG4gICAgYm91bmRhcnkgPT09ICdwcmV2J1xuICAgICAgPyBnZXRMaW5lRW5kUG9zKHByZXZIZWFkaW5nTGluZSwgZWRpdG9yKVxuICAgICAgOiBnZXRMaW5lRW5kUG9zKG5leHRIZWFkaW5nTGluZSwgZWRpdG9yKSxcbiAgKTtcbn07XG4iLCAiaW1wb3J0IHsgRWRpdG9yU2VsZWN0aW9uT3JDYXJldCB9IGZyb20gJ29ic2lkaWFuJztcblxuZXhwb3J0IHR5cGUgQ3VzdG9tU2VsZWN0aW9uSGFuZGxlciA9IChcbiAgc2VsZWN0aW9uczogRWRpdG9yU2VsZWN0aW9uT3JDYXJldFtdLFxuKSA9PiBFZGl0b3JTZWxlY3Rpb25PckNhcmV0W107XG5cbi8vIEZvciBtdWx0aXBsZSBjdXJzb3JzIG9uIHRoZSBzYW1lIGxpbmUsIHRoZSBuZXcgY3Vyc29ycyBzaG91bGQgYmUgb25cbi8vIGNvbnNlY3V0aXZlIGZvbGxvd2luZyBsaW5lc1xuZXhwb3J0IGNvbnN0IGluc2VydExpbmVCZWxvd0hhbmRsZXI6IEN1c3RvbVNlbGVjdGlvbkhhbmRsZXIgPSAoc2VsZWN0aW9ucykgPT4ge1xuICBjb25zdCBzZWVuTGluZXM6IG51bWJlcltdID0gW107XG4gIGxldCBsaW5lSW5jcmVtZW50ID0gMDtcbiAgbGV0IHByb2Nlc3NlZFBvczogRWRpdG9yU2VsZWN0aW9uT3JDYXJldDtcblxuICByZXR1cm4gc2VsZWN0aW9ucy5yZWR1Y2UoKHByb2Nlc3NlZCwgY3VycmVudFBvcykgPT4ge1xuICAgIGNvbnN0IGN1cnJlbnRMaW5lID0gY3VycmVudFBvcy5hbmNob3IubGluZTtcbiAgICBpZiAoIXNlZW5MaW5lcy5pbmNsdWRlcyhjdXJyZW50TGluZSkpIHtcbiAgICAgIHNlZW5MaW5lcy5wdXNoKGN1cnJlbnRMaW5lKTtcbiAgICAgIGxpbmVJbmNyZW1lbnQgPSAwO1xuICAgICAgcHJvY2Vzc2VkUG9zID0gY3VycmVudFBvcztcbiAgICB9IGVsc2Uge1xuICAgICAgbGluZUluY3JlbWVudCsrO1xuICAgICAgcHJvY2Vzc2VkUG9zID0ge1xuICAgICAgICBhbmNob3I6IHtcbiAgICAgICAgICBsaW5lOiBjdXJyZW50TGluZSArIGxpbmVJbmNyZW1lbnQsXG4gICAgICAgICAgY2g6IGN1cnJlbnRQb3MuYW5jaG9yLmNoLFxuICAgICAgICB9LFxuICAgICAgfTtcbiAgICB9XG4gICAgcHJvY2Vzc2VkLnB1c2gocHJvY2Vzc2VkUG9zKTtcbiAgICByZXR1cm4gcHJvY2Vzc2VkO1xuICB9LCBbXSk7XG59O1xuIl0sCiAgIm1hcHBpbmdzIjogIjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUE7QUFBQTtBQUFBO0FBQUEsc0JBQXVCOzs7QUNBaEIsSUFBSztBQUFMLFVBQUssT0FBTDtBQUNMLG1CQUFRO0FBQ1IsbUJBQVE7QUFDUixtQkFBUTtBQUFBLEdBSEU7QUFNTCxJQUFNLHFCQUFxQixDQUFDLE9BQU8sS0FBSztBQUV4QyxJQUFLO0FBQUwsVUFBSyxZQUFMO0FBQ0wsMEJBQVU7QUFDViwyQkFBVztBQUFBLEdBRkQ7QUFPTCxJQUFNLG9CQUEwQztBQUFBLEVBQ3JELEtBQUs7QUFBQSxFQUNMLEtBQUs7QUFBQSxFQUNMLEtBQUs7QUFBQTtBQUdBLElBQU0sa0JBQXdDO0FBQUEsRUFDbkQsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBLEVBQ0wsS0FBSztBQUFBOzs7QUNFQSxJQUFNLGtDQUFrQyxFQUFFLHVCQUF1QjtBQUVqRSxJQUFNLHlCQUF5QixDQUNwQyxRQUNBLFVBQ0EsVUFBb0Msb0NBQ2pDO0FBSUgsUUFBTSxFQUFFLE9BQU87QUFFZixNQUFJLGFBQWEsT0FBTztBQUN4QixNQUFJLGdCQUEwQztBQUU5QyxNQUFJLENBQUMsUUFBUSx1QkFBdUI7QUFDbEMsVUFBTSxZQUFzQjtBQUM1QixpQkFBYSxXQUFXLE9BQU8sQ0FBQyxjQUFjO0FBQzVDLFlBQU0sY0FBYyxV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M0MsTUFBTTtBQUFBO0FBQUE7QUFJWixTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQ2YsdUJBQXVCLFFBQVEsWUFBWSxpQ0FDdEMsa0NBRHNDO0FBQUEsUUFFekMsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUl0QixTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQ2YsdUJBQXVCLFFBQVEsWUFBWSxpQ0FDdEMsa0NBRHNDO0FBQUEsUUFFekMsTUFBTSxVQUFVO0FBQUE7QUFBQTtBQUl0QixTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQ2YsdUJBQXVCLFFBQVEsZUFBZSxpQ0FDekMsa0NBRHlDO0FBQUEsUUFFNUMsTUFBTSxLQUFLO0FBQUE7QUFBQTtBQUlqQixTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQ2YsdUJBQXVCLFFBQVEsZUFBZSxpQ0FDekMsa0NBRHlDO0FBQUEsUUFFNUMsTUFBTSxLQUFLO0FBQUE7QUFBQTtBQUlqQixTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQ2YsdUJBQXVCLFFBQVEsZUFBZSxpQ0FDekMsa0NBRHlDO0FBQUEsUUFFNUMsTUFBTSxLQUFLO0FBQUE7QUFBQTtBQUlqQixTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQ2YsdUJBQXVCLFFBQVE7QUFBQTtBQUduQyxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQ2YsdUJBQXVCLFFBQVE7QUFBQTtBQUduQyxTQUFLLFdBQVc7QUFBQSxNQUNkLElBQUk7QUFBQSxNQUNKLE1BQU07QUFBQSxNQUNOLGdCQUFnQixDQUFDLFdBQVcsWUFBWSxLQUFLLEtBQUssUUFBUTtBQUFBO0FBRzVELFNBQUssV0FBVztBQUFBLE1BQ2QsSUFBSTtBQUFBLE1BQ0osTUFBTTtBQUFBLE1BQ04sZ0JBQWdCLENBQUMsV0FBVyxZQUFZLEtBQUssS0FBSyxRQUFRO0FBQUE7QUFBQTtBQUFBOyIsCiAgIm5hbWVzIjogW10KfQo=
