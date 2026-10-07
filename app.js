/**
 * CRAFT // CINEMA — Chronological Filmmaking Operating System
 * Interactive Logic, Animation Controllers, Video Theater, Sliders, and Datasets
 */

// ============================================================================
// THEME MANAGEMENT — Light / Dark with localStorage persistence
// ============================================================================
(function initTheme() {
  const saved = localStorage.getItem('cc-theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
  // Update icon once DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    updateThemeIcon(saved);
  });
})();

function updateThemeIcon(theme) {
  const isLight = theme === 'light';
  
  // Header pill controls
  const icon = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label-text');
  if (icon) {
    icon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
  if (label) {
    label.textContent = isLight ? 'DAYLIGHT' : 'DARKROOM';
  }

  // Floating dock controls
  const floatIcon = document.getElementById('floating-theme-icon');
  const floatText = document.getElementById('floating-theme-text');
  if (floatIcon) {
    floatIcon.className = isLight ? 'fa-solid fa-moon' : 'fa-solid fa-sun';
  }
  if (floatText) {
    floatText.textContent = isLight ? 'DAYLIGHT' : 'DARKROOM';
  }
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('cc-theme', next);
  updateThemeIcon(next);
  showFilmToast(
    next === 'light' ? 'Daylight Print Mode Activated' : 'Darkroom Mode Activated',
    next === 'light' ? 'fa-sun' : 'fa-moon'
  );
}

function setupThemeToggle() {
  const btn = document.getElementById('theme-toggle-btn');
  const floatBtn = document.getElementById('floating-theme-btn');
  [btn, floatBtn].forEach(el => {
    if (!el) return;
    el.addEventListener('click', (e) => {
      e.preventDefault();
      toggleTheme();
      if (typeof playClickSound === 'function') playClickSound('click');
    });
  });
}

// ============================================================================
// AUDIO FEEDBACK SYSTEM (Web Audio API Synthesizer)
// ============================================================================
let soundEnabled = true;
let audioCtx = null;
let audioAnalyser = null;
let masterGain = null;


function initAudioContext() {
  if (!audioCtx) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (AudioContext) {
      audioCtx = new AudioContext();
      audioAnalyser = audioCtx.createAnalyser();
      audioAnalyser.fftSize = 64;
      masterGain = audioCtx.createGain();
      masterGain.gain.setValueAtTime(0.8, audioCtx.currentTime);
      audioAnalyser.connect(masterGain);
      masterGain.connect(audioCtx.destination);
    }
  }
}

function showFilmToast(message, icon = 'fa-film') {
  const container = document.getElementById('film-toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'film-toast';
  toast.innerHTML = `<i class="fa-solid ${icon} gold"></i> <span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('hide');
    setTimeout(() => toast.remove(), 350);
  }, 2800);
}

function playClickSound(type = 'click') {
  if (!soundEnabled) return;
  try {
    initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;

    if (type === 'click') {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioAnalyser);
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(180, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);

    } else if (type === 'clapper') {
      // Crisp mechanical snap of wooden slate sticks
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(audioAnalyser);

      osc1.type = 'square';
      osc1.frequency.setValueAtTime(520, now);
      osc1.frequency.exponentialRampToValueAtTime(90, now + 0.07);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(260, now);
      osc2.frequency.exponentialRampToValueAtTime(60, now + 0.09);

      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.09);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.09);
      osc2.stop(now + 0.09);

    } else if (type === 'walkie') {
      // Two-tone burst radio chirp
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioAnalyser);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1760, now);
      osc.frequency.setValueAtTime(2200, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.setValueAtTime(0.15, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);

    } else if (type === 'shutter') {
      // 24fps mechanical 35mm camera pull-down burst
      for (let i = 0; i < 4; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioAnalyser);
        osc.type = 'square';
        osc.frequency.setValueAtTime(800 + i * 50, now + i * 0.04);
        gain.gain.setValueAtTime(0.1, now + i * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.04 + 0.025);
        osc.start(now + i * 0.04);
        osc.stop(now + i * 0.04 + 0.025);
      }

    } else if (type === 'braaam') {
      // Cinematic Hollywood trailer brass horn (Inception sub-bass swell)
      const osc1 = audioCtx.createOscillator();
      const osc2 = audioCtx.createOscillator();
      const filter = audioCtx.createBiquadFilter();
      const gain = audioCtx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sawtooth';
      osc1.frequency.setValueAtTime(58, now);
      osc2.frequency.setValueAtTime(58.5, now);
      osc1.frequency.exponentialRampToValueAtTime(38, now + 1.2);
      osc2.frequency.exponentialRampToValueAtTime(38.5, now + 1.2);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(250, now);
      filter.frequency.exponentialRampToValueAtTime(1400, now + 0.3);
      filter.frequency.exponentialRampToValueAtTime(150, now + 1.4);

      osc1.connect(filter);
      osc2.connect(filter);
      filter.connect(gain);
      gain.connect(audioAnalyser);

      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.35, now + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 1.4);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 1.4);
      osc2.stop(now + 1.4);

    } else if (type === 'projector') {
      // Film reel flutter
      for (let i = 0; i < 6; i++) {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioAnalyser);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320 + (i % 2) * 80, now + i * 0.06);
        gain.gain.setValueAtTime(0.08, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.04);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.04);
      }

    } else if (type === 'roomtone') {
      // 60Hz studio electrical ambient presence
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioAnalyser);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(60, now);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 0.4);
      gain.gain.linearRampToValueAtTime(0.18, now + 2.0);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.8);
      osc.start(now);
      osc.stop(now + 2.8);

    } else if (type === 'action') {
      // Megaphone whistle callout
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioAnalyser);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1400, now + 0.15);
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);

    } else if (type === 'bell') {
      // Sound stage red light bells (2 bells)
      [0, 0.25].forEach(delay => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioAnalyser);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1320, now + delay);
        gain.gain.setValueAtTime(0.18, now + delay);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.35);
        osc.start(now + delay);
        osc.stop(now + delay + 0.35);
      });

    } else if (type === 'tally') {
      // Camera Record Pip
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.connect(gain);
      gain.connect(audioAnalyser);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(1050, now);
      gain.gain.setValueAtTime(0.14, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
    }
  } catch (e) {
    console.debug('Audio not supported or blocked by policy', e);
  }
}

// ============================================================================
// 1. DATASET: THE 5 CHRONOLOGICAL PRODUCTION PHASES
// ============================================================================
const PHASES_DATA = {
  1: {
    id: 1,
    title: "Phase 1: Development",
    subtitle: "The Foundation — Idea, Script, Rights & Financing",
    bannerImage: "assets/images/clapperboard.jpg",
    duration: "2 Months to 2+ Years",
    standard: "Format: Final Draft / FadeIn, Standard Spec Screenplay",
    quote: "If it's not on the page, it's not on the stage. You can't fix a hollow story with an expensive lens.",
    pillars: [
      {
        icon: "fa-pen-nib",
        title: "1. The Logline & Concept",
        points: [
          "Craft the 1-Sentence High-Concept: [Protagonist] + [Inciting Incident] + [Action/Goal] + [Antagonist/Obstacle] + [High Stakes].",
          "Test market viability: Is the scope achievable for your real-world resources (locations, budget, actor ages)?",
          "Develop a 1-page Synopsis and a 10-12 page Treatment before writing dialogue."
        ]
      },
      {
        icon: "fa-scroll",
        title: "2. Screenwriting & Structure",
        points: [
          "Master the 3-Act / 15-Beat Sheet (Save the Cat): Catalyst (p.12), Break into Two (p.25), Midpoint (p.50), All is Lost (p.75), Climax (p.85-90).",
          "Industry formatting rule: 1 page = approximately 1 minute of screen time. Action blocks maximum 3-4 lines.",
          "Subtext is king: Characters rarely say what they actually mean. Write visual actions over exposition."
        ]
      },
      {
        icon: "fa-palette",
        title: "3. The Pitch Deck / Lookbook",
        points: [
          "Director's Vision statement: Why does this film need to exist today?",
          "Visual references (Color palette, lighting tone, lens language, comparable films / 'comps').",
          "Cast wish-list and key character breakdowns with visual mood boards."
        ]
      },
      {
        icon: "fa-vault",
        title: "4. Financing & Legal Rights",
        points: [
          "Chain of Title: Ensure 100% written ownership of the script, copyright, and any underlying intellectual property.",
          "Indie financing models: Crowdfunding (Kickstarter/Seed&Spark), private equity, fiscal sponsorship grants, self-funding.",
          "Create a preliminary Top-Sheet Budget separating Above-The-Line (cast, director, rights) and Below-The-Line (crew, gear, post)."
        ]
      }
    ],
    proTip: "Write for the budget you have, not the budget you wish you had. One incredible contained location with two intense actors beats ten poorly funded action scenes.",
    rookieTrap: "Spending months rewriting page 1 to 10 without finishing a complete first draft. Finish the vomit draft, then start real rewrites."
  },

  2: {
    id: 2,
    title: "Phase 2: Pre-Production",
    subtitle: "The Blueprint — Breakdowns, Scouting, Casting & Logistics",
    bannerImage: "assets/images/director_monitor.jpg",
    duration: "4 to 8 Weeks",
    standard: "Deliverables: DOOD, Call Sheets, Shot List, Tech Scout Notes",
    quote: "Amateurs talk about directing; professionals talk about logistics. 80% of directing is casting and preparation.",
    pillars: [
      {
        icon: "fa-scissors",
        title: "1. The Script Breakdown",
        points: [
          "Divide each page into standard 8ths (1/8th of a page). Mark scene elements with standard colored highlighters.",
          "Identify all production elements: Speaking Cast, Background Extras, Props, Wardrobe, Vehicles, Special FX, Sound FX.",
          "Generate a Day-Out-of-Days (DOOD) calendar to minimize actor shoot days and avoid overtime fees."
        ]
      },
      {
        icon: "fa-map-location-dot",
        title: "2. Location Scouting & Tech Scout",
        points: [
          "Never book a location on photos alone. Conduct an on-site Tech Scout with your DP, Gaffer, and Sound Mixer.",
          "Audio check: Listen for hums (HVAC, refrigerators), traffic, school bells, flight paths, echoey reverb.",
          "Power audit: Locate circuit breaker panels. Standard household outlets provide 15A/20A; calculate total wattage (Watts = Volts x Amps)."
        ]
      },
      {
        icon: "fa-masks-theater",
        title: "3. Casting & Table Reads",
        points: [
          "Write descriptive sides (2-page audition scenes). Test actors on subtext, adaptability, and listening ability.",
          "Host Chemistry Reads between romantic or rival leads to evaluate on-camera energy.",
          "Execute SAG-AFTRA Micro-Budget agreements or non-union talent release forms before any camera rolls."
        ]
      },
      {
        icon: "fa-network-wired",
        title: "4. Crew Assembly & Scheduling",
        points: [
          "Hire your Core Triangle: 1st Assistant Director (keeps schedule & safety), DP (visuals), Sound Mixer (clean dialogue).",
          "Production Scheduling: Schedule hardest scenes (emotional, complex lighting, night shoots) early in the schedule.",
          "Mandate the 12-Hour Turnaround Rule: Protect crew health by ensuring minimum 12 hours of rest between wrap and next call."
        ]
      }
    ],
    proTip: "Feed your crew like royalty. Good hot catering and great coffee will forgive low pay, long hours, and rain, while terrible food guarantees a mutiny.",
    rookieTrap: "Skipping permits and location release agreements. Getting shut down by police mid-shoot costs 10x more than doing it legitimately."
  },

  3: {
    id: 3,
    title: "Phase 3: Principal Photography",
    subtitle: "The Battleground — Execution, Coverage, Sound & Performance",
    bannerImage: "assets/images/hero_camera.jpg",
    duration: "Short: 2-5 Days | Feature: 15-28 Days",
    standard: "Protocol: Slate verification, Room tone, 24.00 fps sync",
    quote: "You enter principal photography with a plan. You leave with whatever you survived to capture.",
    pillars: [
      {
        icon: "fa-bullhorn",
        title: "1. Set Protocol & Command Chain",
        points: [
          "The 1st AD runs the set. The Director talks to actors and DP. Never have multiple people yelling instructions.",
          "Standard Slate Sequence: 1st AD: 'Quiet on set!' -> 'Roll Sound' -> Mixer: 'Speed!' -> 'Roll Camera' -> 2nd AC slates & claps -> 'Action!'.",
          "Always call 'Cut!' with a 2-second buffer to give editors breathing room at head and tail of clips."
        ]
      },
      {
        icon: "fa-compass",
        title: "2. The 180-Degree Rule & Coverage",
        points: [
          "Establish the Axis of Action: Keep the camera on one side of the line to maintain consistent left-to-right eye-lines.",
          "Shoot your Master Shot first, then move in for Two-Shots, OTS (Over-The-Shoulder), and matching Close-Ups.",
          "Always get Inserts and Cutaways: Hands fidgeting, ticking clocks, phones. They are the editor's emergency rescue tools."
        ]
      },
      {
        icon: "fa-lightbulb",
        title: "3. Lighting & Contrast Ratio",
        points: [
          "Shape the light: Don't just make it bright—create shadow. Key side vs Fill side creates cinematic depth.",
          "Shoot into the shadow side of the face (Broad vs Short lighting). Short lighting adds mystery, bone structure, and mood.",
          "Use practical lights (lamps, neon signs, windows) in the background to add production value and color contrast."
        ]
      },
      {
        icon: "fa-microphone-lines",
        title: "4. Audio Capture & Room Tone",
        points: [
          "Dialogue is 60% of perceived film quality. Audiences will tolerate mediocre video, but will turn off bad audio in 5 seconds.",
          "Get the boom mic as close as humanly possible (just 2 inches outside the frame line).",
          "Mandatory: Record 60 seconds of dead-silent Room Tone at every single location before moving the company."
        ]
      }
    ],
    proTip: "Direct actors using actionable verbs, never emotional adjectives. Don't say 'Be sadder' or 'Be angrier'. Say: 'Punish him with silence', 'Beg her not to walk away', or 'Charm him into giving up the key'.",
    rookieTrap: "Doing 15 takes when take 3 was already perfect, running out of time, and then having only 10 minutes left to shoot the emotional climax."
  },

  4: {
    id: 4,
    title: "Phase 4: Post-Production",
    subtitle: "The Final Rewrite — Editing, Sound Design, Color & VFX",
    bannerImage: "assets/images/editing_suite.jpg",
    duration: "2 to 6 Months",
    standard: "Picture Lock -> Conform -> Sound Mix -> Color Grade",
    quote: "A movie is made three times: in the writing, in the shooting, and in the editing room.",
    pillars: [
      {
        icon: "fa-film",
        title: "1. The Editorial Pipeline",
        points: [
          "Order of Cuts: Assembly Cut (everything in script order) -> Rough Cut -> Director's Cut -> Fine Cut -> Picture Lock.",
          "Picture Lock Rule: Once Picture Lock is declared, not a single frame may be added or removed. All sound, VFX, and color conform to this exact timeline.",
          "Cut on action: Match movement between wide and close shots to disguise cuts and keep the audience immersed."
        ]
      },
      {
        icon: "fa-sliders",
        title: "2. Sound Design & Foley",
        points: [
          "Track Laying: Dialogue Cleanup (remove hiss with spectral repair) -> ADR (dialogue replacement) -> Foley -> SFX -> Ambience -> Score.",
          "Create sonic world-building: Layer subtle room tone, wind rustle, distant car horns, and footsteps to create physical weight.",
          "Loudness Standards: Broadcast television targets -24 LKFS/LUFS; web and streaming targets -14 to -16 LUFS."
        ]
      },
      {
        icon: "fa-eye-dropper",
        title: "3. Color Science & Grading",
        points: [
          "Shot-to-Shot Matching: Balance exposure, white balance, and skin tones across all angles before applying a creative look.",
          "Use Color Scopes: Waveform for luma exposure (keep blacks above 0 and highlights below 100 IRE), Vectorscope for skin tone line.",
          "Work in ACES or DaVinci Wide Gamut to ensure maximum dynamic range preservation from raw camera sensor data."
        ]
      },
      {
        icon: "fa-music",
        title: "4. Music Composition & Stems",
        points: [
          "Temp Score Trap: Don't fall in love with temp music from Hollywood blockbusters that you cannot afford or recreate.",
          "Diegetic vs Non-Diegetic: Know when music exists inside the story world (radio, club) vs emotional orchestral score.",
          "Deliver DME Stems: Dialogue, Music, and Effects rendered as separate tracks for international dubbing and distribution."
        ]
      }
    ],
    proTip: "Step away from your cut for 5 full days before showing it to test audiences. You need fresh eyes to detach from the pain of how difficult a shot was to capture.",
    rookieTrap: "Sending unfinished picture cuts to the sound mixer or colorist, resulting in duplicate work, mismatched timecodes, and blown post budgets."
  },

  5: {
    id: 5,
    title: "Phase 5: Distribution & Exhibition",
    subtitle: "The Delivery — Festivals, Markets, Aggregators & Monetization",
    bannerImage: "assets/images/lighting_rig.jpg",
    duration: "6 Months to 2+ Years",
    standard: "DCP (DCI Compliant), ProRes 422HQ/4444, M&E, CC",
    quote: "A film isn't finished when it's exported. It's finished when someone other than your mother watches it.",
    pillars: [
      {
        icon: "fa-award",
        title: "1. Film Festival Strategy",
        points: [
          "Tier 1 Premiere Strategy: Sundance, Cannes, Venice, Toronto, Berlinale, SXSW, Tribeca. You only get one World Premiere.",
          "Regional & Genre Festivals: Fantastic Fest, Sitges, Austin Film Festival, Palm Springs, Clermont-Ferrand.",
          "Budget for festival submissions: Application fees, travel, DCP creation, and poster printing ($1,500 - $4,000 reserve)."
        ]
      },
      {
        icon: "fa-handshake",
        title: "2. Sales Agents & Markets",
        points: [
          "Major Film Markets: EFM (Berlin), Marché du Film (Cannes), AFM (American Film Market - Los Angeles).",
          "Understand Sales Agent terms: Standard commission is 15-25% plus capped recoupable marketing expenses.",
          "Territory Presales: Selling domestic (US/Canada) separately from international foreign territories."
        ]
      },
      {
        icon: "fa-cloud-arrow-up",
        title: "3. Direct-to-Consumer & Aggregators",
        points: [
          "Aggregators: Platforms like FilmHub, Quiver, and Bitmax ingest your film to Amazon Prime, Apple TV, Tubi, and Google Play.",
          "SVOD vs TVOD vs AVOD: Subscription (Netflix) vs Transactional rental (Apple) vs Ad-supported free streaming (Tubi).",
          "Build an audience before release: Behind-the-scenes TikToks, Instagram reels, and director newsletters."
        ]
      },
      {
        icon: "fa-box-archive",
        title: "4. The Deliverables Binder",
        points: [
          "DCP (Digital Cinema Package): DCI-compliant JPEG 2000 wrapped MXF file formatted on Linux ext3 drive for theater projectors.",
          "Apple ProRes 4444 or ProRes 422 HQ Master with uncompressed 5.1 and 2.0 audio.",
          "Legal Deliverables: Music cue sheets, talent release agreements, copyright registrations, closed captions (SRT / SCC)."
        ]
      }
    ],
    proTip: "Design your festival poster and key art before you finish the film. 90% of festival programmers and streaming viewers make their initial split-second judgment on the thumbnail art.",
    rookieTrap: "Signing exclusive worldwide distribution deals with predatory companies that take all revenue streams with zero minimum guarantees and endless hidden 'expenses'."
  }
};

// ============================================================================
// 2. DATASET: DEPARTMENTS & CREW SECTORS
// ============================================================================
const DEPARTMENTS_DATA = [
  {
    id: "directing",
    category: "creative",
    title: "Directing & Producing",
    leadRole: "Director & Producer",
    icon: "fa-clapperboard",
    summary: "The visionary leaders and executive drivers. The Director translates script into visual language and actor performances; the Producer manages finance, legal, and crew.",
    roles: ["Director", "Executive Producer", "Line Producer", "UPM", "1st AD", "2nd AD", "Script Supervisor"],
    gear: ["Director's Viewfinder", "Monitor / Wireless Receiver", "Sides & Shot list Binder"],
    mandate: "Command the narrative vision, shield the crew from chaos, and make 500 decisive creative calls per day.",
    collabTips: "When giving notes to actors, speak privately at eye level. Never shout performance critique across the set.",
    redFlag: "Indecision. A confident wrong decision that gets revised is better than paralyzing 30 crew members waiting."
  },
  {
    id: "camera",
    category: "camera",
    title: "Camera & Cinematography",
    leadRole: "Director of Photography (DP / Cinematographer)",
    icon: "fa-camera",
    summary: "Crafts the visual aesthetics, framing, lens selection, camera movement, and lighting schema in close tandem with the Director.",
    roles: ["Director of Photography", "Camera Operator", "1st AC (Focus Puller)", "2nd AC (Clapper/Loader)", "DIT (Digital Imaging Tech)", "Steadicam / Gimbal Op"],
    gear: ["Cinema Camera (ARRI/RED/Sony/BMPCC)", "Prime Lens Kit", "Wireless Follow Focus (Teradek RT)", "Monitors", "Tripod/Dolly"],
    mandate: "Transform thematic emotions into optical reality through focal length, lighting contrast, and deliberate framing.",
    collabTips: "Discuss references in prep with still frames and art paintings. On set, tell the DP what emotion you want, not just what lens mm to use.",
    redFlag: "Spending 90 minutes tweaking one light while the actors sit cold and lose momentum."
  },
  {
    id: "lighting",
    category: "lighting",
    title: "Grip & Electric (G&E)",
    leadRole: "Gaffer & Key Grip",
    icon: "fa-bolt",
    summary: "The powerhouses of light and physical rigging. Electrics manage illumination and power distribution; Grips manage camera support, diffusion, and physical safety.",
    roles: ["Gaffer (Chief Lighting Tech)", "Best Boy Electric", "Key Grip", "Best Boy Grip", "Dolly Grip"],
    gear: ["LED Mat Lights (Aputure/Nanlite)", "Fresnels", "C-Stands", "Sandbags", "Flags & Floppies", "Diffusion Silks", "Apple Boxes"],
    mandate: "Shape, bounce, cut, and control light while securing heavy equipment so nothing falls on cast or crew.",
    collabTips: "Direct your lighting requests exclusively through the Gaffer and DP. Never ask a junior grip to move a light directly.",
    redFlag: "Unbagged C-stands. A C-stand without a sandbag on the tall leg is a severe hazard on set."
  },
  {
    id: "sound",
    category: "sound",
    title: "Production Sound Department",
    leadRole: "Production Sound Mixer",
    icon: "fa-microphone-lines",
    summary: "The guardians of audio. Captures clean dialogue, room tone, wild tracks, and location ambient sound directly during filming.",
    roles: ["Sound Mixer", "Boom Operator", "Sound Utility / 2nd Boom"],
    gear: ["Field Audio Recorder (Sound Devices/Zoom F8n)", "Shotgun Microphones (Sennheiser MKH 416)", "Lavalier Wireless Kits", "Boom Pole & Blimp/Deadcat", "Timecode Boxes (Tentacle Sync)"],
    mandate: "Capture pristine, unclipped dialogue with maximum signal-to-noise ratio and zero background contamination.",
    collabTips: "When the sound mixer says 'Plane overhead, we need another take', listen to them. Dialogue replacement in post costs thousands.",
    redFlag: "Tucking wireless lavalier transmitters directly against synthetic rustling fabric without moleskin or vampire clips."
  },
  {
    id: "art",
    category: "art",
    title: "Art & Production Design",
    leadRole: "Production Designer",
    icon: "fa-couch",
    summary: "Builds the physical universe of the story. Responsible for architecture, set dressing, color schemes, furniture, vehicles, and props.",
    roles: ["Production Designer", "Art Director", "Set Decorator", "Leadman", "Prop Master", "Scenic Painter"],
    gear: ["Set Dressing Kit", "Prop Storage Cases", "Toolkit & Adhesives", "Color Swatches & Texture Boards"],
    mandate: "Ensure every object in front of the lens reflects the characters' psychology, economic status, and narrative reality.",
    collabTips: "Give your Art Director clear color restrictions (e.g. 'No red props in this apartment until scene 25').",
    redFlag: "Hero props that fail during filming with no backup duplicate on standby."
  },
  {
    id: "wardrobe",
    category: "art",
    title: "Costume, Hair & Makeup (HMU)",
    leadRole: "Costume Designer & Key MUA",
    icon: "fa-shirt",
    summary: "Styles the physical appearance of the actors. Manages continuity of cuts, bruises, sweat, wardrobe deterioration, and period authenticity.",
    roles: ["Costume Designer", "Wardrobe Supervisor", "Key Makeup Artist", "Hair Stylist", "SFX Prosthetics Tech"],
    gear: ["Makeup Station & Ring Light", "Steamer & Sewing Kit", "Blood/Dirt Continuity Kits", "Wardrobe Racks"],
    mandate: "Translate character evolution onto skin and fabric while keeping talent confident and comfortable in their skin.",
    collabTips: "Always supply duplicate shirts for scenes involving food spills, blood, sweat, or rain.",
    redFlag: "Failing to photograph talent before and after takes to track makeup continuity between days."
  },
  {
    id: "post",
    category: "post",
    title: "Editorial & Post-Production",
    leadRole: "Lead Editor & Post Supervisor",
    icon: "fa-film",
    summary: "The final story crafters. Assembles footage, manipulates pacing, cleans audio, colors the image, and blends visual effects.",
    roles: ["Lead Editor", "Assistant Editor", "Colorist", "Sound Designer / Re-Recording Mixer", "Foley Artist", "VFX Artist", "Composer"],
    gear: ["DaVinci Resolve Studio", "Adobe Premiere Pro / Avid Media Composer", "Color Calibrated OLED Monitor", "Pro Tools Studio", "RAID Storage Systems"],
    mandate: "Sculpt tempo, rhythm, emotional resonance, and audio-visual punch out of raw rushes.",
    collabTips: "Give your editor freedom to do their own assembly cut before stepping into the room with your notes.",
    redFlag: "Editing directly from camera original media (RAW/H.265) without creating lightweight ProRes/DNxHR proxies."
  },
  {
    id: "ad",
    category: "creative",
    title: "1st AD & Production Office",
    leadRole: "First Assistant Director (1st AD)",
    icon: "fa-stopwatch",
    summary: "The field general of the film set. Manages time, schedules, safety protocols, background actors, and keeps shooting on schedule.",
    roles: ["1st Assistant Director", "2nd Assistant Director", "Key Production Assistant", "Set PAs"],
    gear: ["Megaphone", "Walkie-Talkies (CP200d) with Surveillance Headsets", "Printed Call Sheets & Stripboard"],
    mandate: "Make the day! Prevent overtime, protect crew physical safety, and keep the set moving like clockwork.",
    collabTips: "Your 1st AD is the Director's best friend. Never contradict your 1st AD in front of the crew on scheduling.",
    redFlag: "A director who refuses to adapt the shot list when falling 2 hours behind schedule."
  }
];

// ============================================================================
// 3. DATASET: FILMMAKER GLOSSARY & ON-SET JARGON (65+ Terms)
// ============================================================================
const GLOSSARY_DATA = [
  { term: "180-Degree Rule", cat: "camera", def: "A cinematography guideline stating that the camera must stay on one side of an imaginary axis of action between characters to maintain consistent screen direction.", origin: "Classical Hollywood Continuity" },
  { term: "Abby Singer", cat: "set", def: "The second-to-last shot of the shooting day. Named after legendary production manager Abby Singer who always announced it to get crew packing.", origin: "Hollywood lore" },
  { term: "Martini Shot", cat: "set", def: "The absolute final shot of the production day. 'The next shot is out of a glass (the martini)'.", origin: "Studio era slang" },
  { term: "C-47", cat: "lighting", def: "An ordinary wooden clothespin used by grips and electrics to attach gels, diffusion, and black foil to hot lights without burning fingers.", origin: "Named after warehouse bin C-47 to justify higher budget line item" },
  { term: "Stinger", cat: "lighting", def: "An extension cord on a film set, usually heavy-duty black single-phase cable with ground.", origin: "Grip & Electric slang" },
  { term: "Apple Box", cat: "lighting", def: "Wooden boxes made in precise standard sizes (Full, Half, Quarter, Pancake) used to elevate actors, prop up furniture, or level tracks.", origin: "Standard set carpentry" },
  { term: "Pancake", cat: "lighting", def: "The thinnest standard apple box (eighth-height, roughly 1 inch thick).", origin: "Film set carpentry" },
  { term: "MOS", cat: "sound", def: "Shooting a scene without recording sound. Stands historically for 'Mit Out Sound' (mocking German director Erich von Stroheim) or 'Motor Only Sync'.", origin: "Early German talkies" },
  { term: "ADR", cat: "sound", def: "Automated Dialogue Replacement (also called 'looping'). Re-recording an actor's dialogue in a studio booth to replace noisy location audio.", origin: "Post-production standard" },
  { term: "Foley", cat: "sound", def: "The recreation of everyday sound effects (footsteps, cloth rustling, key drops) performed by Foley artists in sync with the picture on a sound stage.", origin: "Named after Jack Foley (Universal Pictures)" },
  { term: "Room Tone", cat: "sound", def: "60 seconds of silence recorded on location with cast and crew motionless, capturing the unique acoustic signature of the room for post audio blending.", origin: "Sound editing staple" },
  { term: "Wild Track", cat: "sound", def: "Audio recorded on location without camera rolling, such as ambient traffic, door creaks, or a specific dialogue line.", origin: "Production sound" },
  { term: "DCP", cat: "post", def: "Digital Cinema Package. The collection of digital files (JPEG 2000 images, uncompressed PCM audio, XML playlists) used to exhibit movies in commercial cinemas.", origin: "Digital Cinema Initiatives (DCI)" },
  { term: "Hero Elevation (Mass Staging)", cat: "camera", def: "Directorial and camera techniques (low-angle 24mm framing, high-contrast silhouette backlighting, slow-motion speed-ramps, and anticipatory reaction shots) designed to amplify a protagonist's mythic physical stature, popularized internationally by Prabhas in 'Salaar: Part 1 – Ceasefire' and 'Baahubali'.", origin: "Pan-Indian / Blockbuster Action Cinema" },
  { term: "Speed Ramping", cat: "camera", def: "Smoothly shifting frame rate from normal 24 FPS down to 120–1000 FPS (hyper slow-motion on Phantom Flex4K) and snapping back mid-action to emphasize bone-crushing weapon impact, weapon weight, and kinetic momentum (the signature visual hallmark of director Prashanth Neel in 'Salaar').", origin: "High-speed camera choreography" },
  { term: "LUT", cat: "post", def: "Look-Up Table. A mathematical formula used to transform color values, often applied on monitors to convert flat Log footage into standard Rec.709 viewing.", origin: "Color science" },
  { term: "Log Gamma", cat: "camera", def: "A logarithmic camera sensor profile (e.g. S-Log3, Canon Log, ARRI LogC) that records a flat, desaturated image to maximize dynamic range in highlights and shadows.", origin: "Digital sensor encoding" },
  { term: "ACES", cat: "post", def: "Academy Color Encoding System. A standardized, device-independent color management framework developed by the Academy of Motion Picture Arts and Sciences.", origin: "AMPAS" },
  { term: "Dutch Angle", cat: "camera", def: "A camera angle tilted noticeably to one side (canted), creating a feeling of psychological tension, unease, disorientation, or madness.", origin: "German Expressionism (Deutsch Angle)" },
  { term: "Anamorphic", cat: "camera", def: "Lenses with oval optical elements that squeeze a wide horizontal field of view onto a normal sensor, creating oval bokeh and horizontal blue flares.", origin: "Widescreen cinema" },
  { term: "Spherical Lens", cat: "camera", def: "Standard lenses that capture circular optical images with zero geometric horizontal squeeze and circular bokeh balls.", origin: "Optics standard" },
  { term: "Shutter Angle (180°)", cat: "camera", def: "The rule establishing natural motion blur by keeping the shutter speed at double the frame rate (e.g., 1/48s at 24fps).", origin: "Rotary film disc shutters" },
  { term: "Depth of Field (DoF)", cat: "camera", def: "The distance between the nearest and farthest objects in a scene that appear acceptably sharp in focus.", origin: "Optical physics" },
  { term: "Rack Focus", cat: "camera", def: "The deliberate shifting of the focal plane from one subject in the frame to another during a continuous shot to direct audience attention.", origin: "Focus pulling technique" },
  { term: "Call Sheet", cat: "set", def: "Daily production document created by the 2nd AD detailing crew call times, location address, parking, scenes to be shot, and emergency medical contacts.", origin: "Studio logistics" },
  { term: "DOOD", cat: "set", def: "Day Out of Days. A master chart detailing which actors work on which production days (Hold, Drop, Pickup, Work).", origin: "Scheduling standard" },
  { term: "Stripboard", cat: "set", def: "A production schedule chart using color-coded strips representing every scene, reordered to maximize shooting efficiency by location and cast.", origin: "1st AD scheduling" },
  { term: "Gaffer", cat: "lighting", def: "The head of the electrical department on set, responsible for executing the lighting plan designed with the Director of Photography.", origin: "British stagecraft ('gaff' pole)" },
  { term: "Key Grip", cat: "lighting", def: "The head of the grip department, responsible for camera rigging (dollies, cranes) and lighting shaping gear (flags, silks, overheads).", origin: "Stagehand union title" },
  { term: "Best Boy", cat: "lighting", def: "The chief assistant and logistics manager to either the Gaffer (Best Boy Electric) or Key Grip (Best Boy Grip), handling gear orders, crew, and timesheets.", origin: "Nautical & theatrical lineage" },
  { term: "Chiaroscuro", cat: "lighting", def: "High-contrast lighting style emphasizing deep, painterly shadows and bright highlights, heavily used in Film Noir and Baroque painting.", origin: "Italian: Chiaro (light) + Scuro (dark)" },
  { term: "Key Light", cat: "lighting", def: "The primary and brightest light source illuminating the subject, establishing the scene's mood, direction, and exposure.", origin: "3-point lighting formula" },
  { term: "Fill Light", cat: "lighting", def: "A secondary, softer light source used to lighten shadows created by the key light and control contrast ratio.", origin: "3-point lighting formula" },
  { term: "Backlight / Rim Light", cat: "lighting", def: "A light positioned behind and above the subject that outlines their hair and shoulders, separating them visually from a dark background.", origin: "3-point lighting formula" },
  { term: "Practical Light", cat: "lighting", def: "Any functional light source that appears in the frame as a story element, such as a bedside lamp, chandelier, street light, or neon sign.", origin: "Cinematography vocabulary" },
  { term: "Bounce Board / Beadboard", cat: "lighting", def: "Styrofoam or foamcore boards used to reflect gentle, diffused bounce light onto actors' faces without adding new fixtures.", origin: "Grip & lighting tools" },
  { term: "Flag", cat: "lighting", def: "A rectangular wire frame covered in black duvetyne fabric, mounted on a C-stand to block unwanted spill light or create shadows.", origin: "Grip shaping tools" },
  { term: "Scrim", cat: "lighting", def: "A wire mesh circle dropped into light fixtures to reduce light intensity without altering color temperature.", origin: "Lighting modifiers" },
  { term: "CTO / CTB", cat: "lighting", def: "Color Temperature Orange (warms daylight to tungsten 3200K) and Color Temperature Blue (cools tungsten to daylight 5600K).", origin: "Color gels" },
  { term: "Kelvin Scale", cat: "lighting", def: "Measurement of light color temperature: 3200K (warm tungsten/candlelight) up to 5600K (crisp blue daylight).", origin: "Thermodynamics in optics" },
  { term: "Boom Pole", cat: "sound", def: "An extendable carbon-fiber or aluminum pole holding a shotgun microphone directly above or below actors' mouth lines.", origin: "Production sound" },
  { term: "Deadcat / Windjammer", cat: "sound", def: "A thick synthetic fur cover placed over microphone blimps to eliminate turbulent wind buffet noise outdoors.", origin: "Location audio slang" },
  { term: "32-Bit Float", cat: "sound", def: "Audio recording technology with massive dynamic range that prevents digital clipping from unexpected yells or whispers without manual gain adjustment.", origin: "Modern digital audio" },
  { term: "Clapperboard / Slate", cat: "camera", def: "A board containing scene, take, and roll numbers with hinged clapper sticks, used to synchronize picture and sound in post.", origin: "Early cinema sync" },
  { term: "Tail Slate", cat: "camera", def: "Clapping the slate upside down at the end of a take instead of the beginning, used when starting with a delicate spontaneous moment.", origin: "Camera assistant protocol" },
  { term: "Second Unit", cat: "creative", def: "A separate, auxiliary camera crew responsible for shooting establishing shots, cutaways, driving plates, and stunt sequences.", origin: "Production hierarchy" },
  { term: "Over-The-Shoulder (OTS)", cat: "camera", def: "A shot framed from behind the shoulder of one character looking toward another, establishing geography and intimacy during dialogue.", origin: "Coverage standards" },
  { term: "Master Shot", cat: "camera", def: "A single continuous wide shot that records the entirety of a scene from start to finish before moving into closer coverage.", origin: "Scene coverage technique" },
  { term: "Insert Shot", cat: "camera", def: "A close-up shot of an inanimate object (a ticking watch, a handwritten letter, a gun) inserted into a scene to emphasize story detail.", origin: "Editorial tools" },
  { term: "Cutaway", cat: "camera", def: "A shot related to the main action but briefly looking away (a crowd reacting, a dog barking) to provide flexible editing transitions.", origin: "Editorial technique" },
  { term: "Picture Lock", cat: "post", def: "The formal milestone where the visual edit is finalized and frozen, after which no frames can change so sound, VFX, and color can finish.", origin: "Post pipeline milestone" },
  { term: "Color Conform", cat: "post", def: "Re-linking the offline proxy edit timeline back to the original high-resolution camera RAW files for final master grading.", origin: "Post finishing workflow" },
  { term: "DME Stems", cat: "post", def: "Dialogue, Music, and Effects exported as separate isolated audio track stems for foreign language dubbing and licensing.", origin: "Distribution deliverables" },
  { term: "EPK", cat: "post", def: "Electronic Press Kit. A marketing package including high-resolution still photos, cast bios, synopsis, and director statements for journalists.", origin: "Film marketing" },
  { term: "Chain of Title", cat: "legal", def: "The unbroken series of legal contracts establishing complete, unencumbered ownership of the script, music, and intellectual property.", origin: "Entertainment law" },
  { term: "Errors & Omissions (E&O)", cat: "legal", def: "Indemnity insurance policy protecting producers and distributors against copyright infringement, defamation, and invasion of privacy lawsuits.", origin: "Film financing requirement" },
  { term: "Sides", cat: "set", def: "A pocket-sized booklet containing the miniaturized script pages scheduled to be filmed on that specific day.", origin: "On-set paperwork" },
  { term: "Striking", cat: "set", def: "Callout shouted before turning on or off a high-powered light on set to alert crew not to look directly into the beam.", origin: "G&E set etiquette" },
  { term: "Flying In", cat: "set", def: "Callout meaning a requested prop, lens, or piece of gear is currently being carried onto set immediately.", origin: "Set radio communication" },
  { term: "Crossing", cat: "set", def: "Callout shouted by crew when walking directly in front of the camera lens while the camera operator is framing.", origin: "Set etiquette" },
  { term: "Holding", cat: "set", def: "Location or staging area where actors and background extras wait in costume and makeup until called to set.", origin: "Set management" },
  { term: "Craft Services (Crafty)", cat: "set", def: "The food, snack, and drink station available continuously to cast and crew throughout the shooting day (separate from sit-down meals).", origin: "Film union conventions" },
  { term: "Turnaround", cat: "set", def: "The mandatory rest period (usually 12 hours) required between the end of shooting on one day and the call time of the next.", origin: "SAG-AFTRA & IATSE rules" },
  { term: "Wild Wall", cat: "art", def: "A movable studio set wall built on casters or pins that can be rolled away to make room for camera placement in tight rooms.", origin: "Soundstage construction" },
  { term: "Dead Space", cat: "camera", def: "Unintentional, unmotivated negative space in a frame that draws eyes away from the dramatic focal point.", origin: "Composition theory" },
  { term: "Lead Room / Looking Room", cat: "camera", def: "The negative space left in front of a subject's face in the direction they are gazing or moving.", origin: "Framing guidelines" },
  { term: "Aspect Ratio", cat: "camera", def: "The proportional relationship between an image's width and height (e.g. 1.85:1 theatrical, 2.39:1 anamorphic scope, 1.33:1 vintage 4:3).", origin: "Cinema standards" }
];

// ============================================================================
// 4. DATASET: PRE-FLIGHT AUDIT CHECKLIST (30 Critical Chronological Protocols)
// ============================================================================
const CHECKLIST_DATA = [
  { id: "c1", cat: "legal", title: "Talent Release Forms Signed", desc: "Every actor, extra, and voiceover artist must sign a binding image/voice release before step on set." },
  { id: "c2", cat: "legal", title: "Location Agreements Executed", desc: "Signed agreement with property owners defining hours, parking, noise, fee, and damage indemnification." },
  { id: "c3", cat: "legal", title: "General Liability & Equipment Insurance", desc: "Valid insurance certificates naming city and property owners as additional insured." },
  { id: "c4", cat: "legal", title: "Filming Permits Secured", desc: "City / municipal council permits approved for exterior filming, street parking, or generator use." },
  { id: "c5", cat: "legal", title: "Artwork & Logo Clearances", desc: "No visible trademarked brand logos (Apple, Nike, Coke) or copyrighted paintings without clearance." },

  { id: "c6", cat: "preprod", title: "Tech Scout Conducted", desc: "DP, Gaffer, and Sound Mixer have physically walked the location, tested power outlets, and noted noise." },
  { id: "c7", cat: "preprod", title: "8ths of a Page Script Breakdown Done", desc: "Full scene element breakdown generated; total shoot pages capped below 5 pages per 10-hour day." },
  { id: "c8", cat: "preprod", title: "Director Shot List & Overhead Floorplans", desc: "Numbered shots ready with lens focal lengths and camera movement directions for DP." },
  { id: "c9", cat: "preprod", title: "Call Sheet Distributed (12h Prior)", desc: "Includes precise call times, weather, hospital address, parking maps, and meal times." },
  { id: "c10", cat: "preprod", title: "Dietary Restrictions & Catering Confirmed", desc: "Vegetarian, vegan, gluten-free, and halal meals accounted for. Hot meal guaranteed every 6 hours." },
  { id: "c11", cat: "preprod", title: "Hero Props Duplicate Backups", desc: "Breakable or essential props (glasses, letters, cellphones) have at least 2 identical backups." },

  { id: "c12", cat: "shootday", title: "Camera Sensor Cleaned & Test Shakes Done", desc: "No dust spots visible on sensor when stopped down to f/22 against a white wall." },
  { id: "c13", cat: "shootday", title: "Timecode Sync Verified (Jam Sync)", desc: "Camera and audio recorder synced via Tentacle Sync or Ambient box to identical timecode." },
  { id: "c14", cat: "shootday", title: "White Balance & Black Shading Calibrated", desc: "Camera sensor calibrated to appropriate Kelvin temperature using 18% neutral gray card." },
  { id: "c15", cat: "shootday", title: "Lens Cleaning Paper & Air Blower on Hand", desc: "1st AC has optical fluid and microfiber cloths ready for quick lens swaps." },
  { id: "c16", cat: "shootday", title: "C-Stands Sandbagged (Safety Rule)", desc: "Every C-stand and high-stand has a 20lb sandbag on the tallest leg pointing toward the weight." },
  { id: "c17", cat: "shootday", title: "Grip Tape, C-47s, and Black Wrap in Pouch", desc: "Standard expendables accessible for flagging light spill without searching trucks." },
  { id: "c18", cat: "shootday", title: "First Aid Kit & Emergency Contact Visible", desc: "First aid station setup at staging area; nearest emergency hospital written on call sheet." },
  { id: "c19", cat: "shootday", title: "Fire Extinguisher Near Electrical Junctions", desc: "Working extinguisher positioned near heavy power distro or generators." },

  { id: "c20", cat: "audio", title: "60-Second Room Tone Recorded", desc: "Recorded in complete silence at each location before moving camera setups." },
  { id: "c21", cat: "audio", title: "Microphone Proximity Checked (2-3ft Max)", desc: "Boom mic overhead pointing toward sternum, outside frame line, protected by wind protection." },
  { id: "c22", cat: "audio", title: "Lavalier Moleskin / Vampire Clips Applied", desc: "Microphones secured to talent clothing with anti-friction damping to prevent cloth rustle." },
  { id: "c23", cat: "audio", title: "Dual-Card Slot Media Redundancy", desc: "Audio recorder recording to dual SD cards simultaneously in case of memory corruption." },
  { id: "c24", cat: "audio", title: "Wild Sound & Foley Atmosphere Captured", desc: "Specific location sounds (squeaky door, refrigerator hum, distant church bell) recorded solo." },

  { id: "c25", cat: "post", title: "3-2-1 Media Backup Rule Enforced (DIT)", desc: "Footage copied to 3 locations, on 2 different media types, with 1 copy stored off-site." },
  { id: "c26", cat: "post", title: "Checksum Verification on Card Offload", desc: "Offloaded using ShotPut Pro, Silverstack, or DaVinci Resolve Clone Tool with MD5/xxHash checksum." },
  { id: "c27", cat: "post", title: "Editing Proxies Generated in ProRes / DNxHR", desc: "Lightweight 1080p proxies generated for fast, responsive editing timeline performance." },
  { id: "c28", cat: "post", title: "Picture Lock Document Signed", desc: "Formal agreement locking visual edit prior to handing off to colorist and sound mixer." },
  { id: "c29", cat: "post", title: "Dialogue Spectral Repair (iZotope RX)", desc: "AC hums, mic bumps, and mouth clicks cleaned up on isolated vocal stems." },
  { id: "c30", cat: "post", title: "DCP Test Screened in Real Cinema", desc: "Tested on a commercial theater projector to check 5.1 channel balance and gamma 2.6 calibration." }
];

// ============================================================================
// 5. DATASET: BUDGET TIERS MATRIX
// ============================================================================
const BUDGET_TIERS = {
  micro: {
    name: "$1,000 Micro Short",
    subtitle: "The Guerrilla Film School — Pure passion, maximum grit",
    splits: [
      { label: "Catering & Crafty", pct: 35, desc: "Feed your volunteer friends gourmet meals and coffee." },
      { label: "Location Fees & Permits", pct: 25, desc: "Befriend local cafes or shoot in homes." },
      { label: "Audio Gear Rental", pct: 20, desc: "Rent a Zoom F6 + Sennheiser MKH 416 boom." },
      { label: "Festival Submissions", pct: 20, desc: "5-8 targeted local film festival entry fees." }
    ],
    gear: {
      camera: "Mirrorless Camera (Sony FX30 / BMPCC 4K / Lumix GH6 / iPhone 15 Pro with Blackmagic App)",
      lenses: "Sigma 18-35mm f/1.8 or vintage Canon FD prime lenses",
      lighting: "2x 60W Bi-color LED lights, 5-in-1 reflector bounce, shower curtain diffusion",
      audio: "Rode Wireless PRO or Zoom H5 recorder with Deity S-Mic 2 shotgun"
    },
    strategy: "Write for ONE location, maximum two actors, daytime dialogue. Zero stunts, zero VFX. Focus 100% on emotional performance and crisp audio."
  },
  indie: {
    name: "$10,000 Festival Contender",
    subtitle: "The Calling Card — Professional aesthetics for festivals",
    splits: [
      { label: "Cast & Key Crew Stipends", pct: 35, desc: "Stipends for 1st AD, DP, Gaffer, and Sound Mixer." },
      { label: "Equipment Rentals (G&E / Camera)", pct: 25, desc: "Small lighting package (Aputure 600d/300c) + cinema primes." },
      { label: "Catering & Production Logistics", pct: 20, desc: "Hot catering, production insurance, transport." },
      { label: "Post Finishing (Color / Sound Mix)", pct: 20, desc: "Professional 5.1 surround sound mix & color grade." }
    ],
    gear: {
      camera: "Sony FX6 or RED Komodo 6K or Canon C70",
      lenses: "DZOFilm Vespid Cinema Primes or Zeiss CP.3",
      lighting: "1x Aputure 600d (Key through 8x8 silk), 2x Nova P300c soft panels, C-stands, flags",
      audio: "Sound Devices MixPre-6 II, Sennheiser 416, 2x Wisycom or Sennheiser G4 lavs"
    },
    strategy: "Hire an experienced 1st AD. Keep shoot to 3 intense days. Spend real money on a professional sound designer and colorist in post."
  },
  ultra: {
    name: "$50,000 SAG Micro-Budget Feature",
    subtitle: "The Breakthrough — Eligible for SAG-AFTRA Micro-Budget Agreement",
    splits: [
      { label: "SAG-AFTRA Actors & Union Crew", pct: 40, desc: "Daily minimum rates, P&H (Pension & Health) contributions." },
      { label: "Locations, Permits & Insurance", pct: 20, desc: "Multi-day location contracts, general liability insurance." },
      { label: "Camera, Grip & Lighting Truck", pct: 15, desc: "2-ton grip & electric truck rental with generator." },
      { label: "Post-Production & Deliverables", pct: 15, desc: "Picture conform, ACES color grading, DCP creation, ADR." },
      { label: "Legal, Clearances & Contingency", pct: 10, desc: "Production attorney, title report, E&O deposit." }
    ],
    gear: {
      camera: "ARRI Alexa Mini or RED V-Raptor (A-Cam) + Sony FX6 (B-Cam)",
      lenses: "Cooke S4/i or Zeiss Supreme Primes or Atlas Anamorphic",
      lighting: "Complete 2-Ton G&E package: ARRI Skypanels, Astera Titan tubes, 12x12 frames, Matthews doorway dolly",
      audio: "Sound Devices 833 with Lectrosonics wireless and DPA 4060 lavaliers"
    },
    strategy: "12-14 shoot days. Confine script to 3 primary locations. Hire recognizable character actors with strong indie festival prestige."
  },
  feature: {
    name: "$250,000 Low-Budget Indie",
    subtitle: "The Commercial Player — Aimed at sales agents and distributors",
    splits: [
      { label: "Above-the-Line (Cast / Director)", pct: 30, desc: "Recognizable marquee lead actors to secure pre-sales." },
      { label: "Below-the-Line Physical Shoot", pct: 40, desc: "Full department crews, 18-22 shoot days, dedicated catering truck." },
      { label: "Post Finishing & Original Score", pct: 15, desc: "Custom live orchestral score, Dolby Atmos mix, VFX cleanups." },
      { label: "Legal, Sales Agent & Deliverables", pct: 15, desc: "Sales agent retainer, market registrations (AFM/Cannes), E&O insurance." }
    ],
    gear: {
      camera: "ARRI Alexa 35 / Sony VENICE 2 dual camera package",
      lenses: "ARRI Master Primes or Angenieux Optimo Zooms",
      lighting: "5-Ton Grip & Electric package, towable blimped 60kW generator, Fisher 10 camera dolly",
      audio: "Sound Devices Scorpio, dual boom operators, full multitrack wireless rig"
    },
    strategy: "Secure a sales agent prior to principal photography. Cast for international territory value. Ensure pristine delivery packages (DCP, Prores 4444 XQ, textless masters)."
  }
};

// ============================================================================
// INITIALIZATION
// ============================================================================
document.addEventListener('DOMContentLoaded', () => {
  setupThemeToggle();
  setupGravityCityStudio();
  setupNavigationAndScroll();
  setupInteractiveClapper();
  setupScrollRevealAnimations();
  setupHUDTimecodeClock();
  setupPhaseTimeline();
  setupDepartmentExplorer();
  setupInteractiveTools();
  setupCineLabLighting();
  setupCineLabOptics();
  setupVideoTheater();
  setupColorGradeSlider();
  setupGlossaryDecoder();
  setupChecklist();
  setupSoundToggle();
  setupCinematicSoundtrackEngine();
});

function setupGravityCityStudio() {
  if (typeof window.initGravityCity === 'function') {
    window.initGravityCity();
  }

  const collapseBtn = document.getElementById('gravity-collapse-btn');
  if (collapseBtn) {
    collapseBtn.addEventListener('click', () => {
      if (window.gravityEngine) {
        window.gravityEngine.toggleGravity();
      }
    });
  }

  const spawnBtn = document.getElementById('spawn-chaos-btn');
  if (spawnBtn) {
    spawnBtn.addEventListener('click', () => {
      if (window.gravityEngine) {
        window.gravityEngine.spawnMoreChaos();
      }
    });
  }

  const gravSlider = document.getElementById('gravity-force-slider');
  const gravLabel = document.getElementById('grav-slider-label');
  if (gravSlider) {
    gravSlider.addEventListener('input', (e) => {
      const val = parseFloat(e.target.value);
      if (gravLabel) {
        gravLabel.textContent = `(${val >= 0 ? '+' : ''}${val.toFixed(1)}G)`;
      }
      if (window.gravityEngine) {
        window.gravityEngine.setGravity(val);
      }
    });
  }

  // Camera angle buttons
  const camBtns = document.querySelectorAll('.cam-angle-btn');
  camBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      camBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const angle = btn.getAttribute('data-angle');
      if (window.gravityEngine) {
        window.gravityEngine.setCameraAngle(angle);
      }
      if (typeof playClickSound === 'function') playClickSound('click');
    });
  });

  // VFX Pass buttons
  const vfxBtns = document.querySelectorAll('.vfx-pass-btn');
  vfxBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      vfxBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const pass = btn.getAttribute('data-pass');
      if (window.gravityEngine) {
        window.gravityEngine.setVFXPass(pass);
      }
      if (typeof playClickSound === 'function') playClickSound('click');
    });
  });

  // Time scale buttons
  const timeBtns = document.querySelectorAll('.time-scale-btn');
  timeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      timeBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scale = parseFloat(btn.getAttribute('data-scale'));
      if (window.gravityEngine) {
        window.gravityEngine.setTimeScale(scale);
      }
      if (typeof playClickSound === 'function') playClickSound('click');
    });
  });
}


// ============================================================================
// NAVIGATION & CHRONOLOGICAL SCROLLING
// ============================================================================
function setupNavigationAndScroll() {
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.chronological-section');
  const brandLogo = document.getElementById('brand-logo-btn');
  const roadmapSteps = document.querySelectorAll('.roadmap-step');

  if (brandLogo) {
    brandLogo.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Smooth scroll for nav items
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      playClickSound('click');
      const targetId = link.getAttribute('data-scroll-to');
      const targetEl = document.getElementById(targetId);
      if (targetEl) {
        targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Roadmap steps jump to phases or sections
  roadmapSteps.forEach(step => {
    step.addEventListener('click', () => {
      playClickSound('clapper');
      const target = step.getAttribute('data-scroll-to');
      if (target.startsWith('phase-')) {
        const phaseNum = parseInt(target.replace('phase-', ''));
        const phaseBtn = document.querySelector(`.step-btn[data-phase="${phaseNum}"]`);
        if (phaseBtn) phaseBtn.click();
        const pipelineSec = document.getElementById('pipeline');
        if (pipelineSec) pipelineSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });

  // Highlight active nav item on scroll using IntersectionObserver
  const scrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.getAttribute('data-scroll-to') === id);
        });
      }
    });
  }, { threshold: 0.25 });

  sections.forEach(sec => scrollObserver.observe(sec));
}

// ============================================================================
// INTERACTIVE CLAPPERBOARD ANIMATION & SOUND
// ============================================================================
function setupInteractiveClapper() {
  const clapperBox = document.getElementById('interactive-clapper');
  const clapperArm = document.getElementById('clapper-arm');
  const takeCounter = document.getElementById('slate-take-count');

  let currentTake = 1;

  if (clapperBox && clapperArm) {
    clapperBox.addEventListener('click', () => {
      playClickSound('clapper');

      // Trigger swing animation
      clapperArm.classList.remove('clapping');
      void clapperArm.offsetWidth; // Force CSS reflow
      clapperArm.classList.add('clapping');

      // Increment take count
      currentTake++;
      if (takeCounter) {
        takeCounter.textContent = currentTake;
      }
    });
  }
}

// ============================================================================
// SCROLL REVEAL ANIMATIONS
// ============================================================================
function setupScrollRevealAnimations() {
  const revealElements = document.querySelectorAll('.reveal-on-scroll');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
      }
    });
  }, { threshold: 0.1 });

  revealElements.forEach(el => revealObserver.observe(el));
}

// ============================================================================
// DYNAMIC REAL-TIME 24.00 FPS RUNNING TIMECODE CLOCK (HUD)
// ============================================================================
function setupHUDTimecodeClock() {
  const tcEl = document.getElementById('hud-timecode');
  if (!tcEl) return;

  const startTime = performance.now();
  // Start base offset at 01:24:18:04
  const baseFrames = (1 * 3600 + 24 * 60 + 18) * 24 + 4;

  function update() {
    const elapsedSec = (performance.now() - startTime) / 1000;
    const currentTotalFrames = Math.floor(baseFrames + elapsedSec * 24);

    const f = currentTotalFrames % 24;
    const totalSec = Math.floor(currentTotalFrames / 24);
    const s = totalSec % 60;
    const m = Math.floor(totalSec / 60) % 60;
    const h = Math.floor(totalSec / 3600) % 24;

    const pad = (n) => String(n).padStart(2, '0');
    tcEl.textContent = `${pad(h)}:${pad(m)}:${pad(s)}:${pad(f)}`;

    requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Sound toggle
function setupSoundToggle() {
  const soundBtn = document.getElementById('ui-sound-toggle');
  if (!soundBtn) return;
  soundBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundBtn.innerHTML = soundEnabled 
      ? '<i class="fa-solid fa-volume-high"></i>' 
      : '<i class="fa-solid fa-volume-xmark" style="color:#ff3b30"></i>';
    if (soundEnabled) playClickSound('click');
  });
}

// ============================================================================
// STEP 1: THE 5 PRODUCTION PHASES WITH RICH INTERACTIVE WORKBENCHES
// ============================================================================
const LOGLINE_PRESETS = [
  {
    protagonist: "A burned-out detective with insomnia",
    incident: "uncovers a time-capsule warning of a global catastrophe",
    goal: "must decipher an encrypted network of rogue informants",
    stakes: "before corrupt federal agents stage a total black-site purge"
  },
  {
    protagonist: "An estranged deep-space salvage mechanic",
    incident: "intercepts an impossible distress ping from a ghost freighter",
    goal: "must board the derelict vessel alone to extract the sole survivor",
    stakes: "before atmospheric re-entry incinerates both ships in orbit"
  },
  {
    protagonist: "An idealistic rookie defense attorney",
    incident: "is assigned to defend a notorious syndicate accountant",
    goal: "must smuggle the key financial ledger across state borders",
    stakes: "before the dawn grand jury hearing or face assassination"
  },
  {
    protagonist: "A grief-stricken stunt driver",
    incident: "is coerced into driving the getaway car for an audacious museum heist",
    goal: "must outmaneuver rival cartels and an elite tactical squad",
    stakes: "before sunrise to secure the release of his captive teenage daughter"
  }
];

const CALLSHEET_DATA = {
  noir: {
    title: "NEON SHADOWS (Feature)",
    date: "OCTOBER 14, 2026",
    callTime: "06:30 AM",
    dayOf: "DAY 3 OF 18",
    weather: "54°F • Cold Mist & Artificial Rain FX",
    hospital: "Mercy General ER — 420 5th Ave (Ph: 555-0192)",
    scenes: [
      { num: "14", set: "EXT. DOWNTOWN ALLEYWAY - NIGHT", cast: "1, 2", pages: "1 4/8", desc: "Elena confronts Marcus in pouring rain. Marcus draws weapon." },
      { num: "15A", set: "INT. GETAWAY SEDAN - CONTINUOUS", cast: "1", pages: "2 1/8", desc: "Marcus scrambles behind wheel, ignition stalls, sirens approach." },
      { num: "16", set: "EXT. ROOFTOP WATER TOWER - DAWN", cast: "2, 4", pages: "0 6/8", desc: "Detective Vance watches pursuit through binoculars." }
    ],
    cast: [
      { id: "1", char: "MARCUS CHEN", actor: "Daniel Wu", pickup: "05:45 AM", hmu: "06:15 AM", onSet: "07:00 AM" },
      { id: "2", char: "ELENA ROSTOVA", actor: "Diane Guerrero", pickup: "06:00 AM", hmu: "06:30 AM", onSet: "07:30 AM" },
      { id: "4", char: "DET. VANCE", actor: "Michael Shannon", pickup: "07:30 AM", hmu: "08:15 AM", onSet: "09:00 AM" }
    ]
  },
  sunset: {
    title: "THE GOLDEN HOUR (Indie Short)",
    date: "OCTOBER 15, 2026",
    callTime: "03:30 PM",
    dayOf: "DAY 1 OF 3",
    weather: "72°F • Clear Sky / Magic Hour Window 18:15 - 18:55",
    hospital: "Cedars Sinai West — 8700 Beverly Blvd",
    scenes: [
      { num: "3", set: "EXT. ROOFTOP TERRACE - MAGIC HOUR", cast: "1, 3", pages: "3 2/8", desc: "Maya and Julian confess unresolved truth against city skyline." },
      { num: "4", set: "INT. ROOFTOP STAIRWELL - DUSK", cast: "1", pages: "0 5/8", desc: "Maya pauses on stairs, wiping away tears as lights flicker." }
    ],
    cast: [
      { id: "1", char: "MAYA LIN", actor: "Stephanie Hsu", pickup: "03:00 PM", hmu: "03:45 PM", onSet: "04:30 PM" },
      { id: "3", char: "JULIAN KANE", actor: "Paul Mescal", pickup: "03:15 PM", hmu: "04:00 PM", onSet: "04:30 PM" }
    ]
  }
};

let recordedTakesLog = [
  { scene: "14A", take: 1, sound: "01", status: "circle", notes: "Good performance, camera move clean" },
  { scene: "14A", take: 2, sound: "02", status: "ng", notes: "Boom mic dipped into top frame line" }
];

function setupPhaseTimeline() {
  const stepButtons = document.querySelectorAll('.step-btn');
  const contentHost = document.getElementById('phase-content-host');

  function renderPhase(phaseNum) {
    const data = PHASES_DATA[phaseNum];
    if (!data || !contentHost) return;

    let workbenchHtml = '';

    if (phaseNum === 1) {
      // PHASE 1: LOGLINE STUDIO & 3-ACT BEAT FLOW
      workbenchHtml = `
        <div class="phase-interactive-workbench" id="phase-workbench-1">
          <div class="workbench-title-bar">
            <div>
              <h3><i class="fa-solid fa-wand-magic-sparkles gold"></i> The Hollywood Logline Studio & Strength Analyzer</h3>
              <p>Construct high-concept loglines using the proven 4-pillar studio formula. Test story viability before writing word one.</p>
            </div>
            <span class="spec-tag"><i class="fa-solid fa-shield-halved"></i> DEVELOPMENT CO-PILOT</span>
          </div>

          <div class="logline-selectors-grid">
            <div class="logline-selector-box">
              <label><i class="fa-solid fa-user"></i> 1. Protagonist Flaw & Identity</label>
              <select id="logline-protagonist">
                <option value="A burned-out detective with insomnia" selected>A burned-out detective with insomnia</option>
                <option value="An idealistic young astronomer">An idealistic young astronomer</option>
                <option value="A retired getaway driver">A retired getaway driver</option>
                <option value="A widowed photojournalist">A widowed photojournalist</option>
                <option value="An estranged deep-space mechanic">An estranged deep-space mechanic</option>
              </select>
            </div>

            <div class="logline-selector-box">
              <label><i class="fa-solid fa-bolt"></i> 2. Inciting Incident</label>
              <select id="logline-incident">
                <option value="uncovers a time-capsule warning of a global catastrophe" selected>uncovers a time-capsule warning of a global catastrophe</option>
                <option value="is framed for a high-profile heist by a syndicate">is framed for a high-profile heist by a syndicate</option>
                <option value="intercepts an impossible distress ping from a ghost ship">intercepts an impossible distress ping from a ghost ship</option>
                <option value="witnesses an assassination through a telephoto lens">witnesses an assassination through a telephoto lens</option>
                <option value="discovers a stolen cryogenic vault containing a clone">discovers a stolen cryogenic vault containing a clone</option>
              </select>
            </div>

            <div class="logline-selector-box">
              <label><i class="fa-solid fa-bullseye"></i> 3. Goal & Urgent Action</label>
              <select id="logline-goal">
                <option value="must decipher an encrypted network of rogue informants" selected>must decipher an encrypted network of rogue informants</option>
                <option value="must smuggle the key witness across militarized borders">must smuggle the key witness across militarized borders</option>
                <option value="must infiltrate a fortified high-rise compound alone">must infiltrate a fortified high-rise compound alone</option>
                <option value="must race across the country to protect an estranged daughter">must race across the country to protect an estranged daughter</option>
                <option value="must pilot a damaged prototype shuttle back to orbit">must pilot a damaged prototype shuttle back to orbit</option>
              </select>
            </div>

            <div class="logline-selector-box">
              <label><i class="fa-solid fa-skull"></i> 4. High Stakes & Time Bomb</label>
              <select id="logline-stakes">
                <option value="before corrupt federal agents stage a total black-site purge." selected>before corrupt federal agents stage a black-site purge.</option>
                <option value="before the city's power grid is permanently extinguished.">before the city's power grid is permanently extinguished.</option>
                <option value="before atmospheric re-entry incinerates both crafts.">before atmospheric re-entry incinerates both crafts.</option>
                <option value="before the dawn execution deadline strikes.">before the dawn execution deadline strikes.</option>
              </select>
            </div>
          </div>

          <div class="logline-preview-card">
            <div class="logline-quote-text" id="live-logline-preview">
              "When a burned-out detective with insomnia uncovers a time-capsule warning of a global catastrophe, they must decipher an encrypted network of rogue informants before corrupt federal agents stage a black-site purge."
            </div>
            <div class="logline-strength-meter">
              <span>Logline Viability Score:</span>
              <div class="strength-track"><div class="strength-fill" id="logline-score-fill" style="width: 94%;"></div></div>
              <strong class="gold" id="logline-score-label">94% — High Market Viability</strong>
            </div>
          </div>

          <div class="logline-actions-row">
            <button id="random-logline-btn" class="cta-btn secondary-btn"><i class="fa-solid fa-shuffle"></i> Randomize Hollywood Presets</button>
            <button id="copy-logline-btn" class="cta-btn primary-btn"><i class="fa-solid fa-copy"></i> Copy Logline to Clipboard</button>
            <button id="jump-to-beats-btn" class="mini-btn"><i class="fa-solid fa-arrow-down"></i> Send Length to Beat Sheet Tool</button>
          </div>
        </div>
      `;

    } else if (phaseNum === 2) {
      // PHASE 2: LIVE HOLLYWOOD CALL SHEET STUDIO
      workbenchHtml = `
        <div class="phase-interactive-workbench" id="phase-workbench-2">
          <div class="workbench-title-bar">
            <div>
              <h3><i class="fa-solid fa-clipboard-check gold"></i> Live Hollywood Call Sheet Studio</h3>
              <p>Generate, edit, and export industry-standard Call Sheets. The single most critical operational document on any movie set.</p>
            </div>
            <div class="cs-preset-strip">
              <button class="mini-btn active cs-preset-btn" data-cs="noir"><i class="fa-solid fa-cloud-rain"></i> Noir Rain Alley (Night)</button>
              <button class="mini-btn cs-preset-btn" data-cs="sunset"><i class="fa-solid fa-sun"></i> Golden Hour Rooftop</button>
            </div>
          </div>

          <div class="callsheet-preview-frame" id="printable-callsheet">
            <div class="cs-header-strip">
              <div class="cs-title-box">
                <h2 id="cs-prod-title">NEON SHADOWS (Feature)</h2>
                <p id="cs-day-info">DAY 3 OF 18 • CREW CALL SHEET</p>
                <p><strong>SHOOTING DATE:</strong> <span id="cs-date-val">OCTOBER 14, 2026</span></p>
              </div>
              <div class="cs-meta-box">
                <div>GENERAL CREW CALL</div>
                <div class="cs-call-highlight" id="cs-crew-call">06:30 AM</div>
                <div style="margin-top:0.3rem; font-size:0.75rem; color:#4b5563;">WEATHER: <span id="cs-weather-val">54°F • Cold Mist & Rain FX</span></div>
              </div>
            </div>

            <div class="cs-hospital-alert">
              <i class="fa-solid fa-truck-medical"></i> <strong>NEAREST EMERGENCY HOSPITAL:</strong> <span id="cs-hospital-val">Mercy General ER — 420 5th Ave (Ph: 555-0192)</span>
            </div>

            <h4 style="font-size:0.9rem; font-weight:800; margin-bottom:0.4rem; letter-spacing:0.5px;">1. SHOOTING SCHEDULE (CHRONOLOGICAL)</h4>
            <table class="cs-table">
              <thead>
                <tr>
                  <th style="width:70px;">SCENE</th>
                  <th>SET & SCENE DESCRIPTION</th>
                  <th style="width:80px;">CAST IDs</th>
                  <th style="width:70px;">PAGES</th>
                </tr>
              </thead>
              <tbody id="cs-scenes-tbody">
                <!-- Injected via JS -->
              </tbody>
            </table>

            <h4 style="font-size:0.9rem; font-weight:800; margin:1rem 0 0.4rem 0; letter-spacing:0.5px;">2. CAST CALL TIMES & REPORTING</h4>
            <table class="cs-table">
              <thead>
                <tr>
                  <th style="width:40px;">#</th>
                  <th>CHARACTER</th>
                  <th>ACTOR</th>
                  <th style="width:90px;">PICK-UP</th>
                  <th style="width:90px;">H/MU</th>
                  <th style="width:90px;">ON SET</th>
                </tr>
              </thead>
              <tbody id="cs-cast-tbody">
                <!-- Injected via JS -->
              </tbody>
            </table>
          </div>

          <div class="logline-actions-row" style="margin-top:1.2rem;">
            <button id="print-callsheet-btn" class="cta-btn primary-btn"><i class="fa-solid fa-print"></i> Print / Export Call Sheet PDF</button>
            <button id="add-scene-callsheet-btn" class="cta-btn secondary-btn"><i class="fa-solid fa-plus"></i> Add Scene Row</button>
            <button id="copy-callsheet-btn" class="mini-btn"><i class="fa-solid fa-copy"></i> Copy Text Summary</button>
          </div>
        </div>
      `;

    } else if (phaseNum === 3) {
      // PHASE 3: LIVE ON-SET SLATE & CALLOUT SIMULATOR
      workbenchHtml = `
        <div class="phase-interactive-workbench" id="phase-workbench-3">
          <div class="workbench-title-bar">
            <div>
              <h3><i class="fa-solid fa-bullhorn gold"></i> On-Set Roll Sequence & Slate Simulator</h3>
              <p>Experience the exact 5-step verbal command sequence used on every professional film set to roll camera and slate takes.</p>
            </div>
            <span class="spec-tag"><i class="fa-solid fa-circle-play"></i> LIVE COMMAND CHAIN</span>
          </div>

          <div class="slate-sim-grid">
            <div class="slate-sequence-steps">
              <div class="seq-step-btn" id="seq-step-1" data-step="1">
                <span class="seq-num">1</span>
                <div class="seq-callout-text">
                  <strong>1st AD: "Quiet on set! Roll Sound!"</strong>
                  <small>Silences crew, signals sound mixer to start recording</small>
                </div>
              </div>

              <div class="seq-step-btn" id="seq-step-2" data-step="2">
                <span class="seq-num">2</span>
                <div class="seq-callout-text">
                  <strong>Sound Mixer: "Sound Speed!"</strong>
                  <small>Confirms audio tracks are locked and timecode is transmitting</small>
                </div>
              </div>

              <div class="seq-step-btn" id="seq-step-3" data-step="3">
                <span class="seq-num">3</span>
                <div class="seq-callout-text">
                  <strong>1st AD: "Roll Camera!"</strong>
                  <small>Camera operator rolls sensor; DP confirms speed</small>
                </div>
              </div>

              <div class="seq-step-btn" id="seq-step-4" data-step="4">
                <span class="seq-num">4</span>
                <div class="seq-callout-text">
                  <strong>2nd AC: "Scene 14 Baker, Take 3!" [CLAP!]</strong>
                  <small>Claps wooden slate sticks to provide visual/audio sync marker</small>
                </div>
              </div>

              <div class="seq-step-btn" id="seq-step-5" data-step="5">
                <span class="seq-num">5</span>
                <div class="seq-callout-text">
                  <strong>Director: "And... ACTION!"</strong>
                  <small>Actors commence performance; crew remains dead silent</small>
                </div>
              </div>

              <div class="logline-actions-row" style="margin-top:0.5rem;">
                <button id="run-full-sequence-btn" class="cta-btn primary-btn"><i class="fa-solid fa-play"></i> Run Auto Roll Sequence</button>
                <button id="room-tone-timer-btn" class="cta-btn secondary-btn"><i class="fa-solid fa-stopwatch"></i> Capture 60s Room Tone</button>
              </div>
            </div>

            <!-- Takes Log Box -->
            <div class="takes-log-box">
              <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid var(--border-subtle); padding-bottom:0.5rem;">
                <h4 style="font-size:0.95rem; font-family:var(--font-title);"><i class="fa-solid fa-list-check gold"></i> Script Supervisor's Log</h4>
                <span class="badge" id="take-status-badge">Standby</span>
              </div>
              <ul class="takes-log-list" id="active-takes-log-list">
                <!-- Injected via JS -->
              </ul>
              <div style="margin-top:1rem; display:flex; gap:0.5rem;">
                <button id="log-take-circle-btn" class="mini-btn"><i class="fa-solid fa-star gold"></i> Circle Take (Good)</button>
                <button id="log-take-ng-btn" class="mini-btn danger"><i class="fa-solid fa-xmark"></i> Mark NG (No Good)</button>
              </div>
            </div>
          </div>
        </div>
      `;

    } else if (phaseNum === 4) {
      // PHASE 4: MULTITRACK NLE TIMELINE SIMULATOR
      workbenchHtml = `
        <div class="phase-interactive-workbench" id="phase-workbench-4">
          <div class="workbench-title-bar">
            <div>
              <h3><i class="fa-solid fa-film gold"></i> Multitrack NLE Timeline Simulator</h3>
              <p>Explore how Picture Lock, ADR dialogue, Foley, and orchestral scores are arranged on an editing timeline.</p>
            </div>
            <button id="nle-play-btn" class="cta-btn primary-btn"><i class="fa-solid fa-play"></i> Play Timeline Stems</button>
          </div>

          <div class="nle-timeline-box">
            <div class="nle-controls-bar">
              <div style="font-family:var(--font-mono); font-size:0.85rem; color:var(--accent-gold);">
                <i class="fa-solid fa-clock"></i> TIMELINE PLAYHEAD: <span id="nle-tc-display">00:01:24:18</span>
              </div>
              <div style="font-size:0.75rem; color:var(--text-muted);">PICTURE LOCK DECLARED: 24.00 FPS DCI 4K</div>
            </div>

            <div class="nle-tracks-container">
              <!-- Video Track 1 -->
              <div class="nle-track-row">
                <div class="track-header-meta">
                  <span class="track-title" style="color:#60a5fa;"><i class="fa-solid fa-video"></i> V1 Master</span>
                  <div class="track-buttons">
                    <button class="track-btn track-m-btn" data-track="v1">M</button>
                    <button class="track-btn track-s-btn" data-track="v1">S</button>
                  </div>
                </div>
                <div class="track-lane">
                  <div class="clip-block video" style="width: 45%;">SC14_A-CAM_Wide_T2</div>
                  <div class="clip-block video" style="width: 50%;">SC14_A-CAM_Close_T3</div>
                </div>
              </div>

              <!-- Video Track 2 -->
              <div class="nle-track-row">
                <div class="track-header-meta">
                  <span class="track-title" style="color:#93c5fd;"><i class="fa-solid fa-layer-group"></i> V2 Cutaway</span>
                  <div class="track-buttons">
                    <button class="track-btn track-m-btn" data-track="v2">M</button>
                    <button class="track-btn track-s-btn" data-track="v2">S</button>
                  </div>
                </div>
                <div class="track-lane">
                  <div class="clip-block video" style="margin-left: 20%; width: 28%; background:#1d4ed8;">INSERT_Watch_T1</div>
                </div>
              </div>

              <!-- Audio Track 1: Dialogue -->
              <div class="nle-track-row">
                <div class="track-header-meta">
                  <span class="track-title" style="color:#34d399;"><i class="fa-solid fa-microphone"></i> A1 Dialogue</span>
                  <div class="track-buttons">
                    <button class="track-btn track-m-btn" data-track="a1">M</button>
                    <button class="track-btn track-s-btn" data-track="a1">S</button>
                  </div>
                </div>
                <div class="track-lane">
                  <div class="clip-block dialogue" style="width: 40%;">BOOM_Senn416_Dialogue</div>
                  <div class="clip-block dialogue" style="width: 45%;">LAV_Marcus_Mic</div>
                </div>
              </div>

              <!-- Audio Track 2: Foley -->
              <div class="nle-track-row">
                <div class="track-header-meta">
                  <span class="track-title" style="color:#fbbf24;"><i class="fa-solid fa-shoe-prints"></i> A2 Foley FX</span>
                  <div class="track-buttons">
                    <button class="track-btn track-m-btn" data-track="a2">M</button>
                    <button class="track-btn track-s-btn" data-track="a2">S</button>
                  </div>
                </div>
                <div class="track-lane">
                  <div class="clip-block foley" style="width: 30%;">Footsteps_WetPavement</div>
                  <div class="clip-block foley" style="width: 25%;">Jacket_LeatherRustle</div>
                  <div class="clip-block foley" style="width: 35%;">Gun_HolsterClick</div>
                </div>
              </div>

              <!-- Audio Track 3: Score -->
              <div class="nle-track-row">
                <div class="track-header-meta">
                  <span class="track-title" style="color:#c084fc;"><i class="fa-solid fa-music"></i> A3 Music Score</span>
                  <div class="track-buttons">
                    <button class="track-btn track-m-btn" data-track="a3">M</button>
                    <button class="track-btn track-s-btn" data-track="a3">S</button>
                  </div>
                </div>
                <div class="track-lane">
                  <div class="clip-block score" style="width: 95%;">Cello_Tension_Swell_MainTheme_Stereo</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;

    } else if (phaseNum === 5) {
      // PHASE 5: FILM FESTIVAL LAUREL GENERATOR & ROI MATRIX
      workbenchHtml = `
        <div class="phase-interactive-workbench" id="phase-workbench-5">
          <div class="workbench-title-bar">
            <div>
              <h3><i class="fa-solid fa-award gold"></i> Film Festival Laurel Generator & Distribution Roadmap</h3>
              <p>Preview official festival laurels for your project and calculate distribution revenue streams from theatrical to streaming.</p>
            </div>
            <span class="spec-tag"><i class="fa-solid fa-trophy"></i> DISTRIBUTION STRATEGY</span>
          </div>

          <div class="festival-matrix-grid">
            <!-- Laurel Stage -->
            <div class="laurel-preview-stage">
              <div class="laurel-emblem-wrap">
                <i class="fa-solid fa-feather-pointed laurel-branch" style="transform: scaleX(-1);"></i>
                <div class="laurel-text">
                  <span class="laurel-award" id="laurel-award-text">OFFICIAL SELECTION</span>
                  <span class="laurel-fest" id="laurel-fest-text">SUNDANCE FILM FESTIVAL</span>
                  <span class="laurel-year" id="laurel-year-text">2027</span>
                </div>
                <i class="fa-solid fa-feather-pointed laurel-branch"></i>
              </div>
              <h4 style="font-family:var(--font-cinematic); color:var(--accent-gold); margin-top:0.5rem;" id="laurel-film-title">CRAFT // CINEMA</h4>
              <p style="font-size:0.75rem; color:var(--text-muted); margin-top:0.3rem;">Cinematic festival laurel preview for poster & trailer marketing</p>
            </div>

            <!-- Controls -->
            <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.2rem;">
              <h4 style="font-size:0.95rem; margin-bottom:0.8rem;"><i class="fa-solid fa-sliders gold"></i> Laurel Customizer</h4>
              
              <div class="form-group" style="margin-bottom:0.8rem;">
                <label style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom:0.3rem;">Film Title:</label>
                <input type="text" id="laurel-input-title" value="CRAFT // CINEMA" style="width:100%; background:rgba(0,0,0,0.5); border:1px solid var(--border-subtle); color:#fff; padding:0.4rem; border-radius:4px;">
              </div>

              <div class="form-group" style="margin-bottom:0.8rem;">
                <label style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom:0.3rem;">Festival Name:</label>
                <select id="laurel-input-fest" style="width:100%; background:rgba(0,0,0,0.5); border:1px solid var(--border-subtle); color:#fff; padding:0.4rem; border-radius:4px;">
                  <option value="SUNDANCE FILM FESTIVAL" selected>Sundance Film Festival (A-List Major)</option>
                  <option value="CANNES FILM FESTIVAL - QUINZAINE">Cannes Film Festival (Directors' Fortnight)</option>
                  <option value="TORONTO INTERNATIONAL FILM FESTIVAL">Toronto International Film Festival (TIFF)</option>
                  <option value="SXSW FILM & TV FESTIVAL">SXSW Film & TV Festival</option>
                  <option value="TRIBECA FILM FESTIVAL">Tribeca Film Festival (New York)</option>
                  <option value="FANTASTIC FEST AUSTIN">Fantastic Fest (Genre Premiere)</option>
                </select>
              </div>

              <div class="form-group" style="margin-bottom:1rem;">
                <label style="font-size:0.75rem; color:var(--text-secondary); display:block; margin-bottom:0.3rem;">Award / Status:</label>
                <select id="laurel-input-status" style="width:100%; background:rgba(0,0,0,0.5); border:1px solid var(--border-subtle); color:#fff; padding:0.4rem; border-radius:4px;">
                  <option value="OFFICIAL SELECTION" selected>OFFICIAL SELECTION</option>
                  <option value="WINNER - GRAND JURY PRIZE">WINNER - GRAND JURY PRIZE</option>
                  <option value="WINNER - AUDIENCE AWARD">WINNER - AUDIENCE AWARD</option>
                  <option value="WINNER - BEST CINEMATOGRAPHY">WINNER - BEST CINEMATOGRAPHY</option>
                </select>
              </div>

              <button id="copy-laurel-btn" class="cta-btn primary-btn" style="width:100%;"><i class="fa-solid fa-copy"></i> Copy Marketing Tagline</button>
            </div>
          </div>
        </div>
      `;
    }

    contentHost.innerHTML = `
      <!-- Featured High-Res Phase Banner -->
      <div class="phase-hero-banner">
        <img src="${data.bannerImage}" alt="${data.title}">
        <div class="phase-hero-banner-content">
          <div>
            <span class="badge" style="background:rgba(0,0,0,0.7); backdrop-filter:blur(6px); margin-bottom:0.4rem; display:inline-block;">PHASE ${data.id} OF 05</span>
            <h3 style="font-family:var(--font-cinematic); font-size:1.6rem; color:#fff;">${data.title}</h3>
          </div>
          <span class="spec-tag" style="background:rgba(0,0,0,0.7);"><i class="fa-regular fa-clock"></i> Typical: ${data.duration}</span>
        </div>
      </div>

      <div class="phase-header-bar">
        <div class="phase-headline">
          <p class="panel-subtitle" style="font-size:1.05rem; margin-bottom:0.75rem; color:var(--accent-gold); font-weight:600;">${data.subtitle}</p>
          <div class="phase-meta-tags">
            <span class="phase-time-pill"><i class="fa-solid fa-file-invoice"></i> Standard: ${data.standard}</span>
          </div>
        </div>
        <div class="phase-quote">
          "${data.quote}"
        </div>
      </div>

      <!-- 4 Pillars of Knowledge -->
      <div class="phase-pillars-grid">
        ${data.pillars.map(pillar => `
          <div class="pillar-box">
            <div class="pillar-icon-title">
              <i class="fa-solid ${pillar.icon}"></i>
              <h4>${pillar.title}</h4>
            </div>
            <ul class="pillar-list">
              ${pillar.points.map(pt => `<li>${pt}</li>`).join('')}
            </ul>
          </div>
        `).join('')}
      </div>

      <!-- Phase-Specific Interactive Workbench Tool -->
      ${workbenchHtml}

      <!-- Blockbuster Scene Case Study: The Gravity Collapse -->
      ${getSceneBreakdownHtml(phaseNum)}

      <div class="phase-callouts-strip" style="margin-top:2rem;">
        <div class="callout-box tip">
          <h5><i class="fa-solid fa-lightbulb"></i> Veteran Filmmaker Pro Tip</h5>
          <p>${data.proTip}</p>
        </div>
        <div class="callout-box trap">
          <h5><i class="fa-solid fa-triangle-exclamation"></i> Common Rookie Trap</h5>
          <p>${data.rookieTrap}</p>
        </div>
      </div>
    `;

    // Bind event listeners for the interactive workbench
    if (phaseNum === 1) bindLoglineStudioEvents();

    else if (phaseNum === 2) bindCallSheetStudioEvents();
    else if (phaseNum === 3) bindOnSetSlateStudioEvents();
    else if (phaseNum === 4) bindNLETimelineStudioEvents();
    else if (phaseNum === 5) bindFestivalStudioEvents();
  }

  stepButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound('clapper');
      stepButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderPhase(parseInt(btn.getAttribute('data-phase')));
    });
  });

  renderPhase(1);
}

// ============================================================================
// BLOCKBUSTER CASE STUDY GENERATOR: SCENE 04 "THE GRAVITY COLLAPSE"
// Connects the Anti-Gravity City simulation directly to all 5 production phases
// ============================================================================
function getSceneBreakdownHtml(phaseNum) {
  if (phaseNum === 1) {
    return `
      <div class="scene-case-study-card glass-panel" style="margin-top:1.8rem; border-left:4px solid var(--accent-gold);">
        <div class="case-study-badge">
          <span class="rec-dot-live"></span>
          <strong>SCENE 04 CASE STUDY // DEVELOPMENT & SCREENWRITING</strong>
        </div>
        <h4 style="margin: 0.6rem 0 0.4rem 0; font-size:1.15rem; color:var(--text-primary);">
          Writing the Impossible: The Screenplay Format for Zero-G Collapse
        </h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">
          How does a screenwriter convey the psychological terror of gravity inverting without getting bogged down in technical camera directions? Notice the punchy, short action blocks:
        </p>

        <!-- Screenplay Courier Display -->
        <div class="screenplay-script-frame">
          <div class="sp-slugline">EXT. 5TH AVENUE & BROADWAY - NOON</div>
          <div class="sp-action">
            A scorching Tuesday rush hour. Yellow cabs crawl bumper-to-bumper.
            Horns blare. Hundreds of pedestrians stream across the zebra crosswalk.
          </div>
          <div class="sp-action">
            Then — a subsonic RUMBLE vibrates through the soles of their shoes.
          </div>
          <div class="sp-action">
            A discarded hot dog wrapper leaves the pavement, drifting upward like smoke.
          </div>
          <div class="sp-action">
            SARAH (30s) freezes. Her iced coffee tumbler SLIPS from her fingers.
          </div>
          <div class="sp-action">
            It doesn't smash. It FLOATS at chest height, spinning slowly.
          </div>
          <div class="sp-action">
            CREAK. METAL GROANS.
          </div>
          <div class="sp-action">
            A vintage yellow taxi's front suspension unloads. The front tires lift off the asphalt.
            Three inches. Six inches. Then the rear wheels follow.
          </div>
          <div class="sp-dialogue-block">
            <div class="sp-character">CAB DRIVER</div>
            <div class="sp-dialogue">What the hell?! My brakes are locked! Hey!</div>
          </div>
          <div class="sp-action">
            PANDEMONIUM. Pedestrians scramble for cover under awnings as bicycles, trash cans, 
            and a green "5TH AVE" street sign slowly tumble up into the afternoon sky.
          </div>
        </div>

        <div class="case-study-metrics-row">
          <div class="metric-pill">
            <span class="label">SCENE LENGTH:</span>
            <strong class="val gold">1 3/8 Pages (~80 Sec Screen Time)</strong>
          </div>
          <div class="metric-pill">
            <span class="label">TONAL COMPS:</span>
            <strong class="val sienna">Inception • Children of Men • The Leftovers</strong>
          </div>
          <div class="metric-pill">
            <span class="label">CORE CONFLICT:</span>
            <strong class="val gold">Man vs Fundamental Laws of Physics</strong>
          </div>
        </div>
      </div>
    `;
  } else if (phaseNum === 2) {
    return `
      <div class="scene-case-study-card glass-panel" style="margin-top:1.8rem; border-left:4px solid var(--accent-sienna);">
        <div class="case-study-badge">
          <span class="rec-dot-live"></span>
          <strong>SCENE 04 CASE STUDY // PRE-PRODUCTION & STUNT RIGGING</strong>
        </div>
        <h4 style="margin: 0.6rem 0 0.4rem 0; font-size:1.15rem; color:var(--text-primary);">
          Engineering the Lift: Practical FX Blueprints for 1,400kg Vehicles
        </h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">
          Hollywood doesn't rely purely on CGI. To achieve tactile realism, the production uses two 50-ton Liebherr mobile cranes hidden behind buildings with high-tensile steel aircraft cables:
        </p>

        <div class="stunt-rigging-grid">
          <div class="rig-card">
            <div class="rig-icon"><i class="fa-solid fa-truck-pickup gold"></i></div>
            <h5>Gutted Stunt Chassis</h5>
            <p>Engine, transmission, and fuel tank removed to reduce vehicle weight from 1,800kg to 650kg, making crane lifting safe over pedestrian stunt performers.</p>
          </div>
          <div class="rig-card">
            <div class="rig-icon"><i class="fa-solid fa-link sienna"></i></div>
            <h5>Aircraft Cable Harnesses</h5>
            <p>Dual 3/8" non-reflective braided steel cables mounted through reinforced frame weld-plates. Cables painted chromakey green for automated digital erasure.</p>
          </div>
          <div class="rig-card">
            <div class="rig-icon"><i class="fa-solid fa-person-running gold"></i></div>
            <h5>Stunt Performer Wire Rigs</h5>
            <p>Four stunt extras in full-body jerk vests suspended on counterweighted traveler lines to simulate floating upwards while frantically reaching for lampposts.</p>
          </div>
          <div class="rig-card">
            <div class="rig-icon"><i class="fa-solid fa-road-barrier sienna"></i></div>
            <h5>City Street Closure Permit</h5>
            <p>Full 3-day lockdown of a 4-block downtown metropolitan corridor with police perimeter, fire marshal permits, and pedestrian detour routing.</p>
          </div>
        </div>
      </div>
    `;
  } else if (phaseNum === 3) {
    return `
      <div class="scene-case-study-card glass-panel" style="margin-top:1.8rem; border-left:4px solid var(--accent-gold);">
        <div class="case-study-badge">
          <span class="rec-dot-live"></span>
          <strong>SCENE 04 CASE STUDY // PRINCIPAL PHOTOGRAPHY (LIVE SHOOT)</strong>
        </div>
        <h4 style="margin: 0.6rem 0 0.4rem 0; font-size:1.15rem; color:var(--text-primary);">
          Camera Tracking & Optical Execution: The 50ft Technocrane Pass
        </h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">
          How the DP captures the shot: An ARRI Alexa 65 Large Format camera mounted on a Scorpio 50ft telescoping crane sweeping dynamically between the rising yellow cabs:
        </p>

        <div class="camera-tech-specs-box">
          <div class="spec-row">
            <span class="spec-name"><i class="fa-solid fa-camera gold"></i> CAMERA SENSOR:</span>
            <span class="spec-detail">ARRI Alexa 65 (65mm Open Gate Sensor • 6560 x 3102 • 14+ Stops Dynamic Range)</span>
          </div>
          <div class="spec-row">
            <span class="spec-name"><i class="fa-solid fa-circle-dot sienna"></i> LENS PACKAGE:</span>
            <span class="spec-detail">ARRI Prime 65mm T1.9 Anamorphic — producing warm horizontal flare streaks from street lamps</span>
          </div>
          <div class="spec-row">
            <span class="spec-name"><i class="fa-solid fa-gauge-high gold"></i> SHUTTER ANGLE:</span>
            <span class="spec-detail">45° Shutter (1/192s exposure) — razor-sharp debris edges with zero motion blur smear, echoing Saving Private Ryan</span>
          </div>
          <div class="spec-row">
            <span class="spec-name"><i class="fa-solid fa-arrows-up-down-left-right sienna"></i> CAMERA RIG:</span>
            <span class="spec-detail">Scorpio Stabilized 3-Axis Remote Head on 50ft Technocrane on motorized track</span>
          </div>
        </div>

        <!-- Comparative Masterclass Callout: Salaar & Prabhas Staging -->
        <div class="stunt-rigging-grid" style="margin-top:1.2rem;">
          <div class="rig-card" style="border-left: 3px solid var(--accent-gold); grid-column: 1 / -1; background: rgba(18, 14, 10, 0.9);">
            <div class="rig-icon"><i class="fa-solid fa-star gold"></i></div>
            <h5 style="color:var(--accent-gold); font-size:1rem; margin-bottom:0.4rem;">
              Action Staging Benchmark: Prabhas in "Salaar: Part 1 – Ceasefire" (Dir. Prashanth Neel, DP Bhuvan Gowda)
            </h5>
            <p style="font-size:0.84rem; color:var(--text-secondary); margin-bottom:0.6rem; line-height:1.55;">
              Notice how director Prashanth Neel commands massive cinematic scale when staging actor Prabhas (Deva) in the brutalist coal-mine and border-outpost set pieces:
            </p>
            <div style="display:grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap:0.8rem; margin-top:0.6rem;">
              <div style="background:rgba(0,0,0,0.3); padding:0.6rem 0.8rem; border-radius:4px; border-left:2px solid var(--accent-sienna);">
                <strong style="color:var(--text-primary); font-size:0.8rem; display:block;">1. Low-Angle 24mm Anamorphic</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); line-height:1.4; display:block;">The camera is locked at waist/knee level, forcing the audience to look upward, magnifying Prabhas's towering 6'2" physical frame against the sky.</span>
              </div>
              <div style="background:rgba(0,0,0,0.3); padding:0.6rem 0.8rem; border-radius:4px; border-left:2px solid var(--accent-gold);">
                <strong style="color:var(--text-primary); font-size:0.8rem; display:block;">2. 1000 FPS Phantom Flex Speed-Ramp</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); line-height:1.4; display:block;">Ramping from 24 FPS into 1000 FPS slow-motion precisely on heavy weapon impacts lets soot, sparks, and severed chains hover weightlessly mid-air.</span>
              </div>
              <div style="background:rgba(0,0,0,0.3); padding:0.6rem 0.8rem; border-radius:4px; border-left:2px solid var(--accent-sienna);">
                <strong style="color:var(--text-primary); font-size:0.8rem; display:block;">3. Searing Backlit Chiaroscuro</strong>
                <span style="font-size:0.75rem; color:var(--text-muted); line-height:1.4; display:block;">Heavy 18K HMI rim-lights carve the actor's silhouette out of thick atmospheric smoke and coal dust, keeping the face in dramatic half-shadow.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  } else if (phaseNum === 4) {
    return `
      <div class="scene-case-study-card glass-panel" style="margin-top:1.8rem; border-left:4px solid var(--accent-sienna);">
        <div class="case-study-badge">
          <span class="rec-dot-live"></span>
          <strong>SCENE 04 CASE STUDY // POST-PRODUCTION & VFX PIPELINE</strong>
        </div>
        <h4 style="margin: 0.6rem 0 0.4rem 0; font-size:1.15rem; color:var(--text-primary);">
          The 5-Layer Compositing Breakdown: From Clean Plate to Master Grade
        </h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">
          Every VFX shot is built from discrete visual layers in Nuke / DaVinci Fusion. Test switching the VFX Pass buttons in the simulator above to see these layers in real-time:
        </p>

        <div class="vfx-layers-stepper">
          <div class="vfx-layer-step">
            <span class="step-badge">LAYER 01</span>
            <strong>Live Background Plate</strong>
            <p>Locked-off 65mm clean footage of the city street shot with zero traffic and street signs for background reference.</p>
          </div>
          <div class="vfx-layer-step">
            <span class="step-badge">LAYER 02</span>
            <strong>Wire & Rig Paint-Out</strong>
            <p>Digital rotoscoping and inpainting clean plates to erase the steel crane cables and harness wires from stunt vehicles.</p>
          </div>
          <div class="vfx-layer-step">
            <span class="step-badge">LAYER 03</span>
            <strong>CGI Floating Fleet & Debris</strong>
            <p>Houdini rigid-body physics simulation generating 24 background vehicles, bicycles, tumbling newspapers, and fluttering trash.</p>
          </div>
          <div class="vfx-layer-step">
            <span class="step-badge">LAYER 04</span>
            <strong>Volumetric Fog & Dust Motes</strong>
            <p>Atmospheric dust simulation with ray-traced shadows cast by floating cabs blocking the warm afternoon sun.</p>
          </div>
          <div class="vfx-layer-step">
            <span class="step-badge">LAYER 05</span>
            <strong>35mm Film Grain & Master Grade</strong>
            <p>ACEScc color grade applying 3200K warm tungsten amber highlight roll-off and authentic Kodak 5219 film grain profile.</p>
          </div>
        </div>
      </div>
    `;
  } else if (phaseNum === 5) {
    return `
      <div class="scene-case-study-card glass-panel" style="margin-top:1.8rem; border-left:4px solid var(--accent-gold);">
        <div class="case-study-badge">
          <span class="rec-dot-live"></span>
          <strong>SCENE 04 CASE STUDY // THEATRICAL EXHIBITION & DOLBY ATMOS</strong>
        </div>
        <h4 style="margin: 0.6rem 0 0.4rem 0; font-size:1.15rem; color:var(--text-primary);">
          Spatial Immersion: Designing the 3D Soundscape of Anti-Gravity
        </h4>
        <p style="font-size:0.85rem; color:var(--text-secondary); margin-bottom:1rem;">
          In theatrical Dolby Atmos, sound doesn't just come from left or right — it travels overhead. As vehicles lift from the ground, the sound mixer pans car alarms and groaning metal directly into ceiling speakers:
        </p>

        <div class="atmos-soundfield-grid">
          <div class="sound-node-card">
            <h5><i class="fa-solid fa-volume-high gold"></i> 20Hz - 60Hz Sub LFE</h5>
            <p>Subsonic gravitational groaning synthesized from slowed-down tectonic earthquake recordings, physically shaking theater seats.</p>
          </div>
          <div class="sound-node-card">
            <h5><i class="fa-solid fa-bell sienna"></i> Overhead Doppler Alarms</h5>
            <p>Vehicle security horns pan seamlessly from screen channels into the theater ceiling array as cars drift 30 feet above the pavement.</p>
          </div>
          <div class="sound-node-card">
            <h5><i class="fa-solid fa-users gold"></i> Scrambling Crowd Foley</h5>
            <p>36 individual stereo recordings of hurried footsteps, screams, dropped briefcases, and slamming shop doors sheltering from chaos.</p>
          </div>
          <div class="sound-node-card">
            <h5><i class="fa-solid fa-compact-disc sienna"></i> DCI 4K Scope DCP Master</h5>
            <p>Final SMPTE compliant Digital Cinema Package encoded at 250 Mbps with 5.1, 7.1, and Dolby Atmos audio bitstreams for worldwide theatrical delivery.</p>
          </div>
        </div>
      </div>
    `;
  }
  return '';
}


// Phase 1 Studio Handlers
function bindLoglineStudioEvents() {
  const pSelect = document.getElementById('logline-protagonist');
  const iSelect = document.getElementById('logline-incident');
  const gSelect = document.getElementById('logline-goal');
  const sSelect = document.getElementById('logline-stakes');
  const preview = document.getElementById('live-logline-preview');
  const scoreFill = document.getElementById('logline-score-fill');
  const scoreLabel = document.getElementById('logline-score-label');
  const randomBtn = document.getElementById('random-logline-btn');
  const copyBtn = document.getElementById('copy-logline-btn');
  const beatsBtn = document.getElementById('jump-to-beats-btn');

  function updateLogline() {
    if (!preview) return;
    const p = pSelect.value;
    const i = iSelect.value;
    const g = gSelect.value;
    const s = sSelect.value;

    preview.textContent = `"When ${p} ${i}, they ${g}, ${s}"`;

    const score = Math.min(98, 84 + (p.length % 5) + (s.length % 6) + 4);
    if (scoreFill) scoreFill.style.width = `${score}%`;
    if (scoreLabel) scoreLabel.textContent = `${score}% — High Market Viability`;
  }

  [pSelect, iSelect, gSelect, sSelect].forEach(sel => {
    if (sel) sel.addEventListener('change', () => {
      playClickSound('click');
      updateLogline();
    });
  });

  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      playClickSound('clapper');
      const pick = LOGLINE_PRESETS[Math.floor(Math.random() * LOGLINE_PRESETS.length)];
      if (pSelect) pSelect.value = pick.protagonist;
      if (iSelect) iSelect.value = pick.incident;
      if (gSelect) gSelect.value = pick.goal;
      if (sSelect) sSelect.value = pick.stakes;
      updateLogline();
      showFilmToast('Loaded Hollywood High-Concept Logline Preset', 'fa-wand-magic-sparkles');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      playClickSound('click');
      if (preview) {
        navigator.clipboard.writeText(preview.textContent).then(() => {
          showFilmToast('Logline copied to clipboard!', 'fa-copy');
        }).catch(() => {
          showFilmToast('Logline text ready!', 'fa-check');
        });
      }
    });
  }

  if (beatsBtn) {
    beatsBtn.addEventListener('click', () => {
      playClickSound('clapper');
      const toolsSec = document.getElementById('tools');
      const beatTab = document.querySelector('.subtool-tab[data-subtool="beatsheet"]');
      if (beatTab) beatTab.click();
      if (toolsSec) toolsSec.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }
}

// Phase 2 Studio Handlers
function bindCallSheetStudioEvents() {
  const presetButtons = document.querySelectorAll('.cs-preset-btn');
  const printBtn = document.getElementById('print-callsheet-btn');
  const addSceneBtn = document.getElementById('add-scene-callsheet-btn');
  const copyBtn = document.getElementById('copy-callsheet-btn');

  let activePresetKey = 'noir';

  function renderCS(key) {
    const data = CALLSHEET_DATA[key];
    if (!data) return;

    const titleEl = document.getElementById('cs-prod-title');
    const dayInfoEl = document.getElementById('cs-day-info');
    const dateEl = document.getElementById('cs-date-val');
    const callEl = document.getElementById('cs-crew-call');
    const weatherEl = document.getElementById('cs-weather-val');
    const hospitalEl = document.getElementById('cs-hospital-val');
    const scenesTbody = document.getElementById('cs-scenes-tbody');
    const castTbody = document.getElementById('cs-cast-tbody');

    if (titleEl) titleEl.textContent = data.title;
    if (dayInfoEl) dayInfoEl.textContent = `${data.dayOf} • CREW CALL SHEET`;
    if (dateEl) dateEl.textContent = data.date;
    if (callEl) callEl.textContent = data.callTime;
    if (weatherEl) weatherEl.textContent = data.weather;
    if (hospitalEl) hospitalEl.textContent = data.hospital;

    if (scenesTbody) {
      scenesTbody.innerHTML = data.scenes.map(s => `
        <tr>
          <td><strong>Sc ${s.num}</strong></td>
          <td><strong>${s.set}</strong><br><small style="color:#6b7280;">${s.desc}</small></td>
          <td><span class="badge" style="background:#e5e7eb; color:#111;">${s.cast}</span></td>
          <td><strong>${s.pages}</strong></td>
        </tr>
      `).join('');
    }

    if (castTbody) {
      castTbody.innerHTML = data.cast.map(c => `
        <tr>
          <td><strong>${c.id}</strong></td>
          <td><strong>${c.char}</strong></td>
          <td>${c.actor}</td>
          <td><code>${c.pickup}</code></td>
          <td><code>${c.hmu}</code></td>
          <td><strong style="color:#b45309;">${c.onSet}</strong></td>
        </tr>
      `).join('');
    }
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound('clapper');
      presetButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activePresetKey = btn.getAttribute('data-cs');
      renderCS(activePresetKey);
      showFilmToast(`Call Sheet Preset: ${btn.textContent}`, 'fa-clipboard-list');
    });
  });

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      playClickSound('click');
      window.print();
    });
  }

  if (addSceneBtn) {
    addSceneBtn.addEventListener('click', () => {
      playClickSound('click');
      const data = CALLSHEET_DATA[activePresetKey];
      const nextNum = data.scenes.length + 14;
      data.scenes.push({
        num: String(nextNum),
        set: "INT. PRODUCTION VAN - NIGHT",
        cast: "1, 2",
        pages: "0 4/8",
        desc: "Tactical brief before final sting."
      });
      renderCS(activePresetKey);
      showFilmToast(`Added Scene ${nextNum} to Call Sheet Schedule`, 'fa-plus');
    });
  }

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      playClickSound('click');
      const data = CALLSHEET_DATA[activePresetKey];
      const summary = `OFFICIAL CALL SHEET: ${data.title}\nDate: ${data.date} | Crew Call: ${data.callTime}\nHospital: ${data.hospital}\nScenes: ${data.scenes.map(s => `Sc ${s.num}: ${s.set} (${s.pages} pgs)`).join(', ')}`;
      navigator.clipboard.writeText(summary).then(() => {
        showFilmToast('Call Sheet text summary copied!', 'fa-copy');
      });
    });
  }

  renderCS('noir');
}

// Phase 3 Studio Handlers
function bindOnSetSlateStudioEvents() {
  const steps = document.querySelectorAll('.seq-step-btn');
  const runAutoBtn = document.getElementById('run-full-sequence-btn');
  const roomToneBtn = document.getElementById('room-tone-timer-btn');
  const logList = document.getElementById('active-takes-log-list');
  const circleBtn = document.getElementById('log-take-circle-btn');
  const ngBtn = document.getElementById('log-take-ng-btn');
  const statusBadge = document.getElementById('take-status-badge');

  function renderTakesList() {
    if (!logList) return;
    logList.innerHTML = recordedTakesLog.map((t, idx) => `
      <li class="take-log-item">
        <span><strong>Scene ${t.scene} / Take ${t.take}</strong> (Snd #${t.sound})</span>
        <span>
          ${t.status === 'circle' 
            ? '<span class="badge" style="background:#34c759; color:#000;">⭐ CIRCLE TAKE</span>' 
            : '<span class="badge" style="background:#ff3b30; color:#fff;">❌ NG</span>'}
        </span>
      </li>
    `).join('');
  }

  steps.forEach(step => {
    step.addEventListener('click', () => {
      const num = parseInt(step.getAttribute('data-step'));
      if (num === 1) { playClickSound('walkie'); showFilmToast('1st AD: "Quiet on set, rolling sound!"', 'fa-bullhorn'); }
      else if (num === 2) { playClickSound('tally'); showFilmToast('Sound Mixer: "Sound Speed!"', 'fa-microphone'); }
      else if (num === 3) { playClickSound('click'); showFilmToast('1st AD: "Roll camera!"', 'fa-video'); }
      else if (num === 4) { playClickSound('clapper'); showFilmToast('2nd AC: "Scene 14 Baker, Take 4!" [SLATE CLACK]', 'fa-clapperboard'); }
      else if (num === 5) { playClickSound('action'); showFilmToast('Director: "And... ACTION!"', 'fa-person-running'); }

      step.classList.add('completed');
      if (statusBadge) statusBadge.textContent = `Step ${num} of 5 Active`;
    });
  });

  if (runAutoBtn) {
    runAutoBtn.addEventListener('click', () => {
      steps.forEach(s => s.classList.remove('completed'));
      showFilmToast('Commencing 5-Step Hollywood On-Set Call Sequence...', 'fa-play');

      const cues = [
        { step: 1, sound: 'walkie', delay: 400, text: '1st AD: "Quiet on set, roll sound!"' },
        { step: 2, sound: 'tally', delay: 1800, text: 'Sound Mixer: "Sound Speed!"' },
        { step: 3, sound: 'click', delay: 3000, text: '1st AD: "Roll camera!"' },
        { step: 4, sound: 'clapper', delay: 4200, text: '2nd AC: "Scene 14 Baker, Take 4!" [CLAP!]' },
        { step: 5, sound: 'action', delay: 5500, text: 'Director: "ACTION!"' }
      ];

      cues.forEach(c => {
        setTimeout(() => {
          playClickSound(c.sound);
          const el = document.getElementById(`seq-step-${c.step}`);
          if (el) el.classList.add('completed');
          if (statusBadge) statusBadge.textContent = c.text;
          showFilmToast(c.text, 'fa-bullhorn');
        }, c.delay);
      });

      setTimeout(() => {
        recordedTakesLog.push({
          scene: "14B",
          take: recordedTakesLog.length + 1,
          sound: `0${recordedTakesLog.length + 1}`,
          status: "circle",
          notes: "Auto sequence take captured"
        });
        renderTakesList();
        if (statusBadge) statusBadge.textContent = 'Take Completed & Logged';
      }, 6200);
    });
  }

  if (roomToneBtn) {
    roomToneBtn.addEventListener('click', () => {
      playClickSound('roomtone');
      showFilmToast('Recording 60 Seconds Room Tone. Silence all crew!', 'fa-microphone-lines');
      let secs = 60;
      roomToneBtn.disabled = true;
      const timer = setInterval(() => {
        secs--;
        roomToneBtn.innerHTML = `<i class="fa-solid fa-circle text-danger"></i> Recording: ${secs}s`;
        if (secs <= 0) {
          clearInterval(timer);
          roomToneBtn.disabled = false;
          roomToneBtn.innerHTML = '<i class="fa-solid fa-stopwatch"></i> Capture 60s Room Tone';
          playClickSound('bell');
          showFilmToast('Room Tone Capture Complete! 60s locked for audio post.', 'fa-check');
        }
      }, 1000);
    });
  }

  if (circleBtn) {
    circleBtn.addEventListener('click', () => {
      playClickSound('click');
      if (recordedTakesLog.length > 0) {
        recordedTakesLog[recordedTakesLog.length - 1].status = 'circle';
        renderTakesList();
        showFilmToast('Latest take marked as Circle Take (Print it!)', 'fa-star');
      }
    });
  }

  if (ngBtn) {
    ngBtn.addEventListener('click', () => {
      playClickSound('click');
      if (recordedTakesLog.length > 0) {
        recordedTakesLog[recordedTakesLog.length - 1].status = 'ng';
        renderTakesList();
        showFilmToast('Latest take marked as NG (No Good)', 'fa-xmark');
      }
    });
  }

  renderTakesList();
}

// Phase 4 Studio Handlers
function bindNLETimelineStudioEvents() {
  const playBtn = document.getElementById('nle-play-btn');
  const muteBtns = document.querySelectorAll('.track-m-btn');
  const soloBtns = document.querySelectorAll('.track-s-btn');
  const tcDisplay = document.getElementById('nle-tc-display');

  let isPlaying = false;
  let playInterval = null;

  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isPlaying = !isPlaying;
      playClickSound(isPlaying ? 'shutter' : 'click');
      playBtn.innerHTML = isPlaying 
        ? '<i class="fa-solid fa-pause"></i> Pause Timeline' 
        : '<i class="fa-solid fa-play"></i> Play Timeline Stems';

      if (isPlaying) {
        showFilmToast('NLE Timeline Playback: All Sync Stems Active', 'fa-film');
        let frame = 18;
        playInterval = setInterval(() => {
          frame = (frame + 4) % 24;
          if (tcDisplay) tcDisplay.textContent = `00:01:24:${String(frame).padStart(2, '0')}`;
        }, 160);
      } else {
        clearInterval(playInterval);
      }
    });
  }

  muteBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound('click');
      btn.classList.toggle('active-mute');
      const track = btn.getAttribute('data-track');
      showFilmToast(`Track ${track.toUpperCase()} Mute: ${btn.classList.contains('active-mute') ? 'MUTED' : 'LIVE'}`, 'fa-volume-xmark');
    });
  });

  soloBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound('click');
      btn.classList.toggle('active-solo');
      const track = btn.getAttribute('data-track');
      showFilmToast(`Track ${track.toUpperCase()} Solo Mode Active`, 'fa-headphones');
    });
  });
}

// Phase 5 Studio Handlers
function bindFestivalStudioEvents() {
  const titleInput = document.getElementById('laurel-input-title');
  const festSelect = document.getElementById('laurel-input-fest');
  const statusSelect = document.getElementById('laurel-input-status');
  const filmTitleDisplay = document.getElementById('laurel-film-title');
  const festDisplay = document.getElementById('laurel-fest-text');
  const awardDisplay = document.getElementById('laurel-award-text');
  const copyBtn = document.getElementById('copy-laurel-btn');

  function updateLaurel() {
    if (filmTitleDisplay && titleInput) filmTitleDisplay.textContent = titleInput.value.toUpperCase() || 'UNTITLED FILM';
    if (festDisplay && festSelect) festDisplay.textContent = festSelect.value;
    if (awardDisplay && statusSelect) awardDisplay.textContent = statusSelect.value;
  }

  if (titleInput) titleInput.addEventListener('input', updateLaurel);
  if (festSelect) festSelect.addEventListener('change', () => { playClickSound('click'); updateLaurel(); });
  if (statusSelect) statusSelect.addEventListener('change', () => { playClickSound('click'); updateLaurel(); });

  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      playClickSound('click');
      const tagline = `"${titleInput.value}" — ${statusSelect.value} at the ${festSelect.value}`;
      navigator.clipboard.writeText(tagline).then(() => {
        showFilmToast('Festival marketing laurel tagline copied!', 'fa-copy');
      });
    });
  }
}


// ============================================================================
// STEP 2: DEPARTMENTS & SECTORS LOGIC
// ============================================================================
function setupDepartmentExplorer() {
  const container = document.getElementById('departments-container');
  const filterPills = document.querySelectorAll('.filter-pill');
  const modal = document.getElementById('dept-modal');
  const modalBody = document.getElementById('dept-modal-body');
  const closeModalBtn = document.getElementById('close-dept-modal');

  function renderDepartments(filter = 'all') {
    if (!container) return;
    const filtered = filter === 'all' 
      ? DEPARTMENTS_DATA 
      : DEPARTMENTS_DATA.filter(d => d.category === filter);

    container.innerHTML = filtered.map(dept => `
      <div class="dept-card" data-dept-id="${dept.id}">
        <div>
          <div class="dept-card-top">
            <div class="dept-icon-wrapper">
              <i class="fa-solid ${dept.icon}"></i>
            </div>
            <span class="dept-category-tag">${dept.category}</span>
          </div>

          <h3 class="dept-title">${dept.title}</h3>
          <div class="dept-lead-role">${dept.leadRole}</div>
          <p class="dept-summary">${dept.summary}</p>

          <div class="dept-roles-list">
            ${dept.roles.slice(0, 4).map(r => `<span class="dept-role-badge">${r}</span>`).join('')}
            ${dept.roles.length > 4 ? `<span class="dept-role-badge">+${dept.roles.length - 4} more</span>` : ''}
          </div>
        </div>

        <div class="dept-card-footer">
          <span class="spec-tag"><i class="fa-solid fa-eye"></i> View Protocol</span>
          <span class="dept-action-text">Deep Dive <i class="fa-solid fa-arrow-right"></i></span>
        </div>
      </div>
    `).join('');

    // Attach 3D parallax tilt & smooth click expansion to cards
    document.querySelectorAll('.dept-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const rotateX = ((y - centerY) / centerY) * -6.5;
        const rotateY = ((x - centerX) / centerX) * 6.5;
        card.style.transform = `perspective(900px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateY(-5px) scale3d(1.02, 1.02, 1.02)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });

      card.addEventListener('click', () => {
        playClickSound('click');
        card.classList.add('card-expanding');
        setTimeout(() => {
          card.classList.remove('card-expanding');
          const deptId = card.getAttribute('data-dept-id');
          showDepartmentModal(deptId);
        }, 120);
      });
    });
  }

  function showDepartmentModal(deptId) {
    const dept = DEPARTMENTS_DATA.find(d => d.id === deptId);
    if (!dept || !modal || !modalBody) return;

    modalBody.innerHTML = `
      <div style="display:flex; align-items:center; gap:1.2rem; margin-bottom:1.5rem; padding-bottom:1rem; border-bottom:1px solid var(--border-subtle);">
        <div class="dept-icon-wrapper" style="width:58px; height:58px; font-size:1.8rem;">
          <i class="fa-solid ${dept.icon}"></i>
        </div>
        <div>
          <span class="badge" style="margin-bottom:0.3rem; display:inline-block;">${dept.category.toUpperCase()} SECTOR</span>
          <h2 style="font-family:var(--font-cinematic); font-size:1.8rem;">${dept.title}</h2>
          <span style="font-family:var(--font-mono); color:var(--accent-gold); font-size:0.9rem;">Commanding Role: ${dept.leadRole}</span>
        </div>
      </div>

      <div style="margin-bottom:1.5rem;">
        <h4 style="font-size:1rem; color:var(--text-primary); margin-bottom:0.4rem;">Department Mandate:</h4>
        <p style="color:var(--text-secondary); font-size:0.95rem; line-height:1.6;">${dept.mandate}</p>
      </div>

      <div style="display:grid; grid-template-columns:1fr 1fr; gap:1.2rem; margin-bottom:1.5rem;">
        <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
          <h5 style="color:var(--accent-gold); margin-bottom:0.5rem;"><i class="fa-solid fa-toolbox"></i> Primary Equipment & Arsenal</h5>
          <ul style="list-style:none; font-size:0.85rem; color:var(--text-secondary); display:flex; flex-direction:column; gap:0.3rem;">
            ${dept.gear.map(g => `<li>• ${g}</li>`).join('')}
          </ul>
        </div>
        <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-md); border:1px solid var(--border-subtle);">
          <h5 style="color:var(--accent-sienna); margin-bottom:0.5rem;"><i class="fa-solid fa-users"></i> All Sector Sub-Roles</h5>
          <div style="display:flex; flex-wrap:wrap; gap:0.4rem;">
            ${dept.roles.map(r => `<span class="dept-role-badge">${r}</span>`).join('')}
          </div>
        </div>
      </div>

      <div style="display:flex; flex-direction:column; gap:1rem;">
        <div class="callout-box tip">
          <h5><i class="fa-solid fa-comments"></i> How a First-Time Director Should Communicate:</h5>
          <p>${dept.collabTips}</p>
        </div>
        <div class="callout-box trap">
          <h5><i class="fa-solid fa-skull-crossbones"></i> Dangerous Red Flag to Avoid:</h5>
          <p>${dept.redFlag}</p>
        </div>
      </div>
    `;

    modal.classList.add('open');
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      playClickSound('click');
      modal.classList.remove('open');
    });
  }
  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target.classList.contains('modal-backdrop')) {
        modal.classList.remove('open');
      }
    });
  }

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      playClickSound('click');
      filterPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      renderDepartments(pill.getAttribute('data-dept-filter'));
    });
  });

  renderDepartments('all');
}

// ============================================================================
// STEP 3: INTERACTIVE TOOLS SUITE LOGIC
// ============================================================================
function setupInteractiveTools() {
  const subtoolTabs = document.querySelectorAll('.subtool-tab');
  const subtoolPanels = document.querySelectorAll('.subtool-panel');

  subtoolTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playClickSound('click');
      subtoolTabs.forEach(t => t.classList.remove('active'));
      subtoolPanels.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPanel = document.getElementById(`subtool-${tab.getAttribute('data-subtool')}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // Clicking milestone nodes navigates to subtool
  document.querySelectorAll('.milestone-node').forEach(node => {
    node.addEventListener('click', () => {
      const tool = node.getAttribute('data-subtool');
      const tab = document.querySelector(`.subtool-tab[data-subtool="${tool}"]`);
      if (tab) tab.click();
    });
  });

  setupShotListBuilder();
  setupBeatSheetCalculator();
  setupEighthsCalculator();
  setupBudgetMatrix();
  updateSuiteProgress();
}

function updateSuiteProgress() {
  const shots = JSON.parse(localStorage.getItem('craft_cinema_shots') || '[]');
  const pages = parseFloat(document.getElementById('scene-full-pages')?.value || '2');
  const eighths = parseFloat(document.getElementById('scene-eighths')?.value || '0');
  const totalEighthsPages = (pages + eighths / 8).toFixed(1);
  const budgetSelect = document.getElementById('budget-tier-select');
  const budgetTier = budgetSelect ? budgetSelect.value : 'micro';

  let completedSteps = 1; // Beats is active by default
  if (parseFloat(totalEighthsPages) > 0) completedSteps++;
  if (shots.length > 0) completedSteps++;
  if (budgetTier) completedSteps++;

  const percent = Math.min(100, Math.round((completedSteps / 4) * 100));

  const percentEl = document.getElementById('suite-readiness-percent');
  if (percentEl) percentEl.textContent = `${percent}% READY`;

  const nodeShotsStatus = document.getElementById('node-shots-status');
  if (nodeShotsStatus) nodeShotsStatus.textContent = shots.length > 0 ? `${shots.length} Shots Ready` : '0 Shots';

  const nodeEighthsStatus = document.getElementById('node-eighths-status');
  if (nodeEighthsStatus) nodeEighthsStatus.textContent = `${totalEighthsPages} Pages Ready`;

  const nodeBudgetStatus = document.getElementById('node-budget-status');
  if (nodeBudgetStatus) nodeBudgetStatus.textContent = `${budgetTier.toUpperCase()} Active`;

  // Update checkmarks and active classes
  const nodeEighths = document.getElementById('node-eighths');
  if (nodeEighths) {
    nodeEighths.classList.toggle('active', parseFloat(totalEighthsPages) > 0);
    const circle = nodeEighths.querySelector('.node-circle');
    if (circle) circle.innerHTML = parseFloat(totalEighthsPages) > 0 ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-circle-dot"></i>';
  }

  const nodeShots = document.getElementById('node-shots');
  if (nodeShots) {
    nodeShots.classList.toggle('active', shots.length > 0);
    const circle = nodeShots.querySelector('.node-circle');
    if (circle) circle.innerHTML = shots.length > 0 ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-circle-dot"></i>';
  }

  const nodeBudget = document.getElementById('node-budget');
  if (nodeBudget) {
    nodeBudget.classList.toggle('active', !!budgetTier);
    const circle = nodeBudget.querySelector('.node-circle');
    if (circle) circle.innerHTML = budgetTier ? '<i class="fa-solid fa-check"></i>' : '<i class="fa-solid fa-circle-dot"></i>';
  }
}

function setupShotListBuilder() {
  let shots = JSON.parse(localStorage.getItem('craft_cinema_shots') || '[]');

  const form = document.getElementById('shot-form');
  const tableBody = document.getElementById('shots-table-body');
  const countBadge = document.getElementById('shot-count-badge');
  const exportBtn = document.getElementById('export-csv-btn');
  const printBtn = document.getElementById('print-shots-btn');
  const clearBtn = document.getElementById('clear-shots-btn');
  const sampleBtn = document.getElementById('load-sample-shots');

  function renderShots() {
    if (!tableBody || !countBadge) return;
    countBadge.textContent = `${shots.length} Shots Planned`;

    if (shots.length === 0) {
      tableBody.innerHTML = `
        <tr>
          <td colspan="7" style="text-align:center; padding:3rem; color:var(--text-muted);">
            <i class="fa-solid fa-clapperboard" style="font-size:2rem; margin-bottom:0.8rem; display:block; opacity:0.4;"></i>
            No shots in sequence yet. Fill out the form or click "Load Scene Demo" above.
          </td>
        </tr>
      `;
      return;
    }

    tableBody.innerHTML = shots.map((s, idx) => `
      <tr>
        <td><strong>Sc ${s.scene} / Sh ${s.num}</strong><br><small style="color:var(--accent-gold);">${s.subject}</small></td>
        <td><span class="shot-badge ${['CU', 'ECU', 'MCU'].includes(s.size) ? 'cu' : ''}">${s.size}</span></td>
        <td>${s.angle}</td>
        <td><code style="color:var(--accent-sienna); font-size:0.75rem;">${s.lens}</code></td>
        <td>${s.movement}</td>
        <td style="max-width:280px; font-size:0.8rem;">${s.desc || '—'}</td>
        <td>
          <button class="del-shot-btn" data-shot-idx="${idx}" title="Delete Shot">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.del-shot-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-shot-idx'));
        shots.splice(idx, 1);
        saveShots();
        renderShots();
      });
    });
  }

  function saveShots() {
    localStorage.setItem('craft_cinema_shots', JSON.stringify(shots));
    updateSuiteProgress();
  }

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      playClickSound('clapper');

      const newShot = {
        scene: document.getElementById('shot-scene').value,
        num: document.getElementById('shot-num').value,
        subject: document.getElementById('shot-subject').value,
        size: document.getElementById('shot-size').value,
        angle: document.getElementById('shot-angle').value,
        movement: document.getElementById('shot-movement').value,
        lens: document.getElementById('shot-lens').value,
        desc: document.getElementById('shot-desc').value
      };

      shots.push(newShot);
      saveShots();
      renderShots();

      const numInput = document.getElementById('shot-num');
      const curNum = parseInt(numInput.value);
      if (!isNaN(curNum)) {
        numInput.value = curNum + 1;
      }
      document.getElementById('shot-desc').value = '';
    });
  }

  if (sampleBtn) {
    sampleBtn.addEventListener('click', () => {
      playClickSound('click');
      shots = [
        { scene: "12", num: "1", subject: "Detective Harris & Suspect", size: "WS", angle: "Eye Level", movement: "Static (Tripod)", lens: "35mm (Cinematic Master)", desc: "Master establishing shot of dark dim interrogation room. Fluorescent overhead flickering." },
        { scene: "12", num: "2", subject: "Detective Harris", size: "MCU", angle: "Low Angle", movement: "Dolly In / Push", lens: "50mm (Natural Eye)", desc: "Harris leans forward across the metal table, slamming down the evidence folder." },
        { scene: "12", num: "3", subject: "Suspect (Eli)", size: "CU", angle: "Eye Level", movement: "Handheld", lens: "85mm (Portrait Close-up)", desc: "Eli flinches. Eyes dart to the one-way mirror. Subtle swallow of anxiety." },
        { scene: "12", num: "4", subject: "Evidence on Desk", size: "INSERT", angle: "High Angle", movement: "Static (Tripod)", lens: "50mm (Natural Eye)", desc: "Close-up of crime scene photo showing the grandfather clock stopped at 11:42 PM." },
        { scene: "12", num: "5", subject: "Harris & Eli Profile", size: "OTS", angle: "Eye Level", movement: "Pan / Tilt", lens: "50mm (Natural Eye)", desc: "Over Harris's broad trenchcoat shoulder onto Eli's face. Heavy silhouette." }
      ];
      saveShots();
      renderShots();
    });
  }

  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      if (shots.length === 0) return alert('Add at least one shot first!');
      playClickSound('click');
      let csv = 'Scene,Shot,Subject,Size,Angle,Lens,Movement,Description\n';
      shots.forEach(s => {
        csv += `"${s.scene}","${s.num}","${s.subject}","${s.size}","${s.angle}","${s.lens}","${s.movement}","${(s.desc || '').replace(/"/g, '""')}"\n`;
      });
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `shotlist_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
    });
  }

  if (printBtn) {
    printBtn.addEventListener('click', () => {
      playClickSound('click');
      window.print();
    });
  }

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Clear all shots in your sequence?')) {
        playClickSound('click');
        shots = [];
        saveShots();
        renderShots();
      }
    });
  }

  renderShots();
}

function setupBeatSheetCalculator() {
  const calcBtn = document.getElementById('calc-beats-btn');
  const input = document.getElementById('script-length-input');
  const outputGrid = document.getElementById('beats-output-grid');

  function calculateBeats() {
    const total = parseFloat(input.value) || 90;
    playClickSound('click');

    const beats = [
      {
        act: "ACT 1: THE STATUS QUO (0% - 25%)",
        span: `Pages 1 to ${Math.round(total * 0.25)}`,
        items: [
          { name: "1. Opening Image", pct: 0.01, desc: "A visual snapshot of the protagonist's flawed world before the journey begins." },
          { name: "2. Theme Stated", pct: 0.05, desc: "A secondary character subtly mentions the core life lesson the protagonist must learn." },
          { name: "3. Set-Up", pct: 0.01, toPct: 0.10, desc: "Establish normal life, internal tick/flaw, and the stakes of change." },
          { name: "4. Catalyst (Inciting Incident)", pct: 0.12, desc: "The telegram arrives; normal life is shattered forever." },
          { name: "5. Debate", pct: 0.12, toPct: 0.25, desc: "Can I do this? Protagonist hesitates, resists the call, tests alternatives." },
          { name: "6. Break into Two", pct: 0.25, desc: "Protagonist makes a conscious, irreversible decision to step into the Upside-Down world." }
        ]
      },
      {
        act: "ACT 2A: FUN & GAMES & MIDPOINT (25% - 50%)",
        span: `Pages ${Math.round(total * 0.25)} to ${Math.round(total * 0.50)}`,
        items: [
          { name: "7. B Story (Love / Mentor)", pct: 0.30, desc: "Introduction of the relationship that will help the hero evolve and heal." },
          { name: "8. Fun and Games", pct: 0.30, toPct: 0.50, desc: "The promise of the premise! The hero tests new powers or strange world." },
          { name: "9. Midpoint", pct: 0.50, desc: "False Victory or False Defeat. Stakes turn deadly serious; clock starts ticking." }
        ]
      },
      {
        act: "ACT 2B: BAD GUYS CLOSE IN (50% - 75%)",
        span: `Pages ${Math.round(total * 0.50)} to ${Math.round(total * 0.75)}`,
        items: [
          { name: "10. Bad Guys Close In", pct: 0.50, toPct: 0.75, desc: "Internal fractures among allies; external antagonist escalates aggressive pressure." },
          { name: "11. All Is Lost", pct: 0.75, desc: "The plan fails completely. The Whiff of Death." },
          { name: "12. Dark Night of the Soul", pct: 0.75, toPct: 0.80, desc: "Total despair in the shadows. The protagonist mourns their old self." }
        ]
      },
      {
        act: "ACT 3: THE FINALE (75% - 100%)",
        span: `Pages ${Math.round(total * 0.75)} to ${Math.round(total)}`,
        items: [
          { name: "13. Break into Three", pct: 0.80, desc: "The epiphany! Armed with the theme, the hero devises a bold new solution." },
          { name: "14. The Finale", pct: 0.80, toPct: 0.98, desc: "Storming the castle. Execution of the new plan; defeating the antagonist." },
          { name: "15. Final Image", pct: 0.99, desc: "Mirror image of Opening Image showing the profound transformation of the world." }
        ]
      }
    ];

    outputGrid.innerHTML = beats.map(actGroup => `
      <div class="act-card">
        <div class="act-header">
          <span class="act-title">${actGroup.act}</span>
          <span class="act-page-span">${actGroup.span}</span>
        </div>
        ${actGroup.items.map(b => {
          const pageStr = b.toPct 
            ? `p. ${Math.max(1, Math.round(total * b.pct))} - ${Math.round(total * b.toPct)}`
            : `p. ${Math.max(1, Math.round(total * b.pct))}`;
          return `
            <div class="beat-item">
              <span class="beat-page-marker">${pageStr}</span>
              <div>
                <div class="beat-name">${b.name}</div>
                <div class="beat-desc">${b.desc}</div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    `).join('');
  }

  if (calcBtn) calcBtn.addEventListener('click', calculateBeats);
  calculateBeats();
}

function setupEighthsCalculator() {
  const fullPagesInput = document.getElementById('scene-full-pages');
  const eighthsSelect = document.getElementById('scene-eighths');
  const complexitySelect = document.getElementById('scene-complexity');
  const resultBox = document.getElementById('eighths-result-box');

  function calculate() {
    const full = parseInt(fullPagesInput.value) || 0;
    const eighths = parseInt(eighthsSelect.value) || 0;
    const complexity = complexitySelect.value;

    const totalEighths = (full * 8) + eighths;
    const totalPagesDecimal = totalEighths / 8;

    const screenSecs = Math.round(totalPagesDecimal * 60);
    const screenMin = Math.floor(screenSecs / 60);
    const remSecs = screenSecs % 60;

    let setupsPerEighth = 0.8;
    let setupTimeMinutes = 20;

    if (complexity === 'simple') {
      setupsPerEighth = 0.5;
      setupTimeMinutes = 15;
    } else if (complexity === 'complex') {
      setupsPerEighth = 1.3;
      setupTimeMinutes = 30;
    }

    const estimatedSetups = Math.max(2, Math.round(totalEighths * setupsPerEighth));
    const estimatedShootHours = ((estimatedSetups * setupTimeMinutes) / 60).toFixed(1);

    resultBox.innerHTML = `
      <div class="eighths-stat">
        <span>TOTAL SCRIPT LENGTH</span>
        <strong>${full} ${eighths > 0 ? `${eighths}/8` : ''} pages</strong>
        <small style="color:var(--text-muted); font-size:0.75rem;">${totalEighths} total 8ths of paper</small>
      </div>

      <div class="eighths-stat">
        <span>ESTIMATED SCREEN RUNTIME</span>
        <strong style="color:var(--accent-sienna);">${screenMin}m ${remSecs}s</strong>
        <small style="color:var(--text-muted); font-size:0.75rem;">At standard 1 page = 1 minute</small>
      </div>

      <div class="eighths-stat">
        <span>ESTIMATED CAMERA SETUPS</span>
        <strong>${estimatedSetups} Setups</strong>
        <small style="color:var(--text-muted); font-size:0.75rem;">Master, 2-shots, reverses, inserts</small>
      </div>

      <div class="eighths-stat">
        <span>RECOMMENDED SHOOT BLOCK</span>
        <strong style="color:var(--accent-gold);">${estimatedShootHours} Hours</strong>
        <small style="color:var(--text-muted); font-size:0.75rem;">${parseFloat(estimatedShootHours) > 5 ? '⚠️ Requires Full Day or Multi-Day' : '✅ Feasible Half-Day Block'}</small>
      </div>
    `;
    updateSuiteProgress();
  }

  if (fullPagesInput) fullPagesInput.addEventListener('input', calculate);
  if (eighthsSelect) eighthsSelect.addEventListener('change', calculate);
  if (complexitySelect) complexitySelect.addEventListener('change', calculate);
  calculate();
}

function setupBudgetMatrix() {
  const tierButtons = document.querySelectorAll('.tier-btn');
  const displayCard = document.getElementById('budget-tier-display');

  function renderTier(tierKey) {
    const data = BUDGET_TIERS[tierKey];
    if (!data || !displayCard) return;
    updateSuiteProgress();

    displayCard.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:1.5rem; flex-wrap:wrap; gap:1rem;">
        <div>
          <span class="badge" style="margin-bottom:0.4rem; display:inline-block;">BUDGET TIER PROFILE</span>
          <h2 style="font-family:var(--font-cinematic); font-size:1.8rem; color:var(--accent-gold);">${data.name}</h2>
          <p style="color:var(--text-secondary);">${data.subtitle}</p>
        </div>
        <div style="background:var(--bg-surface); border:1px solid var(--border-glow); padding:0.6rem 1.2rem; border-radius:var(--radius-md);">
          <span style="font-family:var(--font-mono); font-size:0.75rem; color:var(--text-muted); display:block;">CORE PRINCIPLE</span>
          <strong style="color:var(--accent-sienna); font-size:0.9rem;">No Waste / Precision Allocation</strong>
        </div>
      </div>

      <div style="margin-bottom:2rem;">
        <h4 style="font-size:1rem; margin-bottom:0.8rem; color:var(--text-primary);"><i class="fa-solid fa-chart-pie gold"></i> Recommended Budget Distribution</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(220px, 1fr)); gap:1rem;">
          ${data.splits.map(s => `
            <div style="background:var(--bg-surface); border:1px solid var(--border-subtle); padding:1rem; border-radius:var(--radius-md);">
              <div style="display:flex; justify-content:space-between; align-items:baseline; margin-bottom:0.3rem;">
                <strong style="color:var(--text-primary); font-size:0.9rem;">${s.label}</strong>
                <span style="font-family:var(--font-mono); color:var(--accent-gold); font-weight:700; font-size:1.1rem;">${s.pct}%</span>
              </div>
              <div style="height:4px; background:rgba(255,255,255,0.06); border-radius:2px; margin-bottom:0.5rem; overflow:hidden;">
                <div style="width:${s.pct}%; height:100%; background:var(--accent-gold);"></div>
              </div>
              <p style="font-size:0.75rem; color:var(--text-muted); line-height:1.4;">${s.desc}</p>
            </div>
          `).join('')}
        </div>
      </div>

      <div style="background:rgba(14, 17, 23, 0.7); border:1px solid var(--border-subtle); border-radius:var(--radius-md); padding:1.4rem; margin-bottom:1.5rem;">
        <h4 style="font-size:1rem; margin-bottom:0.8rem; color:var(--accent-sienna);"><i class="fa-solid fa-camera"></i> Benchmark Gear Package for this Tier:</h4>
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:1rem; font-size:0.85rem;">
          <div><strong style="color:var(--text-secondary); display:block; font-size:0.75rem;">CAMERA BODY:</strong> ${data.gear.camera}</div>
          <div><strong style="color:var(--text-secondary); display:block; font-size:0.75rem;">LENS SELECTION:</strong> ${data.gear.lenses}</div>
          <div><strong style="color:var(--text-secondary); display:block; font-size:0.75rem;">LIGHTING & GRIP:</strong> ${data.gear.lighting}</div>
          <div><strong style="color:var(--text-secondary); display:block; font-size:0.75rem;">SOUND ARSENAL:</strong> ${data.gear.audio}</div>
        </div>
      </div>

      <div class="callout-box tip">
        <h5><i class="fa-solid fa-chess-knight"></i> Strategic Director Advice for this Tier:</h5>
        <p>${data.strategy}</p>
      </div>
    `;
  }

  tierButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound('click');
      tierButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTier(btn.getAttribute('data-tier'));
    });
  });

  renderTier('micro');
}

// ============================================================================
// STEP 4: CINELAB - LIGHTING & OPTICS STUDIO
// ============================================================================
function setupCineLabLighting() {
  const keySlider = document.getElementById('key-intensity');
  const fillSlider = document.getElementById('fill-intensity');
  const rimSlider = document.getElementById('rim-intensity');

  const keyDisplay = document.getElementById('key-val-display');
  const fillDisplay = document.getElementById('fill-val-display');
  const rimDisplay = document.getElementById('rim-val-display');
  const moodDisplay = document.getElementById('mood-style-display');
  const ratioBadge = document.getElementById('contrast-ratio-badge');

  const canvas = document.getElementById('face-render-canvas');
  const presetButtons = document.querySelectorAll('.preset-btn');

  function updateLighting() {
    const keyVal = parseInt(keySlider.value);
    const fillVal = parseInt(fillSlider.value);
    const rimVal = parseInt(rimSlider.value);

    keyDisplay.textContent = `${keyVal}%`;
    rimDisplay.textContent = `${rimVal}%`;

    let ratioStr = "1 : 1";
    let mood = "Flat / Comedy";

    if (fillVal <= 5) {
      ratioStr = "16 : 1+ (Extreme)";
      mood = "High Chiaroscuro / Mystery";
      fillDisplay.textContent = `${fillVal}% (Deep Silhouette)`;
    } else {
      const ratioNum = Math.max(1, Math.round(keyVal / Math.max(1, fillVal)));
      ratioStr = `${ratioNum} : 1`;
      if (ratioNum >= 8) mood = "Film Noir / Psychological Thriller";
      else if (ratioNum >= 4) mood = "Cinematic Indie Drama";
      else if (ratioNum >= 2) mood = "Commercial / Standard Narrative";
      else mood = "Flat High Key / Sitcom";
      fillDisplay.textContent = `${fillVal}%`;
    }

    ratioBadge.textContent = `Contrast Ratio: ${ratioStr}`;
    moodDisplay.textContent = mood;

    renderCanvasSubject(keyVal, fillVal, rimVal);
  }

  function renderCanvasSubject(k, f, r) {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;

    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = '#050608';
    ctx.fillRect(0, 0, w, h);

    const centerX = w / 2;
    const centerY = h / 2 - 10;
    const headRadius = 45;

    // Rim Light Glow
    if (r > 0) {
      const rimAlpha = (r / 100) * 0.9;
      const rimGrad = ctx.createRadialGradient(centerX, centerY - 10, headRadius - 5, centerX, centerY - 10, headRadius + 18);
      rimGrad.addColorStop(0, `rgba(255, 255, 255, ${rimAlpha})`);
      rimGrad.addColorStop(0.5, `rgba(229, 169, 60, ${rimAlpha * 0.5})`);
      rimGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 10, headRadius + 16, 0, Math.PI * 2);
      ctx.fill();
    }

    // Shoulders
    ctx.beginPath();
    ctx.moveTo(centerX - 65, h);
    ctx.quadraticCurveTo(centerX - 40, centerY + 50, centerX, centerY + 50);
    ctx.quadraticCurveTo(centerX + 40, centerY + 50, centerX + 65, h);
    ctx.fillStyle = '#11141c';
    ctx.fill();

    // Subject Face Head
    ctx.save();
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, headRadius * 0.85, headRadius * 1.15, 0, 0, Math.PI * 2);
    ctx.clip();

    // Fill Light
    const fillLightness = Math.round((f / 100) * 80 + 15);
    ctx.fillStyle = `rgb(${fillLightness * 0.9}, ${fillLightness}, ${fillLightness * 1.2})`;
    ctx.fillRect(0, 0, w, h);

    // Key Light Gradient (Highlights from Upper-Right)
    const keyIntensity = k / 100;
    const keyGrad = ctx.createLinearGradient(centerX - headRadius, centerY, centerX + headRadius, centerY);
    keyGrad.addColorStop(0, 'rgba(0, 0, 0, 0.7)');
    keyGrad.addColorStop(0.4, 'rgba(0, 0, 0, 0.2)');
    keyGrad.addColorStop(0.8, `rgba(245, 196, 105, ${0.7 * keyIntensity})`);
    keyGrad.addColorStop(1, `rgba(255, 240, 210, ${0.95 * keyIntensity})`);

    ctx.fillStyle = keyGrad;
    ctx.fillRect(0, 0, w, h);

    // Facial features contour shading
    ctx.fillStyle = `rgba(0, 0, 0, ${0.45 * (1 - (f / 100))})`;
    ctx.beginPath();
    ctx.arc(centerX - 16, centerY - 8, 8, 0, Math.PI * 2);
    ctx.arc(centerX + 16, centerY - 8, 8, 0, Math.PI * 2);
    ctx.fill();

    // Nose shadow
    ctx.beginPath();
    ctx.moveTo(centerX, centerY - 12);
    ctx.lineTo(centerX - 4, centerY + 14);
    ctx.lineTo(centerX + 6, centerY + 14);
    ctx.closePath();
    ctx.fillStyle = `rgba(0, 0, 0, ${0.6 * (1 - (f / 100))})`;
    ctx.fill();

    // Eye catchlight
    if (k > 20) {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX + 18, centerY - 10, 1.8, 0, Math.PI * 2);
      ctx.arc(centerX - 14, centerY - 10, 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();

    // Hair Rim Halo
    if (r > 15) {
      const rimHaloAlpha = (r / 100) * 0.8;
      ctx.lineWidth = 3.5;
      ctx.strokeStyle = `rgba(255, 255, 255, ${rimHaloAlpha})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY - 5, headRadius * 0.95, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    }
  }

  presetButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound('click');
      const preset = btn.getAttribute('data-preset');
      if (preset === 'noir') {
        keySlider.value = 100;
        fillSlider.value = 8;
        rimSlider.value = 85;
      } else if (preset === 'commercial') {
        keySlider.value = 90;
        fillSlider.value = 75;
        rimSlider.value = 40;
      } else if (preset === 'moody') {
        keySlider.value = 75;
        fillSlider.value = 20;
        rimSlider.value = 65;
      } else if (preset === 'silhouette') {
        keySlider.value = 0;
        fillSlider.value = 0;
        rimSlider.value = 100;
      }
      updateLighting();
    });
  });

  if (keySlider) keySlider.addEventListener('input', updateLighting);
  if (fillSlider) fillSlider.addEventListener('input', updateLighting);
  if (rimSlider) rimSlider.addEventListener('input', updateLighting);

  updateLighting();
}

function setupCineLabOptics() {
  const apertureSelect = document.getElementById('aperture-select');
  const focalSelect = document.getElementById('focal-length-select');
  const focusSelect = document.getElementById('focus-target-select');

  const dofBadge = document.getElementById('dof-badge');
  const infoBox = document.getElementById('optics-info-box');

  const bgLayer = document.getElementById('dof-bg');
  const subjectLayer = document.getElementById('dof-subject');
  const fgLayer = document.getElementById('dof-fg');

  function updateOptics() {
    const fStop = parseFloat(apertureSelect.value);
    const focalMm = parseInt(focalSelect.value);
    const focusTarget = focusSelect.value;

    dofBadge.textContent = `Aperture: f/${fStop} | Lens: ${focalMm}mm`;

    const blurMultiplier = (1 / fStop) * (focalMm / 50);

    let bgBlur = 0;
    let subjectBlur = 0;
    let fgBlur = 0;

    if (focusTarget === 'subject') {
      subjectBlur = 0;
      bgBlur = Math.min(20, Math.round(12 * blurMultiplier));
      fgBlur = Math.min(18, Math.round(10 * blurMultiplier));
    } else if (focusTarget === 'fg') {
      fgBlur = 0;
      subjectBlur = Math.min(15, Math.round(9 * blurMultiplier));
      bgBlur = Math.min(25, Math.round(18 * blurMultiplier));
    } else if (focusTarget === 'bg') {
      bgBlur = 0;
      subjectBlur = Math.min(16, Math.round(10 * blurMultiplier));
      fgBlur = Math.min(22, Math.round(16 * blurMultiplier));
    }

    if (bgLayer) bgLayer.style.filter = `blur(${bgBlur}px)`;
    if (subjectLayer) subjectLayer.style.filter = `blur(${subjectBlur}px)`;
    if (fgLayer) fgLayer.style.filter = `blur(${fgBlur}px)`;

    const scaleFactor = 0.8 + (focalMm / 150);
    if (bgLayer) bgLayer.style.transform = `scale(${scaleFactor})`;

    infoBox.innerHTML = `
      <div style="display:flex; justify-content:space-between; margin-bottom:0.4rem;">
        <strong style="color:var(--accent-gold);">Optical Characteristic:</strong>
        <span class="spec-tag">${focalMm < 35 ? 'Wide Environmental' : focalMm > 70 ? 'Telephoto Compression' : 'Standard Natural'}</span>
      </div>
      <p style="margin-bottom:0.4rem;">
        ${fStop <= 2.8 
          ? `<strong>f/${fStop} (Fast Cinema Aperture):</strong> Razor-thin depth of field isolates the subject completely. Requires an expert 1st AC (Focus Puller) to track actor movement without buzzing focus.` 
          : `<strong>f/${fStop} (Deep Focus Aperture):</strong> Deep depth of field keeps both foreground, subject, and background sharply in focus. Requires significantly more lighting power (footcandles) on set.`}
      </p>
      <p style="color:var(--text-muted); font-size:0.75rem;">
        ${focalMm >= 85 
          ? `<strong>Lens Compression at ${focalMm}mm:</strong> Flattens facial features flatteringly, shrinks the apparent physical distance between subject and background, and creates creamy, circular bokeh orbs.` 
          : `<strong>Field of View at ${focalMm}mm:</strong> Expands perceived distance between objects, exaggerating camera movement and drawing in wide environment.`}
      </p>
    `;
  }

  if (apertureSelect) apertureSelect.addEventListener('change', () => { playClickSound('click'); updateOptics(); });
  if (focalSelect) focalSelect.addEventListener('change', () => { playClickSound('click'); updateOptics(); });
  if (focusSelect) focusSelect.addEventListener('change', () => { playClickSound('click'); updateOptics(); });

  updateOptics();
}

// ============================================================================
// STEP 5: CINEMA THEATER & VIDEO MASTERCLASSES
// ============================================================================
function setupVideoTheater() {
  const player = document.getElementById('cinema-video-player');
  const playBtn = document.getElementById('theater-play-btn');
  const muteBtn = document.getElementById('theater-mute-btn');
  const titleEl = document.getElementById('active-video-title');
  const descEl = document.getElementById('active-video-desc');
  const playlistCards = document.querySelectorAll('.playlist-card');

  if (playBtn && player) {
    playBtn.addEventListener('click', () => {
      playClickSound('click');
      if (player.paused) {
        player.play();
        playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      } else {
        player.pause();
        playBtn.innerHTML = '<i class="fa-solid fa-play"></i> Play';
      }
    });
  }

  if (muteBtn && player) {
    muteBtn.addEventListener('click', () => {
      playClickSound('click');
      player.muted = !player.muted;
      muteBtn.innerHTML = player.muted 
        ? '<i class="fa-solid fa-volume-xmark"></i> Muted' 
        : '<i class="fa-solid fa-volume-high"></i> Audio';
    });
  }

  // Playlist switching
  playlistCards.forEach(card => {
    card.addEventListener('click', () => {
      playClickSound('clapper');
      playlistCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');

      const title = card.getAttribute('data-title');
      const desc = card.getAttribute('data-desc');
      const videoSrc = card.getAttribute('data-video-src');
      const youtubeId = card.getAttribute('data-youtube-id');

      if (titleEl) titleEl.textContent = title;
      if (descEl) descEl.textContent = desc;

      if (videoSrc && player) {
        // Local HTML5 video
        player.src = videoSrc;
        player.play().catch(() => {});
        if (playBtn) playBtn.innerHTML = '<i class="fa-solid fa-pause"></i> Pause';
      } else if (youtubeId && player) {
        // Switch to embedded YouTube tutorial
        const parent = player.parentElement;
        parent.innerHTML = `
          <iframe width="100%" height="100%" src="https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="border:none;"></iframe>
          <div class="video-overlay-hud">
            <span class="hud-lut-badge">YOUTUBE MASTERCLASS</span>
            <span class="hud-lens-badge">HIGH DEFINITION</span>
          </div>
        `;
      }
    });
  });
}

// ============================================================================
// STEP 6: COLOR GRADING BEFORE / AFTER SLIDER
// ============================================================================
function setupColorGradeSlider() {
  const container = document.getElementById('comparison-slider-box');
  const afterLayer = document.getElementById('after-grade-layer');
  const handle = document.getElementById('grade-drag-handle');
  const afterImg = document.querySelector('.grade-img.rich-grade');
  const rightLabel = document.querySelector('.grade-label.right-label');

  if (!container || !afterLayer || !handle) return;

  let isDragging = false;

  function updateSliderPosition(clientX) {
    const rect = container.getBoundingClientRect();
    let offsetX = clientX - rect.left;
    let percentage = (offsetX / rect.width) * 100;
    percentage = Math.max(0, Math.min(100, percentage));

    afterLayer.style.width = `${percentage}%`;
    handle.style.left = `${percentage}%`;
  }

  container.addEventListener('mousedown', (e) => {
    isDragging = true;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    updateSliderPosition(e.clientX);
  });

  window.addEventListener('mouseup', () => {
    isDragging = false;
  });

  container.addEventListener('touchstart', (e) => {
    isDragging = true;
    if (e.touches.length > 0) {
      updateSliderPosition(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    if (e.touches.length > 0) {
      updateSliderPosition(e.touches[0].clientX);
    }
  }, { passive: true });

  window.addEventListener('touchend', () => {
    isDragging = false;
  });

  // ============================================================================
  // INTERACTIVE LUT PRESETS & LIVE GRADING DECK (WITH SALAAR GRADE)
  // ============================================================================
  const lutPills = document.querySelectorAll('.lut-pill');
  const expSlider = document.getElementById('slider-grade-exp');
  const contrastSlider = document.getElementById('slider-grade-contrast');
  const warmthSlider = document.getElementById('slider-grade-warmth');
  const satSlider = document.getElementById('slider-grade-sat');

  const valExp = document.getElementById('val-grade-exp');
  const valContrast = document.getElementById('val-grade-contrast');
  const valWarmth = document.getElementById('val-grade-warmth');
  const valSat = document.getElementById('val-grade-sat');

  const resetBtn = document.getElementById('reset-grade-btn');
  const toggleGrainBtn = document.getElementById('toggle-grain-btn');
  const scopeTag = document.getElementById('scope-status-tag');
  const waveformCanvas = document.getElementById('grade-waveform-canvas');

  let activeLut = 'kodak';
  let filmGrainActive = false;

  const LUT_PRESET_CONFIGS = {
    kodak: {
      exp: 0.0,
      contrast: 1.25,
      warmth: 10,
      sat: 120,
      filter: "contrast(1.22) brightness(0.96) saturate(1.25)",
      label: "FINAL PRINT EMULATION (KODAK 2383 / ACES)",
      tag: "KODAK 2383 // ACEScc"
    },
    salaar: {
      exp: -0.3,
      contrast: 1.80,
      warmth: 35,
      sat: 28,
      filter: "contrast(1.8) brightness(0.86) saturate(0.28) sepia(0.22) hue-rotate(-12deg)",
      label: "SALAAR // KHANSAAR SOOT & GOLD (PRABHAS BENCHMARK)",
      tag: "SALAAR KHANSAAR // HIGH CONTRAST"
    },
    'teal-orange': {
      exp: 0.1,
      contrast: 1.35,
      warmth: -15,
      sat: 135,
      filter: "contrast(1.35) brightness(0.98) saturate(1.35) hue-rotate(5deg)",
      label: "TEAL & ORANGE HOLLYWOOD BLOCKBUSTER GRADE",
      tag: "BLOCKBUSTER TEAL/ORANGE"
    },
    bleach: {
      exp: 0.2,
      contrast: 1.65,
      warmth: -5,
      sat: 55,
      filter: "contrast(1.65) brightness(1.05) saturate(0.55)",
      label: "SILVER RETENTION BLEACH BYPASS (GRITTY WAR / ACTION)",
      tag: "BLEACH BYPASS // HIGH CONTRAST"
    },
    cyberpunk: {
      exp: 0.0,
      contrast: 1.45,
      warmth: -40,
      sat: 160,
      filter: "contrast(1.45) brightness(0.92) saturate(1.6) hue-rotate(-20deg)",
      label: "CYBERPUNK NEON NOIR (SATURATED CYAN & AMBER)",
      tag: "NEON ACEScc"
    },
    bw: {
      exp: 0.1,
      contrast: 1.40,
      warmth: 0,
      sat: 0,
      filter: "contrast(1.4) brightness(0.95) grayscale(100%)",
      label: "1950s SILVER HALIDE MONOCHROME",
      tag: "MONOCHROME 35mm"
    },
    flat: {
      exp: 0.0,
      contrast: 0.65,
      warmth: 0,
      sat: 40,
      filter: "contrast(0.65) brightness(1.25) saturate(0.4) sepia(0.1)",
      label: "RAW CAMERA S-LOG3 (FLAT / UNGRADED)",
      tag: "S-LOG3 FLAT / LOGC"
    }
  };

  function renderWaveformScope(exp, contrast, warmth, sat, lutKey) {
    if (!waveformCanvas) return;
    const ctx = waveformCanvas.getContext('2d');
    if (!ctx) return;

    const w = waveformCanvas.width;
    const h = waveformCanvas.height;

    // Clear background
    ctx.fillStyle = "#06080c";
    ctx.fillRect(0, 0, w, h);

    // Draw IRE reference grid lines
    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.lineWidth = 1;
    [0.1, 0.3, 0.5, 0.7, 0.9].forEach(yPct => {
      ctx.beginPath();
      ctx.moveTo(0, h * yPct);
      ctx.lineTo(w, h * yPct);
      ctx.stroke();
    });

    // Draw Simulated RGB Parade / Waveform columns (Red, Green, Blue)
    const channels = [
      { name: 'R', color: 'rgba(235, 87, 87, 0.75)', offset: 0, mult: lutKey === 'salaar' ? 1.3 : 1.0 },
      { name: 'G', color: 'rgba(39, 174, 96, 0.75)', offset: w / 3, mult: lutKey === 'salaar' ? 0.35 : 1.0 },
      { name: 'B', color: 'rgba(212, 146, 42, 0.75)', offset: (w / 3) * 2, mult: lutKey === 'salaar' ? 0.4 : 1.0 }
    ];

    const colWidth = w / 3 - 6;

    channels.forEach(ch => {
      ctx.fillStyle = ch.color;
      // Draw 60 procedural frequency columns per channel
      for (let i = 0; i < 60; i++) {
        const x = ch.offset + 3 + (i / 60) * colWidth;

        // Calculate baseline curve affected by exposure and contrast
        let baseIre = 0.5 + exp * 0.15;
        let cSpread = (contrast - 0.5) * 0.45;

        let yMin, yMax;
        if (lutKey === 'salaar') {
          // In Salaar, shadows are crushed deep to 0-10 IRE (soot/charcoal)
          // Highlights flare up to 85-95 IRE (amber embers and rim lights on Prabhas)
          const isHighlightSpike = i > 40 && i < 52;
          yMin = isHighlightSpike ? h * 0.12 : h * (0.65 + Math.random() * 0.28);
          yMax = h * 0.95;
        } else if (lutKey === 'flat') {
          // Flat log compresses between 25 IRE and 75 IRE
          yMin = h * 0.35;
          yMax = h * 0.68;
        } else {
          // Standard film grade
          const norm = Math.sin(i * 0.15) * 0.25;
          yMin = Math.max(h * 0.08, h * (baseIre - cSpread + norm * 0.2));
          yMax = Math.min(h * 0.95, h * (baseIre + cSpread + Math.random() * 0.15));
        }

        const barHeight = Math.max(2, yMax - yMin);
        ctx.fillRect(x, yMin, 2.2, barHeight);
      }
    });

    // Draw Channel Labels
    ctx.font = "9px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.fillText("R-PARADE", 10, 16);
    ctx.fillText("G-PARADE", w / 3 + 10, 16);
    ctx.fillText(lutKey === 'salaar' ? "AMBER-EMBER" : "B-PARADE", (w / 3) * 2 + 10, 16);
  }

  function applyActiveGrade() {
    const exp = parseFloat(expSlider ? expSlider.value : 0);
    const contrast = parseFloat(contrastSlider ? contrastSlider.value : 1.0);
    const warmth = parseInt(warmthSlider ? warmthSlider.value : 0);
    const sat = parseInt(satSlider ? satSlider.value : 100);

    if (valExp) valExp.textContent = `${exp >= 0 ? '+' : ''}${exp.toFixed(1)} EV`;
    if (valContrast) valContrast.textContent = `${contrast.toFixed(2)}x`;
    if (valWarmth) valWarmth.textContent = `${5600 + warmth * 40}K`;
    if (valSat) valSat.textContent = `${sat}%`;

    if (afterImg) {
      const sepiaVal = warmth > 0 ? (warmth / 100) * 0.3 : 0;
      const hueVal = warmth < 0 ? warmth * 0.4 : 0;
      const brightVal = 1.0 + exp * 0.2;
      const satVal = sat / 100;

      afterImg.style.filter = `
        contrast(${contrast})
        brightness(${brightVal})
        saturate(${satVal})
        ${sepiaVal > 0 ? `sepia(${sepiaVal})` : ''}
        ${hueVal !== 0 ? `hue-rotate(${hueVal}deg)` : ''}
      `.trim();
    }

    renderWaveformScope(exp, contrast, warmth, sat, activeLut);
  }

  // Hook up LUT pills
  lutPills.forEach(pill => {
    pill.addEventListener('click', () => {
      if (typeof playClickSound === 'function') playClickSound('click');
      lutPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');

      const lutKey = pill.getAttribute('data-lut');
      activeLut = lutKey;
      const cfg = LUT_PRESET_CONFIGS[lutKey] || LUT_PRESET_CONFIGS.kodak;

      if (expSlider) expSlider.value = cfg.exp;
      if (contrastSlider) contrastSlider.value = cfg.contrast;
      if (warmthSlider) warmthSlider.value = cfg.warmth;
      if (satSlider) satSlider.value = cfg.sat;

      if (rightLabel) rightLabel.textContent = cfg.label;
      if (scopeTag) scopeTag.textContent = cfg.tag;

      applyActiveGrade();
    });
  });

  if (expSlider) expSlider.addEventListener('input', applyActiveGrade);
  if (contrastSlider) contrastSlider.addEventListener('input', applyActiveGrade);
  if (warmthSlider) warmthSlider.addEventListener('input', applyActiveGrade);
  if (satSlider) satSlider.addEventListener('input', applyActiveGrade);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (typeof playClickSound === 'function') playClickSound('click');
      const defaultBtn = document.querySelector('.lut-pill[data-lut="kodak"]');
      if (defaultBtn) defaultBtn.click();
    });
  }

  if (toggleGrainBtn) {
    toggleGrainBtn.addEventListener('click', () => {
      if (typeof playClickSound === 'function') playClickSound('click');
      filmGrainActive = !filmGrainActive;
      toggleGrainBtn.classList.toggle('active', filmGrainActive);
      toggleGrainBtn.style.color = filmGrainActive ? 'var(--accent-gold)' : '';
      if (afterImg) {
        afterImg.style.mixBlendMode = filmGrainActive ? 'luminosity' : 'normal';
      }
    });
  }

  // Initial draw
  applyActiveGrade();
}

// ============================================================================
// STEP 7: JARGON DECODER & GLOSSARY
// ============================================================================
function setupGlossaryDecoder() {
  const searchInput = document.getElementById('glossary-search');
  const clearBtn = document.getElementById('clear-search-btn');
  const catButtons = document.querySelectorAll('.glossary-cat-btn');
  const grid = document.getElementById('glossary-grid');

  const matchBadge = document.getElementById('glossary-match-count');

  let activeCat = 'all';

  function highlightMatch(text, query) {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark class="gloss-highlight">$1</mark>');
  }

  function renderGlossary() {
    if (!grid) return;
    const query = (searchInput ? searchInput.value : '').toLowerCase().trim();

    const filtered = GLOSSARY_DATA.filter(item => {
      const matchCat = activeCat === 'all' || item.cat === activeCat;
      const matchQuery = !query || 
        item.term.toLowerCase().includes(query) || 
        item.def.toLowerCase().includes(query) ||
        item.origin.toLowerCase().includes(query);
      return matchCat && matchQuery;
    });

    if (matchBadge) {
      matchBadge.textContent = query 
        ? `${filtered.length} of ${GLOSSARY_DATA.length} Terms`
        : `${filtered.length} Terms Available`;
    }

    if (filtered.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1; text-align:center; padding:3rem; color:var(--text-muted);">
          <i class="fa-solid fa-magnifying-glass" style="font-size:2rem; margin-bottom:0.8rem; display:block; opacity:0.3;"></i>
          No filmmaking terms found matching "<strong>${query}</strong>". Try searching for "C-47", "Martini", "Stinger", or "LUT".
        </div>
      `;
      return;
    }

    grid.innerHTML = filtered.map(item => `
      <div class="glossary-card">
        <div>
          <div class="glossary-top">
            <span class="glossary-term">${highlightMatch(item.term, query)}</span>
            <span class="badge">${item.cat.toUpperCase()}</span>
          </div>
          <p class="glossary-def">${highlightMatch(item.def, query)}</p>
        </div>
        <div class="glossary-origin">
          <i class="fa-solid fa-history"></i> Context: ${highlightMatch(item.origin, query)}
        </div>
      </div>
    `).join('');
  }

  if (searchInput) {
    searchInput.addEventListener('input', renderGlossary);
    searchInput.addEventListener('keyup', renderGlossary);
  }
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      renderGlossary();
      searchInput.focus();
    });
  }

  catButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      playClickSound('click');
      catButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeCat = btn.getAttribute('data-category');
      renderGlossary();
    });
  });

  renderGlossary();
}

// ============================================================================
// STEP 8: PRE-FLIGHT AUDIT CHECKLIST
// ============================================================================
function setupChecklist() {
  const container = document.getElementById('checklist-container');
  const fillBar = document.getElementById('progress-fill');
  const percentText = document.getElementById('checklist-percentage');
  const countDoneText = document.getElementById('checklist-completed-count');
  const countTotalText = document.getElementById('checklist-total-count');
  const resetBtn = document.getElementById('reset-checklist-btn');
  const filterTabs = document.querySelectorAll('.check-tab-btn');

  let activeCheckCat = 'all';
  let checkedState = JSON.parse(localStorage.getItem('craft_cinema_checklist') || '{}');

  const radialCircle = document.getElementById('radial-progress-circle');
  const statusTitle = document.getElementById('checklist-status-title');
  let hasTriggeredConfetti = false;

  function updateProgress() {
    const total = CHECKLIST_DATA.length;
    let completed = 0;
    CHECKLIST_DATA.forEach(item => {
      if (checkedState[item.id]) completed++;
    });

    const percent = Math.round((completed / total) * 100);
    if (fillBar) fillBar.style.width = `${percent}%`;
    if (percentText) percentText.textContent = `${percent}%`;
    if (countDoneText) countDoneText.textContent = completed;
    if (countTotalText) countTotalText.textContent = total;

    // Animate Radial SVG Circle (circumference = 289px)
    if (radialCircle) {
      const offset = 289 - (289 * percent) / 100;
      radialCircle.style.strokeDashoffset = offset;
    }

    if (statusTitle) {
      if (percent === 100) {
        statusTitle.textContent = "🏆 100% AUDIT READY: PRODUCTION GREENLIT!";
        statusTitle.style.color = "var(--accent-gold)";
        if (!hasTriggeredConfetti) {
          hasTriggeredConfetti = true;
          launchCelebrationConfetti();
        }
      } else if (percent >= 60) {
        statusTitle.textContent = "ADVANCED PRE-FLIGHT VERIFIED";
        statusTitle.style.color = "var(--accent-sienna)";
        hasTriggeredConfetti = false;
      } else {
        statusTitle.textContent = "PRE-FLIGHT AUDIT IN PROGRESS";
        statusTitle.style.color = "var(--text-primary)";
        hasTriggeredConfetti = false;
      }
    }
  }

  function renderChecklist() {
    if (!container) return;

    const filtered = activeCheckCat === 'all'
      ? CHECKLIST_DATA
      : CHECKLIST_DATA.filter(i => i.cat === activeCheckCat);

    container.innerHTML = filtered.map(item => {
      const isChecked = !!checkedState[item.id];
      return `
        <div class="check-item-card ${isChecked ? 'completed' : ''}" data-item-id="${item.id}">
          <input type="checkbox" class="check-checkbox" ${isChecked ? 'checked' : ''} aria-label="${item.title}">
          <div class="check-content">
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
            <span class="check-cat-pill">#${item.cat.toUpperCase()} PROTOCOL</span>
          </div>
        </div>
      `;
    }).join('');

    document.querySelectorAll('.check-item-card').forEach(card => {
      card.addEventListener('click', (e) => {
        const id = card.getAttribute('data-item-id');
        const checkbox = card.querySelector('.check-checkbox');
        if (e.target !== checkbox) {
          checkbox.checked = !checkbox.checked;
        }
        checkedState[id] = checkbox.checked;
        localStorage.setItem('craft_cinema_checklist', JSON.stringify(checkedState));
        playClickSound(checkbox.checked ? 'click' : 'click');
        card.classList.toggle('completed', checkbox.checked);
        updateProgress();
      });
    });

    updateProgress();
  }

  filterTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playClickSound('click');
      filterTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      activeCheckCat = tab.getAttribute('data-check-cat');
      renderChecklist();
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Reset your entire pre-flight checklist verification score?')) {
        playClickSound('click');
        checkedState = {};
        localStorage.removeItem('craft_cinema_checklist');
        renderChecklist();
      }
    });
  }

  renderChecklist();
}

// ============================================================================
// CELEBRATION CONFETTI & FANFARE UPON 100% PRE-FLIGHT AUDIT
// ============================================================================
function playCelebrationChime() {
  if (typeof soundEnabled !== 'undefined' && !soundEnabled) return;
  if (typeof audioCtx === 'undefined' || !audioCtx) return;
  try {
    if (audioCtx.state === 'suspended') audioCtx.resume();
    const now = audioCtx.currentTime;
    // 4-note ascending fanfare: C5 (523Hz), E5 (659Hz), G5 (784Hz), C6 (1046Hz)
    const notes = [
      { freq: 523.25, time: 0, dur: 0.22, vol: 0.18 },
      { freq: 659.25, time: 0.13, dur: 0.22, vol: 0.20 },
      { freq: 783.99, time: 0.26, dur: 0.25, vol: 0.24 },
      { freq: 1046.50, time: 0.40, dur: 1.2, vol: 0.30 }
    ];

    notes.forEach(n => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(n.freq, now + n.time);
      gain.gain.setValueAtTime(0.001, now + n.time);
      gain.gain.linearRampToValueAtTime(n.vol, now + n.time + 0.03);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + n.time + n.dur);
      osc.connect(gain);
      if (typeof audioAnalyser !== 'undefined' && audioAnalyser) {
        gain.connect(audioAnalyser);
      } else {
        gain.connect(audioCtx.destination);
      }
      osc.start(now + n.time);
      osc.stop(now + n.time + n.dur);
    });
  } catch (err) {
    console.warn("Celebration audio notice:", err);
  }
}

function launchCelebrationConfetti() {
  playCelebrationChime();
  const canvas = document.getElementById('confetti-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const w = (canvas.width = window.innerWidth);
  const h = (canvas.height = window.innerHeight);
  canvas.style.display = 'block';

  // Warm cinematic palette: Amber, Gold, Sienna, Parchment, and Sparkling White
  const colors = [
    '#d4922a', '#f5c469', '#ffd700', '#c0571a', '#e67e22',
    '#ffffff', '#f7f2ea', '#e8dcce', '#b83232'
  ];

  const particles = [];
  const count = 160;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: w * (0.35 + Math.random() * 0.3),
      y: h * (0.35 + Math.random() * 0.2),
      vx: (Math.random() - 0.5) * 18,
      vy: -Math.random() * 15 - 5,
      w: Math.random() * 10 + 6,
      h: Math.random() * 6 + 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      rotation: Math.random() * 360,
      rotSpeed: (Math.random() - 0.5) * 14,
      tilt: Math.random() * 10,
      tiltSpeed: Math.random() * 0.12 + 0.05,
      shape: Math.random() > 0.35 ? 'rect' : 'circle',
      decay: 0.0035 + Math.random() * 0.003
    });
  }

  const startTime = performance.now();
  let animId = null;

  function renderConfetti(time) {
    const elapsed = time - startTime;
    ctx.clearRect(0, 0, w, h);

    let activeCount = 0;
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.32; // Gravity
      p.vx *= 0.99; // Air friction
      p.rotation += p.rotSpeed;
      p.tilt += p.tiltSpeed;
      p.alpha -= p.decay;

      if (p.alpha > 0 && p.y < h + 40) {
        activeCount++;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.scale(Math.cos(p.tilt), 1);
        ctx.globalAlpha = Math.max(0, p.alpha);

        if (p.shape === 'rect') {
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        } else {
          ctx.fillStyle = p.color;
          ctx.beginPath();
          ctx.arc(0, 0, p.w / 2.5, 0, Math.PI * 2);
          ctx.fill();
        }

        ctx.restore();
      }
    });

    if (activeCount > 0 && elapsed < 4200) {
      animId = requestAnimationFrame(renderConfetti);
    } else {
      ctx.clearRect(0, 0, w, h);
      canvas.style.display = 'none';
      if (animId) cancelAnimationFrame(animId);
    }
  }

  animId = requestAnimationFrame(renderConfetti);
}

// ============================================================================
// CINEMATIC SOUNDTRACK SCORE ENGINE (PROCEDURAL MOVIE MUSIC)
// Themes: Salaar War Suite, Interstellar Cosmos, Oppenheimer Tension, Blade Runner
// ============================================================================
let scorePlaying = false;
let currentScoreTheme = 'salaar';
let scoreMasterGain = null;
let scoreNodes = [];
let scoreIntervals = [];
let hasUserTriggeredScore = false;

const SCORE_THEME_INFO = {
  salaar: {
    title: "SALAAR: Khansaar War Suite",
    desc: "Ravi Basrur Style • Sub-bass Drone, War Drums & Dark Braaams",
    icon: "fa-fire"
  },
  interstellar: {
    title: "INTERSTELLAR: Time & Cosmos",
    desc: "Hans Zimmer Style • 24 BPM Ticking Clock & Cathedral Arpeggio",
    icon: "fa-atom"
  },
  oppenheimer: {
    title: "OPPENHEIMER: Chain Reaction",
    desc: "Ludwig Göransson Style • Rapid Staccato Tension & Crescendo",
    icon: "fa-bolt"
  },
  bladerunner: {
    title: "BLADE RUNNER 2049: Neon Tears",
    desc: "Vangelis CS-80 Brass Swells & Atmospheric Reverb",
    icon: "fa-city"
  }
};

function setupCinematicSoundtrackEngine() {
  const hud = document.getElementById('soundtrack-hud');
  const pillBtn = document.getElementById('soundtrack-pill');
  const playBtn = document.getElementById('score-play-btn');
  const playIcon = document.getElementById('score-play-icon');
  const titleEl = document.getElementById('score-active-title');
  const discIcon = document.getElementById('score-disc-icon');
  const volSlider = document.getElementById('soundtrack-vol-slider');
  const trackOpts = document.querySelectorAll('.score-track-opt');
  const floatScoreBtn = document.getElementById('floating-score-btn');
  const floatScoreText = document.getElementById('floating-score-text');

  function updateHUDState() {
    if (!hud) return;
    hud.classList.toggle('playing', scorePlaying);
    if (playIcon) {
      playIcon.className = scorePlaying ? 'fa-solid fa-pause' : 'fa-solid fa-play';
    }
    if (discIcon) {
      discIcon.classList.toggle('fa-spin-slow', scorePlaying);
    }
    if (titleEl && SCORE_THEME_INFO[currentScoreTheme]) {
      titleEl.textContent = SCORE_THEME_INFO[currentScoreTheme].title;
    }
    if (floatScoreBtn) {
      floatScoreBtn.classList.toggle('active', scorePlaying);
      floatScoreBtn.classList.toggle('playing', scorePlaying);
    }
    if (floatScoreText) {
      floatScoreText.textContent = scorePlaying ? 'PLAYING (SALAAR)' : 'SALAAR BGM';
    }
  }

  function startScore(theme = currentScoreTheme) {
    initAudioContext();
    if (!audioCtx) return;
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    stopScoreNodes();
    currentScoreTheme = theme;

    if (!scoreMasterGain) {
      scoreMasterGain = audioCtx.createGain();
      const sliderVal = volSlider ? parseInt(volSlider.value) : 65;
      scoreMasterGain.gain.setValueAtTime((sliderVal / 100) * 0.42, audioCtx.currentTime);
      if (audioAnalyser) scoreMasterGain.connect(audioAnalyser);
      else scoreMasterGain.connect(audioCtx.destination);
    }

    const now = audioCtx.currentTime;
    scoreMasterGain.gain.cancelScheduledValues(now);
    scoreMasterGain.gain.setValueAtTime(0.001, now);
    const targetVol = ((volSlider ? parseInt(volSlider.value) : 65) / 100) * 0.42;
    scoreMasterGain.gain.linearRampToValueAtTime(targetVol, now + 1.8);

    if (theme === 'salaar') {
      playSalaarSuite();
    } else if (theme === 'interstellar') {
      playInterstellarSuite();
    } else if (theme === 'oppenheimer') {
      playOppenheimerSuite();
    } else if (theme === 'bladerunner') {
      playBladeRunnerSuite();
    }

    scorePlaying = true;
    updateHUDState();
    showFilmToast(`🎬 CINEMATIC AMBIENCE // Playing: ${SCORE_THEME_INFO[theme].title}`, SCORE_THEME_INFO[theme].icon);
  }

  function stopScore() {
    if (!scoreMasterGain || !audioCtx) {
      stopScoreNodes();
      scorePlaying = false;
      updateHUDState();
      return;
    }
    const now = audioCtx.currentTime;
    scoreMasterGain.gain.cancelScheduledValues(now);
    scoreMasterGain.gain.linearRampToValueAtTime(0.0001, now + 0.6);
    setTimeout(() => {
      stopScoreNodes();
      scorePlaying = false;
      updateHUDState();
    }, 620);
  }

  function stopScoreNodes() {
    scoreIntervals.forEach(id => clearInterval(id));
    scoreIntervals = [];

    scoreNodes.forEach(node => {
      try {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      } catch (e) {}
    });
    scoreNodes = [];
  }

  // 1. SALAAR: Khansaar War Suite (Authentic Ravi Basrur Battle Motif, War Drums & Anvil)
  function playSalaarSuite() {
    const now = audioCtx.currentTime;

    // Sub-bass cinematic floor: D1 (36.7Hz) + D2 (73.4Hz)
    const droneOsc1 = audioCtx.createOscillator();
    const droneOsc2 = audioCtx.createOscillator();
    const droneFilter = audioCtx.createBiquadFilter();
    const droneGain = audioCtx.createGain();

    droneOsc1.type = 'sawtooth';
    droneOsc1.frequency.setValueAtTime(36.71, now); // D1
    droneOsc2.type = 'triangle';
    droneOsc2.frequency.setValueAtTime(73.42, now); // D2

    droneFilter.type = 'lowpass';
    droneFilter.frequency.setValueAtTime(120, now);
    droneFilter.Q.setValueAtTime(4.0, now);

    droneGain.gain.setValueAtTime(0.4, now);

    droneOsc1.connect(droneFilter);
    droneOsc2.connect(droneFilter);
    droneFilter.connect(droneGain);
    droneGain.connect(scoreMasterGain);

    droneOsc1.start(now);
    droneOsc2.start(now);
    scoreNodes.push(droneOsc1, droneOsc2, droneFilter, droneGain);

    // Warm D-Minor Pad chords (D3 146.8Hz, F3 174.6Hz, A3 220Hz)
    [146.83, 174.61, 220.00].forEach((freq, idx) => {
      const padOsc = audioCtx.createOscillator();
      const padGain = audioCtx.createGain();
      const padFilter = audioCtx.createBiquadFilter();

      padOsc.type = 'sawtooth';
      padOsc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.35 : -0.35), now);

      padFilter.type = 'lowpass';
      padFilter.frequency.setValueAtTime(280, now);

      padGain.gain.setValueAtTime(0.12, now);

      padOsc.connect(padFilter);
      padFilter.connect(padGain);
      padGain.connect(scoreMasterGain);

      padOsc.start(now);
      scoreNodes.push(padOsc, padGain, padFilter);
    });

    // Repeating Salaar Tribal War Drum & Iron Anvil Rhythm (72 BPM)
    let beatCount = 0;
    const warInterval = setInterval(() => {
      if (!scorePlaying || !audioCtx) return;
      const t = audioCtx.currentTime;

      // Hit 1: Heavy Primary War Drum Kick (Sub-drop 130Hz -> 35Hz)
      const kickOsc1 = audioCtx.createOscillator();
      const kickGain1 = audioCtx.createGain();
      kickOsc1.type = 'sine';
      kickOsc1.frequency.setValueAtTime(130, t);
      kickOsc1.frequency.exponentialRampToValueAtTime(35, t + 0.25);
      kickGain1.gain.setValueAtTime(0.65, t);
      kickGain1.gain.exponentialRampToValueAtTime(0.001, t + 0.42);
      kickOsc1.connect(kickGain1);
      kickGain1.connect(scoreMasterGain);
      kickOsc1.start(t);
      kickOsc1.stop(t + 0.42);

      // Hit 2: Syncopated Secondary War Drum Slam on beat 1.5 ("DUM... da-DUM")
      setTimeout(() => {
        if (!scorePlaying || !audioCtx) return;
        const t2 = audioCtx.currentTime;
        const kickOsc2 = audioCtx.createOscillator();
        const kickGain2 = audioCtx.createGain();
        kickOsc2.type = 'triangle';
        kickOsc2.frequency.setValueAtTime(95, t2);
        kickOsc2.frequency.exponentialRampToValueAtTime(32, t2 + 0.2);
        kickGain2.gain.setValueAtTime(0.48, t2);
        kickGain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.35);
        kickOsc2.connect(kickGain2);
        kickGain2.connect(scoreMasterGain);
        kickOsc2.start(t2);
        kickOsc2.stop(t2 + 0.35);
      }, 340);

      // Hit 3: Authentic Coal-Mine Sledgehammer Anvil Clang (High metallic ring)
      setTimeout(() => {
        if (!scorePlaying || !audioCtx) return;
        const t3 = audioCtx.currentTime;
        [1420, 2180, 3400].forEach((aFreq, aIdx) => {
          const aOsc = audioCtx.createOscillator();
          const aGain = audioCtx.createGain();
          aOsc.type = aIdx === 0 ? 'sine' : 'square';
          aOsc.frequency.setValueAtTime(aFreq, t3);
          aGain.gain.setValueAtTime(0.08 / (aIdx + 1), t3);
          aGain.gain.exponentialRampToValueAtTime(0.0001, t3 + 0.22);
          aOsc.connect(aGain);
          aGain.connect(scoreMasterGain);
          aOsc.start(t3);
          aOsc.stop(t3 + 0.22);
        });
      }, 540);

      // The Salaar Battle Chant Melody Ostinato (D3 -> F3 -> D3 -> G3 -> F3 -> E3 -> D3)
      const salaarMotif = [146.83, 174.61, 146.83, 196.00, 174.61, 164.81, 146.83];
      const noteFreq = salaarMotif[beatCount % salaarMotif.length];
      const leadOsc = audioCtx.createOscillator();
      const leadFilter = audioCtx.createBiquadFilter();
      const leadGain = audioCtx.createGain();

      leadOsc.type = 'sawtooth';
      leadOsc.frequency.setValueAtTime(noteFreq, t);

      leadFilter.type = 'lowpass';
      leadFilter.frequency.setValueAtTime(450, t);
      leadFilter.Q.setValueAtTime(3.0, t);

      leadGain.gain.setValueAtTime(0.001, t);
      leadGain.gain.linearRampToValueAtTime(0.18, t + 0.08);
      leadGain.gain.exponentialRampToValueAtTime(0.001, t + 0.7);

      leadOsc.connect(leadFilter);
      leadFilter.connect(leadGain);
      leadGain.connect(scoreMasterGain);

      leadOsc.start(t);
      leadOsc.stop(t + 0.7);

      // Massive Hollywood / Ravi Basrur BRAAAM Horn swell every 4 bars (~6.8s)
      if (beatCount % 4 === 0) {
        [73.42, 110.0, 146.83].forEach((bFreq) => {
          const bOsc = audioCtx.createOscillator();
          const bFilter = audioCtx.createBiquadFilter();
          const bGain = audioCtx.createGain();

          bOsc.type = 'sawtooth';
          bOsc.frequency.setValueAtTime(bFreq, t);

          bFilter.type = 'lowpass';
          bFilter.frequency.setValueAtTime(140, t);
          bFilter.frequency.exponentialRampToValueAtTime(1100, t + 0.4);
          bFilter.frequency.exponentialRampToValueAtTime(150, t + 2.6);

          bGain.gain.setValueAtTime(0.001, t);
          bGain.gain.linearRampToValueAtTime(0.32, t + 0.35);
          bGain.gain.exponentialRampToValueAtTime(0.0001, t + 3.0);

          bOsc.connect(bFilter);
          bFilter.connect(bGain);
          bGain.connect(scoreMasterGain);

          bOsc.start(t);
          bOsc.stop(t + 3.0);
        });
      }

      beatCount++;
    }, 1700);

    scoreIntervals.push(warInterval);
  }

  // 2. INTERSTELLAR: Time & Cosmos (Hans Zimmer 24 BPM Ticking & Organ)
  function playInterstellarSuite() {
    const chords = [
      [146.83, 220.00, 261.63], // Dm
      [116.54, 174.61, 233.08], // Bb
      [130.81, 196.00, 261.63], // C
      [110.00, 164.81, 220.00]  // Am
    ];

    let chordIdx = 0;
    const chordInterval = setInterval(() => {
      if (!scorePlaying || !audioCtx) return;
      const t = audioCtx.currentTime;
      const notes = chords[chordIdx % chords.length];

      notes.forEach(f => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(f, t);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.18, t + 1.2);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 3.8);
        osc.connect(gain);
        gain.connect(scoreMasterGain);
        osc.start(t);
        osc.stop(t + 3.8);
      });

      chordIdx++;
    }, 4000);

    // 24 BPM Ticking Clock
    const tickInterval = setInterval(() => {
      if (!scorePlaying || !audioCtx) return;
      const t = audioCtx.currentTime;
      const tick = audioCtx.createOscillator();
      const tGain = audioCtx.createGain();
      tick.type = 'square';
      tick.frequency.setValueAtTime(1800, t);
      tGain.gain.setValueAtTime(0.06, t);
      tGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.02);
      tick.connect(tGain);
      tGain.connect(scoreMasterGain);
      tick.start(t);
      tick.stop(t + 0.02);
    }, 500);

    scoreIntervals.push(chordInterval, tickInterval);
  }

  // 3. OPPENHEIMER: Chain Reaction (Accelerating Tension Strings)
  function playOppenheimerSuite() {
    const notes = [392.00, 466.16, 587.33, 622.25, 739.99]; // G4, Bb4, D5, Eb5, F#5
    let noteIdx = 0;

    const arpInterval = setInterval(() => {
      if (!scorePlaying || !audioCtx) return;
      const t = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(notes[noteIdx % notes.length], t);

      gain.gain.setValueAtTime(0.14, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.16);

      osc.connect(gain);
      gain.connect(scoreMasterGain);
      osc.start(t);
      osc.stop(t + 0.16);

      noteIdx++;
    }, 180);

    scoreIntervals.push(arpInterval);
  }

  // 4. BLADE RUNNER 2049: Neon Tears (Vangelis CS-80 Synth)
  function playBladeRunnerSuite() {
    const chords = [
      [130.81, 164.81, 196.00, 246.94], // Cmaj7
      [116.54, 146.83, 174.61, 220.00]  // Bbmaj7
    ];

    let bIdx = 0;
    const brInterval = setInterval(() => {
      if (!scorePlaying || !audioCtx) return;
      const t = audioCtx.currentTime;
      const chord = chords[bIdx % chords.length];

      chord.forEach(f => {
        const osc1 = audioCtx.createOscillator();
        const osc2 = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc1.type = 'sawtooth';
        osc1.frequency.setValueAtTime(f, t);
        osc2.type = 'sawtooth';
        osc2.frequency.setValueAtTime(f * 1.004, t); // Chorus detune

        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.12, t + 2.0);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + 5.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(scoreMasterGain);

        osc1.start(t);
        osc2.start(t);
        osc1.stop(t + 5.8);
        osc2.stop(t + 5.8);
      });

      bIdx++;
    }, 6000);

    scoreIntervals.push(brInterval);
  }

  // Event Listeners for UI
  if (pillBtn) {
    pillBtn.addEventListener('click', (e) => {
      if (e.target.closest('#score-play-btn')) return;
      hud.classList.toggle('open');
    });
  }

  if (playBtn) {
    playBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (scorePlaying) {
        stopScore();
      } else {
        startScore(currentScoreTheme);
      }
    });
  }

  if (floatScoreBtn) {
    floatScoreBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (scorePlaying) {
        stopScore();
      } else {
        startScore('salaar');
      }
      if (typeof playClickSound === 'function') playClickSound('click');
    });
  }

  if (volSlider) {
    volSlider.addEventListener('input', (e) => {
      const vol = (parseInt(e.target.value) / 100) * 0.42;
      if (scoreMasterGain && audioCtx) {
        scoreMasterGain.gain.setValueAtTime(vol, audioCtx.currentTime);
      }
    });
  }

  trackOpts.forEach(btn => {
    btn.addEventListener('click', () => {
      trackOpts.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const scoreKey = btn.getAttribute('data-score');
      startScore(scoreKey);
      hud.classList.remove('open');
    });
  });

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    if (hud && !hud.contains(e.target)) {
      hud.classList.remove('open');
    }
  });

  // AUTO-PLAY ON FIRST USER INTERACTION (Browser Autoplay Policy Compliant)
  function handleFirstUserInteraction() {
    if (hasUserTriggeredScore) return;
    hasUserTriggeredScore = true;
    startScore('salaar');
    ['click', 'keydown', 'touchstart'].forEach(evt => {
      window.removeEventListener(evt, handleFirstUserInteraction);
    });
  }

  ['click', 'keydown', 'touchstart'].forEach(evt => {
    window.addEventListener(evt, handleFirstUserInteraction, { once: true, passive: true });
  });
}


