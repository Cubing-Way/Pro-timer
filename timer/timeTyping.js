import { averageOfN, parseTimeToSeconds, formatSecondsToTime } from "../average.js";
import { currentScramble, displayScramble } from "../scramble.js";
import { timerObj } from "./timerState.js";
import { vis, eventObj } from "../topbar/event.js";
import { timerSettObj } from "../settings/timerSetObj.js";
import { renderHistory } from "../render.js";
import { addAverageBlock } from "../solve.js";
import { updateTypingUI } from "../settings/timerSett.js";
import { saveSessions } from "../session.js";

let lastTime = null;
// Handle typed time submission
document.addEventListener("DOMContentLoaded", () => {
    updateTypingUI();
    const addBtn = document.getElementById("typed-time-add");
    const input = document.getElementById("typed-time");

    if (addBtn && input) {
        addBtn.addEventListener("click", () => {
        const rawInput = input.value;
        const normalized = normalizeTypedTime(rawInput);

        if (!normalized) {
            input.style.border = '2px solid #e74c3c';
            input.focus();
            setTimeout(() => input.style.border = '', 1500);
            return;
        }

        const seconds = parseTimeToSeconds(normalized);
            if (!Number.isFinite(seconds)) {
                input.style.border = '2px solid #e74c3c';
                input.focus();
                setTimeout(() => input.style.border = '', 1500);
                return;
            }
            lastTime = formatSecondsToTime(seconds);
            document.getElementById("timer").textContent = lastTime;
            const block = averageOfN(seconds, currentScramble, timerObj.inspection, timerSettObj.inspectionType);
            if (block) addAverageBlock(block);
            renderHistory();
            displayScramble(eventObj.event, vis);
            saveSessions();
            input.value = "";
        });

        input.addEventListener("keydown", (ev) => {
            if (ev.key === "Enter") {
                ev.preventDefault();
                addBtn.click();
            }
        });
    }
});

function normalizeTypedTime(raw) {
    raw = raw.trim().replace(',', '.');

    if (!raw) return null;

    // If user already typed ":" or ".", assume manual format
    if (raw.includes(":") || raw.includes(".")) {
        return raw;
    }

    // Only digits allowed
    if (!/^\d+$/.test(raw)) return null;

    const digits = raw;

    // 1 digit → 0.0x
    if (digits.length === 1) {
        return `0.0${digits}`;
    }

    // 2 digits → 0.xx
    if (digits.length === 2) {
        return `0.${digits}`;
    }

    // 3+ digits
    const hundredths = digits.slice(-2);
    const rest = digits.slice(0, -2);

    if (rest.length <= 2) {
        return `${rest}.${hundredths}`;
    }

    const seconds = rest.slice(-2);
    const minutes = rest.slice(0, -2);

    return `${minutes}:${seconds}.${hundredths}`;
}

export { lastTime };