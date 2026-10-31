/*
Copyright (C) 2026 Caio Almeida Martins

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.
See the GNU General Public License for more details.

This project includes code derived from csTimer
(https://github.com/cs0x7f/cstimer),
licensed under GPLv3.
*/

// Entry point: importing a controller runs its startup code (listeners, saved settings, first render)

// Keyboard and touch timing
import  "../timer/timerController.js";
// Saved settings and colors, applied before anything is drawn
import "../settings/settingsController.js";
// Category, event, average mode and penalty buttons
import "../topbar/topbarController.js";
// Statistics page
import "../stats/statsController.js";
// Details pop-up
import "../modal/modalController.js";
// Typed-in times
import "../timeTyping/timeTypingController.js";
// Service worker for offline use, and the new version bar
import "../offline/offlineController.js";
// Event layout and scrambles
import { initEvent } from "../event/eventController.js";

// The top bar fills the category and event selects, so the first scramble comes after it
await initEvent();