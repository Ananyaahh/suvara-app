# Suvara voiceover

The nine narration clips live in `src/assets/voice/` (WAV, 24 kHz mono, Olin voice from AI Studio) and are bundled
into the app, so playback is fully offline. File name = cue key (see `voice-script.json`):
inhale_right, exhale_left, inhale_left, exhale_right, hold_breath, relax_breathe,
meditate_naturally, naadi_transition, pranayamam_transition.

- `voice/originals/` holds the untouched files as supplied; the bundled copies are only volume-matched.
- To replace a clip, overwrite the file with the same name (.wav or .mp3) and rebuild.
- A cue with no clip falls back to the device's built-in voice.
- `voice/reference/olin-sample.wav` is the original sample (not bundled).
