#!/usr/bin/env bash
# Use this if you generated the clips by hand in AI Studio and downloaded them as WAV.
# Put the WAVs in ./voice/incoming/ named exactly like the cues (inhale_right.wav, ...),
# then run:  bash tools/process_voice.sh
set -euo pipefail
cd "$(dirname "$0")/.."
mkdir -p src/assets/voice
for f in voice/incoming/*.wav; do
  n=$(basename "$f" .wav)
  ffmpeg -y -loglevel error -i "$f" \
    -af "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=1:stop_threshold=-45dB:stop_duration=0.4,loudnorm=I=-18:TP=-1.5:LRA=7" \
    -ar 44100 -b:a 96k "src/assets/voice/$n.mp3"
  echo "wrote src/assets/voice/$n.mp3"
done
