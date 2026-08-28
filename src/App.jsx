import React, { useState, useEffect, useRef, useCallback } from "react";
import { Play, Pause, X, Settings as SettingsIcon, Info, ArrowLeft, Volume2, Vibrate, Mic, Gauge, Trash2, Sun, Moon, Wind } from "lucide-react";

import bellAudioUrl from "./assets/audio/temple-bell.mp3";
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

const LOCALE_CODES = { en: "en-US", ta: "ta-IN", hi: "hi-IN" };

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
    language: "Language",
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
    sub_complete: "All three practices · ~30 minutes",
    recent: "Recent",
  },
  ta: {
    inhale_right: "வலது மூக்கின் வழியாக மூச்சை இழுக்கவும்",
    exhale_left: "இடது மூக்கின் வழியாக மூச்சை வெளியிடவும்",
    inhale_left: "இடது மூக்கின் வழியாக மூச்சை இழுக்கவும்",
    exhale_right: "வலது மூக்கின் வழியாக மூச்சை வெளியிடவும்",
    hold_breath: "மூச்சை நிறுத்திக்கொள்ளுங்கள்",
    relax_breathe: "தளர்வாக இயல்பாக சுவாசிக்கவும்",
    meditate_naturally: "இயல்பாக சுவாசியுங்கள். எண்ணங்கள் அமையட்டும்.",
    posture_title: "ஆசனம்",
    posture_text: "பத்மாசனம் அல்லது சுகாசனத்தில் அமரவும், அல்லது இரு கால்களும் தரையில் ஊன்றிய நிலையில் நாற்காலியில் அமரலாம். முதுகுத்தண்டு இயல்பாக நிமிர்ந்திருக்கட்டும்.",
    mudra_title: "சின் முத்திரை",
    mudra_text: "சுட்டுவிரலின் நுனியையும் கட்டைவிரலையும் மெதுவாக இணைத்து, மணிக்கால்களில் உள்ளங்கைகள் மேல்நோக்கியவாறு வைக்கவும். ஒருபோதும் கட்டாயப்படுத்த வேண்டாம்.",
    safety_title: "பாதுகாப்பு",
    safety_text: "உங்கள் வசதிக்கேற்ப மட்டுமே பயிற்சி செய்யுங்கள். மூச்சை ஒருபோதும் இறுக்காதீர்கள். தலைச்சுற்றல், வலி அல்லது அசௌகரியம் ஏற்பட்டால் நிறுத்துங்கள்.",
    start: "தொடங்கு",
    instructions: "வழிமுறைகள்",
    begin_practice: "பயிற்சியைத் தொடங்கு",
    pause: "இடைநிறுத்து",
    end_session: "அமர்வை முடி",
    done: "முடிந்தது",
    skip_countdown: "எண்ணிக்கையைத் தவிர்",
    get_ready: "தயாராகுங்கள்",
    breathe_calm: "அமைதியாக சுவாசியுங்கள்",
    before_you_begin: "தொடங்குமுன்",
    default_cycles: "இயல்பான சுற்றுகள்",
    take_moment: "உங்களுக்காக ஒரு கணம் ஒதுக்குங்கள்.",
    guide_practice: "பயிற்சியை வழிநடத்தி, பின் அமைதியாக விலகுங்கள்.",
    settings: "அமைப்புகள்",
    session_complete: "அமர்வு முடிந்தது",
    well_practiced: "நன்கு பயிற்சி செய்தீர்கள்.",
    duration: "கால அளவு",
    cycles: "சுற்றுகள்",
    what_happened_title: "என்ன நடந்தது?",
    what_happened_text: "நீங்கள் உங்கள் சுவாசத்தை சமநிலைப்படுத்தி, மனதை அமைதிப்படுத்தி, நிகழ் தருணத்திற்குத் திரும்பினீர்கள்.",
    showed_up: "நீங்கள் உங்களுக்காக முன்வந்தீர்கள். அதுவே உண்மையான சமநிலையைத் தருகிறது.",
    return_to_breath: "உங்கள் சுவாசத்திற்குத் திரும்புங்கள்.",
    language: "மொழி",
    greet_morning: "காலை வணக்கம்",
    greet_afternoon: "மதிய வணக்கம்",
    greet_evening: "மாலை வணக்கம்",
    greet_night: "இரவு வணக்கம்",
    greet_still: "அமைதியான நேரம்",
    naadi_transition: "நாடி சுத்தி முடிந்தது. பிராணாயாமத்திற்கு தயாராகுங்கள்.",
    pranayamam_transition: "பிராணாயாமம் முடிந்தது. வசதியாக அமரவும். தியானத்திற்கு தயாராகுங்கள்.",
    nostril_hold: "மூக்கு பிடிப்பு",
    chair_label: "நாற்காலி",
    sub_naadi: "மாறி மாறி மூக்கு சுவாசம்",
    sub_pranayamam: "தக்கவைப்புடன் கூடிய சுவாசம்",
    sub_dhyanam: "அமருங்கள். சுவாசியுங்கள். அமைதியாக இருங்கள்.",
    sub_complete: "மூன்று பயிற்சிகளும் · ~30 நிமிடங்கள்",
    recent: "சமீபத்தியவை",
  },
  hi: {
    inhale_right: "दाहिने नथुने से सांस अंदर लें",
    exhale_left: "बाएं नथुने से सांस बाहर छोड़ें",
    inhale_left: "बाएं नथुने से सांस अंदर लें",
    exhale_right: "दाहिने नथुने से सांस बाहर छोड़ें",
    hold_breath: "सांस रोकें",
    relax_breathe: "शिथिल हों और स्वाभाविक रूप से सांस लें",
    meditate_naturally: "स्वाभाविक रूप से सांस लें। विचारों को शांत होने दें।",
    posture_title: "आसन",
    posture_text: "पद्मासन या सुखासन में बैठें, या दोनों पैर ज़मीन पर टिकाकर कुर्सी पर बैठें। रीढ़ स्वाभाविक रूप से सीधी रखें।",
    mudra_title: "चिन मुद्रा",
    mudra_text: "तर्जनी और अंगूठे के सिरे को धीरे से जोड़ें, हथेलियाँ घुटनों पर ऊपर की ओर रखें। कभी भी ज़बरदस्ती न करें।",
    safety_title: "सुरक्षा",
    safety_text: "अपनी सुविधा के अनुसार ही अभ्यास करें। सांस पर कभी ज़ोर न डालें। चक्कर, दर्द या असहजता महसूस हो तो रुक जाएं।",
    start: "शुरू करें",
    instructions: "निर्देश",
    begin_practice: "अभ्यास शुरू करें",
    pause: "रोकें",
    end_session: "सत्र समाप्त करें",
    done: "हो गया",
    skip_countdown: "गिनती छोड़ें",
    get_ready: "तैयार हो जाइए",
    breathe_calm: "शांति से सांस लें",
    before_you_begin: "शुरू करने से पहले",
    default_cycles: "डिफ़ॉल्ट चक्र",
    take_moment: "अपने लिए एक पल निकालें।",
    guide_practice: "अभ्यास को मार्गदर्शन दें, फिर शांति से हट जाएं।",
    settings: "सेटिंग्स",
    session_complete: "सत्र पूर्ण हुआ",
    well_practiced: "बहुत अच्छा अभ्यास किया।",
    duration: "अवधि",
    cycles: "चक्र",
    what_happened_title: "अभी क्या हुआ?",
    what_happened_text: "आपने अपनी सांस को संतुलित किया, मन को शांत किया, और वर्तमान क्षण में लौट आए।",
    showed_up: "आप अपने लिए उपस्थित हुए। यही सच्चा संतुलन लाता है।",
    return_to_breath: "अपनी सांस की ओर लौटें।",
    language: "भाषा",
    greet_morning: "सुप्रभात",
    greet_afternoon: "शुभ दोपहर",
    greet_evening: "शुभ संध्या",
    greet_night: "शुभ रात्रि",
    greet_still: "शांत और स्थिर",
    naadi_transition: "नाड़ी शुद्धि पूर्ण हुई। प्राणायाम के लिए तैयार हों।",
    pranayamam_transition: "प्राणायाम पूर्ण हुआ। आराम से बैठें। ध्यान के लिए तैयार हों।",
    nostril_hold: "नथुना पकड़",
    chair_label: "कुर्सी",
    sub_naadi: "एकांतर नथुना श्वास",
    sub_pranayamam: "रोक के साथ श्वास",
    sub_dhyanam: "बैठें। सांस लें। शांत रहें।",
    sub_complete: "तीनों अभ्यास · ~30 मिनट",
    recent: "हाल के",
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

function speak(text, enabled, lang) {
  if (!enabled) return;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.85;
    u.pitch = 1;
    u.volume = 1;
    // Ask for a specific language voice (e.g. hi-IN, ta-IN). If the device
    // has no installed voice for that language, the browser silently falls
    // back to its default voice — a real platform limitation, not a bug.
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

    // Low, detuned drone — no melody, no samples. Two triangle oscillators
    // a few cents apart create a slow natural beating, softened by a
    // low-pass filter with a very slow LFO for a faint airy movement.
    const oscA = ctx.createOscillator();
    const oscB = ctx.createOscillator();
    oscA.type = "triangle"; oscB.type = "triangle";
    oscA.frequency.value = 58;
    oscB.frequency.value = 58 * 1.006;

    // A soft octave-up layer, quieter than the fundamentals — small phone
    // and laptop speakers often can't reproduce ~58Hz at all, so without
    // this the drone can be scheduled correctly and still be inaudible.
    const oscHigh = ctx.createOscillator();
    oscHigh.type = "sine";
    oscHigh.frequency.value = 58 * 2.01;
    const highGain = ctx.createGain();
    highGain.gain.value = 0.35;

    const filter = ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 900;
    filter.Q.value = 0.4;

    const lfo = ctx.createOscillator();
    lfo.frequency.value = 0.045; // one gentle sweep roughly every 22s
    const lfoGain = ctx.createGain();
    lfoGain.gain.value = 90;
    lfo.connect(lfoGain).connect(filter.frequency);

    oscA.connect(filter);
    oscB.connect(filter);
    oscHigh.connect(highGain).connect(filter);
    filter.connect(master);

    oscA.start(); oscB.start(); oscHigh.start(); lfo.start();

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
  const [languageChosen, setLanguageChosen] = useState(false);
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
    language: "en", // "en" | "ta" | "hi"
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
    const t = setTimeout(() => ambient.start(0.022, 2.2), 2500);
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
    if (h < 5) return t(settings.language, "greet_still");
    if (h < 12) return t(settings.language, "greet_morning");
    if (h < 17) return t(settings.language, "greet_afternoon");
    if (h < 21) return t(settings.language, "greet_evening");
    return t(settings.language, "greet_night");
  })();

  const startSingle = (key) => {
    setActiveKey(key);
    setSequence(null);
    setScreen("info");
  };

  const startComplete = () => {
    setActiveKey(null);
    setSequence(COMPLETE_SEQUENCE);
    setSeqIdx(0);
    setScreen("prep");
  };

  const beginFromInfo = () => setScreen("prep");

  const beginCountdown = () => {
    primeSpeech();
    if (sequence || PHOTO_SCENE_PRACTICES.includes(activeKey)) {
      ambient.start(0.045, 2.5);
    }
    setScreen("countdown");
  };

  const onCountdownDone = () => {
    ambient.start(0.014, 1.2); // fade to a quiet sustain rather than silence — bell/voice stay clearly primary
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
        ambient.start(0.045, 2.2);
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
    ambient.start(0.04, 3);
    setScreen("complete");
  };

  const continueFromTransition = () => {
    ambient.start(0.014, 0.9);
    if (pendingSeqIdxRef.current !== null) {
      setSeqIdx(pendingSeqIdxRef.current);
      pendingSeqIdxRef.current = null;
    }
    setScreen("practice");
  };

  const endSession = () => {
    ambient.start(0.022, 1.2);
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

        {entered && !languageChosen && (
          <LanguageSelectScreen
            onSelect={(lang) => {
              setSettings((s) => ({ ...s, language: lang }));
              setLanguageChosen(true);
            }}
          />
        )}

        {entered && languageChosen && screen === "welcome" && (
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
          />
        )}

        {screen === "prep" && (
          <PrepScreen
            title={sequence ? "Complete Practice" : currentPracticeMeta.name}
            onBack={() => setScreen(sequence ? "welcome" : "info")}
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
            text={t(settings.language, transitionText)}
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

function LanguageSelectScreen({ onSelect }) {
  const options = [
    { code: "en", label: "English", sub: "Continue in English" },
    { code: "ta", label: "தமிழ்", sub: "தமிழில் தொடரவும்" },
    { code: "hi", label: "हिंदी", sub: "हिंदी में जारी रखें" },
  ];
  return (
    <div className="practice-enter" style={{ position: "relative", flex: 1, display: "flex" }}>
      <div className="practice-photo-scene">
        <div className="abstract-scene-bg">
          <AbstractScene uid="langselect" hue={0} sat={1} />
        </div>
        <div className="practice-atmosphere" />
        <div className="practice-scrim" style={{ opacity: 1.05 }} />
        <div className="practice-photo-content" style={{ alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          <div className="complete-lotus-ring" style={{ marginBottom: 18 }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.4">
              <path d="M12 3c2.5 2 2.5 5 0 7-2.5-2-2.5-5 0-7zM12 21c2.5-2 2.5-5 0-7-2.5 2-2.5 5 0 7zM3 12c2-2.5 5-2.5 7 0-2 2.5-5 2.5-7 0zM21 12c-2 2.5-5 2.5-7 0 2-2.5 5-2.5 7 0z" />
            </svg>
          </div>
          <div className="glass-eyebrow" style={{ marginBottom: 6 }}>Choose your language</div>
          <p className="glass-subhead" style={{ marginBottom: 30, opacity: 0.75, fontSize: 13 }}>
            மொழியைத் தேர்ந்தெடுக்கவும் · भाषा चुनें
          </p>
          <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: 12 }}>
            {options.map((opt) => (
              <button
                key={opt.code}
                onClick={() => onSelect(opt.code)}
                className="glass-panel"
                style={{
                  width: "100%", padding: "18px 20px", border: "1px solid rgba(237,230,216,0.16)",
                  cursor: "pointer", textAlign: "left", background: "rgba(16,11,6,0.34)",
                }}
              >
                <div style={{ fontFamily: "var(--display)", fontSize: 20, color: "var(--sand)", fontWeight: 600 }}>{opt.label}</div>
                <div style={{ fontSize: 12.5, color: "var(--sand-dim)", marginTop: 3 }}>{opt.sub}</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

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
    const ambientTimer = setTimeout(() => ambient.start(0.07, 3.5), 2000);

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

function HomeCardArt({ tint }) {
  const palettes = {
    naadi: { a: "#F6ECDA", b: "#E9C98F", glow: "#C98F3F", branch: "#5B6B4E" },
    pranayamam: { a: "#EDEFE2", b: "#C7CFAE", glow: "#8FA06B", branch: "#5B6B4E" },
    dhyanam: { a: "#F2EDE3", b: "#D9CDB4", glow: "#B9A87E", branch: "#5B6B4E" },
    complete: { a: "#F7E6C8", b: "#E3AE5C", glow: "#D68A2E", branch: "#6E5A2E" },
  };
  const p = palettes[tint] || palettes.naadi;
  const gid = `homecard-bg-${tint}`;
  return (
    <svg viewBox="0 0 300 170" preserveAspectRatio="xMidYMid slice" style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
      <defs>
        <linearGradient id={gid} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={p.a} />
          <stop offset="100%" stopColor={p.b} />
        </linearGradient>
        <filter id={`homecard-soft-${tint}`}><feGaussianBlur stdDeviation="14" /></filter>
        <linearGradient id={`homecard-ray-${tint}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>
      <rect width="300" height="170" fill={`url(#${gid})`} />
      <g opacity="0.45">
        <rect x="230" y="-40" width="26" height="260" fill={`url(#homecard-ray-${tint})`} transform="rotate(18 243 90)" />
        <rect x="270" y="-40" width="18" height="260" fill={`url(#homecard-ray-${tint})`} transform="rotate(18 279 90)" />
      </g>
      <ellipse cx="180" cy="85" rx="130" ry="95" fill={p.glow} opacity="0.22" filter={`url(#homecard-soft-${tint})`} />
      <g stroke={p.branch} strokeWidth="2.2" fill="none" strokeLinecap="round" opacity="0.5">
        <path d="M300 170 C 268 142 258 112 272 74" />
        <path d="M272 102 C 258 97 249 101 242 112" />
        <path d="M280 82 C 267 79 258 82 252 92" />
      </g>
      <g fill={p.branch} opacity="0.5">
        <ellipse cx="242" cy="112" rx="8" ry="4.5" transform="rotate(-30 242 112)" />
        <ellipse cx="252" cy="92" rx="8" ry="4.5" transform="rotate(-30 252 92)" />
      </g>
      {/* small breathing-ring motif, echoing the app's signature element */}
      <circle cx="90" cy="85" r="34" fill="none" stroke={p.glow} strokeWidth="1.4" opacity="0.4" />
      <circle cx="90" cy="85" r="34" fill="none" stroke={p.glow} strokeWidth="5" opacity="0.15" filter={`url(#homecard-soft-${tint})`} />
    </svg>
  );
}

function HomePracticeCard({ tint, title, sub, onSelect, tall }) {
  return (
    <button className={`home-card ${tall ? "home-card-tall" : ""}`} onClick={onSelect}>
      <HomeCardArt tint={tint} />
      <div className="home-card-fade" />
      <div className="home-card-text">
        <div className="home-card-title">{title}</div>
        <div className="home-card-sub">{sub}</div>
        <div className="home-card-links">Start&nbsp;&nbsp;|&nbsp;&nbsp;Instructions</div>
      </div>
      <div className="home-card-arrow">→</div>
    </button>
  );
}

function WelcomeScreen({ greeting, onSelect, onComplete, onSettings, sessions, sessionsLoaded, settings }) {
  const lang = settings?.language || "en";
  return (
    <div className="home-light">
      <div className="home-header-row">
        <div className="home-brand-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#5B6B4E" strokeWidth="1.6"><path d="M12 3c3 3 3 8 0 11-3-3-3-8 0-11zM4 12c4-2 8-2 8 2-4 2-8 2-8-2zM20 12c-4-2-8-2-8 2 4 2 8 2 8-2z" /></svg>
          <span className="home-brand-word">Suvara</span>
        </div>
        <button className="home-settings-icon" onClick={onSettings} aria-label="Settings">
          <SettingsIcon size={17} color="#6B5738" />
        </button>
      </div>

      <h1 className="home-title-light">{greeting}.</h1>
      <p className="home-subhead-light">{t(lang, "take_moment")}</p>

      <div className="home-card-list">
        <HomePracticeCard tint="naadi" title="Naadi Shuththi" sub={t(lang, "sub_naadi")} onSelect={() => onSelect("naadi")} />
        <HomePracticeCard tint="pranayamam" title="Pranayamam" sub={t(lang, "sub_pranayamam")} onSelect={() => onSelect("pranayamam")} />
        <HomePracticeCard tint="dhyanam" title="Dhyanam" sub={t(lang, "sub_dhyanam")} onSelect={() => onSelect("dhyanam")} />
        <HomePracticeCard tint="complete" title="Complete Practice" sub={t(lang, "sub_complete")} onSelect={onComplete} tall />
      </div>

      {sessionsLoaded && sessions.length > 0 && (
        <div style={{ marginTop: 22 }}>
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

      <button className="home-settings-bar" onClick={onSettings}>
        <span style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <SettingsIcon size={17} color="#6B5738" /> {t(lang, "settings")}
        </span>
        <span style={{ color: "#8A7B5A" }}>›</span>
      </button>
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

function InfoScreen({ practice, onBack, onStart, settings }) {
  const lang = settings?.language || "en";
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
  const lang = settings?.language || "en";
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
  const lang = settings?.language || "en";
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

function TransitionScreen({ text, onContinue, playBell, nextPracticeKey, settings }) {
  useEffect(() => {
    playBell();
    speak(text, settings?.voiceEnabled, LOCALE_CODES[settings?.language] || "en-US");
    const timer = setTimeout(onContinue, 3200);
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

function PracticeScreen({ practice, cycles, settings, playBell, onEnd, onFinish, isLastOfSequence, isSequence }) {
  const lang = settings.language || "en";
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
      speak(t(settings.language, stage.instructionKey), settings.voiceEnabled, LOCALE_CODES[settings.language] || "en-US");
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
            {t(settings.language, stage.instructionKey)}
          </div>
        </div>

        <div style={{ flex: 1 }} />

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
  const lang = settings?.language || "en";
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

        <SettingRow icon={<Mic size={18} color="var(--brass)" />} label="Voice guidance" sub="Speak each instruction aloud">
          <Toggle checked={settings.voiceEnabled} onChange={(v) => set({ voiceEnabled: v })} />
        </SettingRow>

        <div style={{ padding: "12px 0", borderBottom: "1px solid rgba(237,230,216,0.06)" }}>
          <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 10 }}>
            <div style={styles.settingIconWrap}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--brass)" strokeWidth="1.8"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.5 2.5 4 6 4 9s-1.5 6.5-4 9c-2.5-2.5-4-6-4-9s1.5-6.5 4-9z" /></svg>
            </div>
            <div>
              <div style={{ color: "var(--sand)", fontSize: 15 }}>Language</div>
              <div style={{ color: "var(--sand-dim)", fontSize: 12, marginTop: 2 }}>Instructions and voice narration</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            {[
              { code: "en", label: "English" },
              { code: "ta", label: "தமிழ்" },
              { code: "hi", label: "हिंदी" },
            ].map((opt) => (
              <button
                key={opt.code}
                onClick={() => set({ language: opt.code })}
                style={{
                  flex: 1, padding: "9px 0", borderRadius: 12, fontSize: 13.5, cursor: "pointer",
                  border: settings.language === opt.code ? "1px solid var(--brass)" : "1px solid rgba(237,230,216,0.14)",
                  background: settings.language === opt.code ? "rgba(201,162,75,0.14)" : "transparent",
                  color: settings.language === opt.code ? "var(--brass)" : "var(--sand-dim)",
                  fontWeight: settings.language === opt.code ? 600 : 400,
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

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

