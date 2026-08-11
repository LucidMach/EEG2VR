# bootstrap.py

`ensure_yt_dlp()` — imports `yt_dlp`, installing it via
`pip install --break-system-packages yt-dlp` first if it's missing (the flag
is needed on macOS Python 3.12+'s externally-managed environments). Exits
the process with a message if installation fails.

Must run before [[downloader|download_trial_audio]] is *called* — that
function imports `yt_dlp` lazily, so the module itself can be imported
without it installed, but calling it before `ensure_yt_dlp()` has run will
still raise `ImportError`. [[cli]] calls this first in `main()`.
