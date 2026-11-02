import { _ as __vitePreload } from "./preload-helper-DN2scbUx.js";
var Comparable = class {
  is(c) {
    return this instanceof c;
  }
  as(c) {
    return this instanceof c ? this : null;
  }
};
var AlgCommon = class extends Comparable {
  constructor() {
    super();
  }
  get log() {
    return console.log.bind(console, this);
  }
};
var IterationDirection = {
  Forwards: 1,
  Backwards: -1
};
function toggleDirection(iterationDirection, flip = true) {
  if (!flip) {
    return iterationDirection;
  }
  switch (iterationDirection) {
    case IterationDirection.Forwards:
      return IterationDirection.Backwards;
    case IterationDirection.Backwards:
      return IterationDirection.Forwards;
  }
  throw new Error("Invalid input iteration direction.");
}
function direct(g, iterDir) {
  return iterDir === IterationDirection.Backwards ? Array.from(g).reverse() : g;
}
function reverse(g) {
  return Array.from(g).reverse();
}
function* directedGenerator(g, direction) {
  direction === IterationDirection.Backwards ? yield* reverseGenerator(g) : yield* g;
}
function* reverseGenerator(g) {
  for (const t of Array.from(g).reverse()) {
    yield t;
  }
}
var Commutator = class _Commutator extends AlgCommon {
  #A;
  #B;
  constructor(aSource, bSource) {
    super();
    this.#A = experimentalEnsureAlg(aSource);
    this.#B = experimentalEnsureAlg(bSource);
  }
  get A() {
    return this.#A;
  }
  get B() {
    return this.#B;
  }
  isIdentical(other) {
    const otherAsCommutator = other.as(_Commutator);
    return !!(otherAsCommutator?.A.isIdentical(this.A) && otherAsCommutator?.B.isIdentical(this.B));
  }
  invert() {
    return new _Commutator(this.#B, this.#A);
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth ??= Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      if (iterDir === IterationDirection.Forwards) {
        yield* this.A.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1
        );
        yield* this.B.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1
        );
        yield* this.A.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1
        );
        yield* this.B.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1
        );
      } else {
        yield* this.B.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1
        );
        yield* this.A.experimentalExpand(
          IterationDirection.Forwards,
          depth - 1
        );
        yield* this.B.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1
        );
        yield* this.A.experimentalExpand(
          IterationDirection.Backwards,
          depth - 1
        );
      }
    }
  }
  toString(experimentalSerializationOptions) {
    return `[${this.#A.toString(experimentalSerializationOptions)}, ${this.#B.toString(experimentalSerializationOptions)}]`;
  }
};
var Conjugate = class _Conjugate extends AlgCommon {
  #A;
  #B;
  constructor(aSource, bSource) {
    super();
    this.#A = experimentalEnsureAlg(aSource);
    this.#B = experimentalEnsureAlg(bSource);
  }
  get A() {
    return this.#A;
  }
  get B() {
    return this.#B;
  }
  isIdentical(other) {
    const otherAsConjugate = other.as(_Conjugate);
    return !!(otherAsConjugate?.A.isIdentical(this.A) && otherAsConjugate?.B.isIdentical(this.B));
  }
  invert() {
    return new _Conjugate(this.#A, this.#B.invert());
  }
  *experimentalExpand(iterDir, depth) {
    depth ??= Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* this.A.experimentalExpand(IterationDirection.Forwards, depth - 1);
      yield* this.B.experimentalExpand(iterDir, depth - 1);
      yield* this.A.experimentalExpand(IterationDirection.Backwards, depth - 1);
    }
  }
  toString(experimentalSerializationOptions) {
    return `[${this.A.toString(experimentalSerializationOptions)}: ${this.B.toString(experimentalSerializationOptions)}]`;
  }
};
var AlgBuilder = class {
  #algNodes = [];
  push(u) {
    this.#algNodes.push(u);
  }
  // TODO: Allow FlexibleAlgSource?
  /** @deprecated */
  experimentalPushAlg(alg) {
    for (const u of alg.childAlgNodes()) {
      this.push(u);
    }
  }
  // TODO: can we guarantee this to be fast in the permanent API?
  experimentalNumAlgNodes() {
    return this.#algNodes.length;
  }
  // can be called multiple times, even if you push alg nodes inbetween.
  toAlg() {
    return new Alg(this.#algNodes);
  }
  reset() {
    this.#algNodes = [];
  }
};
var LineComment = class _LineComment extends AlgCommon {
  #text;
  constructor(commentText) {
    super();
    if (commentText.includes("\n") || commentText.includes("\r")) {
      throw new Error("LineComment cannot contain newline");
    }
    this.#text = commentText;
  }
  get text() {
    return this.#text;
  }
  isIdentical(other) {
    const otherAsLineComment = other;
    return other.is(_LineComment) && this.#text === otherAsLineComment.#text;
  }
  invert() {
    return this;
  }
  *experimentalExpand(_iterDir = IterationDirection.Forwards, _depth = Infinity) {
    yield this;
  }
  toString(_experimentalSerializationOptions) {
    return `//${this.#text}`;
  }
  // toJSON(): LineCommentJSON {
  //   return {
  //     type: "comment",
  //     text: this.#text,
  //   };
  // }
};
var Newline = class _Newline extends AlgCommon {
  toString(_experimentalSerializationOptions) {
    return "\n";
  }
  isIdentical(other) {
    return other.is(_Newline);
  }
  invert() {
    return this;
  }
  *experimentalExpand(_iterDir = IterationDirection.Forwards, _depth = Infinity) {
    yield this;
  }
};
var Pause = class _Pause extends AlgCommon {
  experimentalNISSGrouping;
  // TODO: tie this to the alg
  toString(_experimentalSerializationOptions) {
    return ".";
  }
  isIdentical(other) {
    return other.is(_Pause);
  }
  invert() {
    return this;
  }
  *experimentalExpand(_iterDir = IterationDirection.Forwards, _depth = Infinity) {
    yield this;
  }
};
function parseIntWithEmptyFallback(n, emptyFallback) {
  return n ? parseInt(n, 10) : emptyFallback;
}
var AMOUNT_REGEX = /^(\d+)?('?)/;
var MOVE_START_REGEX = /^[_\dA-Za-z]/;
var QUANTUM_MOVE_REGEX = /^((([1-9]\d*)-)?([1-9]\d*))?([_A-Za-z]+)/;
var COMMENT_TEXT_REGEX = /^[^\n]*/;
var SQUARE1_PAIR_START_REGEX = /^(-?\d+), ?/;
var SQUARE1_PAIR_END_REGEX = /^(-?\d+)\)/;
function parseAlg(s) {
  return new AlgParser().parseAlg(s);
}
function parseMove(s) {
  return new AlgParser().parseMove(s);
}
function parseQuantumMove(s) {
  return new AlgParser().parseQuantumMove(s);
}
var startCharIndexKey = /* @__PURE__ */ Symbol("startCharIndex");
var endCharIndexKey = /* @__PURE__ */ Symbol("endCharIndex");
function addCharIndices(t, startCharIndex, endCharIndex) {
  const parsedT = t;
  parsedT[startCharIndexKey] = startCharIndex;
  parsedT[endCharIndexKey] = endCharIndex;
  return parsedT;
}
function transferCharIndex(from, to) {
  if (startCharIndexKey in from) {
    to[startCharIndexKey] = from[startCharIndexKey];
  }
  if (endCharIndexKey in from) {
    to[endCharIndexKey] = from[endCharIndexKey];
  }
  return to;
}
var AlgParser = class {
  #input = "";
  #idx = 0;
  #nissQueue = [];
  parseAlg(input) {
    this.#input = input;
    this.#idx = 0;
    const alg = this.parseAlgWithStopping([]);
    this.mustBeAtEndOfInput();
    const algNodes = Array.from(alg.childAlgNodes());
    if (this.#nissQueue.length > 0) {
      for (const nissGrouping of this.#nissQueue.reverse()) {
        algNodes.push(nissGrouping);
      }
    }
    const newAlg = new Alg(algNodes);
    const {
      [startCharIndexKey]: startCharIndex,
      [endCharIndexKey]: endCharIndex
    } = alg;
    addCharIndices(newAlg, startCharIndex, endCharIndex);
    return newAlg;
  }
  parseMove(input) {
    this.#input = input;
    this.#idx = 0;
    const move = this.parseMoveImpl();
    this.mustBeAtEndOfInput();
    return move;
  }
  parseQuantumMove(input) {
    this.#input = input;
    this.#idx = 0;
    const quantumMove = this.parseQuantumMoveImpl();
    this.mustBeAtEndOfInput();
    return quantumMove;
  }
  mustBeAtEndOfInput() {
    if (this.#idx !== this.#input.length) {
      throw new Error("parsing unexpectedly ended early");
    }
  }
  parseAlgWithStopping(stopBefore) {
    let algStartIdx = this.#idx;
    let algEndIdx = this.#idx;
    const algBuilder = new AlgBuilder();
    let crowded = false;
    const mustNotBeCrowded = (idx) => {
      if (crowded) {
        throw new Error(
          `Unexpected character at index ${idx}. Are you missing a space?`
        );
      }
    };
    while (this.#idx < this.#input.length) {
      const savedCharIndex = this.#idx;
      if (stopBefore.includes(this.#input[this.#idx])) {
        return addCharIndices(algBuilder.toAlg(), algStartIdx, algEndIdx);
      }
      if (this.tryConsumeNext(" ")) {
        crowded = false;
        if (algBuilder.experimentalNumAlgNodes() === 0) {
          algStartIdx = this.#idx;
        }
      } else if (MOVE_START_REGEX.test(this.#input[this.#idx])) {
        mustNotBeCrowded(savedCharIndex);
        const move = this.parseMoveImpl();
        algBuilder.push(move);
        crowded = true;
        algEndIdx = this.#idx;
      } else if (this.tryConsumeNext("(")) {
        mustNotBeCrowded(savedCharIndex);
        const sq1PairStartMatch = this.tryRegex(SQUARE1_PAIR_START_REGEX);
        if (sq1PairStartMatch) {
          const topAmountString = sq1PairStartMatch[1];
          const savedCharIndexD = this.#idx;
          const sq1PairEndMatch = this.parseRegex(SQUARE1_PAIR_END_REGEX);
          const uMove = addCharIndices(
            new Move(new QuantumMove("U_SQ_"), parseInt(topAmountString, 10)),
            savedCharIndex + 1,
            savedCharIndex + 1 + topAmountString.length
          );
          const dMove = addCharIndices(
            new Move(
              new QuantumMove("D_SQ_"),
              parseInt(sq1PairEndMatch[1], 10)
            ),
            savedCharIndexD,
            this.#idx - 1
          );
          const alg = addCharIndices(
            new Alg([uMove, dMove]),
            savedCharIndex + 1,
            this.#idx - 1
          );
          algBuilder.push(
            addCharIndices(new Grouping(alg), savedCharIndex, this.#idx)
          );
          crowded = true;
          algEndIdx = this.#idx;
        } else {
          const alg = this.parseAlgWithStopping([")"]);
          this.mustConsumeNext(")");
          const amount = this.parseAmount();
          algBuilder.push(
            addCharIndices(
              new Grouping(alg, amount),
              savedCharIndex,
              this.#idx
            )
          );
          crowded = true;
          algEndIdx = this.#idx;
        }
      } else if (this.tryConsumeNext("^")) {
        this.mustConsumeNext("(");
        const alg = this.parseAlgWithStopping([")"]);
        this.popNext();
        const grouping = new Grouping(alg, -1);
        const placeholder = new Pause();
        grouping.experimentalNISSPlaceholder = placeholder;
        placeholder.experimentalNISSGrouping = grouping;
        this.#nissQueue.push(grouping);
        algBuilder.push(placeholder);
      } else if (this.tryConsumeNext("[")) {
        mustNotBeCrowded(savedCharIndex);
        const A = this.parseAlgWithStopping([",", ":"]);
        const separator = this.popNext();
        const B = this.parseAlgWithStopping(["]"]);
        this.mustConsumeNext("]");
        let unrepeated;
        switch (separator) {
          case ":": {
            unrepeated = addCharIndices(
              new Conjugate(A, B),
              savedCharIndex,
              this.#idx
            );
            crowded = true;
            algEndIdx = this.#idx;
            break;
          }
          case ",": {
            unrepeated = addCharIndices(
              new Commutator(A, B),
              savedCharIndex,
              this.#idx
            );
            crowded = true;
            algEndIdx = this.#idx;
            break;
          }
          default:
            throw new Error("unexpected parsing error");
        }
        const afterClosingBracketIdx = this.#idx;
        const amount = this.parseAmount();
        if (amount === 1) {
          algBuilder.push(unrepeated);
        } else {
          const unrepeatedAlg = addCharIndices(
            new Alg([unrepeated]),
            savedCharIndex,
            afterClosingBracketIdx
          );
          const grouping = addCharIndices(
            new Grouping(unrepeatedAlg, amount),
            savedCharIndex,
            this.#idx
          );
          algBuilder.push(grouping);
        }
        crowded = true;
        algEndIdx = this.#idx;
      } else if (this.tryConsumeNext("\n")) {
        algBuilder.push(
          addCharIndices(new Newline(), savedCharIndex, this.#idx)
        );
        crowded = false;
        algEndIdx = this.#idx;
      } else if (this.tryConsumeNext("/")) {
        if (this.tryConsumeNext("/")) {
          mustNotBeCrowded(savedCharIndex);
          const [text] = this.parseRegex(COMMENT_TEXT_REGEX);
          algBuilder.push(
            addCharIndices(new LineComment(text), savedCharIndex, this.#idx)
          );
          crowded = false;
          algEndIdx = this.#idx;
        } else {
          algBuilder.push(
            addCharIndices(new Move("_SLASH_"), savedCharIndex, this.#idx)
          );
          crowded = true;
          algEndIdx = this.#idx;
        }
      } else if (this.tryConsumeNext(".")) {
        mustNotBeCrowded(savedCharIndex);
        algBuilder.push(addCharIndices(new Pause(), savedCharIndex, this.#idx));
        crowded = true;
        algEndIdx = this.#idx;
      } else {
        throw new Error(`Unexpected character: ${this.popNext()}`);
      }
    }
    if (this.#idx !== this.#input.length) {
      throw new Error("did not finish parsing?");
    }
    if (stopBefore.length > 0) {
      throw new Error("expected stopping");
    }
    return addCharIndices(algBuilder.toAlg(), algStartIdx, algEndIdx);
  }
  parseQuantumMoveImpl() {
    const [, , , outerLayerStr, innerLayerStr, family] = this.parseRegex(QUANTUM_MOVE_REGEX);
    return new QuantumMove(
      family,
      parseIntWithEmptyFallback(innerLayerStr, void 0),
      parseIntWithEmptyFallback(outerLayerStr, void 0)
    );
  }
  parseMoveImpl() {
    const savedCharIndex = this.#idx;
    if (this.tryConsumeNext("/")) {
      return addCharIndices(new Move("_SLASH_"), savedCharIndex, this.#idx);
    }
    let quantumMove = this.parseQuantumMoveImpl();
    let [amount, hadEmptyAbsAmount] = this.parseAmountAndTrackEmptyAbsAmount();
    const suffix = this.parseMoveSuffix();
    if (suffix) {
      if (amount < 0) {
        throw new Error("uh-oh");
      }
      if ((suffix === "++" || suffix === "--") && amount !== 1) {
        throw new Error(
          "Pochmann ++ or -- moves cannot have an amount other than 1."
        );
      }
      if ((suffix === "++" || suffix === "--") && !hadEmptyAbsAmount) {
        throw new Error(
          "Pochmann ++ or -- moves cannot have an amount written as a number."
        );
      }
      if ((suffix === "+" || suffix === "-") && hadEmptyAbsAmount) {
        throw new Error(
          "Clock dial moves must have an amount written as a natural number followed by + or -."
        );
      }
      if (suffix.startsWith("+")) {
        quantumMove = quantumMove.modified({
          family: `${quantumMove.family}_${suffix === "+" ? "PLUS" : "PLUSPLUS"}_`
          // TODO
        });
      }
      if (suffix.startsWith("-")) {
        quantumMove = quantumMove.modified({
          family: `${quantumMove.family}_${suffix === "-" ? "PLUS" : "PLUSPLUS"}_`
          // TODO
        });
        amount *= -1;
      }
    }
    const move = addCharIndices(
      new Move(quantumMove, amount),
      savedCharIndex,
      this.#idx
    );
    return move;
  }
  parseMoveSuffix() {
    if (this.tryConsumeNext("+")) {
      if (this.tryConsumeNext("+")) {
        return "++";
      }
      return "+";
    }
    if (this.tryConsumeNext("-")) {
      if (this.tryConsumeNext("-")) {
        return "--";
      }
      return "-";
    }
    return null;
  }
  parseAmountAndTrackEmptyAbsAmount() {
    const savedIdx = this.#idx;
    const [, absAmountStr, primeStr] = this.parseRegex(AMOUNT_REGEX);
    if (absAmountStr?.startsWith("0") && absAmountStr !== "0") {
      throw new Error(
        `Error at char index ${savedIdx}: An amount can only start with 0 if it's exactly the digit 0.`
      );
    }
    return [
      parseIntWithEmptyFallback(absAmountStr, 1) * (primeStr === "'" ? -1 : 1),
      !absAmountStr
    ];
  }
  parseAmount() {
    const savedIdx = this.#idx;
    const [, absAmountStr, primeStr] = this.parseRegex(AMOUNT_REGEX);
    if (absAmountStr?.startsWith("0") && absAmountStr !== "0") {
      throw new Error(
        `Error at char index ${savedIdx}: An amount number can only start with 0 if it's exactly the digit 0.`
      );
    }
    return parseIntWithEmptyFallback(absAmountStr, 1) * (primeStr === "'" ? -1 : 1);
  }
  parseRegex(regex) {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      throw new Error("internal parsing error");
    }
    this.#idx += arr[0].length;
    return arr;
  }
  // TOD: can we avoid this?
  tryRegex(regex) {
    const arr = regex.exec(this.remaining());
    if (arr === null) {
      return null;
    }
    this.#idx += arr[0].length;
    return arr;
  }
  remaining() {
    return this.#input.slice(this.#idx);
  }
  popNext() {
    const next = this.#input[this.#idx];
    this.#idx++;
    return next;
  }
  tryConsumeNext(expected) {
    if (this.#input[this.#idx] === expected) {
      this.#idx++;
      return true;
    }
    return false;
  }
  mustConsumeNext(expected) {
    const next = this.popNext();
    if (next !== expected) {
      throw new Error(
        `expected \`${expected}\` while parsing, encountered ${next}`
      );
    }
    return next;
  }
};
var NODEJS_UTIL_INSPECT_CUSTOM = /* @__PURE__ */ Symbol.for(
  "nodejs.util.inspect.custom"
);
var NODE_DEFAULT_STRING_COLOR = "green";
var DE_EMPHASIZED = "gray";
function formatForCustomInspect(className, soleParameterQuotedString, annotation) {
  const { styleText } = globalThis.process.getBuiltinModule("node:util");
  const annotationPart = (() => {
    if (annotation) {
      return ` ${styleText(DE_EMPHASIZED, "/* with parse data */")}`;
    }
    return "";
  })();
  return `${className}(${styleText(NODE_DEFAULT_STRING_COLOR, soleParameterQuotedString)}${annotationPart})`;
}
function formatForCustomInspectWithParseDataAnnotation(className, soleParameterQuotedString, value) {
  const annotation = (() => {
    if (startCharIndexKey in value || endCharIndexKey in value) {
      if (startCharIndexKey in value !== endCharIndexKey in value) {
        console.warn(
          "Encountered an alg with start char info but no end char info. `cubing.js` should never produce this by itself."
        );
      }
      return "with parse data";
    }
    return "";
  })();
  return formatForCustomInspect(
    className,
    soleParameterQuotedString,
    annotation
  );
}
var MAX_INT = 2147483647;
var MAX_INT_DESCRIPTION = "2^31 - 1";
var MIN_INT = -2147483648;
var QuantumWithAmount = class {
  quantum;
  amount;
  constructor(quantum, amount = 1) {
    this.quantum = quantum;
    this.amount = amount;
    if (!Number.isInteger(this.amount) || this.amount < MIN_INT || this.amount > MAX_INT) {
      throw new Error(
        `AlgNode amount absolute value must be a non-negative integer below ${MAX_INT_DESCRIPTION}.`
      );
    }
  }
  suffix() {
    let s = "";
    const absAmount = Math.abs(this.amount);
    if (absAmount !== 1) {
      s += absAmount;
    }
    if (this.amount < 0) {
      s += "'";
    }
    return s;
  }
  isIdentical(other) {
    return this.quantum.isIdentical(other.quantum) && this.amount === other.amount;
  }
  // TODO: `Conjugate` and `Commutator` decrement `depth` inside the quantum, `Grouping` has to do it outside the quantum.
  *experimentalExpand(iterDir, depth) {
    const absAmount = Math.abs(this.amount);
    const newIterDir = toggleDirection(iterDir, this.amount < 0);
    for (let i = 0; i < absAmount; i++) {
      yield* this.quantum.experimentalExpand(newIterDir, depth);
    }
  }
};
var QuantumMove = class _QuantumMove extends Comparable {
  #family;
  #innerLayer;
  #outerLayer;
  constructor(family, innerLayer, outerLayer) {
    super();
    this.#family = family;
    this.#innerLayer = innerLayer ?? null;
    this.#outerLayer = outerLayer ?? null;
    Object.freeze(this);
    if (this.#innerLayer !== null && (!Number.isInteger(this.#innerLayer) || this.#innerLayer < 1 || this.#innerLayer > MAX_INT)) {
      throw new Error(
        `QuantumMove inner layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`
      );
    }
    if (this.#outerLayer !== null && (!Number.isInteger(this.#outerLayer) || this.#outerLayer < 1 || this.#outerLayer > MAX_INT)) {
      throw new Error(
        `QuantumMove outer layer must be a positive integer below ${MAX_INT_DESCRIPTION}.`
      );
    }
    if (this.#outerLayer !== null && this.#innerLayer !== null && this.#innerLayer <= this.#outerLayer) {
      throw new Error(
        "QuantumMove outer layer must be smaller than inner layer."
      );
    }
    if (this.#outerLayer !== null && this.#innerLayer === null) {
      throw new Error(
        "QuantumMove with an outer layer must have an inner layer"
      );
    }
  }
  static fromString(s) {
    return parseQuantumMove(s);
  }
  // TODO: `modify`?
  modified(modifications) {
    return new _QuantumMove(
      modifications.family ?? this.#family,
      modifications.innerLayer ?? this.#innerLayer,
      modifications.outerLayer ?? this.#outerLayer
    );
  }
  isIdentical(other) {
    const otherAsQuantumMove = other;
    return other.is(_QuantumMove) && this.#family === otherAsQuantumMove.#family && this.#innerLayer === otherAsQuantumMove.#innerLayer && this.#outerLayer === otherAsQuantumMove.#outerLayer;
  }
  // TODO: provide something more useful on average.
  /** @deprecated */
  get family() {
    return this.#family;
  }
  // TODO: provide something more useful on average.
  /** @deprecated */
  get outerLayer() {
    return this.#outerLayer;
  }
  // TODO: provide something more useful on average.
  /** @deprecated */
  get innerLayer() {
    return this.#innerLayer;
  }
  experimentalExpand() {
    throw new Error(
      "experimentalExpand() cannot be called on a `QuantumMove` directly."
    );
  }
  toString(_experimentalSerializationOptions) {
    let s = this.#family;
    if (this.#innerLayer !== null) {
      s = String(this.#innerLayer) + s;
      if (this.#outerLayer !== null) {
        s = `${String(this.#outerLayer)}-${s}`;
      }
    }
    return s;
  }
};
var Move = class _Move extends AlgCommon {
  // @ts-expect-error False positive due to the `return` in the constructor.
  #quantumWithAmount;
  constructor(...args) {
    super();
    if (typeof args[0] === "string") {
      if (args[1] ?? null) {
        this.#quantumWithAmount = new QuantumWithAmount(
          QuantumMove.fromString(args[0]),
          args[1]
        );
        return;
      } else {
        return _Move.fromString(args[0]);
      }
    }
    this.#quantumWithAmount = new QuantumWithAmount(
      args[0],
      args[1]
    );
  }
  isIdentical(other) {
    const otherAsMove = other.as(_Move);
    return !!otherAsMove && this.#quantumWithAmount.isIdentical(otherAsMove.#quantumWithAmount);
  }
  invert() {
    return transferCharIndex(
      this,
      new _Move(
        this.#quantumWithAmount.quantum,
        this.#isSlash() ? this.amount : -this.amount
      )
    );
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards) {
    if (iterDir === IterationDirection.Forwards) {
      yield this;
    } else {
      yield this.modified({
        amount: -this.amount
      });
    }
  }
  get quantum() {
    return this.#quantumWithAmount.quantum;
  }
  // TODO: `modify`?
  modified(modifications) {
    return new _Move(
      this.#quantumWithAmount.quantum.modified(modifications),
      modifications.amount ?? this.amount
    );
  }
  static fromString(s) {
    return parseMove(s);
  }
  get amount() {
    return this.#quantumWithAmount.amount;
  }
  /** @deprecated */
  get family() {
    return this.#quantumWithAmount.quantum.family ?? void 0;
  }
  /** @deprecated */
  get outerLayer() {
    return this.#quantumWithAmount.quantum.outerLayer ?? void 0;
  }
  /** @deprecated */
  get innerLayer() {
    return this.#quantumWithAmount.quantum.innerLayer ?? void 0;
  }
  #cachedSlashMove;
  #isSlash() {
    return this.isIdentical(this.#cachedSlashMove ??= new _Move("_SLASH_"));
  }
  toString(experimentalSerializationOptions) {
    if (experimentalSerializationOptions?.notation !== "LGN") {
      if (this.#isSlash()) {
        return "/";
      }
      if (this.family.endsWith("_PLUS_")) {
        return this.#quantumWithAmount.quantum.toString().slice(0, -6) + Math.abs(this.amount) + (this.amount < 0 ? "-" : "+");
      }
      if (this.family.endsWith("_PLUSPLUS_")) {
        const absAmount = Math.abs(this.amount);
        return this.#quantumWithAmount.quantum.toString().slice(0, -10) + (absAmount === 1 ? "" : absAmount) + (this.amount < 0 ? "--" : "++");
      }
    }
    return this.#quantumWithAmount.quantum.toString(
      experimentalSerializationOptions
    ) + this.#quantumWithAmount.suffix();
  }
  // // TODO: Serialize as a string?
  // toJSON(): MoveJSON {
  //   return {
  //     type: "move",
  //     family: this.family,
  //     innerLayer: this.innerLayer,
  //     outerLayer: this.outerLayer,
  //   };
  // }
  [NODEJS_UTIL_INSPECT_CUSTOM]() {
    return formatForCustomInspectWithParseDataAnnotation(
      "Move",
      JSON.stringify(this.toString()),
      this
    );
  }
};
var Square1TupleFormatter = class {
  quantumU_SQ_ = null;
  quantumD_SQ_ = null;
  format(grouping, experimentalSerializationOptions) {
    if (experimentalSerializationOptions?.notation === "LGN") {
      return null;
    }
    if (grouping.amount !== 1) {
      return null;
    }
    const amounts = this.tuple(grouping);
    if (!amounts) {
      return null;
    }
    return `(${amounts.map((move) => move.amount).join(", ")})`;
  }
  tuple(grouping) {
    if (grouping.amount !== 1) {
      return null;
    }
    this.quantumU_SQ_ ||= new QuantumMove("U_SQ_");
    this.quantumD_SQ_ ||= new QuantumMove("D_SQ_");
    const quantumAlg = grouping.alg;
    if (quantumAlg.experimentalNumChildAlgNodes() === 2) {
      const [U, D] = quantumAlg.childAlgNodes();
      if (U.as(Move)?.quantum.isIdentical(this.quantumU_SQ_) && D.as(Move)?.quantum.isIdentical(this.quantumD_SQ_)) {
        return [U, D];
      }
    }
    return null;
  }
};
var square1TupleFormatterInstance = new Square1TupleFormatter();
var Grouping = class _Grouping extends AlgCommon {
  #quantumWithAmount;
  experimentalNISSPlaceholder;
  // TODO: tie this to the alg
  constructor(algSource, amount) {
    super();
    const alg = experimentalEnsureAlg(algSource);
    this.#quantumWithAmount = new QuantumWithAmount(alg, amount);
  }
  isIdentical(other) {
    const otherAsGrouping = other;
    return other.is(_Grouping) && this.#quantumWithAmount.isIdentical(otherAsGrouping.#quantumWithAmount);
  }
  get alg() {
    return this.#quantumWithAmount.quantum;
  }
  get amount() {
    return this.#quantumWithAmount.amount;
  }
  modified(modifications) {
    return new _Grouping(
      modifications.alg ?? this.alg,
      modifications.amount ?? this.amount
    );
  }
  /** @deprecated */
  get experimentalRepetitionSuffix() {
    return this.#quantumWithAmount.suffix();
  }
  invert() {
    const amounts = square1TupleFormatterInstance.tuple(this);
    if (amounts) {
      const [moveU, moveD] = amounts;
      return new _Grouping(new Alg([moveU.invert(), moveD.invert()]));
    }
    return new _Grouping(
      this.#quantumWithAmount.quantum,
      -this.#quantumWithAmount.amount
    );
  }
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth ??= Infinity;
    if (depth === 0) {
      yield iterDir === IterationDirection.Forwards ? this : this.invert();
    } else {
      yield* this.#quantumWithAmount.experimentalExpand(iterDir, depth - 1);
    }
  }
  static fromString() {
    throw new Error("unimplemented");
  }
  #unrepeatedString(experimentalSerializationOptions) {
    const insideString = this.#quantumWithAmount.quantum.toString(
      experimentalSerializationOptions
    );
    const iter = this.alg.childAlgNodes();
    const { value } = iter.next();
    if (iter.next().done && (value?.is(Commutator) || value?.is(Conjugate))) {
      return insideString;
    }
    return `(${insideString})`;
  }
  toString(experimentalSerializationOptions) {
    return square1TupleFormatterInstance.format(
      this,
      experimentalSerializationOptions
    ) ?? `${this.#unrepeatedString(experimentalSerializationOptions)}${this.#quantumWithAmount.suffix()}`;
  }
  experimentalAsSquare1Tuple() {
    return square1TupleFormatterInstance.tuple(this);
  }
  // toJSON(): GroupingJSON {
  //   return {
  //     type: "grouping",
  //     alg: this.#quanta.quantum.toJSON(),
  //   };
  // }
};
function experimentalIs(v, c) {
  return v instanceof c;
}
function experimentalIsAlgNode(v) {
  return experimentalIs(v, Grouping) || experimentalIs(v, LineComment) || experimentalIs(v, Commutator) || experimentalIs(v, Conjugate) || experimentalIs(v, Move) || experimentalIs(v, Newline) || experimentalIs(v, Pause);
}
var DEFAULT_DIRECTIONAL = "any-direction";
var AppendOptionsHelper = class {
  config;
  constructor(config = {}) {
    this.config = config;
  }
  cancelQuantum() {
    const { cancel } = this.config;
    if (cancel === true) {
      return DEFAULT_DIRECTIONAL;
    }
    if (cancel === false) {
      return "none";
    }
    return cancel?.directional ?? "none";
  }
  cancelAny() {
    return this.config.cancel && this.cancelQuantum() !== "none";
  }
  cancelPuzzleSpecificModWrap() {
    const { cancel } = this.config;
    if (cancel === true || cancel === false) {
      return "canonical-centered";
    }
    if (cancel?.puzzleSpecificModWrap) {
      return cancel?.puzzleSpecificModWrap;
    }
    return cancel?.directional === "same-direction" ? "preserve-sign" : "canonical-centered";
  }
  puzzleSpecificSimplifyOptions() {
    return this.config.puzzleLoader?.puzzleSpecificSimplifyOptions ?? this.config.puzzleSpecificSimplifyOptions;
  }
};
function areSameDirection(direction, move2) {
  return direction * Math.sign(move2.amount) >= 0;
}
function offsetMod(x, positiveMod, offset = 0) {
  return ((x - offset) % positiveMod + positiveMod) % positiveMod + offset;
}
function experimentalAppendMove(alg, addedMove, options) {
  const optionsHelper = new AppendOptionsHelper(options);
  const outputPrefix = Array.from(alg.childAlgNodes());
  let outputSuffix = [addedMove];
  function output() {
    return new Alg([...outputPrefix, ...outputSuffix]);
  }
  function modMove(move) {
    if (optionsHelper.cancelPuzzleSpecificModWrap() === "none") {
      return move;
    }
    const quantumMoveOrder = optionsHelper.puzzleSpecificSimplifyOptions()?.quantumMoveOrder;
    if (!quantumMoveOrder) {
      return move;
    }
    const mod = quantumMoveOrder(addedMove.quantum);
    let offset;
    switch (optionsHelper.cancelPuzzleSpecificModWrap()) {
      case "gravity": {
        offset = -Math.floor((mod - (move.amount < 0 ? 0 : 1)) / 2);
        break;
      }
      case "canonical-centered": {
        offset = -Math.floor((mod - 1) / 2);
        break;
      }
      case "canonical-positive": {
        offset = 0;
        break;
      }
      case "preserve-sign": {
        offset = move.amount < 0 ? 1 - mod : 0;
        break;
      }
      default: {
        throw new Error("Unknown mod wrap");
      }
    }
    const offsetAmount = offsetMod(move.amount, mod, offset);
    return move.modified({ amount: offsetAmount });
  }
  if (optionsHelper.cancelAny()) {
    let canCancelMoveBasedOnQuantum;
    const axis = optionsHelper.puzzleSpecificSimplifyOptions()?.axis;
    if (axis) {
      canCancelMoveBasedOnQuantum = (move) => axis.areQuantumMovesSameAxis(addedMove.quantum, move.quantum);
    } else {
      const newMoveQuantumString = addedMove.quantum.toString();
      canCancelMoveBasedOnQuantum = (move) => move.quantum.toString() === newMoveQuantumString;
    }
    const sameDirectionOnly = optionsHelper.cancelQuantum() === "same-direction";
    const quantumDirections = /* @__PURE__ */ new Map();
    quantumDirections.set(
      addedMove.quantum.toString(),
      Math.sign(addedMove.amount)
    );
    let i;
    for (i = outputPrefix.length - 1; i >= 0; i--) {
      const move = outputPrefix[i].as(Move);
      if (!move) {
        break;
      }
      if (!canCancelMoveBasedOnQuantum(move)) {
        break;
      }
      const quantumKey = move.quantum.toString();
      if (sameDirectionOnly) {
        const existingQuantumDirectionOnAxis = quantumDirections.get(quantumKey);
        if (existingQuantumDirectionOnAxis && // Short-circuits, but that's actually okay here.
        !areSameDirection(existingQuantumDirectionOnAxis, move)) {
          break;
        }
        quantumDirections.set(quantumKey, Math.sign(move.amount));
      }
    }
    const suffix = [...outputPrefix.splice(i + 1), addedMove];
    if (axis) {
      outputSuffix = axis.simplifySameAxisMoves(
        suffix,
        optionsHelper.cancelPuzzleSpecificModWrap() !== "none"
      );
    } else {
      const amount = suffix.reduce(
        (sum, move) => sum + move.amount,
        0
      );
      if (quantumDirections.size !== 1) {
        throw new Error(
          "Internal error: multiple quantums when one was expected"
        );
      }
      outputSuffix = [new Move(addedMove.quantum, amount)];
    }
  }
  outputSuffix = outputSuffix.map((m) => modMove(m)).filter((move) => move.amount !== 0);
  return output();
}
function experimentalAppendNode(alg, leaf, options) {
  const maybeMove = leaf.as(Move);
  if (maybeMove) {
    return experimentalAppendMove(alg, maybeMove, options);
  } else {
    return new Alg([...alg.childAlgNodes(), leaf]);
  }
}
function dispatch(t, algNode, dataDown) {
  if (algNode.is(Grouping)) {
    return t.traverseGrouping(algNode, dataDown);
  }
  if (algNode.is(Move)) {
    return t.traverseMove(algNode, dataDown);
  }
  if (algNode.is(Commutator)) {
    return t.traverseCommutator(algNode, dataDown);
  }
  if (algNode.is(Conjugate)) {
    return t.traverseConjugate(algNode, dataDown);
  }
  if (algNode.is(Pause)) {
    return t.traversePause(algNode, dataDown);
  }
  if (algNode.is(Newline)) {
    return t.traverseNewline(algNode, dataDown);
  }
  if (algNode.is(LineComment)) {
    return t.traverseLineComment(algNode, dataDown);
  }
  throw new Error("unknown AlgNode");
}
function mustBeAlgNode(t) {
  if (t.is(Grouping) || t.is(Move) || t.is(Commutator) || t.is(Conjugate) || t.is(Pause) || t.is(Newline) || t.is(LineComment)) {
    return t;
  }
  throw new Error("internal error: expected AlgNode");
}
var TraversalDownUp = class {
  // Immediate subclasses should overwrite this.
  traverseAlgNode(algNode, dataDown) {
    return dispatch(this, algNode, dataDown);
  }
  traverseIntoAlgNode(algNode, dataDown) {
    return mustBeAlgNode(this.traverseAlgNode(algNode, dataDown));
  }
};
var TraversalUp = class extends TraversalDownUp {
  traverseAlgNode(algNode) {
    return dispatch(
      this,
      algNode,
      void 0
    );
  }
  traverseIntoAlgNode(algNode) {
    return mustBeAlgNode(this.traverseAlgNode(algNode));
  }
};
function functionFromTraversal(traversalConstructor, constructorArgs) {
  const instance = new traversalConstructor(
    ...constructorArgs ?? []
  );
  return instance.traverseAlg.bind(instance);
}
var Simplify = class extends TraversalDownUp {
  #newPlaceholderAssociationsMap;
  #newPlaceholderAssociations() {
    return this.#newPlaceholderAssociationsMap ??= /* @__PURE__ */ new Map();
  }
  // TODO: avoid allocations?
  #descendOptions(options) {
    return {
      ...options,
      depth: options.depth ? options.depth - 1 : null
    };
  }
  // TODO: Handle
  *traverseAlg(alg, options) {
    if (options.depth === 0) {
      yield* alg.childAlgNodes();
      return;
    }
    let output = [];
    const newOptions = this.#descendOptions(options);
    for (const algNode of alg.childAlgNodes()) {
      for (const traversedNode of this.traverseAlgNode(algNode, newOptions)) {
        output = Array.from(
          experimentalAppendNode(
            new Alg(output),
            traversedNode,
            newOptions
          ).childAlgNodes()
        );
      }
    }
    for (const newAlgNode of output) {
      yield newAlgNode;
    }
  }
  *traverseGrouping(grouping, options) {
    if (options.depth === 0) {
      yield grouping;
      return;
    }
    if (grouping.amount === 0) {
      return;
    }
    const newGrouping = new Grouping(
      this.traverseAlg(grouping.alg, this.#descendOptions(options)),
      grouping.amount
    );
    if (newGrouping.alg.experimentalIsEmpty()) {
      return;
    }
    const newPlaceholder = this.#newPlaceholderAssociations().get(grouping);
    if (newPlaceholder) {
      newGrouping.experimentalNISSPlaceholder = newPlaceholder;
      newPlaceholder.experimentalNISSGrouping = newGrouping;
    }
    yield newGrouping;
  }
  *traverseMove(move, _options) {
    yield move;
  }
  #doChildrenCommute(A, B, options) {
    if (A.experimentalNumChildAlgNodes() === 1 && B.experimentalNumChildAlgNodes() === 1) {
      const aMove = Array.from(A.childAlgNodes())[0]?.as(Move);
      const bMove = Array.from(B.childAlgNodes())[0]?.as(Move);
      if (!(aMove && bMove)) {
        return false;
      }
      if (bMove.quantum.isIdentical(aMove.quantum)) {
        return true;
      }
      const appendOptionsHelper = new AppendOptionsHelper(options);
      if (appendOptionsHelper.puzzleSpecificSimplifyOptions()?.axis?.areQuantumMovesSameAxis(aMove.quantum, bMove.quantum)) {
        return true;
      }
    }
    return false;
  }
  *traverseCommutator(commutator, options) {
    if (options.depth === 0) {
      yield commutator;
      return;
    }
    const newOptions = this.#descendOptions(options);
    const newCommutator = new Commutator(
      this.traverseAlg(commutator.A, newOptions),
      this.traverseAlg(commutator.B, newOptions)
    );
    if (newCommutator.A.experimentalIsEmpty() || newCommutator.B.experimentalIsEmpty() || newCommutator.A.isIdentical(newCommutator.B) || newCommutator.A.isIdentical(newCommutator.B.invert()) || this.#doChildrenCommute(newCommutator.A, newCommutator.B, options)) {
      return;
    }
    yield newCommutator;
  }
  *traverseConjugate(conjugate, options) {
    if (options.depth === 0) {
      yield conjugate;
      return;
    }
    const newOptions = this.#descendOptions(options);
    const newConjugate = new Conjugate(
      this.traverseAlg(conjugate.A, newOptions),
      this.traverseAlg(conjugate.B, newOptions)
    );
    if (newConjugate.B.experimentalIsEmpty()) {
      return;
    }
    if (newConjugate.A.experimentalIsEmpty() || newConjugate.A.isIdentical(newConjugate.B) || newConjugate.A.isIdentical(newConjugate.B.invert()) || this.#doChildrenCommute(newConjugate.A, newConjugate.B, options)) {
      yield* conjugate.B.childAlgNodes();
      return;
    }
    yield newConjugate;
  }
  *traversePause(pause, _options) {
    if (pause.experimentalNISSGrouping) {
      const newPause = new Pause();
      this.#newPlaceholderAssociations().set(
        pause.experimentalNISSGrouping,
        newPause
      );
      yield newPause;
    } else {
      yield pause;
    }
  }
  *traverseNewline(newline, _options) {
    yield newline;
  }
  *traverseLineComment(comment, _options) {
    yield comment;
  }
};
var simplify = functionFromTraversal(Simplify);
function toIterable(input) {
  if (!input) {
    return [];
  }
  if (experimentalIs(input, Alg)) {
    return input.childAlgNodes();
  }
  if (typeof input === "string") {
    return parseAlg(input).childAlgNodes();
  }
  const iter = input;
  if (typeof iter[Symbol.iterator] === "function") {
    return iter;
  }
  throw new Error("Invalid AlgNode");
}
function experimentalEnsureAlg(alg) {
  if (experimentalIs(alg, Alg)) {
    return alg;
  }
  return new Alg(alg);
}
var Alg = class _Alg extends AlgCommon {
  // #debugString: string;
  #algNodes;
  // TODO: freeze?
  constructor(alg) {
    super();
    this.#algNodes = Array.from(toIterable(alg));
    for (const algNode of this.#algNodes) {
      if (!experimentalIsAlgNode(algNode)) {
        throw new Error("An alg can only contain alg nodes.");
      }
    }
  }
  /**
   * Checks whether this Alg is structurally identical to another Alg. This
   * essentially means that they are written identically apart from whitespace.
   *
   *     const alg1 = new Alg("R U L'");
   *     const alg2 = new Alg("L U' R'").invert();
   *     // true
   *     alg1.isIdentical(alg2);
   *
   *     // false
   *     new Alg("[R, U]").isIdentical(new Alg("R U R' U'"));
   *     // true
   *     new Alg("[R, U]").expand().isIdentical(new Alg("R U R' U'"));
   *
   * Note that .isIdentical() efficiently compares algorithms, but mainly exists
   * to help optimize code when the structure of an algorithm hasn't changed.
   * There are many ways to write the "same" alg on most puzzles, but is
   * *highly* recommended to avoid expanding two Alg instances to compare them,
   * since that can easily slow your program to a crawl if someone inputs an alg
   * containing a large repetition. In general, you should use `cubing/kpuzzle`
   * to compare if two algs have the same effect on a puzzle.
   *
   * Also note that parser annotations are not taken into account while comparing
   * algs:
   *
   *     const alg = new Alg([new Move("R"), new Move("U2")]);
   *     // true, even though one of the algs has parser annotations
   *     alg.isIdentical(new Alg("R U2"))
   *
   */
  isIdentical(other) {
    const otherAsAlg = other;
    if (!other.is(_Alg)) {
      return false;
    }
    const l1 = Array.from(this.#algNodes);
    const l2 = Array.from(otherAsAlg.#algNodes);
    if (l1.length !== l2.length) {
      return false;
    }
    for (let i = 0; i < l1.length; i++) {
      if (!l1[i].isIdentical(l2[i])) {
        return false;
      }
    }
    return true;
  }
  /**
   * Returns the inverse of the given alg.
   *
   * Note that that this does not make any assumptions about what puzzle the alg
   * is for. For example, U2 is its own inverse on a cube, but U2' has the same
   * effect U3 (and not U2) on Megaminx:
   *
   *     // Outputs: R U2' L'
   *     new Alg("L U2 R'").invert().log();
   */
  invert() {
    return new _Alg(reverse(Array.from(this.#algNodes).map((u) => u.invert())));
  }
  /** @deprecated Use {@link Alg.expand} instead. */
  *experimentalExpand(iterDir = IterationDirection.Forwards, depth) {
    depth ??= Infinity;
    for (const algNode of direct(this.#algNodes, iterDir)) {
      yield* algNode.experimentalExpand(iterDir, depth);
    }
  }
  /**
   * Expands all Grouping, Commutator, and Conjugate parts nested inside the
   * alg.
   *
   *     // F R U R' U' F'
   *     new Alg("[F: [R, U]]").expand().log();
   *
   *     // F [R, U] F'
   *     new Alg("[F: [R, U]]").expand(({ depth: 1 }).log();
   *
   * Avoid calling this on a user-provided alg unless the user explicitly asks
   * to see the expanded alg. Otherwise, it's easy to make your program freeze
   * when someone passes in an alg like: (R U)10000000
   *
   * Generally, if you want to perform an operation on an entire alg, you'll
   * want to use something based on the `Traversal` mechanism, like countMoves()
   * from `cubing/notation`.
   */
  expand(options) {
    return new _Alg(
      this.experimentalExpand(
        IterationDirection.Forwards,
        options?.depth ?? Infinity
      )
    );
  }
  /** @deprecated */
  *experimentalLeafMoves() {
    for (const leaf of this.experimentalExpand()) {
      if (leaf.is(Move)) {
        yield leaf;
      }
    }
  }
  concat(input) {
    return new _Alg(
      Array.from(this.#algNodes).concat(Array.from(toIterable(input)))
    );
  }
  /** @deprecated */
  experimentalIsEmpty() {
    for (const _ of this.#algNodes) {
      return false;
    }
    return true;
  }
  static fromString(s) {
    return parseAlg(s);
  }
  /** @deprecated */
  units() {
    return this.childAlgNodes();
  }
  *childAlgNodes() {
    for (const algNode of this.#algNodes) {
      yield algNode;
    }
  }
  /** @deprecated */
  experimentalNumUnits() {
    return this.experimentalNumChildAlgNodes();
  }
  experimentalNumChildAlgNodes() {
    return Array.from(this.#algNodes).length;
  }
  /**
   * Converts the Alg to a string:
   *
   *     const alg = new Alg([new Move("R"), new Move("U2"), new Move("L")])
   *     // R U2 L
   *     console.log(alg.toString())
   */
  toString(experimentalSerializationOptions) {
    let output = "";
    let previousVisibleAlgNode = null;
    for (const algNode of this.#algNodes) {
      if (previousVisibleAlgNode) {
        output += spaceBetween(previousVisibleAlgNode, algNode);
      }
      const nissGrouping = algNode.as(Pause)?.experimentalNISSGrouping;
      if (nissGrouping) {
        if (nissGrouping.amount !== -1) {
          throw new Error("Invalid NISS Grouping amount!");
        }
        output += `^(${nissGrouping.alg.toString(experimentalSerializationOptions)})`;
      } else if (algNode.as(Grouping)?.experimentalNISSPlaceholder) ;
      else {
        output += algNode.toString(experimentalSerializationOptions);
      }
      previousVisibleAlgNode = algNode;
    }
    return output;
  }
  /**
   * `experimentalSimplify` can perform several mostly-syntactic simplifications on an alg:
   *
   *     // Logs: R' U3
   *     import { Alg } from "cubing/alg";
   *     new Alg("R R2' U U2").experimentalSimplify({ cancel: true }).log()
   *
   * You can pass in a `PuzzleLoader` (currently only for 3x3x3) for puzzle-specific simplifications:
   *
   *     // Logs: R' U'
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *     new Alg("R R2' U U2").experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 }).log()
   *
   * You can also cancel only moves that are in the same direction:
   *
   *     // Logs: R R2' U'
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *     new Alg("R R2' U U2").experimentalSimplify({
   *       cancel: { directional: "same-direction" },
   *       puzzleLoader: cube3x3x3
   *     }).log()
   *
   * Additionally, you can specify how moves are "wrapped":
   *
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *
   *     function example(puzzleSpecificModWrap) {
   *       alg.experimentalSimplify({
   *         cancel: { puzzleSpecificModWrap },
   *         puzzleLoader: cube3x3x3
   *       }).log()
   *     }
   *
   *     const alg = new Alg("R7' . R6' . R5' . R6")
   *     example("none")               // R7' . R6' . R5' . R6
   *     example("gravity")            // R . R2' . R' . R2
   *     example("canonical-centered") // R . R2 . R' . R2
   *     example("canonical-positive") // R . R2 . R3 . R2
   *     example("preserve-sign")      // R3' . R2' . R' . R2
   *
   * Same-axis and simultaneous move canonicalization is not implemented yet:
   *
   *     // Logs: R L R
   *     import { Alg } from "cubing/alg";
   *     import { cube3x3x3 } from "cubing/puzzles";
   *     new Alg("R L R").experimentalSimplify({ cancel: true, puzzleLoader: cube3x3x3 }).log()
   */
  experimentalSimplify(options) {
    return new _Alg(simplify(this, options ?? {}));
  }
  /** @deprecated See {@link experimentalSimplify} */
  simplify(options) {
    return this.experimentalSimplify(options);
  }
  [NODEJS_UTIL_INSPECT_CUSTOM]() {
    const string = (() => {
      const asString = this.toString();
      if (asString.includes("\n")) {
        return `\`${asString.replaceAll(/(`\$)/g, "\\$1")}\``;
      } else {
        return JSON.stringify(asString);
      }
    })();
    return formatForCustomInspectWithParseDataAnnotation("Alg", string, this);
  }
};
function spaceBetween(u1, u2) {
  if (u1.is(Newline) || u2.is(Newline)) {
    return "";
  }
  if (u2.as(Grouping)?.experimentalNISSPlaceholder) {
    return "";
  }
  if (u1.is(LineComment) && !u2.is(Newline)) {
    return "\n";
  }
  return " ";
}
({
  Sune: new Alg([
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", 1),
    new Move("R", 1),
    new Move("U", -2),
    new Move("R", -1)
  ]),
  AntiSune: new Alg([
    new Move("R", 1),
    new Move("U", 2),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", 1),
    new Move("U", -1),
    new Move("R", -1)
  ]),
  SuneCommutator: new Alg([
    new Commutator(
      new Alg([new Move("R", 1), new Move("U", 1), new Move("R", -2)]),
      new Alg([
        new Conjugate(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]))
      ])
    )
  ]),
  Niklas: new Alg([
    new Move("R", 1),
    new Move("U", -1),
    new Move("L", -1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("L", 1),
    new Move("U", 1)
  ]),
  EPerm: new Alg([
    new Move("x", -1),
    new Commutator(
      new Alg([
        new Conjugate(
          new Alg([new Move("R", 1)]),
          new Alg([new Move("U", -1)])
        )
      ]),
      new Alg([new Move("D", 1)])
    ),
    new Commutator(
      new Alg([
        new Conjugate(new Alg([new Move("R", 1)]), new Alg([new Move("U", 1)]))
      ]),
      new Alg([new Move("D", 1)])
    ),
    new Move("x", 1)
  ]),
  FURURFCompact: new Alg([
    new Conjugate(
      new Alg([new Move("F", 1)]),
      new Alg([
        new Commutator(
          new Alg([new Move("U", 1)]),
          new Alg([new Move("R", 1)])
        )
      ])
    )
  ]),
  APermCompact: new Alg([
    new Conjugate(
      new Alg([new Move("R", 2)]),
      new Alg([
        new Commutator(
          new Alg([new Move("F", 2)]),
          new Alg([new Move("R", -1), new Move("B", -1), new Move("R", 1)])
        )
      ])
    )
  ]),
  FURURFMoves: new Alg([
    new Move("F", 1),
    new Move("U", 1),
    new Move("R", 1),
    new Move("U", -1),
    new Move("R", -1),
    new Move("F", -1)
  ]),
  TPerm: new Alg([
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", -1),
    new Move("F", 1),
    new Move("R", 2),
    new Move("U", -1),
    new Move("R", -1),
    new Move("U", -1),
    new Move("R", 1),
    new Move("U", 1),
    new Move("R", -1),
    new Move("F", -1)
  ]),
  HeadlightSwaps: new Alg([
    new Conjugate(
      new Alg([new Move("F", 1)]),
      new Alg([
        new Grouping(
          new Alg([
            new Commutator(
              new Alg([new Move("R", 1)]),
              new Alg([new Move("U", 1)])
            )
          ]),
          3
        )
      ])
    )
  ]),
  TriplePause: new Alg([new Pause(), new Pause(), new Pause()])
  // AllAlgParts: [
  //   new Alg([new Move("R", 1), new Move("U", -1)]),
  //   new Grouping(new Alg([new Move("F", 1)]), 2),
  //   // new Rotation("y", -1),
  //   new Move("R", 2),
  //   new Commutator(new Alg([new Move("R", 2)]), new Alg([new Move("U", 2)]), 2),
  //   new Conjugate(new Alg([new Move("L", 2)]), new Alg([new Move("D", -1)]), 2),
  //   new Pause(),
  //   new Newline(),
  //   new LineComment("line comment"),
  // ],
});
function combineTransformationData(definition, transformationData1, transformationData2) {
  const newTransformationData = {};
  for (const orbitDefinition of definition.orbits) {
    const orbit1 = transformationData1[orbitDefinition.orbitName];
    const orbit2 = transformationData2[orbitDefinition.orbitName];
    if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      orbit2
    )) {
      newTransformationData[orbitDefinition.orbitName] = orbit1;
    } else if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      orbit1
    )) {
      newTransformationData[orbitDefinition.orbitName] = orbit2;
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitDefinition.orbitName] = {
          permutation: newPerm,
          orientationDelta: orbit1.orientationDelta
        };
      } else {
        const newOri = new Array(orbitDefinition.numPieces);
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newOri[idx] = (orbit1.orientationDelta[orbit2.permutation[idx]] + orbit2.orientationDelta[idx]) % orbitDefinition.numOrientations;
          newPerm[idx] = orbit1.permutation[orbit2.permutation[idx]];
        }
        newTransformationData[orbitDefinition.orbitName] = {
          permutation: newPerm,
          orientationDelta: newOri
        };
      }
    }
  }
  return newTransformationData;
}
function applyTransformationDataToKPatternData(definition, patternData, transformationData) {
  const newPatternData = {};
  for (const orbitDefinition of definition.orbits) {
    const patternOrbit = patternData[orbitDefinition.orbitName];
    const transformationOrbit = transformationData[orbitDefinition.orbitName];
    if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      transformationOrbit
    )) {
      newPatternData[orbitDefinition.orbitName] = patternOrbit;
    } else {
      const newPieces = new Array(orbitDefinition.numPieces);
      if (orbitDefinition.numOrientations === 1) {
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          newPieces[idx] = patternOrbit.pieces[transformationOrbit.permutation[idx]];
        }
        const newOrbitData = {
          pieces: newPieces,
          orientation: patternOrbit.orientation
          // copy all 0
        };
        newPatternData[orbitDefinition.orbitName] = newOrbitData;
      } else {
        const newOrientation = new Array(orbitDefinition.numPieces);
        const newOrientationMod = patternOrbit.orientationMod ? new Array(orbitDefinition.numPieces) : void 0;
        for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
          const transformationIdx = transformationOrbit.permutation[idx];
          let mod = orbitDefinition.numOrientations;
          if (patternOrbit.orientationMod) {
            const orientationMod = patternOrbit.orientationMod[transformationIdx];
            newOrientationMod[idx] = orientationMod;
            mod = orientationMod || orbitDefinition.numOrientations;
          }
          newOrientation[idx] = (patternOrbit.orientation[transformationIdx] + transformationOrbit.orientationDelta[idx]) % mod;
          newPieces[idx] = patternOrbit.pieces[transformationIdx];
        }
        const newOrbitData = {
          pieces: newPieces,
          orientation: newOrientation
        };
        if (newOrientationMod) {
          newOrbitData.orientationMod = newOrientationMod;
        }
        newPatternData[orbitDefinition.orbitName] = newOrbitData;
      }
    }
  }
  return newPatternData;
}
var identityOrbitCache = /* @__PURE__ */ new Map();
function constructIdentityOrbitTransformation(numPieces) {
  const cached = identityOrbitCache.get(numPieces);
  if (cached) {
    return cached;
  }
  const newPermutation = new Array(numPieces);
  const newOrientation = new Array(numPieces);
  for (let i = 0; i < numPieces; i++) {
    newPermutation[i] = i;
    newOrientation[i] = 0;
  }
  const orbitTransformation = {
    permutation: newPermutation,
    orientationDelta: newOrientation
  };
  identityOrbitCache.set(numPieces, orbitTransformation);
  return orbitTransformation;
}
function constructIdentityTransformationDataUncached(definition) {
  const transformation = {};
  for (const orbitDefinition of definition.orbits) {
    transformation[orbitDefinition.orbitName] = constructIdentityOrbitTransformation(orbitDefinition.numPieces);
  }
  return transformation;
}
function moveToTransformationUncached(kpuzzle, move) {
  function getTransformationData(key, multiplyAmount) {
    const s = key.toString();
    const movesDef = kpuzzle.definition.moves[s];
    if (movesDef) {
      return repeatTransformationUncached(kpuzzle, movesDef, multiplyAmount);
    }
    const derivedDef = kpuzzle.definition.derivedMoves?.[s];
    if (derivedDef) {
      return repeatTransformationUncached(
        kpuzzle,
        kpuzzle.algToTransformation(derivedDef).transformationData,
        multiplyAmount
      );
    }
    return void 0;
  }
  const data = getTransformationData(move.quantum, move.amount) ?? // Handle e.g. `y2` if `y2` is defined.
  // Note: this doesn't handle multiples.
  getTransformationData(move, 1) ?? // Handle e.g. `y2'` if `y2` is defined.
  // Note: this doesn't handle multiples.
  getTransformationData(move.invert, -1);
  if (data) {
    return data;
  }
  throw new Error(`Invalid move for KPuzzle (${kpuzzle.name()}): ${move}`);
}
var KTransformation = class _KTransformation {
  kpuzzle;
  transformationData;
  constructor(kpuzzle, transformationData) {
    this.kpuzzle = kpuzzle;
    this.transformationData = transformationData;
  }
  toJSON() {
    return {
      experimentalPuzzleName: this.kpuzzle.name(),
      transformationData: this.transformationData
    };
  }
  invert() {
    return new _KTransformation(
      this.kpuzzle,
      invertTransformation(this.kpuzzle, this.transformationData)
    );
  }
  // For optimizations, we want to make it cheap to rely on optimizations when a
  // transformation is an identity. Here, we try to make it cheaper by:
  // - only calculating when needed, and
  // - caching the result.
  #cachedIsIdentity;
  // TODO: is `null` worse here?
  isIdentityTransformation() {
    return this.#cachedIsIdentity ??= this.isIdentical(
      this.kpuzzle.identityTransformation()
    );
  }
  /** @deprecated */
  static experimentalConstructIdentity(kpuzzle) {
    const transformation = new _KTransformation(
      kpuzzle,
      constructIdentityTransformationDataUncached(kpuzzle.definition)
    );
    transformation.#cachedIsIdentity = true;
    return transformation;
  }
  isIdentical(t2) {
    return isTransformationDataIdentical(
      this.kpuzzle,
      this.transformationData,
      t2.transformationData
    );
  }
  // Convenience function
  /** @deprecated */
  apply(source) {
    return this.applyTransformation(this.kpuzzle.toTransformation(source));
  }
  applyTransformation(t2) {
    if (this.kpuzzle !== t2.kpuzzle) {
      throw new Error(
        `Tried to apply a transformation for a KPuzzle (${t2.kpuzzle.name()}) to a different KPuzzle (${this.kpuzzle.name()}).`
      );
    }
    if (this.#cachedIsIdentity) {
      return new _KTransformation(this.kpuzzle, t2.transformationData);
    }
    if (t2.#cachedIsIdentity) {
      return new _KTransformation(this.kpuzzle, this.transformationData);
    }
    return new _KTransformation(
      this.kpuzzle,
      combineTransformationData(
        this.kpuzzle.definition,
        this.transformationData,
        t2.transformationData
      )
    );
  }
  applyMove(move) {
    return this.applyTransformation(this.kpuzzle.moveToTransformation(move));
  }
  applyAlg(alg) {
    return this.applyTransformation(this.kpuzzle.algToTransformation(alg));
  }
  // Convenience. Useful for chaining.
  toKPattern() {
    return KPattern.fromTransformation(this);
  }
  // TODO: support calculating this for a given start state. (For `R U R' U` on 3x3x3, should this default to 5 or 10?)
  repetitionOrder() {
    return transformationRepetitionOrder(this.kpuzzle.definition, this);
  }
  selfMultiply(amount) {
    return new _KTransformation(
      this.kpuzzle,
      repeatTransformationUncached(
        this.kpuzzle,
        this.transformationData,
        amount
      )
    );
  }
};
function isOrbitTransformationDataIdentityUncached(numOrientations, orbitTransformationData) {
  if (!orbitTransformationData.permutation) {
    console.log(orbitTransformationData);
  }
  const { permutation } = orbitTransformationData;
  const numPieces = permutation.length;
  for (let idx = 0; idx < numPieces; idx++) {
    if (permutation[idx] !== idx) {
      return false;
    }
  }
  if (numOrientations > 1) {
    const { orientationDelta: orientation } = orbitTransformationData;
    for (let idx = 0; idx < numPieces; idx++) {
      if (orientation[idx] !== 0) {
        return false;
      }
    }
  }
  return true;
}
function isOrbitTransformationDataIdentical(orbitDefinition, orbitTransformationData1, orbitTransformationData2, options = {}) {
  for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
    if (!options?.ignorePieceOrientations && orbitTransformationData1.orientationDelta[idx] !== orbitTransformationData2.orientationDelta[idx]) {
      return false;
    }
    if (!options?.ignorePiecePermutation && orbitTransformationData1.permutation[idx] !== orbitTransformationData2.permutation[idx]) {
      return false;
    }
  }
  return true;
}
function isTransformationDataIdentical(kpuzzle, transformationData1, transformationData2) {
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    if (!isOrbitTransformationDataIdentical(
      orbitDefinition,
      transformationData1[orbitDefinition.orbitName],
      transformationData2[orbitDefinition.orbitName]
    )) {
      return false;
    }
  }
  return true;
}
function isOrbitPatternDataIdentical(orbitDefinition, orbitPatternData1, orbitPatternData2, options = {}) {
  for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
    if (!options?.ignorePieceOrientations && (orbitPatternData1.orientation[idx] !== orbitPatternData2.orientation[idx] || (orbitPatternData1.orientationMod?.[idx] ?? 0) !== (orbitPatternData2.orientationMod?.[idx] ?? 0))) {
      return false;
    }
    if (!options?.ignorePieceIndices && orbitPatternData1.pieces[idx] !== orbitPatternData2.pieces[idx]) {
      return false;
    }
  }
  return true;
}
function isPatternDataIdentical(kpuzzle, patternData1, patternData2) {
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    if (!isOrbitPatternDataIdentical(
      orbitDefinition,
      patternData1[orbitDefinition.orbitName],
      patternData2[orbitDefinition.orbitName]
    )) {
      return false;
    }
  }
  return true;
}
function invertTransformation(kpuzzle, transformationData) {
  const newTransformationData = {};
  for (const orbitDefinition of kpuzzle.definition.orbits) {
    const orbitTransformationData = transformationData[orbitDefinition.orbitName];
    if (isOrbitTransformationDataIdentityUncached(
      orbitDefinition.numOrientations,
      orbitTransformationData
    )) {
      newTransformationData[orbitDefinition.orbitName] = orbitTransformationData;
    } else if (orbitDefinition.numOrientations === 1) {
      const newPerm = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        newPerm[orbitTransformationData.permutation[idx]] = idx;
      }
      newTransformationData[orbitDefinition.orbitName] = {
        permutation: newPerm,
        orientationDelta: orbitTransformationData.orientationDelta
      };
    } else {
      const newPerm = new Array(orbitDefinition.numPieces);
      const newOri = new Array(orbitDefinition.numPieces);
      for (let idx = 0; idx < orbitDefinition.numPieces; idx++) {
        const fromIdx = orbitTransformationData.permutation[idx];
        newPerm[fromIdx] = idx;
        newOri[fromIdx] = (orbitDefinition.numOrientations - orbitTransformationData.orientationDelta[idx] + orbitDefinition.numOrientations) % orbitDefinition.numOrientations;
      }
      newTransformationData[orbitDefinition.orbitName] = {
        permutation: newPerm,
        orientationDelta: newOri
      };
    }
  }
  return newTransformationData;
}
function repeatTransformationUncached(kpuzzle, transformationData, amount) {
  if (amount === 1) {
    return transformationData;
  }
  if (amount < 0) {
    return repeatTransformationUncached(
      kpuzzle,
      invertTransformation(kpuzzle, transformationData),
      -amount
    );
  }
  if (amount === 0) {
    const { transformationData: transformationData2 } = kpuzzle.identityTransformation();
    return transformationData2;
  }
  let halfish = transformationData;
  if (amount !== 2) {
    halfish = repeatTransformationUncached(
      kpuzzle,
      transformationData,
      Math.floor(amount / 2)
    );
  }
  const twiceHalfish = combineTransformationData(
    kpuzzle.definition,
    halfish,
    halfish
  );
  if (amount % 2 === 0) {
    return twiceHalfish;
  } else {
    return combineTransformationData(
      kpuzzle.definition,
      transformationData,
      twiceHalfish
    );
  }
}
var AlgToTransformationTraversal = class extends TraversalDownUp {
  traverseAlg(alg, kpuzzle) {
    let transformation = null;
    for (const algNode of alg.childAlgNodes()) {
      if (transformation) {
        transformation = transformation.applyTransformation(
          this.traverseAlgNode(algNode, kpuzzle)
        );
      } else {
        transformation = this.traverseAlgNode(algNode, kpuzzle);
      }
    }
    return transformation ?? kpuzzle.identityTransformation();
  }
  traverseGrouping(grouping, kpuzzle) {
    const algTransformation = this.traverseAlg(grouping.alg, kpuzzle);
    return new KTransformation(
      kpuzzle,
      repeatTransformationUncached(
        kpuzzle,
        algTransformation.transformationData,
        grouping.amount
      )
    );
  }
  traverseMove(move, kpuzzle) {
    return kpuzzle.moveToTransformation(move);
  }
  traverseCommutator(commutator, kpuzzle) {
    const aTransformation = this.traverseAlg(commutator.A, kpuzzle);
    const bTransformation = this.traverseAlg(commutator.B, kpuzzle);
    return aTransformation.applyTransformation(bTransformation).applyTransformation(aTransformation.invert()).applyTransformation(bTransformation.invert());
  }
  traverseConjugate(conjugate, kpuzzle) {
    const aTransformation = this.traverseAlg(conjugate.A, kpuzzle);
    const bTransformation = this.traverseAlg(conjugate.B, kpuzzle);
    return aTransformation.applyTransformation(bTransformation).applyTransformation(aTransformation.invert());
  }
  traversePause(_, kpuzzle) {
    return kpuzzle.identityTransformation();
  }
  traverseNewline(_, kpuzzle) {
    return kpuzzle.identityTransformation();
  }
  traverseLineComment(_, kpuzzle) {
    return kpuzzle.identityTransformation();
  }
};
var algToTransformation = functionFromTraversal(
  AlgToTransformationTraversal
);
function gcd(a, b) {
  if (b) {
    return gcd(b, a % b);
  }
  return a;
}
function transformationRepetitionOrder(definition, transformation) {
  let order = 1;
  for (const orbitDefinition of definition.orbits) {
    const transformationOrbit = transformation.transformationData[orbitDefinition.orbitName];
    const orbitPieces = new Array(orbitDefinition.numPieces);
    for (let startIdx = 0; startIdx < orbitDefinition.numPieces; startIdx++) {
      if (!orbitPieces[startIdx]) {
        let currentIdx = startIdx;
        let orientationSum = 0;
        let cycleLength = 0;
        for (; ; ) {
          orbitPieces[currentIdx] = true;
          orientationSum = orientationSum + transformationOrbit.orientationDelta[currentIdx];
          cycleLength = cycleLength + 1;
          currentIdx = transformationOrbit.permutation[currentIdx];
          if (currentIdx === startIdx) {
            break;
          }
        }
        if (orientationSum !== 0) {
          cycleLength = cycleLength * orbitDefinition.numOrientations / gcd(orbitDefinition.numOrientations, Math.abs(orientationSum));
        }
        order = order * cycleLength / gcd(order, cycleLength);
      }
    }
  }
  return order;
}
var KPattern = class _KPattern {
  kpuzzle;
  patternData;
  constructor(kpuzzle, patternData) {
    this.kpuzzle = kpuzzle;
    this.patternData = patternData;
  }
  toJSON() {
    return {
      experimentalPuzzleName: this.kpuzzle.name(),
      patternData: this.patternData
    };
  }
  static fromTransformation(transformation) {
    const newPatternData = applyTransformationDataToKPatternData(
      transformation.kpuzzle.definition,
      transformation.kpuzzle.definition.defaultPattern,
      transformation.transformationData
    );
    return new _KPattern(transformation.kpuzzle, newPatternData);
  }
  // Convenience function
  /** @deprecated */
  apply(source) {
    return this.applyTransformation(this.kpuzzle.toTransformation(source));
  }
  applyTransformation(transformation) {
    if (transformation.isIdentityTransformation()) {
      return new _KPattern(this.kpuzzle, this.patternData);
    }
    const newPatternData = applyTransformationDataToKPatternData(
      this.kpuzzle.definition,
      this.patternData,
      transformation.transformationData
    );
    return new _KPattern(this.kpuzzle, newPatternData);
  }
  applyMove(move) {
    return this.applyTransformation(this.kpuzzle.moveToTransformation(move));
  }
  applyAlg(alg) {
    return this.applyTransformation(this.kpuzzle.algToTransformation(alg));
  }
  isIdentical(other) {
    return isPatternDataIdentical(
      this.kpuzzle,
      this.patternData,
      other.patternData
    );
  }
  /** @deprecated */
  experimentalToTransformation() {
    if (!this.kpuzzle.canConvertDefaultPatternToUniqueTransformation()) {
      return null;
    }
    const transformationData = {};
    for (const [orbitName, patternOrbitData] of Object.entries(
      this.patternData
    )) {
      const transformationOrbit = {
        permutation: patternOrbitData.pieces,
        orientationDelta: patternOrbitData.orientation
      };
      transformationData[orbitName] = transformationOrbit;
    }
    return new KTransformation(this.kpuzzle, transformationData);
  }
  experimentalIsSolved(options) {
    if (!this.kpuzzle.definition.experimentalIsPatternSolved) {
      throw new Error(
        "`KPattern.experimentalIsPatternSolved()` is not supported for this puzzle at the moment."
      );
    }
    return this.kpuzzle.definition.experimentalIsPatternSolved(this, options);
  }
};
var KPuzzle = class {
  definition;
  experimentalPGNotation;
  constructor(definition, options) {
    this.definition = definition;
    this.experimentalPGNotation = options?.experimentalPGNotation;
  }
  #indexedOrbits;
  // Note: this function is needed much more rarely than you might think. Most
  // operations related to orbits require iterating through all of them, for
  // which the following is better:
  //
  //    for (const orbitDefinition of kpuzzle.definition.orbits) { // …
  //    }
  lookupOrbitDefinition(orbitName) {
    this.#indexedOrbits ||= (() => {
      const indexedOrbits = {};
      for (const orbitDefinition of this.definition.orbits) {
        indexedOrbits[orbitDefinition.orbitName] = orbitDefinition;
      }
      return indexedOrbits;
    })();
    return this.#indexedOrbits[orbitName];
  }
  name() {
    return this.definition.name;
  }
  identityTransformation() {
    return KTransformation.experimentalConstructIdentity(this);
  }
  #moveToTransformationDataCache = /* @__PURE__ */ new Map();
  moveToTransformation(move) {
    if (typeof move === "string") {
      move = new Move(move);
    }
    const cacheKey = move.toString();
    const cachedTransformationData = this.#moveToTransformationDataCache.get(cacheKey);
    if (cachedTransformationData) {
      return new KTransformation(this, cachedTransformationData);
    }
    if (this.experimentalPGNotation) {
      const transformationData2 = this.experimentalPGNotation.lookupMove(move);
      if (!transformationData2) {
        throw new Error(`could not map to internal move: ${move}`);
      }
      this.#moveToTransformationDataCache.set(cacheKey, transformationData2);
      return new KTransformation(this, transformationData2);
    }
    const transformationData = moveToTransformationUncached(this, move);
    this.#moveToTransformationDataCache.set(cacheKey, transformationData);
    return new KTransformation(this, transformationData);
  }
  algToTransformation(alg) {
    if (typeof alg === "string") {
      alg = new Alg(alg);
    }
    return algToTransformation(alg, this);
  }
  /** @deprecated */
  toTransformation(source) {
    if (typeof source === "string") {
      return this.algToTransformation(source);
    } else if (source?.is?.(Alg)) {
      return this.algToTransformation(source);
    } else if (source?.is?.(Move)) {
      return this.moveToTransformation(source);
    } else {
      return source;
    }
  }
  defaultPattern() {
    return new KPattern(this, this.definition.defaultPattern);
  }
  #cachedCanConvertDefaultPatternToUniqueTransformation;
  // TODO: Handle incomplete default pattern data
  canConvertDefaultPatternToUniqueTransformation() {
    return this.#cachedCanConvertDefaultPatternToUniqueTransformation ??= (() => {
      for (const orbitDefinition of this.definition.orbits) {
        const pieces = new Array(orbitDefinition.numPieces).fill(false);
        for (const piece of this.definition.defaultPattern[orbitDefinition.orbitName].pieces) {
          pieces[piece] = true;
        }
        for (const piece of pieces) {
          if (!piece) {
            return false;
          }
        }
      }
      return true;
    })();
  }
};
var LazyPromise = class {
  #executor;
  constructor(executor) {
    this.#executor = executor;
  }
  #cached;
  async #getCached() {
    return this.#cached ??= Promise.resolve(this.#executor());
  }
  // Type signature from TypeScript
  // biome-ignore lint/suspicious/noThenProperty: We're implementing the `Promise` API!
  async then(onfulfilled, onrejected) {
    return this.#getCached().then(onfulfilled, onrejected);
  }
  // Type signature from TypeScript
  catch(onrejected) {
    return this.#getCached().catch(onrejected);
  }
  // Type signature from TypeScript
  async finally(onfinally) {
    return this.#getCached().finally(onfinally);
  }
  get [Symbol.toStringTag]() {
    return "LazyPromise";
  }
};
function getFaceletStickeringMask(stickeringMask, orbitName, pieceIdx, faceletIdx, hint) {
  const orbitStickeringMask = stickeringMask.orbits[orbitName];
  const pieceStickeringMask = orbitStickeringMask.pieces[pieceIdx];
  if (pieceStickeringMask === null) {
    return regular;
  }
  const faceletStickeringMask = pieceStickeringMask.facelets?.[faceletIdx];
  if (faceletStickeringMask === null) {
    return regular;
  }
  if (typeof faceletStickeringMask === "string") {
    return faceletStickeringMask;
  }
  console.log(faceletStickeringMask);
  return faceletStickeringMask.mask;
}
var PieceStickering = {
  Regular: "Regular",
  Dim: "Dim",
  Ignored: "Ignored",
  OrientationStickers: "OrientationStickers",
  Invisible: "Invisible",
  Ignoriented: "Ignoriented",
  IgnoreNonPrimary: "IgnoreNonPrimary",
  PermuteNonPrimary: "PermuteNonPrimary",
  OrientationWithoutPermutation: "OrientationWithoutPermutation",
  ExperimentalOrientationWithoutPermutation2: "ExperimentalOrientationWithoutPermutation2",
  // TODO
  Mystery: "Mystery"
  // TODO
};
var PieceAnnotation = class {
  stickerings = /* @__PURE__ */ new Map();
  constructor(kpuzzle, defaultValue) {
    for (const orbitDefinition of kpuzzle.definition.orbits) {
      this.stickerings.set(
        orbitDefinition.orbitName,
        new Array(orbitDefinition.numPieces).fill(defaultValue)
      );
    }
  }
};
var regular = "regular";
var ignored = "ignored";
var oriented = "oriented";
var experimentalOriented2 = "experimentalOriented2";
var invisible = "invisible";
var dim = "dim";
var mystery = "mystery";
var pieceStickerings = {
  // regular
  [PieceStickering.Regular]: {
    // r
    facelets: [regular, regular, regular, regular, regular]
  },
  // ignored
  [PieceStickering.Ignored]: {
    // i
    facelets: [ignored, ignored, ignored, ignored, ignored]
  },
  // oriented stickers
  [PieceStickering.OrientationStickers]: {
    // o
    facelets: [oriented, oriented, oriented, oriented, oriented]
  },
  // "OLL"
  [PieceStickering.IgnoreNonPrimary]: {
    // riiii
    facelets: [regular, ignored, ignored, ignored, ignored]
  },
  // invisible
  [PieceStickering.Invisible]: {
    // invisiblePiece
    facelets: [invisible, invisible, invisible, invisible, invisible]
  },
  // "PLL"
  [PieceStickering.PermuteNonPrimary]: {
    // drrrr
    facelets: [dim, regular, regular, regular, regular]
  },
  // ignored
  [PieceStickering.Dim]: {
    // d
    facelets: [dim, dim, dim, dim, dim]
  },
  // "OLL"
  [PieceStickering.Ignoriented]: {
    // diiii
    facelets: [dim, ignored, ignored, ignored, ignored]
  },
  [PieceStickering.OrientationWithoutPermutation]: {
    // oiiii
    facelets: [oriented, ignored, ignored, ignored, ignored]
  },
  [PieceStickering.ExperimentalOrientationWithoutPermutation2]: {
    // oiiii
    facelets: [experimentalOriented2, ignored, ignored, ignored, ignored]
  },
  [PieceStickering.Mystery]: {
    // oiiii
    facelets: [mystery, mystery, mystery, mystery, mystery]
  }
};
function getPieceStickeringMask(pieceStickering) {
  return pieceStickerings[pieceStickering];
}
var PuzzleStickering = class extends PieceAnnotation {
  constructor(kpuzzle) {
    super(kpuzzle, PieceStickering.Regular);
  }
  set(pieceSet, pieceStickering) {
    for (const [orbitName, pieces] of this.stickerings.entries()) {
      for (let i = 0; i < pieces.length; i++) {
        if (pieceSet.stickerings.get(orbitName)[i]) {
          pieces[i] = pieceStickering;
        }
      }
    }
    return this;
  }
  toStickeringMask() {
    const stickeringMask = { orbits: {} };
    for (const [orbitName, pieceStickerings2] of this.stickerings.entries()) {
      const pieces = [];
      const orbitStickeringMask = {
        pieces
      };
      stickeringMask.orbits[orbitName] = orbitStickeringMask;
      for (const pieceStickering of pieceStickerings2) {
        pieces.push(getPieceStickeringMask(pieceStickering));
      }
    }
    return stickeringMask;
  }
};
var StickeringManager = class {
  kpuzzle;
  constructor(kpuzzle) {
    this.kpuzzle = kpuzzle;
  }
  and(pieceSets) {
    const newPieceSet = new PieceAnnotation(this.kpuzzle, false);
    for (const orbitDefinition of this.kpuzzle.definition.orbits) {
      pieceLoop: for (let i = 0; i < orbitDefinition.numPieces; i++) {
        newPieceSet.stickerings.get(orbitDefinition.orbitName)[i] = true;
        for (const pieceSet of pieceSets) {
          if (!pieceSet.stickerings.get(orbitDefinition.orbitName)[i]) {
            newPieceSet.stickerings.get(orbitDefinition.orbitName)[i] = false;
            continue pieceLoop;
          }
        }
      }
    }
    return newPieceSet;
  }
  or(pieceSets) {
    const newPieceSet = new PieceAnnotation(this.kpuzzle, false);
    for (const orbitDefinition of this.kpuzzle.definition.orbits) {
      pieceLoop: for (let i = 0; i < orbitDefinition.numPieces; i++) {
        newPieceSet.stickerings.get(orbitDefinition.orbitName)[i] = false;
        for (const pieceSet of pieceSets) {
          if (pieceSet.stickerings.get(orbitDefinition.orbitName)[i]) {
            newPieceSet.stickerings.get(orbitDefinition.orbitName)[i] = true;
            continue pieceLoop;
          }
        }
      }
    }
    return newPieceSet;
  }
  not(pieceSet) {
    const newPieceSet = new PieceAnnotation(this.kpuzzle, false);
    for (const orbitDefinition of this.kpuzzle.definition.orbits) {
      for (let i = 0; i < orbitDefinition.numPieces; i++) {
        newPieceSet.stickerings.get(orbitDefinition.orbitName)[i] = !pieceSet.stickerings.get(orbitDefinition.orbitName)[i];
      }
    }
    return newPieceSet;
  }
  all() {
    return this.and(this.moves([]));
  }
  move(moveSource) {
    const transformation = this.kpuzzle.moveToTransformation(moveSource);
    const newPieceSet = new PieceAnnotation(this.kpuzzle, false);
    for (const orbitDefinition of this.kpuzzle.definition.orbits) {
      for (let i = 0; i < orbitDefinition.numPieces; i++) {
        if (transformation.transformationData[orbitDefinition.orbitName].permutation[i] !== i || transformation.transformationData[orbitDefinition.orbitName].orientationDelta[i] !== 0) {
          newPieceSet.stickerings.get(orbitDefinition.orbitName)[i] = true;
        }
      }
    }
    return newPieceSet;
  }
  moves(moveSources) {
    return moveSources.map((moveSource) => this.move(moveSource));
  }
  orbits(orbitNames) {
    const pieceSet = new PieceAnnotation(this.kpuzzle, false);
    for (const orbitName of orbitNames) {
      pieceSet.stickerings.get(orbitName).fill(true);
    }
    return pieceSet;
  }
  orbitPrefix(orbitPrefix) {
    const pieceSet = new PieceAnnotation(this.kpuzzle, false);
    for (const orbitDefinition of this.kpuzzle.definition.orbits) {
      if (orbitDefinition.orbitName.startsWith(orbitPrefix)) {
        pieceSet.stickerings.get(orbitDefinition.orbitName).fill(true);
      }
    }
    return pieceSet;
  }
  // trueCounts(pieceSet: PieceSet): Record<string, number> {
  //   const counts: Record<string, number> = {};
  //   for (const orbitDefinition of this.def.orbits) {
  //     let count = 0;
  //     for (let i = 0; i < orbitDefinition.numPieces; i++) {
  //       if (pieceSet.stickerings.get(orbitDefinition.orbitName)![i]) {
  //         count++;
  //       }
  //     }
  //     counts[orbitName] = count;
  //   }
  //   return counts;
  // }
};
var LL = "Last Layer";
var LS = "Last Slot";
var megaAnd3x3x3LL = {
  "3x3x3": LL,
  megaminx: LL
};
var megaAnd3x3x3LS = {
  "3x3x3": LS,
  megaminx: LS
};
var experimentalStickerings = {
  full: { groups: { "3x3x3": "Stickering", megaminx: "Stickering" } },
  // default
  OLL: { groups: megaAnd3x3x3LL },
  PLL: { groups: megaAnd3x3x3LL },
  LL: { groups: megaAnd3x3x3LL },
  EOLL: { groups: megaAnd3x3x3LL },
  COLL: { groups: megaAnd3x3x3LL },
  OCLL: { groups: megaAnd3x3x3LL },
  CPLL: { groups: megaAnd3x3x3LL },
  CLL: { groups: megaAnd3x3x3LL },
  EPLL: { groups: megaAnd3x3x3LL },
  ELL: { groups: megaAnd3x3x3LL },
  ZBLL: { groups: megaAnd3x3x3LL },
  LS: { groups: megaAnd3x3x3LS },
  LSOLL: { groups: megaAnd3x3x3LS },
  LSOCLL: { groups: megaAnd3x3x3LS },
  ELS: { groups: megaAnd3x3x3LS },
  CLS: { groups: megaAnd3x3x3LS },
  ZBLS: { groups: megaAnd3x3x3LS },
  VLS: { groups: megaAnd3x3x3LS },
  WVLS: { groups: megaAnd3x3x3LS },
  F2L: { groups: { "3x3x3": "CFOP (Fridrich)" } },
  Daisy: { groups: { "3x3x3": "CFOP (Fridrich)" } },
  Cross: { groups: { "3x3x3": "CFOP (Fridrich)" } },
  EO: { groups: { "3x3x3": "ZZ" } },
  EOline: { groups: { "3x3x3": "ZZ" } },
  EOcross: { groups: { "3x3x3": "ZZ" } },
  FirstBlock: { groups: { "3x3x3": "Roux" } },
  SecondBlock: { groups: { "3x3x3": "Roux" } },
  CMLL: { groups: { "3x3x3": "Roux" } },
  L10P: { groups: { "3x3x3": "Roux" } },
  L6E: { groups: { "3x3x3": "Roux" } },
  L6EO: { groups: { "3x3x3": "Roux" } },
  "2x2x2": { groups: { "3x3x3": "Petrus" } },
  "2x2x3": { groups: { "3x3x3": "Petrus" } },
  EODF: { groups: { "3x3x3": "Nautilus" } },
  G1: { groups: { "3x3x3": "FMC" } },
  L2C: {
    groups: {
      "4x4x4": "Reduction",
      "5x5x5": "Reduction",
      "6x6x6": "Reduction"
    }
  },
  OBL: { groups: { "2x2x2": "General" } },
  PBL: {
    groups: {
      "2x2x2": "Ortega"
    }
  },
  "Void Cube": { groups: { "3x3x3": "Miscellaneous" } },
  invisible: { groups: { "3x3x3": "Miscellaneous" } },
  picture: { groups: { "3x3x3": "Miscellaneous" } },
  "centers-only": { groups: { "3x3x3": "Miscellaneous" } },
  // TODO
  "opposite-centers": { groups: { "4x4x4": "Reduction" } },
  // TODO
  "experimental-centers-U": {},
  "experimental-centers-U-D": {},
  "experimental-centers-U-L-D": {},
  "experimental-centers-U-L-B-D": {},
  "experimental-centers": {},
  "experimental-fto-fc": { groups: { fto: "Bencisco" } },
  "experimental-fto-f2t": { groups: { fto: "Bencisco" } },
  "experimental-fto-sc": { groups: { fto: "Bencisco" } },
  "experimental-fto-l2c": { groups: { fto: "Bencisco" } },
  "experimental-fto-lbt": { groups: { fto: "Bencisco" } },
  "experimental-fto-l3t": { groups: { fto: "Bencisco" } }
};
async function cubeLikeStickeringMask(puzzleLoader, stickering) {
  return (await cubeLikePuzzleStickering(puzzleLoader, stickering)).toStickeringMask();
}
async function cubeLikePuzzleStickering(puzzleLoader, stickering) {
  const kpuzzle = await puzzleLoader.kpuzzle();
  const puzzleStickering = new PuzzleStickering(kpuzzle);
  const m = new StickeringManager(kpuzzle);
  const LL2 = () => m.move("U");
  const orUD = () => m.or(m.moves(["U", "D"]));
  const orLR = () => m.or(m.moves(["L", "R"]));
  const M = () => m.not(orLR());
  const F2L = () => m.not(LL2());
  const CENTERS = () => m.orbitPrefix("CENTER");
  const CENTER = (faceMove) => m.and([m.move(faceMove), CENTERS()]);
  const EDGES = () => m.orbitPrefix("EDGE");
  const EDGE = (faceMoves) => m.and([m.and(m.moves(faceMoves)), EDGES()]);
  const CORNERS = () => m.or([
    m.orbitPrefix("CORNER"),
    m.orbitPrefix("C4RNER"),
    m.orbitPrefix("C5RNER")
  ]);
  const L6E = () => m.or([M(), m.and([LL2(), EDGES()])]);
  const centerLL = () => m.and([LL2(), CENTERS()]);
  const edgeFR = () => m.and([m.and(m.moves(["F", "R"])), EDGES()]);
  const cornerDFR = () => m.and([m.and(m.moves(["F", "R"])), CORNERS(), m.not(LL2())]);
  const slotFR = () => m.or([cornerDFR(), edgeFR()]);
  function dimF2L() {
    puzzleStickering.set(F2L(), PieceStickering.Dim);
  }
  function setPLL() {
    puzzleStickering.set(LL2(), PieceStickering.PermuteNonPrimary);
    puzzleStickering.set(centerLL(), PieceStickering.Dim);
  }
  function setOLL() {
    puzzleStickering.set(LL2(), PieceStickering.IgnoreNonPrimary);
    puzzleStickering.set(centerLL(), PieceStickering.Regular);
  }
  function dimOLL() {
    puzzleStickering.set(LL2(), PieceStickering.Ignoriented);
    puzzleStickering.set(centerLL(), PieceStickering.Dim);
  }
  switch (stickering) {
    case "full":
      break;
    case "PLL": {
      dimF2L();
      setPLL();
      break;
    }
    case "CLS": {
      dimF2L();
      puzzleStickering.set(cornerDFR(), PieceStickering.Regular);
      puzzleStickering.set(LL2(), PieceStickering.Ignoriented);
      puzzleStickering.set(m.and([LL2(), CENTERS()]), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([LL2(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary
      );
      break;
    }
    case "OLL": {
      dimF2L();
      setOLL();
      break;
    }
    case "EOLL": {
      dimF2L();
      setOLL();
      puzzleStickering.set(m.and([LL2(), CORNERS()]), PieceStickering.Ignored);
      break;
    }
    case "COLL": {
      dimF2L();
      puzzleStickering.set(m.and([LL2(), EDGES()]), PieceStickering.Ignoriented);
      puzzleStickering.set(m.and([LL2(), CENTERS()]), PieceStickering.Dim);
      puzzleStickering.set(m.and([LL2(), CORNERS()]), PieceStickering.Regular);
      break;
    }
    case "OCLL": {
      dimF2L();
      dimOLL();
      puzzleStickering.set(
        m.and([LL2(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary
      );
      break;
    }
    case "CPLL": {
      dimF2L();
      puzzleStickering.set(
        m.and([CORNERS(), LL2()]),
        PieceStickering.PermuteNonPrimary
      );
      puzzleStickering.set(
        m.and([m.not(CORNERS()), LL2()]),
        PieceStickering.Dim
      );
      break;
    }
    case "CLL": {
      dimF2L();
      puzzleStickering.set(
        m.not(m.and([CORNERS(), LL2()])),
        PieceStickering.Dim
      );
      break;
    }
    case "EPLL": {
      dimF2L();
      puzzleStickering.set(LL2(), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([LL2(), EDGES()]),
        PieceStickering.PermuteNonPrimary
      );
      break;
    }
    case "ELL": {
      dimF2L();
      puzzleStickering.set(LL2(), PieceStickering.Dim);
      puzzleStickering.set(m.and([LL2(), EDGES()]), PieceStickering.Regular);
      break;
    }
    case "ELS": {
      dimF2L();
      setOLL();
      puzzleStickering.set(m.and([LL2(), CORNERS()]), PieceStickering.Ignored);
      puzzleStickering.set(edgeFR(), PieceStickering.Regular);
      puzzleStickering.set(cornerDFR(), PieceStickering.Ignored);
      break;
    }
    case "LL": {
      dimF2L();
      break;
    }
    case "F2L": {
      puzzleStickering.set(LL2(), PieceStickering.Ignored);
      break;
    }
    case "ZBLL": {
      dimF2L();
      puzzleStickering.set(LL2(), PieceStickering.PermuteNonPrimary);
      puzzleStickering.set(centerLL(), PieceStickering.Dim);
      puzzleStickering.set(m.and([LL2(), CORNERS()]), PieceStickering.Regular);
      break;
    }
    case "ZBLS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      setOLL();
      puzzleStickering.set(m.and([LL2(), CORNERS()]), PieceStickering.Ignored);
      break;
    }
    case "VLS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      setOLL();
      break;
    }
    case "WVLS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      puzzleStickering.set(m.and([LL2(), EDGES()]), PieceStickering.Ignoriented);
      puzzleStickering.set(m.and([LL2(), CENTERS()]), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([LL2(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary
      );
      break;
    }
    case "LS": {
      dimF2L();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      puzzleStickering.set(LL2(), PieceStickering.Ignored);
      puzzleStickering.set(centerLL(), PieceStickering.Dim);
      break;
    }
    case "LSOLL": {
      dimF2L();
      setOLL();
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      break;
    }
    case "LSOCLL": {
      dimF2L();
      dimOLL();
      puzzleStickering.set(
        m.and([LL2(), CORNERS()]),
        PieceStickering.IgnoreNonPrimary
      );
      puzzleStickering.set(slotFR(), PieceStickering.Regular);
      break;
    }
    case "EO": {
      puzzleStickering.set(CORNERS(), PieceStickering.Ignored);
      puzzleStickering.set(
        EDGES(),
        PieceStickering.OrientationWithoutPermutation
      );
      break;
    }
    case "EOline": {
      puzzleStickering.set(CORNERS(), PieceStickering.Ignored);
      puzzleStickering.set(
        EDGES(),
        PieceStickering.OrientationWithoutPermutation
      );
      puzzleStickering.set(m.and(m.moves(["D", "M"])), PieceStickering.Regular);
      break;
    }
    case "EOcross": {
      puzzleStickering.set(
        EDGES(),
        PieceStickering.OrientationWithoutPermutation
      );
      puzzleStickering.set(m.move("D"), PieceStickering.Regular);
      puzzleStickering.set(CORNERS(), PieceStickering.Ignored);
      break;
    }
    case "CMLL": {
      puzzleStickering.set(F2L(), PieceStickering.Dim);
      puzzleStickering.set(L6E(), PieceStickering.Ignored);
      puzzleStickering.set(m.and([LL2(), CORNERS()]), PieceStickering.Regular);
      break;
    }
    case "L10P": {
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      puzzleStickering.set(m.and([CORNERS(), LL2()]), PieceStickering.Regular);
      break;
    }
    case "L6E": {
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      break;
    }
    case "L6EO": {
      puzzleStickering.set(m.not(L6E()), PieceStickering.Dim);
      puzzleStickering.set(
        L6E(),
        PieceStickering.ExperimentalOrientationWithoutPermutation2
      );
      puzzleStickering.set(
        m.and([CENTERS(), orUD()]),
        PieceStickering.ExperimentalOrientationWithoutPermutation2
      );
      puzzleStickering.set(
        m.and([m.move("M"), m.move("E")]),
        PieceStickering.Ignored
      );
      break;
    }
    case "Daisy": {
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(CENTERS(), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([m.move("D"), CENTERS()]),
        PieceStickering.Regular
      );
      puzzleStickering.set(
        m.and([m.move("U"), EDGES()]),
        PieceStickering.IgnoreNonPrimary
      );
      break;
    }
    case "Cross": {
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(CENTERS(), PieceStickering.Dim);
      puzzleStickering.set(
        m.and([m.move("D"), CENTERS()]),
        PieceStickering.Regular
      );
      puzzleStickering.set(
        m.and([m.move("D"), EDGES()]),
        PieceStickering.Regular
      );
      break;
    }
    case "2x2x2": {
      puzzleStickering.set(
        m.or(m.moves(["U", "F", "R"])),
        PieceStickering.Ignored
      );
      puzzleStickering.set(
        m.and([m.or(m.moves(["U", "F", "R"])), CENTERS()]),
        PieceStickering.Dim
      );
      break;
    }
    case "2x2x3": {
      puzzleStickering.set(m.all(), PieceStickering.Dim);
      puzzleStickering.set(
        m.or(m.moves(["U", "F", "R"])),
        PieceStickering.Ignored
      );
      puzzleStickering.set(
        m.and([m.or(m.moves(["U", "F", "R"])), CENTERS()]),
        PieceStickering.Dim
      );
      puzzleStickering.set(
        m.and([m.move("F"), m.not(m.or(m.moves(["U", "R"])))]),
        PieceStickering.Regular
      );
      break;
    }
    case "G1": {
      puzzleStickering.set(
        m.all(),
        PieceStickering.ExperimentalOrientationWithoutPermutation2
      );
      puzzleStickering.set(
        m.or(m.moves(["E"])),
        PieceStickering.OrientationWithoutPermutation
      );
      puzzleStickering.set(m.and(m.moves(["E", "S"])), PieceStickering.Ignored);
      break;
    }
    case "L2C": {
      puzzleStickering.set(
        m.or(m.moves(["L", "R", "B", "D"])),
        PieceStickering.Dim
      );
      puzzleStickering.set(m.not(CENTERS()), PieceStickering.Ignored);
      break;
    }
    case "PBL": {
      puzzleStickering.set(m.all(), PieceStickering.Ignored);
      puzzleStickering.set(
        m.or(m.moves(["U", "D"])),
        PieceStickering.PermuteNonPrimary
      );
      break;
    }
    case "FirstBlock": {
      puzzleStickering.set(
        m.not(m.and([m.and(m.moves(["L"])), m.not(LL2())])),
        PieceStickering.Ignored
      );
      puzzleStickering.set(CENTER("R"), PieceStickering.Dim);
      break;
    }
    case "SecondBlock": {
      puzzleStickering.set(
        m.not(m.and([m.and(m.moves(["L"])), m.not(LL2())])),
        PieceStickering.Ignored
      );
      puzzleStickering.set(
        m.and([m.and(m.moves(["L"])), m.not(LL2())]),
        PieceStickering.Dim
      );
      puzzleStickering.set(
        m.and([m.and(m.moves(["R"])), m.not(LL2())]),
        PieceStickering.Regular
      );
      break;
    }
    case "EODF": {
      dimF2L();
      puzzleStickering.set(
        m.or([cornerDFR(), m.and([LL2(), CORNERS()])]),
        PieceStickering.Ignored
      );
      puzzleStickering.set(
        m.or([m.and([LL2(), EDGES()]), edgeFR()]),
        PieceStickering.OrientationWithoutPermutation
      );
      puzzleStickering.set(EDGE(["D", "F"]), PieceStickering.Regular);
      puzzleStickering.set(CENTER("F"), PieceStickering.Regular);
      break;
    }
    case "Void Cube": {
      puzzleStickering.set(CENTERS(), PieceStickering.Invisible);
      break;
    }
    case "picture":
    // fallthrough
    case "invisible": {
      puzzleStickering.set(m.all(), PieceStickering.Invisible);
      break;
    }
    case "centers-only": {
      puzzleStickering.set(m.not(CENTERS()), PieceStickering.Ignored);
      break;
    }
    case "opposite-centers": {
      puzzleStickering.set(
        m.not(m.and([CENTERS(), m.or(m.moves(["U", "D"]))])),
        PieceStickering.Ignored
      );
      break;
    }
    case "OBL": {
      puzzleStickering.set(
        m.or(m.moves(["U", "D"])),
        PieceStickering.IgnoreNonPrimary
      );
      break;
    }
    default:
      console.warn(
        `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`
      );
      puzzleStickering.set(m.and(m.moves([])), PieceStickering.Dim);
  }
  return puzzleStickering;
}
async function cubeLikeStickeringList(puzzleID, options) {
  const stickerings = [];
  const stickeringsFallback = [];
  for (const [name, info] of Object.entries(experimentalStickerings)) {
    if (info.groups) {
      if (puzzleID in info.groups) {
        stickerings.push(name);
      } else if (options?.use3x3x3Fallbacks && "3x3x3" in info.groups) {
        stickeringsFallback.push(name);
      }
    }
  }
  return stickerings.concat(stickeringsFallback);
}
function getCached(getValue) {
  const lazyPromise = new LazyPromise(getValue);
  return () => lazyPromise;
}
async function asyncGetPuzzleGeometry(puzzleName) {
  const puzzleGeometry = await __vitePreload(() => import("./index-BALLIX6B.js"), true ? [] : void 0);
  return puzzleGeometry.getPuzzleGeometryByName(puzzleName, {
    allMoves: true,
    orientCenters: true,
    addRotations: true
  });
}
async function asyncGetBasePuzzleGeometry(puzzleName) {
  const puzzleGeometry = await __vitePreload(() => import("./index-BALLIX6B.js"), true ? [] : void 0);
  return puzzleGeometry.getPuzzleGeometryByName(puzzleName);
}
async function asyncGetKPuzzle(pgPromise, puzzleName, setOrientationModTo1ForPiecesOfOrbits) {
  const pg = await pgPromise;
  const kpuzzleDefinition = pg.getKPuzzleDefinition(true);
  kpuzzleDefinition.name = puzzleName;
  const puzzleGeometry = await __vitePreload(() => import("./index-BALLIX6B.js"), true ? [] : void 0);
  const pgNotation = new puzzleGeometry.ExperimentalPGNotation(
    pg,
    pg.getOrbitsDef(true)
  );
  if (setOrientationModTo1ForPiecesOfOrbits) {
    const setOrientationModTo1ForPiecesOfOrbitsSet = new Set(
      setOrientationModTo1ForPiecesOfOrbits
    );
    for (const [orbitName, orbitData] of Object.entries(
      kpuzzleDefinition.defaultPattern
    )) {
      if (setOrientationModTo1ForPiecesOfOrbitsSet.has(orbitName)) {
        orbitData.orientationMod = new Array(
          orbitData.pieces.length
          // TODO: get this from the orbit definition, especially once we allow empty entries.
        ).fill(1);
      }
    }
  }
  return new KPuzzle(pgNotation.remapKPuzzleDefinition(kpuzzleDefinition), {
    experimentalPGNotation: pgNotation
  });
}
var PGPuzzleLoader = class {
  pgId;
  id;
  fullName;
  inventedBy;
  inventionYear;
  #setOrientationModTo1ForPiecesOfOrbits;
  //  // TODO: make this unhacky
  constructor(info) {
    this.pgId = info.pgID;
    this.id = info.id;
    this.fullName = info.fullName;
    this.inventedBy = info.inventedBy;
    this.inventionYear = info.inventionYear;
    this.#setOrientationModTo1ForPiecesOfOrbits = info.setOrientationModTo1ForPiecesOfOrbits;
  }
  #cachedPG;
  pg() {
    return this.#cachedPG ??= asyncGetPuzzleGeometry(this.pgId ?? this.id);
  }
  #cachedBasePG;
  basePG() {
    return this.#cachedBasePG ??= asyncGetBasePuzzleGeometry(
      this.pgId ?? this.id
    );
  }
  #cachedKPuzzle;
  kpuzzle() {
    return this.#cachedKPuzzle ??= asyncGetKPuzzle(
      this.pg(),
      this.id,
      this.#setOrientationModTo1ForPiecesOfOrbits
    );
  }
  #cachedSVG;
  svg() {
    return this.#cachedSVG ??= (async () => (await this.pg()).generatesvg())();
  }
  puzzleSpecificSimplifyOptionsPromise = puzzleSpecificSimplifyOptionsPromise(
    this.kpuzzle.bind(this)
  );
};
var CubePGPuzzleLoader = class extends PGPuzzleLoader {
  stickeringMask(stickering) {
    return cubeLikeStickeringMask(this, stickering);
  }
  stickerings = () => cubeLikeStickeringList(this.id, { use3x3x3Fallbacks: true });
  algTransformData = cubeMirrorTransforms;
};
function puzzleSpecificSimplifyOptionsPromise(kpuzzlePromiseFn) {
  return new LazyPromise(async () => {
    const kpuzzle = await kpuzzlePromiseFn();
    return {
      quantumMoveOrder: (m) => {
        return kpuzzle.moveToTransformation(new Move(m)).repetitionOrder();
      }
    };
  });
}
var cube3x3x3KPuzzleDefinition = {
  name: "3x3x3",
  orbits: [
    { orbitName: "EDGES", numPieces: 12, numOrientations: 2 },
    { orbitName: "CORNERS", numPieces: 8, numOrientations: 3 },
    { orbitName: "CENTERS", numPieces: 6, numOrientations: 4 }
  ],
  defaultPattern: {
    EDGES: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    },
    CORNERS: {
      pieces: [0, 1, 2, 3, 4, 5, 6, 7],
      orientation: [0, 0, 0, 0, 0, 0, 0, 0]
    },
    CENTERS: {
      pieces: [0, 1, 2, 3, 4, 5],
      orientation: [0, 0, 0, 0, 0, 0],
      orientationMod: [1, 1, 1, 1, 1, 1]
    }
  },
  moves: {
    U: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 8, 9, 10, 11],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [1, 0, 0, 0, 0, 0]
      }
    },
    y: {
      EDGES: {
        permutation: [1, 2, 3, 0, 5, 6, 7, 4, 10, 8, 11, 9],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 7, 4, 5, 6],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientationDelta: [1, 0, 0, 0, 0, 3]
      }
    },
    x: {
      EDGES: {
        permutation: [4, 8, 0, 9, 6, 10, 2, 11, 5, 7, 1, 3],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [4, 0, 3, 5, 7, 6, 2, 1],
        orientationDelta: [2, 1, 2, 1, 1, 2, 1, 2]
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientationDelta: [0, 3, 0, 1, 2, 2]
      }
    },
    L: {
      EDGES: {
        permutation: [0, 1, 2, 11, 4, 5, 6, 9, 8, 3, 10, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientationDelta: [0, 0, 2, 1, 0, 2, 1, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 1, 0, 0, 0, 0]
      }
    },
    F: {
      EDGES: {
        permutation: [9, 1, 2, 3, 8, 5, 6, 7, 0, 4, 10, 11],
        orientationDelta: [1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0]
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientationDelta: [1, 0, 0, 2, 2, 1, 0, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 1, 0, 0, 0]
      }
    },
    R: {
      EDGES: {
        permutation: [0, 8, 2, 3, 4, 10, 6, 7, 5, 9, 1, 11],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientationDelta: [2, 1, 0, 0, 1, 0, 0, 2]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 0, 1, 0, 0]
      }
    },
    B: {
      EDGES: {
        permutation: [0, 1, 10, 3, 4, 5, 11, 7, 8, 9, 6, 2],
        orientationDelta: [0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1]
      },
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientationDelta: [0, 2, 1, 0, 0, 0, 2, 1]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 0, 0, 1, 0]
      }
    },
    D: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 8, 9, 10, 11],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 1, 2, 3, 4, 5],
        orientationDelta: [0, 0, 0, 0, 0, 1]
      }
    },
    z: {
      EDGES: {
        permutation: [9, 3, 11, 7, 8, 1, 10, 5, 0, 4, 2, 6],
        orientationDelta: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [3, 2, 6, 5, 0, 4, 7, 1],
        orientationDelta: [1, 2, 1, 2, 2, 1, 2, 1]
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientationDelta: [1, 1, 1, 1, 3, 1]
      }
    },
    M: {
      EDGES: {
        permutation: [2, 1, 6, 3, 0, 5, 4, 7, 8, 9, 10, 11],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientationDelta: [2, 0, 0, 0, 2, 0]
      }
    },
    E: {
      EDGES: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7, 9, 11, 8, 10],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientationDelta: [0, 0, 0, 0, 0, 0]
      }
    },
    S: {
      EDGES: {
        permutation: [0, 3, 2, 7, 4, 1, 6, 5, 8, 9, 10, 11],
        orientationDelta: [0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientationDelta: [1, 1, 0, 1, 0, 1]
      }
    },
    u: {
      EDGES: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7, 10, 8, 11, 9],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [1, 2, 3, 0, 4, 5, 6, 7],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 2, 3, 4, 1, 5],
        orientationDelta: [1, 0, 0, 0, 0, 0]
      }
    },
    l: {
      EDGES: {
        permutation: [2, 1, 6, 11, 0, 5, 4, 9, 8, 3, 10, 7],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [0, 1, 6, 2, 4, 3, 5, 7],
        orientationDelta: [0, 0, 2, 1, 0, 2, 1, 0]
      },
      CENTERS: {
        permutation: [4, 1, 0, 3, 5, 2],
        orientationDelta: [2, 1, 0, 0, 2, 0]
      }
    },
    f: {
      EDGES: {
        permutation: [9, 3, 2, 7, 8, 1, 6, 5, 0, 4, 10, 11],
        orientationDelta: [1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 0]
      },
      CORNERS: {
        permutation: [3, 1, 2, 5, 0, 4, 6, 7],
        orientationDelta: [1, 0, 0, 2, 2, 1, 0, 0]
      },
      CENTERS: {
        permutation: [1, 5, 2, 0, 4, 3],
        orientationDelta: [1, 1, 1, 1, 0, 1]
      }
    },
    r: {
      EDGES: {
        permutation: [4, 8, 0, 3, 6, 10, 2, 7, 5, 9, 1, 11],
        orientationDelta: [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0]
      },
      CORNERS: {
        permutation: [4, 0, 2, 3, 7, 5, 6, 1],
        orientationDelta: [2, 1, 0, 0, 1, 0, 0, 2]
      },
      CENTERS: {
        permutation: [2, 1, 5, 3, 0, 4],
        orientationDelta: [0, 0, 0, 1, 2, 2]
      }
    },
    b: {
      EDGES: {
        permutation: [0, 5, 10, 1, 4, 7, 11, 3, 8, 9, 6, 2],
        orientationDelta: [0, 1, 1, 1, 0, 1, 1, 1, 0, 0, 1, 1]
      },
      CORNERS: {
        permutation: [0, 7, 1, 3, 4, 5, 2, 6],
        orientationDelta: [0, 2, 1, 0, 0, 0, 2, 1]
      },
      CENTERS: {
        permutation: [3, 0, 2, 5, 4, 1],
        orientationDelta: [3, 3, 0, 3, 1, 3]
      }
    },
    d: {
      EDGES: {
        permutation: [0, 1, 2, 3, 7, 4, 5, 6, 9, 11, 8, 10],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1]
      },
      CORNERS: {
        permutation: [0, 1, 2, 3, 5, 6, 7, 4],
        orientationDelta: [0, 0, 0, 0, 0, 0, 0, 0]
      },
      CENTERS: {
        permutation: [0, 4, 1, 2, 3, 5],
        orientationDelta: [0, 0, 0, 0, 0, 1]
      }
    }
  },
  derivedMoves: {
    Uw: "u",
    Lw: "l",
    Fw: "f",
    Rw: "r",
    Bw: "b",
    Dw: "d",
    Uv: "y",
    Lv: "x'",
    Fv: "z",
    Rv: "x",
    Bv: "z'",
    Dv: "y'",
    "2U": "u U'",
    "2L": "l L'",
    "2F": "f F'",
    "2R": "r R'",
    "2B": "b B'",
    "2D": "d D'"
  }
};
function puzzleOrientation3x3x3Idx(pattern) {
  const idxU = pattern.patternData["CENTERS"].pieces[0];
  const idxD = pattern.patternData["CENTERS"].pieces[5];
  const unadjustedIdxL = pattern.patternData["CENTERS"].pieces[1];
  let idxL = unadjustedIdxL;
  if (idxU < unadjustedIdxL) {
    idxL--;
  }
  if (idxD < unadjustedIdxL) {
    idxL--;
  }
  return [idxU, idxL];
}
var puzzleOrientationCacheRaw = new Array(6).fill(0).map(() => {
  return new Array(6);
});
function puzzleOrientation3x3x3Cache() {
  {
    {
      const uAlgs = ["", "z", "x", "z'", "x'", "x2"].map(
        (s) => Alg.fromString(s)
      );
      const yAlg = new Alg("y");
      for (const uAlg of uAlgs) {
        let transformation = experimental3x3x3KPuzzle.algToTransformation(uAlg);
        for (let i = 0; i < 4; i++) {
          transformation = transformation.applyAlg(yAlg);
          const [idxU, idxL] = puzzleOrientation3x3x3Idx(
            transformation.toKPattern()
          );
          puzzleOrientationCacheRaw[idxU][idxL] = transformation.invert();
        }
      }
    }
  }
  return puzzleOrientationCacheRaw;
}
function normalize3x3x3Orientation(pattern) {
  const [idxU, idxL] = puzzleOrientation3x3x3Idx(pattern);
  const orientationTransformation = puzzleOrientation3x3x3Cache()[idxU][idxL];
  return pattern.applyTransformation(orientationTransformation);
}
function experimentalIs3x3x3Solved(pattern, options) {
  if (options.ignorePuzzleOrientation) {
    pattern = normalize3x3x3Orientation(pattern);
  }
  if (options.ignoreCenterOrientation) {
    pattern = new KPattern(pattern.kpuzzle, {
      EDGES: pattern.patternData["EDGES"],
      CORNERS: pattern.patternData["CORNERS"],
      CENTERS: {
        pieces: pattern.patternData["CENTERS"].pieces,
        orientation: new Array(6).fill(0)
      }
    });
  }
  return !!pattern.experimentalToTransformation()?.isIdentityTransformation();
}
async function getPartialAppendOptionsForPuzzleSpecificSimplifyOptions(puzzleLoader) {
  const puzzleSpecificSimplifyOptions = await (puzzleLoader.puzzleSpecificSimplifyOptions ?? puzzleLoader.puzzleSpecificSimplifyOptionsPromise);
  if (!puzzleSpecificSimplifyOptions) {
    return {};
  }
  return { puzzleLoader: { puzzleSpecificSimplifyOptions } };
}
var TransformAlg = class extends TraversalDownUp {
  traverseAlg(alg, dataDown) {
    const algNodes = [];
    for (const algNode of alg.childAlgNodes()) {
      algNodes.push(this.traverseAlgNode(algNode, dataDown));
    }
    return new Alg(algNodes);
  }
  traverseGrouping(grouping, dataDown) {
    return grouping.modified({ alg: this.traverseAlg(grouping.alg, dataDown) });
  }
  traverseMove(move, dataDown) {
    const invert = (() => {
      const { invertExceptByFamily } = dataDown;
      if (!invertExceptByFamily) {
        return false;
      }
      return !invertExceptByFamily.has(move.family);
    })();
    return move.modified({
      amount: invert ? -move.amount : move.amount,
      family: dataDown.replaceMovesByFamily[move.family] ?? move.family
    });
  }
  traverseCommutator(commutator, dataDown) {
    return new Commutator(
      this.traverseAlg(commutator.A, dataDown),
      this.traverseAlg(commutator.B, dataDown)
    );
  }
  traverseConjugate(conjugate, dataDown) {
    return new Conjugate(
      this.traverseAlg(conjugate.A, dataDown),
      this.traverseAlg(conjugate.B, dataDown)
    );
  }
  // TODO: Remove spaces between repeated pauses (in traverseSequence)
  traversePause(pause, _dataDown) {
    return pause;
  }
  traverseNewline(newLine, _dataDown) {
    return newLine;
  }
  // TODO: Enforce being followed by a newline (or the end of the alg)?
  traverseLineComment(comment, _dataDown) {
    return comment;
  }
};
functionFromTraversal(TransformAlg);
async function descAsyncGetPuzzleGeometry(desc, options) {
  const puzzleGeometry = await __vitePreload(() => import("./index-BALLIX6B.js"), true ? [] : void 0);
  return puzzleGeometry.getPuzzleGeometryByDesc(desc, {
    allMoves: options?.allMoves ?? true,
    orientCenters: options?.orientCenters ?? true,
    addRotations: options?.addRotations ?? true,
    ...options
  });
}
async function asyncGetKPuzzleByDesc(desc, options) {
  const pgPromise = descAsyncGetPuzzleGeometry(desc, options);
  return asyncGetKPuzzle(pgPromise, `description: ${desc}`);
}
var nextCustomID = 1;
function customPGPuzzleLoader(desc, info) {
  const customID = nextCustomID++;
  let cachedKPuzzle = null;
  const kpuzzlePromiseFn = async () => {
    return cachedKPuzzle ??= asyncGetKPuzzleByDesc(desc);
  };
  const puzzleLoader = {
    id: `custom-${customID}`,
    fullName: info?.fullName ?? `Custom Puzzle (instance #${customID})`,
    kpuzzle: kpuzzlePromiseFn,
    svg: async () => {
      const pg = await descAsyncGetPuzzleGeometry(desc);
      return pg.generatesvg();
    },
    pg: async () => {
      return descAsyncGetPuzzleGeometry(desc);
    },
    basePG: async () => {
      return descAsyncGetPuzzleGeometry(desc, {
        allMoves: false,
        orientCenters: false,
        addRotations: false
      });
    },
    puzzleSpecificSimplifyOptionsPromise: puzzleSpecificSimplifyOptionsPromise(kpuzzlePromiseFn)
  };
  return puzzleLoader;
}
function puzzleOrientation2x2x2Idx(pattern) {
  const inverse = pattern.experimentalToTransformation().invert();
  const inverseDFL = inverse.transformationData["CORNERS"];
  return inverseDFL.permutation[6] * 3 + inverseDFL.orientationDelta[6];
}
var puzzleOrientationCacheRaw2 = new Array(24);
function puzzleOrientation2x2x2Cache(kpuzzle) {
  {
    {
      const uAlgs = ["", "z", "x", "z'", "x'", "x2"].map(
        (s) => Alg.fromString(s)
      );
      const yAlg = new Alg("y");
      for (const uAlg of uAlgs) {
        let transformation = kpuzzle.algToTransformation(uAlg);
        for (let i = 0; i < 4; i++) {
          transformation = transformation.applyAlg(yAlg);
          const idx = puzzleOrientation2x2x2Idx(transformation.toKPattern());
          puzzleOrientationCacheRaw2[idx] = {
            transformation: transformation.invert(),
            alg: uAlg.concat(yAlg)
          };
        }
      }
    }
  }
  return puzzleOrientationCacheRaw2;
}
function normalize2x2x2Orientation(pattern) {
  const idx = puzzleOrientation2x2x2Idx(pattern);
  const { transformation, alg } = puzzleOrientation2x2x2Cache(pattern.kpuzzle)[idx];
  return {
    normalizedPattern: pattern.applyTransformation(transformation),
    normalizationAlg: alg.invert()
  };
}
function experimentalIs2x2x2Solved(pattern, options) {
  if (options.ignorePuzzleOrientation) {
    pattern = normalize2x2x2Orientation(pattern).normalizedPattern;
  }
  return !!pattern.experimentalToTransformation().isIdentityTransformation();
}
var experimental3x3x3KPuzzle = new KPuzzle(
  cube3x3x3KPuzzleDefinition
);
cube3x3x3KPuzzleDefinition.experimentalIsPatternSolved = experimentalIs3x3x3Solved;
var bigCubePuzzleOrientation = getCached(
  () => __vitePreload(() => import("./big-puzzle-orientation-KJL4OFV2-E-uzFFK6.js"), true ? [] : void 0)
);
var cube3x3x3KeyMapping = {
  KeyI: new Move("R"),
  KeyK: new Move("R'"),
  KeyW: new Move("B"),
  KeyO: new Move("B'"),
  KeyS: new Move("D"),
  KeyL: new Move("D'"),
  KeyD: new Move("L"),
  KeyE: new Move("L'"),
  KeyJ: new Move("U"),
  KeyF: new Move("U'"),
  KeyH: new Move("F"),
  KeyG: new Move("F'"),
  KeyC: new Move("l"),
  KeyR: new Move("l'"),
  KeyU: new Move("r"),
  KeyM: new Move("r'"),
  KeyX: new Move("d"),
  Comma: new Move("d'"),
  KeyT: new Move("x"),
  KeyY: new Move("x"),
  KeyV: new Move("x'"),
  KeyN: new Move("x'"),
  Semicolon: new Move("y"),
  KeyA: new Move("y'"),
  KeyP: new Move("z"),
  KeyQ: new Move("z'"),
  KeyZ: new Move("M'"),
  KeyB: new Move("M"),
  Period: new Move("M'"),
  Backquote: new Pause()
};
var Axis = {
  X: "x axis",
  Y: "y axis",
  Z: "z axis"
};
var MoveSourceType = {
  INDEXABLE_SLICE_NEAR: 0,
  INDEXABLE_SLICE_FAR: 1,
  INDEXABLE_WIDE_NEAR: 2,
  INDEXABLE_WIDE_FAR: 3,
  SPECIFIC_SLICE: 4,
  ROTATION: 5
};
function makeSourceInfo(moveStrings, type, from, to) {
  const output = [];
  for (const moveString of moveStrings) {
    const move = Move.fromString(moveString);
    const { family, amount: direction } = move;
    if (![-1, 1].includes(direction)) {
      throw new Error("Invalid config move");
    }
    output.push({ family, direction, type, from, to });
  }
  return output;
}
var axisInfos = {
  [Axis.X]: {
    sliceDiameter: 3,
    extendsThroughEntirePuzzle: true,
    moveSourceInfos: [
      ...makeSourceInfo(["R"], MoveSourceType.INDEXABLE_SLICE_NEAR, 0, 3),
      ...makeSourceInfo(["L'"], MoveSourceType.INDEXABLE_SLICE_FAR, 0, 3),
      ...makeSourceInfo(["r", "Rw"], MoveSourceType.INDEXABLE_WIDE_NEAR, 0, 2),
      ...makeSourceInfo(["l'", "Lw'"], MoveSourceType.INDEXABLE_WIDE_FAR, 0, 2),
      ...makeSourceInfo(["M'"], MoveSourceType.SPECIFIC_SLICE, 1, 2),
      // TODO: remove some indices?
      ...makeSourceInfo(["x", "Uv", "Dv'"], MoveSourceType.ROTATION, 0, 3)
      // TODO: remove some indices?
    ]
  },
  [Axis.Y]: {
    sliceDiameter: 3,
    extendsThroughEntirePuzzle: true,
    moveSourceInfos: [
      ...makeSourceInfo(["U"], MoveSourceType.INDEXABLE_SLICE_NEAR, 0, 3),
      ...makeSourceInfo(["D'"], MoveSourceType.INDEXABLE_SLICE_FAR, 0, 3),
      ...makeSourceInfo(["u", "Uw"], MoveSourceType.INDEXABLE_WIDE_NEAR, 0, 2),
      ...makeSourceInfo(["d'", "Dw'"], MoveSourceType.INDEXABLE_WIDE_FAR, 0, 2),
      ...makeSourceInfo(["E'"], MoveSourceType.SPECIFIC_SLICE, 1, 2),
      // TODO: remove some indices?
      ...makeSourceInfo(["y", "Uv", "Dv'"], MoveSourceType.ROTATION, 0, 3)
      // TODO: remove some indices?
    ]
  },
  [Axis.Z]: {
    sliceDiameter: 3,
    extendsThroughEntirePuzzle: true,
    moveSourceInfos: [
      ...makeSourceInfo(["F"], MoveSourceType.INDEXABLE_SLICE_NEAR, 0, 3),
      ...makeSourceInfo(["B'"], MoveSourceType.INDEXABLE_SLICE_FAR, 0, 3),
      ...makeSourceInfo(["f", "Fw"], MoveSourceType.INDEXABLE_WIDE_NEAR, 0, 3),
      ...makeSourceInfo(["b'", "Bw'"], MoveSourceType.INDEXABLE_WIDE_FAR, 0, 3),
      ...makeSourceInfo(["S"], MoveSourceType.SPECIFIC_SLICE, 1, 2),
      // TODO: remove some indices?
      ...makeSourceInfo(["z", "Fv", "Bv'"], MoveSourceType.ROTATION, 0, 3)
      // TODO: remove some indices?
    ]
  }
};
var byFamily = {};
for (const [axis, info] of Object.entries(axisInfos)) {
  for (const moveSourceInfo of info.moveSourceInfos) {
    byFamily[moveSourceInfo.family] = { axis, moveSourceInfo };
  }
}
var byAxisThenType = {};
for (const axis of Object.keys(axisInfos)) {
  const entry = {};
  byAxisThenType[axis] = entry;
  for (const moveSourceInfo of axisInfos[axis].moveSourceInfos) {
    (entry[moveSourceInfo.type] ??= []).push(moveSourceInfo);
  }
}
var byAxisThenSpecificSlices = {};
for (const axis of Object.keys(axisInfos)) {
  const entry = /* @__PURE__ */ new Map();
  byAxisThenSpecificSlices[axis] = entry;
  for (const moveSourceInfo of axisInfos[axis].moveSourceInfos) {
    if (!entry.get(moveSourceInfo.from)) {
      entry.set(moveSourceInfo.from, moveSourceInfo);
    }
  }
}
function firstOfType(axis, moveSourceType) {
  const entry = byAxisThenType[axis][moveSourceType]?.[0];
  if (!entry) {
    throw new Error(
      `Could not find a reference move (axis: ${axis}, move source type: ${moveSourceType})`
    );
  }
  return entry;
}
var areQuantumMovesSameAxis = (quantumMove1, quantumMove2) => {
  return byFamily[quantumMove1.family].axis === byFamily[quantumMove2.family].axis;
};
function simplestMove(axis, from, to, directedAmount) {
  if (from + 1 === to) {
    const sliceSpecificInfo = byAxisThenSpecificSlices[axis].get(from);
    if (sliceSpecificInfo) {
      return new Move(
        new QuantumMove(sliceSpecificInfo.family),
        directedAmount * sliceSpecificInfo.direction
      );
    }
  }
  const axisInfo = axisInfos[axis];
  const { sliceDiameter } = axisInfo;
  if (from === 0 && to === sliceDiameter) {
    const moveSourceInfo2 = firstOfType(axis, MoveSourceType.ROTATION);
    return new Move(
      new QuantumMove(moveSourceInfo2.family),
      directedAmount * moveSourceInfo2.direction
    );
  }
  const far = from + to > sliceDiameter;
  if (far) {
    [from, to] = [sliceDiameter - to, sliceDiameter - from];
  }
  let outerLayer = from + 1;
  let innerLayer = to;
  const slice = outerLayer === innerLayer;
  if (slice) {
    innerLayer = null;
  }
  if (outerLayer === 1) {
    outerLayer = null;
  }
  if (slice && outerLayer === 1) {
    innerLayer = null;
  }
  if (!slice && innerLayer === 2) {
    innerLayer = null;
  }
  const moveSourceType = slice ? far ? MoveSourceType.INDEXABLE_SLICE_FAR : MoveSourceType.INDEXABLE_SLICE_NEAR : far ? MoveSourceType.INDEXABLE_WIDE_FAR : MoveSourceType.INDEXABLE_WIDE_NEAR;
  const moveSourceInfo = firstOfType(axis, moveSourceType);
  return new Move(
    new QuantumMove(moveSourceInfo.family, innerLayer, outerLayer),
    directedAmount * moveSourceInfo.direction
  );
}
function simplifySameAxisMoves(moves, quantumMod = true) {
  if (moves.length === 0) {
    return [];
  }
  const axis = byFamily[moves[0].family].axis;
  const axisInfo = axisInfos[axis];
  const { sliceDiameter } = axisInfo;
  const sliceDeltas = /* @__PURE__ */ new Map();
  let lastCandidateRange = null;
  function adjustValue(idx, relativeDelta) {
    let newDelta = (sliceDeltas.get(idx) ?? 0) + relativeDelta;
    if (quantumMod) {
      newDelta = newDelta % 4 + 5 % 4 - 1;
    }
    if (newDelta === 0) {
      sliceDeltas.delete(idx);
    } else {
      sliceDeltas.set(idx, newDelta);
    }
  }
  let suffixLength = 0;
  for (const move of Array.from(moves).reverse()) {
    suffixLength++;
    const { moveSourceInfo } = byFamily[move.family];
    const directedAmount2 = move.amount * moveSourceInfo.direction;
    switch (moveSourceInfo.type) {
      case MoveSourceType.INDEXABLE_SLICE_NEAR: {
        const idx = (move.innerLayer ?? 1) - 1;
        adjustValue(idx, directedAmount2);
        adjustValue(idx + 1, -directedAmount2);
        break;
      }
      case MoveSourceType.INDEXABLE_SLICE_FAR: {
        const idx = sliceDiameter - (move.innerLayer ?? 1);
        adjustValue(idx, directedAmount2);
        adjustValue(idx + 1, -directedAmount2);
        break;
      }
      case MoveSourceType.INDEXABLE_WIDE_NEAR: {
        adjustValue((move.outerLayer ?? 1) - 1, directedAmount2);
        adjustValue(move.innerLayer ?? 2, -directedAmount2);
        break;
      }
      case MoveSourceType.INDEXABLE_WIDE_FAR: {
        adjustValue(sliceDiameter - (move.innerLayer ?? 2), directedAmount2);
        adjustValue(
          sliceDiameter - ((move.outerLayer ?? 1) - 1),
          -directedAmount2
        );
        break;
      }
      case MoveSourceType.SPECIFIC_SLICE: {
        adjustValue(moveSourceInfo.from, directedAmount2);
        adjustValue(moveSourceInfo.to, -directedAmount2);
        break;
      }
      case MoveSourceType.ROTATION: {
        adjustValue(0, directedAmount2);
        adjustValue(sliceDiameter, -directedAmount2);
        break;
      }
    }
    if ([0, 2].includes(sliceDeltas.size)) {
      lastCandidateRange = { suffixLength, sliceDeltas: new Map(sliceDeltas) };
    }
  }
  if (sliceDeltas.size === 0) {
    return [];
  }
  if (!lastCandidateRange) {
    return moves;
  }
  let [from, to] = lastCandidateRange.sliceDeltas.keys();
  if (from > to) {
    [from, to] = [to, from];
  }
  const directedAmount = lastCandidateRange.sliceDeltas.get(from);
  return [
    ...moves.slice(0, -lastCandidateRange.suffixLength),
    ...directedAmount !== 0 ? [simplestMove(axis, from, to, directedAmount)] : []
  ];
}
var puzzleSpecificSimplifyOptions333 = {
  quantumMoveOrder: () => 4,
  // doQuantumMovesCommute: areQuantumMovesSameAxis,
  axis: { areQuantumMovesSameAxis, simplifySameAxisMoves }
};
var cubeMirrorTransforms = {
  "↔ Mirror (M)": {
    replaceMovesByFamily: {
      L: "R",
      R: "L",
      l: "r",
      r: "l",
      Lw: "Rw",
      Rw: "Lw",
      Lv: "Rv",
      Rv: "Lv"
    },
    invertExceptByFamily: /* @__PURE__ */ new Set(["x", "M", "m"])
  },
  "⤢ Mirror (S)": {
    replaceMovesByFamily: {
      F: "B",
      B: "F",
      f: "b",
      b: "f",
      Fw: "Bw",
      Bw: "Fw",
      Fv: "Bv",
      Bv: "Fv"
    },
    invertExceptByFamily: /* @__PURE__ */ new Set(["z", "S", "s"])
  },
  "↕ Mirror (E)": {
    replaceMovesByFamily: {
      U: "D",
      D: "U",
      u: "d",
      d: "u",
      Uw: "Dw",
      Dw: "Uw",
      Uv: "Dv",
      Dv: "Uv"
    },
    invertExceptByFamily: /* @__PURE__ */ new Set(["y", "E", "e"])
  }
};
var cube3x3x3 = {
  id: "3x3x3",
  fullName: "3×3×3 Cube",
  inventedBy: ["Ernő Rubik"],
  inventionYear: 1974,
  // https://en.wikipedia.org/wiki/Rubik%27s_Cube#Conception_and_development
  kpuzzle: getCached(async () => {
    return experimental3x3x3KPuzzle;
  }),
  svg: getCached(async () => {
    return (await __vitePreload(async () => {
      const { cube3x3x3SVG } = await import("./puzzles-dynamic-3x3x3-CMH2HHH5-D3ZlBYSD.js");
      return { cube3x3x3SVG };
    }, true ? [] : void 0)).cube3x3x3SVG;
  }),
  llSVG: getCached(async () => {
    return (await __vitePreload(async () => {
      const { cube3x3x3LLSVG } = await import("./puzzles-dynamic-3x3x3-CMH2HHH5-D3ZlBYSD.js");
      return { cube3x3x3LLSVG };
    }, true ? [] : void 0)).cube3x3x3LLSVG;
  }),
  llFaceSVG: getCached(async () => {
    return (await __vitePreload(async () => {
      const { cube3x3x3LLFaceSVG } = await import("./puzzles-dynamic-3x3x3-CMH2HHH5-D3ZlBYSD.js");
      return { cube3x3x3LLFaceSVG };
    }, true ? [] : void 0)).cube3x3x3LLFaceSVG;
  }),
  pg: getCached(async () => {
    return asyncGetPuzzleGeometry("3x3x3");
  }),
  stickeringMask: (stickering) => cubeLikeStickeringMask(cube3x3x3, stickering),
  stickerings: () => cubeLikeStickeringList("3x3x3"),
  puzzleSpecificSimplifyOptions: puzzleSpecificSimplifyOptions333,
  keyMapping: async () => cube3x3x3KeyMapping,
  // TODO: async loading
  algTransformData: cubeMirrorTransforms
};
var wcaEvents = {
  "333": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Cube",
    scramblesImplemented: "random-state"
  },
  "222": {
    puzzleID: "2x2x2",
    eventName: "2x2x2 Cube",
    scramblesImplemented: "random-state"
  },
  "444": {
    puzzleID: "4x4x4",
    eventName: "4x4x4 Cube",
    scramblesImplemented: "random-state"
  },
  "555": {
    puzzleID: "5x5x5",
    eventName: "5x5x5 Cube",
    scramblesImplemented: "random-moves"
  },
  "666": {
    puzzleID: "6x6x6",
    eventName: "6x6x6 Cube",
    scramblesImplemented: "random-moves"
  },
  "777": {
    puzzleID: "7x7x7",
    eventName: "7x7x7 Cube",
    scramblesImplemented: "random-moves"
  },
  "333bf": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Blindfolded",
    scramblesImplemented: "random-state"
  },
  "333fm": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Fewest Moves",
    scramblesImplemented: "random-state"
  },
  "333oh": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 One-Handed",
    scramblesImplemented: "random-state"
  },
  clock: {
    puzzleID: "clock",
    eventName: "Clock",
    scramblesImplemented: "random-state"
  },
  minx: {
    puzzleID: "megaminx",
    eventName: "Megaminx",
    scramblesImplemented: "random-moves"
  },
  pyram: {
    puzzleID: "pyraminx",
    eventName: "Pyraminx",
    scramblesImplemented: "random-state"
  },
  skewb: {
    puzzleID: "skewb",
    eventName: "Skewb",
    scramblesImplemented: "random-state"
  },
  sq1: {
    puzzleID: "square1",
    eventName: "Square-1",
    scramblesImplemented: "random-state"
  },
  "444bf": {
    puzzleID: "4x4x4",
    eventName: "4x4x4 Blindfolded",
    scramblesImplemented: "random-state"
  },
  "555bf": {
    puzzleID: "5x5x5",
    eventName: "5x5x5 Blindfolded",
    scramblesImplemented: "random-moves"
  },
  "333mbf": {
    puzzleID: "3x3x3",
    eventName: "3x3x3 Multi-Blind",
    scramblesImplemented: "random-state"
  }
};
var cube2x2x2 = {
  id: "2x2x2",
  fullName: "2×2×2 Cube",
  kpuzzle: getCached(async () => {
    const kpuzzle = new KPuzzle(
      (await __vitePreload(async () => {
        const { cube2x2x2JSON } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
        return { cube2x2x2JSON };
      }, true ? [] : void 0)).cube2x2x2JSON
    );
    kpuzzle.definition.experimentalIsPatternSolved = experimentalIs2x2x2Solved;
    return kpuzzle;
  }),
  svg: async () => (await __vitePreload(async () => {
    const { cube2x2x2SVG } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
    return { cube2x2x2SVG };
  }, true ? [] : void 0)).cube2x2x2SVG,
  llSVG: getCached(
    async () => (await __vitePreload(async () => {
      const { cube2x2x2LLSVG } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
      return { cube2x2x2LLSVG };
    }, true ? [] : void 0)).cube2x2x2LLSVG
  ),
  pg: getCached(async () => {
    return asyncGetPuzzleGeometry("2x2x2");
  }),
  stickeringMask: (stickering) => cubeLikeStickeringMask(cube2x2x2, stickering),
  stickerings: () => cubeLikeStickeringList("2x2x2", { use3x3x3Fallbacks: true }),
  algTransformData: cubeMirrorTransforms
};
var cube4x4x4And5x5x5KeyMapping = {
  ...cube3x3x3KeyMapping,
  KeyZ: new Move("m'"),
  KeyB: new Move("m"),
  Period: new Move("m'")
};
var cube4x4x4 = new CubePGPuzzleLoader({
  id: "4x4x4",
  fullName: "4×4×4 Cube",
  inventedBy: ["Peter Sebestény"],
  inventionYear: 1981
});
cube4x4x4.llSVG = getCached(async () => {
  return (await __vitePreload(async () => {
    const { cube4x4x4LLSVG } = await import("./puzzles-dynamic-4x4x4-UFAQS3QG-B7vqU7Y_.js");
    return { cube4x4x4LLSVG };
  }, true ? [] : void 0)).cube4x4x4LLSVG;
});
cube4x4x4.keyMapping = async () => cube4x4x4And5x5x5KeyMapping;
cube4x4x4.kpuzzle = getCached(async () => {
  const kpuzzle = await PGPuzzleLoader.prototype.kpuzzle.call(cube4x4x4);
  kpuzzle.definition.defaultPattern["CENTERS"].pieces = [
    // U
    0,
    0,
    0,
    0,
    // L
    4,
    4,
    4,
    4,
    // F
    8,
    8,
    8,
    8,
    // R
    12,
    12,
    12,
    12,
    // B
    16,
    16,
    16,
    16,
    // D
    20,
    20,
    20,
    20
  ];
  const { experimentalIsBigCubeSolved } = await bigCubePuzzleOrientation();
  kpuzzle.definition.experimentalIsPatternSolved = experimentalIsBigCubeSolved;
  return kpuzzle;
});
var cube5x5x5 = new CubePGPuzzleLoader({
  id: "5x5x5",
  fullName: "5×5×5 Cube",
  inventedBy: ["Udo Krell"],
  inventionYear: 1981
});
cube5x5x5.keyMapping = async () => cube4x4x4And5x5x5KeyMapping;
cube5x5x5.kpuzzle = getCached(async () => {
  const kpuzzle = await PGPuzzleLoader.prototype.kpuzzle.call(cube5x5x5);
  const speffzDistinguishableCenters = [
    // U
    0,
    0,
    0,
    0,
    // L
    4,
    4,
    4,
    4,
    // F
    8,
    8,
    8,
    8,
    // R
    12,
    12,
    12,
    12,
    // B
    16,
    16,
    16,
    16,
    // D
    20,
    20,
    20,
    20
  ];
  kpuzzle.definition.defaultPattern["CENTERS"].pieces = speffzDistinguishableCenters;
  kpuzzle.definition.defaultPattern["CENTERS2"].pieces = speffzDistinguishableCenters;
  kpuzzle.definition.defaultPattern["CENTERS3"].orientationMod = new Array(
    6
  ).fill(1);
  const { experimentalIsBigCubeSolved } = await bigCubePuzzleOrientation();
  kpuzzle.definition.experimentalIsPatternSolved = experimentalIsBigCubeSolved;
  return kpuzzle;
});
async function ftoStickering(puzzleLoader, stickering) {
  const kpuzzle = await puzzleLoader.kpuzzle();
  const puzzleStickering = new PuzzleStickering(kpuzzle);
  const m = new StickeringManager(kpuzzle);
  const experimentalFTO_FC = () => m.and([m.move("U"), m.not(m.or(m.moves(["F", "BL", "BR"])))]);
  const experimentalFTO_F2T = () => m.and([m.move("U"), m.not(m.move("F"))]);
  const experimentalFTO_SC = () => m.or([
    experimentalFTO_F2T(),
    m.and([m.move("F"), m.not(m.or(m.moves(["U", "BL", "BR"])))])
  ]);
  const experimentalFTO_L2C = () => m.not(
    m.or([
      m.and([m.move("U"), m.move("F")]),
      m.and([m.move("F"), m.move("BL")]),
      m.and([m.move("F"), m.move("BR")]),
      m.and([m.move("BL"), m.move("BR")])
    ])
  );
  const experimentalFTO_LBT = () => m.not(
    m.or([
      m.and([m.move("F"), m.move("BL")]),
      m.and([m.move("F"), m.move("BR")]),
      m.and([m.move("BL"), m.move("BR")])
    ])
  );
  switch (stickering) {
    case "full":
      break;
    case "experimental-fto-fc": {
      puzzleStickering.set(
        m.not(experimentalFTO_FC()),
        PieceStickering.Ignored
      );
      break;
    }
    case "experimental-fto-f2t": {
      puzzleStickering.set(
        m.not(experimentalFTO_F2T()),
        PieceStickering.Ignored
      );
      puzzleStickering.set(experimentalFTO_FC(), PieceStickering.Dim);
      break;
    }
    case "experimental-fto-sc": {
      puzzleStickering.set(
        m.not(experimentalFTO_SC()),
        PieceStickering.Ignored
      );
      puzzleStickering.set(experimentalFTO_F2T(), PieceStickering.Dim);
      break;
    }
    case "experimental-fto-l2c": {
      puzzleStickering.set(
        m.not(experimentalFTO_L2C()),
        PieceStickering.Ignored
      );
      puzzleStickering.set(experimentalFTO_SC(), PieceStickering.Dim);
      break;
    }
    case "experimental-fto-lbt": {
      puzzleStickering.set(
        m.not(experimentalFTO_LBT()),
        PieceStickering.Ignored
      );
      puzzleStickering.set(experimentalFTO_L2C(), PieceStickering.Dim);
      break;
    }
    case "experimental-fto-l3t": {
      puzzleStickering.set(experimentalFTO_LBT(), PieceStickering.Dim);
      break;
    }
    default:
      console.warn(
        `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`
      );
      puzzleStickering.set(m.and(m.moves([])), PieceStickering.Dim);
  }
  return puzzleStickering.toStickeringMask();
}
async function ftoStickerings() {
  return [
    "full",
    "experimental-fto-fc",
    "experimental-fto-f2t",
    "experimental-fto-sc",
    "experimental-fto-l2c",
    "experimental-fto-lbt",
    "experimental-fto-l3t"
  ];
}
var ftoKeyMapping = {
  KeyI: new Move("R"),
  KeyK: new Move("R'"),
  KeyW: new Move("B"),
  KeyO: new Move("B'"),
  KeyS: new Move("D"),
  KeyL: new Move("D'"),
  KeyD: new Move("L"),
  KeyE: new Move("L'"),
  KeyJ: new Move("U"),
  KeyF: new Move("U'"),
  KeyH: new Move("F"),
  KeyG: new Move("F'"),
  KeyN: new Move("Rv'"),
  KeyC: new Move("l"),
  KeyR: new Move("l'"),
  KeyU: new Move("r"),
  KeyM: new Move("r'"),
  KeyX: new Move("d"),
  Comma: new Move("d'"),
  KeyT: new Move("Lv'"),
  KeyY: new Move("Rv"),
  KeyV: new Move("Lv"),
  Semicolon: new Move("Uv"),
  KeyA: new Move("Uv'"),
  KeyP: new Move("BR'"),
  KeyQ: new Move("BL"),
  KeyZ: new Move("BL'"),
  KeyB: new Move("T"),
  Period: new Move("BR"),
  Backquote: new Pause()
};
var BabyFTOPuzzleLoader = class extends PGPuzzleLoader {
  constructor() {
    super({
      pgID: "skewb diamond",
      id: "baby_fto",
      fullName: "Baby FTO",
      inventedBy: ["Uwe Mèffert"],
      // inventionYear: TODO
      setOrientationModTo1ForPiecesOfOrbits: ["CENTERS"]
    });
  }
  stickeringMask(stickering) {
    return ftoStickering(this, stickering);
  }
  svg = getCached(async () => {
    return (await __vitePreload(async () => {
      const { babyFTOSVG } = await import("./puzzles-dynamic-unofficial-6BF3EWTI-C3SLfSa4.js");
      return { babyFTOSVG };
    }, true ? [] : void 0)).babyFTOSVG;
  });
  keyMapping = async () => ftoKeyMapping;
};
var baby_fto = new BabyFTOPuzzleLoader();
var clock = {
  id: "clock",
  fullName: "Clock",
  inventedBy: ["Christopher C. Wiggs", "Christopher J. Taylor"],
  inventionYear: 1988,
  // Patent application year: https://www.jaapsch.net/puzzles/patents/us4869506.pdf
  kpuzzle: getCached(
    async () => new KPuzzle(
      (await __vitePreload(async () => {
        const { clockJSON } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
        return { clockJSON };
      }, true ? [] : void 0)).clockJSON
    )
  ),
  svg: getCached(async () => {
    return (await __vitePreload(async () => {
      const { clockSVG } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
      return { clockSVG };
    }, true ? [] : void 0)).clockSVG;
  })
};
var FTOPuzzleLoader = class extends PGPuzzleLoader {
  constructor() {
    super({
      pgID: "FTO",
      id: "fto",
      fullName: "Face-Turning Octahedron",
      inventedBy: ["Karl Rohrbach", "David Pitcher"],
      // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
      inventionYear: 1983
      // http://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1663
    });
  }
  stickeringMask(stickering) {
    return ftoStickering(this, stickering);
  }
  stickerings = ftoStickerings;
  svg = getCached(async () => {
    return (await __vitePreload(async () => {
      const { ftoSVG } = await import("./puzzles-dynamic-unofficial-6BF3EWTI-C3SLfSa4.js");
      return { ftoSVG };
    }, true ? [] : void 0)).ftoSVG;
  });
  keyMapping = async () => ftoKeyMapping;
  algTransformData = {
    "↔ Mirror (x)": {
      replaceMovesByFamily: {
        L: "R",
        R: "L",
        l: "r",
        r: "l",
        Lw: "Rw",
        Rw: "Lw",
        Lv: "Rv",
        Rv: "Lv",
        BL: "BR",
        BR: "BL",
        bl: "br",
        br: "bl",
        BLw: "BRw",
        BRw: "BLw",
        BLv: "BRv",
        BRv: "BLv"
      },
      invertExceptByFamily: /* @__PURE__ */ new Set(["x"])
    }
  };
};
var fto = new FTOPuzzleLoader();
var KILOMINX_PUZZLE_DESCRIPTION = "d f 0.56";
var kilominx = {
  id: "kilominx",
  fullName: "Kilominx",
  kpuzzle: getCached(
    () => asyncGetKPuzzleByDesc(KILOMINX_PUZZLE_DESCRIPTION, {
      includeCenterOrbits: false,
      includeEdgeOrbits: false
    })
  ),
  pg: () => descAsyncGetPuzzleGeometry(KILOMINX_PUZZLE_DESCRIPTION, {
    includeCenterOrbits: false,
    includeEdgeOrbits: false
  }),
  svg: getCached(async () => {
    return (await __vitePreload(async () => {
      const { kilominxSVG } = await import("./puzzles-dynamic-unofficial-6BF3EWTI-C3SLfSa4.js");
      return { kilominxSVG };
    }, true ? [] : void 0)).kilominxSVG;
  })
};
var loopover = {
  id: "loopover",
  fullName: "Loopover",
  inventedBy: ["Cary Huang"],
  inventionYear: 2018,
  kpuzzle: getCached(
    async () => new KPuzzle(
      (await __vitePreload(async () => {
        const { loopoverJSON } = await import("./puzzles-dynamic-unofficial-6BF3EWTI-C3SLfSa4.js");
        return { loopoverJSON };
      }, true ? [] : void 0)).loopoverJSON
    )
  ),
  svg: async () => {
    return (await __vitePreload(async () => {
      const { loopoverSVG } = await import("./puzzles-dynamic-unofficial-6BF3EWTI-C3SLfSa4.js");
      return { loopoverSVG };
    }, true ? [] : void 0)).loopoverSVG;
  }
};
async function megaminxStickeringMask(puzzleLoader, stickering) {
  if ((await megaminxStickerings()).includes(stickering)) {
    return cubeLikeStickeringMask(puzzleLoader, stickering);
  }
  console.warn(
    `Unsupported stickering for ${puzzleLoader.id}: ${stickering}. Setting all pieces to dim.`
  );
  return cubeLikeStickeringMask(puzzleLoader, "full");
}
var megaminxStickeringListPromise = new LazyPromise(
  () => cubeLikeStickeringList("megaminx")
);
function megaminxStickerings() {
  return megaminxStickeringListPromise;
}
var megaminxKeyMapping = {
  KeyI: new Move("R"),
  KeyK: new Move("R'"),
  KeyW: new Move("B"),
  KeyO: new Move("B'"),
  KeyS: new Move("FR"),
  KeyL: new Move("FR'"),
  KeyD: new Move("L"),
  KeyE: new Move("L'"),
  KeyJ: new Move("U"),
  KeyF: new Move("U'"),
  KeyH: new Move("F"),
  KeyG: new Move("F'"),
  KeyC: new Move("Lw"),
  KeyR: new Move("Lw'"),
  KeyU: new Move("Rw"),
  KeyM: new Move("Rw'"),
  KeyX: new Move("d"),
  Comma: new Move("d'"),
  KeyT: new Move("Rv"),
  KeyY: new Move("Rv"),
  KeyV: new Move("Rv'"),
  KeyN: new Move("Rv'"),
  Semicolon: new Move("y"),
  KeyA: new Move("y'"),
  KeyP: new Move("z"),
  KeyQ: new Move("z'"),
  KeyZ: new Move("2L'"),
  KeyB: new Move("2R"),
  Period: new Move("2R'"),
  Backquote: new Pause()
};
var MegaminxPuzzleLoader = class extends PGPuzzleLoader {
  constructor() {
    super({
      id: "megaminx",
      fullName: "Megaminx",
      // Too many simultaneous inventors to name.
      inventionYear: 1981
      // Earliest date from https://www.jaapsch.net/puzzles/megaminx.htm
    });
  }
  stickeringMask(stickering) {
    return megaminxStickeringMask(this, stickering);
  }
  stickerings = megaminxStickerings;
  llSVG = getCached(async () => {
    return (await __vitePreload(async () => {
      const { megaminxLLSVG } = await import("./puzzles-dynamic-megaminx-EFR4GQFA-C7WLENqp.js");
      return { megaminxLLSVG };
    }, true ? [] : void 0)).megaminxLLSVG;
  });
  keyMapping = async () => megaminxKeyMapping;
  // TODO: async loading
};
var megaminx = new MegaminxPuzzleLoader();
var melindas2x2x2x2 = {
  id: "melindas2x2x2x2",
  fullName: "Melinda's 2×2×2×2",
  inventedBy: ["Melinda Green"],
  // inventionYear: 20__, // TODO
  kpuzzle: getCached(
    async () => new KPuzzle(
      (await __vitePreload(async () => {
        const { melindas2x2x2x2OrbitJSON } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
        return { melindas2x2x2x2OrbitJSON };
      }, true ? [] : void 0)).melindas2x2x2x2OrbitJSON
    )
  ),
  svg: getCached(async () => {
    return (await __vitePreload(async () => {
      const { melindas2x2x2x2OrbitSVG } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
      return { melindas2x2x2x2OrbitSVG };
    }, true ? [] : void 0)).melindas2x2x2x2OrbitSVG;
  })
};
var PyraminxPuzzleLoader = class extends PGPuzzleLoader {
  constructor() {
    super({
      id: "pyraminx",
      fullName: "Pyraminx",
      inventedBy: ["Uwe Meffert"]
    });
  }
  svg = getCached(async () => {
    return (await __vitePreload(async () => {
      const { pyraminxSVG } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
      return { pyraminxSVG };
    }, true ? [] : void 0)).pyraminxSVG;
  });
  algTransformData = {
    "↔ Mirror (x)": {
      replaceMovesByFamily: {
        L: "R",
        R: "L",
        l: "r",
        r: "l",
        Lw: "Rw",
        Rw: "Lw",
        Lv: "Rv",
        Rv: "Lv"
      },
      invertExceptByFamily: /* @__PURE__ */ new Set([])
    }
  };
};
var pyraminx = new PyraminxPuzzleLoader();
var rediCube = {
  id: "redi_cube",
  fullName: "Redi Cube",
  // Announced 2009-07-21: https://www.youtube.com/watch?v=cjfMzA1u3vM
  // https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1520
  inventedBy: ["Oskar van Deventer"],
  inventionYear: 2009,
  kpuzzle: getCached(
    async () => new KPuzzle(
      (await __vitePreload(async () => {
        const { rediCubeJSON } = await import("./puzzles-dynamic-unofficial-6BF3EWTI-C3SLfSa4.js");
        return { rediCubeJSON };
      }, true ? [] : void 0)).rediCubeJSON
    )
  ),
  svg: async () => {
    return (await __vitePreload(async () => {
      const { rediCubeSVG } = await import("./puzzles-dynamic-unofficial-6BF3EWTI-C3SLfSa4.js");
      return { rediCubeSVG };
    }, true ? [] : void 0)).rediCubeSVG;
  }
};
var square1 = {
  id: "square1",
  fullName: "Square-1",
  inventedBy: ["Karel Hršel", "Vojtech Kopský"],
  inventionYear: 1990,
  // Czech patent application year: http://spisy.upv.cz/Patents/FullDocuments/277/277266.pdf
  kpuzzle: getCached(
    async () => new KPuzzle(
      (await __vitePreload(async () => {
        const { sq1HyperOrbitJSON } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
        return { sq1HyperOrbitJSON };
      }, true ? [] : void 0)).sq1HyperOrbitJSON
    )
  ),
  svg: getCached(async () => {
    return (await __vitePreload(async () => {
      const { sq1HyperOrbitSVG } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
      return { sq1HyperOrbitSVG };
    }, true ? [] : void 0)).sq1HyperOrbitSVG;
  })
};
var tri_quad = {
  id: "tri_quad",
  fullName: "TriQuad",
  inventedBy: ["Bram Cohen", "Carl Hoff"],
  inventionYear: 2018,
  // https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=6809
  kpuzzle: getCached(
    async () => new KPuzzle(
      (await __vitePreload(async () => {
        const { triQuadJSON } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
        return { triQuadJSON };
      }, true ? [] : void 0)).triQuadJSON
    )
  ),
  svg: getCached(async () => {
    return (await __vitePreload(async () => {
      const { triQuadSVG } = await import("./puzzles-dynamic-side-events-KF3PEOJN-BHDLDedp.js");
      return { triQuadSVG };
    }, true ? [] : void 0)).triQuadSVG;
  })
};
var puzzles = {
  /******** Start of WCA Puzzles *******/
  "3x3x3": cube3x3x3,
  "2x2x2": cube2x2x2,
  "4x4x4": cube4x4x4,
  "5x5x5": cube5x5x5,
  "6x6x6": new CubePGPuzzleLoader({ id: "6x6x6", fullName: "6×6×6 Cube" }),
  "7x7x7": new CubePGPuzzleLoader({ id: "7x7x7", fullName: "7×7×7 Cube" }),
  "40x40x40": new CubePGPuzzleLoader({
    id: "40x40x40",
    fullName: "40×40×40 Cube"
  }),
  // 3x3x3 Blindfolded
  // 3x3x3 Fewest Moves
  // 3x3x3 One-Handed
  clock,
  megaminx,
  pyraminx,
  skewb: new PGPuzzleLoader({
    id: "skewb",
    fullName: "Skewb",
    inventedBy: ["Tony Durham"]
    // https://www.jaapsch.net/puzzles/skewb.htm
    // inventionYear: 1982, // 1982 is actually the year of Hofstadter's column.
  }),
  square1,
  // 4x4x4 Blindfolded
  // 5x5x5 Blindfolded
  /******** End of WCA puzzles ********/
  fto,
  gigaminx: new PGPuzzleLoader({
    id: "gigaminx",
    fullName: "Gigaminx",
    inventedBy: ["Tyler Fox"],
    inventionYear: 2006
    // Earliest date from https://www.twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1475
  }),
  master_tetraminx: new PGPuzzleLoader({
    pgID: "master tetraminx",
    id: "master_tetraminx",
    fullName: "Master Tetraminx",
    inventedBy: ["Katsuhiko Okamoto"],
    // Using master pyraminx: https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1352
    inventionYear: 2002
    // Using master pyraminx: https://twistypuzzles.com/cgi-bin/puzzle.cgi?pkey=1352
  }),
  kilominx,
  redi_cube: rediCube,
  melindas2x2x2x2,
  loopover,
  tri_quad,
  baby_fto
};
export {
  Alg as A,
  Conjugate as C,
  Grouping as G,
  IterationDirection as I,
  KPuzzle as K,
  LazyPromise as L,
  Move as M,
  Newline as N,
  PieceStickering as P,
  QuantumMove as Q,
  TraversalUp as T,
  KPattern as a,
  AlgBuilder as b,
  cube2x2x2 as c,
  cube3x3x3KPuzzleDefinition as d,
  endCharIndexKey as e,
  functionFromTraversal as f,
  TraversalDownUp as g,
  directedGenerator as h,
  experimentalAppendMove as i,
  getPartialAppendOptionsForPuzzleSpecificSimplifyOptions as j,
  customPGPuzzleLoader as k,
  cube3x3x3 as l,
  getPieceStickeringMask as m,
  LineComment as n,
  offsetMod as o,
  puzzles as p,
  direct as q,
  Pause as r,
  startCharIndexKey as s,
  getFaceletStickeringMask as t,
  wcaEvents as w
};
