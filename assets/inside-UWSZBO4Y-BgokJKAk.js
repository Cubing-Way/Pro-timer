import { _ as __vitePreload } from "./preload-helper-DN2scbUx.js";
import { c as countMoves } from "./chunk-UKAXYOG2-CJww9EzC.js";
import { h as expose, i as solve333, m as mustBeInsideWorker, j as random333OrientedScramble, k as random333Scramble, l as addOrientationSuffix, n as setIsInsideWorker, o as initialize333 } from "./index-gQ5L7cms.js";
import { K as KPuzzle, a as KPattern, p as puzzles, L as LazyPromise, c as cube2x2x2, w as wcaEvents, A as Alg, b as AlgBuilder, M as Move } from "./index-6lt5Usf4.js";
var DEFAULT_STAGE1_DEPTH_LIMIT = 2;
function calculateMoves(kpuzzle, moveNames) {
  const searchMoves = [];
  for (const moveName of moveNames) {
    const rootMove = new Move(moveName);
    if (rootMove.amount !== 1) {
      throw new Error(
        "SGS cannot handle def moves with an amount other than 1 yet."
      );
    }
    let transformation = kpuzzle.identityTransformation();
    for (let i = 1; ; i++) {
      transformation = transformation.applyMove(rootMove);
      if (transformation.isIdentityTransformation()) {
        break;
      }
      searchMoves.push({
        move: rootMove.modified({ amount: i }),
        transformation
      });
    }
  }
  return searchMoves;
}
var TrembleSolver = class {
  searchMoves;
  kpuzzle;
  sgs;
  constructor(kpuzzle, sgs, trembleMoveNames) {
    this.kpuzzle = kpuzzle;
    this.sgs = sgs;
    this.searchMoves = calculateMoves(
      this.kpuzzle,
      trembleMoveNames ?? Object.keys(this.kpuzzle.definition.moves)
    );
  }
  // public badRandomMoves(): KSolvePuzzleState {
  //   return badRandomMoves(this.moves, this.ksp);
  // }
  async solve(pattern, stage1DepthLimit = DEFAULT_STAGE1_DEPTH_LIMIT, quantumMoveOrder) {
    const transformation = pattern.experimentalToTransformation();
    if (!transformation) {
      throw new Error(
        "distinguishable pieces are not supported in tremble solver yt"
      );
    }
    let bestAlg = null;
    let bestLen = 1e6;
    const recur = (recursiveTransformation, togo, sofar) => {
      if (togo === 0) {
        const sgsAlg = this.sgsPhaseSolve(recursiveTransformation, bestLen);
        if (!sgsAlg) {
          return;
        }
        const newAlg = sofar.concat(sgsAlg).experimentalSimplify({
          cancel: {
            directional: "any-direction",
            puzzleSpecificModWrap: "canonical-centered"
          },
          puzzleSpecificSimplifyOptions: { quantumMoveOrder }
        });
        const len = countMoves(newAlg);
        if (bestAlg === null || len < bestLen) {
          bestAlg = newAlg;
          bestLen = len;
        }
        return;
      }
      for (const searchMove of this.searchMoves) {
        recur(
          recursiveTransformation.applyTransformation(
            searchMove.transformation
          ),
          togo - 1,
          sofar.concat([searchMove.move])
        );
      }
    };
    for (let d = 0; d <= stage1DepthLimit; d++) {
      recur(transformation, d, new Alg());
    }
    if (bestAlg === null) {
      throw new Error("SGS search failed.");
    }
    return bestAlg;
  }
  sgsPhaseSolve(initialTransformation, bestLenSofar) {
    const algBuilder = new AlgBuilder();
    let transformation = initialTransformation;
    for (const step of this.sgs.ordering) {
      const cubieSeq = step.pieceOrdering;
      let key = "";
      const inverseTransformation = transformation.invert();
      for (let i = 0; i < cubieSeq.length; i++) {
        const loc = cubieSeq[i];
        const orbitName = loc.orbitName;
        const idx = loc.permutationIdx;
        key += ` ${inverseTransformation.transformationData[orbitName].permutation[idx]} ${inverseTransformation.transformationData[orbitName].orientationDelta[idx]}`;
      }
      const info = step.lookup[key];
      if (!info) {
        throw new Error("Missing algorithm in sgs or esgs?");
      }
      algBuilder.experimentalPushAlg(info.alg);
      if (algBuilder.experimentalNumAlgNodes() >= bestLenSofar) {
        return null;
      }
      transformation = transformation.applyTransformation(info.transformation);
      {
        for (let i = 0; i < cubieSeq.length; i++) {
          const location = cubieSeq[i];
          const orbitName = location.orbitName;
          const idx = location.permutationIdx;
          if (transformation.transformationData[orbitName].permutation[idx] !== idx || transformation.transformationData[orbitName].orientationDelta[idx] !== 0) {
            throw new Error("bad SGS :-(");
          }
        }
      }
    }
    return algBuilder.toAlg();
  }
};
var twipsPromise = new LazyPromise(
  async () => __vitePreload(() => import("./twips-IMF5RNH5-CmosGkMt.js"), true ? [] : void 0)
);
async function wasmTwips(def, pattern, options) {
  const { wasmTwips: wasmTwips2 } = await twipsPromise;
  return wasmTwips2(def, pattern, options);
}
async function wasmRandomScrambleForEvent(eventID) {
  const { wasmRandomScrambleForEvent: wasmRandomScrambleForEvent2 } = await twipsPromise;
  return wasmRandomScrambleForEvent2(eventID);
}
async function wasmDeriveScrambleForEvent(derivationSeedHex, derivationSaltHierarchy, eventID) {
  const { wasmDeriveScrambleForEvent: wasmDeriveScrambleForEvent2 } = await twipsPromise;
  return wasmDeriveScrambleForEvent2(
    derivationSeedHex,
    derivationSaltHierarchy,
    eventID
  );
}
var searchDynamicSideEvents = new LazyPromise(
  () => __vitePreload(() => import("./search-dynamic-sgs-side-events-5GQDHSJR-BjX1C6Qt.js"), true ? [] : void 0)
);
var cachedTrembleSolver = null;
async function getCachedTrembleSolver() {
  return cachedTrembleSolver || (cachedTrembleSolver = (async () => {
    const sgsCachedData = await (await searchDynamicSideEvents).cachedData222();
    return new TrembleSolver(
      await puzzles["2x2x2"].kpuzzle(),
      sgsCachedData,
      "URFLBD".split("")
    );
  })());
}
async function preInitialize222() {
  await getCachedTrembleSolver();
}
async function solve222(pattern) {
  mustBeInsideWorker();
  return wasmTwips((await cube2x2x2.kpuzzle()).definition, pattern, {
    generatorMoves: "UFLR".split("")
  });
}
var dynamic4x4x4Solver = new LazyPromise(
  () => __vitePreload(() => import("./search-dynamic-solve-4x4x4-KNSBAM7Q-B62PTnrq.js"), true ? [] : void 0)
);
var randomSuffixes = [
  [null, "x", "x2", "x'", "z", "z'"],
  [null, "y", "y2", "y'"]
];
async function initialize444() {
  return (await dynamic4x4x4Solver).initialize();
}
async function random444Scramble() {
  mustBeInsideWorker();
  return (await dynamic4x4x4Solver).random444Scramble();
}
async function random444OrientedScramble() {
  return addOrientationSuffix(await random444Scramble(), randomSuffixes);
}
var dynamicFTO = new LazyPromise(
  () => __vitePreload(() => import("./search-dynamic-solve-fto-CSXJYISF-DSh4MhrQ.js"), true ? [] : void 0)
);
async function randomFTOScramble() {
  mustBeInsideWorker();
  return new Alg(await (await dynamicFTO).getRandomFTOScramble());
}
var dynamicKilominxSolver = new LazyPromise(() => __vitePreload(() => import("./search-dynamic-solve-kilominx-EHAUQJXS-XH6jLUla.js"), true ? [] : void 0));
async function randomKilominxScramble() {
  mustBeInsideWorker();
  return (await dynamicKilominxSolver).getRandomKilominxScramble();
}
var dynamicMasterTetraminxSolver = new LazyPromise(
  () => __vitePreload(() => import("./search-dynamic-solve-master_tetraminx-ZQ25QK7E-BlNeHt-Q.js"), true ? [] : void 0)
);
async function randomMasterTetraminxScramble() {
  mustBeInsideWorker();
  return new Alg(
    await (await dynamicMasterTetraminxSolver).randomMasterTetraminxScrambleString()
  );
}
var TREMBLE_DEPTH = 2;
var cachedTrembleSolver2 = null;
async function getCachedTrembleSolver2() {
  return cachedTrembleSolver2 || (cachedTrembleSolver2 = (async () => {
    const json = await (await searchDynamicSideEvents).cachedSGSDataMegaminx();
    return new TrembleSolver(
      await (await searchDynamicSideEvents).cachedMegaminxKPuzzleWithoutMO(),
      json,
      ["U", "R", "F", "L", "BR", "BL", "FR", "FL", "DR", "DL", "B", "D"]
    );
  })());
}
async function solveMegaminx(pattern) {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver2();
  const patternDataWithoutMO = structuredClone(
    pattern.patternData
  );
  patternDataWithoutMO["CENTERS"].orientation = new Array(12).fill(0);
  const patternWithoutMO = new KPattern(
    await (await searchDynamicSideEvents).cachedMegaminxKPuzzleWithoutMO(),
    patternDataWithoutMO
  );
  const alg = await trembleSolver.solve(
    patternWithoutMO,
    TREMBLE_DEPTH,
    () => 5
    // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
var TREMBLE_DEPTH2 = 3;
var cachedTrembleSolver3 = null;
async function getCachedTrembleSolver3() {
  return cachedTrembleSolver3 || (cachedTrembleSolver3 = (async () => {
    const json = await (await searchDynamicSideEvents).sgsDataPyraminx();
    return new TrembleSolver(
      await puzzles["pyraminx"].kpuzzle(),
      json,
      "RLUB".split("")
    );
  })());
}
async function solvePyraminx(pattern) {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver3();
  const alg = await trembleSolver.solve(pattern, TREMBLE_DEPTH2, () => 3);
  return alg;
}
var searchDynamicUnofficial = new LazyPromise(
  () => __vitePreload(() => import("./search-dynamic-sgs-unofficial-YM23KVCN-DYQP1tYK.js"), true ? [] : void 0)
);
async function randomRediCubeScramble() {
  mustBeInsideWorker();
  return (await searchDynamicUnofficial).getRandomRediCubeScramble();
}
var TREMBLE_DEPTH3 = 3;
var cachedTrembleSolver4 = null;
async function getCachedTrembleSolver4() {
  return cachedTrembleSolver4 || (cachedTrembleSolver4 = (async () => {
    const json = await (await searchDynamicSideEvents).sgsDataSkewb();
    return new TrembleSolver(
      await (await searchDynamicSideEvents).skewbKPuzzleWithoutMOCached(),
      json,
      "RLUB".split("")
    );
  })());
}
async function resetCenterOrientation(pattern) {
  return new KPattern(
    await (await searchDynamicSideEvents).skewbKPuzzleWithoutMOCached(),
    {
      CORNERS: pattern.patternData["CORNERS"],
      CENTERS: {
        pieces: pattern.patternData["CENTERS"].pieces,
        orientation: new Array(6).fill(0)
      }
    }
  );
}
async function solveSkewb(pattern) {
  mustBeInsideWorker();
  const trembleSolver = await getCachedTrembleSolver4();
  const alg = await trembleSolver.solve(
    await resetCenterOrientation(pattern),
    TREMBLE_DEPTH3,
    (quantumMove) => quantumMove.family === "y" ? 4 : 3
    // TODO: Attach quantum move order lookup to puzzle.
  );
  return alg;
}
var IDLE_PREFETCH_TIMEOUT_MS = 1e3;
setIsInsideWorker(true);
var DEBUG_MEASURE_PERF = true;
function setDebugMeasurePerf(newDebugMeasurePerf) {
  DEBUG_MEASURE_PERF = newDebugMeasurePerf;
}
var DEBUG_FORCE_TWIPS_FOR_SCRAMBLES = false;
function setDebugForceTwipsForScrambles(forceTwipsForScrambles) {
  DEBUG_FORCE_TWIPS_FOR_SCRAMBLES = forceTwipsForScrambles;
}
function now() {
  return (typeof performance === "undefined" ? Date : performance).now();
}
async function measurePerf(name, f, options) {
  if (!DEBUG_MEASURE_PERF) {
    return f();
  }
  const start = now();
  const result = f();
  if (result?.then) {
    await result;
  }
  const end = now();
  console.warn(
    `${name}${options?.isPrefetch ? " (prefetched)" : ""}: ${Math.round(
      end - start
    )}ms`
  );
  return result;
}
var prefetchPromises = /* @__PURE__ */ new Map();
var queuedPrefetchTimeoutID = null;
var scrambleActivityLock;
async function randomScrambleForEvent(eventID, options) {
  return scrambleActivityLock = (async () => {
    await scrambleActivityLock;
    function wasm() {
      return measurePerf(
        `wasmRandomScrambleForEvent(${JSON.stringify(eventID)})`,
        () => wasmRandomScrambleForEvent(eventID),
        {
          isPrefetch: options?.isPrefetch
        }
      );
    }
    function twipsOverride() {
      if (DEBUG_FORCE_TWIPS_FOR_SCRAMBLES && (eventID in wcaEvents || ["kilominx"].includes(eventID))) {
        console.log(`Using \`twips\` override for \`${eventID}\` scramble.`);
        return wasm();
      }
      return void 0;
    }
    switch (eventID) {
      // case "333":
      case "222":
        return (await wasm()).experimentalSimplify({
          puzzleSpecificSimplifyOptions: {
            quantumMoveOrder: () => 4
          }
        });
      // case "444":
      case "555":
      case "666":
      case "777":
      // case "333bf":
      case "333fm":
      // case "333oh":
      case "clock":
      case "minx":
      case "pyram":
      case "skewb":
      case "sq1":
      // case "444bf":
      case "555bf":
      // case "333mbf":
      // case "fto":
      // case "master_tetraminx":
      // case "kilominx":
      // case "redi_cube":
      case "baby_fto":
        return wasm();
      case "333":
      case "333oh":
      case "333ft":
        return twipsOverride() ?? measurePerf("random333Scramble", random333Scramble, {
          isPrefetch: options?.isPrefetch
        });
      case "333bf":
      case "333mbf":
        return twipsOverride() ?? measurePerf("random333OrientedScramble", random333OrientedScramble);
      case "444":
        return twipsOverride() ?? measurePerf("random444Scramble", random444Scramble, {
          isPrefetch: options?.isPrefetch
        });
      case "444bf":
        return twipsOverride() ?? measurePerf("random444OrientedScramble", random444OrientedScramble);
      case "fto":
        return measurePerf("randomFTOScramble", randomFTOScramble, {
          isPrefetch: options?.isPrefetch
        });
      case "master_tetraminx":
        return measurePerf(
          "randomMasterTetraminxScramble",
          randomMasterTetraminxScramble
        );
      case "kilominx":
        return twipsOverride() ?? measurePerf("randomKilominxScramble", randomKilominxScramble, {
          isPrefetch: options?.isPrefetch
        });
      case "redi_cube":
        return measurePerf("randomRediCubeScramble", randomRediCubeScramble, {
          isPrefetch: options?.isPrefetch
        });
      default:
        throw new Error(`unsupported event: ${eventID}`);
    }
  })();
}
var PrefetchLevel = {
  Auto: "auto",
  None: "none",
  Immediate: "immediate"
};
var currentPrefetchLevel = PrefetchLevel.Auto;
var insideAPI = {
  initialize: async (eventID) => {
    switch (eventID) {
      case "222":
        return measurePerf("preInitialize222", preInitialize222);
      case "333":
      case "333oh":
      case "333ft":
        return measurePerf("initialize333", initialize333);
      case "444":
        return measurePerf("initialize444", initialize444);
      default:
        throw new Error(`unsupported event: ${eventID}`);
    }
  },
  setScramblePrefetchLevel(prefetchLevel) {
    currentPrefetchLevel = prefetchLevel;
  },
  randomScrambleForEvent: async (eventID) => {
    let promise = prefetchPromises.get(eventID);
    if (promise) {
      prefetchPromises.delete(eventID);
    } else {
      promise = randomScrambleForEvent(eventID);
    }
    if (currentPrefetchLevel !== PrefetchLevel.None) {
      promise.then(() => {
        if (queuedPrefetchTimeoutID) {
          clearTimeout(queuedPrefetchTimeoutID);
        }
        queuedPrefetchTimeoutID = setTimeout(
          () => {
            prefetchPromises.set(
              eventID,
              randomScrambleForEvent(eventID, {
                isPrefetch: true
              })
            );
          },
          currentPrefetchLevel === PrefetchLevel.Immediate ? 0 : IDLE_PREFETCH_TIMEOUT_MS
        );
      });
    }
    return promise;
  },
  randomScrambleStringForEvent: async (eventID) => {
    return (await insideAPI.randomScrambleForEvent(eventID)).toString();
  },
  deriveScrambleStringForEvent: async (derivationSeedHex, derivationSaltHierarchy, eventID) => {
    const scramble = await measurePerf(
      `deriveScrambleForEvent(…, ${JSON.stringify(eventID)})`,
      () => wasmDeriveScrambleForEvent(
        derivationSeedHex,
        derivationSaltHierarchy,
        eventID
      )
    );
    return scramble.toString();
  },
  solve333ToString: async (patternData) => {
    const pattern = new KPattern(await puzzles["3x3x3"].kpuzzle(), patternData);
    return (await solve333(pattern)).toString();
  },
  solve222ToString: async (patternData) => {
    const pattern = new KPattern(await puzzles["2x2x2"].kpuzzle(), patternData);
    return (await solve222(pattern)).toString();
  },
  solveSkewbToString: async (patternData) => {
    const pattern = new KPattern(await puzzles["skewb"].kpuzzle(), patternData);
    return (await solveSkewb(pattern)).toString();
  },
  solvePyraminxToString: async (patternData) => {
    const pattern = new KPattern(
      await puzzles["pyraminx"].kpuzzle(),
      patternData
    );
    return (await solvePyraminx(pattern)).toString();
  },
  solveMegaminxToString: async (patternData) => {
    const pattern = new KPattern(
      await puzzles["megaminx"].kpuzzle(),
      patternData
    );
    return (await solveMegaminx(pattern)).toString();
  },
  setDebugMeasurePerf: async (measure) => {
    setDebugMeasurePerf(measure);
  },
  setDebugForceTwipsForScrambles: async (measure) => {
    setDebugForceTwipsForScrambles(measure);
  },
  solveTwipsToString: async (def, patternData, options) => {
    const kpuzzle = new KPuzzle(def);
    const pattern = new KPattern(kpuzzle, patternData);
    return (await wasmTwips(def, pattern, options)).toString();
  }
};
expose(insideAPI);
