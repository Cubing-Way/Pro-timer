# Plan: Cubisz metrics and their statistics

## Goal

Send a solution in Pro Timer and get metrics back from Cubisz, inside the app. Then add statistics for those metrics. Reviewing one solve in depth stays on the Cubisz site.

Notion (Pro Timer → Próximos passos → 🚀 V2 → "Integrate with cubisz solve review"): "Send the solution in the app, and it returns metrics" and "Add statistics for those metrics". Cubisz → 🔗 Integrações: "Integrate Cubisz into Pro Timer".

## Decisions (2026-11-02)

- **Hidden iframe, not bundling.** Pro Timer loads Cubisz's `engine.html` in a hidden iframe and talks to it with `postMessage`.
  - Bundling would need Puzzly installed next to Pro Timer, Vite 7 vs 8 and cubing.js 0.66 vs 0.63 sorted out, and 3.5 MB more for the offline cache.
  - With the iframe, the engine has one home, and engine updates reach the app by deploying Cubisz.
  - Only `metrics/metricsClient.js` knows about the iframe, so a paid plan or a real backend can replace it without touching the rest.
- **The review tries AWS first, then the device** (Caio's choice, after first trying device only). It's faster and doesn't depend on the user's device, but the server's budget is 3,600 GB-seconds a month, shared with everyone on the Cubisz site, and the account's US$0.10 limit is what caps it. When the budget runs out, reviews and the site both solve on the device until the next month.
- **The review runs in a worker** (`engine-worker.js`). On the live sites the iframe is the same site as the timer, so it shares the timer's main thread, and a long task there could delay stopping the timer.
- **Only `333` gets metrics** (`isMetricsEvent`). The speed model is for two hands, and the method is CFOP, so one-handed, feet, BLD and Fewest Moves would give wrong numbers.
- **Method: picked in Settings → Cubisz review**, from the list Cubisz sends (20 methods, without its "Computer fastest" ones, which take minutes). Until one is picked, it's CFOP level 3, the one the site starts on. It's saved in `metrics.method`, so statistics can group by it.
- **Submit is the send button.** Submitting again with another method reviews again, and the old metrics stay until the new ones arrive.
- **"Full analysis on Cubisz" link** next to the metrics: it opens the site with the same solve, method and saved engine runs (`metrics.runs`), and the site rebuilds the review from them with no engine call (`seedRuns`). Only the runs need the engine, so saving them (1.9 KB) is what makes reopening free.

## What I found

- On AWS (measured 2026-11-02, 7-step solve, 7 calls): 11 s and 25 GB-seconds on a warm container, 18 s and 42 GB-seconds on a new one. Calls stop when under ~353 GB-seconds are left, so that's roughly 80 to 130 reviews a month in all.
- On a 4-thread PC: 51 s the first time (builds and stores tables), 38 s after that. Other devices are untested.
- Other methods, timed on this PC with one CFOP solve: ZZ (EOLine) 1 s, Roux 10 s, CFOP level 2 19 s, CFOP level 4 43 s, Beginner 117 s, CFOP with ZBLL 121 s. Only CFOP levels 2 and 3 have answer files on the server, so other methods' AWS cost isn't known yet and may be several times higher. A slower device could pass `REVIEW_LIMIT` (5 minutes) with the slowest ones.
- Both give the same metrics. Check the spend with the server's GET rarely: each one is a call, and waking a cold container costs about 6.5 GB-seconds.
- Without the engine, splitting a solution into steps and scoring your own moves takes about 250 ms, but it needs Puzzly's code, so it also goes through the engine page.
- A full review is 185 KB; `solveMetrics` (`cubisz/metrics.js`) brings it to about 3 KB per solve with CFOP level 3, 1.9 KB of it the engine runs. localStorage holds about 5 MB and also has every time, so more than a thousand or so reviewed solves would need another home, and `saveSessions` has no handling for a full localStorage yet.
- Rebuilding a review from saved runs was proven on 2026-11-02: 102 ms, no engine call, and byte for byte the same as the real review (189,840 bytes). Saved runs would also let later statistics recompute metrics without the engine if the scoring changes.
- Every field is listed in Cubisz's README, under "Engine for other apps". `version` is in the metrics so statistics can handle older ones.
- `averageOfN` copies solves when an average finishes, so solves are found again by `createdAt|time` (`findSolve`).

## Parts

### Part 1: send and get metrics (done, live)

- [x] Cubisz: `engine.html`, `engine.js`, `engine-worker.js`, `metrics.js`, second page in `vite.config.js`
- [x] Pro Timer: `metrics/` (client, controller, view, CSS), `isMetricsEvent`, Submit sends the solution
- [x] Fixes the solution check needed: `S` turning backwards, Fewest Moves mode staying on after leaving the event
- [x] The engine method setting (`requestMethods`, `reviewSettObj`, `APP_METHODS`) and the full analysis link (`analysisLink`, `loadSolveFromLink`, `seedRuns`), which needs no new engine run
- [x] READMEs

### Part 2: ship it

- [x] Commit both repos, on a `cubisz-metrics` branch in each
- [x] Deploy Cubisz first (the gh-pages branch), since the timer's live build loads its `engine.html`
- [x] Deploy Pro Timer, then submit a solve on the live site (2026-11-02: 23 s on a cold server, same scores as local, and its link rebuilt the review with no engine call)
- [x] Merge `cubisz-metrics` into `main` and push, in both repos
- [ ] Try the device fallback on a phone: time, memory, and whether the page survives, since phones land there once the budget is spent

### Part 3: statistics for the metrics

- [x] Choose which figures to chart (Caio's choice, 2026-11-02): effort score, move score, net effort, execution, TPS, and each step's moves and effort. Use only `complete` solves with one `method`
- [x] Add helpers in `stats/statsHelpers.js` that read `solve.metrics` from `getAllSolvesFromSession`, skipping solves without it
- [x] Add averages per period and charts to the stats page, following the existing period filter, with a method picker
- [x] Show the mean effort score on the average's card (Caio's choice: the card, not the sidebar)
- [x] Add a way to review many saved solves at once, since metrics only exist for solutions that were submitted. Batches solve on the device: with AWS first, one batch of ~100 solves would spend the whole month's budget. The review message's `deviceOnly` tells `engine-worker.js` to skip the server, and the engine page's `cubisz-ready` says it honours that, so the timer sends a batch to no older page
- [x] Commit and deploy Pro Timer (2026-11-03), then Puzzly's solve server and Cubisz (2026-11-04), with Puzzly's new speed model (f528b2a) in both
- [x] Try a batch on the live site (2026-11-04: 1 solve, 36 s on a PC, and the server's call count didn't move), and a normal review (9 s, 2 calls, 41 GB-seconds)
- [ ] Try a batch on a phone: batches lean on the same device solving as the phone item in Part 2
- [ ] Regenerate Puzzly's pair answer files once fingertricks are fully fixed (it's in Puzzly's Notion page), then `npm run server-deploy` (Puzzly's README, *Answer files*: move the old shards away first; about 2¼ hours on the old model, likely more now). Until then the server scores with the new costs but picks which pair answers to score by the old ones
- Reviews saved before 2026-11-04 keep their old numbers until they're reviewed again

### Part 4: later

- [ ] Decide what to do for OH, feet and BLD
- [ ] Add metrics to the share text (`modal/shareText.js`)
- [ ] Paid plan: the boundary to gate is `metricsClient.js` and the engine page
