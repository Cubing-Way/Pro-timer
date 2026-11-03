import { s as solveTwips } from "./index-gQ5L7cms.js";
import { e, a, r, b, c, d, f } from "./index-gQ5L7cms.js";
import "./index-6lt5Usf4.js";
import "./preload-helper-DN2scbUx.js";
var experimentalSolveTwsearch = (...args) => {
  console.error(
    "`experimentalSolveTwsearch(…)` is deprecated. Please call `experimentalSolveTwips(…)` instead."
  );
  return solveTwips(...args);
};
export {
  e as experimentalSolve2x2x2,
  a as experimentalSolve3x3x3IgnoringCenters,
  solveTwips as experimentalSolveTwips,
  experimentalSolveTwsearch,
  r as random333Pattern,
  b as setSearchDebug,
  c as solveMegaminx,
  d as solvePyraminx,
  f as solveSkewb
};
