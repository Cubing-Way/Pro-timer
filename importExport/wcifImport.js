// Reading a competition's WCIF file (the JSON WCA Live and the WCA website share): every competitor's results, one session per event
import { WCA_EVENTS, convertWcaAttempt, roundMode } from "./wcaImport.js";

// Time steps used to make up when each attempt was done
const SECOND = 1000;
const MINUTE = 60 * SECOND;

// Every activity of the schedule (rounds, and the groups inside them) by its id
function scheduleActivities(schedule) {
    const activities = new Map();
    // An activity, then the groups inside it, at any depth
    const collect = activity => {
        activities.set(activity.id, activity);
        (activity.childActivities || []).forEach(collect);
    };
    (schedule?.venues || []).forEach(venue =>
        (venue.rooms || []).forEach(room => (room.activities || []).forEach(collect)));
    return activities;
}

// When each round started ("333-r1" → ms), the earliest room when it's held in several
function roundStarts(activities) {
    const starts = new Map();
    activities.forEach(({ activityCode, startTime }) => {
        // Only whole rounds ("333-r1"), not groups ("333-r1-g2") or other activities (lunch)
        if (!/^[a-z0-9]+-r\d+$/.test(activityCode || "")) return;
        const start = Date.parse(startTime);
        // Keep the earliest start of the round
        if (Number.isFinite(start) && (!starts.has(activityCode) || start < starts.get(activityCode))) starts.set(activityCode, start);
    });
    return starts;
}

// When a competitor's group in a round started, from their "competitor" assignments, or null when the file has no groups
function groupStart(person, roundId, activities) {
    const group = (person.assignments || [])
        .filter(assignment => assignment.assignmentCode === "competitor")
        .map(assignment => activities.get(assignment.activityId))
        // Their group in this round: "333-r1-g2" for round "333-r1"
        .find(activity => activity?.activityCode?.startsWith(`${roundId}-g`));
    const start = Date.parse(group?.startTime);
    return Number.isFinite(start) ? start : null;
}

// A round's start when the schedule doesn't have it: the first day at 8:00, then 20 minutes per event and a minute per round, like WCA results
function fallbackStart(startDate, eventIndex, roundNumber) {
    // "2026-10-31T08:00:00", without a time zone, is 8:00 local time
    return new Date(`${startDate}T08:00:00`).getTime() + eventIndex * 20 * MINUTE + roundNumber * MINUTE;
}

// The competitors with results as [{ name, wcaId, competition, events: [{ name, event, rounds: [{ mode, solves }] }] }], sorted by name
function readWcifFile(data) {
    const competition = data.shortName || data.name || data.id || "Competition";
    const activities = scheduleActivities(data.schedule);
    const starts = roundStarts(activities);
    // A file without a schedule counts as today
    const startDate = data.schedule?.startDate ?? new Date().toISOString().slice(0, 10);

    // Each round's results by competitor (personId is the competitor's registrantId)
    const resultsByRound = new Map(data.events.flatMap(wcifEvent => (wcifEvent.rounds || []).map(round =>
        [round.id, new Map((round.results || []).map(result => [result.personId, result]))])));

    return data.persons
        .map(person => ({
            name: person.name,
            wcaId: person.wcaId,      // null for a newcomer
            competition,
            events: WCA_EVENTS
                .map(([wcaEvent, event, eventName], eventIndex) => {
                    const wcifEvent = data.events.find(e => e.id === wcaEvent);
                    const rounds = (wcifEvent?.rounds || []).flatMap(round => {
                        const result = resultsByRound.get(round.id).get(person.registrantId);
                        // WCIF 2 (WCA Live) calls an attempt's number "value", WCIF 1 "result"; 0 is an attempt not done (a missed cutoff, not entered yet)
                        const attempts = (result?.attempts || []).map(a => a.value ?? a.result).filter(value => value);
                        if (attempts.length === 0) return [];

                        // "333-r2" → 2
                        const roundNumber = Number(round.id.split("-r")[1]) || 1;
                        // Their group's start, else the round's, else a made-up one; then a second per attempt, to keep them in order
                        const start = groupStart(person, round.id, activities)
                            ?? starts.get(round.id)
                            ?? fallbackStart(startDate, eventIndex, roundNumber);
                        return [{
                            mode: roundMode(round.format, attempts.length),
                            solves: attempts.map((value, i) => convertWcaAttempt(value, wcaEvent, event, start + i * SECOND, competition))
                        }];
                    });
                    return { name: `${competition} ${eventName}`, event, rounds };
                })
                // Events they didn't compete in
                .filter(({ rounds }) => rounds.length > 0)
        }))
        // Registered but no results (didn't show up, or the competition hasn't started)
        .filter(({ events }) => events.length > 0)
        .sort((a, b) => a.name.localeCompare(b.name));
}

export { readWcifFile };
