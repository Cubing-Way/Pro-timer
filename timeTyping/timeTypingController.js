import { averageOfN, parseTimeToSeconds, formatSecondsToTime } from "../average/avgController.js";
import { currentScramble, displayScramble } from "../scramble/scrambleController.js";
import { timerObj } from "../timer/timerState.js";
import { vis, eventObj } from "../event/eventController.js";
import { timerSettObj } from "../settings/settingsState.js";
import { renderHistory } from "../render/renderController.js";
import { addAverageBlock } from "../session/sessionController.js";
import { updateTypingUI } from "../settings/settingsController.js";
import { saveSessions } from "../session/sessionController.js";

let lastTime = null;

function initTypingSubmission() {
    updateTypingUI();
    const addBtn = document.getElementById("typed-time-add");
    const input = document.getElementById("typed-time");


    if (addBtn && input) {
        addBtn.addEventListener("click", () => {
            const rawInput = input.value;
            const normalized = normalizeTypedTime(rawInput);

            if (!normalized) {
                console.warn("[timeTyping] invalid input rejected");
                input.style.border = '2px solid #e74c3c';
                input.focus();
                setTimeout(() => input.style.border = '', 1500);
                return;
            }

            const seconds = parseTimeToSeconds(normalized);

            if (!Number.isFinite(seconds)) {
                console.warn("[timeTyping] parsed value is not finite");
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
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initTypingSubmission);
} else {
    initTypingSubmission();
}

function normalizeTypedTime(raw) {
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

    // 3+ digits
    const hundredths = digits.slice(-2);
    const rest = digits.slice(0, -2);

    if (rest.length <= 2) {
        const result = `${rest}.${hundredths}`;
        return result;
    }

    const seconds = rest.slice(-2);
    const minutes = rest.slice(0, -2);
    const result = `${minutes}:${seconds}.${hundredths}`;
    return result;
}

export { lastTime };