import json
import os
import sys

# Overrides for known dead, deleted, or region-blocked YouTube links in the DEAP dataset
URL_OVERRIDES = {
    "http://www.youtube.com/watch?v=xxvw5vrJxos": "http://www.youtube.com/watch?v=iZ9vkd7Rp-g",
    "http://www.youtube.com/watch?v=nb1u7wMKywM": "http://www.youtube.com/watch?v=iZ9vkd7Rp-g",
}


def load_trials(json_path):
    if not os.path.exists(json_path):
        print(f"Error: Could not find {json_path}")
        sys.exit(1)

    try:
        with open(json_path, "r") as f:
            data = json.load(f)
    except Exception as e:
        print(f"Error reading JSON file {json_path}: {e}")
        sys.exit(1)

    return data.get("trials", [])


def resolve_url(url):
    return URL_OVERRIDES.get(url, url)
