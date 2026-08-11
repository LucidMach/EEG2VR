import os

from .bootstrap import ensure_yt_dlp
from .downloader import audio_already_downloaded, download_trial_audio
from .trials import load_trials, resolve_url


def main():
    print("=== EEG2VR Audio Downloader ===")
    ensure_yt_dlp()

    target_dir = os.path.join("public", "audio")
    os.makedirs(target_dir, exist_ok=True)
    print(f"Target directory verified: {target_dir}")

    json_path = os.path.join("src", "data", "s07_ema.json")
    trials = load_trials(json_path)
    if not trials:
        print("No trials found in the JSON file.")
        return

    print(f"Found {len(trials)} trials in s07_ema.json. Starting download...")

    success_count = 0
    skipped_count = 0
    fail_count = 0

    for trial in trials:
        trial_no = trial.get("trial_no")
        original_url = trial.get("youtube_link")
        if trial_no is None or not original_url:
            print("Warning: Trial missing trial_no or youtube_link. Skipping.")
            skipped_count += 1
            continue

        url = resolve_url(original_url)
        if url != original_url:
            print(f"Applying fallback override for trial {trial_no} URL: {original_url} -> {url}")

        name = f"video-{trial_no + 1:02d}"

        if audio_already_downloaded(target_dir, name):
            print(f"Audio file for '{name}' already exists. Skipping download.")
            success_count += 1
            continue

        if download_trial_audio(target_dir, name, url):
            success_count += 1
        else:
            fail_count += 1

    print("\n=== Download process completed! ===")
    print(
        f"Total: {len(trials)} | Success (incl. existing): {success_count} | "
        f"Skipped/Invalid: {skipped_count} | Failed: {fail_count}"
    )
