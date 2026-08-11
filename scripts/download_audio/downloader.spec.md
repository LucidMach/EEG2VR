# downloader.py

- `audio_already_downloaded(target_dir, name)` — true if `name.mp3` or
  `name.m4a` already exists in `target_dir`.
- `download_trial_audio(target_dir, name, url)` — downloads via `yt_dlp`,
  preferring `m4a/bestaudio/best` (native m4a/aac needs no ffmpeg/ffprobe),
  falling back to plain `bestaudio` if the preferred format fails. Returns
  whether either attempt succeeded.

**Non-obvious**: imports `yt_dlp` lazily inside the function rather than at
module top level, so this module can be imported before
[[bootstrap|ensure_yt_dlp()]] has had a chance to install the package —
[[cli]] imports this module only after bootstrap runs.
