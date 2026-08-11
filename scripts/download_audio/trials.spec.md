# trials.py

- `load_trials(json_path)` — reads `s07_ema.json`, returns its `trials`
  array (or exits the process if the file is missing/unreadable).
- `URL_OVERRIDES` / `resolve_url(url)` — a handful of DEAP dataset YouTube
  links are known dead/region-blocked; `resolve_url` swaps them for a known
  working fallback and returns other URLs unchanged.
