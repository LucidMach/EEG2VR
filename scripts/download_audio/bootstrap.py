import subprocess
import sys


# Installs yt-dlp via pip if it isn't already available, then returns the module.
def ensure_yt_dlp():
    try:
        import yt_dlp
        return yt_dlp
    except ImportError:
        print("yt-dlp is not installed. Attempting to install it via pip...")
        try:
            # --break-system-packages for macOS Python 3.12+ compatibility
            subprocess.check_call(
                [sys.executable, "-m", "pip", "install", "--break-system-packages", "yt-dlp"]
            )
            import yt_dlp
            print("yt-dlp successfully installed!")
            return yt_dlp
        except Exception as e:
            print(f"Error installing yt-dlp: {e}")
            print("Please run 'pip install yt-dlp' manually in your terminal and try again.")
            sys.exit(1)
