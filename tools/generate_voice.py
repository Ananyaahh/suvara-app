#!/usr/bin/env python3
"""Generate every Suvara voiceover clip with Google AI Studio (Gemini TTS) in ONE voice.

Setup:   pip install google-genai
Run:     GEMINI_API_KEY=... VOICE_NAME="<voice you picked in AI Studio>" python3 tools/generate_voice.py
Needs:   ffmpeg on PATH. Output: src/assets/voice/<cue-key>.mp3 (bundled offline by the app).

VOICE_NAME is the prebuilt voice shown in AI Studio's voice dropdown / "Get code" panel for
the sample you liked. It cannot be read from the WAV, so set it yourself. Optional:
TTS_MODEL (default gemini-2.5-flash-preview-tts), VOICE_STYLE to override the style prompt.
"""
import json, os, subprocess, sys, wave, pathlib

root = pathlib.Path(__file__).resolve().parent.parent
script = json.loads((root / "voice" / "voice-script.json").read_text(encoding="utf-8"))
out_dir = root / "src" / "assets" / "voice"
out_dir.mkdir(parents=True, exist_ok=True)

api_key = os.environ.get("GEMINI_API_KEY")
voice = os.environ.get("VOICE_NAME")
if not api_key or not voice:
    sys.exit("Set GEMINI_API_KEY and VOICE_NAME first (see the docstring).")
model = os.environ.get("TTS_MODEL", "gemini-2.5-flash-preview-tts")
style = os.environ.get("VOICE_STYLE", script["voice_style"])

from google import genai
from google.genai import types

client = genai.Client(api_key=api_key)
for clip in script["clips"]:
    name = clip["file"].removesuffix(".mp3")
    resp = client.models.generate_content(
        model=model,
        contents=f'{style}\n\n"{clip["text"]}"',
        config=types.GenerateContentConfig(
            response_modalities=["AUDIO"],
            speech_config=types.SpeechConfig(
                voice_config=types.VoiceConfig(prebuilt_voice_config=types.PrebuiltVoiceConfig(voice_name=voice))
            ),
        ),
    )
    pcm = resp.candidates[0].content.parts[0].inline_data.data  # 24 kHz, 16-bit, mono PCM
    wav = out_dir / f"{name}.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(24000); w.writeframes(pcm)
    mp3 = out_dir / f"{name}.mp3"
    # trim leading/trailing silence, even loudness, compact mp3
    subprocess.run([
        "ffmpeg", "-y", "-loglevel", "error", "-i", str(wav),
        "-af", "silenceremove=start_periods=1:start_threshold=-45dB:stop_periods=1:stop_threshold=-45dB:stop_duration=0.4,loudnorm=I=-18:TP=-1.5:LRA=7",
        "-ar", "44100", "-b:a", "96k", str(mp3)], check=True)
    wav.unlink()
    print("wrote", mp3.relative_to(root))
print("Done. Rebuild the app so the clips are bundled.")
