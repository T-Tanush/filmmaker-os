/**
 * CRAFT // CINEMA — Anti-Gravity City Street Cinematic Generator
 * Physics simulation of a bustling metropolitan street where gravity collapses.
 * Features: Floating yellow cabs, sedans, bicycles, street signs, scrambling pedestrians,
 * wind turbulence, debris, lens flares, camera angles, and interactive mouse-flinging.
 */

class GravityCityEngine {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    if (!this.canvas) return;
    this.ctx = this.canvas.getContext('2d');
    
    // Physics State
    this.gravity = 1.0;            // 1.0 = Normal, 0.0 = Zero-G, -0.8 = Inverted drift
    this.targetGravity = 1.0;
    this.isZeroG = false;
    this.timeScale = 1.0;          // 1.0 = 24fps, 0.2 = slow motion, 0.0 = pause
    this.cameraAngle = 'street';    // 'street', 'crane', 'tracking', 'pov'
    this.vfxPass = 'graded';        // 'graded', 'wireframe', 'rigging', 'clean'
    
    // Shake effect
    this.trauma = 0;
    
    // Interactive mouse drag
    this.draggedEntity = null;
    this.mouse = { x: 0, y: 0, isDown: false, prevX: 0, prevY: 0, vx: 0, vy: 0 };
    
    // Entity Collections
    this.cars = [];
    this.bikes = [];
    this.signs = [];
    this.pedestrians = [];
    this.debris = [];
    this.sparks = [];
    this.buildings = [];
    this.flares = [];
    this.hoverPos = { x: -100, y: -100 };
    
    // Audio synthesis node reference
    this.audioInitiated = false;
    
    this.initCanvasSize();
    this.initEnvironment();
    this.spawnInitialScene();
    this.bindEvents();
    
    // Start animation loop
    this.lastTime = performance.now();
    this.animate = this.animate.bind(this);
    requestAnimationFrame(this.animate);
  }

  initCanvasSize() {
    const rect = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.width = rect.width || 960;
    this.height = Math.round(this.width * (9 / 21)); // 2.39:1 Cinema Scope aspect ratio
    if (this.height < 360) this.height = 360;
    
    this.canvas.width = Math.round(this.width * dpr);
    this.canvas.height = Math.round(this.height * dpr);
    this.ctx.scale(dpr, dpr);
    this.groundY = this.height * 0.76;
  }

  initEnvironment() {
    // Generate background metropolitan skyscrapers
    this.buildings = [];
    const bldgCount = 22;
    let curX = -50;
    for (let i = 0; i < bldgCount; i++) {
      const w = 45 + Math.random() * 70;
      const h = this.height * 0.45 + Math.random() * (this.height * 0.4);
      const floors = Math.floor(h / 14);
      const cols = Math.floor(w / 12);
      
      const windows = [];
      for (let r = 0; r < floors; r++) {
        for (let c = 0; c < cols; c++) {
          if (Math.random() > 0.35) {
            windows.push({
              x: c * 12 + 4,
              y: r * 14 + 8,
              lit: Math.random() > 0.4,
              warmth: 0.5 + Math.random() * 0.5
            });
          }
        }
      }
      
      this.buildings.push({
        x: curX,
        y: this.groundY - h,
        w: w,
        h: h,
        depth: 0.3 + Math.random() * 0.4,
        windows: windows,
        colorTone: Math.random() > 0.5 ? '#181410' : '#14110d'
      });
      curX += w - 10;
    }
  }

  spawnInitialScene() {
    this.cars = [];
    this.bikes = [];
    this.signs = [];
    this.pedestrians = [];
    this.debris = [];

    // Yellow Cabs & Cars
    const carTypes = ['cab', 'sedan', 'cab', 'suv', 'coupe'];
    carTypes.forEach((type, i) => {
      this.spawnCar((i + 1) * (this.width / (carTypes.length + 1)) + (Math.random() * 60 - 30), type);
    });

    // Bicycles
    for (let i = 0; i < 3; i++) {
      this.spawnBike(140 + i * 260 + Math.random() * 60);
    }

    // Street Signs (5th Ave, Broadway, Stop, One Way)
    const signNames = ["5th AVE", "ONE WAY ➔", "BROADWAY", "STOP", "42nd ST"];
    signNames.forEach((text, i) => {
      this.spawnStreetSign(100 + i * (this.width / signNames.length), text);
    });

    // Pedestrians
    for (let i = 0; i < 14; i++) {
      this.spawnPedestrian(40 + Math.random() * (this.width - 80));
    }

    // Street Debris (Newspapers, Coffee Cups, Autumn Leaves)
    for (let i = 0; i < 40; i++) {
      this.spawnDebris();
    }
  }

  spawnCar(x, type = 'cab') {
    const isCab = type === 'cab';
    this.cars.push({
      x: x,
      y: this.groundY - 24,
      targetGroundY: this.groundY - 24,
      vx: 0,
      vy: 0,
      rot: 0,
      vrot: 0,
      w: 88 + Math.random() * 16,
      h: 28,
      type: type,
      color: isCab ? '#d4922a' : (Math.random() > 0.5 ? '#8c3d19' : '#383028'),
      roofSign: isCab,
      wheelRot: 0,
      lightsOn: true,
      mass: 1400,
      isFloating: false,
      stuntWireTension: 0
    });
  }

  spawnBike(x) {
    this.bikes.push({
      x: x,
      y: this.groundY - 18,
      targetGroundY: this.groundY - 18,
      vx: (Math.random() - 0.5) * 0.4,
      vy: 0,
      rot: 0,
      vrot: 0,
      size: 26,
      color: '#c0571a',
      wheelSpokes: 6,
      isFloating: false
    });
  }

  spawnStreetSign(x, text) {
    this.signs.push({
      x: x,
      y: this.groundY - 72,
      baseY: this.groundY - 72,
      vx: 0,
      vy: 0,
      rot: 0,
      vrot: 0,
      text: text,
      w: 64,
      h: 22,
      poleBroken: false,
      isFloating: false
    });
  }

  spawnPedestrian(x) {
    const isScrambler = Math.random() > 0.35;
    this.pedestrians.push({
      x: x,
      y: this.groundY - 4,
      targetGroundY: this.groundY - 4,
      vx: (Math.random() - 0.5) * 1.2,
      vy: 0,
      rot: 0,
      vrot: 0,
      state: 'walking', // 'walking', 'scrambling', 'floating', 'holding_post'
      direction: Math.random() > 0.5 ? 1 : -1,
      height: 28 + Math.random() * 6,
      shirtColor: Math.random() > 0.5 ? '#c0571a' : '#d4922a',
      pantsColor: '#201a14',
      runCycle: Math.random() * Math.PI * 2,
      armReaching: 0
    });
  }

  spawnDebris() {
    this.debris.push({
      x: Math.random() * this.width,
      y: this.groundY - Math.random() * 20,
      vx: (Math.random() - 0.5) * 1.5,
      vy: -Math.random() * 1.2,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 0.1,
      type: Math.random() > 0.5 ? 'paper' : (Math.random() > 0.5 ? 'cup' : 'leaf'),
      size: 4 + Math.random() * 6,
      color: Math.random() > 0.4 ? '#f2ede4' : '#d4922a',
      flutterPhase: Math.random() * Math.PI * 2,
      glow: 0
    });
  }

  spawnSparks(x, y, count = 10, color = '#f5c469') {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.2 + Math.random() * 4.0;
      this.sparks.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 0.4,
        size: 1.5 + Math.random() * 2.8,
        life: 1.0,
        decay: 1.2 + Math.random() * 1.5,
        color: Math.random() > 0.35 ? color : '#ffffff'
      });
    }
  }

  toggleGravity() {
    this.isZeroG = !this.isZeroG;
    this.targetGravity = this.isZeroG ? -0.75 : 1.0;
    this.trauma = Math.min(this.trauma + 0.8, 1.2);
    
    // Play cinematic sound if available
    this.triggerCinematicAudio(this.isZeroG ? 'collapse' : 'restore');
    
    // Update button states
    const btn = document.getElementById('gravity-collapse-btn');
    if (btn) {
      if (this.isZeroG) {
        btn.classList.add('active-collapse');
        btn.innerHTML = '<i class="fa-solid fa-arrows-down-to-line"></i> RESTORE GRAVITY (1.0G)';
      } else {
        btn.classList.remove('active-collapse');
        btn.innerHTML = '<i class="fa-solid fa-atom fa-spin"></i> TRIGGER GRAVITY COLLAPSE';
      }
    }

    const hudVal = document.getElementById('hud-gravity-val');
    if (hudVal) {
      hudVal.textContent = this.isZeroG ? "-0.75G (INVERTED)" : "+1.00G (EARTH)";
      hudVal.className = this.isZeroG ? "telem-val alert-pulse" : "telem-val gold";
    }

    // Give entities a gentle initial kick on inversion
    if (this.isZeroG) {
      this.cars.forEach((car, idx) => {
        car.vy = -0.5 - Math.random() * 1.2;
        car.vrot = (Math.random() - 0.5) * 0.008;
      });
      this.bikes.forEach(bike => {
        bike.vy = -1.0 - Math.random() * 1.5;
        bike.vrot = (Math.random() - 0.5) * 0.02;
      });
      this.signs.forEach(s => {
        s.poleBroken = true;
        s.vy = -0.6 - Math.random() * 0.8;
        s.vrot = (Math.random() - 0.5) * 0.015;
      });
      this.pedestrians.forEach((p, idx) => {
        if (idx % 2 === 0) {
          p.state = 'floating';
          p.vy = -0.4 - Math.random() * 0.7;
          p.vrot = (Math.random() - 0.5) * 0.01;
        } else {
          p.state = 'scrambling';
          p.direction = p.x < this.width / 2 ? -1 : 1;
        }
      });
      // Blast debris into turbulence
      this.debris.forEach(d => {
        d.vy = -2 - Math.random() * 3;
        d.vx = (Math.random() - 0.5) * 3;
      });
    } else {
      this.pedestrians.forEach(p => {
        if (p.state === 'floating') p.state = 'scrambling';
      });
    }
  }

  setGravity(val) {
    this.targetGravity = parseFloat(val);
    this.isZeroG = this.targetGravity < 0.2;
    const hudVal = document.getElementById('hud-gravity-val');
    if (hudVal) {
      hudVal.textContent = `${this.targetGravity >= 0 ? '+' : ''}${this.targetGravity.toFixed(2)}G`;
    }
  }

  setTimeScale(val) {
    this.timeScale = parseFloat(val);
    const label = document.getElementById('hud-fps-indicator');
    if (label) {
      if (this.timeScale === 1.0) label.textContent = "24.00 FPS [REALTIME]";
      else if (this.timeScale < 0.5 && this.timeScale > 0) label.textContent = "120 FPS [PHANTOM SLOW-MO]";
      else if (this.timeScale === 0) label.textContent = "FREEZE FRAME [0 FPS]";
      else if (this.timeScale < 0) label.textContent = "REVERSE TIMECODE";
    }
  }

  setCameraAngle(angle) {
    this.cameraAngle = angle;
    this.trauma = 0.4;
  }

  setVFXPass(pass) {
    this.vfxPass = pass;
  }

  spawnMoreChaos() {
    this.spawnCar(Math.random() * (this.width - 100) + 50, Math.random() > 0.5 ? 'cab' : 'sedan');
    this.spawnBike(Math.random() * (this.width - 60) + 30);
    this.spawnStreetSign(Math.random() * (this.width - 80) + 40, ["ONE WAY", "NO PARKING", "CAUTION", "CROSSWALK"][Math.floor(Math.random() * 4)]);
    this.spawnPedestrian(Math.random() * this.width);
    for (let i = 0; i < 20; i++) this.spawnDebris();
    this.trauma = 0.5;
    if (typeof showFilmToast === 'function') {
      showFilmToast('Spawned Extra Stunt Vehicles & Street Chaos', 'fa-car-burst');
    }
  }

  triggerCinematicAudio(type) {
    if (typeof playClickSound === 'function') {
      playClickSound('shutter');
    }
    // Sub-bass gravity rumble synthesizer using Web Audio API
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        if (!this.audioCtx) this.audioCtx = new AudioCtx();
        const ctx = this.audioCtx;
        if (ctx.state === 'suspended') ctx.resume();

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'sawtooth';
        if (type === 'collapse') {
          // Low sweeping cinematic drone
          osc.frequency.setValueAtTime(95, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(32, ctx.currentTime + 1.8);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(350, ctx.currentTime);
          filter.frequency.linearRampToValueAtTime(80, ctx.currentTime + 1.8);

          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 2.0);
        } else {
          // Slam impact when gravity returns
          osc.frequency.setValueAtTime(45, ctx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.3);
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(500, ctx.currentTime);

          gain.gain.setValueAtTime(0.4, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.9);
        }

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 2.1);
      }
    } catch (e) {
      // Audio fallback silent
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => {
      this.initCanvasSize();
      this.initEnvironment();
    });

    // Mouse drag physics & sparks
    this.canvas.addEventListener('mousedown', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - rect.left;
      this.mouse.y = e.clientY - rect.top;
      this.mouse.prevX = this.mouse.x;
      this.mouse.prevY = this.mouse.y;
      this.mouse.isDown = true;

      // Find entity to grab
      this.draggedEntity = this.findEntityAt(this.mouse.x, this.mouse.y);
      // Spawn sparks at click point
      this.spawnSparks(this.mouse.x, this.mouse.y, 14, '#f5c469');
    });

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas.getBoundingClientRect();
      this.hoverPos.x = e.clientX - rect.left;
      this.hoverPos.y = e.clientY - rect.top;

      // Check proximity with debris to light them up
      this.debris.forEach(d => {
        const dx = d.x - this.hoverPos.x;
        const dy = d.y - this.hoverPos.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 65) {
          d.glow = Math.min(1.0, (d.glow || 0) + 0.4);
          if (Math.random() > 0.85) {
            this.spawnSparks(d.x, d.y, 2, '#fff');
          }
        }
      });

      if (!this.mouse.isDown) return;
      const curX = this.hoverPos.x;
      const curY = this.hoverPos.y;
      this.mouse.vx = curX - this.mouse.prevX;
      this.mouse.vy = curY - this.mouse.prevY;
      this.mouse.prevX = curX;
      this.mouse.prevY = curY;
      this.mouse.x = curX;
      this.mouse.y = curY;

      if (this.draggedEntity) {
        this.draggedEntity.x = curX;
        this.draggedEntity.y = curY;
        this.draggedEntity.vx = this.mouse.vx * 0.4;
        this.draggedEntity.vy = this.mouse.vy * 0.4;
        this.draggedEntity.vrot = (Math.random() - 0.5) * 0.03;
        if (Math.random() > 0.6) {
          this.spawnSparks(curX, curY, 3, '#f5c469');
        }
      }
    });

    this.canvas.addEventListener('mouseleave', () => {
      this.hoverPos.x = -100;
      this.hoverPos.y = -100;
    });

    window.addEventListener('mouseup', () => {
      if (this.draggedEntity) {
        this.draggedEntity.vx = this.mouse.vx * 0.5;
        this.draggedEntity.vy = this.mouse.vy * 0.5;
        this.spawnSparks(this.draggedEntity.x, this.draggedEntity.y, 8, '#f5c469');
        this.draggedEntity = null;
      }
      this.mouse.isDown = false;
    });

    // Touch support
    this.canvas.addEventListener('touchstart', (e) => {
      if (e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.touches[0].clientX - rect.left;
        this.mouse.y = e.touches[0].clientY - rect.top;
        this.draggedEntity = this.findEntityAt(this.mouse.x, this.mouse.y);
      }
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      if (this.draggedEntity && e.touches.length > 0) {
        const rect = this.canvas.getBoundingClientRect();
        this.draggedEntity.x = e.touches[0].clientX - rect.left;
        this.draggedEntity.y = e.touches[0].clientY - rect.top;
      }
    }, { passive: true });

    this.canvas.addEventListener('touchend', () => {
      this.draggedEntity = null;
    });
  }

  findEntityAt(x, y) {
    // Check cars
    for (let c of this.cars) {
      if (Math.abs(c.x - x) < c.w / 2 && Math.abs(c.y - y) < c.h) return c;
    }
    // Check signs
    for (let s of this.signs) {
      if (Math.abs(s.x - x) < s.w / 2 && Math.abs(s.y - y) < 40) return s;
    }
    // Check bikes
    for (let b of this.bikes) {
      if (Math.abs(b.x - x) < b.size && Math.abs(b.y - y) < b.size) return b;
    }
    // Check pedestrians
    for (let p of this.pedestrians) {
      if (Math.abs(p.x - x) < 20 && Math.abs(p.y - y) < p.height) return p;
    }
    return null;
  }

  updatePhysics(dt) {
    // Smooth transition gravity
    this.gravity += (this.targetGravity - this.gravity) * 0.05;
    
    // Decay trauma shake
    if (this.trauma > 0) this.trauma = Math.max(0, this.trauma - dt * 1.2);

    const effGravity = this.gravity * dt * 32;

    // Update Cars
    this.cars.forEach(car => {
      if (car === this.draggedEntity) return;

      if (this.gravity < 0.2) {
        // Floating upward with gentle turbulence
        car.vy += (this.gravity - 0.2) * dt * 18;
        car.vy = Math.max(car.vy, -1.8);
        car.rot += car.vrot * dt * 60;
        car.vx += Math.sin(car.y * 0.02) * dt * 0.5;
        car.isFloating = true;
      } else {
        // Falling back to asphalt
        car.vy += effGravity * 1.5;
        if (car.y >= car.targetGroundY) {
          car.y = car.targetGroundY;
          car.vy = -car.vy * 0.15; // small bounce
          if (Math.abs(car.vy) < 0.2) car.vy = 0;
          car.rot += (0 - car.rot) * 0.2; // settle flat
          car.vrot *= 0.5;
          car.isFloating = false;
        }
      }

      car.x += car.vx * dt * 60 * this.timeScale;
      car.y += car.vy * dt * 60 * this.timeScale;

      // Wrap horizontal bounds
      if (car.x < -car.w) car.x = this.width + car.w;
      if (car.x > this.width + car.w) car.x = -car.w;
      
      // Prevent flying into outer space beyond view
      if (car.y < -80) {
        car.y = -80;
        car.vy = 0.2;
      }
    });

    // Update Bicycles
    this.bikes.forEach(bike => {
      if (bike === this.draggedEntity) return;
      if (this.gravity < 0.2) {
        bike.vy += (this.gravity - 0.3) * dt * 20;
        bike.vy = Math.max(bike.vy, -2.4);
        bike.rot += bike.vrot * dt * 60;
        bike.isFloating = true;
      } else {
        bike.vy += effGravity * 1.8;
        if (bike.y >= bike.targetGroundY) {
          bike.y = bike.targetGroundY;
          bike.vy = 0;
          bike.rot += (0 - bike.rot) * 0.25;
          bike.isFloating = false;
        }
      }
      bike.x += bike.vx * dt * 60 * this.timeScale;
      bike.y += bike.vy * dt * 60 * this.timeScale;
    });

    // Update Street Signs
    this.signs.forEach(sign => {
      if (sign === this.draggedEntity) return;
      if (this.gravity < 0.2) {
        sign.vy += (this.gravity - 0.2) * dt * 15;
        sign.rot += sign.vrot * dt * 60;
        sign.isFloating = true;
      } else {
        sign.vy += effGravity * 1.5;
        if (sign.y >= sign.baseY) {
          sign.y = sign.baseY;
          sign.vy = 0;
          sign.rot += (0 - sign.rot) * 0.2;
          sign.isFloating = false;
        }
      }
      sign.x += sign.vx * dt * 60 * this.timeScale;
      sign.y += sign.vy * dt * 60 * this.timeScale;
    });

    // Update Pedestrians
    this.pedestrians.forEach(p => {
      if (p === this.draggedEntity) return;
      p.runCycle += dt * 8 * Math.abs(p.vx);

      if (p.state === 'floating') {
        p.vy += (this.gravity - 0.15) * dt * 14;
        p.rot += p.vrot * dt * 60;
        p.armReaching = Math.sin(p.runCycle) * 0.4;
        p.x += p.vx * dt * 30 * this.timeScale;
        p.y += p.vy * dt * 60 * this.timeScale;

        if (this.gravity >= 0.8 && p.y >= p.targetGroundY) {
          p.y = p.targetGroundY;
          p.vy = 0;
          p.rot = 0;
          p.state = 'scrambling';
        }
      } else {
        // Scrambling on the ground for cover
        const runSpeed = p.state === 'scrambling' ? 2.8 : 0.8;
        p.vx = p.direction * runSpeed;
        p.x += p.vx * dt * 60 * this.timeScale;
        p.y = p.targetGroundY;

        // Wrap or turn around at street edges
        if (p.x < 15) { p.x = 15; p.direction = 1; }
        if (p.x > this.width - 15) { p.x = this.width - 15; p.direction = -1; }
      }
    });

    // Update Debris (Newspapers, coffee cups, particles)
    this.debris.forEach(d => {
      d.flutterPhase += dt * 6;
      if (d.glow > 0) d.glow = Math.max(0, d.glow - dt * 0.9);

      if (this.gravity < 0.2) {
        d.vy += (this.gravity - 0.4) * dt * 25;
        d.vy = Math.max(d.vy, -3.5);
        d.vx += Math.sin(d.flutterPhase) * dt * 4;
        d.rot += d.vrot * dt * 60;
      } else {
        d.vy += effGravity * 1.8;
        if (d.y >= this.groundY - 2) {
          d.y = this.groundY - 2;
          d.vy = 0;
          d.vx *= 0.85;
        }
      }
      d.x += d.vx * dt * 60 * this.timeScale;
      d.y += d.vy * dt * 60 * this.timeScale;

      if (d.x < 0) d.x = this.width;
      if (d.x > this.width) d.x = 0;
      if (d.y < -40) d.y = this.groundY + Math.random() * 20;
    });

    // Update Visual Sparks
    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const s = this.sparks[i];
      s.x += s.vx * dt * 60 * this.timeScale;
      s.y += s.vy * dt * 60 * this.timeScale;
      s.life -= s.decay * dt;
      if (s.life <= 0) {
        this.sparks.splice(i, 1);
      }
    }
  }

  render() {
    const ctx = this.ctx;
    ctx.save();

    // Camera shake calculation
    let shakeX = 0;
    let shakeY = 0;
    if (this.trauma > 0) {
      const shakeMag = Math.pow(this.trauma, 2) * 12;
      shakeX = (Math.random() - 0.5) * shakeMag;
      shakeY = (Math.random() - 0.5) * shakeMag;
    }

    // Apply Camera Perspective Transform
    ctx.translate(shakeX, shakeY);
    if (this.cameraAngle === 'crane') {
      ctx.translate(0, 30);
      ctx.scale(0.92, 0.92);
    } else if (this.cameraAngle === 'tracking') {
      const leadCar = this.cars[0] || { x: this.width / 2 };
      const offsetX = (this.width / 2 - leadCar.x) * 0.15;
      ctx.translate(offsetX, 0);
    } else if (this.cameraAngle === 'pov') {
      ctx.translate(0, -20);
      ctx.scale(1.08, 1.08);
    }

    // 1. Sky & Atmospheric Gradient (Warm Film Tones)
    this.renderSky(ctx);

    // 2. Metropolitan Skyline (Skyscrapers & glowing windows)
    this.renderSkyline(ctx);

    // 3. Asphalt Street, Sidewalks & Markings
    this.renderStreet(ctx);

    // 4. Ground Shadows of floating elements
    this.renderShadows(ctx);

    // 5. Entities (Cars, Bikes, Street Signs, Pedestrians, Debris)
    this.renderEntities(ctx);

    // 6. Volumetric Fog, Anamorphic Streak Lens Flares & Dust
    this.renderAtmosphere(ctx);

    // 7. Director's Viewfinder HUD & Safe Frame Guides
    this.renderDirectorHUD(ctx);

    ctx.restore();
  }

  renderSky(ctx) {
    const grad = ctx.createLinearGradient(0, 0, 0, this.height);
    if (document.documentElement.getAttribute('data-theme') === 'light') {
      grad.addColorStop(0, '#e5d7be');
      grad.addColorStop(0.5, '#ede0c8');
      grad.addColorStop(1, '#f5ecd8');
    } else {
      // Warm dark cinematic charcoal-amber twilight
      grad.addColorStop(0, '#0a0806');
      grad.addColorStop(0.4, '#14100c');
      grad.addColorStop(0.75, '#221910');
      grad.addColorStop(1, '#18120c');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, this.width, this.height);
  }

  renderSkyline(ctx) {
    // Distant background skyscrapers
    this.buildings.forEach(b => {
      ctx.save();
      ctx.fillStyle = b.colorTone;
      ctx.fillRect(b.x, b.y, b.w, b.h);

      // Glowing warm tungsten windows
      ctx.fillStyle = 'rgba(212, 146, 42, 0.45)';
      b.windows.forEach(w => {
        if (w.lit) {
          ctx.fillRect(b.x + w.x, b.y + w.y, 4, 6);
        }
      });

      // Rooftop water towers & antennae
      ctx.strokeStyle = '#282018';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(b.x + b.w * 0.5, b.y);
      ctx.lineTo(b.x + b.w * 0.5, b.y - 18);
      ctx.stroke();

      ctx.restore();
    });

    // Skyline mist line
    const mistGrad = ctx.createLinearGradient(0, this.groundY - 140, 0, this.groundY);
    mistGrad.addColorStop(0, 'rgba(212, 146, 42, 0)');
    mistGrad.addColorStop(1, 'rgba(212, 146, 42, 0.12)');
    ctx.fillStyle = mistGrad;
    ctx.fillRect(0, this.groundY - 140, this.width, 140);
  }

  renderStreet(ctx) {
    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    // Asphalt Pavement
    ctx.fillStyle = isLight ? '#d2c4aa' : '#100e0b';
    ctx.fillRect(0, this.groundY, this.width, this.height - this.groundY);

    // Sidewalk curb
    ctx.fillStyle = isLight ? '#b8a88c' : '#1e1a14';
    ctx.fillRect(0, this.groundY - 4, this.width, 5);

    // Road markings (Zebra Crosswalk)
    ctx.fillStyle = isLight ? 'rgba(80, 55, 25, 0.25)' : 'rgba(242, 237, 228, 0.18)';
    const zebraCount = 12;
    for (let i = 0; i < zebraCount; i++) {
      ctx.fillRect(this.width * 0.52 + i * 22, this.groundY + 8, 12, 38);
    }

    // Yellow Center Divider Line
    ctx.fillStyle = 'rgba(212, 146, 42, 0.45)';
    ctx.fillRect(0, this.groundY + 48, this.width, 3);
  }

  renderShadows(ctx) {
    // Dynamic soft shadows on the road that fade and expand as entities rise
    ctx.save();
    this.cars.forEach(car => {
      const distFromGround = Math.max(0, car.targetGroundY - car.y);
      const alpha = Math.max(0, 0.45 - (distFromGround / 250));
      const scaleX = 1 + distFromGround * 0.003;
      const shadowW = car.w * scaleX;

      if (alpha > 0.02) {
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(car.x, car.targetGroundY + 18, shadowW / 2, 7, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    this.signs.forEach(s => {
      const dist = Math.max(0, s.baseY - s.y);
      const alpha = Math.max(0, 0.3 - (dist / 200));
      if (alpha > 0.02) {
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.ellipse(s.x, s.baseY + 68, 18, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    ctx.restore();
  }

  renderEntities(ctx) {
    // 1. Street Signs
    this.signs.forEach(sign => this.drawStreetSign(ctx, sign));

    // 2. Pedestrians
    this.pedestrians.forEach(p => this.drawPedestrian(ctx, p));

    // 3. Bicycles
    this.bikes.forEach(bike => this.drawBike(ctx, bike));

    // 4. Cars & Yellow Taxis
    this.cars.forEach(car => this.drawCar(ctx, car));

    // 5. Floating Debris & Papers
    this.debris.forEach(d => this.drawDebris(ctx, d));

    // 6. Visual Sparks & Energy Embers
    this.sparks.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life);
      ctx.fillStyle = s.color;
      ctx.shadowColor = '#f5c469';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(s.x, s.y, Math.max(0.5, s.size * s.life), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawCar(ctx, car) {
    ctx.save();
    ctx.translate(car.x, car.y);
    ctx.rotate(car.rot);

    // Stunt wire rig visualization (if in rigging VFX pass or high anti-gravity)
    if (this.vfxPass === 'rigging' || (this.isZeroG && this.vfxPass === 'wireframe')) {
      ctx.strokeStyle = 'rgba(212, 146, 42, 0.7)';
      ctx.lineWidth = 1.2;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      // Dual crane harness cables
      ctx.moveTo(-car.w * 0.35, -car.h);
      ctx.lineTo(-car.w * 0.35, -car.y - 120);
      ctx.moveTo(car.w * 0.35, -car.h);
      ctx.lineTo(car.w * 0.35, -car.y - 120);
      ctx.stroke();
      ctx.setLineDash([]);

      // Rigging mount points
      ctx.fillStyle = '#b83232';
      ctx.fillRect(-car.w * 0.35 - 3, -car.h - 3, 6, 6);
      ctx.fillRect(car.w * 0.35 - 3, -car.h - 3, 6, 6);
    }

    if (this.vfxPass === 'wireframe') {
      // 3D VFX Wireframe Previs Mode
      ctx.strokeStyle = '#d4922a';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-car.w / 2, -car.h, car.w, car.h);
      // Windshield wireframe
      ctx.beginPath();
      ctx.moveTo(-car.w * 0.25, -car.h);
      ctx.lineTo(-car.w * 0.1, -car.h * 1.5);
      ctx.lineTo(car.w * 0.25, -car.h * 1.5);
      ctx.lineTo(car.w * 0.35, -car.h);
      ctx.stroke();
      // Wheels
      ctx.strokeRect(-car.w * 0.35, 0, 16, 16);
      ctx.strokeRect(car.w * 0.2, 0, 16, 16);
      ctx.restore();
      return;
    }

    // Car Body
    ctx.fillStyle = car.color;
    ctx.beginPath();
    ctx.roundRect(-car.w / 2, -car.h, car.w, car.h, [8, 8, 2, 2]);
    ctx.fill();

    // Cabin / Roof
    ctx.fillStyle = car.type === 'cab' ? '#b5791c' : '#221b14';
    ctx.beginPath();
    ctx.moveTo(-car.w * 0.28, -car.h);
    ctx.lineTo(-car.w * 0.12, -car.h - 13);
    ctx.lineTo(car.w * 0.22, -car.h - 13);
    ctx.lineTo(car.w * 0.36, -car.h);
    ctx.closePath();
    ctx.fill();

    // Windshields (Tinted glass reflecting warm sunset sky)
    ctx.fillStyle = 'rgba(242, 237, 228, 0.45)';
    ctx.fillRect(-car.w * 0.08, -car.h - 10, car.w * 0.25, 9);

    // Yellow Cab Roof Light
    if (car.roofSign) {
      ctx.fillStyle = '#f5c469';
      ctx.fillRect(-10, -car.h - 19, 20, 6);
      ctx.fillStyle = '#110e0b';
      ctx.font = 'bold 5px sans-serif';
      ctx.fillText('TAXI', -6, -car.h - 14);
    }

    // Headlights & Taillights
    // Front glowing tungsten beam
    const headlampGrad = ctx.createRadialGradient(car.w / 2 + 4, -car.h * 0.4, 2, car.w / 2 + 50, -car.h * 0.4, 60);
    headlampGrad.addColorStop(0, 'rgba(245, 196, 105, 0.85)');
    headlampGrad.addColorStop(1, 'rgba(245, 196, 105, 0)');
    ctx.fillStyle = headlampGrad;
    ctx.beginPath();
    ctx.arc(car.w / 2 + 10, -car.h * 0.4, 45, -0.4, 0.4);
    ctx.fill();

    // Headlight bulb
    ctx.fillStyle = '#fff4db';
    ctx.fillRect(car.w / 2 - 3, -car.h * 0.5, 4, 6);

    // Taillight
    ctx.fillStyle = '#b83232';
    ctx.fillRect(-car.w / 2 - 1, -car.h * 0.5, 4, 6);

    // Wheels & Chrome Rims
    [-car.w * 0.3, car.w * 0.25].forEach(wx => {
      ctx.fillStyle = '#14100c';
      ctx.beginPath();
      ctx.arc(wx, 2, 9, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#d4922a';
      ctx.beginPath();
      ctx.arc(wx, 2, 4, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawBike(ctx, bike) {
    ctx.save();
    ctx.translate(bike.x, bike.y);
    ctx.rotate(bike.rot);

    ctx.strokeStyle = bike.color;
    ctx.lineWidth = 2.5;

    // Dual Wheels
    [-bike.size * 0.7, bike.size * 0.7].forEach(wx => {
      ctx.beginPath();
      ctx.arc(wx, 0, bike.size * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      // Spokes
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(212, 146, 42, 0.6)';
      for (let s = 0; s < 4; s++) {
        ctx.beginPath();
        ctx.moveTo(wx - 7, 0);
        ctx.lineTo(wx + 7, 0);
        ctx.stroke();
        ctx.rotate(Math.PI / 4);
      }
      ctx.restore();
    });

    // Bike Frame (Triangles)
    ctx.beginPath();
    ctx.moveTo(-bike.size * 0.7, 0);
    ctx.lineTo(-bike.size * 0.2, -bike.size * 0.7);
    ctx.lineTo(bike.size * 0.3, -bike.size * 0.7);
    ctx.lineTo(bike.size * 0.7, 0);
    ctx.lineTo(0, 0);
    ctx.lineTo(-bike.size * 0.2, -bike.size * 0.7);
    ctx.stroke();

    // Handlebars
    ctx.beginPath();
    ctx.moveTo(bike.size * 0.3, -bike.size * 0.7);
    ctx.lineTo(bike.size * 0.35, -bike.size * 0.95);
    ctx.stroke();

    ctx.restore();
  }

  drawStreetSign(ctx, sign) {
    ctx.save();
    ctx.translate(sign.x, sign.y);
    ctx.rotate(sign.rot);

    // Pole
    if (!sign.poleBroken) {
      ctx.strokeStyle = '#383025';
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, 72);
      ctx.stroke();
    }

    // Signboard
    const isStop = sign.text === 'STOP';
    ctx.fillStyle = isStop ? '#b83232' : '#2b442b'; // deep stop red or vintage street sign green
    ctx.strokeStyle = '#f2ede4';
    ctx.lineWidth = 1.2;

    ctx.beginPath();
    ctx.roundRect(-sign.w / 2, -sign.h / 2, sign.w, sign.h, 4);
    ctx.fill();
    ctx.stroke();

    // Sign Text
    ctx.fillStyle = '#f2ede4';
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(sign.text, 0, 0);

    ctx.restore();
  }

  drawPedestrian(ctx, p) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);

    const isLight = document.documentElement.getAttribute('data-theme') === 'light';

    if (p.state === 'floating') {
      // Floating human with arms outstretched reaching for ground
      // Head
      ctx.fillStyle = '#e8a83e';
      ctx.beginPath();
      ctx.arc(0, -p.height, 4.5, 0, Math.PI * 2);
      ctx.fill();

      // Torso
      ctx.strokeStyle = p.shirtColor;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, -p.height + 4);
      ctx.lineTo(0, -p.height * 0.45);
      ctx.stroke();

      // Flailing arms reaching downwards
      ctx.strokeStyle = p.shirtColor;
      ctx.lineWidth = 2.2;
      ctx.beginPath();
      ctx.moveTo(0, -p.height + 6);
      ctx.lineTo(-12, -p.height * 0.3);
      ctx.moveTo(0, -p.height + 6);
      ctx.lineTo(12, -p.height * 0.3);
      ctx.stroke();

      // Legs bent in zero-g
      ctx.strokeStyle = p.pantsColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(0, -p.height * 0.45);
      ctx.lineTo(-6, -p.height * 0.1);
      ctx.moveTo(0, -p.height * 0.45);
      ctx.lineTo(8, -p.height * 0.15);
      ctx.stroke();

      // Wire-stunt harness visual in VFX Rigging pass
      if (this.vfxPass === 'rigging') {
        ctx.strokeStyle = 'rgba(212, 146, 42, 0.8)';
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.moveTo(0, -p.height * 0.6);
        ctx.lineTo(0, -p.y - 100);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    } else {
      // Scrambling / Running Pedestrian
      const legSpread = Math.sin(p.runCycle) * 8;
      const armSpread = Math.cos(p.runCycle) * 6;

      // Head
      ctx.fillStyle = '#e8a83e';
      ctx.beginPath();
      ctx.arc(0, -p.height, 4, 0, Math.PI * 2);
      ctx.fill();

      // Torso (leaning forward while scrambling)
      ctx.strokeStyle = p.shirtColor;
      ctx.lineWidth = 3.8;
      ctx.beginPath();
      ctx.moveTo(0, -p.height + 4);
      ctx.lineTo(p.direction * 3, -p.height * 0.45);
      ctx.stroke();

      // Running Legs
      ctx.strokeStyle = p.pantsColor;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(p.direction * 3, -p.height * 0.45);
      ctx.lineTo(-legSpread, 0);
      ctx.moveTo(p.direction * 3, -p.height * 0.45);
      ctx.lineTo(legSpread, 0);
      ctx.stroke();

      // Running Arms
      ctx.strokeStyle = p.shirtColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, -p.height + 6);
      ctx.lineTo(-armSpread, -p.height * 0.4);
      ctx.moveTo(0, -p.height + 6);
      ctx.lineTo(armSpread, -p.height * 0.4);
      ctx.stroke();
    }

    ctx.restore();
  }

  drawDebris(ctx, d) {
    ctx.save();
    ctx.translate(d.x, d.y);
    ctx.rotate(d.rot);

    // Responsive Glowing Halo
    const glowLevel = Math.max(d.glow || 0, this.isZeroG ? 0.4 : 0);
    if (glowLevel > 0.04) {
      const glowRad = d.size * (2.2 + glowLevel * 3.2);
      const glowGrad = ctx.createRadialGradient(0, 0, 1, 0, 0, glowRad);
      glowGrad.addColorStop(0, `rgba(255, 235, 170, ${0.85 * glowLevel})`);
      glowGrad.addColorStop(0.45, `rgba(212, 146, 42, ${0.45 * glowLevel})`);
      glowGrad.addColorStop(1, 'rgba(212, 146, 42, 0)');
      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(0, 0, glowRad, 0, Math.PI * 2);
      ctx.fill();

      // Radiant micro-sparks on active hovered debris
      if (glowLevel > 0.35) {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-d.size * 1.6, 0);
        ctx.lineTo(d.size * 1.6, 0);
        ctx.moveTo(0, -d.size * 1.6);
        ctx.lineTo(0, d.size * 1.6);
        ctx.stroke();
      }
    }

    if (d.type === 'paper') {
      // Fluttering newspaper sheet
      ctx.fillStyle = d.color;
      ctx.fillRect(-d.size, -d.size * 0.6, d.size * 2, d.size * 1.2);
      ctx.fillStyle = 'rgba(50, 40, 30, 0.4)';
      ctx.fillRect(-d.size + 1, -d.size * 0.4, d.size * 1.6, 1.5);
      ctx.fillRect(-d.size + 1, 0, d.size * 1.6, 1.5);
    } else if (d.type === 'cup') {
      // Paper coffee cup with lid
      ctx.fillStyle = '#f2ede4';
      ctx.beginPath();
      ctx.moveTo(-3, -5);
      ctx.lineTo(3, -5);
      ctx.lineTo(2, 4);
      ctx.lineTo(-2, 4);
      ctx.closePath();
      ctx.fill();
    } else {
      // Golden leaf / amber dust particle
      ctx.fillStyle = '#d4922a';
      ctx.beginPath();
      ctx.arc(0, 0, d.size * 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  renderAtmosphere(ctx) {
    // Anamorphic horizontal streak lens flares (Warm Gold/Amber)
    const flareCount = 2;
    for (let f = 0; f < flareCount; f++) {
      const car = this.cars[f];
      if (car && car.isFloating) {
        ctx.save();
        ctx.fillStyle = 'rgba(212, 146, 42, 0.16)';
        ctx.fillRect(0, car.y - 1, this.width, 2.5);
        ctx.fillStyle = 'rgba(245, 196, 105, 0.35)';
        ctx.fillRect(car.x - 60, car.y - 0.5, 120, 1);
        ctx.restore();
      }
    }

    // 35mm Analog Film Grain effect
    ctx.fillStyle = 'rgba(212, 146, 42, 0.035)';
    ctx.fillRect(0, 0, this.width, this.height);
  }

  renderDirectorHUD(ctx) {
    // 2.39:1 Anamorphic Scope Frame Lines & Safe Action Markers
    ctx.save();
    ctx.strokeStyle = 'rgba(212, 146, 42, 0.4)';
    ctx.lineWidth = 1;

    // Corner guides
    const cornerSize = 16;
    const pad = 12;

    // Top-left
    ctx.beginPath();
    ctx.moveTo(pad, pad + cornerSize);
    ctx.lineTo(pad, pad);
    ctx.lineTo(pad + cornerSize, pad);
    ctx.stroke();

    // Top-right
    ctx.beginPath();
    ctx.moveTo(this.width - pad - cornerSize, pad);
    ctx.lineTo(this.width - pad, pad);
    ctx.lineTo(this.width - pad, pad + cornerSize);
    ctx.stroke();

    // Center Crosshair
    const cx = this.width / 2;
    const cy = this.height / 2;
    ctx.beginPath();
    ctx.moveTo(cx - 8, cy);
    ctx.lineTo(cx + 8, cy);
    ctx.moveTo(cx, cy - 8);
    ctx.lineTo(cx, cy + 8);
    ctx.stroke();

    // On-screen telemetry readout
    ctx.fillStyle = '#d4922a';
    ctx.font = '10px monospace';
    ctx.textAlign = 'left';
    ctx.fillText(`CAM A // 35mm ANAMORPHIC T1.9 // ${this.isZeroG ? "● ZERO-G COLLAPSE" : "STBY"}`, pad + 20, pad + 12);
    
    ctx.textAlign = 'right';
    ctx.fillText(`GRAV: ${(this.gravity).toFixed(2)}G // SHUTTER: 180°`, this.width - pad - 20, pad + 12);

    ctx.restore();
  }

  animate(now) {
    const dt = Math.min((now - this.lastTime) / 1000, 0.1);
    this.lastTime = now;

    this.updatePhysics(dt * this.timeScale);
    this.render();

    requestAnimationFrame(this.animate);
  }
}

// Global hook
window.initGravityCity = function() {
  if (document.getElementById('gravity-city-canvas')) {
    window.gravityEngine = new GravityCityEngine('gravity-city-canvas');
  }
};
