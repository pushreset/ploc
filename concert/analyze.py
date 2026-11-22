# /// script
# requires-python = ">=3.10"
# dependencies = ["librosa>=0.10", "numpy"]
# ///
"""Offline rhythm charts for Ploc's Concert mini-game.

    uv run concert/analyze.py <youtube-id> [<id> ...]

Audio is downloaded to concert/.cache/ (gitignored, never committed) only to analyse it;
the game keeps the timings (concert/charts/<id>.json) and plays the music in the official YouTube player.
"""
import json
import pathlib
import subprocess
import sys

import librosa
import numpy as np

HERE = pathlib.Path(__file__).parent
CACHE, CHARTS = HERE / ".cache", HERE / "charts"
LANES = {"easy": 3, "normal": 4, "hard": 5}
MIN_GAP = {"easy": 0.32, "normal": 0.18, "hard": 0.09}  # seconds between two notes, keeps charts playable
HOP, SR = 512, 22050
YTDLP = ["uvx", "yt-dlp@latest"]  # an up-to-date yt-dlp: older builds get HTTP 403 from YouTube


def meta(vid):
    out = subprocess.run([*YTDLP, "--skip-download", "--dump-json", "--no-warnings", f"https://www.youtube.com/watch?v={vid}"],
                         capture_output=True, text=True, check=True).stdout
    return json.loads(out)


def download(vid):
    wav = CACHE / f"{vid}.wav"
    if not wav.exists():
        CACHE.mkdir(exist_ok=True)
        subprocess.run([*YTDLP, "-f", "bestaudio", "-x", "--audio-format", "wav", "--postprocessor-args", f"-ac 1 -ar {SR}", "--no-warnings",
                        "-o", str(CACHE / f"{vid}.%(ext)s"), f"https://www.youtube.com/watch?v={vid}"], check=True)
    return wav


def subdivide(beats, sub):
    """grid of `sub` points per beat, interpolated between tracked beats (follows tempo drift)"""
    pts = [b0 + (b1 - b0) * k / sub for b0, b1 in zip(beats[:-1], beats[1:]) for k in range(sub)]
    return np.array(pts + [beats[-1]])


def snap(times, grid, tol):
    idx = np.clip(np.searchsorted(grid, times), 1, len(grid) - 1)
    near = np.where(np.abs(grid[idx - 1] - times) < np.abs(grid[idx] - times), grid[idx - 1], grid[idx])
    return np.unique(near[np.abs(near - times) < tol])


def thin(times, gap):
    out = []
    for t in times:
        if not out or t - out[-1] >= gap:
            out.append(t)
    return np.array(out)


def lanes_for(times, cent_at, n):
    """low sounds left, high sounds right (quantiles of the spectral centroid), no more than 3 in a row on a lane"""
    c = cent_at(times)
    edges = np.quantile(c, np.linspace(0, 1, n + 1)[1:-1])
    lanes = list(np.searchsorted(edges, c))
    for i in range(3, len(lanes)):
        if lanes[i] == lanes[i - 1] == lanes[i - 2] == lanes[i - 3]:
            lanes[i] = lanes[i] + 1 if lanes[i] < n - 1 else lanes[i] - 1
    return [int(x) for x in lanes]


def analyse(path):
    y, sr = librosa.load(path, sr=SR, mono=True)
    env = librosa.onset.onset_strength(y=y, sr=sr, hop_length=HOP)
    tempo, beats = librosa.beat.beat_track(onset_envelope=env, sr=sr, hop_length=HOP, units="time")
    tempo = float(np.atleast_1d(tempo)[0])
    frames = librosa.onset.onset_detect(onset_envelope=env, sr=sr, hop_length=HOP)
    onsets, strength = librosa.frames_to_time(frames, sr=sr, hop_length=HOP), env[frames]
    cent = librosa.feature.spectral_centroid(y=y, sr=sr, hop_length=HOP)[0]
    rms = librosa.feature.rms(y=y, hop_length=HOP)[0]
    loud = rms > np.percentile(rms, 25)  # skip quiet intros / breaks
    to_f = lambda t: np.clip(librosa.time_to_frames(t, sr=sr, hop_length=HOP), 0, len(cent) - 1)
    cent_at = lambda t: cent[to_f(t)]
    keep_loud = lambda t: t[loud[to_f(t)]]
    period = float(np.median(np.diff(beats)))

    # easy = every other beat; normal = every beat (every other when fast) + strong off-beats; hard = + 16th-note hits
    easy = keep_loud(beats[::2] if tempo >= 100 else beats)
    base = beats[::2] if tempo > 140 else beats
    normal = keep_loud(np.union1d(base, snap(onsets[strength > np.percentile(strength, 55)], subdivide(beats, 2), period / 4)))
    hard = keep_loud(np.union1d(np.union1d(beats, normal), snap(onsets[strength > np.percentile(strength, 20)], subdivide(beats, 4), period / 8)))
    charts = {}
    for name, times in (("easy", easy), ("normal", normal), ("hard", hard)):
        times = thin(np.sort(times), MIN_GAP[name])
        charts[name] = [[round(float(t), 3), lane] for t, lane in zip(times, lanes_for(times, cent_at, LANES[name]))]
    return round(tempo, 1), charts


def main(ids):
    CHARTS.mkdir(exist_ok=True)
    index_path = HERE / "index.json"
    index = json.loads(index_path.read_text()) if index_path.exists() else []
    for vid in ids:
        m = meta(vid)
        if not m.get("playable_in_embed", True):
            print(f"✗ {vid}: la vidéo interdit l'intégration, impossible de la jouer dans Ploc")
            continue
        bpm, charts = analyse(download(vid))
        song = {"id": vid, "title": m["title"], "channel": m.get("channel", ""), "duration": m["duration"], "bpm": bpm, "lanes": LANES, "charts": charts}
        (CHARTS / f"{vid}.json").write_text(json.dumps(song, ensure_ascii=False, separators=(",", ":")))
        index = [s for s in index if s["id"] != vid] + [{k: song[k] for k in ("id", "title", "channel", "duration", "bpm")}]
        print(f"✓ {vid} « {m['title']} » {bpm} bpm — " + ", ".join(f"{k}: {len(v)} notes" for k, v in charts.items()))
    index_path.write_text(json.dumps(index, ensure_ascii=False, indent=1))


if __name__ == "__main__":
    main(sys.argv[1:] or sys.exit(__doc__))
