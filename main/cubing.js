// cubing.js runs its scrambler in its own web worker, so generating scrambles never freezes the page
// Imported on demand so it's built apart from the app's main file: its worker shares these files, and the app's code can't run in a worker
async function loadCubing() {
  const [{ randomScrambleForEvent }, { setSearchDebug }] = await Promise.all([
    import("cubing/scramble"),
    import("cubing/search"),
  ]);
  // Skips its first way of starting the worker (it always fails once built, logging an error) and its timing logs
  setSearchDebug({ prioritizeEsbuildWorkaroundForWorkerInstantiation: true, logPerf: false });
  return randomScrambleForEvent;
}

// Starts loading with the page, since the first scramble needs it right away
const cubingLoaded = loadCubing();

// Defines <twisty-player>, the picture getPicture writes; one already on the page starts drawing once this loads
import("cubing/twisty");

// One scramble as text, on one line (cubing.js breaks Megaminx scrambles into lines, and formatMegaminx does that when showing them)
async function getScramble(eventId) {
  const randomScrambleForEvent = await cubingLoaded;
  const alg = await randomScrambleForEvent(eventId);
  return alg.toString().replace(/\s+/g, " ").trim();
}

// What the app can ask cubing.js for
export const cubing = {
  // Scramble of a cubing.js event ("333", "minx"…)
  getScramble,
  // One numbered scramble per cube ("1) … 2) …"), the text parseMBLDScramble reads
  getMultiBlindScramble: async (cubes) => {
    const scrambles = [];
    // One at a time, since cubing.js's worker makes them one at a time anyway
    for (let i = 1; i <= cubes; i++) {
      scrambles.push(`${i}) ${await getScramble("333mbf")}`);
    }
    return scrambles.join("\n");
  },
  // HTML of a flat picture of a puzzle ("3x3x3", "megaminx"…) after a scramble; it fills the box it's put in
  getPicture: (scramble, puzzle) =>
    `<twisty-player puzzle="${puzzle}" experimental-setup-alg="${scramble}" visualization="2D" hint-facelets="none" control-panel="none" background="none"></twisty-player>`,
  // True when a text is a scramble for a puzzle: cubing.js can read it and the puzzle has its moves
  isValidScramble: async (scramble, puzzle) => {
    // cubing.js reads empty text as no moves, and allows anything inside a comment, which could break the HTML a saved scramble is drawn into
    if (!scramble || /["<>&]/.test(scramble)) return false;
    // No puzzle (an event Pro Timer no longer has): there are no moves to check against
    if (!puzzle) return true;
    // On demand too, since making scrambles doesn't need it
    const { puzzles } = await import("cubing/puzzles");
    const kpuzzle = await puzzles[puzzle].kpuzzle();
    // cubing.js throws on text it can't read and on moves the puzzle doesn't have
    try {
      kpuzzle.algToTransformation(scramble);
      return true;
    } catch {
      return false;
    }
  },
};
