import { averageOfN, parseTimeToSeconds, formatSecondsToTime } from "../average.js";
import { currentScramble, displayScramble } from "../scramble.js";
import { timerObj } from "./timerState.js";
import { vis, eventObj } from "../topbar/event.js";
import { timerSettObj } from "../settings/timerSett.js";
import { renderHistory } from "../render.js";
import { addAverageBlock } from "../solve.js";
import { updateTypingUI } from "../settings/timerSett.js";

let lastTime = null;
// Handle typed time submission
document.addEventListener("DOMContentLoaded", () => {
    updateTypingUI();
    const addBtn = document.getElementById("typed-time-add");
    const input = document.getElementById("typed-time");

    if (addBtn && input) {
        addBtn.addEventListener("click", () => {
            const raw = input.value.trim().replace(',', '.');
            if (!raw) return;
            const seconds = parseTimeToSeconds(raw);
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

export { lastTime };