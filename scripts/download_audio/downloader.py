import os


def audio_already_downloaded(target_dir, name):
    return os.path.exists(os.path.join(target_dir, f"{name}.mp3")) or os.path.exists(
        os.path.join(target_dir, f"{name}.m4a")
    )


# Downloads one trial's audio, preferring m4a/aac (needs no ffmpeg/ffprobe),
# falling back to plain bestaudio if the preferred format fails.
def download_trial_audio(target_dir, name, url):
    import yt_dlp

    print(f"\nDownloading '{name}' from {url}...")

    ydl_opts = {
        "format": "m4a/bestaudio/best",
        "outtmpl": os.path.join(target_dir, f"{name}.%(ext)s"),
        "quiet": False,
        "no_warnings": True,
    }

    try:
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            ydl.download([url])
        print(f"Successfully downloaded '{name}'!")
        return True
    except Exception as e:
        print(f"Error downloading '{name}': {e}")
        print("Trying fallback without format restriction...")
        ydl_opts_fallback = {
            "format": "bestaudio",
            "outtmpl": os.path.join(target_dir, f"{name}.%(ext)s"),
        }
        try:
            with yt_dlp.YoutubeDL(ydl_opts_fallback) as ydl:
                ydl.download([url])
            print(f"Successfully downloaded '{name}' (via fallback)!")
            return True
        except Exception as fe:
            print(f"Fallback also failed for '{name}': {fe}")
            return False
