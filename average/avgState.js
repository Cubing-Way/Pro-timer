const averageObj = {
  mode: "ao5",
  solveCounter: 0,
  solvesArray: [] // array of solve objects
};

const classicStats = {
    current: {
        mo3: null,
        ao5: null,
        ao12: null,
        ao100: null
    },
    best: {
        mo3: null,
        ao5: null,
        ao12: null,
        ao100: null
    },
    history: {
        mo3: [],
        ao5: [],
        ao12: [],
        ao100: []
    }

};

export { averageObj, classicStats };