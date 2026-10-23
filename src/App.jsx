import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, X, Settings as SettingsIcon, Info, ArrowLeft, Volume2, Vibrate, Mic, Gauge, Trash2, Sun, Moon, Wind } from "lucide-react";

import bellAudioUrl from "./assets/audio/temple-bell.mp3";
import naadiImg from "./assets/images/naadi.jpg";
import pranayamamImg from "./assets/images/pranayamam.jpg";
import dhyanamImg from "./assets/images/dhyanam.jpg";
import completeImg from "./assets/images/complete.jpg";
import naadiHeroImg from "./assets/images/naadi-hero.jpg";
import pranayamamHeroImg from "./assets/images/pranayamam-hero.jpg";
import dhyanamHeroImg from "./assets/images/dhyanam-hero.jpg";
import completeHeroImg from "./assets/images/complete-hero.jpg";
import "./App.css";



function useBellPlayer() {
  const ctxRef = useRef(null);
  const bufferRef = useRef(null);
  const pendingRef = useRef(null); // volume to play once decode finishes, if a tap arrives first

  const playBuffer = useCallback((volume) => {
    const ctx = ctxRef.current;
    if (!ctx || !bufferRef.current) return;
    const src = ctx.createBufferSource();
    src.buffer = bufferRef.current;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(ctx.destination);
    src.start(0);
  }, []);

  // Decode the audio as soon as the component mounts — NOT inside a tap
  // handler — so playback itself never has to await anything.
  useEffect(() => {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    ctxRef.current = ctx;
    fetch(bellAudioUrl)
      .then((res) => res.arrayBuffer())
      .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
      .then((buf) => {
      bufferRef.current = buf;
      if (pendingRef.current !== null) {
        const vol = pendingRef.current;
        pendingRef.current = null;
        playBuffer(vol);
      }
    }).catch(() => {});
    return () => { ctx.close?.(); };
  }, [playBuffer]);

  const play = useCallback((volume = 0.85) => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    // iOS unlock trick: play a near-silent buffer synchronously inside the
    // tap itself. This permanently unlocks the AudioContext for this page,
    // regardless of whether the real bell has finished decoding yet.
    try {
      const silent = ctx.createBuffer(1, 1, 22050);
      const s = ctx.createBufferSource();
      s.buffer = silent;
      s.connect(ctx.destination);
      s.start(0);
    } catch {}
    if (bufferRef.current) {
      playBuffer(volume);
    } else {
      pendingRef.current = volume; // fires the moment decode finishes
    }
  }, [playBuffer]);

  return play;
}

/* ---------------- Practice data (from spec) ---------------- */

const NAADI_STAGES = [
  { instructionKey: "inhale_right", duration: 8, nostril: "right", action: "inhale" },
  { instructionKey: "exhale_left", duration: 16, nostril: "left", action: "exhale" },
  { instructionKey: "inhale_left", duration: 8, nostril: "left", action: "inhale" },
  { instructionKey: "exhale_right", duration: 16, nostril: "right", action: "exhale" },
];

const PRANAYAMAM_STAGES = [
  { instructionKey: "inhale_right", duration: 8, nostril: "right", action: "inhale" },
  { instructionKey: "hold_breath", duration: 20, nostril: "right", action: "hold" },
  { instructionKey: "exhale_left", duration: 16, nostril: "left", action: "exhale" },
  { instructionKey: "relax_breathe", duration: 20, nostril: "left", action: "relax" },
  { instructionKey: "inhale_left", duration: 8, nostril: "left", action: "inhale" },
  { instructionKey: "hold_breath", duration: 20, nostril: "left", action: "hold" },
  { instructionKey: "exhale_right", duration: 16, nostril: "right", action: "exhale" },
  { instructionKey: "relax_breathe", duration: 20, nostril: "right", action: "relax" },
];

const DHYANAM_DURATION_SEC = 20 * 60;
const dhyanamStages = (sec) => [
  { instructionKey: "meditate_naturally", duration: sec, nostril: null, action: "meditate" },
];

const TRANSLATIONS = {
  en: {
    inhale_right: "Inhale through right nostril",
    exhale_left: "Exhale through left nostril",
    inhale_left: "Inhale through left nostril",
    exhale_right: "Exhale through right nostril",
    hold_breath: "Hold your breath",
    relax_breathe: "Relax and breathe naturally",
    meditate_naturally: "Breathe naturally. Let thoughts settle.",
    posture_title: "Posture",
    posture_text: "Sit in Padmasana or Sukhasana, or on a chair with both feet supported. Keep the spine naturally erect.",
    mudra_title: "Chin Mudra",
    mudra_text: "Gently join the tip of the index finger and thumb, palms facing upward on the knees. Never forced.",
    safety_title: "Safety",
    safety_text: "Practise within your comfort. Never strain the breath. Stop if you feel dizziness, pain or discomfort.",
    start: "Start",
    instructions: "Instructions",
    begin_practice: "Begin Practice",
    pause: "Pause",
    end_session: "End Session",
    done: "Done",
    skip_countdown: "Skip Countdown",
    get_ready: "Get ready",
    breathe_calm: "Breathe in calm",
    before_you_begin: "Before you begin",
    default_cycles: "Default cycles",
    take_moment: "Take a moment for yourself.",
    guide_practice: "Guide the practice, then step aside.",
    settings: "Settings",
    session_complete: "Session complete",
    well_practiced: "Well practiced.",
    duration: "Duration",
    cycles: "Cycles",
    what_happened_title: "What just happened?",
    what_happened_text: "You balanced your breath, calmed your mind, and returned to the present moment.",
    showed_up: "You showed up for yourself. That is what truly brings balance.",
    return_to_breath: "Return to your breath.",
    greet_morning: "Good morning",
    greet_afternoon: "Good afternoon",
    greet_evening: "Good evening",
    greet_night: "Good night",
    greet_still: "Still and quiet",
    naadi_transition: "Naadi Shuththi is complete. Prepare for Pranayamam.",
    pranayamam_transition: "Pranayamam is complete. Sit comfortably. Prepare for meditation.",
    nostril_hold: "Nostril hold",
    chair_label: "Chair",
    sub_naadi: "Alternate-nostril breathing",
    sub_pranayamam: "Breath with retention",
    sub_dhyanam: "Sit. Breathe. Be still.",
    sub_complete: "All three practices",
    recent: "Recent",
  },
};

function t(lang, key) {
  return (TRANSLATIONS[lang] && TRANSLATIONS[lang][key]) || TRANSLATIONS.en[key] || key;
}

const PRACTICES = {
  naadi: {
    key: "naadi",
    name: "Naadi Shuththi",
    tagline: "Continuous alternate-nostril breathing",
    info: "Naadi Shuththi is continuous alternate-nostril breathing, with no retention and no relaxation hold between stages. It gently balances the breath through the right and left nostril in even, flowing cycles.",
    stages: NAADI_STAGES,
    defaultCycles: 5,
  },
  pranayamam: {
    key: "pranayamam",
    name: "Pranayamam",
    tagline: "Alternate-nostril breathing with retention",
    info: "Pranayamam always begins with the right nostril. Unlike Naadi Shuththi, it includes a breath retention and a relaxation interval within each cycle. Practise within your comfort — never strain a retention.",
    stages: PRANAYAMAM_STAGES,
    defaultCycles: 3,
  },
  dhyanam: {
    key: "dhyanam",
    name: "Dhyanam",
    tagline: "Meditation",
    info: "Dhyanam is intentionally minimal and distraction-free. Sit quietly, let the breath find its own rhythm, and allow attention to settle inward.",
    stages: dhyanamStages(DHYANAM_DURATION_SEC),
    defaultCycles: 1,
    isMeditation: true,
  },
};

const COMPLETE_SEQUENCE = [
  { key: "naadi", cycles: 5 },
  { transitionKey: "naadi_transition" },
  { key: "pranayamam", cycles: 3 },
  { transitionKey: "pranayamam_transition" },
  { key: "dhyanam", cycles: 1, overrideStages: dhyanamStages(DHYANAM_DURATION_SEC) },
];

const QUOTES = [
  "The breath you just practised will outlast the minutes it took.",
  "Stillness is not empty. It is full of everything you stopped chasing.",
  "Each nostril, its own quiet river. Together, one calm sea.",
  "You did not escape the day. You simply met it with a steadier breath.",
  "The bell fades. What it woke in you does not have to.",
  "A settled breath is a small, repeatable proof that you can begin again.",
  "Nothing here was measured against yesterday. It only had to be today.",
  "The mind that wandered also came back. That return is the practice.",
  "Retention teaches patience the body already half-knows.",
  "You gave the next few minutes nothing to prove. That was enough.",
  "Between one breath and the next, there is room for the whole day to soften.",
  "The posture will loosen. Let what steadied you stay a little longer.",
  "Calm is not the absence of thought — it is thought given somewhere to land.",
  "You practised in private. That is exactly where it was meant to happen.",
  "The right nostril, the sun. The left, the moon. You just visited both.",
];

/* ---------------- Local storage helpers (session history) ---------------- */

async function loadSessions() {
  try {
    const res = await window.storage.get("sessions", false);
    return res ? JSON.parse(res.value) : [];
  } catch {
    return [];
  }
}
async function saveSessions(list) {
  try {
    await window.storage.set("sessions", JSON.stringify(list), false);
  } catch {
    /* non-fatal in a prototype */
  }
}

/* ---------------- Small utils ---------------- */

const fmt = (totalSec) => {
  const s = Math.max(0, Math.round(totalSec));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${m}:${r.toString().padStart(2, "0")}`;
};

/* ---- Bundled voiceover clips (offline) ----
   Any file named src/assets/voice/<cue-key>.mp3 (e.g. inhale_right.mp3) is
   played through its own Web Audio gain path, separate from the bell and the
   ambient pad. If a clip is missing or not yet decoded, the cue falls back to
   the device's built-in speech so the app never goes silent. */

const VOICE_URLS = import.meta.glob("./assets/voice/*.{wav,mp3}", { eager: true, query: "?url", import: "default" });
const voiceEngine = { ctx: null, gain: null, buffers: {}, started: false, src: null, el: null, errors: [] };

// Read a bundled clip without the network stack: embedded data: URIs are decoded directly,
// so restricted previews that block fetch() still work. Other URLs use fetch().
function urlToArrayBuffer(url) {
  if (url.startsWith("data:")) {
    try {
      const bin = atob(url.slice(url.indexOf(",") + 1));
      const out = new Uint8Array(bin.length);
      for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
      return Promise.resolve(out.buffer);
    } catch (e) {
      return Promise.reject(e);
    }
  }
  return fetch(url).then((r) => r.arrayBuffer());
}

function getVoiceCtx() {
  if (voiceEngine.ctx) return voiceEngine.ctx;
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) return null;
  const ctx = new Ctx();
  const gain = ctx.createGain();
  gain.gain.value = 1;
  gain.connect(ctx.destination);
  voiceEngine.ctx = ctx;
  voiceEngine.gain = gain;
  return ctx;
}

// Must run inside a real tap/click (Safari/iOS audio unlock), then decodes every bundled clip once.
function unlockVoice() {
  const urls = Object.entries(VOICE_URLS);
  if (!urls.length) return;
  try {
    const ctx = getVoiceCtx();
    if (!ctx) return;
    if (ctx.state === "suspended") ctx.resume();
    const silent = ctx.createBuffer(1, 1, 22050);
    const src = ctx.createBufferSource();
    src.buffer = silent;
    src.connect(ctx.destination);
    src.start(0);
    if (voiceEngine.started) return;
    voiceEngine.started = true;
    urls.forEach(([path, url]) => {
      const key = path.split("/").pop().replace(/\.(wav|mp3)$/, "");
      urlToArrayBuffer(url)
        .then((ab) => new Promise((res, rej) => ctx.decodeAudioData(ab, res, rej)))
        .then((buf) => { voiceEngine.buffers[key] = buf; })
        .catch((e) => { voiceEngine.errors.push(`${key}: ${(e && e.message) || "decode failed"}`); });
    });
  } catch (e) {
    voiceEngine.errors.push(`audio setup: ${(e && e.message) || "unavailable"}`);
  }
  // Second route for Safari: one shared <audio> element, unlocked by this same tap.
  try {
    if (!voiceEngine.el) {
      const a = new Audio();
      a.preload = "auto";
      a.muted = true;
      a.src = urls[0][1];
      const pr = a.play();
      const done = () => { try { a.pause(); a.currentTime = 0; } catch { /* ignore */ } a.muted = false; };
      if (pr && pr.then) pr.then(done).catch(() => { a.muted = false; }); else done();
      voiceEngine.el = a;
    }
  } catch { /* no <audio> route */ }
}

function voiceStatus() {
  const total = Object.keys(VOICE_URLS).length;
  const ready = Object.keys(voiceEngine.buffers).length;
  if (!total) return "no recordings bundled";
  if (ready === total) return `recorded voice ready (${ready}/${total})`;
  return `recordings ${ready}/${total} decoded` + (voiceEngine.errors.length ? ` · ${voiceEngine.errors[0]}` : " · still loading");
}

function stopVoiceClip() {
  try { if (voiceEngine.src) voiceEngine.src.stop(); } catch { /* already stopped */ }
  voiceEngine.src = null;
  try { if (voiceEngine.el) voiceEngine.el.pause(); } catch { /* ignore */ }
}

// Fallback route: play the same bundled file through a shared <audio> element.
function playViaElement(key, onFail) {
  const url = Object.entries(VOICE_URLS).find(([path]) => path.endsWith(`/${key}.wav`) || path.endsWith(`/${key}.mp3`));
  const a = voiceEngine.el;
  if (!url || !a) return 0;
  try {
    a.pause();
    a.muted = false;
    a.src = url[1];
    a.currentTime = 0;
    const pr = a.play();
    if (pr && pr.catch) pr.catch(() => { if (onFail) onFail(); });
    a.onerror = () => { if (onFail) onFail(); };
    return key.endsWith("_transition") ? 8.5 : 4;
  } catch {
    return 0;
  }
}

// Returns the clip length in seconds when a recording was played, otherwise 0.
function playVoiceClip(key) {
  const ctx = voiceEngine.ctx;
  const buf = voiceEngine.buffers[key];
  if (!ctx || !buf) return 0;
  try {
    if (ctx.state !== "running") { try { ctx.resume(); } catch { /* ignore */ } return 0; }
    stopVoiceClip();
    const src = ctx.createBufferSource();
    src.buffer = buf;
    src.connect(voiceEngine.gain);
    src.start(0);
    voiceEngine.src = src;
    return buf.duration;
  } catch {
    return 0;
  }
}

// One entry point for every spoken cue: recorded clip if available, else device speech.
// Returns the recording length in seconds (0 if device speech or muted).
function speakCue(key, text, enabled, lang) {
  if (!enabled) { stopVoiceClip(); return 0; }
  const dur = playVoiceClip(key) || playViaElement(key, () => speak(text, enabled, lang));
  if (dur) {
    try { window.speechSynthesis.cancel(); } catch { /* none */ }
    return dur;
  }
  stopVoiceClip();
  speak(text, enabled, lang);
  return 0;
}

function speak(text, enabled, lang) {
  if (!enabled) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1;
    u.volume = 1;
    // Prefer an installed voice matching the requested locale (English).
    if (lang) {
      u.lang = lang;
      const voices = window.speechSynthesis.getVoices();
      const match = voices.find((v) => v.lang === lang) || voices.find((v) => v.lang?.startsWith(lang.split("-")[0]));
      if (match) u.voice = match;
    }
    window.speechSynthesis.speak(u);
  } catch {
    /* speech synthesis unavailable */
  }
}

// iOS Safari requires speechSynthesis to be unlocked by a direct tap, same
// as AudioContext — a near-silent utterance fired synchronously inside a
// real click/tap handler permanently unlocks it for the rest of the page.
function primeSpeech() {
  unlockVoice();
  try {
    const u = new SpeechSynthesisUtterance(" ");
    u.volume = 0;
    window.speechSynthesis.speak(u);
  } catch {
    /* speech synthesis unavailable */
  }
}

function vibrate(ms, enabled) {
  if (!enabled) return;
  try {
    navigator.vibrate?.(ms);
  } catch {
    /* vibration unavailable */
  }
}

/* ================= Illustrations ================= */
/* Simple line-art icons in the brand's brass stroke — a v1 icon set.
   Per spec section 17, final illustrations should still be reviewed
   by the product owner / a practitioner before release. */

function PostureIcon({ variant, size = 56 }) {
  const common = { fill: "none", stroke: "var(--brass)", strokeWidth: 3, strokeLinecap: "round", strokeLinejoin: "round" };
  const head = <circle cx="100" cy="52" r="15" {...common} />;
  const arms = (
    <>
      <path d="M76 82 Q60 100 56 122" {...common} />
      <path d="M124 82 Q140 100 144 122" {...common} />
    </>
  );
  const torso = <path d="M76 82 Q100 74 124 82 L130 118 Q100 132 70 118 Z" {...common} />;

  let legs;
  if (variant === "padmasana") {
    legs = (
      <>
        <path d="M62 132 Q100 158 138 132 Q126 116 100 122 Q74 116 62 132 Z" {...common} />
        <circle cx="82" cy="140" r="3.5" {...common} />
        <circle cx="118" cy="140" r="3.5" {...common} />
      </>
    );
  } else if (variant === "sukhasana") {
    legs = <path d="M55 130 Q100 150 145 130 Q135 116 100 122 Q65 116 55 130 Z" {...common} />;
  } else if (variant === "chair") {
    legs = (
      <>
        <path d="M55 178 L145 178" {...common} />
        <path d="M60 178 L60 128" {...common} />
        <path d="M60 178 L60 198" {...common} />
        <path d="M140 178 L140 198" {...common} />
        <path d="M84 130 L84 178" {...common} />
        <path d="M116 130 L116 178" {...common} />
      </>
    );
  }

  if (variant === "chin_mudra") {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <path d="M85 182 L100 145" {...common} />
        <circle cx="110" cy="118" r="14" {...common} />
        <path d="M122 114 Q152 106 168 90" {...common} />
        <path d="M119 124 Q150 127 167 122" {...common} />
        <path d="M115 133 Q136 145 152 157" {...common} />
      </svg>
    );
  }

  if (variant === "nostril") {
    return (
      <svg width={size} height={size} viewBox="0 0 200 200">
        <path d="M165 55 Q128 62 121 95 Q117 113 134 122 Q123 128 130 137 Q137 151 162 157" {...common} />
        <circle cx="72" cy="103" r="15" {...common} />
        <path d="M85 97 Q97 92 110 97" {...common} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 200 200">
      {head}
      {arms}
      {torso}
      {legs}
    </svg>
  );
}

function useAmbientDrone() {
  const ctxRef = useRef(null);
  const gainRef = useRef(null);
  const startedRef = useRef(false);

  const ensure = useCallback(() => {
    if (ctxRef.current) return ctxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    const master = ctx.createGain();
    master.gain.value = 0;
    master.connect(ctx.destination);

    // A warm, wordless pad — not a flat two-note drone. Root, a fifth, and
    // a soft octave form an open, consonant chord (no melody, no samples),
    // plus a slow-breathing shimmer layer for a gentler, less industrial
    // character than a single sustained tone.
    const rootHz = 98; // G2 — low and warm, but still reproducible on small speakers
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    const oscC = ctx.createOscillator();
    oscA.type = "triangle"; oscB.type = "triangle"; oscC.type = "sine";
    oscA.frequency.value = rootHz;
    oscB.frequency.value = rootHz * 1.5;   // perfect fifth
    oscC.frequency.value = rootHz * 2.003; // octave, very slightly detuned for gentle beating

    const gainA = ctx.createGain(); gainA.gain.value = 1.0;
    const gainB = ctx.createGain(); gainB.gain.value = 0.5;
    const gainC = ctx.createGain(); gainC.gain.value = 0.4;

    // Slow-breathing shimmer — a quiet high partial whose volume drifts up
    // and down over ~18s, giving the pad a gentle "alive" quality.
    const shimmer = ctx.createOscillator();
    shimmer.type = "sine";
    shimmer.frequency.value = rootHz * 4.01;
    const shimmerGain = ctx.createGain();
    shimmerGain.gain.value = 0.06;
    const shimmerLFO = ctx.createOscillator();
    shimmerLFO.frequency.value = 0.055; // one breath cycle roughly every 18s
    const shimmerLFOGain = ctx.createGain();
    shimmerLFOGain.gain.value = 0.05;
    shimmerLFO.connect(shimmerLFOGain).connect(shimmerGain.gain);

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 1100;
    filter.Q.value = 0.35;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045; // one gentle sweep roughly every 22s
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 140;
    lfo.connect(lfoGain).connect(filter.frequency);

    oscA.connect(gainA).connect(filter);
    oscB.connect(gainB).connect(filter);
    oscC.connect(gainC).connect(filter);
    shimmer.connect(shimmerGain).connect(filter);
    filter.connect(master);

    oscA.start(); oscB.start(); oscC.start(); shimmer.start(); shimmerLFO.start(); lfo.start();

    ctxRef.current = ctx;
    gainRef.current = master;
    return ctx;
  }, []);

  const start = useCallback((target = 0.07, rampSec = 3.5) => {
    const ctx = ensure();
    if (ctx.state === "suspended") ctx.resume();
    startedRef.current = true;
    const g = gainRef.current;
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(target, now + rampSec);
  }, [ensure]);

  // Just unsuspends the context on a real gesture, without touching the
  // gain schedule — used so an early incidental tap doesn't fight with
  // whatever fade the "start"/"stop" calls have already scheduled.
  const unlock = useCallback(() => {
    const ctx = ensure();
    if (ctx.state === "suspended") ctx.resume();
  }, [ensure]);

  const stop = useCallback((rampSec = 0.9) => {
    const ctx = ctxRef.current;
    const g = gainRef.current;
    if (!ctx || !g) return;
    if (ctx.state === "suspended") ctx.resume();
    const now = ctx.currentTime;
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(g.gain.value, now);
    g.gain.linearRampToValueAtTime(0, now + rampSec);
  }, []);

  return { start, stop, unlock, hasStarted: () => startedRef.current };
}

export default function App() {
  const [entered, setEntered] = useState(false);
  const [screen, setScreen] = useState("welcome"); // welcome | info | prep | countdown | practice | transition | complete | settings
  const [activeKey, setActiveKey] = useState(null);
  const [sequence, setSequence] = useState(null); // for complete-practice
  const [seqIdx, setSeqIdx] = useState(0);
  const [transitionText, setTransitionText] = useState("");
  const [transitionNextKey, setTransitionNextKey] = useState(null);
  const pendingSeqIdxRef = useRef(null); // the real next-practice index to jump to after a transition screen
  const [completionStats, setCompletionStats] = useState(null);
  const [quote, setQuote] = useState(QUOTES[0]);
  const [sessions, setSessions] = useState([]);
  const [sessionsLoaded, setSessionsLoaded] = useState(false);

  const [settings, setSettings] = useState({
    bellEnabled: true,
    bellVolume: 0.85,
    voiceEnabled: true,
    hapticsEnabled: true,
    keepAwakeVisual: true,
    speedFactor: 1, // Normal timing by default
  });

  const playBellRaw = useBellPlayer();
  const ambient = useAmbientDrone();

  // Keep a continuous, gentle musical thread through the whole app rather
  // than letting it go silent — fades to a quiet sustain level instead of
  // fully stopping once Home appears, addressing feedback that the app felt
  // too quiet outside of brief moments.
  useEffect(() => {
    if (!entered) return;
    const t = setTimeout(() => ambient.start(0.05, 2.2), 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entered]);

  useEffect(() => {
    loadSessions().then((s) => {
      setSessions(s);
      setSessionsLoaded(true);
    });
  }, []);

  const playBell = useCallback(() => {
    if (!settings.bellEnabled) return;
    playBellRaw(settings.bellVolume);
  }, [settings.bellEnabled, settings.bellVolume, playBellRaw]);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 5) return t("en", "greet_still");
    if (h < 12) return t("en", "greet_morning");
    if (h < 17) return t("en", "greet_afternoon");
    if (h < 21) return t("en", "greet_evening");
    return t("en", "greet_night");
  })();

  const [dhyanamMin, setDhyanamMin] = useState(DHYANAM_DEFAULT);

  const startSingle = (key) => {
    setActiveKey(key);
    setSequence(null);
    setScreen("info");
  };

  const startComplete = () => {
    setActiveKey(null);
    setSequence(COMPLETE_SEQUENCE);
    setSeqIdx(0);
    setScreen("completeInfo");
  };

  const beginFromInfo = () => setScreen("prep");

  const beginCountdown = () => {
    primeSpeech();
    if (sequence || PHOTO_SCENE_PRACTICES.includes(activeKey)) {
      ambient.start(0.055, 2.5);
    }
    setScreen("countdown");
  };

  const onCountdownDone = () => {
    ambient.start(0.035, 1.2); // fade to a quiet sustain rather than silence — bell/voice stay clearly primary
    setScreen("practice");
  };

  const finishSegment = async (stats) => {
    // record a session
    const rec = {
      id: `${Date.now()}`,
      type: sequence ? "Complete Practice" : PRACTICES[activeKey].name,
      completedAt: new Date().toISOString(),
      durationSec: stats.durationSec,
      cyclesCompleted: stats.cyclesCompleted,
      completedNormally: stats.completedNormally,
    };

    if (sequence) {
      const next = seqIdx + 1;
      if (next < sequence.length && sequence[next].transitionKey) {
        const upcomingIdx = next + 1; // the actual practice segment after the transition message
        const upcoming = sequence[upcomingIdx];
        setTransitionText(sequence[next].transitionKey);
        setTransitionNextKey(upcoming ? upcoming.key : null);
        pendingSeqIdxRef.current = upcomingIdx;
        ambient.start(0.055, 2.2);
        setScreen("transition");
        return;
      } else if (next < sequence.length) {
        setSeqIdx(next);
        setScreen("practice");
        return;
      }
    }

    const updated = [rec, ...sessions].slice(0, 25);
    setSessions(updated);
    await saveSessions(updated);

    setQuote(QUOTES[Math.floor(Math.random() * QUOTES.length)]);
    setCompletionStats(stats);
    playBell();
    ambient.start(0.05, 3);
    setScreen("complete");
  };

  const continueFromTransition = () => {
    ambient.start(0.035, 0.9);
    if (pendingSeqIdxRef.current !== null) {
      setSeqIdx(pendingSeqIdxRef.current);
      pendingSeqIdxRef.current = null;
    }
    setScreen("practice");
  };

  const endSession = () => {
    ambient.start(0.05, 1.2);
    setScreen("welcome");
    setSequence(null);
    setActiveKey(null);
  };

  const currentPracticeMeta = sequence
    ? PRACTICES[sequence[seqIdx]?.key]
    : activeKey
    ? PRACTICES[activeKey]
    : null;

  return (
    <div style={styles.app} className="app-wrap">
      <div style={styles.phoneFrame} className="phone-frame">
        {!entered && (
          <EntryScreen
            onEnter={() => setEntered(true)}
            playBell={playBell}
            ambient={ambient}
          />
        )}

        {entered && screen === "welcome" && (
          <WelcomeScreen
            greeting={greeting}
            onSelect={startSingle}
            onComplete={startComplete}
            onSettings={() => setScreen("settings")}
            sessions={sessions}
            sessionsLoaded={sessionsLoaded}
            settings={settings}
          />
        )}

        {screen === "info" && activeKey && (
          <InfoScreen
            practice={PRACTICES[activeKey]}
            onBack={() => setScreen("welcome")}
            onStart={beginFromInfo}
            settings={settings}
            dhyanamMin={dhyanamMin}
            setDhyanamMin={setDhyanamMin}
          />
        )}

        {screen === "completeInfo" && (
          <CompleteDetailScreen onBack={() => setScreen("welcome")} onStart={() => setScreen("prep")} />
        )}

        {screen === "prep" && (
          <PrepScreen
            title={sequence ? "Complete Practice" : currentPracticeMeta.name}
            onBack={() => setScreen(sequence ? "completeInfo" : "info")}
            onBegin={beginCountdown}
            practiceKey={sequence ? "complete" : activeKey}
            settings={settings}
          />
        )}

        {screen === "countdown" && (
          <CountdownScreen
            onDone={onCountdownDone}
            practiceKey={sequence ? "complete" : activeKey}
            onBack={() => setScreen("prep")}
            onSkip={onCountdownDone}
            settings={settings}
          />
        )}

        {screen === "transition" && (
          <TransitionScreen
            text={t("en", transitionText)}
            textKey={transitionText}
            onContinue={continueFromTransition}
            playBell={playBell}
            nextPracticeKey={transitionNextKey}
            settings={settings}
          />
        )}

        {screen === "practice" && currentPracticeMeta && (
          <PracticeScreen
            key={sequence ? `seq-${seqIdx}` : activeKey}
            practice={
              sequence && sequence[seqIdx].overrideStages
                ? { ...currentPracticeMeta, stages: sequence[seqIdx].overrideStages }
                : !sequence && activeKey === "dhyanam"
                ? { ...currentPracticeMeta, stages: dhyanamStages(dhyanamMin * 60) }
                : currentPracticeMeta
            }
            cycles={sequence ? sequence[seqIdx].cycles : currentPracticeMeta.defaultCycles}
            settings={settings}
            playBell={playBell}
            onEnd={endSession}
            onFinish={finishSegment}
            isLastOfSequence={sequence ? seqIdx === sequence.length - 1 : true}
            isSequence={!!sequence}
          />
        )}

        {screen === "complete" && completionStats && (
          <CompleteScreen
            stats={completionStats}
            quote={quote}
            wasSequence={!!sequence}
            onDone={endSession}
            practiceKey={sequence ? "complete" : activeKey}
            settings={settings}
          />
        )}

        {screen === "settings" && (
          <SettingsScreen
            settings={settings}
            setSettings={setSettings}
            onBack={() => setScreen("welcome")}
            sessions={sessions}
            onClearHistory={async () => {
              setSessions([]);
              await saveSessions([]);
            }}
            playBellTest={playBell}
          />
        )}
      </div>
    </div>
  );
}

/* ================= Screens ================= */

/* ---- Reusable abstract cinematic background (no photography) ----
   Same silk/light technique as the entry screen, tinted per practice via
   hue-rotate so each practice still feels visually distinct. Used instead
   of photography so the app doesn't imply a single gender/age of user. */

function AbstractScene({ uid, hue = 0, sat = 1, className = "" }) {
  const id = (name) => `${name}-${uid}`;
  return (
    <svg className={`entry-silk-svg ${className}`} viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice"
      style={{ filter: `hue-rotate(${hue}deg) saturate(${sat})` }}>
      <defs>
        <filter id={id("mistBlur")} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="55" /></filter>
        <filter id={id("silkBlurSoft")} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
        <filter id={id("silkBlurSharp")} x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" /></filter>
        <linearGradient id={id("lightTravel")} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#0a0806" stopOpacity="1" />
          <stop offset="38%" stopColor="#8a5f28" stopOpacity="1" />
          <stop offset="52%" stopColor="#f0cc86" stopOpacity="1" />
          <stop offset="68%" stopColor="#8a5f28" stopOpacity="1" />
          <stop offset="100%" stopColor="#0a0806" stopOpacity="1" />
        </linearGradient>
        <clipPath id={id("ribbonAClip")}>
          <path d="M270,-30 C200,70 300,140 215,235 C155,310 250,395 185,495 C150,555 190,610 165,660
                   L120,660 C150,605 105,555 145,495 C205,395 110,310 170,235 C240,140 145,70 215,-30 Z" />
        </clipPath>
        <clipPath id={id("ribbonBClip")}>
          <path d="M40,60 C110,140 60,210 130,280 C190,340 130,420 190,480 C230,520 210,580 250,640
                   L290,640 C245,580 265,520 220,480 C155,420 220,340 155,280 C80,210 135,140 75,60 Z" />
        </clipPath>
      </defs>

      <g className="entry-mist">
        <ellipse cx="80" cy="150" rx="150" ry="110" fill="#3a2c18" opacity="0.10" filter={`url(#${id("mistBlur")})`} />
        <ellipse cx="300" cy="480" rx="170" ry="140" fill="#332616" opacity="0.09" filter={`url(#${id("mistBlur")})`} />
      </g>

      <g className="entry-silk-secondary" filter={`url(#${id("silkBlurSoft")})`} opacity="0.16">
        <path d="M55,40 C130,130 70,200 145,270 C210,335 140,425 205,490 C245,530 220,590 265,640
                 L300,640 C255,590 280,530 240,490 C175,425 245,335 180,270 C105,200 165,130 90,40 Z"
          fill="#caa155" />
      </g>

      <g className="entry-ribbon-drift">
        <g className="entry-ribbon-breathe">
          <g filter={`url(#${id("silkBlurSharp")})`}>
            <path d="M270,-30 C200,70 300,140 215,235 C155,310 250,395 185,495 C150,555 190,610 165,660
                     L120,660 C150,605 105,555 145,495 C205,395 110,310 170,235 C240,140 145,70 215,-30 Z"
              fill="#1c1712" opacity="0.9" />
            <g clipPath={`url(#${id("ribbonAClip")})`}>
              <rect className="entry-light-travel" x="0" y="-140" width="360" height="700" fill={`url(#${id("lightTravel")})`} opacity="0.85" />
            </g>
            <path d="M240,10 C185,95 265,155 200,240" stroke="#000000" strokeOpacity="0.18" strokeWidth="2" fill="none" />
            <path d="M195,300 C150,370 220,410 175,480" stroke="#000000" strokeOpacity="0.15" strokeWidth="2" fill="none" />
          </g>
        </g>
      </g>

      <g className="entry-ribbon-b-drift" filter={`url(#${id("silkBlurSharp")})`} opacity="0.5">
        <path d="M40,60 C110,140 60,210 130,280 C190,340 130,420 190,480 C230,520 210,580 250,640
                 L290,640 C245,580 265,520 220,480 C155,420 220,340 155,280 C80,210 135,140 75,60 Z"
          fill="#241d15" />
        <g clipPath={`url(#${id("ribbonBClip")})`}>
          <rect x="0" y="180" width="360" height="460" fill={`url(#${id("lightTravel")})`} opacity="0.4" />
        </g>
      </g>

      <g className="entry-particles">
        {[...Array(8)].map((_, i) => (
          <circle key={i}
            cx={40 + ((i * 61) % 300)}
            cy={60 + ((i * 97) % 540)}
            r={i % 3 === 0 ? 1.3 : 0.8}
            fill="#E8C98A"
            className={`particle particle-${i % 4}`}
          />
        ))}
      </g>
    </svg>
  );
}

// Per-practice tint — keeps each practice visually distinct without photos.
const PRACTICE_HUE = { naadi: 0, pranayamam: 95, dhyanam: -18, complete: 20 };
const PRACTICE_SAT = { naadi: 1, pranayamam: 0.85, dhyanam: 0.75, complete: 1.1 };

function EntryScreen({ onEnter, playBell, ambient }) {
  const [phase, setPhase] = useState("dark"); // dark -> awaken -> title -> tagline -> cta
  const [exiting, setExiting] = useState(false);
  const rootRef = useRef(null);

  useEffect(() => {
    const timers = [
      setTimeout(() => setPhase("awaken"), 2000),
      setTimeout(() => setPhase("title"), 5000),
      setTimeout(() => setPhase("tagline"), 5500),
      setTimeout(() => setPhase("cta"), 6500),
    ];
    // Ideal case (desktop, or any browser that allows it): ambient starts
    // on its own as the light awakens, exactly per spec.
    const ambientTimer = setTimeout(() => ambient.start(0.075, 3.5), 2000);

    // If the very first gesture on the page is some earlier incidental
    // touch (not the CTA), just unlock the context — the already-scheduled
    // fade-in from ambient.start() below will then actually become audible.
    const unlockOnFirstTouch = () => ambient.unlock();
    const el = rootRef.current;
    el?.addEventListener("touchstart", unlockOnFirstTouch, { once: true, passive: true });
    el?.addEventListener("pointerdown", unlockOnFirstTouch, { once: true });

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(ambientTimer);
      el?.removeEventListener("touchstart", unlockOnFirstTouch);
      el?.removeEventListener("pointerdown", unlockOnFirstTouch);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleBegin = () => {
    if (exiting) return;
    ambient.unlock();
    try { navigator.vibrate?.(15); } catch {}
    playBell();
    primeSpeech();
    setExiting(true);
    setTimeout(onEnter, 1400); // matches the silk-expand transition duration
  };

  const showTitle = phase === "title" || phase === "tagline" || phase === "cta";
  const showTagline = phase === "tagline" || phase === "cta";
  const showCta = phase === "cta";
  const awakened = phase !== "dark";

  return (
    <div ref={rootRef} className={`entry-root ${awakened ? "is-awake" : ""} ${exiting ? "is-exiting" : ""}`}>
      <div className="entry-silk-field">
        <svg className="entry-silk-svg" viewBox="0 0 360 640" preserveAspectRatio="xMidYMid slice">
          <defs>
            <filter id="mistBlur" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="55" /></filter>
            <filter id="silkBlurSoft" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="14" /></filter>
            <filter id="silkBlurSharp" x="-60%" y="-60%" width="220%" height="220%"><feGaussianBlur stdDeviation="3.5" /></filter>
            <linearGradient id="lightTravel" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0a0806" stopOpacity="1" />
              <stop offset="38%" stopColor="#8a5f28" stopOpacity="1" />
              <stop offset="52%" stopColor="#f0cc86" stopOpacity="1" />
              <stop offset="68%" stopColor="#8a5f28" stopOpacity="1" />
              <stop offset="100%" stopColor="#0a0806" stopOpacity="1" />
            </linearGradient>
            <clipPath id="ribbonAClip">
              <path d="M270,-30 C200,70 300,140 215,235 C155,310 250,395 185,495 C150,555 190,610 165,660
                       L120,660 C150,605 105,555 145,495 C205,395 110,310 170,235 C240,140 145,70 215,-30 Z" />
            </clipPath>
            <clipPath id="ribbonBClip">
              <path d="M40,60 C110,140 60,210 130,280 C190,340 130,420 190,480 C230,520 210,580 250,640
                       L290,640 C245,580 265,520 220,480 C155,420 220,340 155,280 C80,210 135,140 75,60 Z" />
            </clipPath>
          </defs>

          {/* distant mist — asymmetric, barely-there */}
          <g className="entry-mist">
            <ellipse cx="80" cy="150" rx="150" ry="110" fill="#3a2c18" opacity="0.10" filter="url(#mistBlur)" />
            <ellipse cx="300" cy="480" rx="170" ry="140" fill="#332616" opacity="0.09" filter="url(#mistBlur)" />
          </g>

          {/* secondary, dimmer silk layer for depth */}
          <g className="entry-silk-secondary" filter="url(#silkBlurSoft)" opacity="0.16">
            <path d="M55,40 C130,130 70,200 145,270 C210,335 140,425 205,490 C245,530 220,590 265,640
                     L300,640 C255,590 280,530 240,490 C175,425 245,335 180,270 C105,200 165,130 90,40 Z"
              fill="#caa155" />
          </g>

          {/* primary ribbon: light drifting inside a real fabric silhouette */}
          <g className="entry-ribbon-drift">
            <g className="entry-ribbon-breathe">
              <g filter="url(#silkBlurSharp)">
                <path d="M270,-30 C200,70 300,140 215,235 C155,310 250,395 185,495 C150,555 190,610 165,660
                         L120,660 C150,605 105,555 145,495 C205,395 110,310 170,235 C240,140 145,70 215,-30 Z"
                  fill="#1c1712" opacity="0.9" />
                <g clipPath="url(#ribbonAClip)">
                  <rect className="entry-light-travel" x="0" y="-140" width="360" height="700" fill="url(#lightTravel)" opacity="0.85" />
                </g>
                <path d="M240,10 C185,95 265,155 200,240" stroke="#000000" strokeOpacity="0.18" strokeWidth="2" fill="none" />
                <path d="M195,300 C150,370 220,410 175,480" stroke="#000000" strokeOpacity="0.15" strokeWidth="2" fill="none" />
              </g>
            </g>
          </g>

          {/* secondary ribbon, dimmer, opposite drift direction */}
          <g className="entry-ribbon-b-drift" filter="url(#silkBlurSharp)" opacity="0.5">
            <path d="M40,60 C110,140 60,210 130,280 C190,340 130,420 190,480 C230,520 210,580 250,640
                     L290,640 C245,580 265,520 220,480 C155,420 220,340 155,280 C80,210 135,140 75,60 Z"
              fill="#241d15" />
            <g clipPath="url(#ribbonBClip)">
              <rect x="0" y="180" width="360" height="460" fill="url(#lightTravel)" opacity="0.4" />
            </g>
          </g>

          <g className="entry-particles">
            {[...Array(8)].map((_, i) => (
              <circle key={i}
                cx={40 + ((i * 61) % 300)}
                cy={60 + ((i * 97) % 540)}
                r={i % 3 === 0 ? 1.3 : 0.8}
                fill="#E8C98A"
                className={`particle particle-${i % 4}`}
              />
            ))}
          </g>
        </svg>
        <div className="entry-vignette" />
      </div>

      <div className="entry-content">
        <h1 className={`entry-title ${showTitle ? "is-visible" : ""}`}>Suvara</h1>
        <p className={`entry-tagline ${showTagline ? "is-visible" : ""}`}>Return to your breath.</p>
        <button
          className={`entry-cta ${showCta ? "is-visible" : ""}`}
          onClick={handleBegin}
          aria-label="Begin your practice"
        >
          Begin your practice <span className="entry-cta-arrow">→</span>
        </button>
      </div>
    </div>
  );
}

const PHOTO_SCENE_PRACTICES = ["naadi", "pranayamam", "dhyanam", "complete"];

/* ---- Home: image-led practice cards with animated ring light ----
   The four supplied images are raster art. Only the glowing ring in each
   image is animated: a transparent SVG overlay, drawn in the image's own
   1024x1536 coordinate space (same "slice" fit as the <img>), adds a soft
   pulsing halo and a slow travelling glint along the ring. Nothing else
   in the image moves. */

const IMG_W = 1024, IMG_H = 1536;

const HOME_CARDS = [
  {
    key: "naadi", title: "Naadi Shuththi", subKey: "sub_naadi", meta: "≈ 6 min", img: naadiImg,
    accent: "#F2A93B", glint: "#FFE2A8",
    ring: { cx: 530, cy: 575, r: 340, squash: 1, fadeFrom: 760, fadeTo: 900, glow: 0.4, comet: 1, spin: 9, pulse: 5, glintLen: 8, glintW: 14 },
  },
  {
    key: "pranayamam", title: "Pranayamam", subKey: "sub_pranayamam", meta: "≈ 7 min", img: pranayamamImg,
    accent: "#A7DC8A", glint: "#E8F8C8",
    ring: { cx: 537, cy: 490, r: 362, squash: 0.86, fadeFrom: 640, fadeTo: 760, glow: 0.35, comet: 0.9, spin: 14, pulse: 7, glintLen: 6, glintW: 12 },
  },
  {
    key: "dhyanam", title: "Dhyanam", subKey: "sub_dhyanam", meta: "≈ 20 min", img: dhyanamImg,
    accent: "#EADFC4", glint: "#FFF6DC",
    ring: { cx: 505, cy: 660, r: 335, squash: 1, fadeFrom: 880, fadeTo: 990, glow: 0.28, comet: 0.8, spin: 18, pulse: 9, glintLen: 5, glintW: 11 },
  },
  {
    key: "complete", title: "Complete Practice", subKey: "sub_complete", meta: "≈ 30 min", img: completeImg,
    accent: "#F4B65A", glint: "#FFE7B0",
    ring: { cx: 536, cy: 598, r: 284, squash: 1, fadeFrom: 780, fadeTo: 890, glow: 0.45, comet: 1, spin: 8, pulse: 5, glintLen: 10, glintW: 15 },
  },
];

function RingGlow({ card }) {
  const { ring, accent, glint, key } = card;
  const { cx, cy, r, squash } = ring;
  const id = (n) => `${n}-${key}`;
  return (
    <svg className="ring-overlay" viewBox={`0 0 ${IMG_W} ${IMG_H}`} preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <defs>
        <filter id={id("rgBig")} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26" /></filter>
        <filter id={id("rgMid")} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="9" /></filter>
        <filter id={id("rgSoft")} x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3.5" /></filter>
        <linearGradient id={id("rgFade")} gradientUnits="userSpaceOnUse" x1="0" y1={ring.fadeFrom} x2="0" y2={ring.fadeTo}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={id("rgMask")} maskUnits="userSpaceOnUse" x="0" y="0" width={IMG_W} height={IMG_H}>
          <rect width={IMG_W} height={IMG_H} fill={`url(#${id("rgFade")})`} />
        </mask>
      </defs>
      <g mask={`url(#${id("rgMask")})`}>
        <g transform={`translate(${cx} ${cy}) scale(1 ${squash}) translate(${-cx} ${-cy})`}>
          <g className="ring-pulse" style={{ animationDuration: `${ring.pulse}s` }}>
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="70" opacity={ring.glow * 0.6} filter={`url(#${id("rgBig")})`} />
            <circle cx={cx} cy={cy} r={r} fill="none" stroke={accent} strokeWidth="20" opacity={ring.glow} filter={`url(#${id("rgMid")})`} />
          </g>
          {/* one soft comet circulating the ring: long fading tail, bright head */}
          <g className="ring-spin" style={{ transformOrigin: `${cx}px ${cy}px`, animationDuration: `${ring.spin}s` }}>
            {[[34, 0.16, 3.6], [22, 0.28, 2.8], [11, 0.5, 2.1], [4.5, 0.85, 1.5]].map(([len, op, wMul], k) => (
              <circle key={k} cx={cx} cy={cy} r={r} fill="none" stroke={k === 3 ? "#fff" : glint} strokeWidth={ring.glintW * wMul} pathLength="100"
                strokeDasharray={`${len} ${100 - len}`} strokeDashoffset={-(34 - len)} strokeLinecap="round" opacity={op * ring.comet}
                filter={`url(#${id(k < 2 ? "rgMid" : "rgSoft")})`} />
            ))}
          </g>
        </g>
      </g>
    </svg>
  );
}

function HomePracticeCard({ card, sub, onSelect }) {
  return (
    <button className={`pcard pcard-${card.key}`} style={{ "--accent": card.accent }} onClick={onSelect} aria-label={`${card.title}. ${sub}. ${card.meta}`}>
      <img className="pcard-img" src={card.img} alt="" draggable="false" />
      <RingGlow card={card} />
      <div className="pcard-shade" />
      <div className="pcard-body">
        <div className="pcard-text">
          <div className="pcard-title">{card.title}</div>
          <div className="pcard-sub">{sub}</div>
          <div className="pcard-meta">{card.meta}</div>
        </div>
        <span className="pcard-arrow" aria-hidden="true">→</span>
      </div>
    </button>
  );
}

function WelcomeScreen({ greeting, onSelect, onComplete, onSettings, sessions, sessionsLoaded, settings }) {
  const lang = "en";
  const handlers = { naadi: () => onSelect("naadi"), pranayamam: () => onSelect("pranayamam"), dhyanam: () => onSelect("dhyanam"), complete: onComplete };
  return (
    <div className="home-dark">
      <div className="home-header-row">
        <div className="home-brand-row">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#D9B26A" strokeWidth="1.3"><path d="M12 3c3 3 3 8 0 11-3-3-3-8 0-11zM4 12c4-2 8-2 8 2-4 2-8 2-8-2zM20 12c-4-2-8-2-8 2 4 2 8 2 8-2z" /></svg>
          <span className="home-brand-word">Suvara</span>
        </div>
        <button className="home-settings-icon" onClick={onSettings} aria-label="Settings">
          <SettingsIcon size={17} color="#D9B26A" />
        </button>
      </div>

      <div className="home-hero">
        <div className="home-eyebrow">{greeting}</div>
        <h1 className="home-title-dark">Choose your practice</h1>
        <p className="home-subhead-dark">A moment to return to yourself.</p>
      </div>

      <div className="pcard-grid">
        {HOME_CARDS.map((c) => (
          <HomePracticeCard key={c.key} card={c} sub={t(lang, c.subKey)} onSelect={handlers[c.key]} />
        ))}
      </div>

      {sessionsLoaded && sessions.length > 0 && (
        <div style={{ marginTop: 26 }}>
          <div className="home-section-label">{t(lang, "recent")}</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
            {sessions.slice(0, 3).map((s) => (
              <div key={s.id} className="home-history-row">
                <span>{s.type}</span>
                <span className="home-history-time">{fmt(s.durationSec)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---- Shared warm photo backdrop for the Naadi Shuththi flow ---- */

function PhotoScene({ children, dim, practiceKey }) {
  const hue = PRACTICE_HUE[practiceKey] ?? 0;
  const sat = PRACTICE_SAT[practiceKey] ?? 1;
  return (
    <div className="practice-photo-scene">
      <div className="abstract-scene-bg">
        <AbstractScene uid={`scene-${practiceKey || "x"}`} hue={hue} sat={sat} />
      </div>
      <div className="practice-atmosphere" />
      <div className="practice-scrim" style={dim ? { opacity: 1.1 } : undefined} />
      <div className="practice-photo-content">{children}</div>
    </div>
  );
}

/* ---- Naadi Shuththi detail screen (cinematic, readable-first) ----
   Tunables live in App.css under ".ni-root": --ni-dim (image darkness),
   --ni-halo (halo glow strength), --ni-halo-speed, --ni-particle-speed. */

const NI_PARTICLES = Array.from({ length: 14 }, (_, i) => ({
  left: 6 + ((i * 37) % 88),
  size: 1.6 + ((i * 7) % 3) * 0.8,
  delay: -((i * 2.9) % 22),
  dur: 18 + ((i * 5) % 11),
  drift: ((i % 2 ? 1 : -1) * (6 + (i % 4) * 3)),
}));

const DETAIL_THEMES = {
  naadi: { hero: naadiHeroImg, eyebrow: null, dotMode: "nostril", totalNote: null, repeatLabel: "Repeats continuously" },
  pranayamam: { hero: pranayamamHeroImg, eyebrow: "Breath control with retention", dotMode: "action", totalNote: "≈ 7 min", repeatLabel: "3 cycles" },
  dhyanam: { hero: dhyanamHeroImg, eyebrow: "Meditation with awareness", desc: "Dhyanam is a guided meditation to help you quiet your mind, deepen awareness, and be present in the moment." },
};

const DHYANAM_MIN = 5, DHYANAM_MAX = 120, DHYANAM_DEFAULT = 20;

function PracticeDetailScreen({ practice, onBack, onStart, dhyanamMin, setDhyanamMin }) {
  const theme = DETAIL_THEMES[practice.key];
  const lang = "en";
  const [posture, setPosture] = useState("padmasana");
  const postures = [
    { key: "padmasana", label: "Padmasana" },
    { key: "sukhasana", label: "Sukhasana" },
    { key: "chair", label: t(lang, "chair_label") },
  ];
  return (
    <div className={`ni-root ni-theme-${practice.key} practice-enter`}>
      <div className="ni-scroll">
        <button className="ni-back" onClick={onBack} aria-label="Back"><ArrowLeft size={20} color="#D9B26A" /></button>

        <header className="ni-head">
          <div className="ni-eyebrow">{theme.eyebrow || practice.tagline}</div>
          <h1 className="ni-title">{practice.name}</h1>
          <p className="ni-desc">{theme.desc || practice.info}</p>
        </header>

        <div className="ni-postures" role="radiogroup" aria-label="Sitting posture">
          {postures.map((p) => (
            <button key={p.key} role="radio" aria-checked={posture === p.key}
              className={`ni-posture ${posture === p.key ? "is-on" : ""}`} onClick={() => setPosture(p.key)}>
              <span className="ni-posture-chip"><PostureIcon variant={p.key} size={42} /></span>
              <span className="ni-posture-label">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="ni-hero" aria-hidden="true">
          <img src={theme.hero} alt="" draggable="false" />
          <div className="ni-halo-glow" />
          {practice.key === "dhyanam" && <div className="ni-beam" />}
          <div className="ni-particles">
            {NI_PARTICLES.map((p, i) => (
              <span key={i} style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `calc(${p.dur}s * var(--ni-particle-speed))`, "--drift": `${p.drift}px` }} />
            ))}
          </div>
        </div>

        {practice.isMeditation ? (
        <section className="ni-panel ni-med" aria-label="Meditation duration">
          <div className="ni-panel-head">
            <h2>Meditation</h2>
            <span className="ni-repeat">Timer · no breath pattern</span>
          </div>
          <p className="ni-med-line">{t(lang, "meditate_naturally")}</p>
          <div className="ni-dur" aria-live="polite">
            <button className="ni-step" onClick={() => setDhyanamMin(Math.max(DHYANAM_MIN, dhyanamMin - 5))} disabled={dhyanamMin <= DHYANAM_MIN} aria-label="Decrease duration by 5 minutes">−</button>
            <div className="ni-dur-val"><span className="ni-dur-num">{dhyanamMin}</span><span className="ni-dur-unit">minutes</span></div>
            <button className="ni-step" onClick={() => setDhyanamMin(Math.min(DHYANAM_MAX, dhyanamMin + 5))} disabled={dhyanamMin >= DHYANAM_MAX} aria-label="Increase duration by 5 minutes">+</button>
          </div>
          <input className="ni-range" type="range" min={DHYANAM_MIN} max={DHYANAM_MAX} step="5" value={dhyanamMin}
            onChange={(e) => setDhyanamMin(Number(e.target.value))} aria-label="Meditation duration in minutes" />
          <div className="ni-range-labels"><span>{DHYANAM_MIN} min</span><span>Default {DHYANAM_DEFAULT} min</span><span>{DHYANAM_MAX} min</span></div>
        </section>
        ) : (
        <section className="ni-panel" aria-label="Breathing sequence">
          <div className="ni-panel-head">
            <h2>Breathing sequence</h2>
            <span className="ni-repeat">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9B26A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M17 2l4 4-4 4" /><path d="M3 11V9a3 3 0 013-3h15" /><path d="M7 22l-4-4 4-4" /><path d="M21 13v2a3 3 0 01-3 3H3" /></svg>
              {theme.repeatLabel}
            </span>
          </div>
          {practice.stages.map((s, i) => (
            <div className="ni-row" key={i}>
              <span className={`ni-dot ${theme.dotMode === "action" ? (s.action === "hold" || s.action === "relax" ? "is-left" : "is-right") : (s.nostril === "left" ? "is-left" : "is-right")}`} />
              <span className="ni-row-text">{t(lang, s.instructionKey)}</span>
              <span className="ni-row-time">{s.duration}s</span>
            </div>
          ))}
          <div className="ni-row ni-row-meta">
            <span className="ni-meta-icon"><svg width="22" height="14" viewBox="0 0 28 16" fill="none" stroke="#D9B26A" strokeWidth="1.6"><path d="M14 8c-2-4-5-6-8-6a6 6 0 000 12c3 0 6-2 8-6zm0 0c2 4 5 6 8 6a6 6 0 000-12c-3 0-6 2-8 6z" /></svg></span>
            <span className="ni-row-text">{t(lang, "default_cycles")}</span>
            <span className="ni-row-time">{practice.defaultCycles}</span>
          </div>
          {theme.totalNote && (
            <div className="ni-row ni-row-meta">
              <span className="ni-meta-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9B26A" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span>
              <span className="ni-row-text">Approximate total</span>
              <span className="ni-row-time">{theme.totalNote}</span>
            </div>
          )}
          <div className="ni-row ni-row-meta">
            <span className="ni-meta-icon"><PostureIcon variant="nostril" size={22} /></span>
            <span className="ni-row-text">{t(lang, "nostril_hold")}</span>
            <span className="ni-row-time ni-row-note">technique</span>
          </div>
        </section>
        )}
      </div>

      <div className="ni-cta">
        <button className="ni-start" onClick={onStart}>{t(lang, "start")}</button>
      </div>
    </div>
  );
}

/* ---- Complete Practice detail screen (journey view) ---- */

const sequenceSeconds = (entry) => {
  const stages = entry.overrideStages || PRACTICES[entry.key].stages;
  return stages.reduce((a, st) => a + st.duration, 0) * entry.cycles;
};
const minutesLabel = (sec) => `${Math.max(1, Math.round(sec / 60))} min`;

const COMPLETE_STAGE_META = {
  naadi: { sub: "Continuous alternate-nostril breathing", cls: "is-amber" },
  pranayamam: { sub: "Alternate-nostril breathing with retention", cls: "is-sage" },
  dhyanam: { sub: "Natural-breath meditation", cls: "is-ivory" },
};

function CompleteDetailScreen({ onBack, onStart }) {
  const lang = "en";
  const [posture, setPosture] = useState("padmasana");
  const postures = [
    { key: "padmasana", label: "Padmasana" },
    { key: "sukhasana", label: "Sukhasana" },
    { key: "chair", label: t(lang, "chair_label") },
  ];
  const journey = COMPLETE_SEQUENCE.filter((e) => e.key).map((e) => ({ ...e, sec: sequenceSeconds(e), name: PRACTICES[e.key].name }));
  const totalSec = journey.reduce((a, e) => a + e.sec, 0);
  const R = [244, 270, 298];
  return (
    <div className="ni-root ni-theme-complete practice-enter">
      <div className="ni-scroll">
        <button className="ni-back" onClick={onBack} aria-label="Back"><ArrowLeft size={20} color="#D9B26A" /></button>

        <header className="ni-head">
          <div className="ni-eyebrow">The complete journey</div>
          <h1 className="ni-title">Complete Practice</h1>
          <p className="ni-desc">A complete journey combining Naadi Shuththi, Pranayamam and Dhyanam. Cleanse, stabilise and centre yourself in one guided practice.</p>
        </header>

        <div className="ni-postures" role="radiogroup" aria-label="Sitting posture">
          {postures.map((p) => (
            <button key={p.key} role="radio" aria-checked={posture === p.key}
              className={`ni-posture ${posture === p.key ? "is-on" : ""}`} onClick={() => setPosture(p.key)}>
              <span className="ni-posture-chip"><PostureIcon variant={p.key} size={42} /></span>
              <span className="ni-posture-label">{p.label}</span>
            </button>
          ))}
        </div>

        <div className="ni-hero" aria-hidden="true">
          <img src={completeHeroImg} alt="" draggable="false" />
          <svg className="ni-rings" viewBox="0 0 1024 422" preserveAspectRatio="xMaxYMid slice" focusable="false">
            <defs>
              <filter id="cmpGlint" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="4" /></filter>
            </defs>
            <g className="ni-ring ni-ring-a" style={{ transformOrigin: "722px 190px" }}>
              <circle cx="722" cy="190" r={R[0]} fill="none" stroke="#F3CF92" strokeWidth="1.4" strokeDasharray="2 9" opacity="0.55" />
            </g>
            <g className="ni-ring ni-ring-b" style={{ transformOrigin: "722px 190px" }}>
              <circle cx="722" cy="190" r={R[1]} fill="none" stroke="#E6B97A" strokeWidth="1" strokeDasharray="60 14 6 14" opacity="0.4" />
            </g>
            <g className="ni-ring ni-ring-c" style={{ transformOrigin: "722px 190px" }}>
              <circle cx="722" cy="190" r={R[2]} fill="none" stroke="#D9A866" strokeWidth="0.9" opacity="0.28" />
              <circle cx="722" cy="190" r={R[2]} fill="none" stroke="#FFF1CF" strokeWidth="5" pathLength="100" strokeDasharray="2.2 97.8" strokeLinecap="round" opacity="0.8" filter="url(#cmpGlint)" />
            </g>
          </svg>
          <div className="ni-particles">
            {NI_PARTICLES.slice(0, 9).map((p, i) => (
              <span key={i} style={{ left: `${p.left}%`, width: p.size, height: p.size, animationDelay: `${p.delay}s`, animationDuration: `calc(${p.dur}s * var(--ni-particle-speed))`, "--drift": `${p.drift}px` }} />
            ))}
          </div>
        </div>

        <section className="ni-panel ni-journey" aria-label="Practice journey">
          <div className="ni-panel-head">
            <h2>Practice journey</h2>
            <span className="ni-repeat">Runs in sequence</span>
          </div>
          <ol className="ni-timeline">
            {journey.map((e, i) => (
              <li className={`ni-step-row ${COMPLETE_STAGE_META[e.key].cls}`} key={e.key}>
                <span className="ni-badge">{i + 1}</span>
                <span className="ni-step-text">
                  <span className="ni-step-name">{e.name}</span>
                  <span className="ni-step-sub">{COMPLETE_STAGE_META[e.key].sub}</span>
                </span>
                <span className="ni-row-time">{minutesLabel(e.sec)}</span>
              </li>
            ))}
          </ol>
          <div className="ni-row ni-row-meta">
            <span className="ni-meta-icon"><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#D9B26A" strokeWidth="1.6" strokeLinecap="round"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg></span>
            <span className="ni-row-text">Total duration</span>
            <span className="ni-row-time">≈ {minutesLabel(totalSec)}</span>
          </div>
          <div className="ni-row ni-row-meta">
            <span className="ni-meta-icon"><PostureIcon variant="nostril" size={22} /></span>
            <span className="ni-row-text">{t(lang, "nostril_hold")}</span>
            <span className="ni-row-time ni-row-note">technique</span>
          </div>
        </section>
      </div>

      <div className="ni-cta">
        <button className="ni-start" onClick={onStart}>{t(lang, "start")}</button>
      </div>
    </div>
  );
}

function InfoScreen({ practice, onBack, onStart, settings, dhyanamMin, setDhyanamMin }) {
  if (DETAIL_THEMES[practice.key]) return <PracticeDetailScreen practice={practice} onBack={onBack} onStart={onStart} dhyanamMin={dhyanamMin} setDhyanamMin={setDhyanamMin} />;
  const lang = "en";
  const isNaadi = PHOTO_SCENE_PRACTICES.includes(practice.key);
  const practiceKeyForScene = practice.key;

  const body = (
    <>
      <div style={styles.topRow}>
        <button style={isNaadi ? styles.iconBtnGlass : styles.iconBtn} onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} color={isNaadi ? "var(--sand)" : "var(--sand-dim)"} />
        </button>
        <div />
      </div>
      <div style={{ marginTop: 30 }}>
        <div className={isNaadi ? "glass-eyebrow" : undefined} style={isNaadi ? undefined : styles.eyebrow}>{practice.tagline}</div>
        <h1 className={isNaadi ? "glass-h1" : undefined} style={isNaadi ? undefined : styles.h1}>{practice.name}</h1>
        <p className={isNaadi ? "glass-subhead" : undefined} style={isNaadi ? { marginTop: 14 } : { ...styles.subhead, marginTop: 14, lineHeight: 1.6 }}>{practice.info}</p>

        <div style={{ display: "flex", gap: 20, marginTop: 18 }}>
          <div style={styles.infoIconCol}>
            <div className={isNaadi ? "glass-icon-chip" : undefined}><PostureIcon variant="padmasana" size={isNaadi ? 30 : 44} /></div>
            <span className={isNaadi ? "glass-icon-label" : undefined} style={isNaadi ? undefined : styles.infoIconLabel}>Padmasana</span>
          </div>
          <div style={styles.infoIconCol}>
            <div className={isNaadi ? "glass-icon-chip" : undefined}><PostureIcon variant="sukhasana" size={isNaadi ? 30 : 44} /></div>
            <span className={isNaadi ? "glass-icon-label" : undefined} style={isNaadi ? undefined : styles.infoIconLabel}>Sukhasana</span>
          </div>
          <div style={styles.infoIconCol}>
            <div className={isNaadi ? "glass-icon-chip" : undefined}><PostureIcon variant="chair" size={isNaadi ? 30 : 44} /></div>
            <span className={isNaadi ? "glass-icon-label" : undefined} style={isNaadi ? undefined : styles.infoIconLabel}>{t(lang, "chair_label")}</span>
          </div>
          {!practice.isMeditation && (
            <div style={styles.infoIconCol}>
              <div className={isNaadi ? "glass-icon-chip" : undefined}><PostureIcon variant="nostril" size={isNaadi ? 30 : 44} /></div>
              <span className={isNaadi ? "glass-icon-label" : undefined} style={isNaadi ? undefined : styles.infoIconLabel}>{t(lang, "nostril_hold")}</span>
            </div>
          )}
        </div>

        {!practice.isMeditation && (
          <div className={isNaadi ? "glass-panel" : undefined} style={isNaadi ? { marginTop: 20 } : styles.stageTable}>
            {practice.stages.map((s, i) => (
              <div key={i} className={isNaadi ? "glass-row" : undefined} style={isNaadi ? undefined : styles.stageRow}>
                <span style={{ color: s.nostril === "right" ? "var(--brass)" : s.nostril === "left" ? "var(--sage)" : (isNaadi ? "var(--sand)" : "var(--sand-dim)") }}>
                  {t(lang, s.instructionKey)}
                </span>
                <span style={{ fontFamily: "var(--mono)", color: "var(--sand-dim)" }}>{s.duration}s</span>
              </div>
            ))}
            <div className={isNaadi ? "glass-row" : undefined} style={isNaadi ? { opacity: 0.75 } : { ...styles.stageRow, opacity: 0.7 }}>
              <span>{t(lang, "default_cycles")}</span>
              <span style={{ fontFamily: "var(--mono)" }}>{practice.defaultCycles}</span>
            </div>
          </div>
        )}
      </div>

      <div style={{ flex: 1 }} />
      <button className={isNaadi ? "glass-primary-btn" : undefined} style={isNaadi ? undefined : styles.primaryBtn} onClick={onStart}>{t(lang, "start")}</button>
    </>
  );

  if (isNaadi) {
    return <div className="practice-enter" style={{ position: "relative", flex: 1, display: "flex" }}><PhotoScene practiceKey={practiceKeyForScene}>{body}</PhotoScene></div>;
  }
  return <div style={styles.screen}>{body}</div>;
}

function PrepScreen({ title, onBack, onBegin, practiceKey, settings }) {
  const isNaadi = PHOTO_SCENE_PRACTICES.includes(practiceKey);
  const practiceKeyForScene = practiceKey;
  const lang = "en";
  const body = (
    <>
      <div style={styles.topRow}>
        <button style={isNaadi ? styles.iconBtnGlass : styles.iconBtn} onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} color={isNaadi ? "var(--sand)" : "var(--sand-dim)"} />
        </button>
        <div />
      </div>

      <div style={{ marginTop: 18 }}>
        <div className={isNaadi ? "glass-eyebrow" : undefined} style={isNaadi ? undefined : styles.eyebrow}>{t(lang, "before_you_begin")}</div>
        <h1 className={isNaadi ? "glass-h1" : undefined} style={isNaadi ? undefined : styles.h1}>{title}</h1>
      </div>

      <div style={{ marginTop: 22, display: "flex", flexDirection: "column", gap: 14 }}>
        <PrepItem icon="padmasana" title={t(lang, "posture_title")} text={t(lang, "posture_text")} glass={isNaadi} />
        <PrepItem icon="chin_mudra" title={t(lang, "mudra_title")} text={t(lang, "mudra_text")} glass={isNaadi} />
        <PrepItem icon="nostril" title={t(lang, "safety_title")} text={t(lang, "safety_text")} glass={isNaadi} />
      </div>

      <div style={{ flex: 1 }} />
      <button className={isNaadi ? "glass-primary-btn" : undefined} style={isNaadi ? undefined : styles.primaryBtn} onClick={onBegin}>{t(lang, "begin_practice")}</button>
    </>
  );

  if (isNaadi) {
    return <div className="practice-enter" style={{ position: "relative", flex: 1, display: "flex" }}><PhotoScene practiceKey={practiceKeyForScene}>{body}</PhotoScene></div>;
  }
  return <div style={styles.screen}>{body}</div>;
}

function PrepItem({ icon, title, text, glass }) {
  if (glass) {
    return (
      <div className="glass-panel glass-prep-item">
        <div className="glass-icon-chip" style={{ width: 46, height: 46 }}><PostureIcon variant={icon} size={30} /></div>
        <div>
          <div className="glass-prep-title">{title}</div>
          <div className="glass-prep-text">{text}</div>
        </div>
      </div>
    );
  }
  return (
    <div style={{ ...styles.prepItem, display: "flex", gap: 14, alignItems: "center" }}>
      <div style={styles.prepIconWrap}><PostureIcon variant={icon} size={40} /></div>
      <div>
        <div style={styles.prepItemTitle}>{title}</div>
        <div style={styles.prepItemText}>{text}</div>
      </div>
    </div>
  );
}

function CountdownScreen({ onDone, practiceKey, onBack, onSkip, settings }) {
  const isNaadi = PHOTO_SCENE_PRACTICES.includes(practiceKey);
  const lang = "en";
  const [label, setLabel] = useState("3");

  useEffect(() => {
    const seq = ["3", "2", "1", "Go"];
    let i = 0;
    setLabel(seq[0]);
    const iv = setInterval(() => {
      i += 1;
      if (i < seq.length) {
        setLabel(seq[i]);
      } else {
        clearInterval(iv);
        onDone();
      }
    }, 800);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!isNaadi) {
    return (
      <div style={{ ...styles.screen, alignItems: "center", justifyContent: "center" }}>
        <div key={label} style={styles.countdownNum}>{label}</div>
      </div>
    );
  }

  const isGo = label === "Go";

  return (
    <div className="practice-enter" style={{ position: "relative", flex: 1, display: "flex" }}>
      <PhotoScene dim practiceKey={practiceKey}>
        <div style={styles.topRow}>
          <button style={styles.iconBtnGlass} onClick={onBack} aria-label="Back">
            <ArrowLeft size={20} color="var(--sand)" />
          </button>
          <button className="glass-pill-btn" onClick={onSkip}>{t(lang, "skip_countdown")}</button>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div className="glass-eyebrow" style={{ marginBottom: 22 }}>{t(lang, "get_ready")}</div>
          <div className="countdown-ring-wrap">
            <svg width="220" height="220" viewBox="0 0 220 220">
              <circle cx="110" cy="110" r="92" fill="none" stroke="rgba(237,230,216,0.14)" strokeWidth="2" />
              <circle cx="110" cy="110" r="92" fill="none" stroke="rgba(233,186,109,0.5)" strokeWidth="12"
                style={{ filter: "blur(13px)" }} />
              <circle cx="110" cy="110" r="92" fill="none" stroke="var(--brass)" strokeWidth="2"
                style={{ filter: "drop-shadow(0 0 8px rgba(233,186,109,0.9)) drop-shadow(0 0 24px rgba(201,162,75,0.55))" }} />
              <circle cx="110" cy="18" r="4" fill="var(--brass)" style={{ filter: "drop-shadow(0 0 8px rgba(233,186,109,0.9))" }} />
            </svg>
            <div key={label} className="countdown-num-glow">{isGo ? "Go" : label}</div>
          </div>
          <div className="glass-subhead" style={{ marginTop: 22 }}>{t(lang, "breathe_calm")}</div>
        </div>
      </PhotoScene>
    </div>
  );
}

function TransitionScreen({ text, textKey, onContinue, playBell, nextPracticeKey, settings }) {
  useEffect(() => {
    playBell();
    const clipSec = speakCue(textKey, text, settings?.voiceEnabled, "en-US");
    // Default 3.2s; when a recording is playing, wait for it to finish so it is never cut off.
    const timer = setTimeout(onContinue, Math.max(3200, clipSec * 1000 + 600));
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  return (
    <div className="practice-enter" style={{ position: "relative", flex: 1, display: "flex" }}>
      <PhotoScene practiceKey={nextPracticeKey || "complete"} dim>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <Wind size={26} color="var(--brass)" style={{ marginBottom: 18, opacity: 0.9, filter: "drop-shadow(0 0 10px rgba(201,162,75,0.5))" }} />
          <p className="glass-subhead" style={{ textAlign: "center", fontSize: 18, lineHeight: 1.6, maxWidth: 260 }}>{text}</p>
        </div>
      </PhotoScene>
    </div>
  );
}

/* ---- Practice engine screen (shared by all breathing/meditation types) ---- */

/* ---- Practice background videos (bundled, muted; narration comes from the voice clips) ---- */

const VIDEO_URLS = import.meta.glob("./assets/video/*.mp4", { eager: true, query: "?url", import: "default" });
const POSTER_URLS = import.meta.glob("./assets/video/*.jpg", { eager: true, query: "?url", import: "default" });
const blobUrlCache = {};

// Safari needs real media URLs: when a clip is embedded as a data: URI (single-file build), expose it as a blob: URL.
function playableUrl(key, url) {
  if (!url || !url.startsWith("data:")) return url;
  if (blobUrlCache[key]) return blobUrlCache[key];
  try {
    const comma = url.indexOf(",");
    const mime = url.slice(5, url.indexOf(";"));
    const bin = atob(url.slice(comma + 1));
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    blobUrlCache[key] = URL.createObjectURL(new Blob([bytes], { type: mime }));
    return blobUrlCache[key];
  } catch {
    return url;
  }
}

function PracticeVideo({ practiceKey, paused }) {
  const ref = useRef(null);
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const raw = VIDEO_URLS[`./assets/video/${practiceKey}.mp4`];
  const poster = POSTER_URLS[`./assets/video/${practiceKey}.jpg`];
  const src = raw ? playableUrl(practiceKey, raw) : null;
  const reduceMotion = typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useEffect(() => {
    const v = ref.current;
    if (!v) return undefined;
    v.muted = true; // videos are silent; narration is separate
    if (!reduceMotion) {
      const pr = v.play();
      if (pr && pr.catch) pr.catch(() => { /* autoplay refused: the poster stays visible */ });
    }
    return () => {
      try { v.pause(); } catch { /* ignore */ } // the element itself is released when the screen unmounts
    };
  }, [src, reduceMotion]);

  useEffect(() => {
    const v = ref.current;
    if (!v || reduceMotion || !ready) return;
    if (paused) v.pause();
    else { const pr = v.play(); if (pr && pr.catch) pr.catch(() => {}); }
  }, [paused, ready, reduceMotion]);

  // No clip, or it failed to load: keep the original empty spacer so the practice carries on exactly as before.
  if (!src || failed) return <div style={{ flex: 1 }} />;
  return (
    <div className={`practice-video-slot ${ready ? "is-ready" : ""}`} aria-hidden="true">
      <video ref={ref} className="practice-video" src={src} poster={poster} muted loop playsInline preload="auto" disablePictureInPicture
        onLoadedData={() => setReady(true)} onError={() => setFailed(true)} />
    </div>
  );
}

function PracticeScreen({ practice, cycles, settings, playBell, onEnd, onFinish, isLastOfSequence, isSequence }) {
  const lang = "en";
  const stages = practice.stages;
  const [stageIdx, setStageIdx] = useState(0);
  const [cycleIdx, setCycleIdx] = useState(0);
  const [remaining, setRemaining] = useState(stages[0].duration / settings.speedFactor);
  const [paused, setPaused] = useState(false);
  const [ended, setEnded] = useState(false);

  const deadlineRef = useRef(Date.now() + (stages[0].duration / settings.speedFactor) * 1000);
  const pausedRemainingRef = useRef(null);
  const startedAtRef = useRef(Date.now());
  const cyclesCompletedRef = useRef(0);
  const spokenForStageRef = useRef(-1);

  const stage = stages[stageIdx];

  const aliveRef = useRef(false);
  useEffect(() => {
    aliveRef.current = true;
    return () => {
      aliveRef.current = false;
      // Deferred so React's dev-only remount does not cut off the first cue.
      setTimeout(() => { if (!aliveRef.current) stopVoiceClip(); }, 0);
    };
  }, []);

  useEffect(() => {
    if (paused || ended) return;
    const iv = setInterval(() => {
      const rem = (deadlineRef.current - Date.now()) / 1000;
      if (rem <= 0) {
        advance();
      } else {
        setRemaining(rem);
      }
    }, 100);
    return () => clearInterval(iv);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused, ended, stageIdx, cycleIdx]);

  useEffect(() => {
    if (spokenForStageRef.current !== stageIdx) {
      speakCue(stage.instructionKey, t("en", stage.instructionKey), settings.voiceEnabled, "en-US");
      vibrate(60, settings.hapticsEnabled);
      spokenForStageRef.current = stageIdx;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stageIdx, cycleIdx]);

  function advance() {
    const isLastStage = stageIdx === stages.length - 1;
    if (isLastStage) {
      const nextCycle = cycleIdx + 1;
      cyclesCompletedRef.current = nextCycle;
      if (nextCycle >= cycles) {
        setEnded(true);
        onFinish({
          durationSec: (Date.now() - startedAtRef.current) / 1000,
          cyclesCompleted: nextCycle,
          completedNormally: true,
        });
        return;
      }
      playBell();
      setCycleIdx(nextCycle);
      setStageIdx(0);
      const dur = stages[0].duration / settings.speedFactor;
      deadlineRef.current = Date.now() + dur * 1000;
      setRemaining(dur);
    } else {
      playBell();
      const next = stageIdx + 1;
      setStageIdx(next);
      const dur = stages[next].duration / settings.speedFactor;
      deadlineRef.current = Date.now() + dur * 1000;
      setRemaining(dur);
    }
  }

  const togglePause = () => {
    if (!paused) {
      pausedRemainingRef.current = deadlineRef.current - Date.now();
      setPaused(true);
    } else {
      deadlineRef.current = Date.now() + pausedRemainingRef.current;
      setPaused(false);
    }
  };

  const handleEnd = () => {
    setEnded(true);
    onFinish({
      durationSec: (Date.now() - startedAtRef.current) / 1000,
      cyclesCompleted: cyclesCompletedRef.current,
      completedNormally: false,
    });
  };

  const stageDurSec = stage.duration / settings.speedFactor;
  const anim =
    stage.action === "inhale" ? "inhaleGrow" :
    stage.action === "exhale" ? "exhaleShrink" :
    stage.action === "hold" ? "holdPulse" :
    stage.action === "relax" ? "relaxFloat" :
    "meditatePulse";
  const animDur = (stage.action === "hold" || stage.action === "relax" || stage.action === "meditate")
    ? 3.2
    : stageDurSec;
  const animIteration = (stage.action === "hold" || stage.action === "relax" || stage.action === "meditate") ? "infinite" : 1;

  const circumference = 2 * Math.PI * 94;
  const sceneKey = practice.key;
  const isNaadiPhoto = PHOTO_SCENE_PRACTICES.includes(sceneKey);

  return (
    <div
      style={{ ...styles.screen, alignItems: "center", position: "relative", overflow: "hidden" }}
      className="practice-enter"
    >
      {isNaadiPhoto && (
        <>
          <div className="abstract-scene-bg">
            <AbstractScene uid={`practice-${sceneKey}`} hue={PRACTICE_HUE[sceneKey] ?? 0} sat={PRACTICE_SAT[sceneKey] ?? 1} />
          </div>
          <div className="practice-atmosphere" />
          <div className="practice-scrim" />
        </>
      )}

      <div style={{ position: "relative", zIndex: 1, display: "flex", flexDirection: "column", flex: 1, width: "100%", alignItems: "center" }}>
        <div style={{ ...styles.topRow, width: "100%" }}>
          <button style={styles.iconBtn} onClick={handleEnd} aria-label="End session">
            <X size={20} color="var(--sand-dim)" />
          </button>
          <div style={styles.cycleTag}>
            {t(lang, "cycles")} {cycleIdx + 1} / {cycles}
          </div>
        </div>

        <div style={{ marginTop: 10, textAlign: "center" }}>
          <div style={styles.practiceName}>{practice.name}</div>
        </div>

        <div style={styles.ringWrap}>
          <svg width="232" height="232" viewBox="0 0 232 232">
            <circle cx="116" cy="116" r="94" fill="none" stroke="rgba(237,230,216,0.07)" strokeWidth="2.5" />
            {isNaadiPhoto && (
              <circle
                key={`bloom-${stageIdx}-${cycleIdx}`}
                cx="116" cy="116" r="94" fill="none"
                stroke="rgba(233,186,109,0.55)" strokeWidth="10" strokeLinecap="round"
                strokeDasharray={circumference}
                style={{
                  "--circ": circumference,
                  transform: "rotate(-90deg)",
                  transformOrigin: "116px 116px",
                  animation: `ringFill ${stageDurSec}s linear forwards`,
                  animationPlayState: paused ? "paused" : "running",
                  filter: "blur(11px)",
                }}
              />
            )}
            <circle
              key={`ring-${stageIdx}-${cycleIdx}`}
              cx="116" cy="116" r="94" fill="none"
              stroke="var(--brass)" strokeWidth="2.5" strokeLinecap="round"
              strokeDasharray={circumference}
              style={{
                "--circ": circumference,
                transform: "rotate(-90deg)",
                transformOrigin: "116px 116px",
                animation: `ringFill ${stageDurSec}s linear forwards`,
                animationPlayState: paused ? "paused" : "running",
                filter: isNaadiPhoto
                  ? "drop-shadow(0 0 8px rgba(233,186,109,0.9)) drop-shadow(0 0 22px rgba(201,162,75,0.5))"
                  : "drop-shadow(0 0 6px rgba(201,162,75,0.35))",
              }}
            />
          </svg>
          <div
            key={`circle-${stageIdx}-${cycleIdx}`}
            style={{
              ...styles.breathCircle,
              ...(isNaadiPhoto ? styles.breathCircleGlass : null),
              animation: `${anim} ${animDur}s ease-in-out ${animIteration === "infinite" ? "infinite" : "forwards"}`,
              animationPlayState: paused ? "paused" : "running",
            }}
          >
            {stage.nostril && (
              <div style={styles.nostrilIcon}>
                {stage.nostril === "right"
                  ? <Sun size={22} color="var(--brass)" />
                  : <Moon size={22} color="var(--sage)" />}
              </div>
            )}
            <div style={styles.timerText}>{fmt(remaining)}</div>
          </div>
        </div>

        <div style={{ marginTop: 22, textAlign: "center", minHeight: 50 }}>
          <div key={`instr-${stageIdx}-${cycleIdx}`} style={styles.instructionText} className="practice-instr-fade">
            {t("en", stage.instructionKey)}
          </div>
        </div>

        <PracticeVideo practiceKey={sceneKey} paused={paused} />

        <div style={styles.controlsRow}>
          <button style={styles.controlBtn} onClick={togglePause} aria-label={paused ? "Resume" : "Pause"}>
            {paused ? <Play size={20} color="var(--bg-deep)" /> : <Pause size={20} color="var(--bg-deep)" />}
          </button>
          <button style={styles.controlBtnGhost} onClick={handleEnd}>{t(lang, "end_session")}</button>
        </div>
      </div>
    </div>
  );
}

function CompleteScreen({ stats, quote, wasSequence, onDone, practiceKey, settings }) {
  const isNaadi = PHOTO_SCENE_PRACTICES.includes(practiceKey);
  const lang = "en";
  if (!isNaadi) {
    return (
      <div style={{ ...styles.screen, alignItems: "center", justifyContent: "center" }}>
        <div style={styles.eyebrow}>{wasSequence ? "Complete Practice finished" : "Session complete"}</div>
        <h1 style={{ ...styles.h1, textAlign: "center", marginTop: 6 }}>Well practised.</h1>

        <div style={styles.statsRow}>
          <div style={styles.statBlock}>
            <div style={styles.statNum}>{fmt(stats.durationSec)}</div>
            <div style={styles.statLabel}>Duration</div>
          </div>
          <div style={styles.statBlock}>
            <div style={styles.statNum}>{stats.cyclesCompleted}</div>
            <div style={styles.statLabel}>Cycles</div>
          </div>
        </div>

        <p style={styles.quoteText}>&ldquo;{quote}&rdquo;</p>

        <div style={{ flex: 1 }} />
        <button style={styles.primaryBtn} onClick={onDone}>Done</button>
      </div>
    );
  }

  return (
    <div className="practice-enter" style={{ position: "relative", flex: 1, display: "flex" }}>
      <div className="practice-photo-scene">
        <div className="abstract-scene-bg">
          <AbstractScene uid={`complete-${practiceKey}`} hue={PRACTICE_HUE[practiceKey] ?? 20} sat={PRACTICE_SAT[practiceKey] ?? 1.1} />
        </div>
        <div className="practice-atmosphere" />
        <div className="practice-scrim" style={{ opacity: 1.05 }} />
        <div className="complete-content">
          <div className="complete-lotus-ring">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.4">
              <path d="M12 3c2.5 2 2.5 5 0 7-2.5-2-2.5-5 0-7zM12 21c2.5-2 2.5-5 0-7-2.5 2-2.5 5 0 7zM3 12c2-2.5 5-2.5 7 0-2 2.5-5 2.5-7 0zM21 12c-2 2.5-5 2.5-7 0 2-2.5 5-2.5 7 0z" />
            </svg>
          </div>
          <div className="glass-eyebrow" style={{ marginTop: 14 }}>{t(lang, "session_complete")}</div>
          <h1 className="complete-headline">{t(lang, "well_practiced")}</h1>
          <div className="complete-divider"><span /></div>
          <p className="complete-subline">{t(lang, "showed_up")}</p>

          <div className="complete-stats-row">
            <div className="complete-stat-chip">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.6"><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></svg>
              <div className="complete-stat-num">{fmt(stats.durationSec)}</div>
              <div className="complete-stat-label">{t(lang, "duration")}</div>
            </div>
            <div className="complete-stat-chip">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.6"><path d="M21 12a9 9 0 10-3.5 7.1M21 5v6h-6" /></svg>
              <div className="complete-stat-num">{stats.cyclesCompleted}</div>
              <div className="complete-stat-label">{t(lang, "cycles")}</div>
            </div>
          </div>

          <div className="complete-quote-block">
            <span className="complete-quote-mark complete-quote-open">&ldquo;</span>
            <p className="complete-quote-text">{quote}</p>
            <span className="complete-quote-mark complete-quote-close">&rdquo;</span>
          </div>

          <div className="complete-divider complete-divider-curve"><span /></div>

          <div style={{ flex: 1 }} />

          <div className="complete-footer-panel">
            <div className="complete-footer-icon">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.5"><path d="M12 21c4-4 8-7 8-12a8 8 0 00-16 0c0 5 4 8 8 12z" /><path d="M12 13V7" /></svg>
            </div>
            <div>
              <div className="complete-footer-title">{t(lang, "what_happened_title")}</div>
              <div className="complete-footer-text">{t(lang, "what_happened_text")}</div>
            </div>
          </div>

          <button className="glass-primary-btn" style={{ marginTop: 16 }} onClick={onDone}>
            {t(lang, "done")} <span style={{ marginLeft: 6 }}>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function SettingsScreen({ settings, setSettings, onBack, sessions, onClearHistory, playBellTest }) {
  const set = (patch) => setSettings((s) => ({ ...s, ...patch }));
  return (
    <div style={styles.screen}>
      <div style={styles.topRow}>
        <button style={styles.iconBtn} onClick={onBack} aria-label="Back">
          <ArrowLeft size={20} color="var(--sand-dim)" />
        </button>
        <div />
      </div>
      <h1 style={{ ...styles.h1, marginTop: 14 }}>Settings</h1>

      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 4 }}>
        <SettingRow icon={<Volume2 size={18} color="var(--brass)" />} label="Temple bell" sub="Play at each stage transition">
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button style={styles.testBtn} onClick={() => playBellTest(settings.bellVolume)}>Test</button>
            <Toggle checked={settings.bellEnabled} onChange={(v) => set({ bellEnabled: v })} />
          </div>
        </SettingRow>

        <SettingRow icon={<Mic size={18} color="var(--brass)" />} label="Voice guidance" sub={`Speak each instruction aloud · ${voiceStatus()}`}>
          <Toggle checked={settings.voiceEnabled} onChange={(v) => set({ voiceEnabled: v })} />
        </SettingRow>

        <SettingRow icon={<Vibrate size={18} color="var(--brass)" />} label="Haptic cue" sub="Subtle vibration on transition">
          <Toggle checked={settings.hapticsEnabled} onChange={(v) => set({ hapticsEnabled: v })} />
        </SettingRow>

        <SettingRow icon={<Gauge size={18} color="var(--brass)" />} label="Preview speed" sub={settings.speedFactor > 1 ? `${settings.speedFactor}× faster — for trying the prototype` : "Real timing"}>
          <button
            style={styles.speedBtn}
            onClick={() => set({ speedFactor: settings.speedFactor > 1 ? 1 : 8 })}
          >
            {settings.speedFactor > 1 ? "Fast" : "Normal"}
          </button>
        </SettingRow>
      </div>

      <div style={{ marginTop: 26 }}>
        <div style={styles.sectionLabel}>Practice History</div>
        {sessions.length === 0 ? (
          <p style={{ color: "var(--sand-dim)", fontSize: 14, marginTop: 8 }}>No sessions recorded yet.</p>
        ) : (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 8 }}>
              {sessions.slice(0, 6).map((s) => (
                <div key={s.id} style={styles.historyRow}>
                  <span style={{ color: "var(--sand)" }}>{s.type}</span>
                  <span style={{ fontFamily: "var(--mono)", color: "var(--sand-dim)" }}>{fmt(s.durationSec)}</span>
                </div>
              ))}
            </div>
            <button style={styles.clearBtn} onClick={onClearHistory}>
              <Trash2 size={14} /> Clear Practice History
            </button>
          </>
        )}
      </div>

      <div style={{ marginTop: 26, marginBottom: 10 }}>
        <div style={styles.sectionLabel}>About</div>
        <p style={{ color: "var(--sand-dim)", fontSize: 13, marginTop: 8, lineHeight: 1.6 }}>
          All practice data stays on this device. Nothing is uploaded. Suvara is an early interactive
          prototype — sounds, illustrations and timings are placeholders pending final assets.
        </p>
      </div>
    </div>
  );
}

function SettingRow({ icon, label, sub, children }) {
  return (
    <div style={styles.settingRow}>
      <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
        <div style={styles.settingIconWrap}>{icon}</div>
        <div>
          <div style={{ color: "var(--sand)", fontSize: 15 }}>{label}</div>
          <div style={{ color: "var(--sand-dim)", fontSize: 12, marginTop: 2 }}>{sub}</div>
        </div>
      </div>
      {children}
    </div>
  );
}

function Toggle({ checked, onChange }) {
  return (
    <button
      onClick={() => onChange(!checked)}
      style={{
        width: 44, height: 26, borderRadius: 13, border: "none", cursor: "pointer",
        background: checked ? "var(--brass)" : "rgba(237,230,216,0.15)",
        position: "relative", transition: "background 0.2s", flexShrink: 0,
      }}
      aria-pressed={checked}
    >
      <div style={{
        width: 20, height: 20, borderRadius: "50%", background: checked ? "var(--bg-deep)" : "var(--sand-dim)",
        position: "absolute", top: 3, left: checked ? 21 : 3, transition: "left 0.2s",
      }} />
    </button>
  );
}

/* ================= Styles ================= */

const styles = {
  app: {
    display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: "var(--body)",
  },
  phoneFrame: {
    background: "linear-gradient(165deg, #15282F 0%, #0F2027 100%)",
    overflow: "hidden", position: "relative", display: "flex", flexDirection: "column",
  },
  screen: {
    padding: "22px 22px 26px", display: "flex", flexDirection: "column", minHeight: 640, flex: 1,
  },
  topRow: { display: "flex", justifyContent: "space-between", alignItems: "center" },
  iconBtn: {
    width: 36, height: 36, borderRadius: 18, background: "rgba(237,230,216,0.06)",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  iconBtnGlass: {
    width: 36, height: 36, borderRadius: 18, background: "rgba(20,24,22,0.32)",
    backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)",
    border: "1px solid rgba(237,230,216,0.22)",
    display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
  },
  eyebrow: { fontFamily: "var(--mono)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase", color: "var(--brass)", fontWeight: 500 },
  h1: { fontFamily: "var(--display)", fontWeight: 600, fontSize: 32, color: "var(--sand)", margin: "8px 0 0", letterSpacing: "-0.01em", lineHeight: 1.1 },
  subhead: { color: "var(--sand-dim)", fontSize: 15, margin: "8px 0 0", lineHeight: 1.5 },
  sectionLabel: { fontFamily: "var(--mono)", fontSize: 10.5, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--sand-dim)", opacity: 0.8 },

  practiceCard: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 20px", borderRadius: 20, background: "linear-gradient(180deg, rgba(237,230,216,0.06), rgba(237,230,216,0.035))",
    border: "1px solid rgba(237,230,216,0.09)", cursor: "pointer", textAlign: "left",
    boxShadow: "0 1px 0 rgba(255,255,255,0.03) inset, 0 8px 20px rgba(0,0,0,0.18)",
    transition: "transform 0.15s ease",
  },
  completeCard: {
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: "20px 20px", borderRadius: 20, background: "linear-gradient(135deg, #D7B25E, #C9A24B)",
    border: "none", cursor: "pointer", textAlign: "left", marginTop: 6,
    boxShadow: "0 10px 24px rgba(201,162,75,0.28)",
  },
  practiceCardLabel: { fontFamily: "var(--display)", fontSize: 19, fontWeight: 600, color: "var(--sand)", letterSpacing: "-0.01em" },
  practiceCardSub: { fontSize: 12.5, color: "var(--sand-dim)", marginTop: 4 },
  practiceCardSubOnBrass: { fontSize: 12.5, color: "rgba(18,35,42,0.72)", marginTop: 4, fontWeight: 500 },
  chevron: { color: "var(--sand-dim)", fontSize: 20, opacity: 0.7 },

  historyRow: { display: "flex", justifyContent: "space-between", fontSize: 13.5, padding: "2px 0" },

  stageTable: { marginTop: 20, borderTop: "1px solid rgba(237,230,216,0.08)", paddingTop: 6 },
  stageRow: {
    display: "flex", justifyContent: "space-between", padding: "10px 0",
    borderBottom: "1px solid rgba(237,230,216,0.06)", fontSize: 13.5,
  },

  primaryBtn: {
    width: "100%", padding: "17px 0", borderRadius: 18, border: "none",
    background: "linear-gradient(180deg, #D7B25E, #C9A24B)", color: "#12232A", fontFamily: "var(--display)",
    fontWeight: 600, fontSize: 16.5, cursor: "pointer", marginTop: 16,
    boxShadow: "0 10px 24px rgba(201,162,75,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
    letterSpacing: "0.01em",
  },

  prepItem: { padding: "16px 16px", borderRadius: 16, background: "linear-gradient(180deg, rgba(237,230,216,0.055), rgba(237,230,216,0.03))", border: "1px solid rgba(237,230,216,0.06)" },
  prepIconWrap: { width: 50, height: 50, borderRadius: 14, background: "radial-gradient(circle at 35% 30%, rgba(201,162,75,0.18), rgba(201,162,75,0.06))", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, border: "1px solid rgba(201,162,75,0.15)" },
  infoIconCol: { display: "flex", flexDirection: "column", alignItems: "center", gap: 6 },
  infoIconLabel: { fontSize: 10.5, color: "var(--sand-dim)", textAlign: "center" },
  prepItemTitle: { fontFamily: "var(--display)", fontSize: 15, color: "var(--brass)", fontWeight: 600 },
  prepItemText: { fontSize: 13.5, color: "var(--sand-dim)", marginTop: 4, lineHeight: 1.55 },

  countdownNum: {
    fontFamily: "var(--display)", fontSize: 96, color: "var(--brass)", fontWeight: 600,
    animation: "countPulse 0.7s ease-out",
  },

  cycleTag: { fontFamily: "var(--mono)", fontSize: 12, color: "var(--sand-dim)" },
  practiceName: { fontFamily: "var(--mono)", fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", color: "var(--sand-dim)" },

  ringWrap: { position: "relative", width: 232, height: 232, margin: "28px auto 0", display: "flex", alignItems: "center", justifyContent: "center" },
  breathCircle: {
    position: "absolute", width: 132, height: 132, borderRadius: "50%",
    background: "radial-gradient(circle at 32% 28%, rgba(217,178,94,0.4), rgba(201,162,75,0.06) 72%)",
    border: "1px solid rgba(201,162,75,0.45)",
    boxShadow: "0 0 40px rgba(201,162,75,0.12)",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
  },
  nostrilIcon: { marginBottom: 2, opacity: 0.9 },
  timerText: { fontFamily: "var(--mono)", fontSize: 23, color: "var(--sand)", letterSpacing: "0.01em" },
  breathCircleGlass: {
    background: "rgba(20,15,9,0.2)",
    backdropFilter: "blur(4px)",
    WebkitBackdropFilter: "blur(4px)",
    border: "1px solid rgba(237,230,216,0.22)",
    boxShadow: "0 8px 30px rgba(0,0,0,0.3)",
  },

  instructionText: { fontFamily: "var(--display)", fontSize: 19, color: "var(--sand)", fontWeight: 500, lineHeight: 1.4, padding: "0 10px" },

  controlsRow: { display: "flex", alignItems: "center", justifyContent: "center", gap: 16, marginTop: 10 },
  controlBtn: {
    width: 58, height: 58, borderRadius: 29, background: "linear-gradient(180deg, #D7B25E, #C9A24B)",
    border: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer",
    boxShadow: "0 8px 20px rgba(201,162,75,0.3), inset 0 1px 0 rgba(255,255,255,0.25)",
  },
  controlBtnGhost: {
    background: "rgba(237,230,216,0.04)", border: "1px solid rgba(237,230,216,0.14)", color: "var(--sand-dim)",
    padding: "0 20px", height: 46, borderRadius: 23, fontSize: 13.5, cursor: "pointer", fontWeight: 500,
  },

  statsRow: { display: "flex", gap: 34, marginTop: 26 },
  statBlock: { textAlign: "center" },
  statNum: { fontFamily: "var(--mono)", fontSize: 26, color: "var(--brass)" },
  statLabel: { fontSize: 11.5, color: "var(--sand-dim)", marginTop: 4, textTransform: "uppercase", letterSpacing: "0.08em" },
  quoteText: { fontFamily: "var(--display)", fontStyle: "italic", fontSize: 16.5, color: "var(--sand)", textAlign: "center", maxWidth: 270, lineHeight: 1.6, marginTop: 30 },

  settingRow: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0", borderBottom: "1px solid rgba(237,230,216,0.06)" },
  settingIconWrap: { width: 34, height: 34, borderRadius: 10, background: "rgba(201,162,75,0.1)", display: "flex", alignItems: "center", justifyContent: "center" },
  speedBtn: { padding: "6px 14px", borderRadius: 12, border: "1px solid var(--brass)", background: "transparent", color: "var(--brass)", fontSize: 12.5, cursor: "pointer" },
  testBtn: { padding: "6px 12px", borderRadius: 10, border: "1px solid rgba(237,230,216,0.2)", background: "rgba(237,230,216,0.06)", color: "var(--sand-dim)", fontSize: 11.5, cursor: "pointer" },
  clearBtn: { display: "flex", alignItems: "center", gap: 6, marginTop: 12, background: "none", border: "none", color: "var(--vermilion)", fontSize: 13, cursor: "pointer", padding: 0 },

  entryRing: {
    width: 96, height: 96, borderRadius: "50%", border: "1px solid rgba(201,162,75,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", animation: "meditatePulse 3.4s ease-in-out infinite",
  },
  entryRingInner: {
    width: 56, height: 56, borderRadius: "50%",
    background: "radial-gradient(circle at 35% 30%, rgba(201,162,75,0.4), rgba(201,162,75,0.08) 70%)",
    border: "1px solid rgba(201,162,75,0.6)",
  },
};


