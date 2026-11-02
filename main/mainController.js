// Copyright (C) 2026 Caio Almeida Martins. All rights reserved. See LICENSE.

// Entry point: importing a controller runs its startup code (listeners, saved settings, first render)

// Keyboard and touch timing, and the last solve on the timer
import { showLastSolve } from "../timer/timerController.js";
// Saved settings and colors, applied before anything is drawn
import "../settings/settingsController.js";
// Category, event, average mode and penalty buttons
import "../topbar/topbarController.js";
// Statistics page
import "../stats/statsController.js";
// Details pop-up
import "../modal/modalController.js";
// Export and import of solves (Settings → Data)
import "../importExport/importExportController.js";
// Typed-in times
import "../timeTyping/timeTypingController.js";
// Service worker for offline use, and the new version bar
import "../offline/offlineController.js";
// Event layout and scrambles
import { initEvent } from "../event/eventController.js";

// The session's last solve on the timer, without waiting for the scramble (FMC and Multi-Blind keep their countdown)
showLastSolve();

// The top bar fills the category and event selects, so the first scramble comes after it
await initEvent();