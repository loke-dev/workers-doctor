#!/usr/bin/env node
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e) {
    throw mod = 0, e;
  }
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js
var require_picocolors = __commonJS({
  "node_modules/.pnpm/picocolors@1.1.1/node_modules/picocolors/picocolors.js"(exports, module) {
    "use strict";
    var p = process || {};
    var argv = p.argv || [];
    var env = p.env || {};
    var isColorSupported = !(!!env.NO_COLOR || argv.includes("--no-color")) && (!!env.FORCE_COLOR || argv.includes("--color") || p.platform === "win32" || (p.stdout || {}).isTTY && env.TERM !== "dumb" || !!env.CI);
    var formatter = (open, close, replace = open) => (input) => {
      let string = "" + input, index = string.indexOf(close, open.length);
      return ~index ? open + replaceClose(string, close, replace, index) + close : open + string + close;
    };
    var replaceClose = (string, close, replace, index) => {
      let result = "", cursor = 0;
      do {
        result += string.substring(cursor, index) + replace;
        cursor = index + close.length;
        index = string.indexOf(close, cursor);
      } while (~index);
      return result + string.substring(cursor);
    };
    var createColors = (enabled = isColorSupported) => {
      let f = enabled ? formatter : () => String;
      return {
        isColorSupported: enabled,
        reset: f("\x1B[0m", "\x1B[0m"),
        bold: f("\x1B[1m", "\x1B[22m", "\x1B[22m\x1B[1m"),
        dim: f("\x1B[2m", "\x1B[22m", "\x1B[22m\x1B[2m"),
        italic: f("\x1B[3m", "\x1B[23m"),
        underline: f("\x1B[4m", "\x1B[24m"),
        inverse: f("\x1B[7m", "\x1B[27m"),
        hidden: f("\x1B[8m", "\x1B[28m"),
        strikethrough: f("\x1B[9m", "\x1B[29m"),
        black: f("\x1B[30m", "\x1B[39m"),
        red: f("\x1B[31m", "\x1B[39m"),
        green: f("\x1B[32m", "\x1B[39m"),
        yellow: f("\x1B[33m", "\x1B[39m"),
        blue: f("\x1B[34m", "\x1B[39m"),
        magenta: f("\x1B[35m", "\x1B[39m"),
        cyan: f("\x1B[36m", "\x1B[39m"),
        white: f("\x1B[37m", "\x1B[39m"),
        gray: f("\x1B[90m", "\x1B[39m"),
        bgBlack: f("\x1B[40m", "\x1B[49m"),
        bgRed: f("\x1B[41m", "\x1B[49m"),
        bgGreen: f("\x1B[42m", "\x1B[49m"),
        bgYellow: f("\x1B[43m", "\x1B[49m"),
        bgBlue: f("\x1B[44m", "\x1B[49m"),
        bgMagenta: f("\x1B[45m", "\x1B[49m"),
        bgCyan: f("\x1B[46m", "\x1B[49m"),
        bgWhite: f("\x1B[47m", "\x1B[49m"),
        blackBright: f("\x1B[90m", "\x1B[39m"),
        redBright: f("\x1B[91m", "\x1B[39m"),
        greenBright: f("\x1B[92m", "\x1B[39m"),
        yellowBright: f("\x1B[93m", "\x1B[39m"),
        blueBright: f("\x1B[94m", "\x1B[39m"),
        magentaBright: f("\x1B[95m", "\x1B[39m"),
        cyanBright: f("\x1B[96m", "\x1B[39m"),
        whiteBright: f("\x1B[97m", "\x1B[39m"),
        bgBlackBright: f("\x1B[100m", "\x1B[49m"),
        bgRedBright: f("\x1B[101m", "\x1B[49m"),
        bgGreenBright: f("\x1B[102m", "\x1B[49m"),
        bgYellowBright: f("\x1B[103m", "\x1B[49m"),
        bgBlueBright: f("\x1B[104m", "\x1B[49m"),
        bgMagentaBright: f("\x1B[105m", "\x1B[49m"),
        bgCyanBright: f("\x1B[106m", "\x1B[49m"),
        bgWhiteBright: f("\x1B[107m", "\x1B[49m")
      };
    };
    module.exports = createColors();
    module.exports.createColors = createColors;
  }
});

// src/cli.ts
import { readFile as readFile3 } from "fs/promises";
import { fileURLToPath } from "url";

// src/analyze.ts
import { access, readFile as readFile2, readdir as readdir2, stat as stat2 } from "fs/promises";
import { basename as basename2, dirname, relative, resolve as resolve2 } from "path";

// src/config.ts
import { readFile } from "fs/promises";
import { extname } from "path";

// node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/scanner.js
function createScanner(text, ignoreTrivia = false) {
  const len = text.length;
  let pos = 0, value = "", tokenOffset = 0, token = 16, lineNumber = 0, lineStartOffset = 0, tokenLineStartOffset = 0, prevTokenLineStartOffset = 0, scanError = 0;
  function scanHexDigits(count, exact) {
    let digits = 0;
    let value2 = 0;
    while (digits < count || !exact) {
      let ch = text.charCodeAt(pos);
      if (ch >= 48 && ch <= 57) {
        value2 = value2 * 16 + ch - 48;
      } else if (ch >= 65 && ch <= 70) {
        value2 = value2 * 16 + ch - 65 + 10;
      } else if (ch >= 97 && ch <= 102) {
        value2 = value2 * 16 + ch - 97 + 10;
      } else {
        break;
      }
      pos++;
      digits++;
    }
    if (digits < count) {
      value2 = -1;
    }
    return value2;
  }
  function setPosition(newPosition) {
    pos = newPosition;
    value = "";
    tokenOffset = 0;
    token = 16;
    scanError = 0;
  }
  function scanNumber() {
    let start = pos;
    if (text.charCodeAt(pos) === 48) {
      pos++;
    } else {
      pos++;
      while (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
      }
    }
    if (pos < text.length && text.charCodeAt(pos) === 46) {
      pos++;
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
      } else {
        scanError = 3;
        return text.substring(start, pos);
      }
    }
    let end = pos;
    if (pos < text.length && (text.charCodeAt(pos) === 69 || text.charCodeAt(pos) === 101)) {
      pos++;
      if (pos < text.length && text.charCodeAt(pos) === 43 || text.charCodeAt(pos) === 45) {
        pos++;
      }
      if (pos < text.length && isDigit(text.charCodeAt(pos))) {
        pos++;
        while (pos < text.length && isDigit(text.charCodeAt(pos))) {
          pos++;
        }
        end = pos;
      } else {
        scanError = 3;
      }
    }
    return text.substring(start, end);
  }
  function scanString() {
    let result = "", start = pos;
    while (true) {
      if (pos >= len) {
        result += text.substring(start, pos);
        scanError = 2;
        break;
      }
      const ch = text.charCodeAt(pos);
      if (ch === 34) {
        result += text.substring(start, pos);
        pos++;
        break;
      }
      if (ch === 92) {
        result += text.substring(start, pos);
        pos++;
        if (pos >= len) {
          scanError = 2;
          break;
        }
        const ch2 = text.charCodeAt(pos++);
        switch (ch2) {
          case 34:
            result += '"';
            break;
          case 92:
            result += "\\";
            break;
          case 47:
            result += "/";
            break;
          case 98:
            result += "\b";
            break;
          case 102:
            result += "\f";
            break;
          case 110:
            result += "\n";
            break;
          case 114:
            result += "\r";
            break;
          case 116:
            result += "	";
            break;
          case 117:
            const ch3 = scanHexDigits(4, true);
            if (ch3 >= 0) {
              result += String.fromCharCode(ch3);
            } else {
              scanError = 4;
            }
            break;
          default:
            scanError = 5;
        }
        start = pos;
        continue;
      }
      if (ch >= 0 && ch <= 31) {
        if (isLineBreak(ch)) {
          result += text.substring(start, pos);
          scanError = 2;
          break;
        } else {
          scanError = 6;
        }
      }
      pos++;
    }
    return result;
  }
  function scanNext() {
    value = "";
    scanError = 0;
    tokenOffset = pos;
    lineStartOffset = lineNumber;
    prevTokenLineStartOffset = tokenLineStartOffset;
    if (pos >= len) {
      tokenOffset = len;
      return token = 17;
    }
    let code = text.charCodeAt(pos);
    if (isWhiteSpace(code)) {
      do {
        pos++;
        value += String.fromCharCode(code);
        code = text.charCodeAt(pos);
      } while (isWhiteSpace(code));
      return token = 15;
    }
    if (isLineBreak(code)) {
      pos++;
      value += String.fromCharCode(code);
      if (code === 13 && text.charCodeAt(pos) === 10) {
        pos++;
        value += "\n";
      }
      lineNumber++;
      tokenLineStartOffset = pos;
      return token = 14;
    }
    switch (code) {
      // tokens: []{}:,
      case 123:
        pos++;
        return token = 1;
      case 125:
        pos++;
        return token = 2;
      case 91:
        pos++;
        return token = 3;
      case 93:
        pos++;
        return token = 4;
      case 58:
        pos++;
        return token = 6;
      case 44:
        pos++;
        return token = 5;
      // strings
      case 34:
        pos++;
        value = scanString();
        return token = 10;
      // comments
      case 47:
        const start = pos - 1;
        if (text.charCodeAt(pos + 1) === 47) {
          pos += 2;
          while (pos < len) {
            if (isLineBreak(text.charCodeAt(pos))) {
              break;
            }
            pos++;
          }
          value = text.substring(start, pos);
          return token = 12;
        }
        if (text.charCodeAt(pos + 1) === 42) {
          pos += 2;
          const safeLength = len - 1;
          let commentClosed = false;
          while (pos < safeLength) {
            const ch = text.charCodeAt(pos);
            if (ch === 42 && text.charCodeAt(pos + 1) === 47) {
              pos += 2;
              commentClosed = true;
              break;
            }
            pos++;
            if (isLineBreak(ch)) {
              if (ch === 13 && text.charCodeAt(pos) === 10) {
                pos++;
              }
              lineNumber++;
              tokenLineStartOffset = pos;
            }
          }
          if (!commentClosed) {
            pos++;
            scanError = 1;
          }
          value = text.substring(start, pos);
          return token = 13;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
      // numbers
      case 45:
        value += String.fromCharCode(code);
        pos++;
        if (pos === len || !isDigit(text.charCodeAt(pos))) {
          return token = 16;
        }
      // found a minus, followed by a number so
      // we fall through to proceed with scanning
      // numbers
      case 48:
      case 49:
      case 50:
      case 51:
      case 52:
      case 53:
      case 54:
      case 55:
      case 56:
      case 57:
        value += scanNumber();
        return token = 11;
      // literals and unknown symbols
      default:
        while (pos < len && isUnknownContentCharacter(code)) {
          pos++;
          code = text.charCodeAt(pos);
        }
        if (tokenOffset !== pos) {
          value = text.substring(tokenOffset, pos);
          switch (value) {
            case "true":
              return token = 8;
            case "false":
              return token = 9;
            case "null":
              return token = 7;
          }
          return token = 16;
        }
        value += String.fromCharCode(code);
        pos++;
        return token = 16;
    }
  }
  function isUnknownContentCharacter(code) {
    if (isWhiteSpace(code) || isLineBreak(code)) {
      return false;
    }
    switch (code) {
      case 125:
      case 93:
      case 123:
      case 91:
      case 34:
      case 58:
      case 44:
      case 47:
        return false;
    }
    return true;
  }
  function scanNextNonTrivia() {
    let result;
    do {
      result = scanNext();
    } while (result >= 12 && result <= 15);
    return result;
  }
  return {
    setPosition,
    getPosition: () => pos,
    scan: ignoreTrivia ? scanNextNonTrivia : scanNext,
    getToken: () => token,
    getTokenValue: () => value,
    getTokenOffset: () => tokenOffset,
    getTokenLength: () => pos - tokenOffset,
    getTokenStartLine: () => lineStartOffset,
    getTokenStartCharacter: () => tokenOffset - prevTokenLineStartOffset,
    getTokenError: () => scanError
  };
}
function isWhiteSpace(ch) {
  return ch === 32 || ch === 9;
}
function isLineBreak(ch) {
  return ch === 10 || ch === 13;
}
function isDigit(ch) {
  return ch >= 48 && ch <= 57;
}
var CharacterCodes;
(function(CharacterCodes2) {
  CharacterCodes2[CharacterCodes2["lineFeed"] = 10] = "lineFeed";
  CharacterCodes2[CharacterCodes2["carriageReturn"] = 13] = "carriageReturn";
  CharacterCodes2[CharacterCodes2["space"] = 32] = "space";
  CharacterCodes2[CharacterCodes2["_0"] = 48] = "_0";
  CharacterCodes2[CharacterCodes2["_1"] = 49] = "_1";
  CharacterCodes2[CharacterCodes2["_2"] = 50] = "_2";
  CharacterCodes2[CharacterCodes2["_3"] = 51] = "_3";
  CharacterCodes2[CharacterCodes2["_4"] = 52] = "_4";
  CharacterCodes2[CharacterCodes2["_5"] = 53] = "_5";
  CharacterCodes2[CharacterCodes2["_6"] = 54] = "_6";
  CharacterCodes2[CharacterCodes2["_7"] = 55] = "_7";
  CharacterCodes2[CharacterCodes2["_8"] = 56] = "_8";
  CharacterCodes2[CharacterCodes2["_9"] = 57] = "_9";
  CharacterCodes2[CharacterCodes2["a"] = 97] = "a";
  CharacterCodes2[CharacterCodes2["b"] = 98] = "b";
  CharacterCodes2[CharacterCodes2["c"] = 99] = "c";
  CharacterCodes2[CharacterCodes2["d"] = 100] = "d";
  CharacterCodes2[CharacterCodes2["e"] = 101] = "e";
  CharacterCodes2[CharacterCodes2["f"] = 102] = "f";
  CharacterCodes2[CharacterCodes2["g"] = 103] = "g";
  CharacterCodes2[CharacterCodes2["h"] = 104] = "h";
  CharacterCodes2[CharacterCodes2["i"] = 105] = "i";
  CharacterCodes2[CharacterCodes2["j"] = 106] = "j";
  CharacterCodes2[CharacterCodes2["k"] = 107] = "k";
  CharacterCodes2[CharacterCodes2["l"] = 108] = "l";
  CharacterCodes2[CharacterCodes2["m"] = 109] = "m";
  CharacterCodes2[CharacterCodes2["n"] = 110] = "n";
  CharacterCodes2[CharacterCodes2["o"] = 111] = "o";
  CharacterCodes2[CharacterCodes2["p"] = 112] = "p";
  CharacterCodes2[CharacterCodes2["q"] = 113] = "q";
  CharacterCodes2[CharacterCodes2["r"] = 114] = "r";
  CharacterCodes2[CharacterCodes2["s"] = 115] = "s";
  CharacterCodes2[CharacterCodes2["t"] = 116] = "t";
  CharacterCodes2[CharacterCodes2["u"] = 117] = "u";
  CharacterCodes2[CharacterCodes2["v"] = 118] = "v";
  CharacterCodes2[CharacterCodes2["w"] = 119] = "w";
  CharacterCodes2[CharacterCodes2["x"] = 120] = "x";
  CharacterCodes2[CharacterCodes2["y"] = 121] = "y";
  CharacterCodes2[CharacterCodes2["z"] = 122] = "z";
  CharacterCodes2[CharacterCodes2["A"] = 65] = "A";
  CharacterCodes2[CharacterCodes2["B"] = 66] = "B";
  CharacterCodes2[CharacterCodes2["C"] = 67] = "C";
  CharacterCodes2[CharacterCodes2["D"] = 68] = "D";
  CharacterCodes2[CharacterCodes2["E"] = 69] = "E";
  CharacterCodes2[CharacterCodes2["F"] = 70] = "F";
  CharacterCodes2[CharacterCodes2["G"] = 71] = "G";
  CharacterCodes2[CharacterCodes2["H"] = 72] = "H";
  CharacterCodes2[CharacterCodes2["I"] = 73] = "I";
  CharacterCodes2[CharacterCodes2["J"] = 74] = "J";
  CharacterCodes2[CharacterCodes2["K"] = 75] = "K";
  CharacterCodes2[CharacterCodes2["L"] = 76] = "L";
  CharacterCodes2[CharacterCodes2["M"] = 77] = "M";
  CharacterCodes2[CharacterCodes2["N"] = 78] = "N";
  CharacterCodes2[CharacterCodes2["O"] = 79] = "O";
  CharacterCodes2[CharacterCodes2["P"] = 80] = "P";
  CharacterCodes2[CharacterCodes2["Q"] = 81] = "Q";
  CharacterCodes2[CharacterCodes2["R"] = 82] = "R";
  CharacterCodes2[CharacterCodes2["S"] = 83] = "S";
  CharacterCodes2[CharacterCodes2["T"] = 84] = "T";
  CharacterCodes2[CharacterCodes2["U"] = 85] = "U";
  CharacterCodes2[CharacterCodes2["V"] = 86] = "V";
  CharacterCodes2[CharacterCodes2["W"] = 87] = "W";
  CharacterCodes2[CharacterCodes2["X"] = 88] = "X";
  CharacterCodes2[CharacterCodes2["Y"] = 89] = "Y";
  CharacterCodes2[CharacterCodes2["Z"] = 90] = "Z";
  CharacterCodes2[CharacterCodes2["asterisk"] = 42] = "asterisk";
  CharacterCodes2[CharacterCodes2["backslash"] = 92] = "backslash";
  CharacterCodes2[CharacterCodes2["closeBrace"] = 125] = "closeBrace";
  CharacterCodes2[CharacterCodes2["closeBracket"] = 93] = "closeBracket";
  CharacterCodes2[CharacterCodes2["colon"] = 58] = "colon";
  CharacterCodes2[CharacterCodes2["comma"] = 44] = "comma";
  CharacterCodes2[CharacterCodes2["dot"] = 46] = "dot";
  CharacterCodes2[CharacterCodes2["doubleQuote"] = 34] = "doubleQuote";
  CharacterCodes2[CharacterCodes2["minus"] = 45] = "minus";
  CharacterCodes2[CharacterCodes2["openBrace"] = 123] = "openBrace";
  CharacterCodes2[CharacterCodes2["openBracket"] = 91] = "openBracket";
  CharacterCodes2[CharacterCodes2["plus"] = 43] = "plus";
  CharacterCodes2[CharacterCodes2["slash"] = 47] = "slash";
  CharacterCodes2[CharacterCodes2["formFeed"] = 12] = "formFeed";
  CharacterCodes2[CharacterCodes2["tab"] = 9] = "tab";
})(CharacterCodes || (CharacterCodes = {}));

// node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/string-intern.js
var cachedSpaces = new Array(20).fill(0).map((_, index) => {
  return " ".repeat(index);
});
var maxCachedValues = 200;
var cachedBreakLinesWithSpaces = {
  " ": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + " ".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + " ".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + " ".repeat(index);
    })
  },
  "	": {
    "\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\n" + "	".repeat(index);
    }),
    "\r": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r" + "	".repeat(index);
    }),
    "\r\n": new Array(maxCachedValues).fill(0).map((_, index) => {
      return "\r\n" + "	".repeat(index);
    })
  }
};

// node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/impl/parser.js
var ParseOptions;
(function(ParseOptions2) {
  ParseOptions2.DEFAULT = {
    allowTrailingComma: false
  };
})(ParseOptions || (ParseOptions = {}));
function parse(text, errors = [], options = ParseOptions.DEFAULT) {
  let currentProperty = null;
  let currentParent = [];
  const previousParents = [];
  function onValue(value) {
    if (Array.isArray(currentParent)) {
      currentParent.push(value);
    } else if (currentProperty !== null) {
      currentParent[currentProperty] = value;
    }
  }
  const visitor = {
    onObjectBegin: () => {
      const object = {};
      onValue(object);
      previousParents.push(currentParent);
      currentParent = object;
      currentProperty = null;
    },
    onObjectProperty: (name) => {
      currentProperty = name;
    },
    onObjectEnd: () => {
      currentParent = previousParents.pop();
    },
    onArrayBegin: () => {
      const array = [];
      onValue(array);
      previousParents.push(currentParent);
      currentParent = array;
      currentProperty = null;
    },
    onArrayEnd: () => {
      currentParent = previousParents.pop();
    },
    onLiteralValue: onValue,
    onError: (error, offset, length) => {
      errors.push({ error, offset, length });
    }
  };
  visit(text, visitor, options);
  return currentParent[0];
}
function visit(text, visitor, options = ParseOptions.DEFAULT) {
  const _scanner = createScanner(text, false);
  const _jsonPath = [];
  let suppressedCallbacks = 0;
  function toNoArgVisit(visitFunction) {
    return visitFunction ? () => suppressedCallbacks === 0 && visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisit(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter()) : () => true;
  }
  function toOneArgVisitWithPath(visitFunction) {
    return visitFunction ? (arg) => suppressedCallbacks === 0 && visitFunction(arg, _scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice()) : () => true;
  }
  function toBeginVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks++;
      } else {
        let cbReturn = visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter(), () => _jsonPath.slice());
        if (cbReturn === false) {
          suppressedCallbacks = 1;
        }
      }
    } : () => true;
  }
  function toEndVisit(visitFunction) {
    return visitFunction ? () => {
      if (suppressedCallbacks > 0) {
        suppressedCallbacks--;
      }
      if (suppressedCallbacks === 0) {
        visitFunction(_scanner.getTokenOffset(), _scanner.getTokenLength(), _scanner.getTokenStartLine(), _scanner.getTokenStartCharacter());
      }
    } : () => true;
  }
  const onObjectBegin = toBeginVisit(visitor.onObjectBegin), onObjectProperty = toOneArgVisitWithPath(visitor.onObjectProperty), onObjectEnd = toEndVisit(visitor.onObjectEnd), onArrayBegin = toBeginVisit(visitor.onArrayBegin), onArrayEnd = toEndVisit(visitor.onArrayEnd), onLiteralValue = toOneArgVisitWithPath(visitor.onLiteralValue), onSeparator = toOneArgVisit(visitor.onSeparator), onComment = toNoArgVisit(visitor.onComment), onError = toOneArgVisit(visitor.onError);
  const disallowComments = options && options.disallowComments;
  const allowTrailingComma = options && options.allowTrailingComma;
  function scanNext() {
    while (true) {
      const token = _scanner.scan();
      switch (_scanner.getTokenError()) {
        case 4:
          handleError(
            14
            /* ParseErrorCode.InvalidUnicode */
          );
          break;
        case 5:
          handleError(
            15
            /* ParseErrorCode.InvalidEscapeCharacter */
          );
          break;
        case 3:
          handleError(
            13
            /* ParseErrorCode.UnexpectedEndOfNumber */
          );
          break;
        case 1:
          if (!disallowComments) {
            handleError(
              11
              /* ParseErrorCode.UnexpectedEndOfComment */
            );
          }
          break;
        case 2:
          handleError(
            12
            /* ParseErrorCode.UnexpectedEndOfString */
          );
          break;
        case 6:
          handleError(
            16
            /* ParseErrorCode.InvalidCharacter */
          );
          break;
      }
      switch (token) {
        case 12:
        case 13:
          if (disallowComments) {
            handleError(
              10
              /* ParseErrorCode.InvalidCommentToken */
            );
          } else {
            onComment();
          }
          break;
        case 16:
          handleError(
            1
            /* ParseErrorCode.InvalidSymbol */
          );
          break;
        case 15:
        case 14:
          break;
        default:
          return token;
      }
    }
  }
  function handleError(error, skipUntilAfter = [], skipUntil2 = []) {
    onError(error);
    if (skipUntilAfter.length + skipUntil2.length > 0) {
      let token = _scanner.getToken();
      while (token !== 17) {
        if (skipUntilAfter.indexOf(token) !== -1) {
          scanNext();
          break;
        } else if (skipUntil2.indexOf(token) !== -1) {
          break;
        }
        token = scanNext();
      }
    }
  }
  function parseString2(isValue) {
    const value = _scanner.getTokenValue();
    if (isValue) {
      onLiteralValue(value);
    } else {
      onObjectProperty(value);
      _jsonPath.push(value);
    }
    scanNext();
    return true;
  }
  function parseLiteral() {
    switch (_scanner.getToken()) {
      case 11:
        const tokenValue = _scanner.getTokenValue();
        let value = Number(tokenValue);
        if (isNaN(value)) {
          handleError(
            2
            /* ParseErrorCode.InvalidNumberFormat */
          );
          value = 0;
        }
        onLiteralValue(value);
        break;
      case 7:
        onLiteralValue(null);
        break;
      case 8:
        onLiteralValue(true);
        break;
      case 9:
        onLiteralValue(false);
        break;
      default:
        return false;
    }
    scanNext();
    return true;
  }
  function parseProperty() {
    if (_scanner.getToken() !== 10) {
      handleError(3, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
      return false;
    }
    parseString2(false);
    if (_scanner.getToken() === 6) {
      onSeparator(":");
      scanNext();
      if (!parseValue2()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
    } else {
      handleError(5, [], [
        2,
        5
        /* SyntaxKind.CommaToken */
      ]);
    }
    _jsonPath.pop();
    return true;
  }
  function parseObject() {
    onObjectBegin();
    scanNext();
    let needsComma = false;
    while (_scanner.getToken() !== 2 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 2 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (!parseProperty()) {
        handleError(4, [], [
          2,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onObjectEnd();
    if (_scanner.getToken() !== 2) {
      handleError(7, [
        2
        /* SyntaxKind.CloseBraceToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseArray2() {
    onArrayBegin();
    scanNext();
    let isFirstElement = true;
    let needsComma = false;
    while (_scanner.getToken() !== 4 && _scanner.getToken() !== 17) {
      if (_scanner.getToken() === 5) {
        if (!needsComma) {
          handleError(4, [], []);
        }
        onSeparator(",");
        scanNext();
        if (_scanner.getToken() === 4 && allowTrailingComma) {
          break;
        }
      } else if (needsComma) {
        handleError(6, [], []);
      }
      if (isFirstElement) {
        _jsonPath.push(0);
        isFirstElement = false;
      } else {
        _jsonPath[_jsonPath.length - 1]++;
      }
      if (!parseValue2()) {
        handleError(4, [], [
          4,
          5
          /* SyntaxKind.CommaToken */
        ]);
      }
      needsComma = true;
    }
    onArrayEnd();
    if (!isFirstElement) {
      _jsonPath.pop();
    }
    if (_scanner.getToken() !== 4) {
      handleError(8, [
        4
        /* SyntaxKind.CloseBracketToken */
      ], []);
    } else {
      scanNext();
    }
    return true;
  }
  function parseValue2() {
    switch (_scanner.getToken()) {
      case 3:
        return parseArray2();
      case 1:
        return parseObject();
      case 10:
        return parseString2(true);
      default:
        return parseLiteral();
    }
  }
  scanNext();
  if (_scanner.getToken() === 17) {
    if (options.allowEmptyContent) {
      return true;
    }
    handleError(4, [], []);
    return false;
  }
  if (!parseValue2()) {
    handleError(4, [], []);
    return false;
  }
  if (_scanner.getToken() !== 17) {
    handleError(9, [], []);
  }
  return true;
}

// node_modules/.pnpm/jsonc-parser@3.3.1/node_modules/jsonc-parser/lib/esm/main.js
var ScanError;
(function(ScanError2) {
  ScanError2[ScanError2["None"] = 0] = "None";
  ScanError2[ScanError2["UnexpectedEndOfComment"] = 1] = "UnexpectedEndOfComment";
  ScanError2[ScanError2["UnexpectedEndOfString"] = 2] = "UnexpectedEndOfString";
  ScanError2[ScanError2["UnexpectedEndOfNumber"] = 3] = "UnexpectedEndOfNumber";
  ScanError2[ScanError2["InvalidUnicode"] = 4] = "InvalidUnicode";
  ScanError2[ScanError2["InvalidEscapeCharacter"] = 5] = "InvalidEscapeCharacter";
  ScanError2[ScanError2["InvalidCharacter"] = 6] = "InvalidCharacter";
})(ScanError || (ScanError = {}));
var SyntaxKind;
(function(SyntaxKind2) {
  SyntaxKind2[SyntaxKind2["OpenBraceToken"] = 1] = "OpenBraceToken";
  SyntaxKind2[SyntaxKind2["CloseBraceToken"] = 2] = "CloseBraceToken";
  SyntaxKind2[SyntaxKind2["OpenBracketToken"] = 3] = "OpenBracketToken";
  SyntaxKind2[SyntaxKind2["CloseBracketToken"] = 4] = "CloseBracketToken";
  SyntaxKind2[SyntaxKind2["CommaToken"] = 5] = "CommaToken";
  SyntaxKind2[SyntaxKind2["ColonToken"] = 6] = "ColonToken";
  SyntaxKind2[SyntaxKind2["NullKeyword"] = 7] = "NullKeyword";
  SyntaxKind2[SyntaxKind2["TrueKeyword"] = 8] = "TrueKeyword";
  SyntaxKind2[SyntaxKind2["FalseKeyword"] = 9] = "FalseKeyword";
  SyntaxKind2[SyntaxKind2["StringLiteral"] = 10] = "StringLiteral";
  SyntaxKind2[SyntaxKind2["NumericLiteral"] = 11] = "NumericLiteral";
  SyntaxKind2[SyntaxKind2["LineCommentTrivia"] = 12] = "LineCommentTrivia";
  SyntaxKind2[SyntaxKind2["BlockCommentTrivia"] = 13] = "BlockCommentTrivia";
  SyntaxKind2[SyntaxKind2["LineBreakTrivia"] = 14] = "LineBreakTrivia";
  SyntaxKind2[SyntaxKind2["Trivia"] = 15] = "Trivia";
  SyntaxKind2[SyntaxKind2["Unknown"] = 16] = "Unknown";
  SyntaxKind2[SyntaxKind2["EOF"] = 17] = "EOF";
})(SyntaxKind || (SyntaxKind = {}));
var parse2 = parse;
var ParseErrorCode;
(function(ParseErrorCode2) {
  ParseErrorCode2[ParseErrorCode2["InvalidSymbol"] = 1] = "InvalidSymbol";
  ParseErrorCode2[ParseErrorCode2["InvalidNumberFormat"] = 2] = "InvalidNumberFormat";
  ParseErrorCode2[ParseErrorCode2["PropertyNameExpected"] = 3] = "PropertyNameExpected";
  ParseErrorCode2[ParseErrorCode2["ValueExpected"] = 4] = "ValueExpected";
  ParseErrorCode2[ParseErrorCode2["ColonExpected"] = 5] = "ColonExpected";
  ParseErrorCode2[ParseErrorCode2["CommaExpected"] = 6] = "CommaExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBraceExpected"] = 7] = "CloseBraceExpected";
  ParseErrorCode2[ParseErrorCode2["CloseBracketExpected"] = 8] = "CloseBracketExpected";
  ParseErrorCode2[ParseErrorCode2["EndOfFileExpected"] = 9] = "EndOfFileExpected";
  ParseErrorCode2[ParseErrorCode2["InvalidCommentToken"] = 10] = "InvalidCommentToken";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfComment"] = 11] = "UnexpectedEndOfComment";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfString"] = 12] = "UnexpectedEndOfString";
  ParseErrorCode2[ParseErrorCode2["UnexpectedEndOfNumber"] = 13] = "UnexpectedEndOfNumber";
  ParseErrorCode2[ParseErrorCode2["InvalidUnicode"] = 14] = "InvalidUnicode";
  ParseErrorCode2[ParseErrorCode2["InvalidEscapeCharacter"] = 15] = "InvalidEscapeCharacter";
  ParseErrorCode2[ParseErrorCode2["InvalidCharacter"] = 16] = "InvalidCharacter";
})(ParseErrorCode || (ParseErrorCode = {}));
function printParseErrorCode(code) {
  switch (code) {
    case 1:
      return "InvalidSymbol";
    case 2:
      return "InvalidNumberFormat";
    case 3:
      return "PropertyNameExpected";
    case 4:
      return "ValueExpected";
    case 5:
      return "ColonExpected";
    case 6:
      return "CommaExpected";
    case 7:
      return "CloseBraceExpected";
    case 8:
      return "CloseBracketExpected";
    case 9:
      return "EndOfFileExpected";
    case 10:
      return "InvalidCommentToken";
    case 11:
      return "UnexpectedEndOfComment";
    case 12:
      return "UnexpectedEndOfString";
    case 13:
      return "UnexpectedEndOfNumber";
    case 14:
      return "InvalidUnicode";
    case 15:
      return "InvalidEscapeCharacter";
    case 16:
      return "InvalidCharacter";
  }
  return "<unknown ParseErrorCode>";
}

// node_modules/.pnpm/smol-toml@1.7.0/node_modules/smol-toml/dist/date.js
var DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[-+]\d{2}:\d{2})?$/i;
var TomlDate = class _TomlDate extends Date {
  #hasDate = false;
  #hasTime = false;
  #offset = null;
  constructor(date) {
    let hasDate = true;
    let hasTime = true;
    let offset = "Z";
    if (typeof date === "string") {
      let match = date.match(DATE_TIME_RE);
      if (match) {
        if (!match[1]) {
          hasDate = false;
          date = `0000-01-01T${date}`;
        }
        hasTime = !!match[2];
        hasTime && date[10] === " " && (date = date.replace(" ", "T"));
        if (match[2] && +match[2] > 23) {
          date = "";
        } else {
          offset = match[3] || null;
          date = date.toUpperCase();
          if (!offset && hasTime)
            date += "Z";
        }
      } else {
        date = "";
      }
    }
    super(date);
    if (!isNaN(this.getTime())) {
      this.#hasDate = hasDate;
      this.#hasTime = hasTime;
      this.#offset = offset;
    }
  }
  isDateTime() {
    return this.#hasDate && this.#hasTime;
  }
  isLocal() {
    return !this.#hasDate || !this.#hasTime || !this.#offset;
  }
  isDate() {
    return this.#hasDate && !this.#hasTime;
  }
  isTime() {
    return this.#hasTime && !this.#hasDate;
  }
  isValid() {
    return this.#hasDate || this.#hasTime;
  }
  toISOString() {
    let iso = super.toISOString();
    if (this.isDate())
      return iso.slice(0, 10);
    if (this.isTime())
      return iso.slice(11, 23);
    if (this.#offset === null)
      return iso.slice(0, -1);
    if (this.#offset === "Z")
      return iso;
    let offset = +this.#offset.slice(1, 3) * 60 + +this.#offset.slice(4, 6);
    offset = this.#offset[0] === "-" ? offset : -offset;
    let offsetDate = new Date(this.getTime() - offset * 6e4);
    return offsetDate.toISOString().slice(0, -1) + this.#offset;
  }
  static wrapAsOffsetDateTime(jsDate, offset = "Z") {
    let date = new _TomlDate(jsDate);
    date.#offset = offset;
    return date;
  }
  static wrapAsLocalDateTime(jsDate) {
    let date = new _TomlDate(jsDate);
    date.#offset = null;
    return date;
  }
  static wrapAsLocalDate(jsDate) {
    let date = new _TomlDate(jsDate);
    date.#hasTime = false;
    date.#offset = null;
    return date;
  }
  static wrapAsLocalTime(jsDate) {
    let date = new _TomlDate(jsDate);
    date.#hasDate = false;
    date.#offset = null;
    return date;
  }
};

// node_modules/.pnpm/smol-toml@1.7.0/node_modules/smol-toml/dist/error.js
function getLineColFromPtr(string, ptr) {
  let lines = string.slice(0, ptr).split(/\r\n|\n|\r/g);
  return [lines.length, lines.pop().length + 1];
}
function makeCodeBlock(string, line, column) {
  let lines = string.split(/\r\n|\n|\r/g);
  let codeblock = "";
  let numberLen = (Math.log10(line + 1) | 0) + 1;
  for (let i = line - 1; i <= line + 1; i++) {
    let l = lines[i - 1];
    if (!l)
      continue;
    codeblock += i.toString().padEnd(numberLen, " ");
    codeblock += ":  ";
    codeblock += l;
    codeblock += "\n";
    if (i === line) {
      codeblock += " ".repeat(numberLen + column + 2);
      codeblock += "^\n";
    }
  }
  return codeblock;
}
var TomlError = class extends Error {
  line;
  column;
  codeblock;
  constructor(message, options) {
    const [line, column] = getLineColFromPtr(options.toml, options.ptr);
    const codeblock = makeCodeBlock(options.toml, line, column);
    super(`Invalid TOML document: ${message}

${codeblock}`, options);
    this.line = line;
    this.column = column;
    this.codeblock = codeblock;
  }
};

// node_modules/.pnpm/smol-toml@1.7.0/node_modules/smol-toml/dist/primitive.js
var INT_REGEX = /^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/;
var FLOAT_REGEX = /^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/;
var LEADING_ZERO = /^[+-]?0[0-9_]/;
function parseString(str, ptr) {
  let c = str[ptr++];
  let first = c;
  let isLiteral = c === "'";
  let isMultiline = c === str[ptr] && c === str[ptr + 1];
  if (isMultiline) {
    if (str[ptr += 2] === "\n")
      ptr++;
    else if (str[ptr] === "\r" && str[ptr + 1] === "\n")
      ptr += 2;
  }
  let parsed = "";
  let sliceStart = ptr;
  let state = 0;
  for (let i = ptr; i < str.length; i++) {
    c = str[i];
    if (isMultiline && (c === "\n" || c === "\r" && str[i + 1] === "\n")) {
      state = state && 3;
    } else if (c < " " && c !== "	" || c === "\x7F") {
      throw new TomlError("control characters are not allowed in strings", {
        toml: str,
        ptr: i
      });
    } else if ((!state || state === 3) && c === first && (!isMultiline || str[i + 1] === first && str[i + 2] === first)) {
      if (isMultiline) {
        if (str[i + 3] === first)
          i++;
        if (str[i + 3] === first)
          i++;
      }
      return [
        // If we're in a newline escape still, then there's nothing to add.
        // Also try to avoid concat if there's nothing to add to parsed, or nothing has been added to parsed.
        state ? parsed : parsed + str.slice(sliceStart, i),
        i + (isMultiline ? 3 : 1)
      ];
    } else if (!state) {
      if (!isLiteral && c === "\\") {
        parsed += str.slice(sliceStart, sliceStart = i);
        state = 1;
      }
    } else if (state === 1) {
      if (c === "x" || c === "u" || c === "U") {
        let value = 0;
        let len = c === "x" ? 2 : c === "u" ? 4 : 8;
        for (let j = 0; j < len; j++, i++) {
          let hex = str.charCodeAt(i + 1);
          let digit = (
            /* 0-9 */
            hex >= 48 && hex <= 57 ? hex - 48 : (
              /* A-F */
              hex >= 65 && hex <= 70 ? hex - 65 + 10 : (
                /* a-f */
                hex >= 97 && hex <= 102 ? hex - 97 + 10 : -1
              )
            )
          );
          if (digit < 0)
            throw new TomlError("invalid non-hex character in unicode escape", { toml: str, ptr: i + 1 });
          value = value << 4 | digit;
        }
        if (value < 0 || value > 1114111 || value >= 55296 && value <= 57343) {
          throw new TomlError("invalid unicode escape", { toml: str, ptr: i });
        }
        parsed += String.fromCodePoint(value);
        sliceStart = i + 1;
        state = 0;
      } else if (c === " " || c === "	") {
        state = 2;
      } else {
        if (c === "b")
          parsed += "\b";
        else if (c === "t")
          parsed += "	";
        else if (c === "n")
          parsed += "\n";
        else if (c === "f")
          parsed += "\f";
        else if (c === "r")
          parsed += "\r";
        else if (c === "e")
          parsed += "\x1B";
        else if (c === '"')
          parsed += '"';
        else if (c === "\\")
          parsed += "\\";
        else
          throw new TomlError("unrecognized escape sequence", { toml: str, ptr: i });
        sliceStart = i + 1;
        state = 0;
      }
    } else if (c !== " " && c !== "	") {
      if (state === 2) {
        throw new TomlError("invalid escape: only line-ending whitespace may be escaped", {
          toml: str,
          ptr: sliceStart
        });
      }
      state = !isLiteral && c === "\\" ? 1 : 0;
      sliceStart = i;
    }
  }
  throw new TomlError("unfinished string", { toml: str, ptr });
}
function parseValue(value, toml, ptr, integersAsBigInt) {
  if (value === "true")
    return true;
  if (value === "false")
    return false;
  if (value === "-inf")
    return -Infinity;
  if (value === "inf" || value === "+inf")
    return Infinity;
  if (value === "nan" || value === "+nan" || value === "-nan")
    return NaN;
  if (value === "-0")
    return integersAsBigInt ? 0n : 0;
  let isInt = INT_REGEX.test(value);
  if (isInt || FLOAT_REGEX.test(value)) {
    if (LEADING_ZERO.test(value)) {
      throw new TomlError("leading zeroes are not allowed", {
        toml,
        ptr
      });
    }
    value = value.replace(/_/g, "");
    let numeric = +value;
    if (isNaN(numeric)) {
      throw new TomlError("invalid number", {
        toml,
        ptr
      });
    }
    if (isInt) {
      if ((isInt = !Number.isSafeInteger(numeric)) && !integersAsBigInt) {
        throw new TomlError("integer value cannot be represented losslessly", {
          toml,
          ptr
        });
      }
      if (isInt || integersAsBigInt === true)
        numeric = BigInt(value);
    }
    return numeric;
  }
  const date = new TomlDate(value);
  if (!date.isValid()) {
    throw new TomlError("invalid value", {
      toml,
      ptr
    });
  }
  return date;
}

// node_modules/.pnpm/smol-toml@1.7.0/node_modules/smol-toml/dist/util.js
function indexOfNewline(str, start = 0, end = str.length) {
  let idx = str.indexOf("\n", start);
  if (str[idx - 1] === "\r")
    idx--;
  return idx <= end ? idx : -1;
}
function skipComment(str, ptr) {
  for (let i = ptr; i < str.length; i++) {
    let c = str[i];
    if (c === "\n")
      return i;
    if (c === "\r" && str[i + 1] === "\n")
      return i + 1;
    if (c < " " && c !== "	" || c === "\x7F") {
      throw new TomlError("control characters are not allowed in comments", {
        toml: str,
        ptr
      });
    }
  }
  return str.length;
}
function skipVoid(str, ptr, banNewLines, banComments) {
  let c;
  while (1) {
    while ((c = str[ptr]) === " " || c === "	" || !banNewLines && (c === "\n" || c === "\r" && str[ptr + 1] === "\n"))
      ptr++;
    if (banComments || c !== "#")
      break;
    ptr = skipComment(str, ptr);
  }
  return ptr;
}
function skipUntil(str, ptr, sep, end, banNewLines = false) {
  if (!end) {
    ptr = indexOfNewline(str, ptr);
    return ptr < 0 ? str.length : ptr;
  }
  for (let i = ptr; i < str.length; i++) {
    let c = str[i];
    if (c === "#") {
      i = indexOfNewline(str, i);
    } else if (c === sep) {
      return i + 1;
    } else if (c === end || banNewLines && (c === "\n" || c === "\r" && str[i + 1] === "\n")) {
      return i;
    }
  }
  throw new TomlError("cannot find end of structure", {
    toml: str,
    ptr
  });
}

// node_modules/.pnpm/smol-toml@1.7.0/node_modules/smol-toml/dist/extract.js
function sliceAndTrimEndOf(str, startPtr, endPtr) {
  let value = str.slice(startPtr, endPtr);
  let commentIdx = value.indexOf("#");
  if (commentIdx > -1) {
    skipComment(str, commentIdx);
    value = value.slice(0, commentIdx);
  }
  return [value.trimEnd(), commentIdx];
}
function extractValue(str, ptr, end, depth, integersAsBigInt) {
  if (depth === 0) {
    throw new TomlError("document contains excessively nested structures. aborting.", {
      toml: str,
      ptr
    });
  }
  let c = str[ptr];
  if (c === "[" || c === "{") {
    let [value, endPtr2] = c === "[" ? parseArray(str, ptr, depth, integersAsBigInt) : parseInlineTable(str, ptr, depth, integersAsBigInt);
    if (end) {
      endPtr2 = skipVoid(str, endPtr2);
      if (str[endPtr2] === ",")
        endPtr2++;
      else if (str[endPtr2] !== end) {
        throw new TomlError("expected comma or end of structure", {
          toml: str,
          ptr: endPtr2
        });
      }
    }
    return [value, endPtr2];
  }
  if (c === '"' || c === "'") {
    let [parsed, endPtr2] = parseString(str, ptr);
    if (end) {
      endPtr2 = skipVoid(str, endPtr2);
      if (str[endPtr2] && str[endPtr2] !== "," && str[endPtr2] !== end && str[endPtr2] !== "\n" && str[endPtr2] !== "\r") {
        throw new TomlError("unexpected character encountered", {
          toml: str,
          ptr: endPtr2
        });
      }
      if (str[endPtr2] === ",")
        endPtr2++;
    }
    return [parsed, endPtr2];
  }
  let endPtr = skipUntil(str, ptr, ",", end);
  let slice = sliceAndTrimEndOf(str, ptr, endPtr - (str[endPtr - 1] === "," ? 1 : 0));
  if (!slice[0]) {
    throw new TomlError("incomplete key-value declaration: no value specified", {
      toml: str,
      ptr
    });
  }
  if (end && slice[1] > -1) {
    endPtr = skipVoid(str, ptr + slice[1]);
    if (str[endPtr] === ",")
      endPtr++;
  }
  return [
    parseValue(slice[0], str, ptr, integersAsBigInt),
    endPtr
  ];
}

// node_modules/.pnpm/smol-toml@1.7.0/node_modules/smol-toml/dist/struct.js
var KEY_PART_RE = /^[a-zA-Z0-9-_]+[ \t]*$/;
function parseKey(str, ptr, end = "=") {
  let dot = ptr - 1;
  let parsed = [];
  let endPtr = str.indexOf(end, ptr);
  if (endPtr < 0) {
    throw new TomlError("incomplete key-value: cannot find end of key", {
      toml: str,
      ptr
    });
  }
  do {
    let c = str[ptr = ++dot];
    if (c !== " " && c !== "	") {
      if (c === '"' || c === "'") {
        if (c === str[ptr + 1] && c === str[ptr + 2]) {
          throw new TomlError("multiline strings are not allowed in keys", {
            toml: str,
            ptr
          });
        }
        let [part, eos] = parseString(str, ptr);
        dot = str.indexOf(".", eos);
        let strEnd = str.slice(eos, dot < 0 || dot > endPtr ? endPtr : dot);
        let newLine = indexOfNewline(strEnd);
        if (newLine > -1) {
          throw new TomlError("newlines are not allowed in keys", {
            toml: str,
            ptr: ptr + dot + newLine
          });
        }
        if (strEnd.trimStart()) {
          throw new TomlError("found extra tokens after the string part", {
            toml: str,
            ptr: eos
          });
        }
        if (endPtr < eos) {
          endPtr = str.indexOf(end, eos);
          if (endPtr < 0) {
            throw new TomlError("incomplete key-value: cannot find end of key", {
              toml: str,
              ptr
            });
          }
        }
        parsed.push(part);
      } else {
        dot = str.indexOf(".", ptr);
        let part = str.slice(ptr, dot < 0 || dot > endPtr ? endPtr : dot);
        if (!KEY_PART_RE.test(part)) {
          throw new TomlError("only letter, numbers, dashes and underscores are allowed in keys", {
            toml: str,
            ptr
          });
        }
        parsed.push(part.trimEnd());
      }
    }
  } while (dot + 1 && dot < endPtr);
  return [parsed, skipVoid(str, endPtr + 1, true, true)];
}
function parseInlineTable(str, ptr, depth, integersAsBigInt) {
  let res = {};
  let seen = /* @__PURE__ */ new Set();
  let c;
  ptr++;
  while ((c = str[ptr++]) !== "}" && c) {
    if (c === ",") {
      throw new TomlError("expected value, found comma", {
        toml: str,
        ptr: ptr - 1
      });
    } else if (c === "#")
      ptr = skipComment(str, ptr);
    else if (c !== " " && c !== "	" && c !== "\n" && c !== "\r") {
      let k;
      let t = res;
      let hasOwn = false;
      let [key, keyEndPtr] = parseKey(str, ptr - 1);
      for (let i = 0; i < key.length; i++) {
        if (i)
          t = hasOwn ? t[k] : t[k] = {};
        k = key[i];
        if ((hasOwn = Object.hasOwn(t, k)) && (typeof t[k] !== "object" || seen.has(t[k]))) {
          throw new TomlError("trying to redefine an already defined value", {
            toml: str,
            ptr
          });
        }
        if (!hasOwn && k === "__proto__") {
          Object.defineProperty(t, k, { enumerable: true, configurable: true, writable: true });
        }
      }
      if (hasOwn) {
        throw new TomlError("trying to redefine an already defined value", {
          toml: str,
          ptr
        });
      }
      let [value, valueEndPtr] = extractValue(str, keyEndPtr, "}", depth - 1, integersAsBigInt);
      seen.add(value);
      t[k] = value;
      ptr = valueEndPtr;
    }
  }
  if (!c) {
    throw new TomlError("unfinished table encountered", {
      toml: str,
      ptr
    });
  }
  return [res, ptr];
}
function parseArray(str, ptr, depth, integersAsBigInt) {
  let res = [];
  let c;
  ptr++;
  while ((c = str[ptr++]) !== "]" && c) {
    if (c === ",") {
      throw new TomlError("expected value, found comma", {
        toml: str,
        ptr: ptr - 1
      });
    } else if (c === "#")
      ptr = skipComment(str, ptr);
    else if (c !== " " && c !== "	" && c !== "\n" && c !== "\r") {
      let e = extractValue(str, ptr - 1, "]", depth - 1, integersAsBigInt);
      res.push(e[0]);
      ptr = e[1];
    }
  }
  if (!c) {
    throw new TomlError("unfinished array encountered", {
      toml: str,
      ptr
    });
  }
  return [res, ptr];
}

// node_modules/.pnpm/smol-toml@1.7.0/node_modules/smol-toml/dist/parse.js
function peekTable(key, table, meta, type) {
  let t = table;
  let m = meta;
  let k;
  let hasOwn = false;
  let state;
  for (let i = 0; i < key.length; i++) {
    if (i) {
      t = hasOwn ? t[k] : t[k] = {};
      m = (state = m[k]).c;
      if (type === 0 && (state.t === 1 || state.t === 2)) {
        return null;
      }
      if (state.t === 2) {
        let l = t.length - 1;
        t = t[l];
        m = m[l].c;
      }
    }
    k = key[i];
    if ((hasOwn = Object.hasOwn(t, k)) && m[k]?.t === 0 && m[k]?.d) {
      return null;
    }
    if (!hasOwn) {
      if (k === "__proto__") {
        Object.defineProperty(t, k, { enumerable: true, configurable: true, writable: true });
        Object.defineProperty(m, k, { enumerable: true, configurable: true, writable: true });
      }
      m[k] = {
        t: i < key.length - 1 && type === 2 ? 3 : type,
        d: false,
        i: 0,
        c: {}
      };
    }
  }
  state = m[k];
  if (state.t !== type && !(type === 1 && state.t === 3)) {
    return null;
  }
  if (type === 2) {
    if (!state.d) {
      state.d = true;
      t[k] = [];
    }
    t[k].push(t = {});
    state.c[state.i++] = state = { t: 1, d: false, i: 0, c: {} };
  }
  if (state.d) {
    return null;
  }
  state.d = true;
  if (type === 1) {
    t = hasOwn ? t[k] : t[k] = {};
  } else if (type === 0 && hasOwn) {
    return null;
  }
  return [k, t, state.c];
}
function parse3(toml, { maxDepth = 1e3, integersAsBigInt } = {}) {
  let res = {};
  let meta = {};
  let tbl = res;
  let m = meta;
  for (let ptr = skipVoid(toml, 0); ptr < toml.length; ) {
    if (toml[ptr] === "[") {
      let isTableArray = toml[++ptr] === "[";
      let k = parseKey(toml, ptr += +isTableArray, "]");
      if (isTableArray) {
        if (toml[k[1] - 1] !== "]") {
          throw new TomlError("expected end of table declaration", {
            toml,
            ptr: k[1] - 1
          });
        }
        k[1]++;
      }
      let p = peekTable(
        k[0],
        res,
        meta,
        isTableArray ? 2 : 1
        /* Type.EXPLICIT */
      );
      if (!p) {
        throw new TomlError("trying to redefine an already defined table or value", {
          toml,
          ptr
        });
      }
      m = p[2];
      tbl = p[1];
      ptr = k[1];
    } else {
      let k = parseKey(toml, ptr);
      let p = peekTable(
        k[0],
        tbl,
        m,
        0
        /* Type.DOTTED */
      );
      if (!p) {
        throw new TomlError("trying to redefine an already defined table or value", {
          toml,
          ptr
        });
      }
      let v = extractValue(toml, k[1], void 0, maxDepth, integersAsBigInt);
      p[1][p[0]] = v[0];
      ptr = v[1];
    }
    ptr = skipVoid(toml, ptr, true);
    if (toml[ptr] && toml[ptr] !== "\n" && toml[ptr] !== "\r") {
      throw new TomlError("each key-value declaration must be followed by an end-of-line", {
        toml,
        ptr
      });
    }
    ptr = skipVoid(toml, ptr);
  }
  return res;
}

// src/config.ts
var ConfigError = class extends Error {
  constructor(message, filePath) {
    super(message);
    this.filePath = filePath;
  }
  filePath;
};
async function readConfig(filePath) {
  const source = await readFile(filePath, "utf8");
  try {
    if (extname(filePath) === ".toml") {
      return parse3(source);
    }
    const errors = [];
    const value = parse2(source, errors, { allowTrailingComma: true });
    if (errors.length > 0) {
      const first = errors[0];
      throw new Error(first ? printParseErrorCode(first.error) : "Invalid JSONC");
    }
    if (!isObject(value)) throw new Error("Configuration root must be an object");
    return value;
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new ConfigError(`Could not parse ${filePath}: ${message}`, filePath);
  }
}
function isObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
function objectAt(object, key) {
  const value = object[key];
  return isObject(value) ? value : void 0;
}
function arrayAt(object, key) {
  const value = object[key];
  return Array.isArray(value) ? value.filter(isObject) : [];
}
function stringAt(object, key) {
  const value = object[key];
  return typeof value === "string" ? value : void 0;
}
function booleanAt(object, key) {
  return object[key] === true;
}

// src/discover.ts
import { readdir, stat } from "fs/promises";
import { basename, resolve } from "path";
var CONFIG_NAMES = /* @__PURE__ */ new Set(["wrangler.jsonc", "wrangler.json", "wrangler.toml"]);
var SKIP_DIRECTORIES = /* @__PURE__ */ new Set([
  ".git",
  ".wrangler",
  "build",
  "coverage",
  "dist",
  "node_modules",
  ".next",
  ".output"
]);
async function discoverConfigs(inputPath, recursive) {
  const absolute = resolve(inputPath);
  const info = await stat(absolute);
  if (info.isFile()) {
    if (!CONFIG_NAMES.has(basename(absolute))) {
      throw new Error(`${absolute} is not a Wrangler configuration file.`);
    }
    return [absolute];
  }
  const results = [];
  await walk(absolute, recursive, results);
  return results.sort();
}
async function walk(directory, recursive, results) {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    const path = resolve(directory, entry.name);
    if (entry.isFile() && CONFIG_NAMES.has(entry.name)) {
      results.push(path);
    } else if (recursive && entry.isDirectory() && !SKIP_DIRECTORIES.has(entry.name)) {
      await walk(path, true, results);
    }
  }
}

// src/analyze.ts
var ARRAY_BINDINGS = [
  { key: "services", type: "service", name: "binding", target: "service" },
  { key: "agent_memory", type: "agent-memory", name: "binding", target: "namespace" },
  { key: "ai_search", type: "ai-search", name: "binding", target: "instance_name" },
  { key: "ai_search_namespaces", type: "ai-search-namespace", name: "binding", target: "namespace" },
  { key: "d1_databases", type: "d1", name: "binding", target: "database_name" },
  { key: "artifacts", type: "artifacts", name: "binding", target: "namespace" },
  { key: "kv_namespaces", type: "kv", name: "binding", target: "id" },
  { key: "r2_buckets", type: "r2", name: "binding", target: "bucket_name" },
  { key: "analytics_engine_datasets", type: "analytics", name: "binding", target: "dataset" },
  { key: "vectorize", type: "vectorize", name: "binding", target: "index_name" },
  { key: "hyperdrive", type: "hyperdrive", name: "binding", target: "id" },
  { key: "workflows", type: "workflow", name: "binding", target: "name" },
  { key: "mtls_certificates", type: "mtls-certificate", name: "binding", target: "certificate_id" },
  { key: "dispatch_namespaces", type: "dispatch-namespace", name: "binding", target: "namespace" },
  { key: "pipelines", type: "pipeline", name: "binding", target: "stream" },
  { key: "ratelimits", type: "rate-limit", name: "name", target: "namespace_id" },
  { key: "vpc_services", type: "vpc-service", name: "binding", target: "service_id" },
  { key: "send_email", type: "email", name: "name" },
  { key: "flagship", type: "flagship", name: "binding", target: "app_id" },
  { key: "secrets_store_secrets", type: "secret-store", name: "binding", target: "store_id" },
  { key: "vpc_networks", type: "vpc-network", name: "binding" },
  { key: "worker_loaders", type: "worker-loader", name: "binding" }
];
async function inspectStack(inputPath, options) {
  const input = resolve2(inputPath);
  const inputInfo = await stat2(input);
  const root = inputInfo.isFile() ? dirname(input) : input;
  const configPaths = await discoverConfigs(input, options.recursive);
  if (configPaths.length === 0) {
    throw new Error(`No Wrangler configuration found below ${root}.`);
  }
  const diagnostics = [];
  const workers = [];
  for (const configPath of configPaths) {
    const config = await readConfig(configPath);
    workers.push(await projectFromConfig(configPath, config, options.environment, diagnostics));
  }
  diagnostics.push(...diagnoseDuplicateNames(workers));
  diagnostics.push(...diagnoseDuplicateBindings(workers));
  const edges = buildEdges(workers);
  diagnostics.push(...diagnoseServices(workers, edges));
  diagnostics.push(...diagnoseCycles(edges, workers));
  diagnostics.sort((a, b) => {
    const severityOrder = { error: 0, warning: 1, info: 2 };
    return severityOrder[a.severity] - severityOrder[b.severity] || a.file.localeCompare(b.file);
  });
  return {
    root,
    ...options.environment ? { environment: options.environment } : {},
    workers,
    edges,
    diagnostics,
    summary: {
      workers: workers.length,
      bindings: workers.reduce((count, worker) => count + worker.bindings.length, 0),
      remoteBindings: workers.reduce(
        (count, worker) => count + worker.bindings.filter((binding) => binding.remote).length,
        0
      ),
      errors: diagnostics.filter((item) => item.severity === "error").length,
      warnings: diagnostics.filter((item) => item.severity === "warning").length,
      infos: diagnostics.filter((item) => item.severity === "info").length
    }
  };
}
function diagnoseDuplicateNames(workers) {
  const counts = /* @__PURE__ */ new Map();
  for (const worker of workers) counts.set(worker.name, (counts.get(worker.name) ?? 0) + 1);
  return [...counts.entries()].filter(([, count]) => count > 1).map(([name, count]) => {
    const worker = workers.find((item) => item.name === name);
    return {
      rule: "WD008",
      severity: "error",
      title: "Worker name is duplicated",
      message: `${count} scanned configurations resolve to ${name}, so dependency targets are ambiguous.`,
      file: worker?.configPath ?? "",
      worker: name,
      fix: "Give every Worker a unique effective name in the selected environment."
    };
  });
}
function diagnoseDuplicateBindings(workers) {
  return workers.flatMap((worker) => {
    const counts = /* @__PURE__ */ new Map();
    for (const binding of worker.bindings) {
      counts.set(binding.name, (counts.get(binding.name) ?? 0) + 1);
    }
    return [...counts.entries()].filter(([, count]) => count > 1).map(([name, count]) => ({
      rule: "WD009",
      severity: "error",
      title: "Binding name is duplicated",
      message: `${worker.name} declares ${count} bindings named ${name}, so the runtime binding is ambiguous.`,
      file: worker.configPath,
      worker: worker.name,
      fix: "Give every binding in this Worker a unique name."
    }));
  });
}
async function projectFromConfig(configPath, root, environment, diagnostics) {
  const directory = dirname(configPath);
  const rootName = stringAt(root, "name") ?? basename2(dirname(configPath)) ?? "worker";
  const envs = objectAt(root, "env");
  const selected = environment && envs ? objectAt(envs, environment) : void 0;
  if (environment && !selected) {
    diagnostics.push({
      rule: "WD001",
      severity: "error",
      title: "Environment is not configured",
      message: `${rootName} has no env.${environment} configuration.`,
      file: configPath,
      worker: rootName,
      fix: `Add env.${environment} or choose one of the configured environments.`
    });
  }
  const effective = selected ?? root;
  const name = stringAt(effective, "name") ?? (environment ? `${rootName}-${environment}` : rootName);
  const bindings = collectBindings(effective);
  const requiredSecrets = requiredSecretNames(effective);
  const secretState = await inspectSecretFiles(directory, environment, requiredSecrets);
  if (secretState.hasDevVars && secretState.hasEnv) {
    diagnostics.push({
      rule: "WD004",
      severity: "warning",
      title: "Two local secret systems are present",
      message: `${name} has both .dev.vars and .env files. Wrangler does not load them as one combined source.`,
      file: configPath,
      worker: name,
      fix: "Choose .dev.vars or .env and remove the other local secret source."
    });
  }
  if (secretState.missing.length > 0) {
    diagnostics.push({
      rule: "WD005",
      severity: "warning",
      title: "Required local secrets are missing",
      message: `${name} is missing ${secretState.missing.join(", ")} in its selected local secret file.`,
      file: configPath,
      worker: name,
      fix: "Add the missing names to the local secret file. Workers Doctor never reads or reports their values."
    });
  }
  const remote = bindings.filter((binding) => binding.remote);
  if (remote.length > 0) {
    diagnostics.push({
      rule: "WD002",
      severity: "info",
      title: "Remote bindings will be used",
      message: `${name} connects ${remote.map((binding) => binding.name).join(", ")} to remote Cloudflare resources during local development.`,
      file: configPath,
      worker: name,
      fix: "Use staging resources or pass --local to Wrangler when remote access is not intended."
    });
  }
  const localCount = bindings.filter((binding) => !binding.remote && binding.type !== "service").length;
  if (remote.length > 0 && localCount > 0) {
    diagnostics.push({
      rule: "WD003",
      severity: "warning",
      title: "Local and remote state are mixed",
      message: `${name} combines ${remote.length} remote binding${remote.length === 1 ? "" : "s"} with ${localCount} locally simulated binding${localCount === 1 ? "" : "s"}.`,
      file: configPath,
      worker: name,
      fix: "Confirm that this mixed state is intentional before starting the stack."
    });
  }
  const serviceTargets = bindings.filter((binding) => binding.type === "service" && binding.target).map((binding) => binding.target);
  return {
    configPath,
    directory,
    rootName,
    name,
    bindings,
    serviceTargets,
    requiredSecrets,
    ...environment ? { environment } : {}
  };
}
function collectBindings(config) {
  const bindings = [];
  for (const descriptor of ARRAY_BINDINGS) {
    for (const item of arrayAt(config, descriptor.key)) {
      const name = stringAt(item, descriptor.name);
      if (!name) continue;
      const target = descriptor.target ? stringAt(item, descriptor.target) : void 0;
      bindings.push({
        type: descriptor.type,
        name,
        remote: booleanAt(item, "remote"),
        ...target ? { target } : {}
      });
    }
  }
  const queues = objectAt(config, "queues");
  if (queues) {
    for (const item of arrayAt(queues, "producers")) {
      const name = stringAt(item, "binding");
      if (!name) continue;
      const target = stringAt(item, "queue");
      bindings.push({
        type: "queue",
        name,
        remote: booleanAt(item, "remote"),
        ...target ? { target } : {}
      });
    }
  }
  const durableObjects = objectAt(config, "durable_objects");
  if (durableObjects) {
    for (const item of arrayAt(durableObjects, "bindings")) {
      const name = stringAt(item, "name");
      if (!name) continue;
      const target = stringAt(item, "class_name");
      bindings.push({
        type: "durable-object",
        name,
        remote: booleanAt(item, "remote"),
        ...target ? { target } : {}
      });
    }
  }
  for (const descriptor of [
    { key: "ai", type: "workers-ai" },
    { key: "assets", type: "assets" },
    { key: "browser", type: "browser" },
    { key: "images", type: "images" },
    { key: "media", type: "media" },
    { key: "stream", type: "stream" },
    { key: "version_metadata", type: "version-metadata" },
    { key: "websearch", type: "web-search" }
  ]) {
    const item = objectAt(config, descriptor.key);
    if (!item) continue;
    const name = stringAt(item, "binding");
    if (name) bindings.push({ type: descriptor.type, name, remote: booleanAt(item, "remote") });
  }
  const logForwarder = objectAt(config, "logfwdr");
  if (logForwarder) {
    for (const item of arrayAt(logForwarder, "bindings")) {
      const name = stringAt(item, "name");
      if (name) bindings.push({ type: "log-forwarder", name, remote: false });
    }
  }
  const unsafe = objectAt(config, "unsafe");
  if (unsafe) {
    for (const item of arrayAt(unsafe, "bindings")) {
      const name = stringAt(item, "name");
      if (name) bindings.push({ type: "unsafe", name, remote: false });
    }
  }
  return bindings.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
}
function requiredSecretNames(config) {
  const secrets = objectAt(config, "secrets");
  if (!secrets) return [];
  const required = secrets.required;
  return Array.isArray(required) ? required.filter((value) => typeof value === "string").sort() : [];
}
async function inspectSecretFiles(directory, environment, required) {
  const names = await readdir2(directory).catch(() => []);
  const devCandidates = environment ? [`.dev.vars.${environment}`, ".dev.vars"] : [".dev.vars"];
  const envCandidates = environment ? [`.env.${environment}.local`, ".env.local", `.env.${environment}`, ".env"] : [".env.local", ".env"];
  const devFile = devCandidates.find((name) => names.includes(name));
  const envFiles = envCandidates.filter((name) => names.includes(name));
  const keys = /* @__PURE__ */ new Set();
  if (devFile) {
    addDotEnvKeys(keys, await readFile2(resolve2(directory, devFile), "utf8"));
  } else {
    for (const file of envFiles.reverse()) {
      addDotEnvKeys(keys, await readFile2(resolve2(directory, file), "utf8"));
    }
  }
  return {
    hasDevVars: names.some((name) => name === ".dev.vars" || name.startsWith(".dev.vars.")),
    hasEnv: names.some((name) => name === ".env" || name.startsWith(".env.")),
    missing: required.filter((name) => !keys.has(name))
  };
}
function addDotEnvKeys(keys, source) {
  for (const line of source.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=/.exec(line);
    if (match?.[1]) keys.add(match[1]);
  }
}
function buildEdges(workers) {
  return workers.flatMap(
    (worker) => worker.bindings.filter((binding) => binding.target).map((binding) => ({
      from: worker.name,
      to: binding.target,
      label: `${binding.type}:${binding.name}`,
      remote: binding.remote
    }))
  );
}
function diagnoseServices(workers, edges) {
  const names = new Set(workers.map((worker) => worker.name));
  const byName = new Map(workers.map((worker) => [worker.name, worker]));
  return edges.filter((edge) => edge.label.startsWith("service:") && !names.has(edge.to)).map((edge) => {
    const worker = byName.get(edge.from);
    return {
      rule: "WD006",
      severity: "warning",
      title: "Service binding target is outside the stack",
      message: `${edge.from} points to ${edge.to}, but no scanned Worker resolves to that name.`,
      file: worker?.configPath ?? "",
      worker: edge.from,
      fix: "Scan the target Worker too, or confirm that the binding intentionally points to a deployed service."
    };
  });
}
function diagnoseCycles(edges, workers) {
  const serviceEdges = edges.filter((edge) => edge.label.startsWith("service:"));
  const graph = /* @__PURE__ */ new Map();
  for (const edge of serviceEdges) {
    const targets = graph.get(edge.from) ?? [];
    targets.push(edge.to);
    graph.set(edge.from, targets);
  }
  const cycles = /* @__PURE__ */ new Set();
  for (const worker of workers) {
    findCycles(worker.name, worker.name, graph, [], cycles);
  }
  return [...cycles].map((cycle) => {
    const first = cycle.split(" -> ")[0] ?? "";
    const worker = workers.find((item) => item.name === first);
    return {
      rule: "WD007",
      severity: "warning",
      title: "Service binding cycle detected",
      message: cycle,
      file: worker?.configPath ?? "",
      ...first ? { worker: first } : {},
      fix: "Confirm that the cycle is intentional and that every RPC or fetch call terminates."
    };
  });
}
function findCycles(start, current, graph, path, cycles) {
  if (path.includes(current)) return;
  const nextPath = [...path, current];
  for (const target of graph.get(current) ?? []) {
    if (target === start) {
      cycles.add(canonicalCycle(nextPath));
    } else if (nextPath.length < graph.size + 1) {
      findCycles(start, target, graph, nextPath, cycles);
    }
  }
}
function canonicalCycle(nodes) {
  const rotations = nodes.map((_, index) => [...nodes.slice(index), ...nodes.slice(0, index)]);
  const canonical = rotations.map((rotation) => rotation.join(" -> ")).sort((a, b) => a.localeCompare(b))[0] ?? "";
  const first = canonical.split(" -> ")[0];
  return `${canonical} -> ${first}`;
}
function relativeResult(result) {
  return {
    ...result,
    workers: result.workers.map((worker) => ({
      ...worker,
      configPath: relative(result.root, worker.configPath) || worker.configPath,
      directory: relative(result.root, worker.directory) || "."
    })),
    diagnostics: result.diagnostics.map((item) => ({
      ...item,
      file: relative(result.root, item.file) || item.file
    }))
  };
}

// src/dev.ts
import { spawn } from "child_process";
import { access as access2 } from "fs/promises";
import { dirname as dirname2, join } from "path";
async function buildDevCommands(result, startPort) {
  const ordered = orderWorkers(result);
  if (ordered.length > 0 && startPort + ordered.length - 1 > 65535) {
    throw new Error(
      `Port range ${startPort}-${startPort + ordered.length - 1} exceeds the maximum port 65535.`
    );
  }
  return Promise.all(
    ordered.map(async (worker, index) => {
      const runner = await detectRunner(worker);
      const args = [
        ...runner.prefix,
        "wrangler",
        "dev",
        "-c",
        worker.configPath,
        "--port",
        String(startPort + index)
      ];
      if (worker.environment) args.push("-e", worker.environment);
      return {
        worker: worker.name,
        cwd: worker.directory,
        command: runner.command,
        args,
        port: startPort + index
      };
    })
  );
}
async function detectRunner(worker) {
  const candidates = [
    { marker: "pnpm-lock.yaml", command: "pnpm", prefix: ["exec"] },
    { marker: "package-lock.json", command: "npm", prefix: ["exec", "--"] },
    { marker: "bun.lock", command: "bunx", prefix: [] },
    { marker: "bun.lockb", command: "bunx", prefix: [] },
    { marker: "yarn.lock", command: "yarn", prefix: [] }
  ];
  let directory = worker.directory;
  for (let depth = 0; depth < 8; depth += 1) {
    for (const candidate of candidates) {
      if (await exists(join(directory, candidate.marker))) {
        return { command: candidate.command, prefix: candidate.prefix };
      }
    }
    const parent = dirname2(directory);
    if (parent === directory) break;
    directory = parent;
  }
  return { command: "npx", prefix: ["--no-install"] };
}
function orderWorkers(result) {
  const byName = new Map(result.workers.map((worker) => [worker.name, worker]));
  const visited = /* @__PURE__ */ new Set();
  const active = /* @__PURE__ */ new Set();
  const output = [];
  const visit2 = (worker) => {
    if (visited.has(worker.name) || active.has(worker.name)) return;
    active.add(worker.name);
    for (const target of worker.serviceTargets) {
      const dependency = byName.get(target);
      if (dependency) visit2(dependency);
    }
    active.delete(worker.name);
    visited.add(worker.name);
    output.push(worker);
  };
  for (const worker of result.workers) visit2(worker);
  return output;
}
function formatDevPlan(commands) {
  const lines = ["Development plan", ""];
  for (const item of commands) {
    lines.push(`${item.worker.padEnd(24)} http://localhost:${item.port}`);
    lines.push(`  ${shellCommand(item.command, item.args)}`);
  }
  return `${lines.join("\n")}
`;
}
async function runDevCommands(commands) {
  if (commands.length === 0) return 0;
  const children = [];
  let closing = false;
  let exitCode = 0;
  const stop = (signalExitCode) => {
    if (signalExitCode !== void 0 && exitCode === 0) exitCode = signalExitCode;
    if (closing) return;
    closing = true;
    for (const child of children) child.kill("SIGTERM");
  };
  const interrupt = () => stop(130);
  const terminate = () => stop(143);
  return new Promise((resolve3) => {
    let remaining = commands.length;
    let resolved = false;
    const finish = () => {
      if (resolved || remaining !== 0) return;
      resolved = true;
      process.removeListener("SIGINT", interrupt);
      process.removeListener("SIGTERM", terminate);
      resolve3(exitCode);
    };
    process.once("SIGINT", interrupt);
    process.once("SIGTERM", terminate);
    for (const item of commands) {
      const child = spawn(item.command, item.args, {
        cwd: item.cwd,
        stdio: "inherit",
        env: process.env
      });
      children.push(child);
      child.once("error", () => {
        exitCode = 1;
        stop();
      });
      child.once("close", (code) => {
        if (typeof code === "number" && code !== 0) exitCode = code;
        remaining -= 1;
        if (!closing && code !== 0) stop();
        finish();
      });
    }
  });
}
function shellCommand(command, args) {
  return [command, ...args].map(quote).join(" ");
}
function quote(value) {
  return /^[A-Za-z0-9_./:@=-]+$/.test(value) ? value : `'${value.replaceAll("'", "'\\''")}'`;
}
function exists(path) {
  return access2(path).then(
    () => true,
    () => false
  );
}

// src/options.ts
var CliArgumentError = class extends Error {
};
var FORMATS = /* @__PURE__ */ new Set(["human", "json", "github", "dot"]);
function parseArgs(args) {
  let command = "inspect";
  let inputPath = ".";
  let environment;
  let recursive = true;
  let format2 = "human";
  let strict = false;
  let color = true;
  let dryRun = false;
  let startPort = 8787;
  let portSpecified = false;
  let positionalSeen = false;
  const values = [...args];
  const first = values[0];
  if (first === "inspect" || first === "graph" || first === "dev") {
    command = first;
    values.shift();
  }
  if (command === "graph") format2 = "dot";
  for (let index = 0; index < values.length; index += 1) {
    const argument = values[index];
    if (!argument) continue;
    if (argument === "--env" || argument === "-e") {
      environment = requiredValue(values, ++index, argument);
    } else if (argument === "--format") {
      const value = requiredValue(values, ++index, argument);
      if (!FORMATS.has(value)) {
        throw new CliArgumentError(`Unknown format "${value}".`);
      }
      format2 = value;
    } else if (argument === "--json") {
      format2 = "json";
    } else if (argument === "--github") {
      format2 = "github";
    } else if (argument === "--dot") {
      format2 = "dot";
    } else if (argument === "--strict") {
      strict = true;
    } else if (argument === "--no-color") {
      color = false;
    } else if (argument === "--no-recursive") {
      recursive = false;
    } else if (argument === "--dry-run") {
      dryRun = true;
    } else if (argument === "--port") {
      const value = Number(requiredValue(values, ++index, argument));
      if (!Number.isInteger(value) || value < 1 || value > 65535) {
        throw new CliArgumentError("--port must be an integer between 1 and 65535.");
      }
      startPort = value;
      portSpecified = true;
    } else if (argument.startsWith("-")) {
      throw new CliArgumentError(`Unknown option "${argument}".`);
    } else if (!positionalSeen) {
      inputPath = argument;
      positionalSeen = true;
    } else {
      throw new CliArgumentError(`Unexpected argument "${argument}".`);
    }
  }
  if (command !== "dev" && dryRun) {
    throw new CliArgumentError("--dry-run is only valid with the dev command.");
  }
  if (command !== "dev" && portSpecified) {
    throw new CliArgumentError("--port is only valid with the dev command.");
  }
  if (command === "dev" && format2 !== "human") {
    throw new CliArgumentError("Output format options are not supported with the dev command.");
  }
  if (command === "graph" && format2 !== "dot") {
    throw new CliArgumentError("The graph command only supports dot output.");
  }
  return {
    command,
    inputPath,
    recursive,
    format: format2,
    strict,
    color,
    dryRun,
    startPort,
    ...environment ? { environment } : {}
  };
}
function requiredValue(args, index, option) {
  const value = args[index];
  if (!value || value.startsWith("-")) {
    throw new CliArgumentError(`${option} requires a value.`);
  }
  return value;
}
function wantsJson(args) {
  return args.includes("--json") || args.some((value, index) => value === "--format" && args[index + 1] === "json");
}

// src/report.ts
var import_picocolors = __toESM(require_picocolors(), 1);
function formatHuman(result, color = true) {
  import_picocolors.default.isColorSupported = color;
  const lines = [];
  lines.push(import_picocolors.default.bold("Workers Doctor"));
  lines.push(
    `${result.summary.workers} worker${result.summary.workers === 1 ? "" : "s"} \xB7 ${result.summary.bindings} bindings \xB7 ${result.summary.remoteBindings} remote`
  );
  if (result.environment) lines.push(`Environment: ${import_picocolors.default.cyan(result.environment)}`);
  lines.push("");
  for (const worker of result.workers) {
    lines.push(`${import_picocolors.default.bold(worker.name)}  ${import_picocolors.default.dim(worker.configPath)}`);
    if (worker.bindings.length === 0) {
      lines.push(`  ${import_picocolors.default.dim("no bindings")}`);
    } else {
      for (const binding of worker.bindings) {
        const target = binding.target ? ` \u2192 ${binding.target}` : "";
        const mode = binding.remote ? import_picocolors.default.yellow("remote") : import_picocolors.default.dim("local");
        lines.push(`  ${binding.type.padEnd(16)} ${binding.name}${target}  ${mode}`);
      }
    }
    lines.push("");
  }
  if (result.diagnostics.length === 0) {
    lines.push(`${import_picocolors.default.green("\u2713")} Stack is internally consistent.`);
  } else {
    for (const diagnostic of result.diagnostics) {
      lines.push(formatDiagnostic(diagnostic));
    }
  }
  lines.push("");
  lines.push(
    `${result.summary.errors} errors \xB7 ${result.summary.warnings} warnings \xB7 ${result.summary.infos} notices`
  );
  return `${lines.join("\n")}
`;
}
function formatDiagnostic(item) {
  const icon = item.severity === "error" ? import_picocolors.default.red("\u2715 ERROR") : item.severity === "warning" ? import_picocolors.default.yellow("! WARNING") : import_picocolors.default.cyan("i NOTICE");
  const lines = [`${icon} ${item.rule}  ${import_picocolors.default.bold(item.title)}`, `  ${item.message}`];
  if (item.fix) lines.push(`  ${import_picocolors.default.dim(`Fix: ${item.fix}`)}`);
  return lines.join("\n");
}
function formatGitHub(result) {
  if (result.diagnostics.length === 0) return "Workers Doctor: stack is internally consistent.\n";
  return `${result.diagnostics.map((item) => {
    const level = item.severity === "info" ? "notice" : item.severity;
    return `::${level} file=${escape(item.file)},title=${escape(`${item.rule} ${item.title}`)}::${escape(item.message)}`;
  }).join("\n")}
`;
}
function escape(value) {
  return value.replaceAll("%", "%25").replaceAll("\r", "%0D").replaceAll("\n", "%0A").replaceAll(":", "%3A").replaceAll(",", "%2C");
}
function formatDot(result) {
  const lines = ["digraph workers {", "  rankdir=LR;", '  node [shape=box, style="rounded"];'];
  for (const worker of result.workers) {
    lines.push(`  "${dotEscape(worker.name)}" [label="${dotEscape(worker.name)}"];`);
  }
  for (const edge of result.edges) {
    const style = edge.remote ? ', style=dashed, color="#d97706"' : "";
    lines.push(
      `  "${dotEscape(edge.from)}" -> "${dotEscape(edge.to)}" [label="${dotEscape(edge.label)}"${style}];`
    );
  }
  lines.push("}");
  return `${lines.join("\n")}
`;
}
function dotEscape(value) {
  return value.replaceAll("\\", "\\\\").replaceAll('"', '\\"');
}

// src/cli.ts
async function main() {
  const args = process.argv.slice(2);
  if (args.includes("--help") || args.includes("-h")) {
    process.stdout.write(help(await packageVersion()));
    return;
  }
  if (args.includes("--version") || args.includes("-v")) {
    process.stdout.write(`${await packageVersion()}
`);
    return;
  }
  try {
    const options = parseArgs(args);
    const rawResult = await inspectStack(options.inputPath, {
      recursive: options.recursive,
      ...options.environment ? { environment: options.environment } : {}
    });
    const result = relativeResult(rawResult);
    if (options.command === "dev") {
      if (result.summary.errors > 0 || options.strict && result.summary.warnings > 0) {
        process.stdout.write(formatHuman(result, options.color));
        process.stderr.write(
          options.strict && result.summary.errors === 0 ? "Workers Doctor refused to start a stack with warnings in strict mode.\n" : "Workers Doctor refused to start a stack with errors.\n"
        );
        process.exitCode = result.summary.errors > 0 ? 2 : 1;
        return;
      }
      const commands = await buildDevCommands(rawResult, options.startPort);
      process.stdout.write(formatDevPlan(commands));
      if (!options.dryRun) process.exitCode = await runDevCommands(commands);
      return;
    }
    const output = options.format === "json" ? `${JSON.stringify(result, null, 2)}
` : options.format === "github" ? formatGitHub(result) : options.format === "dot" ? formatDot(result) : formatHuman(result, options.color);
    process.stdout.write(output);
    setExitCode(result.summary, options.strict);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (wantsJson(args)) process.stdout.write(`${JSON.stringify({ error: message }, null, 2)}
`);
    else process.stderr.write(`Workers Doctor: ${message}
`);
    process.exitCode = error instanceof ConfigError || error instanceof CliArgumentError ? 1 : 2;
  }
}
function setExitCode(summary, strict) {
  if (summary.errors > 0) process.exitCode = 2;
  else if (strict && summary.warnings > 0) process.exitCode = 1;
}
async function packageVersion() {
  const packageFile = fileURLToPath(new URL("../package.json", import.meta.url));
  const parsed = JSON.parse(await readFile3(packageFile, "utf8"));
  if (typeof parsed !== "object" || parsed === null || !("version" in parsed) || typeof parsed.version !== "string") {
    throw new Error("Package version is missing or invalid.");
  }
  return parsed.version;
}
function help(version) {
  return `Workers Doctor v${version}

Inspect and safely run multi-Worker Cloudflare projects.

Usage:
  workers-doctor [inspect] [path] [options]
  workers-doctor graph [path] [options]
  workers-doctor dev [path] [options]

Options:
  -e, --env <name>       Resolve a named Workers environment
  --format <human|json|github|dot>
                         Select report output
  --json                 Alias for --format json
  --github               Emit GitHub Actions annotations
  --dot                  Emit a Graphviz dependency graph
  --strict               Fail when warnings are found
  --no-recursive         Inspect only the selected directory
  --dry-run              Print the dev process plan without starting it
  --port <number>        First local port for dev mode (default: 8787)
  --no-color             Disable ANSI colors
  -v, --version
  -h, --help

Exit codes:
  0  Stack is internally consistent
  1  Invalid input, or warnings with --strict
  2  Stack errors or an unexpected failure
`;
}
await main();
/*! Bundled license information:

smol-toml/dist/date.js:
smol-toml/dist/error.js:
smol-toml/dist/primitive.js:
smol-toml/dist/util.js:
smol-toml/dist/extract.js:
smol-toml/dist/struct.js:
smol-toml/dist/parse.js:
smol-toml/dist/stringify.js:
smol-toml/dist/index.js:
  (*!
   * Copyright (c) Squirrel Chat et al., All rights reserved.
   * SPDX-License-Identifier: BSD-3-Clause
   *
   * Redistribution and use in source and binary forms, with or without
   * modification, are permitted provided that the following conditions are met:
   *
   * 1. Redistributions of source code must retain the above copyright notice, this
   *    list of conditions and the following disclaimer.
   * 2. Redistributions in binary form must reproduce the above copyright notice,
   *    this list of conditions and the following disclaimer in the
   *    documentation and/or other materials provided with the distribution.
   * 3. Neither the name of the copyright holder nor the names of its contributors
   *    may be used to endorse or promote products derived from this software without
   *    specific prior written permission.
   *
   * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
   * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
   * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
   * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
   * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
   * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
   * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
   * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
   * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
   * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
   *)
*/
