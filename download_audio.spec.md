# download_audio.py

Thin CLI entrypoint (`./download_audio.py` or `python3 download_audio.py`
from the repo root) for `scripts/download_audio/`'s `cli.main()` — see
`scripts/download_audio/cli.spec.md` for the actual download flow
(bootstrap yt-dlp, load DEAP trial list, download each trial's audio into
`public/audio/`).
