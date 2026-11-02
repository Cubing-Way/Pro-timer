// Pro Timer's event codes → cubing.js's event ID and the puzzle its picture draws (saved sessions, solves and imports all use these codes)
export const cubingEvents = {
	"333": { eventId: "333", puzzle: "3x3x3" },
	"222so": { eventId: "222", puzzle: "2x2x2" },
	"444wca": { eventId: "444", puzzle: "4x4x4" },
	"555wca": { eventId: "555", puzzle: "5x5x5" },
	"666wca": { eventId: "666", puzzle: "6x6x6" },
	"777wca": { eventId: "777", puzzle: "7x7x7" },
	"333ni": { eventId: "333bf", puzzle: "3x3x3" },
	"333fm": { eventId: "333fm", puzzle: "3x3x3" },
	"333oh": { eventId: "333oh", puzzle: "3x3x3" },
	"333ft": { eventId: "333ft", puzzle: "3x3x3" },
	"clkwca": { eventId: "clock", puzzle: "clock" },
	"mgmp": { eventId: "minx", puzzle: "megaminx" },
	"pyrso": { eventId: "pyram", puzzle: "pyraminx" },
	"skbso": { eventId: "skewb", puzzle: "skewb" },
	"sqrs": { eventId: "sq1", puzzle: "square1" },
	"444bld": { eventId: "444bf", puzzle: "4x4x4" },
	"555bld": { eventId: "555bf", puzzle: "5x5x5" },
	"r3ni": { eventId: "333mbf", puzzle: "3x3x3" },
	"ftoso": { eventId: "fto", puzzle: "fto" },
	"baby_fto": { eventId: "baby_fto", puzzle: "baby_fto" },
	"klmso": { eventId: "kilominx", puzzle: "kilominx" },
	"mpyrso": { eventId: "master_tetraminx", puzzle: "master_tetraminx" },
	"rediso": { eventId: "redi_cube", puzzle: "redi_cube" }
};

// The top bar's menus: [category, [[label, event code], …]]
export const scrdata = [
	['WCA', [
		['3x3x3', "333"],
		['2x2x2', "222so"],
		['4x4x4', "444wca"],
		['5x5x5', "555wca"],
		['6x6x6', "666wca"],
		['7x7x7', "777wca"],
		['3x3 bld', "333ni"],
		['3x3 fm', "333fm"],
		['3x3 oh', "333oh"],
		['clock', "clkwca"],
		['megaminx', "mgmp"],
		['pyraminx', "pyrso"],
		['skewb', "skbso"],
		['sq1', "sqrs"],
		['4x4 bld', "444bld"],
		['5x5 bld', "555bld"],
		['3x3 mbld', "r3ni"]
	]],
	['3x3x3', [
		["random state (WCA)", "333"],
		['3x3 ft', "333ft"]
	]],
	['2x2x2', [
		["random state (WCA)", "222so"]
	]],
	['4x4x4', [
		["WCA", "444wca"]
	]],
	['5x5x5', [
		["WCA", "555wca"]
	]],
	['6x6x6', [
		["WCA", "666wca"]
	]],
	['7x7x7', [
		["WCA", "777wca"]
	]],
	['Clock', [
		['WCA', "clkwca"]
	]],
	['Megaminx', [
		["WCA", "mgmp"]
	]],
	['Pyraminx', [
		["random state (WCA)", "pyrso"]
	]],
	['Skewb', [
		["random state (WCA)", "skbso"]
	]],
	['Square-1', [
		["random state (WCA)", "sqrs"]
	]],
	['Kilominx', [
		['random state', "klmso"]
	]],
	['Master Pyraminx', [
		['random state', "mpyrso"]
	]],
	['Redi Cube', [
		['random state', "rediso"]
	]],
	['FTO', [
		['random state', "ftoso"]
	]],
	['Baby FTO', [
		['random state', "baby_fto"]
	]]
];
