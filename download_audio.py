#!/usr/bin/env python3
import os
import subprocess
import sys
import json

def download_audio():
    print("=== EEG2VR Audio Downloader ===")
    
    # 1. Install/Verify yt-dlp library
    try:
        import yt_dlp
    except ImportError:
        print("yt-dlp is not installed. Attempting to install it via pip...")
        try:
            # We use --break-system-packages for macOS Python 3.12+ compatibility
            subprocess.check_call([sys.executable, "-m", "pip", "install", "--break-system-packages", "yt-dlp"])
            import yt_dlp
            print("yt-dlp successfully installed!")
        except Exception as e:
            print(f"Error installing yt-dlp: {e}")
            print("Please run 'pip install yt-dlp' manually in your terminal and try again.")
            sys.exit(1)

    # 2. Create the target directory if it doesn't exist
    target_dir = os.path.join("public", "audio")
    os.makedirs(target_dir, exist_ok=True)
    print(f"Target directory verified: {target_dir}")

    # 3. Load s07_ema.json to extract trial youtube links
    json_path = os.path.join("src", "data", "s07_ema.json")
    if not os.path.exists(json_path):
        print(f"Error: Could not find {json_path}")
        sys.exit(1)
        
    try:
        with open(json_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file {json_path}: {e}")
        sys.exit(1)

    trials = data.get("trials", [])
    if not trials:
        print("No trials found in the JSON file.")
        sys.exit(0)

    print(f"Found {len(trials)} trials in s07_ema.json. Starting download...")

    # 4. Download each trial's audio
    success_count = 0
    skipped_count = 0
    fail_count = 0

    # Overrides for known dead, deleted, or region-blocked YouTube links in the DEAP dataset
    url_overrides = {
        "http://www.youtube.com/watch?v=xxvw5vrJxos": "http://www.youtube.com/watch?v=iZ9vkd7Rp-g",  # Deleted video fallback to Jungle Drum
        "http://www.youtube.com/watch?v=nb1u7wMKywM": "http://www.youtube.com/watch?v=iZ9vkd7Rp-g",  # Blocked video fallback to Jungle Drum
    }

    for trial in trials:
        trial_no = trial.get("trial_no")
        url = trial.get("youtube_link")
        if trial_no is None or not url:
            print(f"Warning: Trial missing trial_no or youtube_link. Skipping.")
            skipped_count += 1
            continue

        # Apply override if URL is known to be dead/blocked
        if url in url_overrides:
            print(f"Applying fallback override for trial {trial_no} URL: {url} -> {url_overrides[url]}")
            url = url_overrides[url]

        name = f"video-{trial_no+1:02d}"
        
        # Check if file already exists in either format (m4a or mp3)
        if os.path.exists(os.path.join(target_dir, f"{name}.mp3")) or os.path.exists(os.path.join(target_dir, f"{name}.m4a")):
            print(f"Audio file for '{name}' already exists. Skipping download.")
            success_count += 1
            continue

        print(f"\nDownloading '{name}' from {url}...")
        
        # We download the best quality audio natively as m4a/aac to avoid needing ffmpeg/ffprobe
        ydl_opts = {
            'format': 'm4a/bestaudio/best',
            'outtmpl': os.path.join(target_dir, f"{name}.%(ext)s"),
            'quiet': False,
            'no_warnings': True,
        }

        try:
            with yt_dlp.YoutubeDL(ydl_opts) as ydl:
                ydl.download([url])
            print(f"Successfully downloaded '{name}'!")
            success_count += 1
        except Exception as e:
            print(f"Error downloading '{name}': {e}")
            print("Trying fallback without format restriction...")
            ydl_opts_fallback = {
                'format': 'bestaudio',
                'outtmpl': os.path.join(target_dir, f"{name}.%(ext)s"),
            }
            try:
                with yt_dlp.YoutubeDL(ydl_opts_fallback) as ydl:
                    ydl.download([url])
                print(f"Successfully downloaded '{name}' (via fallback)!")
                success_count += 1
            except Exception as fe:
                print(f"Fallback also failed for '{name}': {fe}")
                fail_count += 1

    print("\n=== Download process completed! ===")
    print(f"Total: {len(trials)} | Success (incl. existing): {success_count} | Skipped/Invalid: {skipped_count} | Failed: {fail_count}")

if __name__ == "__main__":
    download_audio()
