import { averageOfN, parseTimeToSeconds, formatSecondsToTime } from "../average/avgController.js";
import { currentScramble, displayScramble } from "../scramble/scrambleController.js";
import { vis, eventObj } from "../event/eventController.js";
import { plus2CounterObj } from "../topbar/topbarState.js";
import { timerSettObj } from "../settings/settingsState.js";
import { renderHistory } from "../render/renderController.js";
import { addAverageBlock } from "../session/sessionController.js";
import { updateTypingUI } from "../settings/settingsController.js";
import { saveSessions } from "../session/sessionController.js";

// Last typed time, as shown on the timer
let lastTime = null;

// Shows or hides the typing box for the current setting, and wires the Add button and the Enter key
function initTypingSubmission() {
    updateTypingUI();
    const addBtn = document.getElementById("typed-time-add");
    const input = document.getElementById("typed-time");


    if (addBtn && input) {
        // Add: check the typed time, save it as a solve, then get ready for the next one
        addBtn.addEventListener("click", () => {
            const rawInput = input.value;
            const normalized = normalizeTypedTime(rawInput);

            // Not a time: flash the box red for 1.5 s
            if (!normalized) {
                console.warn("[timeTyping] invalid input rejected");
                input.style.border = '2px solid #e74c3c';
                input.focus();
                setTimeout(() => input.style.border = '', 1500);
                return;
            }

            const seconds = parseTimeToSeconds(normalized);

            // Had a "." or ":" but isn't a number (e.g. "ab.c")
            if (!Number.isFinite(seconds)) {
                console.warn("[timeTyping] parsed value is not finite");
                input.style.border = '2px solid #e74c3c';
                input.focus();
                setTimeout(() => input.style.border = '', 1500);
                return;
            }

            // Show the time on the timer, in the same format as a timed solve
            lastTime = formatSecondsToTime(seconds);
            document.getElementById("timer").textContent = lastTime;

            // Typed times have no tracked inspection, so 0 instead of the timer's last inspection time; no phases, and done with Typing
            const block = averageOfN(seconds, currentScramble, 0, timerSettObj.inspectionType, false, false, false, undefined, "Typing");
            if (block) addAverageBlock(block);

            // A new solve starts the +2 button over, like a timed solve does
            plus2CounterObj.penalty = 0;
            document.getElementById("penaltyPlus2Btn").textContent = "+2";
            renderHistory();
            displayScramble(eventObj.event, vis);
            saveSessions();
            input.value = "";
        });

        // Enter in the box works like the Add button
        input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                ev.preventDefault();
                addBtn.click();
            }
        });
    }
}

// Run once the page is parsed (it already is when modules run, so this normally calls it right away)
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTypingSubmission);
} else {
    initTypingSubmission();
}

// Turns what was typed into a time string: digits only are split into minutes, seconds and hundredths ("1234" → "12.34", "12345" → "1:23.45")
function normalizeTypedTime(raw) {
    // A comma counts as the decimal point
    raw = raw.trim().replace(',', '.');

    if (!raw) return null;

    // If user already typed ":" or ".", assume manual format
    if (raw.includes(":") || raw.includes(".")) {
        return raw;
    }

    // Only digits allowed
    if (!/^\d+$/.test(raw)) {
        return null;
    }

    const digits = raw;

    // 1 digit → 0.0x
    if (digits.length === 1) {
        const result = `0.0${digits}`;
        return result;
    }

    // 2 digits → 0.xx
    if (digits.length === 2) {
        const result = `0.${digits}`;
        return result;
    }

    // 3+ digits: the last two are hundredths
    const hundredths = digits.slice(-2);
    const rest = digits.slice(0, -2);

    // 3 or 4 digits: seconds.hundredths
    if (rest.length <= 2) {
        const result = `${rest}.${hundredths}`;
        return result;
    }

    // 5+ digits: minutes:seconds.hundredths
    const seconds = rest.slice(-2);
    const minutes = rest.slice(0, -2);
    const result = `${minutes}:${seconds}.${hundredths}`;
    return result;
}

export { lastTime };