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


import  "../timer/timerController.js";
import "../settings/settingsController.js";
import "../topbar/topbarController.js";
import "../stats/statsController.js";
import "../modal/modalController.js";
import "../timeTyping/timeTypingController.js";
import { initEvent } from "../event/eventController.js";

// The top bar fills the category and event selects, so the first scramble comes after it
await initEvent();