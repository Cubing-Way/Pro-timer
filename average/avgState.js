// The average in progress: its mode and the solves done since the last full average
const averageObj = {
  mode: "ao5",       // ao5, mo3, bo3, bo5, fmc3 (ao3) or classic
  solveCounter: 0,   // number of solves in solvesArray
  solvesArray: [] // array of solve objects
};

// Classic mode's rolling averages over the last 3, 5, 12 and 100 solves
const classicStats = {
    // The latest rolling average of each size (null until there are enough solves)
    current: {
        mo3: null,
        ao5: null,
        ao12: null,
        ao100: null
    },
    // The best rolling average of each size so far
    best: {
        mo3: null,
        ao5: null,
        ao12: null,
        ao100: null
    },
    // Every rolling average of each size, oldest first
    history: {
        mo3: [],
        ao5: [],
        ao12: [],
        ao100: []
    }

};

export { averageObj, classicStats };