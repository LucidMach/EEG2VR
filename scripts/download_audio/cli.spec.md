# cli.py

`main()` — orchestrates the whole download run: [[bootstrap|ensure_yt_dlp]],
[[trials|load_trials]] from `src/data/s07_ema.json`, then for each trial
resolves URL overrides ([[trials|resolve_url]]), skips ones already
downloaded, and calls [[downloader|download_trial_audio]] — printing a
final success/skipped/failed tally.

Entry point is the repo-root `download_audio.py`, kept as a thin wrapper so
`./download_audio.py` still works from the repo root.
