import { averageOfN, parseTimeToSeconds, formatSecondsToTime } from "../average/avgController.js";
import { currentScramble, displayScramble } from "../scramble/scrambleController.js";
import { timerObj } from "../timer/timerState.js";
import { vis, eventObj } from "../event/eventController.js";
import { timerSettObj } from "../settings/timerSetObj.js";
import { renderHistory } from "../render/renderController.js";
import { addAverageBlock } from "../session/sessionController.js";
import { updateTypingUI } from "../settings/settingsController.js";
import { saveSessions } from "../session/sessionController.js";

let lastTime = null;

function initTypingSubmission() {
    console.log("[timeTyping] initTypingSubmission fired");
    updateTypingUI();
    const addBtn = document.getElementById("typed-time-add");
    const input = document.getElementById("typed-time");

    console.log("[timeTyping] typed elements", { addBtn: !!addBtn, input: !!input });

    if (addBtn && input) {
        addBtn.addEventListener("click", () => {
            console.log("[timeTyping] Add button clicked");
            const rawInput = input.value;
            console.log("[timeTyping] rawInput:", rawInput);
            const normalized = normalizeTypedTime(rawInput);
            console.log("[timeTyping] normalized:", normalized);

            if (!normalized) {
                console.warn("[timeTyping] invalid input rejected");
                input.style.border = '2px solid #e74c3c';
                input.focus();
                setTimeout(() => input.style.border = '', 1500);
                return;
            }

            const seconds = parseTimeToSeconds(normalized);
            console.log("[timeTyping] parsed seconds:", seconds);

            if (!Number.isFinite(seconds)) {
                console.warn("[timeTyping] parsed value is not finite");
                input.style.border = '2px solid #e74c3c';
                input.focus();
                setTimeout(() => input.style.border = '', 1500);
                return;
            }

            lastTime = formatSecondsToTime(seconds);
            console.log("[timeTyping] formatted time:", lastTime);
            document.getElementById("timer").textContent = lastTime;
            console.log("[timeTyping] timer text set");

            const block = averageOfN(seconds, currentScramble, timerObj.inspection, timerSettObj.inspectionType);
            console.log("[timeTyping] averageOfN block:", block);
            if (block) addAverageBlock(block);
            renderHistory();
            displayScramble(eventObj.event, vis);
            saveSessions();
            console.log("[timeTyping] session saved");
            input.value = "";
        });

        input.addEventListener("keydown", (ev) => {
            console.log("[timeTyping] keydown:", ev.key);
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
    console.log("[timeTyping normalize] raw before trim:", raw);
    raw = raw.trim().replace(',', '.');
    console.log("[timeTyping normalize] raw after trim/replace:", raw);

    if (!raw) return null;

    // If user already typed ":" or ".", assume manual format
    if (raw.includes(":") || raw.includes(".")) {
        console.log("[timeTyping normalize] manual format path");
        return raw;
    }

    // Only digits allowed
    if (!/^\d+$/.test(raw)) {
        console.log("[timeTyping normalize] rejected non-digit input");
        return null;
    }

    const digits = raw;
    console.log("[timeTyping normalize] digits:", digits);

    // 1 digit → 0.0x
    if (digits.length === 1) {
        const result = `0.0${digits}`;
        console.log("[timeTyping normalize] 1-digit result:", result);
        return result;
    }

    // 2 digits → 0.xx
    if (digits.length === 2) {
        const result = `0.${digits}`;
        console.log("[timeTyping normalize] 2-digit result:", result);
        return result;
    }

    // 3+ digits
    const hundredths = digits.slice(-2);
    const rest = digits.slice(0, -2);
    console.log("[timeTyping normalize] hundredths/rest:", { hundredths, rest });

    if (rest.length <= 2) {
        const result = `${rest}.${hundredths}`;
        console.log("[timeTyping normalize] short result:", result);
        return result;
    }

    const seconds = rest.slice(-2);
    const minutes = rest.slice(0, -2);
    const result = `${minutes}:${seconds}.${hundredths}`;
    console.log("[timeTyping normalize] minute/second result:", result);
    return result;
}

export { lastTime };